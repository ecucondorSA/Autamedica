#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://gtyvdircfhmdjiaelqkg.supabase.co'
const supabaseKey = 'REPLACE_WITH_ROTATED_KEY.DeEm08k7QOrKObWaz8AUaOB5N6Z2QZhZHFaUf2siALA'

// IDs de prueba
const DOCTOR_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
const PATIENT_ID = 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12'
const SIGNALING_URL = 'http://localhost:8080'

class HTTPSignalingAuditor {
  constructor() {
    this.supabase = createClient(supabaseUrl, supabaseKey)
    this.callData = null
    this.auditLog = []
  }

  log(phase, message, data = null) {
    const timestamp = new Date().toISOString()
    const logEntry = { timestamp, phase, message, data }
    this.auditLog.push(logEntry)

    logger.info(`[${timestamp}] 📋 ${phase}: ${message}`)
    if (data) {
      logger.info(`   📄 Data:`, JSON.stringify(data, null, 2))
    }
  }

  async checkSignalingServer() {
    this.log('SIGNALING_CHECK', 'Verificando signaling server HTTP...')

    try {
      const response = await fetch(`${SIGNALING_URL}/health`)

      if (response.ok) {
        const healthData = await response.json()
        this.log('SIGNALING_SUCCESS', '✅ Signaling server HTTP disponible', healthData)
        return true
      } else {
        this.log('SIGNALING_WARNING', '⚠️ Signaling server responde pero sin /health', {
          status: response.status,
          statusText: response.statusText
        })
        return true // Puede funcionar sin endpoint /health
      }
    } catch (error) {
      this.log('SIGNALING_ERROR', '❌ Signaling server no disponible', error.message)
      throw error
    }
  }

