# Runbook: Aumento de Capacidad y Cuotas de Cloud Armor en GCP

**HU:** `OPS-CLOUD-QUOTA-01`  
**Épica:** `EP-TECH-01` / Plataforma y Operaciones  
**Proyecto GCP:** `quhealthy-backend` (Producción) / `quhealthy-staging` (Staging)  
**Servicio:** Google Cloud Armor & Cloud Load Balancing  
**Estado:** Documentado / Pendiente de autorización de costos y solicitud formal  

---

## 1. Contexto y Diagnóstico del Error

Durante el intento de aprovisionamiento de la política de seguridad perimetral `quhealthy-api-waf` vía Terraform en `quhealthy-backend`, se identificó que la cuota de **Security policies** del proyecto se encuentra en valor límite `0`.

* **Recurso afectado:** `google_compute_security_policy.api_waf`
* **Métrica oficial en GCP:** `Compute Engine API` -> `Security policies` (`SECURITY_POLICIES`)
* **Límite actual observado:** `0` (global)

> [!WARNING]
> La respuesta recibida de Google Cloud (remisión a Support Hub) es un redireccionamiento estándar de soporte comercial y **no constituye la aprobación ni el incremento de la cuota**. El aumento debe gestionarse a través del procedimiento oficial de cuotas en Google Cloud Console.

---

## 2. Modelo Económico y Estimación de Costos

Antes de solicitar la cuota y activar Cloud Armor en producción, la junta y el área financiera deben considerar la siguiente estructura tarifaria oficial:

### A. Tarifas Oficiales de Cloud Armor (Standard)
* **Costo por Política de Seguridad:** \$5.00 USD / política / mes.
* **Costo por Regla WAF:** \$1.00 USD / regla / mes (la política `quhealthy-api-waf` propuesta contempla 3 reglas: SQLi, XSS y Default Allow = \$3.00 USD/mes).
* **Costo por Solicitudes Evaluadas:** \$0.75 USD por cada 1,000,000 de solicitudes HTTP(S).

### B. Tarifas Oficiales de External Application Load Balancer
* **Costo Base de Reglas de Reenvío (Forwarding Rules):** ~\$18.25 USD / mes por las primeras 5 reglas de reenvío globales.
* **Procesamiento de Datos:** \$0.008 a \$0.012 USD por GB procesado.

### C. Comparativa de Alternativas (Cloudflare Edge vs GCP Armor)
* **Alternativa A (Cloudflare Edge actual):**
  * La plataforma ya cuenta con Cloudflare en el perímetro (`api.quhealthy.org` y `api-staging.quhealthy.org`).
  * Cloudflare provee mitigación DDoS L3/L4/L7 y WAF gestionado en su capa de borde.
  * **Costo incremental:** \$0.00 USD si se gestiona el WAF en las reglas de Cloudflare.
* **Alternativa B (GCP Cloud Armor en Load Balancer):**
  * Ofrece inspección directa antes de entrar a la red interna de GCP.
  * **Costo incremental estimado:** ~\$26.25 USD a \$35.00 USD / mes (LB base + política + reglas + tráfico mínimo).

---

## 3. Procedimiento Oficial para Solicitar el Aumento de Cuota en GCP

Cuando exista aprobación presupuestaria y se decida avanzar con Cloud Armor en el balanceador, el propietario humano con rol `roles/servicemanagement.quotaAdmin` o `roles/owner` debe seguir estos pasos:

### Paso 1: Localización de la Cuota en Google Cloud Console
1. Ingresar a [Google Cloud Console](https://console.cloud.google.com/).
2. Asegurarse de seleccionar el proyecto exacto: **`quhealthy-backend`**.
3. En el menú de navegación principal (hamburguesa), ir a:  
   **IAM y administración** $\rightarrow$ **Cuotas y límites del sistema** (`Quotas & System Limits`).

### Paso 2: Filtrado de la Métrica Exacta
En la barra de búsqueda y filtros de la tabla de cuotas, aplicar los siguientes criterios:
* **Servicio:** `Compute Engine API`
* **Métrica:** `Security policies` (identificador técnico: `compute.googleapis.com/security_policies`)
* **Ubicación / Dimensión:** `Global`

### Paso 3: Envío de la Solicitud de Aumento
1. Marcar la casilla de verificación correspondiente a la fila de la cuota.
2. Hacer clic en el botón superior **Editar cuota** (o **Apply for higher quota**).
3. En el panel lateral derecho:
   * **Nuevo límite solicitado:** `1` (o `2` si se prevé una política separada para staging/dr).
   * **Motivo de la solicitud (Justificación técnica):**
     > *"We are implementing Web Application Firewall (WAF) perimeter policies (OWASP ModSecurity Core Rule Set for SQLi and XSS protection) on our Google Cloud External Application Load Balancer for our digital healthcare production platform quhealthy.org."*
   * **Datos de contacto:** Nombre y correo electrónico corporativo del administrador.
4. Hacer clic en **Enviar solicitud** (`Submit request`).

### Paso 4: Monitoreo y Tiempos de Respuesta
1. Navegar a la pestaña **Solicitudes de aumento** (`Increase Requests`) dentro de la misma sección de Cuotas.
2. Registrar el **Request ID**, la fecha de envío y el estado (`Pending Review`).
3. Google Cloud procesa las solicitudes de cuota generalmente en un periodo de **24 a 72 horas hábiles** (pudiendo tomar hasta 5 días si requiere revisión de crédito/facturación).

### Paso 5: Escalación a Soporte Técnico (Si la Consola Bloquea la Solicitud)
Si la consola muestra el mensaje *"Quota increase requests are not supported for this quota via console"*:
1. Dirigirse a [Google Cloud Support Hub](https://cloud.google.com/support-hub).
2. Crear un caso de soporte bajo la categoría **Facturación y Cuotas** (`Billing & Quotas`).
3. Adjuntar:
   * Project ID: `quhealthy-backend`
   * Métrica: `compute.googleapis.com/security_policies` (Global)
   * Valor actual: `0`
   * Valor requerido: `1`
   * Justificación técnica y captura de pantalla sin datos sensibles.

---

## 4. Compuerta de Activación Posterior a la Aprobación

Una vez que la cuota sea concedida por Google Cloud (`Limit = 1`):

> [!IMPORTANT]
> **NO activar la política directamente en modo de bloqueo (`deny`).** Seguir la siguiente secuencia de seguridad:

1. **Modo Preview primero:**
   * Desplegar `quhealthy-api-waf` con `preview = true` (como está configurado en `infrastructure/gcp-edge/cloud-armor.tf`).
   * Las reglas de SQLi y XSS evaluarán el tráfico y generarán logs en Cloud Logging sin bloquear a ningún usuario legítimo ni arrojar falsos positivos en el portal médico.
2. **Auditoría de Logs (72 horas):**
   * Filtrar en Logs Explorer: `resource.type="http_load_balancer" jsonPayload.enforcedSecurityPolicy.name="quhealthy-api-waf"`.
   * Verificar que las llamadas legítimas del portal no activen reglas WAF.
3. **Paso a Enforce:**
   * Solo tras validar la ausencia de falsos positivos en staging y producción, cambiar `preview = false` mediante Terraform.
4. **Plan de Reversión (Rollback):**
   * En caso de bloqueo inesperado, desacoplar la política del backend service con:
     `gcloud compute backend-services update <BACKEND_NAME> --security-policy="" --global`
