# 🔧 Pasos de Depuración para el Video en Negro

## 📋 Checklist Rápido de Verificación

### 1. **Abrir las Consolas del Navegador (F12)**

#### En el Navegador del DOCTOR:
Busca estos mensajes en la consola:
```
✅ "Added video track to peer connection"
✅ "Added audio track to peer connection"
✅ "Offer sent, waiting for answer..."
✅ "Received WebRTC answer"
✅ "Connection state: connected"
❓ "Received remote track: video"  <-- ESTE ES CRÍTICO
❓ "Received remote track: audio"  <-- ESTE TAMBIÉN
```

#### En el Navegador del PACIENTE:
Busca estos mensajes en la consola:
```
✅ "Adding tracks to peer connection:"
✅ "  - Added video track: [nombre]"
✅ "  - Added audio track: [nombre]"
✅ "Answer sent successfully"
✅ "Connection state: connected"
```

## 🎯 Prueba Manual Paso a Paso

### Opción 1: Usar la Página de Test Simple
1. Abre http://localhost:3001/test-webrtc-simple.html
2. Sigue estos pasos EN ORDEN:
   - Click "📹 Iniciar Cámara" en DOCTOR
   - Click "📹 Iniciar Cámara" en PACIENTE
   - Click "🔗 Unirse a Sala" en PACIENTE
   - Click "📞 Llamar" en DOCTOR
   - Click "✅ Aceptar" cuando aparezca en PACIENTE

### Opción 2: Usar las Apps Directas
1. **Doctor**: http://localhost:3001/dev
2. **Paciente**: http://localhost:3002/dev (en otra ventana/pestaña)
3. Ambos deben usar la misma sala: `?room=test-room`

## 🔍 Comandos de Depuración en Consola

### En la Consola del DOCTOR, ejecuta:
```javascript
// Ver estado del peer connection
if (window.peerConnectionRef?.current) {
  const pc = window.peerConnectionRef.current;
  console.log('Connection State:', pc.connectionState);
  console.log('ICE State:', pc.iceConnectionState);
  console.log('Signaling State:', pc.signalingState);

  // Ver receivers (tracks entrantes)
  pc.getReceivers().forEach(receiver => {
    console.log('Receiver:', {
      track: receiver.track,
      kind: receiver.track?.kind,
      enabled: receiver.track?.enabled,
      muted: receiver.track?.muted,
      readyState: receiver.track?.readyState
    });
  });

  // Ver senders (tracks salientes)
  pc.getSenders().forEach(sender => {
    console.log('Sender:', {
      track: sender.track,
      kind: sender.track?.kind,
      enabled: sender.track?.enabled
    });
  });
}
```

### En la Consola del PACIENTE, ejecuta:
```javascript
// Ver estado del stream local
const video = document.querySelector('video');
if (video && video.srcObject) {
  const stream = video.srcObject;
  console.log('Local Stream Active:', stream.active);
  stream.getTracks().forEach(track => {
    console.log('Track:', {
      kind: track.kind,
      enabled: track.enabled,
      muted: track.muted,
      readyState: track.readyState,
      label: track.label
    });
  });
}
```

## 🛠️ Soluciones Rápidas

### Si NO aparece "Received remote track: video" en el Doctor:

**Solución 1**: Verificar que el paciente está enviando tracks
En la consola del paciente:
```javascript
// Forzar re-agregado de tracks
const pc = window.peerConnectionRef?.current;
const stream = document.querySelector('video')?.srcObject;
if (pc && stream) {
  stream.getTracks().forEach(track => {
    const sender = pc.getSenders().find(s => s.track?.kind === track.kind);
    if (sender) {
      sender.replaceTrack(track);
      console.log('Replaced track:', track.kind);
    } else {
      pc.addTrack(track, stream);
      console.log('Added track:', track.kind);
    }
  });
}
```

**Solución 2**: Verificar el estado del remoteStream en el Doctor
```javascript
// En la consola del Doctor
const remoteVideo = document.querySelectorAll('video')[1]; // El segundo video es el remoto
console.log('Remote video element:', remoteVideo);
console.log('Has srcObject:', !!remoteVideo?.srcObject);
if (remoteVideo?.srcObject) {
  console.log('Tracks:', remoteVideo.srcObject.getTracks());
}
```

