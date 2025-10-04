# 🚀 PLAN DE DESARROLLO - PORTAL PACIENTES AUTAMEDICA

**Versión:** 1.0
**Fecha:** 2 Octubre 2025
**Proyecto:** apps/patients
**Puerto:** 3002

---

## 📊 ESTADO ACTUAL

### ✅ Completado (Fase 1)

#### Arquitectura Base
- ✅ Layout de 3 columnas horizontal (12%-58%-30%)
- ✅ Next.js 15 + App Router configurado
- ✅ Tailwind CSS con tema AutaMedica
- ✅ TypeScript strict mode
- ✅ Estructura de directorios organizada

#### Componentes Core
```
src/components/
├── layout/
│   ├── CompactSidebar.tsx          ✅ Navegación lateral con iconos
│   ├── DynamicRightPanel.tsx       ✅ Panel contextual dinámico
│   └── PatientPortalShell.tsx      ✅ Shell principal
├── medical/
│   ├── MedicalDashboard.tsx        ✅ Dashboard médico
│   ├── VitalSignsModal.tsx         ✅ Signos vitales
│   ├── PrescriptionModal.tsx       ✅ Prescripciones
│   ├── SymptomReportModal.tsx      ✅ Reporte síntomas
│   ├── MedicationTrackerModal.tsx  ✅ Tracking medicamentos
│   ├── QuickNotesModal.tsx         ✅ Notas rápidas
│   ├── PreventiveHealthHub.tsx     ✅ Salud preventiva
│   └── ReproductiveHealthHub.tsx   ✅ Salud reproductiva
├── calls/
│   ├── IncomingCallModal.tsx       ✅ Modal llamadas entrantes
│   └── IncomingCallHandler.tsx     ✅ Handler de llamadas
└── medical-history/
    ├── AnamnesisForm.tsx           ✅ Formulario anamnesis
    ├── MedicalHistorySummary.tsx   ✅ Resumen historia
    └── MedicalHistoryTimeline.tsx  ✅ Timeline médico
```

#### Funcionalidades Implementadas
- ✅ **Telemedicina**: Video central con controles (mic, cámara, compartir pantalla)
- ✅ **Panel Dinámico**: 5 paneles contextuales
  - CommunityPanel: Posts de comunidad por grupos
  - ProgressPanel: Gamificación (streaks, niveles, badges)
  - QuickActionsPanel: Acciones rápidas
  - MedicalInfoPanel: Signos vitales, medicamentos, log accesos
  - ChatPanel: Chat durante videollamada
- ✅ **Navegación**: Sidebar compacto con tooltips
- ✅ **Temas**: Sistema de temas visuales
- ✅ **Auth**: Integración con @autamedica/auth

#### Páginas Implementadas
```
src/app/
├── page.tsx                        ✅ Dashboard principal con video
├── layout.tsx                      ✅ Layout raíz
├── onboarding/page.tsx             ✅ Onboarding pacientes
├── preventive-health/page.tsx      ✅ Salud preventiva
├── reproductive-health/page.tsx    ✅ Salud reproductiva
├── call/[roomId]/page.tsx          ✅ Sala videollamada
└── webrtc-test/page.tsx            ✅ Testing WebRTC
```

---

## 🎯 PRÓXIMAS FASES

### Fase 2: Conexión Backend Real (Semanas 3-4)

#### Objetivos
- Reemplazar datos mock por conexiones Supabase reales
- Implementar queries y mutations
- Configurar RLS (Row Level Security)
- Sincronización en tiempo real

#### Tareas

**2.1 Configuración Supabase**
```typescript
// packages/database/src/schema/patients.sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  email TEXT UNIQUE,
  role TEXT CHECK (role IN ('patient', 'doctor', 'company_admin', 'platform_admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE vital_signs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES profiles(id),
  type TEXT, -- 'blood_pressure', 'heart_rate', 'temperature', etc.
  value JSONB, -- { systolic: 120, diastolic: 80 }
  measured_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE medications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES profiles(id),
  name TEXT NOT NULL,
  dosage TEXT,
  frequency TEXT,
  prescribed_by UUID REFERENCES profiles(id),
  prescribed_at TIMESTAMPTZ,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES profiles(id),
  doctor_id UUID REFERENCES profiles(id),
  scheduled_at TIMESTAMPTZ,
  status TEXT CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled')),
  type TEXT, -- 'telemedicine', 'in_person'
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

ALTER TABLE vital_signs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Patients can manage own vital signs"
  ON vital_signs FOR ALL
  USING (auth.uid() = patient_id);
```

