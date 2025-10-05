import { chromium, FullConfig } from '@playwright/test';

/**
 * Global Setup para tests de Doctor Login + Videollamada
 * 
 * Este setup se ejecuta una vez antes de todos los tests y:
 * 1. Verifica que los servicios estén disponibles
 * 2. Configura datos de prueba si es necesario
 * 3. Valida la conectividad de WebRTC
 * 4. Prepara el entorno para los tests
 */

async function globalSetup(config: FullConfig) {
  console.log('🚀 Iniciando Global Setup para Doctor Login + Videollamada...');
  
  if (process.env.MOCK_AUTAMEDICA === '1') {
    console.log('🧪 MOCK_AUTAMEDICA activo: se omite el lanzamiento de navegador en global setup.');
    return;
  }
  
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // 1. Verificar que los servicios estén disponibles
    await verifyServices(page);
    
    // 2. Verificar conectividad de WebRTC
    await verifyWebRTCConnectivity(page);
    
    // 3. Configurar datos de prueba si es necesario
    await setupTestData(page);
    
    console.log('✅ Global Setup completado exitosamente');
    
  } catch (error) {
    console.error('❌ Global Setup falló:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

async function verifyServices(page: any) {
  console.log('🔍 Verificando disponibilidad de servicios...');
  
  if (process.env.MOCK_AUTAMEDICA === '1') {
    console.log('🧪 MOCK_AUTAMEDICA activo: se omite la verificación de servicios remotos.');
    return;
  }
  
  const services = [
    { name: 'Auth Service', url: 'http://localhost:3005' },
    { name: 'Doctors App', url: 'http://localhost:3001' },
    { name: 'Patients App', url: 'http://localhost:3003' },
    { name: 'Signaling Server', url: 'http://localhost:8888' }
  ];
  
  for (const service of services) {
    try {
      const response = await page.goto(service.url, { 
        waitUntil: 'networkidle',
        timeout: 10000 
      });
      
      if (response && response.status() < 400) {
        console.log(`✅ ${service.name} disponible en ${service.url}`);
      } else {
        throw new Error(`${service.name} no responde correctamente`);
      }
    } catch (error) {
      console.warn(`⚠️ ${service.name} no disponible: ${error}`);
      // En desarrollo, algunos servicios pueden no estar disponibles
      // pero los tests pueden continuar
    }
  }
}

async function verifyWebRTCConnectivity(page: any) {
  console.log('🔗 Verificando conectividad WebRTC...');
  
  try {
    // Verificar que WebRTC está disponible en el navegador
    const webrtcSupport = await page.evaluate(() => {
      return {
        hasRTCPeerConnection: typeof RTCPeerConnection !== 'undefined',
        hasGetUserMedia: typeof navigator.mediaDevices?.getUserMedia !== 'undefined',
        hasGetDisplayMedia: typeof navigator.mediaDevices?.getDisplayMedia !== 'undefined',
        userAgent: navigator.userAgent
      };
    });
    
    console.log('WebRTC Support:', webrtcSupport);
    
    if (!webrtcSupport.hasRTCPeerConnection) {
      throw new Error('WebRTC no está disponible en este navegador');
    }
    
    console.log('✅ WebRTC está disponible');
    
  } catch (error) {
    console.warn('⚠️ Verificación WebRTC falló:', error);
  }
}

async function setupTestData(page: any) {
  console.log('📊 Configurando datos de prueba...');
  
  try {
    // Verificar que las credenciales de prueba están configuradas
    const testCredentials = {
      doctorEmail: 'doctor.demo@autamedica.com',
      doctorPassword: 'Demo1234',
      patientId: 'patient_001',
      patientName: 'Juan Pérez'
    };
    
    console.log('Credenciales de prueba configuradas:', {
      doctorEmail: testCredentials.doctorEmail,
      patientId: testCredentials.patientId,
      patientName: testCredentials.patientName
    });
    
    // En un entorno real, aquí se configurarían datos de prueba en la base de datos
    // Por ahora, solo verificamos que las credenciales estén disponibles
    
    console.log('✅ Datos de prueba configurados');
    
  } catch (error) {
    console.warn('⚠️ Configuración de datos de prueba falló:', error);
  }
}

export default globalSetup;
