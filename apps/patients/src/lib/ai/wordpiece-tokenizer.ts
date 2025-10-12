// Minimal WordPiece tokenizer (uncased) for BERT-like models in the browser.
// Loads vocab.txt and performs greedy longest-match tokenization.

export type Vocab = Map<string, number>;

export async function loadVocab(url: string): Promise<Vocab> {
  const res = await fetch(url, { cache: 'force-cache' });
  if (!res.ok) throw new Error(`No se pudo cargar vocab: ${url}`);
  const text = await res.text();
  const vocab: Vocab = new Map();
  let idx = 0;
  for (const line of text.split(/\r?\n/)) {
    const token = line.trim();
    if (token.length === 0) continue;
    vocab.set(token, idx++);
  }
  return vocab;
}

function stripAccents(s: string): string {
  return s.normalize('NFD').replace(/\p{Diacritic}+/gu, '');
}

function basicTokenize(text: string): string[] {
  const lowered = stripAccents(text.toLowerCase());
  // Split on any non-letter/number/underscore (keep simple for ES regex)
  return lowered.split(/[^\p{L}\p{N}_]+/u).filter(Boolean);
}

export interface TokenizedInputs {
  inputIds: Int32Array;
  attentionMask: Int32Array;
  tokenTypeIds: Int32Array;
}

export function wordPieceTokenize(text: string, vocab: Vocab, maxLen = 128): TokenizedInputs {
  const CLS = vocab.has('[CLS]') ? '[CLS]' : '[cls]';
  const SEP = vocab.has('[SEP]') ? '[SEP]' : '[sep]';
  const PAD = vocab.has('[PAD]') ? '[PAD]' : '[pad]';
  const UNK = vocab.has('[UNK]') ? '[UNK]' : '[unk]';

  const tokens: string[] = [CLS];
  for (const word of basicTokenize(text)) {
    const wordPieces: string[] = [];
    let start = 0;
    while (start < word.length) {
      let end = word.length;
      let cur: string | null = null;
      while (start < end) {
        const sub = word.slice(start, end);
        const piece = start === 0 ? sub : `##${sub}`;
        if (vocab.has(piece)) {
          cur = piece;
          break;
        }
        end -= 1;
      }
      if (cur == null) {
        wordPieces.push(UNK);
        break;
      }
      wordPieces.push(cur);
      start = end;
    }
    tokens.push(...wordPieces);
  }
  tokens.push(SEP);

  // Truncate
  if (tokens.length > maxLen) tokens.length = maxLen;

  // Convert to ids + pad
  const inputIds = new Int32Array(maxLen).fill(vocab.get(PAD) ?? 0);
  const attentionMask = new Int32Array(maxLen).fill(0);
  const tokenTypeIds = new Int32Array(maxLen).fill(0);
  for (let i = 0; i < tokens.length && i < maxLen; i++) {
    inputIds[i] = vocab.get(tokens[i]) ?? (vocab.get(UNK) ?? 0);
    attentionMask[i] = 1;
  }
  return { inputIds, attentionMask, tokenTypeIds };
}

