# Gateway de API para Staging (`api-staging.quhealthy.org`)

Este Worker de Cloudflare actúa como el API Gateway unificado para el entorno de Staging (`quhealthy-staging`). 

Implementa un enrutamiento idéntico al Load Balancer de producción (`url-map-quhealthy`), pero con **costo $0** mediante Cloudflare Workers (dentro del free tier de 100,000 req/día), respetando el mandato FinOps de QuHealthy.

---

## 1. Mapeo de Rutas hacia Cloud Run (`quhealthy-staging`)

| Prefijo de Ruta | Microservicio Destino | URL de Cloud Run |
| :--- | :--- | :--- |
| `/api/auth/*` | `auth-service` | `https://auth-service-ayzpmwrdkq-uc.a.run.app` |
| `/api/catalog/*` | `catalog-service` | `https://catalog-service-ayzpmwrdkq-uc.a.run.app` |
| `/api/onboarding/*` | `onboarding-service` | `https://onboarding-service-ayzpmwrdkq-uc.a.run.app` |
| `/api/appointments/*` | `appointment-service` | `https://appointment-service-ayzpmwrdkq-uc.a.run.app` |
| `/api/intelligence/*` | `analytics-service` | `https://analytics-service-ayzpmwrdkq-uc.a.run.app` |
| `/healthz` | Gateway Health | Responde estado del Gateway y catálogo de upstreams |

---

## 2. Opciones de Despliegue

### Opción A: Desde el Dashboard de Cloudflare (Recomendado, 2 minutos)
1. Inicia sesión en [dash.cloudflare.com](https://dash.cloudflare.com/).
2. Ve a **Workers & Pages** ➔ **Create Application** ➔ **Create Worker**.
3. Nómbralo `quhealthy-staging-api-gateway` y haz clic en **Deploy**.
4. Haz clic en **Edit code**, pega el contenido de [`worker.js`](worker.js) y haz clic en **Deploy**.
5. Ve a la pestaña **Settings** del Worker ➔ **Domains & Routes** ➔ **Add** ➔ **Custom Domain**:
   - Escribe: `api-staging.quhealthy.org`
   - Cloudflare configurará automáticamente el registro DNS y el certificado TLS/SSL.

### Opción B: Con Wrangler CLI
```bash
cd infrastructure/cloudflare-staging-gateway
npx wrangler deploy
```

---

## 3. Configuración en Vercel para Staging

Una vez activo `api-staging.quhealthy.org`:
1. En Vercel (`v0-quhealthy` / rama `codex/portal-p0-p1-integration` o Preview):
   - Configura la variable de entorno para el ambiente **Preview**:
     ```
     NEXT_PUBLIC_API_URL=https://api-staging.quhealthy.org
     ```
2. Realiza un redeploy o nuevo commit para que el frontend apunte al Gateway unificado.

---

## 4. Verificación End-to-End

```bash
# 1. Probar salud del Gateway
curl -i https://api-staging.quhealthy.org/healthz

# 2. Probar liveness de auth
curl -i https://api-staging.quhealthy.org/api/auth/actuator/health/liveness

# 3. Probar catálogo público
curl -i https://api-staging.quhealthy.org/api/catalog/storefront

# 4. Probar liveness de citas
curl -i https://api-staging.quhealthy.org/api/appointments/actuator/health/liveness
```
