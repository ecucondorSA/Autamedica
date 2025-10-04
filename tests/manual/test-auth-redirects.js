/**
 * @fileoverview Manual Testing Script para Autenticación y Redirección
 *
 * INSTRUCCIONES DE USO:
 *
 * 1. Abrir Chrome DevTools (F12)
 * 2. Ir a la pestaña "Console"
 * 3. Copiar y pegar todo este archivo
 * 4. Ejecutar los comandos según el test que quieras realizar
 *
 * COMANDOS DISPONIBLES:
 * - testAllRedirects()        // Probar todos los redirects automáticamente
 * - testPatientRedirect()     // Solo test de paciente
 * - testDoctorRedirect()      // Solo test de doctor
 * - testCompanyRedirect()     // Solo test de empresa
 * - testAdminRedirect()       // Solo test de admin
 * - cleanupTests()            // Limpiar datos de tests
 */

// ========================================
// CONFIGURACIÓN
// ========================================

const CONFIG = {
  development: {
    auth: 'http://localhost:3000',
    patients: 'http://localhost:3003',
    doctors: 'http://localhost:3002',
    companies: 'http://localhost:3004',
    admin: 'http://localhost:3005'
  },
  production: {
    auth: 'https://auth.autamedica.com',
    patients: 'https://patients.autamedica.com',
    doctors: 'https://doctors.autamedica.com',
    companies: 'https://companies.autamedica.com',
    admin: 'https://admin.autamedica.com'
  }
}

const ENV = window.location.hostname.includes('localhost') ? 'development' : 'production'
const URLS = CONFIG[ENV]

// Test users
const TEST_USERS = {
  patient: {
    email: 'patient@dev.local',
    password: 'password123',
    expectedApp: URLS.patients,
    role: 'patient'
  },
  doctor: {
    email: 'doctor@dev.local',
    password: 'password123',
    expectedApp: URLS.doctors,
    role: 'doctor'
  },
  company: {
    email: 'company@dev.local',
    password: 'password123',
    expectedApp: URLS.companies,
    role: 'company'
  },
  admin: {
    email: 'admin@dev.local',
    password: 'password123',
    expectedApp: URLS.admin,
    role: 'admin'
  }
}

// ========================================
// UTILIDADES
// ========================================

function log(message, type = 'info') {
  const styles = {
    info: 'color: #3b82f6; font-weight: bold',
    success: 'color: #10b981; font-weight: bold',
    error: 'color: #ef4444; font-weight: bold',
    warning: 'color: #f59e0b; font-weight: bold'
  }

  console.log(`%c${message}`, styles[type])
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function getCurrentUrl() {
  return window.location.href
}

function navigateTo(url) {
  window.location.href = url
}

// ========================================
// FUNCIONES DE TESTING
// ========================================

/**
 * Test genérico de redirección para cualquier rol
 */
async function testRoleRedirect(roleName) {
  const user = TEST_USERS[roleName]

  if (!user) {
    log(`❌ Rol desconocido: ${roleName}`, 'error')
    return false
  }

  log(`\n🧪 Iniciando test de redirección para: ${roleName.toUpperCase()}`, 'info')
  log(`📧 Email: ${user.email}`)
  log(`🎯 Destino esperado: ${user.expectedApp}`)

  // Verificar que estamos en la página de login
  const currentUrl = getCurrentUrl()
  if (!currentUrl.includes('/auth/login')) {
    log('⚠️  No estás en la página de login. Redirigiendo...', 'warning')
    navigateTo(`${URLS.auth}/auth/login`)
    return false
  }

  // Simular login (esto requiere interacción manual o Supabase client)
  log('⏳ Por favor, completa el login manualmente con las credenciales mostradas arriba', 'warning')
  log(`   Email: ${user.email}`, 'info')
  log(`   Password: ${user.password}`, 'info')

  // Esperar redirección
  let attempts = 0
  const maxAttempts = 30 // 30 segundos

  const checkRedirect = setInterval(() => {
    const url = getCurrentUrl()
    attempts++

    if (url.includes(user.expectedApp)) {
      clearInterval(checkRedirect)
      log(`✅ ¡Redirección exitosa! Usuario ${roleName} redirigido a ${user.expectedApp}`, 'success')
      log(`📍 URL actual: ${url}`, 'success')
      return true
    }

    if (attempts >= maxAttempts) {
      clearInterval(checkRedirect)
      log(`❌ Timeout: No se detectó redirección después de ${maxAttempts} segundos`, 'error')
      log(`📍 URL actual: ${url}`, 'error')
      log(`🎯 URL esperada: ${user.expectedApp}`, 'error')
      return false
    }

    log(`⏳ Esperando redirección... (${attempts}/${maxAttempts})`, 'info')
  }, 1000)
}

/**
 * Test automático usando Supabase client (requiere estar autenticado)
 */
async function testRedirectWithSupabase(roleName) {
  const user = TEST_USERS[roleName]

  log(`\n🧪 Test automático de redirección para: ${roleName.toUpperCase()}`, 'info')

  try {
    // Obtener cliente de Supabase de la página
    const supabase = window.supabase || window.__supabase

    if (!supabase) {
      log('❌ Cliente de Supabase no encontrado en window', 'error')
      log('💡 Ejecuta este test desde una página que tenga Supabase cargado', 'warning')
      return false
    }

    // Login
    log('🔐 Iniciando sesión...', 'info')
    const { data, error } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: user.password
    })

    if (error) {
      log(`❌ Error en login: ${error.message}`, 'error')
      return false
    }

    log('✅ Login exitoso', 'success')

    // Verificar user_metadata
    const userData = data.user
    log(`👤 Usuario: ${userData.email}`, 'info')
    log(`🏷️  Rol en metadata: ${userData.user_metadata?.role || 'NO ASIGNADO'}`, 'info')

    // Simular callback
    log('🔄 Simulando callback de autenticación...', 'info')
    const callbackUrl = `${URLS.auth}/auth/callback?code=mock&role=${user.role}`

    log(`📍 Navegando a: ${callbackUrl}`, 'info')
    navigateTo(callbackUrl)

    // Esperar redirección
    await wait(2000)

    const finalUrl = getCurrentUrl()
    const isCorrect = finalUrl.includes(user.expectedApp)

    if (isCorrect) {
      log(`✅ ¡Test exitoso! Redirigido correctamente a ${user.expectedApp}`, 'success')
      log(`📍 URL final: ${finalUrl}`, 'success')
      return true
    } else {
      log(`❌ Redirección incorrecta`, 'error')
      log(`🎯 Esperado: ${user.expectedApp}`, 'error')
      log(`📍 Obtenido: ${finalUrl}`, 'error')
      return false
    }

  } catch (error) {
    log(`❌ Error durante el test: ${error.message}`, 'error')
    console.error(error)
    return false
  }
}

