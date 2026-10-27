# BACKLOG MAESTRO DE LA STARTUP — QuHealthy (Q4 2026)

**Última actualización:** 2026-10-26 (Cierre Verificado E2E Frontend + Backend de Sprints 1, 2 y 3 + Radar Ejecutivo de las 6 Aristas en Admin Portal — Listo para Sprint 4)
**Modelo de Gobierno:** Lean Agentic OS v2 (6 Escuadrones Autónomos, Cero Burocracia Documental)
**Cobertura:** Producto, Ingeniería (Web/Backend/Mobile/IA), DevSecOps/SRE/FinOps, Marketing/Growth, Comercial/Ventas B2B, Operaciones/Customer Success/Confianza Clínica, Finanzas y Legal/Cumplimiento.

---

## 0. Línea Base: Entregas Recientes Ya en Producción (`master` / `main`)

- ✅ **`PROD-E2E-01` — Compuerta E2E Clínica en Staging sin adaptadores artificiales (`quhealthy` PR #82, #85 + `github-backend-java` PR #114)**
- ✅ **`SEC-AUTH-01` — Verificación de IP/Dispositivo Real y Turnstile en Auth (`github-backend-java` PR #114)**
- ✅ **`ADMIN-TRUST-01` — Veracidad de Auditoría y Cédula Profesional DGP en Admin Portal (`quhealthy` PR #81 / #43)**
- ✅ **`PORT-ECOSYS-01` — Cableado Real de Portales Proveedor, Laboratorio y Fundación (`quhealthy` #79, #80 + `github-backend-java` PR #114)**
- ✅ **`STREAM-SEC-01` & `CRM-GOV-01` (`quhealthy` #45, #46)**

---

## 1. Horizonte 1: Sprint 1 / P0 — ✅ COMPLETADO EN STAGING Y PRODUCCIÓN

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

- ✅ **`ENG-NOTIF-01` (P1):** Recordatorios automatizados (24h/2h antes) en `AppointmentReminderScheduler` + endpoint `POST /api/appointments/{id}/confirm` y UI de confirmación rápida (`data-testid="confirm-attendance-btn"`).
- ✅ **`ENG-CAL-01` (P1):** Sincronización bidireccional con Google Calendar (`POST /api/calendar/sync`, `DELETE /api/calendar/disconnect`), hook `useCalendarIntegration` y tests unitarios (4/4).
- ✅ **`AI-COPILOT-01` (P1):** Generación de borrador estructurado SOAP pre-consulta (`POST/GET /api/appointments/{id}/soap-draft`) y `SoapNoteDraftModal` etiquetado conforme a `NOM-004`/`NOM-024` sin auto-cierre de expediente.
- ✅ **`ENG-TELEMED-01` (P1):** Resiliencia End-to-End de videoconsulta (`LiveKit`), reconexión automática con backoff exponencial (`data-testid="telemed-reconnecting-banner"`) y sincronización de reloj.
- ✅ **`MKT-SEO-02` (P1):** Páginas programáticas ISR `/[locale]/especialistas/[specialty]/[city]` (60 combinaciones especialidad × ciudad en `sitemap.xml`, `HTTP/2 200` en Staging y Producción).
- ✅ **`MKT-CONTENT-01` (P1):** Sello de revisión médica verificada (`MedicalReviewBadge`) y JSON-LD `MedicalWebPage` (E-E-A-T / YMYL) en `/blog/[slug]`.
- ✅ **`MKT-REF-01` (P1):** Programa de referidos médico-a-médico conectado con telemetría `referral_invite_sent` libre de PII.
- ✅ **`OPS-FINOPS-01`, `OPS-SEC-02` & `OPS-DB-01` (P1):** Scripts de auditoría FinOps/Redis + IAM/GCS (`audit-gcs-iam-and-finops.sh`), verificación de backups/RLS (`verify-db-backup-and-rls-policy.sh`) y Runbook DR (`NOM-004` 5 años).
- ✅ **`OPS-CS-01`, `COM-B2B-01`, `LEG-PRIV-01` & `FIN-DATAROOM-01` (P1):** Playbook "Primera Cita en 7 Días" + Pilotos B2B, SOP Derechos ARCO/Portabilidad Clínica e Índice Maestro del Data Room Pre-Seed.

---

## 3. Horizonte 3: Sprint 3 / P2 — ✅ COMPLETADO EN STAGING Y PRODUCCIÓN (FRONTEND + BACKEND + ADMIN PORTAL 6 ARISTAS)

*Estado:* 100% implementado de punta a punta en Frontend (`quhealthy`) y Backend (`github-backend-java` commit `55a30401`), con 25 suites de pruebas en Frontend (141/141 tests en verde), suites de controlador/servicio en Backend (`NotificationControllerTest` 7/7, `CatalogSchemaInitializerTest` 2/2, `StaffControllerTest` 2/2, `ClinicalAiControllerTest` 3/3), y Radar Ejecutivo de las 6 Aristas de la Startup integrado en el Portal del Administrador (`StartupAristasRadar.tsx`).

- ✅ **`COM-ENTERPRISE-01` (P2):**
  * **Frontend:** Gestión de clínicas multi-médico con roles (`CLINIC_ADMIN`, `RECEPTIONIST`, `PHYSICIAN`, `ASSISTANT`) vía `data-testid="clinic-member-role-select"`, asignación de sucursales vía `data-testid="clinic-branch-selector"` y postulación a programas asistenciales subsidiados en `/foundation` con `data-testid="foundation-subsidy-apply-btn"`.
  * **Backend (`catalog_service`):** Extensión de `StaffRole` con deserialización case-insensitive (`@JsonCreator`), campo `branch` en `StaffMember`, `StaffRequest` y `StaffResponse`, y migración idempotente en `CatalogSchemaInitializer` compatible con `ddl-auto: validate`.
- ✅ **`AI-PULSO-01` (P2):**
  * **Frontend:** Motor asistido de detección de interacciones farmacológicas y alergias en prescripción médica (`lib/clinical/drug-interactions.ts`, banner `data-testid="rx-interaction-warning-banner"`, `NOM-004`/`NOM-024`) y componente de seguimiento longitudinal post-consulta (`LongitudinalFollowUpWidget.tsx`, `data-testid="longitudinal-followup-panel"`) montado en `/patient/dashboard`.
  * **Backend (`appointment_service`):** Endpoint `POST /api/appointments/ai/clinical-copilot/check-interactions` en `ClinicalAiController` y `ClinicalAiService` con detección de alergias cruzadas (betalactámicos, AINEs), duplicidad terapéutica e interacciones con anticoagulantes bajo guardia `NOM-024`.
- ✅ **`ENG-IOS-01` (P2):**
  * **Frontend:** Manifiesto Universal Links `/.well-known/apple-app-site-association` (`HTTP/2 200` en Staging y Producción) y cliente `services/device.service.ts`.
  * **Backend (`notification_service`):** Endpoints `POST /api/notifications/devices` y `DELETE /api/notifications/devices/{token}` en `NotificationController` y `NotificationService` persistiendo tokens APNs/FCM en `SharedConsumerRepository` y `SharedProviderRepository`.
- ✅ **`MKT-PAID-01` & `MKT-CRM-01` (P2):** Motor de atribución first-party (`utm_source`, `utm_medium`, `utm_campaign`, `gclid`, `fbclid`) auto-enlazado en `trackProviderFunnel` y `trackPatientFunnel` con guardia estricta Anti-PII (`lib/analytics/funnel-events.ts`), y motor de reactivación preventiva (`lib/crm/preventive-reactivation.ts`) conforme a `LFPDPPP`.
- ✅ **`OPS-ISO-01`, `OPS-SEC-03` & `ADMIN-RADAR-01` (P2):** Script de auditoría de aislamiento (`scripts/ops/verify-env-isolation-and-secrets.sh`), cabecera `Permissions-Policy` y rediseño ejecutivo de `TabExecutivePulse.tsx` + `StartupAristasRadar.tsx` dando visibilidad limpia y filtrable a las 6 Aristas de la Startup sin saturación visual.
- ✅ **`COM-B2B2C-01`, `LEG-COFEPRIS-01` & `FIN-SEED-01` (P2):** Playbook Enterprise B2B2C, Dossier Regulatorio COFEPRIS / NOM-024 y Plantilla Ejecutiva de Investor Update Seed.

---

## 4. Horizonte 4: Sprint 4 / P2+ — Telemetría Ejecutiva en Vivo, Conciliación CFDI 4.0, Órdenes B2B Labs y Puente Nativo iOS (Ver `SPRINT-4-PLAYBOOK.md`)

### Bloque A (`founder-cos-gov` + `product-engineering`)
- [ ] **`ADMIN-PULSE-02` (P2+):** Conectar contadores operativos en vivo desde `appointment_service` (`GET /api/appointments/admin/metrics`) hacia `StartupAristasRadar.tsx` (`signedConsentsCount`, `aiSoapDraftsCount`, `activeTreatmentPlansCount`, `b2bOrdersCount`) con selector `data-testid="arista-live-telemetry-badge"`.
- [ ] **`ENG-BILLING-01` (P2+):** Validador fiscal CFDI 4.0 SAT (`lib/fiscal/cfdi-validator.ts`) y solicitud de factura (`data-testid="cfdi-invoice-request-btn"`) + distinción de conciliación Stripe en el Admin Portal.

### Bloque B (`commercial-operations` + `product-engineering`)
- [ ] **`COM-B2B-ORDERS-01` (P2+):** Seguimiento End-to-End de órdenes clínicas B2B para Laboratorios y Proveedores (`ORDERED` -> `SAMPLE_COLLECTED` -> `RESULTS_READY`) con selector `data-testid="b2b-lab-order-status-badge"`.
- [ ] **`COM-FOUNDATION-02` (P2+):** Tablero de impacto social y trazabilidad de subsidios asistenciales en `TabFoundations.tsx` del Portal de Administrador (`data-testid="admin-foundation-impact-table"`).

### Bloque C (`data-ai-copilot` + `growth-marketing`)
- [ ] **`AI-LONGITUDINAL-02` (P2+):** Endpoint `GET /api/appointments/treatment-plans/consumer/{consumerId}/longitudinal` en `TreatmentPlanController.java` para alimentar los hitos 7/30/90/180 días del paciente.
- [ ] **`MKT-CRM-02` (P2+):** Endpoint cron `/api/internal/cron/send-preventive-reactivations` protegido por `X-CloudScheduler` en `InternalCronController.java` para disparar reactivaciones preventivas con opt-out `LFPDPPP`.

### Bloque D (`devsecops-sre` + `founder-cos-gov`)
- [ ] **`ENG-IOS-02` (P2+):** Puente nativo iOS/Android (`lib/mobile/native-bridge.ts`) para detección de `WKWebView`/Capacitor, permisos WebRTC y auto-registro Push tras login.
- [ ] **`OPS-FINOPS-02` & `FIN-SEED-02` (P2+):** Calculadora auditable de Unit Economics por consulta (`lib/finops/unit-economics-calculator.ts` integrada en `TabUnitEconomics.tsx`) y cierre documental del Sprint 4.
