# Manifiesto de Despliegue Exclusivo para Staging (Iteración 2.5)

**Identificador:** `OPS-STAGING-DEPLOY-MANIFEST-01`  
**Destino de Entorno:** Exclusivamente `quhealthy-staging` / `staging.quhealthy.org`  
**Estado:** Preparado y verificado (Pendiente de autorización de ejecución)  
**Invariante de Seguridad:** PROHIBIDO aplicar en producción o fusionar a `master`/`main`.  

---

## 1. Parámetros y Variables de Entorno de Staging

| Componente | Variable | Valor Canónico Requerido | Justificación / Protocolo |
| :--- | :--- | :--- | :--- |
| **Frontend Vercel (Staging)** | `NEXT_PUBLIC_API_URL` | `https://api-staging.quhealthy.org` | Conexión estricta a gateway de staging. Mitiga llamadas indebidas a `api.quhealthy.org`. |
| **Frontend Vercel (Staging)** | `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | `1x00000000000000000000BB` | Clave pública oficial de prueba de Cloudflare para widgets invisibles (`size: invisible`). |
| **Backend Auth (Cloud Run)** | `TURNSTILE_SECRET` | `1x0000000000000000000000000000000AA` | Secreto de prueba oficial Cloudflare en Secret Manager (`staging-turnstile-secret`). |
| **Backend Auth (Cloud Run)** | `SPRING_PROFILES_ACTIVE` | `staging` | Perfil autorizado para operar con claves de prueba (prohibido en `production`). |

---

## 2. SHAs Exactos de Artefactos Destino

* **Frontend Web (`quhealthy`):**
  - **Rama:** `test/staging-clinical-gate-e2e` (PR #82)
  - **SHA Destino:** `c4323e2d` (o commit head de PR #82)
  - **Contenido Verificado:** Suite E2E con guarda de origen exacto `https://staging.quhealthy.org`, bloqueo activo de red a nivel de ruta contra mutaciones fuera de staging, y Paso 9 validando contra `https://api-staging.quhealthy.org`.
* **Backend Microservicios (`github-backend-java`):**
  - **Rama:** `fix/backend-resilience-date-validation-and-prescription-audit` (PR #113)
  - **SHA Destino:** `4ce1dd82faebc81602167d32e36127435f3df0c5`
  - **Contenido Verificado:** Validación de hostnames por perfil (`example.com` para test key en staging) y action (`login`), con inyección `@Autowired` en constructor y CI 13/13 en verde.

---

## 3. Versiones Servidas Esperadas tras Despliegue

1. **Vercel Frontend:**
   - URL: `https://staging.quhealthy.org`
   - Bundle de login (`/_next/static/chunks/app/[locale]/(auth)/login/page-*.js`) debe incrustar la sitekey `1x00000000000000000000BB`.
   - Llamadas de red de telemetría y API deben dirigirse a `https://api-staging.quhealthy.org`.
2. **Cloud Run `auth-service`:**
   - Servicio: `auth-service` en región `us-central1`, proyecto `quhealthy-staging`.
   - Imagen: `gcr.io/quhealthy-staging/auth-service:4ce1dd82` (o SHA correspondiente).
   - Verificación de liveness: `https://api-staging.quhealthy.org/api/auth/actuator/health/liveness` retorna HTTP 200.

---

## 4. Procedimiento de Rollback Inmediato

Si cualquier compuerta o verificación reporta anomalías post-despliegue:

### A. Rollback de Frontend (Vercel)
Reasignar el dominio `staging.quhealthy.org` al deployment previo estable:
* **Deployment Previo Estable:** SHA `1a23caeb53811cb65f864255587eda7bd387649f` (`feat/stage-web-canon-01`).

### B. Rollback de Backend (Cloud Run)
Revertir el tráfico de `auth-service` a la revisión previa conocida:
```bash
gcloud run services update-traffic auth-service \
  --to-revisions=auth-service-00042-xyz=100 \
  --region=us-central1 \
  --project=quhealthy-staging
```
(Revisión previa basada en `auth-service:8ff717918ab934ce2c340457a5eb04a6e1f0d480`).

### C. Procedimiento de Rollback de Datos (Cita Sintética)
Procedimiento probado exclusivamente en simulación local en memoria ([`scripts/test-local-rollback.py`](file:///Users/marcossandovalruiz/Documents/quhealthy/scripts/test-local-rollback.py)), siguiendo el orden relacional inverso:
1. `DELETE FROM teleconsultation_consent_audits WHERE consent_id IN (...)`
2. `DELETE FROM teleconsultation_ai_consents WHERE teleconsultation_id IN (...)`
3. `DELETE FROM appointment_transactions WHERE appointment_id = <dynamic_id>`
4. `DELETE FROM teleconsultations WHERE appointment_id = <dynamic_id>`
5. `DELETE FROM appointments WHERE id = <dynamic_id>`
*(Nota: No ejecutar `DELETE`s en staging sin autorización expresa).*
