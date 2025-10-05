# 🎥 WebRTC Real - Implementación Completa

## 📋 Resumen

Se ha implementado **WebRTC peer-to-peer real** para videollamadas médicas en AutaMedica Patient Portal, usando **Supabase Realtime** como canal de señalización.

### ✅ Componentes Implementados

1. **SupabaseSignalingService** - Servicio de señalización con Supabase Realtime
2. **useWebRTCVideoCall** - Hook React completo para gestión de WebRTC
3. **RealVideoCall** - Componente UI para videollamadas
4. **Dashboard Integration** - Integración en página principal

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                    Dashboard Page                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │           RealVideoCall Component                 │  │
│  │  ┌────────────────────────────────────────────┐  │  │
│  │  │      useWebRTCVideoCall Hook               │  │  │
│  │  │  ┌──────────────┐  ┌──────────────────┐   │  │  │
│  │  │  │ RTCPeer      │  │  Supabase        │   │  │  │
│  │  │  │ Connection   │  │  Signaling       │   │  │  │
│  │  │  │              │  │  Service         │   │  │  │
│  │  │  └──────────────┘  └──────────────────┘   │  │  │
│  │  └────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          ↕
              Supabase Realtime Channel
              (webrtc:room-id)
                          ↕
┌─────────────────────────────────────────────────────────┐
│            Otro Peer (Doctor/Paciente)                   │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 Componentes Técnicos

### 1. SupabaseSignalingService

**Ubicación:** `src/services/SupabaseSignalingService.ts`

**Responsabilidades:**
- Gestionar canal de Supabase Realtime
- Enviar/recibir mensajes de señalización (SDP, ICE candidates)
- Trackear presencia de peers en sala
- Manejar eventos de join/leave

**Mensajes de Señalización:**
```typescript
type SignalingMessageType =
  | 'offer'          // SDP offer
  | 'answer'         // SDP answer
  | 'ice-candidate'  // ICE candidate
  | 'join-room'      // Peer joined
  | 'leave-room'     // Peer left
  | 'peer-joined'    // Notificación
  | 'peer-left';     // Notificación

interface SignalingMessage {
  type: SignalingMessageType;
  roomId: string;
  from: string;
  to?: string;  // Opcional: mensaje directo
  data?: any;   // SDP o ICE candidate
  timestamp: number;
}
```

**Uso:**
```typescript
const signaling = new SupabaseSignalingService(
  supabase,
  userId,
  {
    onOffer: (offer, from) => { /* Manejar oferta */ },
    onAnswer: (answer, from) => { /* Manejar respuesta */ },
    onIceCandidate: (candidate, from) => { /* Agregar candidato */ },
    onPeerJoined: (peerId) => { /* Peer se unió */ },
    onPeerLeft: (peerId) => { /* Peer salió */ },
  }
);

await signaling.joinRoom('room-123');
await signaling.sendOffer(offer, targetPeerId);
await signaling.sendAnswer(answer, targetPeerId);
await signaling.sendIceCandidate(candidate);
await signaling.leaveRoom();
```

---

### 2. useWebRTCVideoCall Hook

**Ubicación:** `src/hooks/useWebRTCVideoCall.ts`

**Estado Retornado:**
```typescript
interface WebRTCVideoCallState {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isConnected: boolean;
  isConnecting: boolean;
  isCameraOn: boolean;
  isMicOn: boolean;
  connectionState: RTCPeerConnectionState;
  error: string | null;
  remotePeerId: string | null;
}
```

**Acciones Disponibles:**
```typescript
interface WebRTCVideoCallActions {
  startCall: () => Promise<void>;
  endCall: () => void;
  toggleCamera: () => void;
  toggleMic: () => void;
  switchCamera: () => Promise<void>;
}
```

**Uso:**
```typescript
const [state, actions] = useWebRTCVideoCall({
  roomId: 'patient-room-123',
  userId: 'user-abc',
  autoStart: false,
});

// Iniciar llamada
await actions.startCall();

// Toggle controls
actions.toggleCamera();
actions.toggleMic();

// Finalizar
actions.endCall();
```

---

### 3. RealVideoCall Component

**Ubicación:** `src/components/telemedicine/RealVideoCall.tsx`

**Props:**
```typescript
interface RealVideoCallProps {
  roomId: string;
  className?: string;
}
```

**Features:**
- Video remoto en pantalla completa
- Video local en Picture-in-Picture (PIP)
- Controles de cámara y micrófono
- Indicador de estado de conexión
- Mensajes de error
- Debug info (solo development)

**Uso:**
```tsx
import { RealVideoCall } from '@/components/telemedicine/RealVideoCall';

export default function VideoCallPage() {
  return (
    <div className="h-screen">
      <RealVideoCall roomId="room-123" />
    </div>
  );
}
```

---

## 🔄 Flujo de Conexión WebRTC

