# Manifiesto de Despliegue Exclusivo para Staging (Iteración 2.5)

**Identificador:** `OPS-STAGING-DEPLOY-MANIFEST-01`  
**Destino de Entorno:** Exclusivamente `quhealthy-staging` (`staging.quhealthy.org` / `api-staging.quhealthy.org`)  
**Estado:** Preparado y auditado (Pendiente de autorización explícita para ejecución)  
**Invariante de Seguridad:** PROHIBIDO aplicar en producción, prohibido fusionar a `master`/`main`, y prohibido desplegar sin autorización expresa.  

---

## 1. Parámetros y Variables de Entorno de Staging

| Componente | Variable | Valor Canónico / Origen Seguro | Justificación / Protocolo |
| :--- | :--- | :--- | :--- |
| **Frontend Vercel (Staging)** | `NEXT_PUBLIC_API_URL` | `https://api-staging.quhealthy.org` | Conexión estricta al backend gateway de staging. Mitiga llamadas indebidas a `api.quhealthy.org`. |
| **Frontend Vercel (Staging)** | `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | `1x00000000000000000000BB` | Clave pública oficial de prueba de Cloudflare para widgets invisibles (`size: invisible`), según [documentación oficial de testing de Turnstile](https://developers.cloudflare.com/turnstile/troubleshooting/testing/). |
| **Backend Auth (Cloud Run)** | `SPRING_PROFILES_ACTIVE` | `staging` | Perfil autorizado para operar con validación de hostnames de prueba (`example.com`) y acción `login`. Prohibido en `production`. |
| **Backend Auth (Cloud Run)** | `GCP_PROJECT_ID` | `quhealthy-staging` | Proyecto GCP destino aislado para microservicios de staging. |
| **Backend Auth (Cloud Run)** | `SPRING_CLOUD_GCP_PUBSUB_ENABLED` | `false` | Desactivación de mensajería asíncrona no requerida en auth de staging. |
| **Backend Auth (Cloud Run)** | `TURNSTILE_SECRET` | Secret Manager: `staging-turnstile-secret:latest` | Referencia a Secret Manager (`projects/quhealthy-staging/secrets/staging-turnstile-secret`). Eliminados todos los secretos literales en manifiestos y repositorios. |
| **Backend Auth (Cloud Run)** | `SPRING_DATASOURCE_URL` | Secret Manager: `staging-db-jdbc-url:latest` | URL JDBC de base de datos PostgreSQL de staging administrada en Secret Manager. |
| **Backend Auth (Cloud Run)** | `DB_USER` / `DB_PASSWORD` | Secret Manager: `staging-db-user:latest` / `staging-db-password:latest` | Credenciales de base de datos inyectadas dinámicamente vía Secret Manager. |
| **Backend Auth (Cloud Run)** | `JWT_SECRET_KEY` | Secret Manager: `staging-analytics-jwt:latest` | Clave de firma JWT para staging administrada en Secret Manager. |

---

## 2. SHAs Exactos de Artefactos Destino y Rutas de Contenedor

### A. Frontend Web (`quhealthy`)
* **Repositorio:** `quhealthy`
* **Rama:** `test/staging-clinical-gate-e2e` (PR #82)
* **SHA Base Actual:** `51792d89ee60e34b92b67da344f6f87e5b56578a`
* **SHA Destino Final:** Commit head consolidado de PR #82
* **Contenido Verificado:**
  - Guarda de origen canónico estricto `https://staging.quhealthy.org`.
  - Bloqueo activo de red a nivel de ruta antes de navegar que aborta cualquier mutación fuera de destinos permitidos de staging (`assertNoProductionMutations`, `withSecurityGuard`).
  - Pruebas específicas de compuerta roja pre-navegación y post-login ante intentos de mutación hacia producción.
  - Paso 9 de verificación read-only contra `https://api-staging.quhealthy.org` usando la sesión autenticada del navegador sin persistir ni filtrar tokens.