**2.2 Hooks de Datos**
```typescript
// src/hooks/usePatientData.ts
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase';

export function usePatientProfile() {
  const supabase = createClient();
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    }
  });
}

export function useVitalSigns() {
  const supabase = createClient();
  return useQuery({
    queryKey: ['vital-signs'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('vital_signs')
        .select('*')
        .eq('patient_id', user?.id)
        .order('measured_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    }
  });
}

export function useMedications() {
  const supabase = createClient();
  return useQuery({
    queryKey: ['medications'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('medications')
        .select('*, prescriber:prescribed_by(first_name, last_name)')
        .eq('patient_id', user?.id)
        .eq('active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });
}
```

**2.3 Mutations**
```typescript
// src/hooks/useMedicalMutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase';

export function useAddVitalSign() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { type: string; value: any }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: result, error } = await supabase
        .from('vital_signs')
        .insert({
          patient_id: user?.id,
          type: data.type,
          value: data.value,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vital-signs'] });
    }
  });
}
```

**2.4 Realtime Subscriptions**
```typescript
// src/hooks/useRealtimeNotifications.ts
import { useEffect } from 'react';
import { createClient } from '@/lib/supabase';

export function useRealtimeNotifications() {
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel('patient-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'appointments',
          filter: `patient_id=eq.${user?.id}`
        },
        (payload) => {
          // Mostrar notificación de nueva cita
          showNotification('Nueva cita agendada', payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
}
```

---

### Fase 3: Telemedicina WebRTC (Semanas 5-6)

#### Objetivos
- Implementar WebRTC funcional con signaling server
- Sala de espera con estados
- Controles avanzados de video
- Chat en tiempo real durante llamada

#### Tareas

**3.1 Integración Signaling Server**
```typescript
// src/hooks/useWebRTCCall.ts
import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export function useWebRTCCall(roomId: string) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [callStatus, setCallStatus] = useState<'idle' | 'connecting' | 'connected'>('idle');

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Conectar al signaling server
    socketRef.current = io('ws://localhost:8888');

    socketRef.current.on('offer', async (offer) => {
      // Handle incoming offer
    });

    socketRef.current.on('answer', async (answer) => {
      // Handle answer
    });

    socketRef.current.on('ice-candidate', async (candidate) => {
      // Handle ICE candidate
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [roomId]);

  const startCall = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });
    setLocalStream(stream);

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    stream.getTracks().forEach(track => pc.addTrack(track, stream));

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current?.emit('ice-candidate', event.candidate);
      }
    };

    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };

    peerConnectionRef.current = pc;
    setCallStatus('connecting');
  };

  return { localStream, remoteStream, callStatus, startCall };
}
```

**3.2 Componente Sala de Espera**
```typescript
// src/components/calls/WaitingRoom.tsx
export function WaitingRoom({ doctorName }: { doctorName: string }) {
  const [devicesChecked, setDevicesChecked] = useState(false);
  const [queuePosition, setQueuePosition] = useState<number | null>(null);

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="text-center space-y-6">
        <div className="relative">
          <Avatar size="xl" src={doctorAvatar} />
          <div className="absolute inset-0 animate-pulse ring-4 ring-teal-400/50 rounded-full" />
        </div>

        <div>
          <h2 className="text-2xl font-bold">Dr. {doctorName} se conectará pronto</h2>
          {queuePosition && (
            <p className="text-slate-400">Posición en cola: {queuePosition}</p>
          )}
        </div>

        <div className="space-y-2">
          <DeviceCheck type="camera" />
          <DeviceCheck type="microphone" />
          <DeviceCheck type="connection" />
        </div>

        <Button onClick={testDevices}>Probar audio/video</Button>
      </div>
    </div>
  );
}
```

---

### Fase 4: Comunidad de Pacientes (Semanas 7-8)

#### Objetivos
- Sistema de posts y comentarios
- Grupos por condición médica
- Moderación y reportes
- Gamificación (badges, puntos)

#### Tareas

