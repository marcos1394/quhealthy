# QuHealthy Web Frontend

Frontend web oficial del ecosistema digital de salud **QuHealthy** y su sistema operativo clínico interactivo (**Health OS**).

Construido sobre una arquitectura multinquilino (*multi-portal*) con **Next.js 16 (App Router)**, **React 19**, **TypeScript** y **Tailwind CSS**, conectando a pacientes, profesionales de la salud, laboratorios, proveedores de insumos, fundaciones y administradores.

---

## 🚀 Stack Tecnológico

| Capa / Herramienta | Tecnología / Versión | Propósito |
| :--- | :--- | :--- |
| **Framework Base** | Next.js 16.2.6 (App Router + Turbopack) | Server Components, Server Actions y SSR/SSG multilingüe |
| **Librería UI** | React 19.2.3 | Interfaz de usuario declarativa |
| **Lenguaje** | TypeScript 5.9.2 | Tipado estricto extremo y verificación estática |
| **Estilos y Componentes** | Tailwind CSS 3.4 + Radix UI + Framer Motion | Sistema de diseño basado en componentes accesibles |
| **Internacionalización** | `next-intl` 4.8.3 | Soporte nativo para español (`es`) e inglés (`en`) con prefijo de ruta |
| **Contrato Health OS** | `@quhealthy/health-os-contract` (paquete local) | Interfaces tipadas de Widgets, Acciones e Intenciones de IA |
| **Estado Global** | Zustand 5.0.8 | Manejo reactivo de sesiones, teleconsultas y copilot |
| **Telemedicina** | LiveKit Client 2.20 | Videoconsultas en tiempo real con WebRTC; los controles de seguridad se validan por entorno |
| **Pasarela de Pagos** | Stripe JS 7.9 | Checkout de citas, marketplace y soporte de pagos con Stripe Connect |
| **PWA** | `next-pwa` 5.6 | Experiencia instalable como aplicación progresiva |

---

## 🏛️ Estructura de Portales y Actores

El enrutamiento está centralizado en `app/[locale]/` mediante Route Groups que aíslan las áreas según el tipo de usuario:

```text
app/[locale]/
├── (public)/         # Páginas públicas (Home, Marketplace, Directorio, Blog, Legal)
├── (platform)/
│   ├── patient/      # Portal del Paciente (Citas, Health Vault, Familia, Teleconsulta)
│   ├── provider/     # Portal del Médico/Clínica (Agenda, Consulta, Pacientes, Cobros)
│   └── copilot/      # Health OS Copilot (Chat asistido por IA con renderizado de widgets)
├── (laboratory)/     # Portal de Laboratorios (Órdenes, Resultados, Cumplimiento)
├── (supplier)/       # Portal de Proveedores de Insumos Médicos (Catálogo, Pedidos, Cadena de frío)
├── (foundation)/     # Portal de Fundaciones (Programas sociales, Subsidios, Beneficiarios)
├── admin/            # Portal de Administración Central (accesible vía subdominio admin.quhealthy.org)
├── (auth)/           # Flujos de autenticación (Login, Registro por rol, Recuperación)
├── onboarding/       # Asistentes de registro y verificación para cada rol
└── patient/
    └── prescription/ # Visualizador público mediante identificador o token de receta
```

---

## 📁 Estructura del Proyecto

```text
quhealthy/
├── app/                  # Rutas de la aplicación (App Router de Next.js)
│   ├── [locale]/         # Rutas internacionalizadas (es/en) y portales
│   ├── actions/          # Server Actions para auth cookies, contacto y soporte
│   └── api/              # Handlers API locales de soporte
├── components/           # Componentes UI organizados por dominio
│   ├── engine/           # Motor de renderizado dinámico (WidgetRenderer.tsx)
│   ├── widgets/          # 16+ Widgets interactivos de Health OS (DoctorCard, Payment, etc.)
│   ├── ai/               # Componentes del asistente Pulso (PulsoMascot.tsx)
│   └── ui/               # Primitivas de diseño (botones, diálogos, formularios)
├── constants/            # Constantes de configuración de la plataforma
├── docs/                 # Documentación técnica de arquitectura del frontend
│   └── architecture/     # Guías detalladas de arquitectura y diseño
├── hooks/                # 75+ Custom React Hooks para lógica de negocio y consumo de APIs
├── i18n/                 # Configuración de rutas y resolución de locale con next-intl
├── messages/             # Archivos de traducción i18n (es.json, en.json)
├── packages/
│   └── health-os-contract/ # Paquete local con los contratos tipados de Health OS
├── services/             # Clientes de servicio HTTP tipados hacia el backend
├── stores/               # Stores de Zustand (SessionStore, useHealthOSStore, TeleconsultationStore)
├── types/                # Definiciones globales de TypeScript
├── proxy.ts              # Middleware de seguridad, subdominios e i18n
└── next.config.ts        # Configuración de compilación, headers de seguridad (CSP) y PWA
```

---

## ⚙️ Configuración y Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto basado en las variables requeridas:

```env
# URL base del Backend Gateway (Google Cloud Run / Spring Boot)
NEXT_PUBLIC_API_URL=https://api.quhealthy.org

# Integración con Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=tu_google_client_id
```

> **Nota de red:** El frontend se comunica de forma directa con el backend configurado en `NEXT_PUBLIC_API_URL`. La configuración CORS y de cookies debe validarse en cada entorno. El *rewrite proxy* se eliminó para evitar la pérdida de cabeceras `Set-Cookie` observada en ese flujo (`refreshToken`, `__Secure-userRole`).

---

## 🛠️ Comandos de Desarrollo

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo con Turbopack
npm run dev

# Verificación estática de tipos (TypeScript)
npm run type-check

# Análisis de linter (ESLint)
npm run lint

# Compilar para producción
npm run build

# Iniciar servidor de producción
npm run start
```

---

## 📖 Documentación de Arquitectura

Para profundizar en el diseño interno y los flujos del sistema:

* [01 - Visión General de Arquitectura](docs/architecture/01-system-overview.md) *(Ciclo de request, proxy, subdominios y seguridad)*
* [02 - Portales, Ruteo y Matriz de Seguridad](docs/architecture/02-routing-and-portals.md) *(Roles, guards, anti-rebote y catálogo de los 7 portales)*
* [03 - Motor Health OS: Copilot, Widgets y Action Engine](docs/architecture/03-health-os-copilot.md) *(Contrato, Generative UI, catálogo de 16 widgets y Pulso)*
* [04 - Capa de Estado Zustand y Servicios API](docs/architecture/04-state-and-services.md) *(Stores globales, transporte HTTP y servicios; validar inventario con el código)*
* [05 - Integraciones Externas y Servicios de Terceros](docs/architecture/05-integrations.md) *(LiveKit WebRTC, Stripe Connect, Maps, Turnstile y Resend)*
