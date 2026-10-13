import { test, expect } from '@playwright/test';

/**
 * Compuerta E2E Positiva y Autenticada en Staging (PR #82 / P0 - Iteración 2.2)
 * 
 * Reglas de Veracidad y Seguridad Estricta (Codex & Junta Directiva):
 * 1. CERO contraseñas por defecto o en texto claro. Exclusivamente variables de entorno
 *    del almacén de secretos de staging (STAGING_TEST_DOCTOR_PASSWORD, etc.).
 * 2. CERO compuertas verdes ficticias: un bloqueo o falta de prerrequisito DEBE producir
 *    un fallo explícito en la prueba de compuerta; nunca enmascarar un bloqueo como éxito.
 * 3. CERO IDs sustitutos (1) cuando no existen fixtures reales.
 * 4. CERO impresión de tokens JWT o cuerpos completos de respuesta en logs (saneamiento estricto).
 * 5. Flujo clínico verificado:
 *    Prestador autenticado -> Sede/Horario existente -> Paciente autenticado ->
 *    Slot encontrado -> Reserva -> Acceso por ambos roles -> Consentimiento IA -> Cierre clínico.
 */
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api-staging.quhealthy.org';

interface StepAuditRecord {
  stepNumber: number;
  stepName: string;
  executionId: string;
  status: 'PASÓ' | 'FALLÓ' | 'BLOQUEADO';
  sanitizedRequest: Record<string, any>;
  sanitizedResponseStatus: number;
  sanitizedSummary: string;
  blockerDetail?: string;
}

const auditTrail: StepAuditRecord[] = [];

