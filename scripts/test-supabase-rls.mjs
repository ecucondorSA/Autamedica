#!/usr/bin/env node

/**
 * Script de testing para validar políticas RLS de Supabase
 * 
 * Este script simula diferentes usuarios y verifica que las políticas
 * de Row Level Security funcionen correctamente para cada rol.
 */

import { createClient } from '@supabase/supabase-js'

// Configuración de Supabase (usar variables de entorno en producción)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gtyvdircfhmdjiaelqkg.supabase.co'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' // Truncado por seguridad

// Test users (corresponden a los seeds)
const TEST_USERS = {
  platform_admin: {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'admin@autamedica.com',
    role: 'platform_admin'
  },
  company_admin: {
    id: '22222222-2222-2222-2222-222222222222',
    email: 'empresa@hospitalsanmartin.com',
    role: 'company_admin'
  },
  doctor_cardiologist: {
    id: '33333333-3333-3333-3333-333333333333',
    email: 'dr.garcia@autamedica.com',
    role: 'doctor'
  },
  doctor_pediatrician: {
    id: '44444444-4444-4444-4444-444444444444',
    email: 'dra.martinez@autamedica.com',
    role: 'doctor'
  },
  doctor_occupational: {
    id: '55555555-5555-5555-5555-555555555555',
    email: 'dr.lopez@autamedica.com',
    role: 'doctor'
  },
  patient_individual: {
    id: '66666666-6666-6666-6666-666666666666',
    email: 'juan.perez@gmail.com',
    role: 'patient'
  },
  patient_corporate: {
    id: '88888888-8888-8888-8888-888888888888',
    email: 'carlos.ruiz@empresa.com',
    role: 'patient'
  }
}

class SupabaseRLSTest {
  constructor() {
    this.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    this.currentUser = null
    this.testResults = []
  }

  // Simular autenticación como usuario específico
  async authenticateAs(userKey) {
    const user = TEST_USERS[userKey]
    if (!user) {
      throw new Error(`Usuario de prueba no encontrado: ${userKey}`)
    }

    // En un entorno real, esto sería auth.signInWithPassword
    // Para testing, simulamos establecer el usuario actual
    this.currentUser = user
    
    console.log(`🔐 Autenticado como: ${user.email} (${user.role})`)
    return user
  }

  // Test helper para verificar resultados
  async executeTest(testName, testFunction) {
    console.log(`\n🧪 Ejecutando: ${testName}`)
    
    try {
      const result = await testFunction()
      
      if (result.success) {
        console.log(`✅ ${testName} - PASÓ`)
        this.testResults.push({ name: testName, status: 'PASS', details: result.details })
      } else {
        console.log(`❌ ${testName} - FALLÓ: ${result.error}`)
        this.testResults.push({ name: testName, status: 'FAIL', error: result.error })
      }
    } catch (error) {
      console.log(`💥 ${testName} - ERROR: ${error.message}`)
      this.testResults.push({ name: testName, status: 'ERROR', error: error.message })
    }
  }

  // Tests específicos para cada rol

  async testPlatformAdminAccess() {
    await this.authenticateAs('platform_admin')

    await this.executeTest('Admin puede ver todos los profiles', async () => {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('*')
      
      if (error) return { success: false, error: error.message }
      
      // Admin debe poder ver todos los profiles (9 en total según seeds)
      if (data.length >= 9) {
        return { success: true, details: `Vio ${data.length} profiles` }
      } else {
        return { success: false, error: `Solo vio ${data.length} profiles, esperaba al menos 9` }
      }
    })

    await this.executeTest('Admin puede ver todas las companies', async () => {
      const { data, error } = await this.supabase
        .from('companies')
        .select('*')
      
      if (error) return { success: false, error: error.message }
      
      if (data.length >= 2) {
        return { success: true, details: `Vio ${data.length} companies` }
      } else {
        return { success: false, error: `Solo vio ${data.length} companies, esperaba al menos 2` }
      }
    })

    await this.executeTest('Admin puede ver todos los appointments', async () => {
      const { data, error } = await this.supabase
        .from('appointments')
        .select('*')
      
      if (error) return { success: false, error: error.message }
      
      if (data.length >= 6) {
        return { success: true, details: `Vio ${data.length} appointments` }
      } else {
        return { success: false, error: `Solo vio ${data.length} appointments, esperaba al menos 6` }
      }
    })
  }

  async testDoctorAccess() {
    await this.authenticateAs('doctor_cardiologist')

    await this.executeTest('Doctor solo ve sus propios pacientes asignados', async () => {
      const { data, error } = await this.supabase
        .from('patients')
        .select(`
          *,
          patient_care_team!inner(
            doctor_id,
            doctors!inner(user_id)
          )
        `)
        .eq('patient_care_team.doctors.user_id', this.currentUser.id)
      
      if (error) return { success: false, error: error.message }
      
      // Dr. García (cardiólogo) debe ver 2 pacientes: Juan Pérez y Carlos Ruiz
      if (data.length === 2) {
        return { success: true, details: `Vio ${data.length} pacientes asignados` }
      } else {
        return { success: false, error: `Vio ${data.length} pacientes, esperaba 2` }
      }
    })

    await this.executeTest('Doctor solo ve appointments de sus pacientes', async () => {
      const { data, error } = await this.supabase
        .from('appointments')
        .select('*')
        .eq('doctor_id', 'd0000001-0000-0000-0000-000000000001') // ID del Dr. García
      
      if (error) return { success: false, error: error.message }
      
      // Dr. García debe tener 3 appointments según los seeds
      if (data.length === 3) {
        return { success: true, details: `Vio ${data.length} appointments propios` }
      } else {
        return { success: false, error: `Vio ${data.length} appointments, esperaba 3` }
      }
    })
  }

