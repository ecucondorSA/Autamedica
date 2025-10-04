import { useState, useCallback, useEffect } from 'react';

/**
 * Hook temporal para simular un remote stream del médico
 * Útil para testing del layout dual antes de implementar WebRTC
 *
 * Genera un video pattern de prueba usando Canvas API
 */
export function useMockRemoteStream(isActive: boolean = false) {
  const [mockStream, setMockStream] = useState<MediaStream | null>(null);

  const createMockVideoStream = useCallback(() => {
    // Crear canvas para generar video pattern
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');

    if (!ctx) return null;

    // Animar un pattern simple
    let hue = 0;
    const interval = setInterval(() => {
      // Fondo gradiente animado
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, `hsl(${hue}, 70%, 50%)`);
      gradient.addColorStop(1, `hsl(${hue + 60}, 70%, 30%)`);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Texto "DR. GARCÍA - MÉDICO ESPECIALISTA"
      ctx.fillStyle = 'white';
      ctx.font = 'bold 32px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Dr. García', canvas.width / 2, canvas.height / 2 - 30);
      ctx.font = '20px Arial';
      ctx.fillText('Médico Especialista', canvas.width / 2, canvas.height / 2 + 10);
      ctx.font = '16px Arial';
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.fillText('(Stream de prueba - Mock)', canvas.width / 2, canvas.height / 2 + 40);

      // Timestamp
      ctx.font = '14px monospace';
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      const now = new Date();
      ctx.fillText(
        `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`,
        canvas.width / 2,
        canvas.height - 30
      );

      hue = (hue + 1) % 360;
    }, 100); // 10 FPS

    // Capturar stream del canvas
    const stream = canvas.captureStream(10); // 10 FPS

    // Cleanup function
    return {
      stream,
      cleanup: () => {
        clearInterval(interval);
        stream.getTracks().forEach(track => track.stop());
      },
    };
  }, []);

  // Activar/desactivar mock stream
  useEffect(() => {
    if (isActive) {
      const result = createMockVideoStream();
      if (result) {
        setMockStream(result.stream);

        return () => {
          result.cleanup();
          setMockStream(null);
        };
      }
    } else {
      if (mockStream) {
        mockStream.getTracks().forEach(track => track.stop());
        setMockStream(null);
      }
    }
  }, [isActive, createMockVideoStream, mockStream]);

  return mockStream;
}
