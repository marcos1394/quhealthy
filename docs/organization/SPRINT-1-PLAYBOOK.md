# SPRINT 1 PLAYBOOK — Ejecución Autónoma (Horizonte 1 / P0)

Este documento define las instrucciones exactas, alcance técnico, criterios de aceptación (DoD) y orden de ejecución para que cualquier agente de IA (Antigravity, Codex, Claude Code, Cursor) ejecute el **Sprint 1 (P0)** de **QuHealthy** con **autonomía de Nivel 1 (🟢) y Nivel 2 (🟡)** y **cero burocracia documental**.

---

## 1. Reglas de Oro para el Agente Ejecutor

1. **PROHIBIDO escribir propuestas burocráticas previas:** No crees archivos en `proposals/`, ni carpetas `specs/` con `brief.md`, `decision.md` o `execution-mandate.md`. Ve directo al código, tests, scripts o entregables operativos.
2. **El Pull Request con CI + pruebas en verde ES el entregable:** Todo cambio en `quhealthy` (Frontend) o `github-backend-java` (Backend) debe entregarse en una rama limpia con pruebas unitarias/integración/E2E pasando y PR abierto (o listo para merge si CI está 100% verde).
3. **Rutas de los Repositorios Locales:**
   - **Frontend (`marcos1394/quhealthy`):** `/Users/marcossandovalruiz/Documents/quhealthy` (rama principal: `master`)
   - **Backend (`marcos1394/github-backend-java`):** `/Users/marcossandovalruiz/IdeaProjects/github-backend-java` (rama principal: `main`)
   - **Operating System (`marcos1394/quhealthy-operating-system`):** `/Users/marcossandovalruiz/Documents/quhealthy-operating-system` (rama principal: `main`)
4. **Compuerta de Producción:** Nunca introduzcas una entidad JPA nueva en `github-backend-java` sin su migración Flyway correspondiente aplicada o validada, ya que los servicios corren con `spring.jpa.hibernate.ddl-auto: validate`.

---

## 2. Cola de Ejecución del Sprint 1 (En Orden de Prioridad)

### Bloque A — Escuadrón `product-engineering` (Producto, Frontend & Backend)

#### 1. `ENG-EHR-024-UI` (P0): Modal e Interfaz Visual de Consentimiento Informado (`HU-EHR-024`)
- **Contexto actual:** El backend (`appointment_service`) ya expone `POST /api/appointments/{id}/consent` y `GET /api/appointments/{id}/consent`, y la ficha documental vive en `quhealthy/docs/hus/HU-EHR-024.md`. Actualmente la prueba E2E (`quhealthy/e2e/staging-clinical-gate.spec.ts`) valida el consentimiento por API porque faltaba el flujo visual en UI.
- **Acción requerida:**
  1. En `quhealthy`, implementar/conectar el modal o paso de firma de **Consentimiento Informado** dentro del flujo de cita/consulta (con selectores estables `data-testid="consent-modal"`, `data-testid="consent-accept-checkbox"`, `data-testid="consent-submit-btn"` y estado `data-testid="consent-verified-badge"`).
  2. Asegurar que invoque los endpoints reales de `appointment_service` a través del servicio frontend correspondiente sin mocks.
  3. Actualizar `quhealthy/e2e/staging-clinical-gate.spec.ts` para que el consentimiento se firme pulsando la UI real en lugar de sólo por API.

#### 2. `ENG-CAT-01` (P0): Migración Flyway `catalog_product_categories` y Activación en `catalog_service`
- **Contexto actual:** En el PR #113 de `github-backend-java` se diseñó la entidad `ProductCategory.java` (`@Table(name = "catalog_product_categories")`), pero se postergó su merge a `main` porque la tabla aún no existía en PostgreSQL (`quhealthy-staging` y `quhealthy-backend`).
- **Acción requerida:**
  1. Crear la migración Flyway `catalog_service/src/main/resources/db/migration/V2__create_catalog_product_categories.sql` (verificando numeración correlativa en `catalog_service`) con índices y constraints completos.
  2. Reincorporar `ProductCategory.java`, repositorio, servicio y controlador con pruebas de integración (`@DataJpaTest` / `@SpringBootTest`) que validen el esquema con `ddl-auto: validate`.

#### 3. `ENG-RX-01` (P0): Generación y Descarga Verificada de Receta Médica en PDF
- **Acción requerida:**
  1. Verificar el flujo post-consulta cuando el médico completa la cita con medicamentos (`prescriptionItems`).
  2. Garantizar que el paciente y el médico puedan visualizar/descargar la receta con nombre del médico, especialidad, cédula profesional verificada, fecha, diagnóstico/indicaciones y medicamentos, añadiendo test automatizado.

#### 4. `ENG-PAY-01` (P0): Certificación E2E de Checkout y Suscripción SaaS (Stripe Test Mode)
- **Acción requerida:**
  1. Verificar en `payment_service` y el frontend de checkout la creación de sesiones/intentos de pago para citas y suscripciones SaaS de doctores, validando idempotencia de webhooks y transición de estado de cita.

