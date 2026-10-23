import { chromium } from 'playwright';

async function diagnoseStep1() {
  console.log('--- INICIANDO DIAGNÓSTICO PROFUNDO PASO 1 (STAGING LOGIN) ---');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    recordVideo: undefined,
  });
  const page = await context.newPage();

  const consoleLogs: string[] = [];
  const consoleErrors: string[] = [];
  const networkRequests: { url: string; method: string; postData?: string | null }[] = [];
  const networkResponses: { url: string; status: number }[] = [];

  page.on('console', msg => {
    const text = `[Console ${msg.type()}] ${msg.text()}`;
    consoleLogs.push(text);
    if (msg.type() === 'error') {
      consoleErrors.push(text);
    }
  });

  page.on('pageerror', err => {
    const text = `[PageError] ${err.message}`;
    consoleErrors.push(text);
  });

  page.on('request', req => {
    networkRequests.push({
      url: req.url(),
      method: req.method(),
    });
  });

  page.on('response', resp => {
    networkResponses.push({
      url: resp.url(),
      status: resp.status(),
    });
  });

  console.log('1. Navegando a https://staging.quhealthy.org/es/login...');
  await page.goto('https://staging.quhealthy.org/es/login', { waitUntil: 'networkidle' });

  // Inspeccionar Sitekey en DOM y variables
  const turnstileElements = await page.evaluate(() => {
    const iframes = Array.from(document.querySelectorAll('iframe')).map(f => ({
      src: f.src,
      title: f.title,
      name: f.name,
      id: f.id,
    }));
    const turnstileDivs = Array.from(document.querySelectorAll('[data-sitekey], .cf-turnstile')).map(d => ({
      className: d.className,
      sitekey: d.getAttribute('data-sitekey'),
      action: d.getAttribute('data-action'),
      size: d.getAttribute('data-size'),
    }));
    const hasTurnstileObj = typeof (window as any).turnstile !== 'undefined';
    let turnstileVersion = null;
    if (hasTurnstileObj) {
      try {
        turnstileVersion = Object.keys((window as any).turnstile);
      } catch (e: any) {
        turnstileVersion = e.message;
      }
    }
    return {
      iframes,
      turnstileDivs,
      hasTurnstileObj,
      turnstileKeys: turnstileVersion,
    };
  });

  console.log('2. Elementos Turnstile detectados en DOM:');
  console.log(JSON.stringify(turnstileElements, null, 2));

  // Inspeccionar estado de inputs y botón antes de llenar
  const emailInput = page.locator('input[type="email"], input[name="email"]').first();
  const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
  const submitButton = page.locator('button[type="submit"]').first();

  console.log('3. Estado inicial del botón submit:');
  console.log({
    visible: await submitButton.isVisible(),
    enabled: await submitButton.isEnabled(),
    text: await submitButton.innerText(),
    disabledAttr: await submitButton.getAttribute('disabled'),
  });

  // Validar y obtener credenciales de entorno (sin valores fijos en código)
  const patientEmail = process.env.STAGING_TEST_PATIENT_EMAIL;
  const patientPassword = process.env.STAGING_TEST_PATIENT_PASSWORD;
  if (!patientEmail || !patientPassword) {
    throw new Error('Variables STAGING_TEST_PATIENT_EMAIL o STAGING_TEST_PATIENT_PASSWORD no definidas en el entorno.');
  }

  // Llenar formulario
  console.log('4. Llenando campos...');
  await emailInput.fill(patientEmail);
  await passwordInput.fill(patientPassword);

  console.log('5. Estado del botón tras llenar campos:');
  console.log({
    enabled: await submitButton.isEnabled(),
    disabledAttr: await submitButton.getAttribute('disabled'),
  });

  // Capturar pantalla previa al click
  await page.screenshot({ path: '/tmp/staging-login-before-click.png' });

  // Cerrar banners flotantes si existen para evitar bloqueo de pointer events
  const cookieAcceptBtn = page.locator('button:has-text("Aceptar todas")').first();
  if (await cookieAcceptBtn.isVisible()) {
    console.log('  [Banner] Aceptando cookies...');
    await cookieAcceptBtn.click();
  }

  const dismissLocationBtn = page.locator('button:has-text("Ahora no")').first();
  if (await dismissLocationBtn.isVisible()) {
    console.log('  [Banner] Descartando modal de ubicación...');
    await dismissLocationBtn.click();
  }

  // Hacer click en submit
  console.log('6. Clickeando botón submit...');
  await submitButton.click();

  // Esperar 4 segundos para observar solicitudes disparadas
  await page.waitForTimeout(4000);

  // Capturar pantalla posterior al click
  await page.screenshot({ path: '/tmp/staging-login-after-click.png' });

  // Inspeccionar estado tras click
  console.log('7. Estado del botón tras click:');
  console.log({
    enabled: await submitButton.isEnabled(),
    disabledAttr: await submitButton.getAttribute('disabled'),
  });

  // Inspeccionar si Turnstile generó token o llamó callback
  const tokenGenerated = await page.evaluate(() => {
    const inputResponse = document.querySelector('input[name="cf-turnstile-response"]') as HTMLInputElement;
    return {
      hasInputResponse: !!inputResponse,
      inputValueLength: inputResponse ? inputResponse.value.length : 0,
    };
  });
  console.log('8. Token Turnstile generado en input oculto:', tokenGenerated);

  // Filtrar peticiones de autenticación
  const authRequests = networkRequests.filter(r => r.url.includes('/api/auth') || r.url.includes('auth'));
  console.log('9. Peticiones de red hacia Auth:');
  console.log(JSON.stringify(authRequests, null, 2));

  console.log('10. Errores de consola registrados:');
  console.log(JSON.stringify(consoleErrors, null, 2));

  await browser.close();
  console.log('--- DIAGNÓSTICO FINALIZADO ---');
}

diagnoseStep1().catch(err => {
  console.error('Error durante diagnóstico:', err);
  process.exit(1);
});