**4.1 Schema de Comunidad**
```sql
CREATE TABLE community_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  condition TEXT, -- 'diabetes', 'hypertension', etc.
  description TEXT,
  member_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE community_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID REFERENCES profiles(id),
  group_id UUID REFERENCES community_groups(id),
  content TEXT NOT NULL,
  type TEXT CHECK (type IN ('question', 'experience', 'resource')),
  is_anonymous BOOLEAN DEFAULT false,
  likes_count INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE community_replies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES community_posts(id),
  author_id UUID REFERENCES profiles(id),
  content TEXT NOT NULL,
  is_verified_answer BOOLEAN DEFAULT false, -- Por médicos
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**4.2 Componente Feed**
```typescript
// src/components/community/CommunityFeed.tsx
export function CommunityFeed({ groupId }: { groupId?: string }) {
  const { data: posts, isLoading } = useCommunityPosts(groupId);

  return (
    <div className="space-y-4">
      <CreatePostCard />

      {posts?.map(post => (
        <PostCard
          key={post.id}
          post={post}
          onLike={handleLike}
          onReply={handleReply}
        />
      ))}
    </div>
  );
}
```

---

### Fase 5: Dashboard Avanzado (Semanas 9-10)

#### Objetivos
- Gráficos de evolución (Recharts)
- Comparativas temporales
- Alertas inteligentes
- Exportación PDF

#### Tareas

**5.1 Gráficos de Signos Vitales**
```typescript
// src/components/charts/VitalSignsChart.tsx
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export function VitalSignsChart({ data, type }: { data: any[], type: string }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <XAxis
          dataKey="measured_at"
          tickFormatter={(value) => new Date(value).toLocaleDateString()}
        />
        <YAxis />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="value.systolic"
          stroke="#4fd1c5"
          strokeWidth={2}
        />
        <Line
          type="monotone"
          dataKey="value.diastolic"
          stroke="#f56565"
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
```

---

### Fase 6: Transparencia y Privacidad (Semanas 11-12)

#### Objetivos
- Log de accesos al historial
- Sistema de permisos granulares
- Consentimiento informado
- Audit trail completo

#### Tareas

**6.1 Audit Log**
```sql
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES profiles(id),
  accessor_id UUID REFERENCES profiles(id),
  accessor_type TEXT CHECK (accessor_type IN ('doctor', 'company', 'family')),
  sections_viewed TEXT[], -- ['vital_signs', 'medications']
  action TEXT, -- 'view', 'export', 'share'
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE POLICY "Patients can view own audit log"
  ON audit_log FOR SELECT
  USING (patient_id = auth.uid());
```

**6.2 Componente Log Accesos**
```typescript
// src/components/privacy/AccessLog.tsx
export function AccessLog() {
  const { data: logs } = useAuditLog();

  return (
    <div className="space-y-4">
      <h2>Visibilidad de tu Historial Clínico</h2>

      <div className="space-y-2">
        {logs?.map(log => (
          <div key={log.id} className="border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{log.accessor_name}</p>
                <p className="text-sm text-slate-400">
                  {log.accessor_type} • {formatDate(log.created_at)}
                </p>
              </div>
              <Badge>{log.action}</Badge>
            </div>

            <div className="mt-2 text-xs">
              Secciones vistas: {log.sections_viewed.join(', ')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

### Fase 7: IA y Gamificación (Semanas 13-14)

#### Objetivos
- Asistente ALTA (IA)
- Sistema de rachas y logros
- Recomendaciones personalizadas
- Insights automáticos

#### Tareas

**7.1 Asistente IA**
```typescript
// src/components/ai/AltaAssistant.tsx
export function AltaAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const handleSendMessage = async (message: string) => {
    // Llamar a OpenAI API con contexto médico del paciente
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      body: JSON.stringify({
        message,
        context: patientContext
      })
    });
  };

  return (
    <div className="fixed bottom-4 right-4">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-full w-14 h-14"
      >
        🤖
      </Button>

      {isOpen && (
        <ChatWindow
          messages={messages}
          onSend={handleSendMessage}
        />
      )}
    </div>
  );
}
```

---

## 📊 MÉTRICAS DE ÉXITO

### KPIs Técnicos
- ⏱️ Tiempo de carga inicial: <2s
- 📊 Lighthouse Score: >90
- 🔄 Uptime: >99.9%
- 🐛 Error rate: <0.1%

### KPIs de Negocio
- 👥 Usuarios activos diarios: >60%
- 📹 Videoconsultas completadas: >90%
- 💬 Participación comunidad: >20%
- 🏆 Usuarios con racha activa: >50%

---

## 🚀 DEPLOYMENT

### Cloudflare Pages
```bash
# Build command
pnpm turbo run build --filter=@autamedica/patients

# Environment variables
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_SIGNALING_SERVER_URL=wss://signaling.autamedica.com
```

### Preview URLs
- **Producción**: https://autamedica-patients.pages.dev
- **Staging**: https://staging.autamedica-patients.pages.dev
- **Preview**: https://[branch].autamedica-patients.pages.dev

---

## 📝 NOTAS FINALES

### Prioridades
1. 🥇 Conexión backend real (Fase 2)
2. 🥈 Telemedicina WebRTC (Fase 3)
3. 🥉 Comunidad activa (Fase 4)

### Dependencias Críticas
- @autamedica/types (contratos TypeScript)
- @autamedica/auth (autenticación)
- @autamedica/telemedicine (WebRTC core)
- Supabase (backend as service)
- Signaling server (WebRTC)

### Próximos Pasos Inmediatos
1. Crear schema Supabase completo
2. Implementar hooks de datos reales
3. Configurar RLS policies
4. Testing con datos reales

---

**Última actualización:** 2 Octubre 2025
**Próxima revisión:** Al completar Fase 2
