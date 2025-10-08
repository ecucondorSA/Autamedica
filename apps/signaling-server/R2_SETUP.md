# Cloudflare R2 Setup for Recording Storage

## 📋 **Pre-requisitos**

- Cuenta de Cloudflare
- Acceso a R2 habilitado en tu cuenta
- LiveKit Cloud configurado

## 🚀 **Paso 1: Crear R2 Bucket**

1. Ir a Cloudflare Dashboard → R2
2. Crear nuevo bucket: `autamedica-recordings`
3. **Configuración HIPAA:**
   - Lifecycle rules: Eliminar después de 90 días (o según política)
   - Encryption: Server-side encryption habilitado
   - Access: Private (no public access)

## 🔑 **Paso 2: Obtener Credenciales R2**

1. En R2 Dashboard → API Tokens
2. Crear API Token con permisos:
   - **Admin Read & Write** para el bucket `autamedica-recordings`
3. Guardar las credenciales:
   ```
   R2_ACCOUNT_ID=<tu-account-id>
   R2_ACCESS_KEY_ID=<tu-access-key>
   R2_SECRET_ACCESS_KEY=<tu-secret>
   ```

## ⚙️ **Paso 3: Configurar Variables de Entorno**

Agregar al archivo `.env`:

```bash
# Cloudflare R2 Configuration
R2_ACCOUNT_ID=abc123def456
R2_ACCESS_KEY_ID=xxxxxxxxxxxxxxxx
R2_SECRET_ACCESS_KEY=yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy
R2_BUCKET_NAME=autamedica-recordings
R2_PUBLIC_URL=https://recordings.autamedica.com
```

## 🔧 **Paso 4: Configurar LiveKit Egress**

El código ya está preparado en `src/livekit.ts`. Solo necesitas:

1. **Descomentar el código de recording** (líneas 215-222):

```typescript
// En src/livekit.ts:209
async startRecording(roomName: string, consultationId: string) {
  try {
    logger.info(`[LiveKit] Recording requested for room: ${roomName}`);

    // Configurar S3/R2 compatible storage
    const egress = await this.egressClient.startRoomCompositeEgress(roomName, {
      file: {
        fileType: EncodedFileType.MP4,
        filepath: `consultations/${consultationId}-{time}.mp4`,
        s3: {
          accessKey: process.env.R2_ACCESS_KEY_ID!,
          secret: process.env.R2_SECRET_ACCESS_KEY!,
          bucket: process.env.R2_BUCKET_NAME!,
          endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        }
      }
    });

    logger.info(`[LiveKit] Recording started with egressId: ${egress.egressId}`);

    // Guardar en DB (opcional)
    if (this.supabase) {
      await this.supabase
        .from('consultation_recordings')
        .insert({
          consultation_id: consultationId,
          egress_id: egress.egressId,
          room_name: roomName,
          status: 'recording',
          started_at: new Date().toISOString()
        });
    }

    return { egressId: egress.egressId, status: 'recording' };

  } catch (error) {
    logger.error(`[LiveKit] Error starting recording:`, error);
    throw error;
  }
}
```

2. **Agregar import necesario:**

```typescript
import { EncodedFileType } from 'livekit-server-sdk';
```

## 📊 **Paso 5: Crear Tabla de Recordings (Opcional)**

Si usas tracking en Supabase:

```sql
-- supabase/migrations/YYYYMMDD_consultation_recordings.sql
CREATE TABLE consultation_recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id TEXT NOT NULL,
  egress_id TEXT UNIQUE NOT NULL,
  room_name TEXT NOT NULL,
  room_sid TEXT,
  status TEXT NOT NULL DEFAULT 'recording',
  file_url TEXT,
  file_size_bytes BIGINT,
  duration_seconds INTEGER,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index para búsquedas rápidas
CREATE INDEX idx_recordings_consultation ON consultation_recordings(consultation_id);
CREATE INDEX idx_recordings_egress ON consultation_recordings(egress_id);
CREATE INDEX idx_recordings_status ON consultation_recordings(status);

-- RLS policies (HIPAA compliance)
ALTER TABLE consultation_recordings ENABLE ROW LEVEL SECURITY;

-- Solo doctores pueden ver sus grabaciones
CREATE POLICY "Doctors can view their recordings"
  ON consultation_recordings
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM consultations
      WHERE consultations.id = consultation_recordings.consultation_id
      AND consultations.doctor_id = auth.uid()
    )
  );
```

## 🧪 **Paso 6: Probar Recording**

```bash
# Desde el signaling-server
curl -X POST http://localhost:8888/api/consultations/test-001/recording/start \
  -H "Content-Type: application/json" \
  -d '{"roomName": "consultation-test-001"}'

# Verificar que se creó el egress en LiveKit
curl http://localhost:8888/api/rooms/active

# Detener grabación
curl -X POST http://localhost:8888/api/consultations/test-001/recording/stop \
  -H "Content-Type: application/json" \
  -d '{"egressId": "<egress-id-from-start>"}'
```

## 📁 **Estructura de Archivos en R2**

```
autamedica-recordings/
└── consultations/
    ├── consultation-001-2025-10-05T14-30-00Z.mp4
    ├── consultation-002-2025-10-05T15-45-00Z.mp4
    └── consultation-003-2025-10-05T16-20-00Z.mp4
```

## 🔒 **Seguridad HIPAA**

✅ **Implementado:**
- Encryption at rest (R2 automático)
- Private bucket (no public access)
- Access tokens con TTL (2 horas)
- Metadata de consulta en JWT

⚠️ **Pendiente configurar:**
- Lifecycle rules (auto-delete después de 90 días)
- Audit logging (CloudFlare Access Logs)
- Pre-signed URLs con expiración para descarga

## 🎯 **Coste Estimado**

**Cloudflare R2 Pricing:**
- Storage: $0.015/GB/mes
- Egress: $0 (sin cargo por salida)
- Operaciones Clase A: $4.50/millón
- Operaciones Clase B: $0.36/millón

**Ejemplo (100 consultas/mes, 500MB cada una):**
- Storage: 50GB × $0.015 = $0.75/mes
- Operaciones: ~100 × $0.0000045 = $0.0005
- **Total: ~$0.75/mes**

**Mucho más barato que S3** (~$1.15/mes para lo mismo)

## 📚 **Referencias**

- [LiveKit Egress Docs](https://docs.livekit.io/realtime/egress/)
- [Cloudflare R2 Docs](https://developers.cloudflare.com/r2/)
- [R2 S3 Compatibility](https://developers.cloudflare.com/r2/api/s3/)