### Peer A (Iniciador)
1. `startCall()` → Obtiene localStream
2. Crea RTCPeerConnection
3. Agrega local tracks
4. `joinRoom()` → Se une a sala Supabase
5. Escucha evento `peer-joined`
6. **Crea offer** → `createOffer()`
7. `setLocalDescription(offer)`
8. `sendOffer(offer, peerB)` → Envía via signaling
9. Recibe answer de Peer B
10. `setRemoteDescription(answer)`
11. Intercambia ICE candidates
12. **Conexión establecida** ✅

### Peer B (Receptor)
1. `startCall()` → Obtiene localStream
2. Crea RTCPeerConnection
3. Agrega local tracks
4. `joinRoom()` → Se une a sala Supabase
5. Recibe offer de Peer A
6. `setRemoteDescription(offer)`
7. **Crea answer** → `createAnswer()`
8. `setLocalDescription(answer)`
9. `sendAnswer(answer, peerA)` → Envía via signaling
10. Intercambia ICE candidates
11. **Conexión establecida** ✅

---

## 🛠️ Configuración Requerida

### 1. Habilitar Supabase Realtime

En tu proyecto Supabase, asegúrate de que Realtime esté habilitado:

```sql
-- No se requieren tablas adicionales
-- Supabase Realtime usa canales en memoria
```

### 2. Variables de Entorno

```env
# Ya configuradas en @autamedica/auth
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

### 3. ICE Servers (Opcional)

Por defecto usa Google STUN servers (gratuitos):
```typescript
const ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];
```

Para **producción**, se recomienda agregar TURN servers:
```typescript
const ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  {
    urls: 'turn:turn.autamedica.com:3478',
    username: 'autamedica',
    credential: process.env.NEXT_PUBLIC_TURN_SECRET,
  },
];
```

**Proveedores TURN recomendados:**
- [Twilio TURN](https://www.twilio.com/stun-turn)
- [Xirsys](https://xirsys.com/)
- Self-hosted: [Coturn](https://github.com/coturn/coturn)

---

## 🧪 Testing

### Test Manual (2 Navegadores)

1. **Abrir Navegador 1:**
   ```
   http://localhost:3002/
   ```

2. **Abrir Navegador 2 (Incógnito):**
   ```
   http://localhost:3002/
   ```

3. **En Navegador 1:**
   - Click "Iniciar Llamada"
   - Permitir acceso a cámara/micrófono

4. **En Navegador 2:**
   - Click "Iniciar Llamada"
   - Permitir acceso a cámara/micrófono

5. **Verificar:**
   - ✅ Ambos ven video local (PIP)
   - ✅ Ambos ven video remoto (pantalla completa)
   - ✅ Indicador muestra "Conectado"
   - ✅ Audio bidireccional funciona

### Debug

Abrir DevTools Console para ver logs:
```
[WebRTC] Local stream initialized
[Signaling] Subscribed to room: patient-room-xxx
[Signaling] Peer joined: user-yyy
[WebRTC] Sending ICE candidate
[WebRTC] Received answer from: user-yyy
[WebRTC] Connection state: connected
```

---

## ⚠️ Limitaciones y Consideraciones

### Limitaciones Actuales

1. **Peer-to-Peer Directo**
   - Solo 2 participantes por sala
   - No hay servidor de medios (SFU/MCU)
   - Bandwidth limitado por conexión del cliente

2. **No Hay Recording**
   - Las llamadas no se graban automáticamente
   - Para recording, considerar [Twilio Video](https://www.twilio.com/video)

3. **TURN Servers**
   - Solo STUN público (Google)
   - Puede fallar en redes restrictivas (NAT simétrico)
   - Producción requiere TURN servers propios

### Mejoras Futuras

- [ ] **Multipeer Support** - Usar SFU para más de 2 participantes
- [ ] **Screen Sharing** - Compartir pantalla
- [ ] **Recording** - Grabar sesiones médicas
- [ ] **Transcription** - Transcripción automática de consultas
- [ ] **Quality Indicators** - Métricas de calidad (bitrate, latency, packet loss)
- [ ] **Reconnection Logic** - Auto-reconexión en caso de pérdida de conexión

---

## 📚 Referencias

- [WebRTC API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)
- [RTCPeerConnection](https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection)
- [Perfect Negotiation Pattern](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Perfect_negotiation)

---

## 🎉 Conclusión

WebRTC real está **completamente implementado y funcional**. La aplicación ahora soporta videollamadas peer-to-peer reales usando Supabase Realtime como signaling channel.

Para escalar a múltiples participantes o agregar features avanzadas (recording, transcription), considera usar un SFU como [Janus](https://janus.conf.meetecho.com/) o servicios managed como [Twilio](https://www.twilio.com/video), [Agora](https://www.agora.io/), o [Daily.co](https://www.daily.co/).
