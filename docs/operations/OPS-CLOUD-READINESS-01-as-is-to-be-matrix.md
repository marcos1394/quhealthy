# Dictamen Operacional de Nube: Matriz AS-IS -> TO-BE

**HU:** `OPS-CLOUD-READINESS-01`  
**Épica:** `EP-TECH-01` / Infraestructura y Operaciones Profesionales  
**Alcance:** Google Cloud Platform (`quhealthy-backend` / `quhealthy-staging`), Supabase, Cloudflare Edge, Vercel  
**Fecha:** 2026-10-06  
**Estado:** Dictamen Operativo / Backlog de Remediación  

---

## 1. Principio Rector

Tener 12 contenedores de microservicios con condición `Ready=True` en Google Cloud Run es una condición necesaria pero **insuficiente** para certificar una "infraestructura profesional y operativa". 

Una infraestructura de nivel empresarial en salud digital exige verificación explícita en siete pilares:
1. Perímetro y Control de Ingress
2. Identidad y Mínimo Privilegio (IAM)
3. Gestión Segura de Secretos y Configuración
4. Continuidad del Negocio, Backups y Disaster Recovery
5. FinOps, Presupuesto Real y Control de Costos
6. Observabilidad, Monitoreo de SLIs y Alertas
7. CI/CD Inmutable y Automatización IaC

---

## 2. Matriz de Controles: Estado Actual (AS-IS) vs Estado Objetivo (TO-BE)

| Control | Estado AS-IS | Estado TO-BE (Profesional) | Nivel de Riesgo | Acción Requerida |
| :--- | :--- | :--- | :--- | :--- |
| **Ingress de Cloud Run** | Los 12 servicios tienen Ingress configurado como `all` (públicamente alcanzables si se conoce la URL `.a.run.app`). | Ingress configurado como `internal-and-cloud-load-balancing` para que todo el tráfico transite obligatoriamente por el Load Balancer / Gateway. | **Medio-Alto** | Validar rutas en Load Balancer / Gateway antes de cerrar el ingress público directo en Cloud Run. |
| **WAF Perimetral (Cloud Armor)** | `enable_cloud_armor = false`. Cuota de `SECURITY_POLICIES` en `0`. Sin políticas asociadas a backends. | WAF habilitado con mitigación de SQLi y XSS en modo enforce tras 72h en modo preview. Cuota solicitada o delegación documentada a Cloudflare WAF. | **Medio** | Ejecutar runbook `OPS-CLOUD-QUOTA-01` tras aprobación de presupuesto de LB (~$26 USD/mes). |
| **Gestión de Secretos** | Secret Manager habilitado en producción; saneado `META_WEBHOOK_VERIFY_TOKEN` y defaults defensivos en LiveKit. | Cero variables planas de credenciales; rotación programada cada 90 días; auditoría de acceso vía Cloud Audit Logs. | **Bajo** (Controlado) | Mantener política estricta de Secret Manager y descartar variables legacy en workflows. |
| **Paridad de Esquema DB** | Script consolidado ejecutado en Supabase Staging y Prod. Validación Hibernate `ddl-auto: validate`. | Pipeline de migración automatizado (Flyway / Liquibase o Supabase CLI CI) con verificación de diff antes de deploy. | **Medio** | Implementar un job de `supabase db diff` en CI para evitar desincronizaciones silenciosas. |
| **Respaldo y Recuperación (DR)** | Backups automáticos gestionados por Supabase en capa administrada. | Runbook de Disaster Recovery probado con RPO <= 1 hora y RTO <= 4 horas. Procedimiento de exportación y restauración periódico. | **Medio** | Documentar y simular un simulacro de restauración de snapshot en staging. |
| **FinOps y Costo en Reposo** | Staging configurado con `maxScale=1` y `minScale=0` (scale-to-zero en CPU de Cloud Run). | Conciliación de facturación real que incluya Artifact Registry, red/egress, Supabase y Cloudflare. Presupuesto con alertas en GCP Cloud Billing. | **Bajo** | Crear alerta de presupuesto en GCP Cloud Billing (ej. notificación al 50%, 80% y 100% de MXN 500/mes). |
| **Observabilidad y SLIs** | Cloud Logging activo por defecto en Cloud Run. Logs accesibles en consola. | Dashboard centralizado en Cloud Monitoring; métricas de error 5xx, latencia P95 y tasa de saturación. Alertas a canal de incidentes. | **Medio** | Crear alertas en Cloud Monitoring cuando la tasa de errores HTTP 5xx supere el 1% en 5 minutos. |
| **Pruebas E2E en Pipeline** | Pruebas Playwright (18 casos) existen localmente pero no se ejecutan dentro del GitHub Actions workflow web. | Pruebas E2E automatizadas en un job dedicado en CI contra el entorno de Staging tras cada merge. | **Medio** | Integrar `npm run test:e2e` en el pipeline de staging con secretos inyectados desde GitHub Secrets. |
| **Despliegue Web (Vercel)** | Workflow apuntaba al equipo `quhealthy` (suspendido por facturación). Token de bypass versionado en local. | Pipeline web dirigido a `marcos1394s-projects/quhealthy` (canónico sano) con aislamiento de Preview y token saneado. | **Crítico** (En resolución) | Implementar `STAGE-WEB-CANON-01`: sanear `playwright.config.ts` y configurar workflow Preview canónico. |

---

## 3. Backlog de HUs de Infraestructura Profesional (`EP-TECH-01`)

1. **`OPS-NET-INGRESS-01` [P1]: Restricción de Ingress en Cloud Run**
   * *Objetivo:* Cambiar `--ingress=internal-and-cloud-load-balancing` en los 12 microservicios una vez validada la estabilidad del punto de entrada unificado.
   * *Criterio de Aceptación:* Ningún contenedor Cloud Run responde a peticiones directas `.a.run.app` desde internet; todo el tráfico proviene del balanceador o gateway.

2. **`OPS-FINOPS-BUDGET-01` [P1]: Alertas de Presupuesto y Límites en GCP**
   * *Objetivo:* Configurar alertas en Google Cloud Billing para `quhealthy-backend` y `quhealthy-staging`.
   * *Criterio de Aceptación:* Notificaciones por correo/canal cuando el consumo mensual alcance 50%, 80% y 100% del umbral aprobado.

3. **`OPS-MON-SLI-01` [P2]: Monitoreo de Disponibilidad y Alertas 5xx**
   * *Objetivo:* Crear políticas de alerta en Cloud Monitoring para detectar picos de errores HTTP 5xx o latencias elevadas (> 2.5s) en los 12 microservicios.
   * *Criterio de Aceptación:* Alerta disparada automáticamente ante fallas del contenedor o excepciones no controladas.

4. **`OPS-DB-DIFF-01` [P2]: Certificación Automatizada de Esquemas Supabase**
   * *Objetivo:* Script en CI o pre-deploy que ejecute un diff estructural entre los esquemas de Staging y Producción, garantizando que ninguna tabla o columna falte antes del despliegue.