### Si el video local del paciente funciona pero no llega al doctor:

**Verificar la negociación SDP**:
```javascript
// En el Doctor
const pc = window.peerConnectionRef?.current;
if (pc) {
  console.log('Local Description:', pc.localDescription);
  console.log('Remote Description:', pc.remoteDescription);

  // Buscar líneas de video en el SDP
  if (pc.remoteDescription) {
    const sdp = pc.remoteDescription.sdp;
    const hasVideo = sdp.includes('m=video');
    const videoPort = sdp.match(/m=video (\d+)/);
    console.log('Remote SDP has video:', hasVideo);
    console.log('Video port:', videoPort?.[1]);
  }
}
```

## 📊 Información de Estado Actual

### Cambios Recientes Aplicados:
1. ✅ Se agregó `useEffect` para asegurar que `remoteStream` se asigne al video element
2. ✅ Se mejoró el manejo de estados con `callStatusRef` y `offerInFlightRef`
3. ✅ El paciente ahora tiene estado `'connecting'` para mejor sincronización
4. ✅ Se separó la lógica de `processOffer` en el paciente

### Flujo Actual:
```
1. Doctor llama → estado: 'calling'
2. Paciente acepta → estado: 'connecting'
3. Doctor crea offer con tracks
4. Paciente recibe offer → procesa → envía answer
5. Doctor recibe answer → estado: 'connected'
6. Paciente → estado: 'connected'
```

## 🚨 Diagnóstico Rápido

Ejecuta este script en la consola del DOCTOR para un diagnóstico completo:

```javascript
(() => {
  console.log('=== DIAGNÓSTICO WEBRTC ===');

  // Check if peer connection exists
  const pc = window.peerConnectionRef?.current;
  if (!pc) {
    console.error('❌ No hay peer connection activa');
    return;
  }

  console.log('✅ Peer connection encontrada');

  // Connection states
  console.log('\n📊 ESTADOS:');
  console.log('- Connection:', pc.connectionState);
  console.log('- ICE:', pc.iceConnectionState);
  console.log('- Signaling:', pc.signalingState);

  // Check tracks
  console.log('\n📹 TRACKS RECIBIDOS:');
  const receivers = pc.getReceivers();
  let hasVideo = false;
  let hasAudio = false;

  receivers.forEach(receiver => {
    if (receiver.track) {
      console.log(`- ${receiver.track.kind}:`, {
        enabled: receiver.track.enabled,
        muted: receiver.track.muted,
        readyState: receiver.track.readyState
      });

      if (receiver.track.kind === 'video') hasVideo = true;
      if (receiver.track.kind === 'audio') hasAudio = true;
    }
  });

  if (!hasVideo) console.error('❌ NO se está recibiendo VIDEO');
  if (!hasAudio) console.warn('⚠️ NO se está recibiendo AUDIO');

  // Check remote video element
  console.log('\n🖥️ ELEMENTO VIDEO REMOTO:');
  const remoteVideo = document.querySelectorAll('video')[1];
  if (remoteVideo) {
    console.log('- Elemento encontrado:', !!remoteVideo);
    console.log('- Tiene srcObject:', !!remoteVideo.srcObject);
    if (remoteVideo.srcObject) {
      const tracks = remoteVideo.srcObject.getTracks();
      console.log('- Tracks en srcObject:', tracks.length);
      tracks.forEach(t => console.log(`  - ${t.kind}: ${t.readyState}`));
    }
  } else {
    console.error('❌ No se encontró el elemento video remoto');
  }

  // Check SDP
  console.log('\n📝 SDP:');
  if (pc.remoteDescription) {
    const sdp = pc.remoteDescription.sdp;
    const videoLine = sdp.match(/m=video.*/)?.[0];
    console.log('- Video line en SDP:', videoLine || '❌ NO ENCONTRADA');
  }

  console.log('\n=== FIN DIAGNÓSTICO ===');
})();
```

## 📞 Contacto para Soporte

Si el problema persiste después de estos pasos:
1. Copia el resultado del script de diagnóstico
2. Toma screenshot de ambas consolas (Doctor y Paciente)
3. Verifica los logs del servidor en la terminal donde corre `npx wrangler dev`