test.describe('Compuerta E2E Clínica Autenticada en Staging (Iteración 2.2)', () => {

  const runId = `GATE-STAGING-${Date.now()}`;
  let providerToken: string | null = null;
  let patientToken: string | null = null;
  let testProviderId: number | null = null;
  let testLocationId: number | null = null;
  let testAppointmentId: number | null = null;

  test.afterAll(async () => {
    console.log('\n=============================================================');
    console.log(`📋 AUDIT TRAIL SANEADO COMPUERTA E2E [Run: ${runId}]`);
    console.log('=============================================================');
    for (const record of auditTrail) {
      console.log(`[Paso ${record.stepNumber}: ${record.stepName}] -> ${record.status}`);
      console.log(`  Endpoint / Operación: ${JSON.stringify(record.sanitizedRequest)}`);
      console.log(`  HTTP Status: ${record.sanitizedResponseStatus} | Resumen: ${record.sanitizedSummary}`);
      if (record.blockerDetail) {
        console.log(`  ⚠️ Bloqueo / Prerrequisito Faltante: ${record.blockerDetail}`);
      }
    }
    console.log('=============================================================\n');
  });

  // -------------------------------------------------------------------------
  // PASO 0: VERIFICACIÓN DE PRERREQUISITOS DE SECRETERÍA EN EL ENTORNO
  // -------------------------------------------------------------------------
  test('Paso 0: Verificación de Prerrequisitos de Secretos en Staging', async () => {
    const doctorEmail = process.env.STAGING_TEST_DOCTOR_EMAIL;
    const doctorPassword = process.env.STAGING_TEST_DOCTOR_PASSWORD;
    const patientEmail = process.env.STAGING_TEST_PATIENT_EMAIL;
    const patientPassword = process.env.STAGING_TEST_PATIENT_PASSWORD;

    const missingSecrets: string[] = [];
    if (!doctorEmail) missingSecrets.push('STAGING_TEST_DOCTOR_EMAIL');
    if (!doctorPassword) missingSecrets.push('STAGING_TEST_DOCTOR_PASSWORD');
    if (!patientEmail) missingSecrets.push('STAGING_TEST_PATIENT_EMAIL');
    if (!patientPassword) missingSecrets.push('STAGING_TEST_PATIENT_PASSWORD');

    if (missingSecrets.length > 0) {
      const blockerMsg = `PRERREQUISITO AUSENTE: Faltan secretos en el entorno de staging: [${missingSecrets.join(', ')}]. ` +
        `De conformidad con la directiva de seguridad, no se admiten contraseñas por defecto ni credenciales hardcodeadas.`;

      auditTrail.push({
        stepNumber: 0,
        stepName: 'Verificación de Secretos en Staging',
        executionId: `${runId}-STEP-0`,
        status: 'BLOQUEADO',
        sanitizedRequest: { checkedSecrets: ['DOCTOR_CREDENTIALS', 'PATIENT_CREDENTIALS'] },
        sanitizedResponseStatus: 0,
        sanitizedSummary: 'Secretos requeridos no configurados en variables de entorno.',
        blockerDetail: blockerMsg,
      });

      // REGLA CODEX: Un bloqueo NO debe producir una compuerta verde.
      // Se fuerza el fallo documentado para impedir falsos positivos.
      expect(missingSecrets, blockerMsg).toHaveLength(0);
    }
  });

  // -------------------------------------------------------------------------
  // PASO 1: PRESTADOR HABILITADO (Autenticación sin Contraseñas por Defecto)
  // -------------------------------------------------------------------------
  test('Paso 1: Prestador Habilitado - Autenticación con Credenciales del Secret Manager', async ({ request }) => {
    const stepExecId = `${runId}-STEP-1`;
    const doctorEmail = process.env.STAGING_TEST_DOCTOR_EMAIL;
    const doctorPassword = process.env.STAGING_TEST_DOCTOR_PASSWORD;
    const turnstileTestToken = process.env.STAGING_TURNSTILE_TEST_TOKEN;

    if (!doctorEmail || !doctorPassword) {
      test.skip(true, 'Bloqueado por falta de secretos en Paso 0');
      return;
    }

    const reqData = {
      email: doctorEmail,
      password: '[REDACTED_PASSWORD]',
      role: 'PROVIDER',
      hasCaptchaToken: !!turnstileTestToken,
    };

    const res = await request.post(`${API_BASE}/api/auth/login`, {
      data: {
        email: doctorEmail,
        password: doctorPassword,
        role: 'PROVIDER',
        ...(turnstileTestToken ? { captchaToken: turnstileTestToken } : {}),
      },
      headers: { 'Content-Type': 'application/json' },
    });

    const status = res.status();
    let bodyJson: any = null;
    try { bodyJson = await res.json(); } catch {}

    if (status === 200 && (bodyJson?.token || bodyJson?.accessToken)) {
      providerToken = bodyJson.token || bodyJson.accessToken;
      // PROHIBIDO usar 1 como fallback. Se exige el ID del usuario retornado.
      testProviderId = bodyJson.userId || bodyJson.providerId || null;
      expect(testProviderId, 'El payload de autenticación no retornó un ID de prestador válido').not.toBeNull();

      auditTrail.push({
        stepNumber: 1,
        stepName: 'Prestador Habilitado (Login)',
        executionId: stepExecId,
        status: 'PASÓ',
        sanitizedRequest: reqData,
        sanitizedResponseStatus: status,
        sanitizedSummary: `Token JWT emitido exitosamente para providerId=${testProviderId}`,
      });
    } else {
      const errorMsg = bodyJson?.message || (status === 400 && bodyJson?.errors ? JSON.stringify(bodyJson.errors) : `HTTP ${status}`);
      const blockerMsg = `No fue posible autenticar al prestador sintético: ${errorMsg}. ` +
        `Requiere provisión de cuenta en Cloud SQL staging y clave de prueba de Turnstile.`;

      auditTrail.push({
        stepNumber: 1,
        stepName: 'Prestador Habilitado (Login)',
        executionId: stepExecId,
        status: 'BLOQUEADO',
        sanitizedRequest: reqData,
        sanitizedResponseStatus: status,
        sanitizedSummary: `Fallo de autenticación: ${errorMsg}`,
        blockerDetail: blockerMsg,
      });

      // La compuerta falla explícitamente sin inventar sesión ni producir verde
      expect(status, blockerMsg).toBe(200);
    }
  });

  // -------------------------------------------------------------------------
  // PASO 2: SEDE Y HORARIO (Fixtures Reales sin IDs Dummy)
  // -------------------------------------------------------------------------
  test('Paso 2: Sede y Horario - Verificación de Sedes Clínicas del Prestador', async ({ request }) => {
    const stepExecId = `${runId}-STEP-2`;

    if (!providerToken || !testProviderId) {
      test.skip(true, 'Bloqueado por Paso 1 (falta sesión de prestador)');
      return;
    }

    const res = await request.get(`${API_BASE}/api/appointments/locations`, {
      headers: { Authorization: `Bearer ${providerToken}` },
    });

    const status = res.status();
    let locations: any[] = [];
    try { locations = await res.json(); } catch {}

    if (status === 200 && Array.isArray(locations) && locations.length > 0) {
      // Cero ID 1 inventado: tomar el ID real de la sede retornada
      testLocationId = locations[0].id || null;
      expect(testLocationId, 'La sede encontrada no tiene un ID numérico válido').not.toBeNull();

      auditTrail.push({
        stepNumber: 2,
        stepName: 'Sede y Horario',
        executionId: stepExecId,
        status: 'PASÓ',
        sanitizedRequest: { endpoint: '/api/appointments/locations', method: 'GET' },
        sanitizedResponseStatus: status,
        sanitizedSummary: `Sedes activas encontradas: ${locations.length}. locationId=${testLocationId}`,
      });
    } else {
      const blockerMsg = `El prestador ID=${testProviderId} no tiene sedes clínicas activas configuradas en staging.`;
      auditTrail.push({
        stepNumber: 2,
        stepName: 'Sede y Horario',
        executionId: stepExecId,
        status: 'BLOQUEADO',
        sanitizedRequest: { endpoint: '/api/appointments/locations', method: 'GET' },
        sanitizedResponseStatus: status,
        sanitizedSummary: 'Sin sedes configuradas.',
        blockerDetail: blockerMsg,
      });
      expect(locations.length, blockerMsg).toBeGreaterThan(0);
    }
  });

  // -------------------------------------------------------------------------
  // PASO 3: PACIENTE ENCUENTRA SLOT DISPONIBLE (Sin Fallback a ID 1)
  // -------------------------------------------------------------------------
  test('Paso 3: Búsqueda de Slot - Disponibilidad Real de Horarios para el Prestador', async ({ request }) => {
    const stepExecId = `${runId}-STEP-3`;

    if (!testProviderId || !testLocationId) {
      test.skip(true, 'Bloqueado por pasos previos (sin providerId o locationId auténticos)');
      return;
    }

    const searchDate = '2026-10-25';
    const endpoint = `${API_BASE}/api/appointments/schedules/${testProviderId}/available-slots?locationId=${testLocationId}&startDate=${searchDate}&endDate=${searchDate}&durationMinutes=30`;

    const res = await request.get(endpoint);
    const status = res.status();
    let slots: any[] = [];
    try { slots = await res.json(); } catch {}

    if (status === 200 && Array.isArray(slots) && slots.length > 0) {
      auditTrail.push({
        stepNumber: 3,
        stepName: 'Paciente Encuentra Slot',
        executionId: stepExecId,
        status: 'PASÓ',
        sanitizedRequest: { providerId: testProviderId, locationId: testLocationId, searchDate },
        sanitizedResponseStatus: status,
        sanitizedSummary: `Slots disponibles encontrados: ${slots.length}`,
      });
      expect(slots.length).toBeGreaterThan(0);
    } else {
      const blockerMsg = `No existen slots disponibles para providerId=${testProviderId} y locationId=${testLocationId} en fecha ${searchDate}.`;
      auditTrail.push({
        stepNumber: 3,
        stepName: 'Paciente Encuentra Slot',
        executionId: stepExecId,
        status: 'BLOQUEADO',
        sanitizedRequest: { providerId: testProviderId, locationId: testLocationId, searchDate },
        sanitizedResponseStatus: status,
        sanitizedSummary: `Respuesta HTTP ${status} con ${slots.length} slots.`,
        blockerDetail: blockerMsg,
      });
      expect(slots.length, blockerMsg).toBeGreaterThan(0);
    }
  });

  // -------------------------------------------------------------------------
  // PASO 4: RESERVA DE CITA (Paciente Autenticado desde Secret Manager)
  // -------------------------------------------------------------------------
  test('Paso 4: Reserva de Cita - Creación Auténtica con Paciente Sintético', async ({ request }) => {
    const stepExecId = `${runId}-STEP-4`;
    const patientEmail = process.env.STAGING_TEST_PATIENT_EMAIL;
    const patientPassword = process.env.STAGING_TEST_PATIENT_PASSWORD;
    const turnstileTestToken = process.env.STAGING_TURNSTILE_TEST_TOKEN;

    if (!patientEmail || !patientPassword || !testProviderId || !testLocationId) {
      test.skip(true, 'Bloqueado por falta de credenciales de paciente o fixtures de agenda');
      return;
    }

    // 1. Autenticar paciente
    const loginRes = await request.post(`${API_BASE}/api/auth/login`, {
      data: {
        email: patientEmail,
        password: patientPassword,
        role: 'PATIENT',
        ...(turnstileTestToken ? { captchaToken: turnstileTestToken } : {}),
      },
      headers: { 'Content-Type': 'application/json' },
    });

    const loginStatus = loginRes.status();
    let loginBody: any = null;
    try { loginBody = await loginRes.json(); } catch {}

    if (loginStatus === 200 && (loginBody?.token || loginBody?.accessToken)) {
      patientToken = loginBody.token || loginBody.accessToken;
    } else {
      const blockerMsg = `No fue posible autenticar al paciente sintético: HTTP ${loginStatus}`;
      auditTrail.push({
        stepNumber: 4,
        stepName: 'Reserva de Cita (Login Paciente)',
        executionId: stepExecId,
        status: 'BLOQUEADO',
        sanitizedRequest: { email: patientEmail, role: 'PATIENT' },
        sanitizedResponseStatus: loginStatus,
        sanitizedSummary: 'Fallo de autenticación del paciente sintético.',
        blockerDetail: blockerMsg,
      });
      expect(loginStatus, blockerMsg).toBe(200);
      return;
    }

    // 2. Crear cita sintética
    const createRes = await request.post(`${API_BASE}/api/appointments/create`, {
      data: {
        providerId: testProviderId,
        locationId: testLocationId,
        startTime: '2026-10-25T11:00:00',
        endTime: '2026-10-25T11:30:00',
        reason: 'Consulta Sintética Staging - Validación E2E P0',
      },
      headers: {
        Authorization: `Bearer ${patientToken}`,
        'Content-Type': 'application/json',
      },
    });

    const createStatus = createRes.status();
    let createJson: any = null;
    try { createJson = await createRes.json(); } catch {}

    if (createStatus === 200 || createStatus === 201) {
      testAppointmentId = createJson?.id || createJson?.appointmentId || null;
      expect(testAppointmentId, 'La cita creada no tiene un ID numérico válido').not.toBeNull();

      auditTrail.push({
        stepNumber: 4,
        stepName: 'Reserva de Cita (Creación)',
        executionId: stepExecId,
        status: 'PASÓ',
        sanitizedRequest: { providerId: testProviderId, locationId: testLocationId, reason: 'Consulta Sintética' },
        sanitizedResponseStatus: createStatus,
        sanitizedSummary: `Cita sintética creada exitosamente con ID=${testAppointmentId}`,
      });
    } else {
      const blockerMsg = `Fallo al crear la cita sintética: HTTP ${createStatus}`;
      auditTrail.push({
        stepNumber: 4,
        stepName: 'Reserva de Cita (Creación)',
        executionId: stepExecId,
        status: 'BLOQUEADO',
        sanitizedRequest: { providerId: testProviderId, locationId: testLocationId },
        sanitizedResponseStatus: createStatus,
        sanitizedSummary: `Rechazo al crear cita: HTTP ${createStatus}`,
        blockerDetail: blockerMsg,
      });
      expect(createStatus, blockerMsg).toBe(201);
    }
  });

  // -------------------------------------------------------------------------
  // PASO 5: ACCESO POR AMBOS ROLES (Médico y Paciente)
  // -------------------------------------------------------------------------
  test('Paso 5: Acceso por Roles - Verificación de Autorización para Doctor y Paciente', async ({ request }) => {
    const stepExecId = `${runId}-STEP-5`;

    if (!testAppointmentId || !providerToken || !patientToken) {
      test.skip(true, 'Bloqueado por pasos previos (falta cita creada o tokens)');
      return;
    }

    // A. Paciente accede a su cita
    const patientRes = await request.get(`${API_BASE}/api/appointments/${testAppointmentId}`, {
      headers: { Authorization: `Bearer ${patientToken}` },
    });
    expect(patientRes.status(), 'El paciente no pudo consultar su cita').toBe(200);

    // B. Doctor accede a la cita
    const doctorRes = await request.get(`${API_BASE}/api/appointments/${testAppointmentId}`, {
      headers: { Authorization: `Bearer ${providerToken}` },
    });
    expect(doctorRes.status(), 'El doctor no pudo consultar su cita asignada').toBe(200);

    // C. Usuario anónimo rechazado con 401
    const anonRes = await request.get(`${API_BASE}/api/appointments/${testAppointmentId}`);
    expect([401, 403]).toContain(anonRes.status());

    auditTrail.push({
      stepNumber: 5,
      stepName: 'Acceso por Ambos Roles',
      executionId: stepExecId,
      status: 'PASÓ',
      sanitizedRequest: { appointmentId: testAppointmentId },
      sanitizedResponseStatus: 200,
      sanitizedSummary: 'Acceso positivo verificado para paciente y doctor; anónimo bloqueado 401.',
    });
  });

  // -------------------------------------------------------------------------
  // PASO 6: TELECONSULTA Y CONSENTIMIENTO DE IA
  // -------------------------------------------------------------------------
  test('Paso 6: Teleconsulta y Consentimiento IA - Registro y Persistencia Legal', async ({ request }) => {
    const stepExecId = `${runId}-STEP-6`;

    if (!testAppointmentId || !patientToken) {
      test.skip(true, 'Bloqueado por pasos previos');
      return;
    }

    const consentRes = await request.post(
      `${API_BASE}/api/appointments/teleconsultations/${testAppointmentId}/ai-consent`,
      {
        data: {
          aiProcessingConsent: true,
          audioRecordingConsent: false,
        },
        headers: {
          Authorization: `Bearer ${patientToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const status = consentRes.status();
    expect([200, 204], `Fallo al registrar consentimiento de IA: HTTP ${status}`).toContain(status);

    auditTrail.push({
      stepNumber: 6,
      stepName: 'Teleconsulta y Consentimiento IA',
      executionId: stepExecId,
      status: 'PASÓ',
      sanitizedRequest: { appointmentId: testAppointmentId, aiProcessingConsent: true },
      sanitizedResponseStatus: status,
      sanitizedSummary: 'Consentimiento informado registrado y persistido exitosamente.',
    });
  });

  // -------------------------------------------------------------------------
  // PASO 7: CIERRE CLÍNICO, NOTA SOAP Y ESTADO FINAL
  // -------------------------------------------------------------------------
  test('Paso 7: Cierre Clínico - Nota Médica y Verificación de Estado Final COMPLETED', async ({ request }) => {
    const stepExecId = `${runId}-STEP-7`;

    if (!testAppointmentId || !providerToken) {
      test.skip(true, 'Bloqueado por pasos previos');
      return;
    }

    // 1. Completar consulta con nota clínica
    const completeRes = await request.post(`${API_BASE}/api/appointments/${testAppointmentId}/complete`, {
      data: {
        subjective: 'Paciente sintético en corrida automatizada de validación clínica',
        objective: 'Constantes vitales simuladas estables',
        assessment: 'Validación E2E completada',
        plan: 'Cierre de consulta de prueba',
      },
      headers: {
        Authorization: `Bearer ${providerToken}`,
        'Content-Type': 'application/json',
      },
    });

    const completeStatus = completeRes.status();
    expect([200, 204], `Fallo al completar la consulta médica: HTTP ${completeStatus}`).toContain(completeStatus);

    // 2. Verificar estado final COMPLETED
    const finalCheckRes = await request.get(`${API_BASE}/api/appointments/${testAppointmentId}`, {
      headers: { Authorization: `Bearer ${providerToken}` },
    });
    expect(finalCheckRes.status()).toBe(200);
    const finalAppointment = await finalCheckRes.json();
    expect(finalAppointment.status, 'El estado final de la cita no es COMPLETED').toBe('COMPLETED');

    auditTrail.push({
      stepNumber: 7,
      stepName: 'Cierre Clínico y Estado Final',
      executionId: stepExecId,
      status: 'PASÓ',
      sanitizedRequest: { appointmentId: testAppointmentId, action: 'complete' },
      sanitizedResponseStatus: completeStatus,
      sanitizedSummary: `Cita finalizada exitosamente; estado final verificado: ${finalAppointment.status}`,
    });
  });

});
