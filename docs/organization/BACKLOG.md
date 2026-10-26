# BACKLOG MAESTRO DE LA STARTUP — QuHealthy (Q4 2026)

**Última actualización:** 2026-10-26
**Modelo de Gobierno:** Lean Agentic OS v2 (6 Escuadrones Autónomos, Cero Burocracia Documental)
**Cobertura:** Producto, Ingeniería (Web/Backend/Mobile/IA), DevSecOps/SRE/FinOps, Marketing/Growth, Comercial/Ventas B2B, Operaciones/Customer Success/Confianza Clínica, Finanzas y Legal/Cumplimiento.

---

## 0. Línea Base: Entregas Recientes Ya en Producción (`master` / `main`)

*(Actualizado tras el cierre de la iteración 2.5.1 — Octubre 2026)*

- ✅ **`PROD-E2E-01` — Compuerta E2E Clínica en Staging sin adaptadores artificiales (`quhealthy` PR #82, #85 + `github-backend-java` PR #114):** Login real por rol (`PATIENT` / `PROVIDER`), reserva de cita, selector estable `data-testid="appointment-card"` y `data-appointment-id`, cierre de consulta (`/complete` aceptando notas vacías sin HTTP 400 y preservando semántica de email/pago), emisión de receta y registro API de consentimiento informado (`HU-EHR-024`), con aislamiento de efectos secundarios salientes.
- ✅ **`SEC-AUTH-01` — Verificación de IP/Dispositivo Real y Turnstile en Auth (`github-backend-java` PR #114):** Extracción jerárquica de IP cliente (`CF-Connecting-IP` → `X-Forwarded-For` → `RemoteAddr`), validación de formato IP y soporte de orígenes `admin.quhealthy.org` y `staging.quhealthy.org` en Turnstile y CORS.
- ✅ **`ADMIN-TRUST-01` — Veracidad de Auditoría y Cédula Profesional DGP en Admin Portal (`quhealthy` PR #81 / #43):** Eliminación de datos simulados en verificación KYB y trazabilidad honesta del estado de validación de cédulas.
- ✅ **`PORT-ECOSYS-01` — Cableado Real de Portales Proveedor, Laboratorio y Fundación (`quhealthy` #79, #80 + `github-backend-java` PR #114):** Rutas dinámicas de órdenes de insumos, paquetes de laboratorio y programas de fundación conectadas a backend con validaciones de fechas y paginación segura.
- ✅ **`STREAM-SEC-01` & `CRM-GOV-01` (`quhealthy` #45, #46):** Rotación/revocación de tokens de videoconsulta y control de acceso RBAC en el CRM corporativo.

---

## 1. Horizonte 1: NOW (Sprint Inmediato / P0 — Desbloqueo de Ingresos, Compuertas y Seguridad)

*Objetivo del Sprint:* Cerrar los últimos huecos técnicos entre la UI y la base de datos/pasarela de pagos, asegurar el perímetro Cloud Run y activar la maquinaria de adquisición y onboarding de los primeros doctores.

### 🛠️ Producto e Ingeniería (`product-engineering`)

| ID | Prioridad | Iniciativa / Historia de Usuario | Entregable Verificable (DoD) | Nivel Autonomía |
| :--- | :---: | :--- | :--- | :---: |
| **`ENG-CAT-01`** | **P0** | **Migración Flyway y activación de Categorías de Catálogo (`catalog_product_categories`)** | Crear y aplicar migración Flyway `V2__create_catalog_product_categories.sql` en `quhealthy-staging` y `quhealthy-backend` antes de reincorporar la entidad `ProductCategory` del PR #113, garantizando que `catalog-service` arranque con `ddl-auto: validate` sin errores. | 🟡 Nivel 2 |
| **`ENG-EHR-024-UI`** | **P0** | **Modal e Interfaz de Firma de Consentimiento Informado (`HU-EHR-024` UI)** | Conectar los endpoints existentes (`POST /api/appointments/{id}/consent` y `GET /api/appointments/{id}/consent`) a un flujo visual real en el portal del paciente/doctor antes de iniciar la consulta o telemedicina, y extender el test E2E de Playwright para pulsar la UI real. | 🟢 Nivel 1 |
| **`ENG-PAY-01`** | **P0** | **Flujo E2E de Checkout, Suscripción SaaS y Stripe Connect (Modo Test)** | Validar de punta a punta en Staging el cobro de cita médica y la suscripción de plan para doctores (`payment_service` + webhooks de Stripe + estados de cita `PAID`), asegurando idempotencia y conciliación de comisiones. | 🟢 Nivel 1 |
| **`ENG-RX-01`** | **P0** | **Generación y Descarga Verificada de Receta Médica en PDF** | Certificar que al completar una consulta con prescripción, el PDF generado incluya datos del médico (nombre, especialidad, cédula profesional verificada), firma/sello digitalizable, medicamentos y folio único descargable por el paciente. | 🟢 Nivel 1 |

### 🛡️ DevSecOps, SRE y FinOps (`devsecops-sre`)

| ID | Prioridad | Iniciativa / Tarea | Entregable Verificable (DoD) | Nivel Autonomía |
| :--- | :---: | :--- | :--- | :---: |
| **`OPS-STAGE-01`** | **P0** | **Automatización del Alias `staging.quhealthy.org` y Paridad de Olas en Staging** | Configurar en CI/Vercel que la rama/preview de staging actualice automáticamente `staging.quhealthy.org` y documentar/automatizar el script de despliegue de los microservicios restantes en `quhealthy-staging` manteniendo `min-instances=0, max-instances=1`. | 🟡 Nivel 2 |
| **`OPS-SEC-01`** | **P0** | **Autenticación de Origen Cloudflare → Cloud Run (`PORT-D-01`)** | Evitar que las URLs `.run.app` sean invocadas saltándose el WAF de Cloudflare: inyectar encabezado secreto compartido (`X-CF-Origin-Verify`) o mTLS desde el proxy/Worker de `api.quhealthy.org` y validarlo en el filtro de entrada de los microservicios, empezando en Staging. | 🟡 Nivel 2 |
| **`OPS-OBS-01`** | **P0** | **Alertas Críticas de Disponibilidad (5xx) y Latencia en Cloud Monitoring** | Configurar políticas de alerta en GCP (`quhealthy-backend`) para tasa de error HTTP 5xx > 2%, fallos de arranque de contenedor y latencia P95 > 2s con notificación directa a `founders@quhealthy.org`. | 🟡 Nivel 2 |

### 📈 Marketing y Growth (`growth-marketing`)

| ID | Prioridad | Iniciativa / Tarea | Entregable Verificable (DoD) | Nivel Autonomía |
| :--- | :---: | :--- | :--- | :---: |
| **`MKT-ANL-01`** | **P0** | **Instrumentación del Embudo de Conversión en GA4 y Search Console** | Implementar en `quhealthy` eventos limpios (sin PII) para los dos embudos core:<br>1. **Doctores:** `view_business_landing` → `signup_provider_start` → `signup_provider_complete` → `kyb_submitted`.<br>2. **Pacientes:** `search_specialty` → `view_provider_profile` → `booking_initiated` → `booking_confirmed`. | 🟢 Nivel 1 |
| **`MKT-SEO-01`** | **P0** | **Auditoría y Corrección de Indexación Técnica (`sitemap.xml`, `robots.txt`, Canonical & Schema.org)** | Resolver las alertas de indexación reportadas en Search Console, asegurar metadatos dinámicos por médico/especialidad e inyectar datos estructurados JSON-LD (`Physician`, `MedicalClinic`, `FAQPage`) en páginas públicas. | 🟢 Nivel 1 |
| **`MKT-CRO-01`** | **P0** | **Optimización de Conversión de `/business` (Captación de Médicos)** | Alinear la propuesta de valor en `/business` con capacidades 100% reales hoy en producción (Agenda + Expediente/Receta + Telemedicina + Cobro Stripe + Directorio), agregando CTA directo a registro y captura de lead en el CRM corporativo. | 🟢 Nivel 1 |

### 🤝 Comercial, Operaciones y Confianza Clínica (`commercial-operations`)

| ID | Prioridad | Iniciativa / Tarea | Entregable Verificable (DoD) | Nivel Autonomía |
| :--- | :---: | :--- | :--- | :---: |
| **`COM-WEDGE-01`** | **P0** | **Playbook y Pipeline de los Primeros 20 Médicos Especialistas (Cohorte Fundadora)** | Configurar en el CRM Corporativo (`/corporate/crm`) el embudo de prospección para la Cohorte Fundadora (médicos privados en CDMX/Monterrey/Guadalajara), con guion de contacto, oferta de onboarding asistido ("White-Glove") y seguimiento de objeciones. | 🟢 Nivel 1 (Prep) / 🔴 Nivel 3 (Contacto) |
| **`OPS-KYB-01`** | **P0** | **Protocolo Operativo de Verificación de Cédula Profesional (< 24h SLA)** | Estandarizar el flujo en el Portal Admin (`/verification`) para que cada médico registrado sea validado contra el Registro Nacional de Profesionistas (SEP/DGP), registrando evidencia de cédula e identidad antes de habilitar su perfil público en el marketplace. | 🟢 Nivel 1 |

### ⚖️ Finanzas, Legal y Cumplimiento (`founder-cos-gov`)

| ID | Prioridad | Iniciativa / Tarea | Entregable Verificable (DoD) | Nivel Autonomía |
| :--- | :---: | :--- | :--- | :---: |
| **`LEG-NOM-01`** | **P0** | **Matriz Técnica-Jurídica de Cumplimiento `NOM-004`, `NOM-024` y `LFPDPPP`** | Documentar en `docs/compliance/` qué controles ya cumple el sistema (bitácora inmutable de consentimiento, control de acceso por rol, trazabilidad de autor y fecha/hora) y cuáles faltan (firma electrónica avanzada/FIEL si aplica, retención mínima de 5 años, aviso de privacidad específico para datos sensibles de salud). | 🟢 Nivel 1 |
| **`FIN-UNIT-01`** | **P0** | **Modelo de Unit Economics y Pricing Oficial (SaaS + Take Rate Marketplace)** | Definir la tabla maestra de precios para doctores (Plan Gratuito/Comisión vs Plan Pro SaaS), desglosando comisión de Stripe (3.6% + $3 MXN + IVA), retenciones fiscales aplicables en plataformas digitales y margen neto por transacción para QuHealthy. | 🟢 Nivel 1 (Modelo) / 🔴 Nivel 3 (Aprobación Precios) |

---

## 2. Horizonte 2: NEXT (Próximas 2 a 4 Semanas / P1 — Tracción, Retención y Eficiencia)

*Objetivo:* Escalar la adquisición orgánica de pacientes y médicos, reducir ausentismo en consultas (no-shows) y optimizar costos de infraestructura.

### 🛠️ Producto e Ingeniería (`product-engineering` + `data-ai-copilot`)
- **`ENG-NOTIF-01` (P1):** **Recordatorios Automatizados de Cita (Correo / WhatsApp / Push)** con enlaces de confirmación y reprogramación para reducir el *no-show* clínico por debajo del 10%.
- **`ENG-CAL-01` (P1):** **Sincronización Bidireccional con Google Calendar** para doctores, evitando dobles reservas entre su consulta externa y QuHealthy.
- **`AI-COPILOT-01` (P1):** **Asistente Clínico Pre-Consulta y Resumen SOAP en `Health OS Copilot`:** Permitir que el paciente complete su motivo de consulta/antecedentes antes de la cita y que el médico reciba un borrador estructurado SOAP en su consola, sujeto siempre a edición y firma del médico.
- **`ENG-TELEMED-01` (P1):** **Certificación End-to-End de Videoconsulta (`LiveKit`):** Validar en Staging/Producción las variables `LIVEKIT_API_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET` en `appointment-service`, reconexión ante caída de red y sala de espera virtual.

### 🛡️ DevSecOps, SRE y FinOps (`devsecops-sre`)
- **`OPS-FINOPS-01` (P1):** **Optimización de Costo de Redis y Revisión de Cifrado en Tránsito:** Evaluar el costo fijo de Memorystore Redis (principal rubro de facturación en GCP con ~49% del gasto mensual) y validar compatibilidad TLS o consolidación de caché sin degradar latencia de `auth-service`.
- **`OPS-SEC-02` (P1):** **Auditoría de los 6 Buckets de Cloud Storage con Acceso Público y Mínimo Privilegio IAM:** Clasificar qué buckets requieren lectura pública (ej. avatares/catálogo público) vs privados con Signed URLs (recetas, documentos KYB, estudios clínicos) y retirar `roles/editor` de cuentas de servicio heredadas.
- **`OPS-DB-01` (P1):** **Política de Backups Automatizados y Prueba de Restauración en Supabase:** Certificar RPO/RTO de la base de datos productiva (`xvqwhapfmkswozjhchvw`) y catálogo de tablas con RLS / retención clínica.

### 📈 Marketing y Growth (`growth-marketing`)
- **`MKT-SEO-02` (P1):** **Páginas Programáticas de Especialidad × Ciudad (Programmatic SEO):** Generar rutas estáticas/ISR optimizadas (ej. `/especialistas/dermatologia/ciudad-de-mexico`, `/especialistas/psicologia/monterrey`) alimentadas por el catálogo real de doctores verificados.
- **`MKT-CONTENT-01` (P1):** **Motor de Contenido Clínico Verificado (Blog / Guías para Pacientes):** Publicar artículos revisados por especialistas de la plataforma (con sello "Revisado por Dr. X, Cédula Y" para potenciar E-E-A-T en Google en el sector salud *YMYL*).
- **`MKT-REF-01` (P1):** **Programa de Referidos Médico-a-Médico (`referral_service`):** Activar el flujo de invitación entre colegas médicos con meses bonificados de suscripción SaaS al verificar su cédula.

### 🤝 Comercial, Operaciones y Customer Success (`commercial-operations`)
- **`OPS-CS-01` (P1):** **Playbook de Onboarding "Primera Cita en 7 Días":** Secuencia automatizada y asistida para que todo médico recién verificado configure horarios, tarifas, cuenta bancaria Stripe y reciba su primera reserva en menos de una semana.
- **`COM-B2B-01` (P1):** **Piloto Comercial con 2 Laboratorios y 2 Proveedores de Insumos Médicos:** Aprovechar los portales `/laboratory` y `/supplier` ya conectados al backend para cerrar los primeros convenios de catálogo y paquetes diagnósticos con descuento para pacientes y médicos de QuHealthy.

### ⚖️ Finanzas, Legal y Cumplimiento (`founder-cos-gov`)
- **`LEG-PRIV-01` (P1):** **Flujo Operativo de Derechos ARCO y Portabilidad de Expediente:** Habilitar el procedimiento estandarizado para solicitudes de Acceso, Rectificación, Cancelación y Oposición (LFPDPPP) y entrega de resumen clínico conforme a `NOM-004-SSA3-2012`.
- **`FIN-DATAROOM-01` (P1):** **Data Room Base para Inversión Pre-Seed / Seed:** Estructurar en el Shared Drive corporativo el deck ejecutivo, arquitectura técnica certificada, métricas de cohorte, modelo financiero a 24 meses y carpeta corporativa/legal.

---

## 3. Horizonte 3: LATER (Q4 Tardío / Q1 2027 / P2 — Escala y Diferenciación)

1. **`ENG-IOS-01` (P2 — Mobile iOS):** Sincronización de contratos API, notificaciones Push nativas (APNs/Firebase) y publicación en TestFlight / App Store de la app móvil de QuHealthy.
2. **`COM-ENTERPRISE-01` (P2 — Clínicas Multi-Médico y Fundaciones):** Gestión de múltiples sucursales, recepción compartida, permisos por rol clínico dentro de una misma clínica y programas de salud subvencionados en `/foundation`.
3. **`AI-PULSO-01` (P2 — Seguimiento Longitudinal y Salud Preventiva):** Evolución de `HealthScore` y seguimiento post-consulta automatizado para pacientes crónicos (adherencia a tratamiento y recordatorio de estudios de control).
4. **`MKT-PAID-01` (P2 — Adquisición Pagada Escalable):** Activación de campañas hiper-segmentadas en Google Search Ads (intención alta por especialidad) una vez que la conversión orgánica del embudo supere el umbral de retorno sobre inversión.