/**
 * Verificar middleware - Test de acceso no autorizado
 */
async function testMiddlewareProtection() {
  log('\n🛡️ Test de Middleware - Protección de Apps', 'info')

  const tests = [
    {
      name: 'Paciente no puede acceder a Doctors',
      loginAs: 'patient',
      tryAccess: URLS.doctors,
      shouldRedirectTo: URLS.patients
    },
    {
      name: 'Doctor no puede acceder a Patients',
      loginAs: 'doctor',
      tryAccess: URLS.patients,
      shouldRedirectTo: URLS.doctors
    }
  ]

  for (const test of tests) {
    log(`\n📋 ${test.name}`, 'info')
    log(`1️⃣  Login como: ${test.loginAs}`, 'info')
    log(`2️⃣  Intentar acceder: ${test.tryAccess}`, 'info')
    log(`3️⃣  Debería redirigir a: ${test.shouldRedirectTo}`, 'info')
    log('⏳ Ejecuta este test manualmente siguiendo los pasos', 'warning')
  }
}

/**
 * Test de preservación de returnUrl
 */
async function testReturnUrl() {
  log('\n🔗 Test de preservación de returnUrl', 'info')

  const targetPath = '/profile'
  const returnUrl = encodeURIComponent(`${URLS.patients}${targetPath}`)
  const loginUrl = `${URLS.auth}/auth/login?returnUrl=${returnUrl}`

  log(`📍 Navegando a: ${loginUrl}`, 'info')
  log(`🎯 Después del login, deberías ser redirigido a: ${URLS.patients}${targetPath}`, 'warning')

  navigateTo(loginUrl)
}

/**
 * Test de select-role para nuevos usuarios
 */
async function testRoleSelection() {
  log('\n👤 Test de selección de rol (nuevos usuarios)', 'info')
  log('📋 Pasos:', 'info')
  log('1️⃣  Registra un nuevo usuario en /auth/register', 'info')
  log('2️⃣  Deberías ver la pantalla de selección de rol', 'info')
  log('3️⃣  Selecciona un rol (ej: Patient)', 'info')
  log('4️⃣  Deberías ser redirigido a la app correspondiente', 'info')

  const registerUrl = `${URLS.auth}/auth/register`
  log(`\n📍 ¿Navegar a registro? Ejecuta: window.location.href = "${registerUrl}"`, 'warning')
}

// ========================================
// FUNCIONES DE TEST INDIVIDUALES
// ========================================

function testPatientRedirect() {
  return testRoleRedirect('patient')
}

function testDoctorRedirect() {
  return testRoleRedirect('doctor')
}

function testCompanyRedirect() {
  return testRoleRedirect('company')
}

function testAdminRedirect() {
  return testRoleRedirect('admin')
}

// ========================================
// TEST COMPLETO
// ========================================

