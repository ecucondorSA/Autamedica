'use client'

import React, { useEffect, useState } from 'react'
import { Camera, Mic, Monitor, RefreshCw } from 'lucide-react'

interface MediaPickerProps {
  onMediaReady: (stream: MediaStream) => void
  onError?: (error: Error) => void
}

export default function MediaPicker({ onMediaReady, onError }: MediaPickerProps) {
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([])
  const [microphones, setMicrophones] = useState<MediaDeviceInfo[]>([])
  const [selectedCamera, setSelectedCamera] = useState<string>('')
  const [selectedMic, setSelectedMic] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [useScreenShare, setUseScreenShare] = useState(false)

  // Load saved preferences
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCamera = localStorage.getItem('am_video_device')
      const savedMic = localStorage.getItem('am_audio_device')
      if (savedCamera) setSelectedCamera(savedCamera)
      if (savedMic) setSelectedMic(savedMic)
    }
  }, [])

  // Enumerate devices
  const loadDevices = async () => {
    try {
      // Request permissions first to get device labels
      await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
        .then(s => s.getTracks().forEach(t => t.stop()))
        .catch(() => {}) // Ignore if fails, just try to enumerate

      const devices = await navigator.mediaDevices.enumerateDevices()

      const cams = devices.filter(d => d.kind === 'videoinput')
      const mics = devices.filter(d => d.kind === 'audioinput')

      setCameras(cams)
      setMicrophones(mics)

      // Auto-select first device if none selected
      if (!selectedCamera && cams.length > 0) {
        setSelectedCamera(cams[0].deviceId)
      }
      if (!selectedMic && mics.length > 0) {
        setSelectedMic(mics[0].deviceId)
      }
    } catch (err) {
      logger.error('Error enumerating devices:', err)
      setError('No se pudieron detectar dispositivos')
    }
  }

  useEffect(() => {
    loadDevices()

    // Listen for device changes
    navigator.mediaDevices.addEventListener('devicechange', loadDevices)
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', loadDevices)
    }
  }, [])

  // Progressive constraints fallback
  const getMediaWithFallback = async () => {
    setIsLoading(true)
    setError('')

    // Define progressive fallback constraints
    const constraints: MediaStreamConstraints[] = [
      // Try selected devices first
      {
        audio: selectedMic ? { deviceId: { exact: selectedMic } } : true,
        video: selectedCamera ? { deviceId: { exact: selectedCamera } } : true
      },
      // Try any devices
      {
        audio: true,
        video: true
      },
      // Try with lower resolution
      {
        audio: true,
        video: { width: { ideal: 640 }, height: { ideal: 480 } }
      },
      // Try front camera specifically
      {
        audio: true,
        video: { facingMode: 'user' }
      },
      // Try audio only
      {
        audio: true,
        video: false
      }
    ]

    for (const constraint of constraints) {
      try {
        // logger.info('Trying constraints:', constraint)
        const stream = await navigator.mediaDevices.getUserMedia(constraint)

        // Save successful device selection
        if (selectedCamera) localStorage.setItem('am_video_device', selectedCamera)
        if (selectedMic) localStorage.setItem('am_audio_device', selectedMic)

        onMediaReady(stream)
        setIsLoading(false)
        setError('')
        return
      } catch (err: any) {
        logger.error('Failed with constraint:', constraint, err)

        // Continue trying if it's a constraint error
        if (err.name === 'OverconstrainedError' || err.name === 'NotFoundError') {
          continue
        }

        // For AbortError or NotReadableError, device might be in use
        if (err.name === 'AbortError' || err.name === 'NotReadableError') {
          setError('La cámara está siendo usada por otra aplicación')
          continue
        }
      }
    }

    // All constraints failed
    setError('No se pudo acceder a la cámara/micrófono')
    setIsLoading(false)
    onError?.(new Error('Media access failed'))
  }

  // Screen share as fallback
  const startScreenShare = async () => {
    setIsLoading(true)
    setError('')

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false
      })

      // Try to add audio from microphone
      if (selectedMic) {
        try {
          const audioStream = await navigator.mediaDevices.getUserMedia({
            audio: selectedMic ? { deviceId: { exact: selectedMic } } : true,
            video: false
          })

          // Combine streams
          audioStream.getAudioTracks().forEach(track => {
            stream.addTrack(track)
          })
        } catch (err) {
          // logger.info('Could not add audio to screen share:', err)
        }
      }

      onMediaReady(stream)
      setIsLoading(false)
      setError('')
    } catch (err: any) {
      setError('No se pudo compartir la pantalla')
      setIsLoading(false)
      onError?.(err)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 space-y-4">
      <h3 className="font-semibold text-gray-800">Configuración de Medios</h3>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Camera selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Camera className="inline w-4 h-4 mr-1" />
            Cámara
          </label>
          <select
            value={selectedCamera}
            onChange={(e) => setSelectedCamera(e.target.value)}
            disabled={useScreenShare || cameras.length === 0}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Seleccionar cámara...</option>
            {cameras.map(cam => (
              <option key={cam.deviceId} value={cam.deviceId}>
                {cam.label || `Cámara ${cam.deviceId.substring(0, 8)}`}
              </option>
            ))}
          </select>
        </div>

        {/* Microphone selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Mic className="inline w-4 h-4 mr-1" />
            Micrófono
          </label>
          <select
            value={selectedMic}
            onChange={(e) => setSelectedMic(e.target.value)}
            disabled={microphones.length === 0}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Seleccionar micrófono...</option>
            {microphones.map(mic => (
              <option key={mic.deviceId} value={mic.deviceId}>
                {mic.label || `Micrófono ${mic.deviceId.substring(0, 8)}`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Screen share option */}
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={useScreenShare}
          onChange={(e) => setUseScreenShare(e.target.checked)}
          className="rounded"
        />
        <Monitor className="w-4 h-4" />
        Usar compartir pantalla en lugar de cámara
      </label>

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          onClick={useScreenShare ? startScreenShare : getMediaWithFallback}
          disabled={isLoading}
          className={`flex-1 px-4 py-2 rounded-md text-white font-medium transition-colors ${
            isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isLoading ? (
            <>
              <RefreshCw className="inline w-4 h-4 mr-2 animate-spin" />
              Conectando...
            </>
          ) : useScreenShare ? (
            <>
              <Monitor className="inline w-4 h-4 mr-2" />
              Compartir Pantalla
            </>
          ) : (
            <>
              <Camera className="inline w-4 h-4 mr-2" />
              Activar Cámara
            </>
          )}
        </button>

        <button
          onClick={loadDevices}
          className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          title="Recargar dispositivos"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Audio only option */}
      <div className="text-center">
        <button
          onClick={() => {
            const getAudioOnly = async () => {
              setIsLoading(true)
              setError('')
              try {
                const audioStream = await navigator.mediaDevices.getUserMedia({
                  audio: selectedMic ? { deviceId: { exact: selectedMic } } : true,
                  video: false
                })
                onMediaReady(audioStream)
                setIsLoading(false)
              } catch (err: any) {
                setError('No se pudo acceder al micrófono')
                setIsLoading(false)
                onError?.(err)
              }
            }
            getAudioOnly()
          }}
          disabled={isLoading}
          className="text-sm text-gray-600 hover:text-blue-600 underline"
        >
          <Mic className="inline w-4 h-4 mr-1" />
          Continuar solo con audio (sin video)
        </button>
      </div>

      {/* Help text */}
      <div className="text-xs text-gray-500">
        {cameras.length === 0 && microphones.length === 0 ? (
          <p>No se detectaron dispositivos. Verifica los permisos del navegador.</p>
        ) : (
          <p>
            Si la cámara falla, intenta: 1) Cerrar otras apps que la usen, 2) Usar compartir pantalla,
            3) Reiniciar el navegador
          </p>
        )}
      </div>
    </div>
  )
}