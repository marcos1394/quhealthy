# SPRINT 3 PLAYBOOK — Ejecución Autónoma (Horizonte 3 / P2: Escala Enterprise, Seguimiento Longitudinal IA, Mobile Readiness y Adquisición Pagada)

Este documento define las instrucciones exactas, alcance técnico, criterios de aceptación (DoD) y orden de ejecución para que cualquier agente de IA (Antigravity, Codex, Claude Code, Cursor) ejecute el **Sprint 3 (Horizonte 3 / P2)** de **QuHealthy** bajo el **Sistema Operativo Agéntico Lean v2**, con **autonomía de Nivel 1 (🟢) y Nivel 2 (🟡)** y **cero burocracia documental**.

---

## 1. Reglas de Oro para el Agente Ejecutor

1. **PROHIBIDO escribir propuestas burocráticas previas:** No crees archivos en `proposals/`, ni carpetas `specs/` con `brief.md`, `decision.md` o `execution-mandate.md`. Ve directo al código, tests, scripts o entregables operativos.
2. **El Pull Request con CI + pruebas en verde ES el entregable:** Todo cambio en `quhealthy` (Frontend) o `github-backend-java` (Backend) debe entregarse en una rama limpia con pruebas unitarias/integración/E2E pasando, PR fusionado y despliegue verificado en Staging y Producción.
3. **Rutas de los Repositorios Locales:**
   - **Frontend (`marcos1394/quhealthy`):** `/Users/marcossandovalruiz/Documents/quhealthy` (rama principal: `master`)
   - **Backend (`marcos1394/github-backend-java`):** `/Users/marcossandovalruiz/IdeaProjects/github-backend-java` (rama principal: `main`)
   - **Operating System (`marcos1394/quhealthy-operating-system`):** `/Users/marcossandovalruiz/Documents/quhealthy-operating-system` (rama principal: `main`)
4. **Compuerta de Producción:** Nunca introduzcas una entidad JPA nueva en `github-backend-java` sin su migración/inicializador de esquema idempotente compatible con `spring.jpa.hibernate.ddl-auto: validate`.

---

## 2. Cola de Ejecución del Sprint 3 (En Orden de Prioridad)

### Bloque A — Escuadrones `product-engineering` + `data-ai-copilot` (Clínicas Multi-Médico, Seguimiento Longitudinal `Pulso` IA y Mobile iOS Readiness)

#### 1. `COM-ENTERPRISE-01` (P2): Gestión de Clínicas Multi-Médico, Sucursales y Programas Subvencionados (`/foundation`)
- **Contexto actual:** QuHealthy ya opera para médicos independientes y cuenta con el portal `/foundation`, pero necesita soportar clínicas con múltiples especialistas, recepción compartida y asignación de consultas subvencionadas.
- **Acción requerida:**
  1. Implementar/endurecer en `quhealthy` y `github-backend-java` la gestión de miembros y roles clínicos de una organización (`CLINIC_ADMIN`, `RECEPTIONIST`, `PHYSICIAN`) y selector de sucursal/consultorio con selectores `data-testid` estables (`data-testid="clinic-member-role-select"`, `data-testid="clinic-branch-selector"`, `data-testid="foundation-subsidy-apply-btn"`).
  2. Asegurar pruebas unitarias en frontend y backend validando permisos por rol y flujo de solicitud de apoyo en `/foundation`.

#### 2. `AI-PULSO-01` (P2): Seguimiento Longitudinal Post-Consulta (`HealthScore`) y Alerta de Interacciones Medicamentosas en Receta Digital
- **Contexto actual:** Tras completar la consulta y emitir la receta (`ENG-RX-01`), se requiere brindar seguimiento longitudinal al paciente crónico y asistir al médico detectando posibles interacciones o contraindicaciones antes de firmar la receta.
- **Acción requerida:**
  1. Implementar el verificador asistido de interacciones medicamentosas y alergias al redactar la prescripción médica (`data-testid="rx-interaction-warning-banner"`), etiquetado siempre como alerta de apoyo sujeta al criterio del médico tratante (`NOM-004`/`NOM-024`).
  2. Implementar el resumen de evolución longitudinal (`HealthScore` y plan de seguimiento post-consulta a 7/30/90 días) para el paciente con pruebas automatizadas.

