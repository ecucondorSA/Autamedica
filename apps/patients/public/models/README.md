Colocá aquí el modelo ONNX si querés habilitar inferencia en el navegador.

Sugerencia
- Archivo: `intent.onnx` (clasificador de intenciones reducido/quantizado)
- Peso recomendado: < 5–10 MB
- Activación por flag: en `apps/patients/.env.local` agrega:

```
NEXT_PUBLIC_AUTA_ONNX=1
NEXT_PUBLIC_AUTA_ONNX_MODEL=/models/intent.onnx
```

Notas
- Si el modelo no carga, Auta usa el clasificador por reglas como fallback.
- El modelo se carga perezosamente al abrir el chat de Auta.
