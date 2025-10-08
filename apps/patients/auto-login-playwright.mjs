import { chromium } from '@playwright/test';

(async () => {
  console.log('🚀 Iniciando navegador...');
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log('📱 Navegando a http://localhost:3003/auth/login?role=patient');
    await page.goto('http://localhost:3003/auth/login?role=patient', { 
      waitUntil: 'networkidle',
      timeout: 15000
    });
    
    console.log('⏳ Esperando formulario de login...');
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    
    console.log('✍️ Llenando email: paciente.test@autamedica.test');
    await page.fill('input[type="email"]', 'paciente.test@autamedica.test');
    
    console.log('✍️ Llenando contraseña...');
    await page.fill('input[type="password"]', 'TestPaciente2025!');
    
    console.log('📸 Screenshot antes del login...');
    await page.screenshot({ path: '/tmp/antes-login.png', fullPage: true });
    console.log('   ✅ Guardado en: /tmp/antes-login.png');
    
    console.log('🔐 Haciendo click en "Iniciar Sesión"...');
    await page.click('button[type="submit"]');
    
    console.log('⏳ Esperando navegación...');
    try {
      await page.waitForURL('http://localhost:3003/', { timeout: 5000 });
      console.log('✅ Redirigido a dashboard!');
    } catch {
      console.log('⏳ Esperando 3 segundos adicionales...');
      await page.waitForTimeout(3000);
    }
    
    console.log('📸 Screenshot después del login...');
    await page.screenshot({ path: '/tmp/despues-login.png', fullPage: true });
    console.log('   ✅ Guardado en: /tmp/despues-login.png');
    
    console.log('');
    console.log('✅ ¡LOGIN COMPLETADO EXITOSAMENTE!');
    console.log('📍 URL actual:', page.url());
    console.log('');
    console.log('⏰ Manteniendo navegador abierto por 30 segundos...');
    console.log('   (Puedes verificar que el login funcionó)');
    
    await page.waitForTimeout(30000);
    
  } catch (error) {
    console.error('');
    console.error('❌ ERROR durante el login:', error.message);
    await page.screenshot({ path: '/tmp/error-login.png' });
    console.error('   📸 Screenshot de error: /tmp/error-login.png');
  } finally {
    console.log('');
    console.log('🔒 Cerrando navegador...');
    await browser.close();
    console.log('✅ Completado');
  }
})();
