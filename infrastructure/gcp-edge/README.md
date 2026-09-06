# Perímetro de API en GCP

Esta carpeta documenta la infraestructura de borde de `api.quhealthy.org` y permite incorporar gradualmente su operación a Terraform. Por seguridad, su configuración inicial es de solo lectura: no crea ni modifica recursos existentes.

## Estado actual

- IP global reservada: `quhealthy-api-ip` (`8.233.239.62`).
- URL map: `url-map-quhealthy`.
- HTTPS proxy: `quhealthy-api-https-proxy`.
- Certificado administrado: `cert-api-quhealthy-v3` para `api.quhealthy.org`.
- Cloud Armor: pendiente. La cuota global **Security policies** está en `0`.
- DNS de Cloudflare: conservar temporalmente el CNAME actual. No apuntar a la IP global ni crear la regla de reenvío HTTPS hasta contar con Cloud Armor y validar el certificado.

## Uso seguro ahora

Desde esta carpeta:

```bash
terraform init
terraform validate
terraform plan
```

El plan debe ser de solo lectura mientras `enable_cloud_armor = false`.

## Cuando GCP apruebe la cuota de Cloud Armor

1. Cambiar `enable_cloud_armor` a `true` en `terraform.tfvars`.
2. Ejecutar `terraform plan` y revisar que únicamente se cree `quhealthy-api-waf`.
3. Aplicar la política inicialmente en modo `preview`; las reglas de SQLi y XSS registrarán coincidencias, sin bloquear usuarios.
4. Asociar la política a todos los backends del balanceador y observar los logs antes de quitar `preview`.
5. Crear la regla de reenvío HTTPS global en el puerto 443 y comprobar que el certificado esté `ACTIVE`.
6. Cambiar en Cloudflare el registro existente de `api.quhealthy.org` para que apunte a `8.233.239.62`, conservándolo inicialmente sin proxy, y verificar rutas y CORS.
7. Restringir los servicios de Cloud Run a `internal-and-cloud-load-balancing`, servicio por servicio, solo después de validar el tráfico por el balanceador.

No exponer la IP ni cambiar DNS antes de los pasos 3 a 5: de otro modo se publicaría un API sin su WAF de perímetro.

## Incorporación gradual a Terraform

Los recursos existentes se consultan mediante `data` para no alterar su estado. Antes de convertirlos en `resource`, importar cada objeto y ejecutar un `plan` sin cambios. Ejemplos:

```bash
terraform import google_compute_global_address.api projects/quhealthy-backend/global/addresses/quhealthy-api-ip
terraform import google_compute_url_map.api projects/quhealthy-backend/global/urlMaps/url-map-quhealthy
terraform import google_compute_target_https_proxy.api projects/quhealthy-backend/global/targetHttpsProxies/quhealthy-api-https-proxy
```

Esos comandos se ejecutarán únicamente cuando se reemplacen los `data` equivalentes por recursos Terraform administrados. No ejecutarlos todavía.

## Backlog de HUs de Redis

| HU | Servicio | Alcance inicial | Criterio de aceptación |
| --- | --- | --- | --- |
| RED-02 | catalog-service | Caché de catálogos, especialidades y búsquedas de lectura frecuente. | Hit/miss medible, TTL definido e invalidación al actualizar catálogo. |
| RED-03 | auth-service | Límites distribuidos, OTP temporal y revocación de sesión/token. | El límite funciona entre réplicas y nunca se guarda un secreto en claro. |
| RED-04 | analytics-service | Caché de KPIs y agregados de panel administrativo. | Cada métrica declara TTL y puede invalidarse ante eventos relevantes. |
| RED-05 | appointment/payment/notification | Idempotencia, deduplicación y estado efímero de trabajos. | Reintentos no generan dobles cargos, citas ni notificaciones. |

`social-service` corresponde a RED-01 y ya usa Memorystore por Direct VPC egress. Cada HU posterior incluirá medición de latencia, tasa de aciertos, invalidación y estimación de costo antes de activarse en producción.
