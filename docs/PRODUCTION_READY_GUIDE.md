# 🚀 Guía Completa: De Mocks a Producción

## 📋 Índice
1. [Análisis de Mocks Actuales](#análisis-de-mocks-actuales)
2. [Estrategia de Feature Flags](#estrategia-de-feature-flags)
3. [Variables de Entorno por Ambiente](#variables-de-entorno)
4. [Eliminación de Mocks](#eliminación-de-mocks)
5. [Deployment en Vercel](#deployment-en-vercel)
6. [Deployment en Cloudflare](#deployment-en-cloudflare)

---

## 📊 Análisis de Mocks Actuales

### Mocks Identificados:

#### 1. **useMockRemoteStream** (`apps/patients/src/hooks/useMockRemoteStream.ts`)
**Propósito**: Simula stream de video del médico
**Usado en**: `EnhancedVideoCall.tsx`
**Reemplazo**: WebRTC real con LiveKit/Twilio

#### 2. **Mock Medical Data** (`apps/doctors/src/services/medical-data-api.ts`)
**Propósito**: Datos médicos de prueba
**Usado en**: Dashboard de médicos
**Reemplazo**: API de Supabase con datos reales

#### 3. **Mock AI Analysis** (`apps/doctors/src/hooks/useAIAnalysis.ts`)
**Propósito**: Análisis de IA simulados
**Usado en**: Herramientas de diagnóstico
**Reemplazo**: API de Claude/OpenAI real

#### 4. **MOCK_AUTAMEDICA** (Testing)
**Propósito**: Tests E2E sin servicios externos
**Usado en**: Playwright tests
**Acción**: Mantener para testing, agregar ambiente staging

---

## 🎛️ Estrategia de Feature Flags

### Implementación con Variables de Entorno

Crear un sistema que permita activar/desactivar mocks por ambiente:

```typescript
// packages/shared/src/config/feature-flags.ts
export const featureFlags = {
  // Video/Telemedicine
  USE_MOCK_VIDEO: process.env.NEXT_PUBLIC_USE_MOCK_VIDEO === 'true',
  USE_LIVEKIT: process.env.NEXT_PUBLIC_USE_LIVEKIT === 'true',

  // Medical Data
  USE_MOCK_MEDICAL_DATA: process.env.NEXT_PUBLIC_USE_MOCK_MEDICAL_DATA === 'true',

  // AI Services
  USE_MOCK_AI: process.env.NEXT_PUBLIC_USE_MOCK_AI === 'true',
  USE_REAL_AI: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY !== undefined,

  // Environment
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_STAGING: process.env.NEXT_PUBLIC_ENV === 'staging',
} as const;

export type FeatureFlags = typeof featureFlags;
```

---

## 🌍 Variables de Entorno por Ambiente

### Estructura de Archivos .env

```bash
# Desarrollo local
.env.local                    # No committed, local overrides

# Por ambiente
.env.development.example      # Template para desarrollo
.env.staging.example          # Template para staging
.env.production.example       # Template para producción
```

### `.env.development.example`

```bash
# ==========================
# DESARROLLO - Con Mocks
# ==========================

NODE_ENV=development
NEXT_PUBLIC_ENV=development

# Supabase (desarrollo)
NEXT_PUBLIC_SUPABASE_URL=https://your-dev-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-dev-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-dev-service-role-key

# Feature Flags - MOCKS ACTIVADOS
NEXT_PUBLIC_USE_MOCK_VIDEO=true
NEXT_PUBLIC_USE_MOCK_MEDICAL_DATA=true
NEXT_PUBLIC_USE_MOCK_AI=true

# LiveKit (opcional en dev)
NEXT_PUBLIC_LIVEKIT_URL=
LIVEKIT_API_KEY=
LIVEKIT_API_SECRET=

# AI Services (opcional en dev)
ANTHROPIC_API_KEY=
```

### `.env.staging.example`

```bash
# ==========================
# STAGING - Híbrido
# ==========================

NODE_ENV=production
NEXT_PUBLIC_ENV=staging

# Supabase (staging)
NEXT_PUBLIC_SUPABASE_URL=https://your-staging-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-staging-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-staging-service-role-key

# Feature Flags - SERVICIOS REALES
NEXT_PUBLIC_USE_MOCK_VIDEO=false
NEXT_PUBLIC_USE_MOCK_MEDICAL_DATA=false
NEXT_PUBLIC_USE_MOCK_AI=false
NEXT_PUBLIC_USE_LIVEKIT=true

# LiveKit (staging)
NEXT_PUBLIC_LIVEKIT_URL=wss://your-staging.livekit.cloud
LIVEKIT_API_KEY=your-staging-api-key
LIVEKIT_API_SECRET=your-staging-api-secret

# AI Services (staging)
ANTHROPIC_API_KEY=sk-ant-your-staging-key
```

### `.env.production.example`

```bash
# ==========================
# PRODUCCIÓN - Solo Real
# ==========================

NODE_ENV=production
NEXT_PUBLIC_ENV=production

# Supabase (producción)
NEXT_PUBLIC_SUPABASE_URL=https://gtyvdircfhmdjiaelqkg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-production-service-role-key

# Feature Flags - TODOS LOS MOCKS DESACTIVADOS
NEXT_PUBLIC_USE_MOCK_VIDEO=false
NEXT_PUBLIC_USE_MOCK_MEDICAL_DATA=false
NEXT_PUBLIC_USE_MOCK_AI=false
NEXT_PUBLIC_USE_LIVEKIT=true

# LiveKit (producción)
NEXT_PUBLIC_LIVEKIT_URL=wss://your-production.livekit.cloud
LIVEKIT_API_KEY=your-production-api-key
LIVEKIT_API_SECRET=your-production-api-secret

# AI Services (producción)
ANTHROPIC_API_KEY=sk-ant-your-production-key

# URLs de Producción
NEXT_PUBLIC_WEB_APP_URL=https://www.autamedica.com
NEXT_PUBLIC_DOCTORS_URL=https://doctors.autamedica.com
NEXT_PUBLIC_PATIENTS_URL=https://patients.autamedica.com
NEXT_PUBLIC_COMPANIES_URL=https://companies.autamedica.com
NEXT_PUBLIC_ADMIN_URL=https://admin.autamedica.com
```

---

## 🔧 Eliminación de Mocks

### 1. Reemplazar `useMockRemoteStream` con LiveKit

**Archivo**: `apps/patients/src/hooks/useRealRemoteStream.ts` (nuevo)

```typescript
import { useEffect, useState } from 'react';
import { RemoteParticipant, RemoteTrack, RemoteTrackPublication, Track } from 'livekit-client';

export function useRealRemoteStream(remoteParticipant?: RemoteParticipant) {
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    if (!remoteParticipant) {
      setRemoteStream(null);
      return;
    }

    const handleTrackSubscribed = (
      track: RemoteTrack,
      publication: RemoteTrackPublication,
      participant: RemoteParticipant
    ) => {
      if (track.kind === Track.Kind.Video) {
        const mediaStream = new MediaStream([track.mediaStreamTrack]);
        setRemoteStream(mediaStream);
      }
    };

    const handleTrackUnsubscribed = (
      track: RemoteTrack,
      publication: RemoteTrackPublication,
      participant: RemoteParticipant
    ) => {
      if (track.kind === Track.Kind.Video) {
        setRemoteStream(null);
      }
    };

    // Suscribirse a eventos
    remoteParticipant.on('trackSubscribed', handleTrackSubscribed);
    remoteParticipant.on('trackUnsubscribed', handleTrackUnsubscribed);

    // Verificar si ya hay tracks disponibles
    remoteParticipant.videoTracks.forEach((publication) => {
      if (publication.track) {
        handleTrackSubscribed(
          publication.track,
          publication,
          remoteParticipant
        );
      }
    });

    return () => {
      remoteParticipant.off('trackSubscribed', handleTrackSubscribed);
      remoteParticipant.off('trackUnsubscribed', handleTrackUnsubscribed);
    };
  }, [remoteParticipant]);

  return remoteStream;
}
```

**Actualizar**: `apps/patients/src/components/telemedicine/EnhancedVideoCall.tsx`

```typescript
import { useMockRemoteStream } from '@/hooks/useMockRemoteStream';
import { useRealRemoteStream } from '@/hooks/useRealRemoteStream';
import { featureFlags } from '@autamedica/shared/config/feature-flags';

export function EnhancedVideoCall({ videoCall }: Props) {
  // Usar mock o real según feature flag
  const mockStream = featureFlags.USE_MOCK_VIDEO
    ? useMockRemoteStream(videoCall.callStatus === 'live')
    : null;

  const realStream = !featureFlags.USE_MOCK_VIDEO
    ? useRealRemoteStream(remoteParticipant)
    : null;

  const remoteStream = featureFlags.USE_MOCK_VIDEO ? mockStream : realStream;

  // Resto del componente...
}
```

### 2. Reemplazar Mock Medical Data con Supabase

**Archivo**: `apps/doctors/src/services/medical-data-api.ts`

```typescript
import { createClient } from '@supabase/supabase-js';
import { featureFlags } from '@autamedica/shared/config/feature-flags';

// Mock data (solo para desarrollo)
const MOCK_MEDICAL_DATA = {
  '550e8400-e29b-41d4-a716-446655440000': [
    {
      id: '1',
      date: new Date().toISOString(),
      type: 'Lab Result',
      description: 'Complete Blood Count',
      status: 'completed',
    },
  ],
};

export class MedicalDataAPI {
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  async getMedicalHistory(patientId: string) {
    // Modo desarrollo con mocks
    if (featureFlags.USE_MOCK_MEDICAL_DATA) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(MOCK_MEDICAL_DATA[patientId] || []);
        }, 500);
      });
    }

    // Modo producción con Supabase
    const { data, error } = await this.supabase
      .from('medical_records')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching medical history:', error);
      throw error;
    }

    return data;
  }

  async getLabResults(patientId: string) {
    if (featureFlags.USE_MOCK_MEDICAL_DATA) {
      return MOCK_MEDICAL_DATA[patientId]?.filter(r => r.type === 'Lab Result') || [];
    }

    const { data, error } = await this.supabase
      .from('lab_results')
      .select('*')
      .eq('patient_id', patientId)
      .order('test_date', { ascending: false });

    if (error) throw error;
    return data;
  }
}
```

### 3. Reemplazar Mock AI con Anthropic API Real

**Archivo**: `apps/doctors/src/services/ai-analysis-service.ts` (nuevo)

```typescript
import Anthropic from '@anthropic-ai/sdk';
import { featureFlags } from '@autamedica/shared/config/feature-flags';

export class AIAnalysisService {
  private anthropic: Anthropic | null = null;

  constructor() {
    if (!featureFlags.USE_MOCK_AI && process.env.ANTHROPIC_API_KEY) {
      this.anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });
    }
  }

  async analyzeMedicalData(data: any) {
    // Modo mock para desarrollo
    if (featureFlags.USE_MOCK_AI || !this.anthropic) {
      return {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        summary: '[MOCK] Análisis simulado de datos médicos',
        recommendations: ['Revisión recomendada', 'Seguimiento en 2 semanas'],
        severity: 'low' as const,
      };
    }

    // Modo producción con Claude
    const message = await this.anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: `Como asistente médico especializado, analiza los siguientes datos:

${JSON.stringify(data, null, 2)}

Proporciona:
1. Resumen del análisis
2. Recomendaciones clínicas
3. Nivel de severidad (low/medium/high)

Formato JSON.`,
      }],
    });

    const responseText = message.content[0].type === 'text'
      ? message.content[0].text
      : '';

    const analysis = JSON.parse(responseText);

    return {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      ...analysis,
    };
  }
}
```

**Actualizar**: `apps/doctors/src/hooks/useAIAnalysis.ts`

```typescript
import { AIAnalysisService } from '@/services/ai-analysis-service';

const aiService = new AIAnalysisService();

export function useAIAnalysis() {
  // ...código existente...

  const analyzeData = async (data: any) => {
    setLoading(true);
    setError(null);

    try {
      const analysis = await aiService.analyzeMedicalData(data);
      setAnalyses(prev => [analysis, ...prev]);
      return analysis;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error en análisis');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { analyzeData, analyses, loading, error };
}
```

---

## 🚀 Deployment en Vercel

### Configuración por Proyecto

Vercel detecta automáticamente monorepos con Turborepo. Cada app necesita su propio proyecto:

#### 1. **Web-App (Landing + Auth)**

**Configuración Vercel Dashboard:**
```
Project Name: autamedica-web-app
Framework Preset: Next.js
Root Directory: apps/web-app
Build Command: cd ../.. && pnpm turbo run build --filter=@autamedica/web-app
Output Directory: .next
Install Command: pnpm install
```

**Variables de Entorno** (Vercel Dashboard > Settings > Environment Variables):
```
# Production
NEXT_PUBLIC_SUPABASE_URL=https://gtyvdircfhmdjiaelqkg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh...
SUPABASE_SERVICE_ROLE_KEY=secret-key
NEXT_PUBLIC_USE_MOCK_VIDEO=false
NEXT_PUBLIC_USE_MOCK_MEDICAL_DATA=false
NEXT_PUBLIC_USE_MOCK_AI=false

# Staging (Environment: Preview)
NEXT_PUBLIC_USE_MOCK_VIDEO=true
NEXT_PUBLIC_USE_MOCK_MEDICAL_DATA=true
```

#### 2. **Doctors App**

```
Project Name: autamedica-doctors
Root Directory: apps/doctors
Build Command: cd ../.. && pnpm turbo run build --filter=@autamedica/doctors
```

**Variables adicionales**:
```
ANTHROPIC_API_KEY=sk-ant-your-key
NEXT_PUBLIC_USE_LIVEKIT=true
LIVEKIT_API_KEY=your-livekit-key
LIVEKIT_API_SECRET=your-livekit-secret
```

#### 3. **Patients App**

```
Project Name: autamedica-patients
Root Directory: apps/patients
Build Command: cd ../.. && pnpm turbo run build --filter=@autamedica/patients
```

#### 4. **Companies App**

```
Project Name: autamedica-companies
Root Directory: apps/companies
Build Command: cd ../.. && pnpm turbo run build --filter=@autamedica/companies
```

#### 5. **Admin App**

```
Project Name: autamedica-admin
Root Directory: apps/admin
Build Command: cd ../.. && pnpm turbo run build --filter=@autamedica/admin
```

### Dominios Personalizados

**Configuración de Dominios**:
```
autamedica.com → autamedica-web-app
doctors.autamedica.com → autamedica-doctors
patients.autamedica.com → autamedica-patients
companies.autamedica.com → autamedica-companies
admin.autamedica.com → autamedica-admin
```

### CLI de Vercel

```bash
# Instalar Vercel CLI
pnpm add -g vercel

# Desde la raíz del monorepo
cd /root/Autamedica

# Deploy web-app
cd apps/web-app
vercel --prod

# Deploy doctors
cd ../doctors
vercel --prod

# Deploy patients
cd ../patients
vercel --prod

# Deploy companies
cd ../companies
vercel --prod

# Deploy admin
cd ../admin
vercel --prod
```

---

## ☁️ Deployment en Cloudflare Pages

### Configuración por Proyecto (Ya implementada)

Según tu `CLAUDE.md`, ya tienes configurado Cloudflare Pages. Aquí están las mejoras:

#### Variables de Entorno por Proyecto

**Dashboard de Cloudflare Pages** > Cada proyecto > Settings > Environment Variables:

**autamedica-web-app**:
```bash
# Production
NODE_ENV=production
NEXT_PUBLIC_ENV=production
NEXT_PUBLIC_SUPABASE_URL=https://gtyvdircfhmdjiaelqkg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-production-service-role-key
NEXT_PUBLIC_USE_MOCK_VIDEO=false
NEXT_PUBLIC_USE_MOCK_MEDICAL_DATA=false
NEXT_PUBLIC_USE_MOCK_AI=false

# Preview (opcional)
# Puede tener mocks activados para testing
```

**autamedica-doctors**:
```bash
# Además de las de web-app:
ANTHROPIC_API_KEY=sk-ant-your-production-key
NEXT_PUBLIC_USE_LIVEKIT=true
LIVEKIT_API_KEY=your-livekit-production-key
LIVEKIT_API_SECRET=your-livekit-production-secret
NEXT_PUBLIC_LIVEKIT_URL=wss://your-production.livekit.cloud
```

**autamedica-patients**:
```bash
# Igual que web-app + específicas de telemedicina
NEXT_PUBLIC_LIVEKIT_URL=wss://your-production.livekit.cloud
```

### Wrangler Configuration

Crear `wrangler.toml` en la raíz para deployment programático:

```toml
# /root/Autamedica/wrangler.toml

# No se usa para Pages directamente, pero útil para Workers si los agregas
name = "autamedica"
compatibility_date = "2025-01-01"
```

### Deploy con Wrangler CLI

```bash
# Desde cada app
cd apps/web-app
pnpm build
wrangler pages deploy .next --project-name autamedica-web-app --branch main

cd ../doctors
pnpm build
wrangler pages deploy .next --project-name autamedica-doctors --branch main

cd ../patients
pnpm build
wrangler pages deploy .next --project-name autamedica-patients --branch main

cd ../companies
pnpm build
wrangler pages deploy .next --project-name autamedica-companies --branch main

cd ../admin
pnpm build
wrangler pages deploy .next --project-name autamedica-admin --branch main
```

### GitHub Actions Actualizado

Tu archivo `.github/workflows/desplegar-produccion.yml` ya está bien configurado. Solo asegúrate de agregar las nuevas variables de entorno en GitHub Secrets:

```yaml
# Agregar en GitHub > Settings > Secrets > Actions

ANTHROPIC_API_KEY_PRODUCTION
LIVEKIT_API_KEY_PRODUCTION
LIVEKIT_API_SECRET_PRODUCTION
LIVEKIT_URL_PRODUCTION
```

Actualizar el workflow para incluir estas variables:

```yaml
# .github/workflows/desplegar-produccion.yml
env:
  NEXT_PUBLIC_USE_MOCK_VIDEO: false
  NEXT_PUBLIC_USE_MOCK_MEDICAL_DATA: false
  NEXT_PUBLIC_USE_MOCK_AI: false
  ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY_PRODUCTION }}
  LIVEKIT_API_KEY: ${{ secrets.LIVEKIT_API_KEY_PRODUCTION }}
  LIVEKIT_API_SECRET: ${{ secrets.LIVEKIT_API_SECRET_PRODUCTION }}
  NEXT_PUBLIC_LIVEKIT_URL: ${{ secrets.LIVEKIT_URL_PRODUCTION }}
```

---

## ✅ Checklist de Migración a Producción

### Pre-Deployment

- [ ] **Feature Flags implementados** en `packages/shared/src/config/feature-flags.ts`
- [ ] **Variables de entorno** configuradas para dev/staging/production
- [ ] **Archivos .env.example** creados y documentados
- [ ] **useMockRemoteStream** reemplazado con `useRealRemoteStream` + LiveKit
- [ ] **Mock Medical Data** reemplazado con Supabase queries
- [ ] **Mock AI** reemplazado con Anthropic API
- [ ] **Testing** - Tests E2E pasan en staging
- [ ] **Linting** - `pnpm lint` sin warnings
- [ ] **Type Check** - `pnpm type-check` pasa
- [ ] **Build** - `pnpm build` exitoso para todas las apps

### Deployment (Vercel)

- [ ] **5 proyectos** creados en Vercel (web-app, doctors, patients, companies, admin)
- [ ] **Variables de entorno** configuradas en cada proyecto
- [ ] **Build commands** correctos con Turborepo filters
- [ ] **Dominios personalizados** configurados
- [ ] **Deployment exitoso** en preview
- [ ] **Deployment exitoso** en producción
- [ ] **Smoke tests** - Todas las URLs responden

### Deployment (Cloudflare)

- [ ] **5 proyectos** en Cloudflare Pages
- [ ] **Variables de entorno** configuradas por proyecto
- [ ] **GitHub Actions** con secrets actualizados
- [ ] **Workflow** de deployment automático funcionando
- [ ] **Preview deployments** funcionando
- [ ] **Production deployments** funcionando
- [ ] **Remote cache** de Turborepo activo

### Post-Deployment

- [ ] **Monitoring** - Errores monitoreados (Sentry/DataDog)
- [ ] **Analytics** - Tráfico monitoreado
- [ ] **Alerts** - Alertas configuradas para servicios críticos
- [ ] **Backup** - Base de datos con backups automáticos
- [ ] **Documentación** - README actualizado con URLs de producción
- [ ] **Rollback plan** - Proceso documentado para revertir cambios

---

## 🎯 Comandos Rápidos de Deployment

### Desarrollo Local

```bash
# Iniciar todo en modo desarrollo (con mocks)
cd /root/Autamedica
cp .env.development.example .env.local
pnpm dev

# Iniciar en modo staging (sin mocks, staging APIs)
cp .env.staging.example .env.local
pnpm dev
```

### Build de Producción Local

```bash
# Simular build de producción localmente
cp .env.production.example .env.local
NODE_ENV=production pnpm build
```

### Deployment Rápido

```bash
# Vercel - Deploy todo a producción
pnpm deploy:vercel

# Cloudflare - Deploy todo a producción
pnpm deploy:cloudflare

# Deploy app específica
cd apps/doctors
vercel --prod
```

### Rollback Rápido

```bash
# Vercel - Revertir a deployment anterior
vercel rollback autamedica-doctors

# Cloudflare - Reactivar deployment anterior
wrangler pages deployment tail --project-name autamedica-doctors
```

---

## 📚 Recursos Adicionales

- **LiveKit Docs**: https://docs.livekit.io/
- **Anthropic API**: https://docs.anthropic.com/
- **Supabase**: https://supabase.com/docs
- **Vercel Monorepos**: https://vercel.com/docs/monorepos
- **Cloudflare Pages**: https://developers.cloudflare.com/pages/

---

**🎉 ¡Listo para Producción!**

Con esta guía, tus apps de Autamedica están preparadas para ejecutarse en producción sin mocks, con servicios reales y deployments automáticos.
