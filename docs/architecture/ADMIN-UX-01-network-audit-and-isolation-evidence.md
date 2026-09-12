# Evidencia de Aislamiento de Superficie Administrativa & Auditoría de Red [P0][ADMIN-UX-01]

**Issue GitHub:** [marcos1394/quhealthy#44](https://github.com/marcos1394/quhealthy/issues/44)  
**Pull Request:** [marcos1394/quhealthy#51](https://github.com/marcos1394/quhealthy/pull/51)  
**Fecha:** 2026-09-11  
**Estado:** ✅ Aislamiento Total Verificado & WAI-ARIA WCAG Compliant

---

## 1. Diagrama de Layouts & Providers (Antes vs. Después)

### Estado Anterior (Fuga de Scripts y Metadatos en Root Layout)
```
app/[locale]/layout.tsx (ROOT LAYOUT)
 ├── <head>
 │    └── <script type="application/ld+json"> (jsonLdGlobal público de Organización y Búsqueda) ⚠️
 ├── NextIntlClientProvider
 ├── CustomProvider
 ├── ToastProvider
 ├── <ConsumerPlatformBoundary /> (Retornaba null en admin)
 ├── <Analytics /> (Vercel Analytics incondicional en admin) ⚠️
 └── <SpeedInsights /> (Vercel Speed Insights incondicional en admin) ⚠️
```
*Problema:* Aunque `ConsumerPlatformBoundary` devolvía `null`, el root layout inyectaba Schema.org JSON-LD de consumidor, Vercel Analytics y Speed Insights en las rutas `/admin` y el subdominio `admin.quhealthy.org`.

### Estado Remediado (Aislamiento Arquitectónico Estricto)
```
app/[locale]/layout.tsx (ROOT LAYOUT NEUTRO)
 ├── NextIntlClientProvider
 ├── CustomProvider
 ├── ToastProvider
 └── <ConsumerPlatformBoundary />
      ├── [RUTAS CONSUMIDOR: /, /doctors, /es/about, etc.]
      │    ├── <AnalyticsManager /> (GTM / GA4)
      │    ├── <TelemetryTracker />
      │    ├── <CookieConsent /> & <LocationPrompt />
      │    ├── <PulsoFloatingAssistant />
      │    ├── Chatwoot Live Chat Script
      │    ├── Google Customer Reviews Badge Script
      │    ├── <Analytics /> (Vercel Analytics)
      │    └── <SpeedInsights /> (Vercel Speed Insights)
      └── [RUTAS ADMIN: /admin/*, /:locale/admin/*, admin.quhealthy.org]
           └── Retorna null incondicionalmente (CERO scripts, trackers ni widgets)

app/[locale]/(public)/layout.tsx (ÁRBOL PÚBLICO EXCLUSIVO)
 └── <script type="application/ld+json"> (jsonLdGlobal: Organization & SearchAction)
      └── PublicLayoutShell (Header público, contenido, Footer)

app/[locale]/admin/layout.tsx (ÁRBOL ADMINISTRATIVO EXCLUSIVO)
 ├── Metadata Robots: { index: false, follow: false, nocache: true }
 └── AdminLayout (Contenedor aislado sin tracking ni metadata pública)
```

---

## 2. Manifiesto Sanitizado de Peticiones de Red (HAR Audit)

Inspección de red de la superficie administrativa (`/admin/login` y `/admin/dashboard`):

| Dominio / Endpoint | Tipo de Recurso | Superficie Admin (`/admin/*`) | Superficie Consumidor | Razón / Política |
| :--- | :--- | :--- | :--- | :--- |
| `https://www.googletagmanager.com/*` | Tracker / GTM | **0 peticiones (BLOQUEADO)** | Permitido con consentimiento | Aislamiento de telemetría de consumidor |
| `https://www.google-analytics.com/*` | Tracker / GA4 | **0 peticiones (BLOQUEADO)** | Permitido con consentimiento | Prohibido en datos confidenciales de salud |
| `https://app.chatwoot.com/*` | Script Chat en Vivo | **0 peticiones (BLOQUEADO)** | Permitido | Canal de soporte público no administrativo |
| `https://www.gstatic.com/shopping/merchant/*` | Widget Comercio Google | **0 peticiones (BLOQUEADO)** | Permitido | Comercio de medicamentos y citas |
| `/_vercel/insights/*` | Vercel Web Analytics | **0 peticiones (BLOQUEADO)** | Permitido | Rastreo de navegación pública |
| `/_vercel/speed-insights/*` | Vercel Speed Insights | **0 peticiones (BLOQUEADO)** | Permitido | Métricas de rendimiento de consumidor |
| `navigator.geolocation.getCurrentPosition` | API Geolocalización | **0 llamadas (BLOQUEADO)** | Permitido bajo solicitud | Ubicación de farmacias/clínicas cercanas |
| WebSocket / Streaming Pulso AI | Asistente Clínico | **0 conexiones (BLOQUEADO)** | Permitido | Asistente de triaje clínico de pacientes |
| `application/ld+json` (SearchAction) | Schema.org JSON-LD | **0 etiquetas (EXCLUIDO)** | Inyectado | Indexación y búsqueda pública de Google |

---

## 3. Auditoría de Seguridad de Encabezados y Cookies

### Encabezados HTTP Administrativos (en `next.config.ts` y middleware)
- `X-Robots-Tag: noindex, nofollow, noarchive`
- `Cache-Control: no-store, max-age=0, must-revalidate`
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`

### Cookies en Superficie Administrativa
- Cero cookies de publicidad, remarketing o píxeles de terceros (`_ga`, `_fbp`, etc.).
- Únicamente cookies de sesión esenciales:
  - `refreshToken`: `HttpOnly; Secure; SameSite=None/Lax; Path=/`
  - `__Secure-userRole`: `Secure; SameSite=None/Lax; Path=/`

---

## 4. Auditoría de Accesibilidad WAI-ARIA & Recorrido de Teclado

### A. Patrón Roving TabIndex en Tabs (`AdminSidebar.tsx` & `AdminHeader.tsx`)
- **`role="tablist"` vertical** (`AdminSidebar.tsx`):
  - Tab seleccionado: `tabIndex={0}`.
  - Tabs no seleccionados: `tabIndex={-1}`.
  - Teclas de flecha:
    - `ArrowDown`: Mueve el foco a la siguiente pestaña con ciclo circular.
    - `ArrowUp`: Mueve el foco a la pestaña anterior con ciclo circular.
    - `Home`: Enfoca la primera pestaña (`pulse`).
    - `End`: Enfoca la última pestaña (`health`).
- **`role="tablist"` horizontal de períodos** (`AdminHeader.tsx`):
  - Roving tabindex en `24h`, `7d`, `30d`, `month`.
  - `ArrowRight` / `ArrowLeft`: Mueve el foco horizontalmente.
  - `Home` / `End`: Primera / última opción de período.

### B. Manejo de Foco en Diálogo Móvil (`AdminSidebar.tsx`)
- **Foco Inicial**: Al abrir el drawer móvil (`isMobileOpen = true`), el foco se coloca inmediatamente en el botón de cerrar (`✕`).
- **Focus Trap**: El diálogo captura los eventos `Tab` y `Shift+Tab`. Al tabular en el último elemento interactivo, el foco regresa al primero; al tabular hacia atrás en el primero, se envuelve al último.
- **Escape**: Cierra el drawer móvil.
- **Restauración de Foco**: Al cerrarse el modal, el foco se restaura automáticamente al elemento que lo abrió (botón hamburguesa de navegación en el header).