---

### Bloque B — Escuadrón `growth-marketing` (SEO, Analítica de Embudo y CRO)

#### 5. `MKT-SEO-01` (P0): Indexación Técnica y Datos Estructurados (`Schema.org`)
- **Acción requerida en `quhealthy`:**
  1. Auditar y corregir `app/sitemap.ts` y `app/robots.ts` para asegurar que todas las rutas públicas de alto valor (`/`, `/business`, perfiles públicos de médicos y especialidades) sean indexables y que las rutas privadas (`/patient/*`, `/provider/*`, `/corporate/*`) estén excluidas limpiamente.
  2. Inyectar JSON-LD estructurado (`Physician`, `MedicalClinic`, `MedicalSpecialty`, `FAQPage`) y metadatos OpenGraph/Canonical dinámicos.

#### 6. `MKT-ANL-01` (P0): Instrumentación de Embudos en GA4 (Cero PII)
- **Acción requerida en `quhealthy`:**
  1. Crear un helper tipado de telemetría/GA4 (`lib/analytics/funnel-events.ts`) con guardia estricta anti-PII (prohibido enviar nombres, correos, teléfonos o notas clínicas).
  2. Instrumentar los eventos clave:
     - **Embudo Doctores:** `view_business_landing`, `signup_provider_start`, `signup_provider_complete`, `kyb_submitted`.
     - **Embudo Pacientes:** `search_specialty`, `view_provider_profile`, `booking_initiated`, `booking_confirmed`.

#### 7. `MKT-CRO-01` (P0): Optimización de Conversión en `/business`
- **Acción requerida en `quhealthy`:**
  1. Alinear los copys, tabla de beneficios y CTAs de `/business` con las funcionalidades 100% reales en producción y conectar el formulario de contacto B2B con el endpoint real de captura de leads del CRM corporativo (`/api/admin/crm/leads`).

---

### Bloque C — Escuadrón `devsecops-sre` (Cloud Run, Cloudflare, Staging & Observabilidad)

#### 8. `OPS-STAGE-01` (P0): Automatización del Alias `staging.quhealthy.org` y Olas de Staging
- **Acción requerida:**
  1. Asegurar en el workflow de GitHub Actions de `quhealthy` que los despliegues de staging actualicen automáticamente el alias `staging.quhealthy.org`.
  2. Estandarizar los workflows `staging-wave*.yml` en `github-backend-java` para que siempre enruten el 100% del tráfico a la última revisión (`--to-latest`) y conserven `min-instances=0, max-instances=1`.

#### 9. `OPS-SEC-01` (P0): Autenticación de Origen Cloudflare → Cloud Run (`PORT-D-01`)
- **Acción requerida:**
  1. Implementar en `shared-libs` / filtro de seguridad de `github-backend-java` un verificador configurable (`security.origin-verify.enabled` + header secreto `X-QH-Origin-Secret`) para que, una vez activado detrás del Worker de Cloudflare (`api.quhealthy.org`), cualquier petición directa a `*.run.app` sin el header sea rechazada con HTTP 403 (exceptuando `/actuator/health` si aplica para sondas internas).

#### 10. `OPS-OBS-01` (P0): Alertas Críticas 5xx y Latencia en Cloud Monitoring
- **Acción requerida:**
  1. Preparar y aplicar (o dejar script reproducible `scripts/ops/setup-gcp-monitoring-alerts.sh`) las políticas de alerta para tasa de errores 5xx y latencia P95 en `quhealthy-backend`.

---

### Bloque D — Escuadrones `commercial-operations` & `founder-cos-gov` (Go-To-Market, KYB, Unit Economics y Legal)

#### 11. `COM-WEDGE-01` & `OPS-KYB-01` (P0): Playbook de Cohorte Fundadora (Primeros 20 Doctores) y SLA KYB < 24h
- **Acción requerida en `quhealthy-operating-system`:**
  1. Crear `docs/playbooks/01-founder-cohort-sales-and-kyb-playbook.md` con el guion comercial para médicos especialistas en México, oferta de lanzamiento (onboarding asistido + primeros meses sin costo fijo SaaS, cobrando sólo por transacción procesada), checklist de validación de Cédula Profesional ante la DGP en `/verification` y protocolo de activación en menos de 24 horas.

#### 12. `FIN-UNIT-01` & `LEG-NOM-01` (P0): Unit Economics Oficiales y Matriz Técnica-Jurídica `NOM-004`/`NOM-024`/`LFPDPPP`
- **Acción requerida en `quhealthy-operating-system`:**
  1. Crear `docs/finance/01-unit-economics-and-pricing-matrix.md` con las fórmulas exactas de margen por cita y suscripción SaaS descontando Stripe (3.6% + $3 MXN + IVA) y costos marginales cloud.
  2. Crear `docs/compliance/01-nom004-nom024-lfpdppp-technical-matrix.md` mapeando cada requisito normativo contra los módulos reales de `appointment_service`, `auth_service` y `quhealthy`, señalando controles implementados y brechas restantes.
