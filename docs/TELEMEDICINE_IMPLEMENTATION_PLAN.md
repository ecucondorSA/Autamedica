# Plan de Implementación Telemedicina (altamedica-reboot)

## Objetivo
Entregar un sistema de telemedicina 1:1 (doctor ↔ paciente) completamente funcional sobre la arquitectura de `altamedica-reboot`, reutilizando Supabase para autenticación/almacenamiento y un servidor de señalización propio para WebRTC.

## Componentes

| Componente | Descripción | Repositorio |
|------------|-------------|-------------|
| `apps/signaling-server` | Servicio Node.js + `ws` que gestiona salas, usuarios y broadcasting. Exponer `WS /signal`, `GET /health`, `GET /stats`. | Este monorepo |
| `packages/telemedicine` | Paquete compartido con protocolo (tipos), cliente WebSocket, utilidades WebRTC y helpers Supabase. | Este monorepo |
| `apps/doctors` | UI médico: lobby, sala, controles (audio/video/pantalla), estado de paciente. Consume `packages/telemedicina`. | Este monorepo |
| `apps/patients` | UI paciente: lobby, sala, controles. | Este monorepo |
| Supabase | Autenticación JWT y persistencia básica de sesiones (opcional). | Servicio externo |

## Flujo de sesión

1. Doctor crea cita (fuera de alcance inmediato) u obtiene `sessionId` y `roomId` desde el backend.
2. Doctor y paciente abren la sala → cada cliente:
   - Obtiene token Supabase.
   - Abre WebSocket a `SIGNALING_URL` con headers JWT.
   - Envía `join` (`{ roomId, userId, userType }`).
3. Signaling server mantiene lista de participantes y reenvía mensajes `offer/answer/ice-candidate` peer-to-peer.
4. Clientes manejan `RTCPeerConnection`, agregan tracks locales y remotos.
5. Eventos de estado (usuarios conectados, calidad) se reflejan en la UI.

## Autenticación

- Solicitar token Supabase desde `@/lib/supabase`.
- Incluir en header `Authorization: Bearer <access_token>` en handshake (usando querystring o `sec-websocket-protocol`).
- Signaling valida token (sin scopes complejos en MVP).

## Entregables por fase

1. **Infraestructura básica**
   - Scaffold `apps/signaling-server` con scripts (`dev`, `build`, `start`).
   - Esquema de mensajes (`SignalingMessage`, `RoomParticipant`).
   - Healthcheck y `/stats`.

2. **Cliente compartido**
   - `packages/telemedicina` con cliente WS (`TelemedicineClient`), manejador de eventos, abstracción `WebRTCController`.
   - Tipos y constantes compartidas.
   - Tests unitarios iniciales.

3. **Integración UI (doctor/patient)**
   - Hooks `useTelemedicinaDoctor`, `useTelemedicinaPatient` (join/leave, control tracks, UI mínima).
   - Vistas responsive para lobby/llamada.
   - Estado visual (participantes, mute, conexión, pantalla compartida).

4. **Persistencia & métricas (extensible)**
   - Opcional: tabla Supabase `telemedicina_sessions`.
   - Eventos de QoS básicos (latencia, reconexión).

5. **QA & Deploy**
   - Scripts `pnpm signaling-server dev`, `pnpm --filter telemedicina test`.
   - Instrucciones README (local + producción).
   - Smoke test Playwright (con `--use-fake-ui-for-media-stream`).

## Variables de entorno

- `SIGNALING_PORT` (default `8888`).
- `SIGNALING_LOG_LEVEL` (opcional).
- `SIGNALING_SUPABASE_URL`, `SIGNALING_SUPABASE_KEY` (para validar JWT si se requiere).
- Cliente:
  - `NEXT_PUBLIC_SIGNALING_URL` → `ws://localhost:8888/signal` en dev.

## Tareas inmediatas

1. Crear carpeta `apps/signaling-server` con configuración básica (TypeScript + tsup/esbuild o ts-node).
2. Configurar `pnpm-workspace.yaml` y `turbo.json` para nuevos proyectos.
3. Añadir referencia a plan en documentación general (`NEXT_STEPS.md`).

---

> Nota: este plan se centra en MVP 1:1. Extensiones (media recording, chat persistente, métricas avanzadas) se considerarán después de estabilizar la llamada principal.