#### 3. `ENG-IOS-01` (P2): Paridad de Contratos API Mobile iOS, Universal Links y Registro de Dispositivos Push
- **Acción requerida:**
  1. Implementar y exponer en `quhealthy` la ruta `/.well-known/apple-app-site-association` (Universal Links para citas, telemedicina y perfiles médicos) y verificar en `notification_service` / `auth_service` el contrato de registro de dispositivos móviles (`POST /api/notifications/devices`) con pruebas unitarias.

---

### Bloque B — Escuadrón `growth-marketing` (Atribución Pagada UTM/GCLID Anti-PII y Reactivación de Pacientes)

#### 4. `MKT-PAID-01` (P2): Motor de Atribución First-Party (`UTM` / `gclid` / `fbclid`) Libre de PII y Optimización SEM
- **Acción requerida en `quhealthy`:**
  1. Extender `lib/analytics/funnel-events.ts` con captura automática y persistencia first-party (`sessionStorage`) de parámetros de atribución de campañas (`utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`, `gclid`), adjuntándolos automáticamente a los eventos de conversión (`signup_provider_complete`, `booking_confirmed`) y garantizando filtrado estricto de PII en URLs.
  2. Añadir pruebas unitarias completas de atribución y sanitización de query params.

#### 5. `MKT-CRM-01` (P2): Automatización de Reactivación Preventiva de Pacientes (Check-up Anual / Control Crónico)
- **Acción requerida:**
  1. Implementar en `appointment_service` / `notification_service` y en el panel del médico/paciente la lógica de recordatorio preventivo de seguimiento (check-up a 90/180 días post-consulta) respetando `opt-out` de comunicaciones comerciales (LFPDPPP) con pruebas unitarias.

---

### Bloque C — Escuadrón `devsecops-sre` (Aislamiento de Entornos, Rotación de Secretos y Cabeceras OWASP)

#### 6. `OPS-ISO-01` (P2): Verificación Automatizada de Aislamiento Staging vs Producción y Auditoría de Secretos
- **Acción requerida en `quhealthy-operating-system` y `quhealthy`:**
  1. Crear `scripts/ops/verify-env-isolation-and-secrets.sh` para auditar que Staging y Producción mantengan aislamiento estricto de pasarelas, webhooks y variables críticas, y verificar rotación/versionado de secretos en GCP Secret Manager.

#### 7. `OPS-SEC-03` (P2): Endurecimiento y Certificación Automatizada de Cabeceras de Seguridad HTTP (OWASP)
- **Acción requerida en `quhealthy` y `quhealthy-operating-system`:**
  1. Verificar y reforzar en `next.config.ts` / middleware las cabeceras de seguridad (`Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`) y añadir prueba unitaria/integración que valide su presencia.

---

### Bloque D — Escuadrones `commercial-operations` & `founder-cos-gov` (Enterprise B2B2C, COFEPRIS y Gobierno Seed)

#### 8. `COM-B2B2C-01`, `LEG-COFEPRIS-01` & `FIN-SEED-01` (P2): Playbook Enterprise B2B2C, Dossier COFEPRIS y Reporte Investor Update
- **Acción requerida en `quhealthy-operating-system` (y espejo en `quhealthy/docs/organization/`):**
  1. Crear `docs/playbooks/03-enterprise-clinics-and-b2b2c-playbook.md` con paquetes multi-médico, convenios corporativos B2B2C y flujo operativo de `/foundation`.
  2. Crear `docs/compliance/03-cofepris-telemedicine-and-nom024-audit.md` con el dossier regulatorio de telemedicina/software médico ante COFEPRIS y lista de verificación de auditoría externa `NOM-024-SSA3-2012`.
  3. Crear `docs/finance/03-seed-investor-update-and-cohort-governance.md` con la plantilla ejecutiva mensual para inversionistas y gobierno de métricas Seed.
