#!/usr/bin/env python3
"""
Entrena un clasificador de intenciones (text-classification) con Hugging Face
Transformers, exporta a ONNX y quantiza el modelo para uso en el navegador.

Requisitos:
  pip install transformers datasets optimum onnxruntime onnx accelerate

Uso:
  python scripts/ai/train_intent_classifier.py \
    --train data/train.csv --valid data/valid.csv \
    --out ./models/intent-onnx --base prajjwal1/bert-tiny \
    --epochs 4 --batch 16 --lr 2e-5

El script genera:
  - intent.onnx (modelo ONNX quantizado dinámicamente)
  - labels.json (orden de etiquetas)
  - vocab.txt, tokenizer.json, config.json
"""

import argparse
import json
import os
from pathlib import Path

import numpy as np
from datasets import load_dataset, ClassLabel
from transformers import AutoTokenizer, AutoModelForSequenceClassification, TrainingArguments, Trainer
from transformers import DataCollatorWithPadding
from sklearn.metrics import accuracy_score, f1_score

def parse_args():
    p = argparse.ArgumentParser()
    p.add_argument('--train', required=True, help='CSV/JSON train file with columns: text,label')
    p.add_argument('--valid', required=True, help='CSV/JSON valid file with columns: text,label')
    p.add_argument('--out', required=True, help='Output folder')
    p.add_argument('--base', default='prajjwal1/bert-tiny', help='Base model name')
    p.add_argument('--epochs', type=int, default=4)
    p.add_argument('--batch', type=int, default=16)
    p.add_argument('--lr', type=float, default=2e-5)
    return p.parse_args()

def load_data(path):
    ext = Path(path).suffix.lower()
    if ext == '.csv':
        return load_dataset('csv', data_files=path)
    return load_dataset('json', data_files=path)

def main():
    args = parse_args()
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)

    # Cargar datasets
    ds_train = load_data(args.train)['train']
    ds_valid = load_data(args.valid)['train']

    # Construir etiquetas ordenadas
    labels = sorted(set(ds_train['label']))
    label2id = {l:i for i,l in enumerate(labels)}
    id2label = {i:l for l,i in label2id.items()}

    # Tokenizer y modelo
    tokenizer = AutoTokenizer.from_pretrained(args.base)
    def tokenize(batch):
        return tokenizer(batch['text'], truncation=True)

    ds_train = ds_train.map(lambda x: {'labels': label2id[x['label']]})
    ds_valid = ds_valid.map(lambda x: {'labels': label2id[x['label']]})
    ds_train = ds_train.map(tokenize, batched=True)
    ds_valid = ds_valid.map(tokenize, batched=True)
    data_collator = DataCollatorWithPadding(tokenizer=tokenizer)

    model = AutoModelForSequenceClassification.from_pretrained(
        args.base,
        num_labels=len(labels),
        id2label=id2label,
        label2id=label2id,
    )

    def compute_metrics(eval_pred):
        logits, y = eval_pred
        y_pred = np.argmax(logits, axis=-1)
        return {
            'acc': accuracy_score(y, y_pred),
            'f1': f1_score(y, y_pred, average='macro'),
        }

    training_args = TrainingArguments(
        output_dir=str(out / 'checkpoints'),
        evaluation_strategy='epoch',
        save_strategy='epoch',
        load_best_model_at_end=True,
        metric_for_best_model='f1',
        num_train_epochs=args.epochs,
        per_device_train_batch_size=args.batch,
        per_device_eval_batch_size=args.batch,
        learning_rate=args.lr,
        weight_decay=0.01,
        report_to=[],
        logging_steps=50,
    )

    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=ds_train,
        eval_dataset=ds_valid,
        tokenizer=tokenizer,
        data_collator=data_collator,
        compute_metrics=compute_metrics,
    )
    trainer.train()
    trainer.save_model(str(out / 'hf'))
    tokenizer.save_pretrained(str(out / 'hf'))

    # Guardar labels
    with open(out / 'labels.json', 'w') as f:
        json.dump(labels, f)

    # Exportar a ONNX
    # Nota: optimum debe estar instalado; invocamos CLI vía os.system por simplicidad
    onnx_dir = out / 'onnx'
    onnx_dir.mkdir(exist_ok=True)
    os.system(f"optimum-cli export onnx --task text-classification --model {out/'hf'} {onnx_dir}")

    # Quantize
    onnxq_dir = out / 'onnx-quant'
    onnxq_dir.mkdir(exist_ok=True)
    os.system(f"optimum-cli onnxruntime quantize --model {onnx_dir} --output {onnxq_dir} --approach dynamic")

    # Renombrar a intent.onnx y copiar vocab/labels
    src_model = onnxq_dir / 'model.onnx'
    if not src_model.exists():
        src_model = onnx_dir / 'model.onnx'
    (out / 'intent.onnx').write_bytes(src_model.read_bytes())

    # Copiar vocab/tokenizer
    # Algunos tokenizers tienen vocab.txt; en su defecto, dejamos tokenizer.json
    if (out / 'hf' / 'vocab.txt').exists():
        (out / 'vocab.txt').write_bytes((out / 'hf' / 'vocab.txt').read_bytes())
    if (out / 'hf' / 'tokenizer.json').exists():
        (out / 'tokenizer.json').write_bytes((out / 'hf' / 'tokenizer.json').read_bytes())
    if (out / 'hf' / 'config.json').exists():
        (out / 'config.json').write_bytes((out / 'hf' / 'config.json').read_bytes())

    print('\n✅ Listo. Archivos generados en:', out)
    print(' - intent.onnx')
    print(' - labels.json')
    print(' - vocab.txt (si disponible)')
    print(' - tokenizer.json, config.json')

if __name__ == '__main__':
    main()

