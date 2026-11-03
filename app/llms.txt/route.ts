import { NextResponse } from 'next/server';

export const dynamic = 'force-static';

const LLMS_TEXT = `# QuHealthy - Marketplace Médico Verificado y Servidor MCP de Salud

> QuHealthy es el marketplace de salud digital y gestión clínica líder en México. Permite a agentes de inteligencia artificial y usuarios descubrir médicos especialistas con Cédula Profesional SEP auditada, cotizaciones médicas transparentes con precios finales en MXN, cálculo de QuScore™ y agendamiento directo en tiempo real conforme a la NOM-004-SSA3-2012 y COFEPRIS.

## Interfaces para Agentes de Inteligencia Artificial

- **Servidor MCP Oficial (Streamable HTTP)**:
  - Endpoint: https://api.quhealthy.org/api/v1/agent-marketplace/mcp
  - Versión del Protocolo: 2025-03-26 / 2025-11-25
  - Descriptor de Autodescubrimiento: https://www.quhealthy.org/.well-known/mcp.json
  - Manifiesto: https://api.quhealthy.org/api/v1/agent-marketplace/mcp/manifest

- **Especificación OpenAPI 3.1.0 (ChatGPT Actions)**:
  - Esquema: https://api.quhealthy.org/api/v1/agent-marketplace/openapi.json

## Herramientas MCP Disponibles (Model Context Protocol)

1. **search_medical_marketplace**:
   - *Descripción*: Busca doctores certificados, clínicas y cotizaciones médicas transparentes en México con slots de citas en tiempo real.
   - *Parámetros*: \`query\` (lenguaje natural), \`specialty\`, \`city\`, \`maxPriceMxn\`, \`requiresCertified\`, \`limit\`.

2. **get_doctor_availability_and_quote**:
   - *Descripción*: Obtiene horarios disponibles y desglose de precio de un médico especialista específico para un rango de fechas.
   - *Parámetros*: \`doctorId\` (requerido), \`serviceId\`.

3. **create_appointment_hold**:
   - *Descripción*: Genera una pre-reserva (Hold) programática de cita médica garantizada. Admite modalidad estándar en consultorio (30 min) o Garantía QuWallet (24 horas garantizadas con 10% de descuento directo en consulta).
   - *Parámetros*: \`doctorId\`, \`serviceId\`, \`dateTime\` (ISO-8601), \`patientName\`, \`patientPhone\`, \`symptoms\`, \`paymentGuaranteeMode\` ("PAY_AT_CLINIC" o "QUWALLET_GUARANTEE").

4. **attach_preconsultation_intake**:
   - *Descripción*: Adjunta la ficha clínica de pre-admisión (anamnesis inicial) conforme a la NOM-004-SSA3-2012 a una pre-reserva de cita, calculando escala de severidad y alertas de triage médico.
   - *Parámetros*: \`holdId\` o \`appointmentId\`, \`chiefComplaint\` (obligatorio), \`symptomDuration\`, \`severityScale\` (1-10), \`knownAllergies\`, \`currentMedications\`, \`chronicConditions\`.

5. **triage_symptom_to_specialty**:
   - *Descripción*: Pre-triage clínico inteligente: evalúa síntomas en lenguaje natural, calcula nivel de urgencia (EMERGENCY_ER, PRIORITY_24_48H, ROUTINE), detecta banderas rojas, sugiere preguntas de seguimiento y recomienda especialidades médicas QuHealthy con justificación clínica.
   - *Parámetros*: \`symptomsDescription\` (obligatorio), \`patientAge\`, \`biologicalSex\` ("M", "F", "OTHER"), \`city\`.

6. **verify_doctor_credentials_and_quscore**:
   - *Descripción*: Fuente de verdad regulatoria en México: audita la Cédula Profesional SEP de Licenciatura y Especialidad, estatus de aviso de funcionamiento COFEPRIS y desglose de confianza QuScore™ (credenciales académicas, puntualidad, claridad y reseñas reales).
   - *Parámetros*: \`doctorId\` (obligatorio).

## Recursos Clínicos MCP (URIs)

- \`quhealthy://catalog/specialties\`: Listado de especialidades médicas activas y auditadas en México.
- \`quhealthy://catalog/cities\`: Zonas metropolitanas con cobertura médica verificada.
- \`quhealthy://standards/regulatory\`: Marco normativo mexicano de expediente clínico (NOM-004-SSA3-2012 / NOM-024-SSA3-2012) y COFEPRIS.

## Plantillas de Prompts MCP

- \`buscar-especialista-verificado\`: Búsqueda guiada por síntoma, ciudad y presupuesto.
- \`preparar-nota-preadmision-nom004\`: Estructuración de nota clínica de pre-admisión.
- \`auditar-credenciales-medico\`: Verificación de Cédula Profesional SEP y reputación QuScore™.

## Enlaces Oficiales
- Sitio Web: https://www.quhealthy.org
- Directorio de Doctores: https://www.quhealthy.org/es/discover
- Portal para Profesionales: https://www.quhealthy.org/es/business
`;

export async function GET() {
  return new NextResponse(LLMS_TEXT, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
