# BACKLOG MAESTRO DE LA STARTUP — QuHealthy (Q4 2026)

**Última actualización:** 2026-10-26 (Cierre Verificado de Sprint 1 P0 y Sprint 2 P1; Activación de Sprint 3 P2)
**Modelo de Gobierno:** Lean Agentic OS v2 (6 Escuadrones Autónomos, Cero Burocracia Documental)
**Cobertura:** Producto, Ingeniería (Web/Backend/Mobile/IA), DevSecOps/SRE/FinOps, Marketing/Growth, Comercial/Ventas B2B, Operaciones/Customer Success/Confianza Clínica, Finanzas y Legal/Cumplimiento.

---

## 0. Línea Base: Entregas Recientes Ya en Producción (`master` / `main`)

*(Actualizado tras el cierre de la iteración 2.5.1, Sprint 1 P0 y Sprint 2 P1 — Octubre 2026)*

- ✅ **`PROD-E2E-01` — Compuerta E2E Clínica en Staging sin adaptadores artificiales (`quhealthy` PR #82, #85 + `github-backend-java` PR #114)**
- ✅ **`SEC-AUTH-01` — Verificación de IP/Dispositivo Real y Turnstile en Auth (`github-backend-java` PR #114)**
- ✅ **`ADMIN-TRUST-01` — Veracidad de Auditoría y Cédula Profesional DGP en Admin Portal (`quhealthy` PR #81 / #43)**
- ✅ **`PORT-ECOSYS-01` — Cableado Real de Portales Proveedor, Laboratorio y Fundación (`quhealthy` #79, #80 + `github-backend-java` PR #114)**
- ✅ **`STREAM-SEC-01` & `CRM-GOV-01` (`quhealthy` #45, #46)**

---

## 1. Horizonte 1: Sprint 1 / P0 — ✅ COMPLETADO EN STAGING Y PRODUCCIÓN

*Estado:* 100% fusionado y desplegado (`quhealthy` PR #86, `github-backend-java` PR #115, `quhealthy-operating-system` `main`).

- ✅ **`ENG-CAT-01` (P0):** Migración Flyway `V20__create_product_categories.sql` e inicializador idempotente `ProductCategorySchemaInitializer` con entidad `ProductCategory` activa en `catalog_service`.
- ✅ **`ENG-EHR-024-UI` (P0):** Modal interactivo `AiConsentModal` conectado a `POST/GET /api/appointments/{id}/consent` con selectores `data-testid` estables y compuerta E2E Playwright en verde.
- ✅ **`ENG-PAY-01` (P0):** Flujo E2E de Checkout, Suscripción SaaS y Stripe Connect validado con pruebas de idempotencia.
- ✅ **`ENG-RX-01` (P0):** Generación y descarga verificada de Receta Médica en PDF con datos profesionales del médico y folio único.
- ✅ **`OPS-STAGE-01` (P0):** Paridad de olas en Staging (`min-instances=0, max-instances=1`) y alias automático `staging.quhealthy.org` en CI/CD.
- ✅ **`OPS-SEC-01` (P0):** Filtro `CloudflareOriginVerificationFilter` (`X-CF-Origin-Verify`) desplegado en los microservicios.
- ✅ **`OPS-OBS-01` (P0):** Script reproducible de políticas de alerta en Cloud Monitoring (5xx > 2%, latencia P95 > 2s, fallos de contenedor).
- ✅ **`MKT-ANL-01` (P0):** Instrumentación del embudo de conversión en GA4 con guardia estricta Anti-PII (`lib/analytics/funnel-events.ts`).
- ✅ **`MKT-SEO-01` (P0):** Indexación técnica (`sitemap.ts`, `robots.ts`) y JSON-LD estructurado (`MedicalOrganization`, `Physician`, `FAQPage`).
- ✅ **`MKT-CRO-01` (P0):** Optimización de conversión de `/business` con rastreo de embudo para captación de médicos.
- ✅ **`COM-WEDGE-01` & `OPS-KYB-01` (P0):** Playbook de Cohorte Fundadora (Primeros 20 médicos) y SOP de verificación KYB SEP/DGP (< 24h SLA).
- ✅ **`LEG-NOM-01` & `FIN-UNIT-01` (P0):** Matriz Técnica-Jurídica `NOM-004`/`NOM-024`/`LFPDPPP` y Modelo de Unit Economics / Pricing Oficial.

---

## 2. Horizonte 2: Sprint 2 / P1 — ✅ COMPLETADO EN STAGING Y PRODUCCIÓN

*Estado:* 100% fusionado y desplegado (`quhealthy` PR #87 + polish en `master`/`staging`, `github-backend-java` PR #117, `quhealthy-operating-system` `606a992`).

- ✅ **`ENG-NOTIF-01` (P1):** Recordatorios automatizados (24h/2h antes) en `AppointmentReminderScheduler` + endpoint `POST /api/appointments/{id}/confirm` y UI de confirmación rápida (`data-testid="confirm-attendance-btn"`).
- ✅ **`ENG-CAL-01` (P1):** Sincronización bidireccional con Google Calendar (`POST /api/calendar/sync`, `DELETE /api/calendar/disconnect`), hook `useCalendarIntegration` y tests unitarios (4/4).
- ✅ **`AI-COPILOT-01` (P1):** Generación de borrador estructurado SOAP pre-consulta (`POST/GET /api/appointments/{id}/soap-draft`) y `SoapNoteDraftModal` etiquetado conforme a `NOM-004`/`NOM-024` sin auto-cierre de expediente.
- ✅ **`ENG-TELEMED-01` (P1):** Resiliencia End-to-End de videoconsulta (`LiveKit`), reconexión automática con backoff exponencial (`data-testid="telemed-reconnecting-banner"`) y sincronización de reloj.
- ✅ **`MKT-SEO-02` (P1):** Páginas programáticas ISR `/[locale]/especialistas/[specialty]/[city]` (30 combinaciones especialidad × ciudad en `sitemap.xml`, `HTTP/2 200` en Staging y Producción).
- ✅ **`MKT-CONTENT-01` (P1):** Sello de revisión médica verificada (`MedicalReviewBadge`) y JSON-LD `MedicalWebPage` (E-E-A-T / YMYL) en `/blog/[slug]`.
- ✅ **`MKT-REF-01` (P1):** Programa de referidos médico-a-médico conectado con telemetría `referral_invite_sent` libre de PII.
- ✅ **`OPS-FINOPS-01`, `OPS-SEC-02` & `OPS-DB-01` (P1):** Scripts de auditoría FinOps/Redis + IAM/GCS (`audit-gcs-iam-and-finops.sh`), verificación de backups/RLS (`verify-db-backup-and-rls-policy.sh`) y Runbook DR (`NOM-004` 5 años).
- ✅ **`OPS-CS-01`, `COM-B2B-01`, `LEG-PRIV-01` & `FIN-DATAROOM-01` (P1):** Playbook "Primera Cita en 7 Días" + Pilotos B2B, SOP Derechos ARCO/Portabilidad Clínica e Índice Maestro del Data Room Pre-Seed.

---

## 3. Horizonte 3: NOW (Sprint 3 / P2 — Escala Enterprise, Seguimiento Longitudinal IA, Clínicas Multi-Médico y Adquisición Pagada)

*Objetivo del Sprint 3:* Desbloquear cuentas multi-médico (clínicas y fundaciones), activar el seguimiento longitudinal post-consulta e interacciones medicamentosas con IA (`HealthScore` / `Pulso`), preparar la paridad de contratos API/Push para Mobile iOS y habilitar landing pages de alta conversión con atribución limpia para adquisición pagada.

### 🛠️ Producto e Ingeniería (`product-engineering` + `data-ai-copilot`)

| ID | Prioridad | Iniciativa / Historia de Usuario | Entregable Verificable (DoD) | Nivel Autonomía |
| :--- | :---: | :--- | :--- | :---: |
| **`COM-ENTERPRISE-01`** | **P2** | **Gestión de Clínicas Multi-Médico, Sucursales y Programas Subvencionados (`/foundation`)** | Implementar y validar en `quhealthy` y backend la gestión de múltiples sucursales/miembros clínicos por organización (roles `CLINIC_ADMIN`, `RECEPTIONIST`, `PHYSICIAN`) y el flujo de solicitud/asignación de consultas subvencionadas en `/foundation` con selectores `data-testid` y pruebas unitarias. | 🟢 Nivel 1 |
| **`AI-PULSO-01`** | **P2** | **Seguimiento Longitudinal Post-Consulta, Evolución de `HealthScore` y Alerta de Interacciones en Receta** | Implementar el módulo de seguimiento post-consulta para pacientes crónicos (plan de adherencia, recordatorio de estudios de control, delta de `HealthScore`) y validación asistida de interacciones medicamentosas al emitir receta digital, siempre bajo supervisión del médico (`NOM-004`/`NOM-024`). | 🟢 Nivel 1 |
| **`ENG-IOS-01`** | **P2** | **Paridad de Contratos API Mobile iOS, Registro de Dispositivos Push (APNs/FCM) y Deep Links** | Estandarizar y probar los endpoints de registro de tokens Push (`POST /api/notifications/devices` o equivalente), manifiesto Universal Links (`/.well-known/apple-app-site-association`) y validación de contratos JSON para la app móvil de QuHealthy. | 🟢 Nivel 1 |

### 📈 Marketing y Growth (`growth-marketing`)

| ID | Prioridad | Iniciativa / Tarea | Entregable Verificable (DoD) | Nivel Autonomía |
| :--- | :---: | :--- | :--- | :---: |
| **`MKT-PAID-01`** | **P2** | **Motor de Atribución UTM/GCLID Libre de PII y Landing Pages de Alta Intención (SEM)** | Capturar y persistir en sesión (`sessionStorage`/cookie first-party sin PII) parámetros `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `gclid` desde la entrada hasta `booking_confirmed` / `signup_provider_complete`, optimizando la velocidad y conversión en páginas de aterrizaje de campaña. | 🟢 Nivel 1 |
| **`MKT-CRM-01`** | **P2** | **Reactivación Automatizada de Pacientes (Check-up Semestral / Anual y Seguimiento Clínico)** | Implementar plantillas, reglas de elegibilidad y eventos de reactivación preventiva para pacientes sin cita en > 90/180 días, respetando preferencias de comunicación y revocación de consentimiento (LFPDPPP). | 🟢 Nivel 1 |

### 🛡️ DevSecOps, SRE y FinOps (`devsecops-sre`)

| ID | Prioridad | Iniciativa / Tarea | Entregable Verificable (DoD) | Nivel Autonomía |
| :--- | :---: | :--- | :--- | :---: |
| **`OPS-ISO-01`** | **P2** | **Verificador Automatizado de Aislamiento de Entornos (Staging vs Producción) y Guardia de Secretos** | Crear script y test automatizado (`scripts/ops/verify-env-isolation-and-secrets.sh`) que valide que ningún flujo de Staging escriba ni apunte a dominios/webhooks productivos de pagos o mensajería real, y audite la antigüedad/rotación de secretos en GCP Secret Manager. | 🟡 Nivel 2 |
| **`OPS-SEC-03`** | **P2** | **Escaneo Automatizado de Cabeceras de Seguridad HTTP (OWASP) y Dependencias Críticas** | Crear script y suite de pruebas de endurecimiento HTTP (`Content-Security-Policy`, `Strict-Transport-Security`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`) verificables contra Staging y Producción. | 🟢 Nivel 1 |

### 🤝 Comercial, Operaciones, Legal y Finanzas (`commercial-operations` + `founder-cos-gov`)

| ID | Prioridad | Iniciativa / Tarea | Entregable Verificable (DoD) | Nivel Autonomía |
| :--- | :---: | :--- | :--- | :---: |
| **`COM-B2B2C-01`** | **P2** | **Playbook Comercial de Clínicas Multi-Médico, Empresas (B2B2C) y Fundaciones Aliadas** | Documentar en `docs/playbooks/03-enterprise-clinics-and-b2b2c-playbook.md` el modelo de precios por asiento médico, acuerdo de nivel de servicio (SLA) y flujo de facturación consolidada para clínicas y empresas. | 🟢 Nivel 1 |
| **`LEG-COFEPRIS-01`** | **P2** | **Dossier de Cumplimiento Regulatorio COFEPRIS (Telemedicina / Software Médico) y Auditoría `NOM-024`** | Documentar en `docs/compliance/03-cofepris-telemedicine-and-nom024-audit.md` el expediente técnico de cumplimiento para servicios digitales de salud en México, clasificación de riesgo y controles de interoperabilidad/seguridad. | 🟢 Nivel 1 |
| **`FIN-SEED-01`** | **P2** | **Plantilla Ejecutiva de Investor Update Mensual y Tablero de Cohortes Seed** | Documentar en `docs/finance/03-seed-investor-update-and-cohort-governance.md` el formato estándar de reporte mensual a inversionistas (Burn Rate, Runway, GMV, Net Revenue, NRR, médicos activos verificados y CAC/LTV). | 🟢 Nivel 1 |
