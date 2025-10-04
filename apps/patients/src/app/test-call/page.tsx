'use client'

import { useState } from 'react'
import { UnifiedVideoCall } from '@autamedica/telemedicine'

export default function TestCallPage() {
  const [roomId, setRoomId] = useState('test-room-001')
  const [userId] = useState('patient-test-001')
  const [callStarted, setCallStarted] = useState(false)

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 text-white">
          <h1 className="text-2xl font-bold mb-2">👤 Test de Videollamada - Portal Pacientes</h1>
          <p className="text-gray-400">Prueba del sistema de telemedicina Doctor ↔ Paciente</p>
        </div>

        {!callStarted ? (
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">Unirse a Consulta Médica</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Room ID (Código de Consulta)
                </label>
                <input
                  type="text"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  placeholder="Ej: test-room-001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  User ID (Paciente)
                </label>
                <input
                  type="text"
                  value={userId}
                  disabled
                  className="w-full px-3 py-2 bg-gray-600 border border-gray-600 rounded-lg text-gray-400"
                />
              </div>
            </div>

            <div className="bg-teal-600/20 border border-teal-500/50 rounded-lg p-4 mb-6">
              <h3 className="text-teal-200 font-medium mb-2">📋 Instrucciones para Pacientes:</h3>
              <ol className="text-teal-100 text-sm space-y-1">
                <li>1. Asegúrate de que el doctor ya haya iniciado la consulta</li>
                <li>2. Usa el mismo Room ID que te proporcionó el doctor</li>
                <li>3. Click "Unirse a Consulta" para conectar</li>
                <li>4. Permite acceso a cámara y micrófono cuando lo solicite</li>
                <li>5. La videollamada se conectará automáticamente</li>
              </ol>
            </div>

            <button
              onClick={() => setCallStarted(true)}
              className="w-full bg-[#4fd1c5] hover:bg-[#2c7a7b] text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              📞 Unirse a Consulta Médica
            </button>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg overflow-hidden" style={{ height: '600px' }}>
            <UnifiedVideoCall
              roomId={roomId}
              userId={userId}
              userType="patient"
              userName="Paciente Test"
              onCallEnd={() => setCallStarted(false)}
              onCallStart={() => logger.info('✅ Conectado a consulta médica')}
              theme="patient"
              className="h-full"
            />
          </div>
        )}

        {callStarted && (
          <div className="mt-6 bg-gray-800 rounded-lg p-4">
            <h3 className="text-white font-medium mb-2">🔧 Debug Info</h3>
            <div className="text-sm text-gray-300 space-y-1">
              <p><strong>Room ID:</strong> {roomId}</p>
              <p><strong>User ID:</strong> {userId}</p>
              <p><strong>Role:</strong> Paciente</p>
              <p><strong>WebRTC Status:</strong> <span className="text-green-400">Activo</span></p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}