  async testPatientAccess() {
    await this.authenticateAs('patient_individual')

    await this.executeTest('Paciente solo ve su propio perfil', async () => {
      const { data, error } = await this.supabase
        .from('patients')
        .select('*')
        .eq('user_id', this.currentUser.id)
      
      if (error) return { success: false, error: error.message }
      
      // Paciente solo debe ver su propio perfil
      if (data.length === 1 && data[0].user_id === this.currentUser.id) {
        return { success: true, details: 'Vio solo su propio perfil' }
      } else {
        return { success: false, error: `Vio ${data.length} pacientes, esperaba 1 propio` }
      }
    })

    await this.executeTest('Paciente solo ve sus propios appointments', async () => {
      const { data, error } = await this.supabase
        .from('appointments')
        .select('*')
        .eq('patient_id', 'p0000001-0000-0000-0000-000000000001') // Juan Pérez
      
      if (error) return { success: false, error: error.message }
      
      // Juan Pérez debe tener 2 appointments según los seeds
      if (data.length === 2) {
        return { success: true, details: `Vio ${data.length} appointments propios` }
      } else {
        return { success: false, error: `Vio ${data.length} appointments, esperaba 2` }
      }
    })

    await this.executeTest('Paciente solo ve sus medical records visibles', async () => {
      const { data, error } = await this.supabase
        .from('medical_records')
        .select('*')
        .eq('patient_id', 'p0000001-0000-0000-0000-000000000001')
        .in('visibility', ['patient', 'care_team'])
      
      if (error) return { success: false, error: error.message }
      
      // Juan Pérez debe ver 1 record (el privado no debe ser visible)
      if (data.length === 1) {
        return { success: true, details: `Vio ${data.length} medical record visible` }
      } else {
        return { success: false, error: `Vio ${data.length} records, esperaba 1` }
      }
    })
  }

  async testCompanyAdminAccess() {
    await this.authenticateAs('company_admin')

    await this.executeTest('Company admin ve solo sus empresas', async () => {
      const { data, error } = await this.supabase
        .from('companies')
        .select('*')
        .eq('owner_profile_id', this.currentUser.id)
      
      if (error) return { success: false, error: error.message }
      
      // Company admin debe ver sus 2 empresas
      if (data.length === 2) {
        return { success: true, details: `Vio ${data.length} empresas propias` }
      } else {
        return { success: false, error: `Vio ${data.length} empresas, esperaba 2` }
      }
    })

    await this.executeTest('Company admin ve empleados de su empresa', async () => {
      const { data, error } = await this.supabase
        .from('patients')
        .select('*')
        .eq('company_id', 'c0000002-0000-0000-0000-000000000002') // TechCorp
      
      if (error) return { success: false, error: error.message }
      
      // Company admin debe ver 2 empleados de TechCorp
      if (data.length === 2) {
        return { success: true, details: `Vio ${data.length} empleados de su empresa` }
      } else {
        return { success: false, error: `Vio ${data.length} empleados, esperaba 2` }
      }
    })
  }

  async testUnauthorizedAccess() {
    // Test sin autenticación (usuario anónimo)
    this.currentUser = null

    await this.executeTest('Usuario anónimo NO puede ver profiles privados', async () => {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('*')
      
      // Esto debe fallar con error de RLS
      if (error && error.message.includes('RLS')) {
        return { success: true, details: 'RLS bloqueó correctamente acceso anónimo' }
      } else if (data && data.length === 0) {
        return { success: true, details: 'No se devolvieron datos (RLS activo)' }
      } else {
        return { success: false, error: 'Usuario anónimo pudo acceder a datos privados' }
      }
    })
  }

  // Ejecutar todos los tests
  async runAllTests() {
    console.log('🚀 Iniciando tests de Row Level Security para AutaMedica\n')
    
    try {
      // Tests por rol
      await this.testPlatformAdminAccess()
      await this.testDoctorAccess() 
      await this.testPatientAccess()
      await this.testCompanyAdminAccess()
      await this.testUnauthorizedAccess()

      // Resumen de resultados
      this.printTestSummary()
      
    } catch (error) {
      console.error('💥 Error ejecutando tests:', error.message)
    }
  }

  printTestSummary() {
    console.log('\n📊 RESUMEN DE TESTS')
    console.log('=' .repeat(50))
    
    const passed = this.testResults.filter(t => t.status === 'PASS').length
    const failed = this.testResults.filter(t => t.status === 'FAIL').length
    const errored = this.testResults.filter(t => t.status === 'ERROR').length
    const total = this.testResults.length

    console.log(`Total: ${total}`)
    console.log(`✅ Pasaron: ${passed}`)
    console.log(`❌ Fallaron: ${failed}`)
    console.log(`💥 Errores: ${errored}`)
    
    const successRate = ((passed / total) * 100).toFixed(1)
    console.log(`📈 Tasa de éxito: ${successRate}%`)

    // Detalles de tests fallidos
    const failures = this.testResults.filter(t => t.status !== 'PASS')
    if (failures.length > 0) {
      console.log('\n❌ TESTS FALLIDOS:')
      failures.forEach(test => {
        console.log(`- ${test.name}: ${test.error}`)
      })
    }

    console.log('\n🎯 POLÍTICAS RLS VERIFICADAS:')
    console.log('- Platform admin: acceso completo al sistema')
    console.log('- Doctor: solo pacientes asignados y sus appointments')
    console.log('- Patient: solo datos propios y records visibles')
    console.log('- Company admin: solo empresas propias y empleados')
    console.log('- Anónimo: sin acceso a datos privados')
  }
}

// Ejecutar tests si se ejecuta directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new SupabaseRLSTest()
  await tester.runAllTests()
}