### B. Backend Microservicios (`github-backend-java`)
* **Repositorio:** `marcos1394/github-backend-java`
* **Rama:** `fix/backend-resilience-date-validation-and-prescription-audit` (PR #113)
* **SHA Destino Exacto:** `4ce1dd82faebc81602167d32e36127435f3df0c5`
* **Ruta de Imagen en Artifact Registry:**
  `us-central1-docker.pkg.dev/quhealthy-staging/quhealthy-staging/auth-service:4ce1dd82faebc81602167d32e36127435f3df0c5`
* **Contenido Verificado:**
  - Corrección de inyección `@Autowired` en constructor de `TurnstileService`.
  - Validación multi-entorno de hostnames (`example.com` para test key de staging y hostnames oficiales en producción) y acción `login`.
  - Pipeline de CI con 13/13 microservicios verificados en verde.

---

## 3. Estado en Vivo de Cloud Run y Revisión Previa Real

Lectura directa de infraestructura realizada antes del despliegue:
* **Servicio:** `auth-service`
* **Proyecto GCP:** `quhealthy-staging`
* **Región:** `us-central1`
* **Cuenta de Servicio de Runtime:** `auth-runtime@quhealthy-staging.iam.gserviceaccount.com`
* **Revisión Activa Previa Real (100% Tráfico):** `auth-service-00003-76j`
* **Imagen del Contenedor Activo Previo:**
  `us-central1-docker.pkg.dev/quhealthy-staging/quhealthy-staging/auth-service:8ff717918ab934ce2c340457a5eb04a6e1f0d480`
* **Revisión Esperada Post-Despliegue:**
  Nueva revisión Cloud Run basada en la imagen `us-central1-docker.pkg.dev/quhealthy-staging/quhealthy-staging/auth-service:4ce1dd82faebc81602167d32e36127435f3df0c5`, asignada al 100% del tráfico con perfil de costo scale-to-zero (`--min=0 --max=1`, `cpu-throttling`, concurrrencia 20).

---

## 4. Verificación de Compatibilidad de Workload Identity Federation (WIF)

Se comprobó formalmente la configuración de WIF para asegurar que el ref de PR #113 sea aceptado sin necesidad de ampliar ni modificar permisos de IAM:

* **Mecanismo de Despliegue:** Workflow de GitHub Actions `.github/workflows/staging-wave1.yml` activado mediante `workflow_dispatch` con input `service: auth-service` apuntando a la rama `fix/backend-resilience-date-validation-and-prescription-audit` (PR #113).
* **Cuenta de Servicio Desplegadora:** `github-staging-deploy@quhealthy-staging.iam.gserviceaccount.com`
* **Política IAM de WIF Activa (Lectura GCP):**
  ```json
  {
    "bindings": [
      {
        "members": [
          "principalSet://iam.googleapis.com/projects/629366292031/locations/global/workloadIdentityPools/github-staging/attribute.repository/marcos1394/github-backend-java"
        ],
        "role": "roles/iam.workloadIdentityUser"
      }
    ],
    "etag": "BwZb8YyEt6Q=",
    "version": 1
  }
  ```
* **Conclusión Técnica:** La condición `attribute.repository/marcos1394/github-backend-java` está vinculada a nivel de repositorio. Cualquier ref o rama de dicho repositorio (incluyendo `fix/backend-resilience-date-validation-and-prescription-audit` y `refs/pull/113/head`) satisface de forma nativa la condición de identidad. **No se requiere ninguna ampliación permanente ni temporal de permisos WIF**.

---

## 5. Procedimiento de Rollback Operativo

Si cualquiera de las verificaciones post-despliegue o la compuerta clínica reporta fallos:

### A. Rollback de Frontend (Vercel)
Revertir inmediatamente el alias de dominio `staging.quhealthy.org` al deployment previo estable:
* **Deployment Previo Estable:** Commit SHA `1a23caeb53811cb65f864255587eda7bd387649f` (`feat/stage-web-canon-01`).

### B. Rollback de Backend (Cloud Run)
Revertir el tráfico del microservicio `auth-service` a la revisión previa real obtenida por lectura:
```bash
gcloud run services update-traffic auth-service \
  --to-revisions=auth-service-00003-76j=100 \
  --region=us-central1 \
  --project=quhealthy-staging
```

### C. Garantía Operativa de Base de Datos en Staging
* **NO habrá cambios de esquema.**
* **NO habrá ejecución de migraciones de rollback (downgrades).**
* **NO habrá borrados ni eliminaciones de registros en la base de datos de staging.**
* Los registros generados durante la prueba sintética permanecen en estado `COMPLETED` para auditoría y trazabilidad, sin afectar la operatividad ni el esquema de la base de datos.

---

## 6. Simulación Relacional Local (Completamente Desacoplada de Staging)

La comprobación de consistencia y orden de integridad referencial es una **simulación relacional estrictamente local** ejecutada en SQLite en memoria (`scripts/test-local-rollback.py`):
* Valida en entorno local el orden de dependencias de claves foráneas entre entidades:
  1. `teleconsultation_consent_audits`
  2. `teleconsultation_ai_consents`
  3. `appointment_transactions`
  4. `teleconsultations`
  5. `appointments`
* **Desacoplamiento Operativo:** Esta simulación se mantiene versionada exclusivamente como prueba de validación de modelo de datos local. **No aplica, no interactúa ni ejecuta ninguna sentencia SQL sobre la base de datos PostgreSQL de staging.**