  async testSignalingEndpoints() {
    this.log('ENDPOINTS_TEST', 'Probando endpoints del signaling server...')

    const endpoints = [
      { path: '/', method: 'GET', description: 'Root endpoint' },
      { path: '/api/signaling/health', method: 'GET', description: 'Health check' },
      { path: '/api/signaling/invite', method: 'POST', description: 'Send invitation' },
      { path: '/api/signaling/rooms', method: 'GET', description: 'List rooms' }
    ]

    const results = []

    for (const endpoint of endpoints) {
      try {
        const options = {
          method: endpoint.method,
          headers: {
            'Content-Type': 'application/json'
          }
        }

        // Para POST, agregar un body de prueba
        if (endpoint.method === 'POST') {
          options.body = JSON.stringify({
            type: 'test',
            from: DOCTOR_ID,
            to: PATIENT_ID
          })
        }

        const response = await fetch(`${SIGNALING_URL}${endpoint.path}`, options)

        results.push({
          path: endpoint.path,
          method: endpoint.method,
          status: response.status,
          available: response.status < 500
        })

        this.log('ENDPOINT_TEST', `${endpoint.method} ${endpoint.path}: ${response.status}`)

      } catch (error) {
        results.push({
          path: endpoint.path,
          method: endpoint.method,
          error: error.message,
          available: false
        })

        this.log('ENDPOINT_ERROR', `${endpoint.method} ${endpoint.path}: Error - ${error.message}`)
      }
    }

    return results
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
        this.log('DB_ERROR', '❌ Error creando llamada en DB (usando fallback)', error)

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

      this.callData = data[0]
      this.log('DB_CALL_SUCCESS', '✅ Llamada creada en DB', this.callData)
      return this.callData

    } catch (error) {
      this.log('DB_CALL_FAILED', '❌ No se pudo crear llamada en DB', error.message)
      throw error
    }
  }

  async sendSignalingInvitation() {
    this.log('SIGNALING_INVITE', 'Enviando invitación via HTTP signaling...')

    const invitePayload = {
      type: 'call_invite',
      callId: this.callData.id,
      roomId: this.callData.room_id,
      from: DOCTOR_ID,
      to: PATIENT_ID,
      fromType: 'doctor',
      toType: 'patient',
      timestamp: Date.now()
    }

    try {
      const response = await fetch(`${SIGNALING_URL}/api/signaling/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(invitePayload)
      })

      if (response.ok) {
        const result = await response.json()
        this.log('SIGNALING_SUCCESS', '✅ Invitación enviada exitosamente', result)
        return result
      } else {
        const error = await response.text()
        this.log('SIGNALING_FAILED', '❌ Error enviando invitación', {
          status: response.status,
          error
        })
        return null
      }
    } catch (error) {
      this.log('SIGNALING_ERROR', '❌ Error de red enviando invitación', error.message)
      return null
    }
  }

  async checkPatientNotifications() {
    this.log('PATIENT_CHECK', 'Verificando notificaciones para paciente...')

    try {
      const response = await fetch(`${SIGNALING_URL}/api/signaling/messages/${PATIENT_ID}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const messages = await response.json()
        this.log('PATIENT_MESSAGES', '✅ Mensajes para paciente obtenidos', messages)

        // Verificar si hay invitaciones pendientes
        const invitations = messages.filter(msg => msg.type === 'call_invite')
        if (invitations.length > 0) {
          this.log('INVITATION_FOUND', '🎉 ¡Invitación encontrada para paciente!', invitations[0])
          return invitations[0]
        } else {
          this.log('NO_INVITATIONS', '⚠️ No se encontraron invitaciones para paciente')
          return null
        }
      } else {
        this.log('PATIENT_ERROR', '❌ Error obteniendo mensajes de paciente', response.status)
        return null
      }
    } catch (error) {
      this.log('PATIENT_FETCH_ERROR', '❌ Error de red obteniendo mensajes', error.message)
      return null
    }
  }

  async simulatePatientAcceptance(invitation) {
    this.log('PATIENT_ACCEPT', 'Simulando aceptación de llamada por paciente...')

    // 1. Actualizar estado en DB
    try {
      const { data, error } = await this.supabase
        .rpc('update_call_status', {
          p_call_id: invitation.callId,
          p_status: 'accepted'
        })

      if (!error) {
        this.log('DB_ACCEPT_SUCCESS', '✅ Estado actualizado a "accepted" en DB')
      } else {
        this.log('DB_ACCEPT_FAILED', '⚠️ No se pudo actualizar DB, continuando...', error)
      }
    } catch (error) {
      this.log('DB_ACCEPT_ERROR', '⚠️ Error actualizando DB, continuando...', error.message)
    }

    // 2. Enviar respuesta via signaling
    const acceptPayload = {
      type: 'call_accepted',
      callId: invitation.callId,
      roomId: invitation.roomId,
      from: PATIENT_ID,
      to: DOCTOR_ID,
      timestamp: Date.now()
    }

    try {
      const response = await fetch(`${SIGNALING_URL}/api/signaling/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(acceptPayload)
      })

      if (response.ok) {
        const result = await response.json()
        this.log('ACCEPT_SUCCESS', '✅ Aceptación enviada exitosamente', result)
        return result
      } else {
        this.log('ACCEPT_FAILED', '❌ Error enviando aceptación', response.status)
        return null
      }
    } catch (error) {
      this.log('ACCEPT_ERROR', '❌ Error de red enviando aceptación', error.message)
      return null
    }
  }

  async runFullAudit() {
    logger.info('\n🔍 INICIANDO AUDITORÍA HTTP SIGNALING COMPLETA\n')

    try {
      // 1. Verificar signaling server
      await this.checkSignalingServer()

      // 2. Probar endpoints
      const endpointResults = await this.testSignalingEndpoints()

      // 3. Crear llamada en DB
      await this.createCall()

      // 4. Enviar invitación via signaling
      const inviteResult = await this.sendSignalingInvitation()

      // 5. Verificar que el paciente reciba la notificación
      await new Promise(resolve => setTimeout(resolve, 1000)) // Esperar 1s
      const invitation = await this.checkPatientNotifications()

      // 6. Simular aceptación si se encontró invitación
      if (invitation) {
        await this.simulatePatientAcceptance(invitation)
      }

      // 7. Generar reporte final
      this.generateAuditReport(endpointResults)

    } catch (error) {
      this.log('AUDIT_ERROR', '❌ Error en auditoría', error.message)
      this.generateAuditReport([], error)
    }
  }

  generateAuditReport(endpointResults = [], error = null) {
    logger.info('\n📊 REPORTE DE AUDITORÍA HTTP SIGNALING FINAL\n')
    logger.info('='.repeat(60))

    if (error) {
      logger.info('❌ AUDITORÍA FALLIDA:', error.message)
    } else {
      logger.info('✅ AUDITORÍA COMPLETADA')
    }

    logger.info('\n🔗 INFRAESTRUCTURA:')
    logger.info('  - Supabase DB:', supabaseUrl)
    logger.info('  - Signaling HTTP:', SIGNALING_URL)
    logger.info('  - Doctor App: http://localhost:4001')
    logger.info('  - Patient App: http://localhost:4002')

    logger.info('\n📋 ENDPOINTS PROBADOS:')
    endpointResults.forEach(endpoint => {
      const status = endpoint.available ? '✅' : '❌'
      logger.info(`  ${status} ${endpoint.method} ${endpoint.path} (${endpoint.status || endpoint.error})`)
    })

    logger.info('\n🎯 FASES EJECUTADAS:')
    const phases = [...new Set(this.auditLog.map(log => log.phase))]
    phases.forEach(phase => {
      const phaseLogs = this.auditLog.filter(log => log.phase === phase)
      const success = phaseLogs.some(log => log.message.includes('✅'))
      logger.info(`  ${success ? '✅' : '❌'} ${phase} (${phaseLogs.length} eventos)`)
    })

    logger.info('\n📝 SIGUIENTE PASO:')
    if (error) {
      logger.info('  ❌ Revisar signaling server y endpoints')
    } else {
      logger.info('  ✅ Probar manualmente en Doctors App (http://localhost:4001)')
      logger.info('  ✅ Verificar Patients App (http://localhost:4002)')
    }

    logger.info('\n📄 Log detallado guardado en audit-http-log.json')
    require('fs').writeFileSync('audit-http-log.json', JSON.stringify(this.auditLog, null, 2))
  }
}

async function main() {
  const auditor = new HTTPSignalingAuditor()
  await auditor.runFullAudit()
}

if (require.main === module) {
  main().catch(console.error)
}

module.exports = HTTPSignalingAuditor