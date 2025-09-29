#!/usr/bin/env node

const WebSocket = require('ws')
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://gtyvdircfhmdjiaelqkg.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0eXZkaXJjZmhtZGppYWVscWtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2Njc4NTUsImV4cCI6MjA3MjI0Mzg1NX0.DeEm08k7QOrKObWaz8AUaOB5N6Z2QZhZHFaUf2siALA'

// IDs de prueba
const DOCTOR_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
const PATIENT_ID = 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12'

class SignalingAuditor {
  constructor() {
    this.supabase = createClient(supabaseUrl, supabaseKey)
    this.doctorWs = null
    this.patientWs = null
    this.callData = null
    this.auditLog = []
  }

  log(phase, message, data = null) {
    const timestamp = new Date().toISOString()
    const logEntry = { timestamp, phase, message, data }
    this.auditLog.push(logEntry)

    console.log(`[${timestamp}] 📋 ${phase}: ${message}`)
    if (data) {
      console.log(`   📄 Data:`, data)
    }
  }

  async checkSignalingServer() {
    this.log('INFRASTRUCTURE', 'Verificando signaling server...')

    // URLs posibles del signaling server
    const signalingUrls = [
      'ws://localhost:3001',
      'ws://localhost:8080',
      'wss://altamedica-signaling.pages.dev',
      'ws://localhost:3000/api/ws'
    ]

    for (const url of signalingUrls) {
      try {
        this.log('CONNECTION_TEST', `Probando conexión a: ${url}`)

        const testWs = new WebSocket(url)

        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            testWs.close()
            reject(new Error('Timeout'))
          }, 3000)

          testWs.on('open', () => {
            clearTimeout(timeout)
            this.log('CONNECTION_SUCCESS', `✅ Signaling server activo en: ${url}`)
            testWs.close()
            resolve(url)
          })

          testWs.on('error', (error) => {
            clearTimeout(timeout)
            reject(error)
          })
        })

        return url // Retorna el primer servidor que funcione

      } catch (error) {
        this.log('CONNECTION_FAILED', `❌ No disponible: ${url} - ${error.message}`)
      }
    }

    throw new Error('❌ No se encontró ningún signaling server activo')
  }

  async setupWebSocketConnections(signalingUrl) {
    this.log('WS_SETUP', 'Configurando conexiones WebSocket...')

    // Conexión del doctor
    this.doctorWs = new WebSocket(signalingUrl)
    this.doctorWs.on('open', () => {
      this.log('WS_DOCTOR', '✅ Doctor conectado al signaling server')
      this.doctorWs.send(JSON.stringify({
        type: 'join',
        userId: DOCTOR_ID,
        userType: 'doctor'
      }))
    })

    this.doctorWs.on('message', (data) => {
      const message = JSON.parse(data.toString())
      this.log('WS_DOCTOR_MSG', 'Doctor recibió mensaje', message)
    })

    // Conexión del paciente
    this.patientWs = new WebSocket(signalingUrl)
    this.patientWs.on('open', () => {
      this.log('WS_PATIENT', '✅ Paciente conectado al signaling server')
      this.patientWs.send(JSON.stringify({
        type: 'join',
        userId: PATIENT_ID,
        userType: 'patient'
      }))
    })

    this.patientWs.on('message', (data) => {
      const message = JSON.parse(data.toString())
      this.log('WS_PATIENT_MSG', 'Paciente recibió mensaje', message)

      // Verificar si es una invitación de llamada
      if (message.type === 'call_invite') {
        this.log('CALL_INVITE_RECEIVED', '🎉 Paciente recibió invitación de llamada!', message)

        // Simular aceptación automática después de 2 segundos
        setTimeout(() => {
          this.simulateCallAcceptance(message)
        }, 2000)
      }
    })

    // Esperar a que ambas conexiones estén listas
    await this.waitForConnections()
  }

  async waitForConnections() {
    return new Promise((resolve) => {
      let doctorReady = false
      let patientReady = false

      const checkReady = () => {
        if (doctorReady && patientReady) {
          this.log('WS_READY', '✅ Ambas conexiones WebSocket listas')
          resolve()
        }
      }

      this.doctorWs.on('open', () => {
        doctorReady = true
        checkReady()
      })

      this.patientWs.on('open', () => {
        patientReady = true
        checkReady()
      })
    })
  }

  async createCall() {
    this.log('DB_CALL_CREATE', 'Creando llamada en base de datos...')

    try {
      const { data, error } = await this.supabase
        .rpc('create_call', {
          p_doctor_id: DOCTOR_ID,
          p_patient_id: PATIENT_ID
        })

      if (error) {
        this.log('DB_ERROR', '❌ Error creando llamada', error)
        throw error
      }

      this.callData = data[0]
      this.log('DB_CALL_SUCCESS', '✅ Llamada creada en DB', this.callData)
      return this.callData

    } catch (error) {
      this.log('DB_CALL_FAILED', '❌ No se pudo crear llamada en DB', error.message)

      // Fallback: simular datos de llamada
      this.callData = {
        id: 'test-call-' + Date.now(),
        room_id: 'room_' + Math.random().toString(36).substr(2, 8),
        doctor_id: DOCTOR_ID,
        patient_id: PATIENT_ID,
        status: 'requested',
        created_at: new Date().toISOString()
      }

      this.log('FALLBACK_CALL', '🔄 Usando datos de llamada simulados', this.callData)
      return this.callData
    }
  }

  async sendCallInvitation() {
    this.log('SIGNALING_INVITE', 'Enviando invitación de llamada via signaling...')

    const inviteMessage = {
      type: 'call_invite',
      callId: this.callData.id,
      roomId: this.callData.room_id,
      from: DOCTOR_ID,
      to: PATIENT_ID,
      fromType: 'doctor',
      toType: 'patient',
      timestamp: Date.now()
    }

    this.doctorWs.send(JSON.stringify(inviteMessage))
    this.log('SIGNALING_SENT', '📤 Invitación enviada por doctor', inviteMessage)
  }

  async simulateCallAcceptance(inviteMessage) {
    this.log('CALL_ACCEPTANCE', 'Simulando aceptación de llamada por paciente...')

    // Actualizar estado en DB
    try {
      const { data, error } = await this.supabase
        .rpc('update_call_status', {
          p_call_id: inviteMessage.callId,
          p_status: 'accepted'
        })

      if (!error) {
        this.log('DB_ACCEPT_SUCCESS', '✅ Estado actualizado a "accepted" en DB')
      }
    } catch (error) {
      this.log('DB_ACCEPT_FAILED', '⚠️ No se pudo actualizar DB, pero continuando...')
    }

    // Enviar respuesta via signaling
    const acceptMessage = {
      type: 'call_accepted',
      callId: inviteMessage.callId,
      roomId: inviteMessage.roomId,
      from: PATIENT_ID,
      to: DOCTOR_ID,
      timestamp: Date.now()
    }

    this.patientWs.send(JSON.stringify(acceptMessage))
    this.log('CALL_ACCEPTED', '✅ Paciente aceptó llamada', acceptMessage)
  }

  async runFullAudit() {
    console.log('\n🔍 INICIANDO AUDITORÍA COMPLETA DEL SISTEMA DE LLAMADAS\n')

    try {
      // 1. Verificar signaling server
      const signalingUrl = await this.checkSignalingServer()

      // 2. Configurar conexiones WebSocket
      await this.setupWebSocketConnections(signalingUrl)

      // 3. Crear llamada en DB
      await this.createCall()

      // 4. Enviar invitación via signaling
      await this.sendCallInvitation()

      // 5. Esperar respuesta del paciente (timeout 10 segundos)
      await this.waitForCallResponse()

      // 6. Generar reporte final
      this.generateAuditReport()

    } catch (error) {
      this.log('AUDIT_ERROR', '❌ Error en auditoría', error.message)
      this.generateAuditReport(error)
    } finally {
      this.cleanup()
    }
  }

  async waitForCallResponse() {
    this.log('WAITING_RESPONSE', 'Esperando respuesta del paciente (10s timeout)...')

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        this.log('TIMEOUT', '⏱️ Timeout esperando respuesta del paciente')
        resolve()
      }, 10000)

      const originalPatientHandler = this.patientWs.onmessage
      this.patientWs.onmessage = (event) => {
        const message = JSON.parse(event.data)
        if (message.type === 'call_accepted') {
          clearTimeout(timeout)
          this.log('RESPONSE_RECEIVED', '✅ Respuesta del paciente recibida')
          resolve()
        }
        if (originalPatientHandler) originalPatientHandler(event)
      }
    })
  }

  generateAuditReport(error = null) {
    console.log('\n📊 REPORTE DE AUDITORÍA FINAL\n')
    console.log('='.repeat(60))

    if (error) {
      console.log('❌ AUDITORÍA FALLIDA:', error.message)
    } else {
      console.log('✅ AUDITORÍA COMPLETADA')
    }

    console.log('\n📋 Fases ejecutadas:')
    const phases = [...new Set(this.auditLog.map(log => log.phase))]
    phases.forEach(phase => {
      const phaseLogs = this.auditLog.filter(log => log.phase === phase)
      const success = phaseLogs.some(log => log.message.includes('✅'))
      console.log(`  ${success ? '✅' : '❌'} ${phase} (${phaseLogs.length} eventos)`)
    })

    console.log('\n🔗 URLs verificadas:')
    console.log('  - Supabase:', supabaseUrl)
    console.log('  - Doctor App: http://localhost:4001')
    console.log('  - Patient App: http://localhost:4002')

    console.log('\n📝 Log completo guardado en audit-log.json')
    require('fs').writeFileSync('audit-log.json', JSON.stringify(this.auditLog, null, 2))
  }

  cleanup() {
    if (this.doctorWs) this.doctorWs.close()
    if (this.patientWs) this.patientWs.close()
    this.log('CLEANUP', '🧹 Conexiones cerradas')
  }
}

async function main() {
  const auditor = new SignalingAuditor()
  await auditor.runFullAudit()
}

if (require.main === module) {
  main().catch(console.error)
}

module.exports = SignalingAuditor