# Gateway de API para Producción (`api.quhealthy.org`)

Este Worker de Cloudflare actúa como el API Gateway unificado de alta velocidad para el entorno de Producción (`quhealthy-backend`), consolidando el acceso perimetral a la suite completa de **12 microservicios** en Google Cloud Run.

Implementa un proxy perimetral con **costo $0 en reposo** (aprovechando el tier de Cloudflare Workers con 100,000 req/día gratuitas y WAF/DDoS L3/L4/L7 en el borde), eliminando los costos de balanceador inerte en GCP (~$35 USD/mes) sin comprometer latencia ni seguridad.

---

## 1. Mapeo Canónico de Rutas hacia Cloud Run (`quhealthy-backend`)

| Prefijo de Ruta | Microservicio Destino | URL Cloud Run de Origen |
| :--- | :--- | :--- |
| `/api/auth/*` | `auth-service` | `https://auth-service-263kjqprkq-uc.a.run.app` |
| `/api/catalog/*` | `catalog-service` | `https://catalog-service-263kjqprkq-uc.a.run.app` |
| `/api/onboarding/*` | `onboarding-service` | `https://onboarding-service-263kjqprkq-uc.a.run.app` |
| `/api/appointments/*` | `appointment-service` | `https://appointment-service-263kjqprkq-uc.a.run.app` |
| `/api/analytics/*`, `/api/intelligence/*`, `/api/v1/intelligence/*` | `analytics-service` | `https://analytics-service-263kjqprkq-uc.a.run.app` |
| `/api/notifications/*`, `/api/admin/notifications/*` | `notification-service` | `https://notification-service-263kjqprkq-uc.a.run.app` |
| `/api/referrals/*`, `/api/admin/referrals/*` | `referral-service` | `https://referral-service-263kjqprkq-uc.a.run.app` |
| `/api/reviews/*` | `review-service` | `https://review-service-263kjqprkq-uc.a.run.app` |
| `/api/payments/*`, `/api/admin/plans/*` | `payment-service` | `https://payment-service-263kjqprkq-uc.a.run.app` |
| `/api/social/*` | `social-service` | `https://social-service-263kjqprkq-uc.a.run.app` |
| `/admin-dashboard/*`, `/instances/*`, `/applications/*`, `/api/admin/*` | `admin-service` | `https://admin-service-263kjqprkq-uc.a.run.app` |
| `/api/health-agent/*`, `/api/v1/health-agent/*` | `health-agent-service` | `https://health-agent-service-263kjqprkq-uc.a.run.app` |
| `/healthz`, `/gateway-health` | Gateway Liveness | JSON con estado `UP` y catálogo de upstreams |

---

## 2. Paridad Arquitectónica: Staging vs Producción

| Dominio | Entorno | Gateway Worker | Backend GCP |
| :--- | :--- | :--- | :--- |
| `https://staging.quhealthy.org` | Staging Web | Vercel Preview Canónico | Next.js Frontend |
| `https://api-staging.quhealthy.org` | Staging API | `quhealthy-staging-api-gateway` | `quhealthy-staging` (`*-ayzpmwrdkq-uc.a.run.app`) |
| `https://www.quhealthy.org` | Prod Web | Vercel Producción Canónico | Next.js Frontend |
| `https://api.quhealthy.org` | Prod API | `quhealthy-prod-api-gateway` | `quhealthy-backend` (`*-263kjqprkq-uc.a.run.app`) |

---

## 3. Despliegue con Wrangler CLI

```bash
cd infrastructure/cloudflare-prod-gateway
npx wrangler deploy
```

La ruta interceptada está configurada en `wrangler.toml`:
```toml
name = "quhealthy-prod-api-gateway"
main = "worker.js"
compatibility_date = "2026-10-01"

routes = [
  { pattern = "api.quhealthy.org/*", zone_name = "quhealthy.org" }
]

[observability]
enabled = true
```

---

## 4. Verificación y Smoke Tests

```bash
# 1. Probar salud del Gateway de Producción
curl -i https://api.quhealthy.org/healthz

# 2. Probar catálogo público de productos
curl -i "https://api.quhealthy.org/api/catalog/market/public/products?page=0&size=2"

# 3. Probar CORS preflight desde el frontend
curl -i -X OPTIONS "https://api.quhealthy.org/api/catalog/market/public/products" \
  -H "Origin: https://www.quhealthy.org" \
  -H "Access-Control-Request-Method: GET"
```