async function testAllRedirects() {
  log('\n' + '='.repeat(60), 'info')
  log('🚀 EJECUTANDO SUITE COMPLETA DE TESTS DE REDIRECCIÓN', 'info')
  log('='.repeat(60) + '\n', 'info')

  const roles = ['patient', 'doctor', 'company', 'admin']
  const results = []

  for (const role of roles) {
    log(`\n${'─'.repeat(60)}`, 'info')
    const result = await testRoleRedirect(role)
    results.push({ role, passed: result })
    await wait(2000) // Esperar entre tests
  }

  // Resumen
  log('\n' + '='.repeat(60), 'info')
  log('📊 RESUMEN DE RESULTADOS', 'info')
  log('='.repeat(60) + '\n', 'info')

  results.forEach(({ role, passed }) => {
    const status = passed ? '✅' : '❌'
    const type = passed ? 'success' : 'error'
    log(`${status} ${role.toUpperCase()}: ${passed ? 'PASSED' : 'FAILED'}`, type)
  })

  const totalPassed = results.filter(r => r.passed).length
  const totalTests = results.length

  log(`\n📈 Total: ${totalPassed}/${totalTests} tests passed`, totalPassed === totalTests ? 'success' : 'warning')
}

// ========================================
// CLEANUP
// ========================================

async function cleanupTests() {
  log('\n🧹 Limpiando datos de tests...', 'info')

  try {
    // Limpiar localStorage
    const keysToRemove = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.includes('supabase') || key.includes('autamedica')) {
        keysToRemove.push(key)
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key))
    log(`✅ Eliminadas ${keysToRemove.length} entradas de localStorage`, 'success')

    // Limpiar sessionStorage
    sessionStorage.clear()
    log('✅ sessionStorage limpiado', 'success')

    // Logout
    const supabase = window.supabase || window.__supabase
    if (supabase) {
      await supabase.auth.signOut()
      log('✅ Sesión cerrada', 'success')
    }

    log('\n✨ Cleanup completado. Recarga la página para empezar de nuevo', 'success')

  } catch (error) {
    log(`❌ Error durante cleanup: ${error.message}`, 'error')
  }
}

// ========================================
// MENÚ DE AYUDA
// ========================================

function showHelp() {
  log('\n' + '='.repeat(60), 'info')
  log('📖 MANUAL TESTING SCRIPT - AYUDA', 'info')
  log('='.repeat(60) + '\n', 'info')

  log('COMANDOS DISPONIBLES:', 'info')
  log('', 'info')
  log('  testAllRedirects()       - Ejecutar todos los tests', 'info')
  log('  testPatientRedirect()    - Test de paciente', 'info')
  log('  testDoctorRedirect()     - Test de doctor', 'info')
  log('  testCompanyRedirect()    - Test de empresa', 'info')
  log('  testAdminRedirect()      - Test de admin', 'info')
  log('  testMiddlewareProtection() - Test de middleware', 'info')
  log('  testReturnUrl()          - Test de returnUrl', 'info')
  log('  testRoleSelection()      - Test de selección de rol', 'info')
  log('  cleanupTests()           - Limpiar datos de tests', 'info')
  log('  showHelp()               - Mostrar esta ayuda', 'info')

  log('\n📋 CREDENCIALES DE TEST:', 'info')
  log('', 'info')
  Object.entries(TEST_USERS).forEach(([role, user]) => {
    log(`  ${role.toUpperCase()}:`, 'info')
    log(`    Email: ${user.email}`, 'info')
    log(`    Password: ${user.password}`, 'info')
    log(`    Destino: ${user.expectedApp}`, 'info')
    log('', 'info')
  })

  log('🌐 URLS DEL ENTORNO:', 'info')
  log(`  Entorno: ${ENV}`, 'info')
  Object.entries(URLS).forEach(([app, url]) => {
    log(`  ${app}: ${url}`, 'info')
  })
}

// ========================================
// AUTO-EJECUCIÓN
// ========================================

log('\n' + '='.repeat(60), 'success')
log('✅ Testing Script Cargado Correctamente', 'success')
log('='.repeat(60) + '\n', 'success')

log('💡 Ejecuta showHelp() para ver todos los comandos disponibles', 'info')
log('💡 Ejecuta testAllRedirects() para iniciar los tests', 'info')

// Exponer funciones al scope global
window.testAllRedirects = testAllRedirects
window.testPatientRedirect = testPatientRedirect
window.testDoctorRedirect = testDoctorRedirect
window.testCompanyRedirect = testCompanyRedirect
window.testAdminRedirect = testAdminRedirect
window.testMiddlewareProtection = testMiddlewareProtection
window.testReturnUrl = testReturnUrl
window.testRoleSelection = testRoleSelection
window.cleanupTests = cleanupTests
window.showHelp = showHelp
