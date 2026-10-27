# BACKLOG MAESTRO DE LA STARTUP — QuHealthy (Q4 2026)

**Última actualización:** 2026-10-26 (Cierre Verificado de Sprints 1, 2 y 3 — Despliegue Exitoso en Staging y Producción)
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

## 3. Horizonte 3: Sprint 3 / P2 — ✅ COMPLETADO EN STAGING Y PRODUCCIÓN

*Estado:* 100% implementado, con 25 suites de pruebas unitarias/integración (140/140 tests en verde), CI/CD exitoso (`Enterprise Frontend CI/CD` Runs `40435771060` y `40435772763`) y verificado en vivo vía HTTP/2.

- ✅ **`COM-ENTERPRISE-01` (P2):** Gestión de clínicas multi-médico con roles (`CLINIC_ADMIN`, `RECEPTIONIST`, `PHYSICIAN`, `ASSISTANT`) vía `data-testid="clinic-member-role-select"`, asignación de sucursales vía `data-testid="clinic-branch-selector"` y postulación a programas asistenciales subsidiados en `/foundation` con `data-testid="foundation-subsidy-apply-btn"`.
- ✅ **`AI-PULSO-01` (P2):** Motor asistido de detección de interacciones farmacológicas y alergias en prescripción médica (`lib/clinical/drug-interactions.ts`, banner `data-testid="rx-interaction-warning-banner"`, NOM-004/NOM-024) y componente de seguimiento longitudinal post-consulta (`LongitudinalFollowUpWidget.tsx`, `data-testid="longitudinal-followup-panel"`).
- ✅ **`ENG-IOS-01` (P2):** Manifiesto Universal Links `/.well-known/apple-app-site-association` (`HTTP/2 200` en Staging y Producción) y servicio de registro de dispositivos móviles Push APNs/FCM (`services/device.service.ts`).
- ✅ **`MKT-PAID-01` (P2):** Motor de atribución first-party de campañas (`utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `gclid`, `fbclid`) con persistencia en sesión, enlace a conversiones y guardia Anti-PII estricta (`lib/analytics/funnel-events.ts`).
- ✅ **`MKT-CRM-01` (P2):** Motor de reactivación preventiva de pacientes (`lib/crm/preventive-reactivation.ts`) para chequeos a 90/180/365 días con cláusula estricta de opt-out conforme a LFPDPPP.
- ✅ **`OPS-ISO-01` & `OPS-SEC-03` (P2):** Script ejecutable de auditoría de aislamiento de entornos (`scripts/ops/verify-env-isolation-and-secrets.sh`, 0 fugas detectadas) y endurecimiento de cabeceras HTTP OWASP (`Permissions-Policy: camera=(self), microphone=(self), geolocation=()`).
- ✅ **`COM-B2B2C-01`, `LEG-COFEPRIS-01` & `FIN-SEED-01` (P2):** Playbook Enterprise B2B2C (`03-enterprise-clinics-and-b2b2c-playbook.md`), Dossier Regulatorio COFEPRIS / NOM-024 (`03-cofepris-telemedicine-and-nom024-audit.md`) y Plantilla Ejecutiva de Investor Update Seed (`03-seed-investor-update-and-cohort-governance.md`).

---

## 4. Próxima Fase: Crecimiento Continuo, Escalado y Expansión Operativa

1. **Expansión Comercial Activa (Nivel 3 🔴):** Inicio de contacto formal con las primeras clínicas multi-médico y convenios B2B con aseguradoras bajo los playbooks establecidos.
2. **Monitoreo Continuo Cloud & FinOps:** Supervisión de latencia P95 y cuotas de base de datos en Supabase y GCP Cloud Run.
3. **App Mobile Nativa iOS (TestFlight):** Empaquetado y distribución de la app nativa consumiendo los Universal Links y contratos Push unificados.
