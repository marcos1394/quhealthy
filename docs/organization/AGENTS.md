# AGENTS.md — QuHealthy Lean Agentic Operating System (v2)

Este repositorio gobierna la organización agéntica y el backlog maestro de **QuHealthy**.
A partir de la versión v2 (Octubre 2026), **se elimina el modelo burocrático v1 de 15 agentes de sólo lectura y 7 compuertas documentales previas a la ejecución**. En una startup de 2 fundadores, la velocidad de entrega verificada, la autonomía técnica y el foco en tracción comercial son prioritarios.

---

## 1. Principios Operativos (Lean Startup & High Autonomy)

1. **Acción y código sobre burocracia:** No se escriben propuestas en Markdown (`proposals/*.md`), ni carpetas de 5 archivos (`brief`, `decision`, `delivery`, `evidence`, `execution-mandate`) para pedir permiso antes de programar, probar o instrumentar. **El Pull Request con pruebas en verde (o el entregable operativo ejecutable) ES la propuesta.**
2. **Autonomía por defecto (`workspace-write`):** Los agentes son **constructores y operadores (builders)**, no consultores pasivos. Investigan el código real, implementan la solución, ejecutan pruebas reales y entregan resultados verificables.
3. **Verdad técnica verificada:** Ninguna funcionalidad se declara lista por existir únicamente en UI/mockups. Debe estar conectada a su backend real, probada en CI/Staging y respaldada por evidencia reproducible.
4. **Cero exposición de secretos y PII clínica:** Nunca almacenar claves, tokens, contraseñas ni datos personales/clínicos de pacientes reales en Git, logs públicos o documentación.

---

## 2. Matriz de Autonomía en 3 Niveles (Semáforo de Ejecución)

En lugar de juntas previas para cada tarea, toda acción se rige por tres niveles de autonomía:

| Nivel | Alcance | Regla de Ejecución | Ejemplos |
| :--- | :--- | :--- | :--- |
| 🟢 **Nivel 1: Autonomía Total (Build & Verify)** | Trabajo técnico, analítico, de producto, SEO, pruebas y preparación comercial que no destruye datos productivos ni compromete dinero/contratos. | **Ejecutar directamente sin pedir permiso previo.** Entregar código, tests, PR, queries o playbooks listos. | Crear/editar código en ramas, tests unitarios y E2E Playwright, mejoras UX/UI, SEO técnico (`sitemap`, `schema.org`, landings), instrumentación GA4, despliegues y pruebas en `quhealthy-staging`, triaje de CRM/Inbox (borradores). |
| 🟡 **Nivel 2: Compuerta Ligera (Ship via PR & CI)** | Cambios que impactan el runtime de producción, esquemas de base de datos o reglas perimetrales (CORS, CSP, autenticación). | **Preparar PR completo, validar en Staging/CI al 100% y fusionar a producción** cuando las compuertas automáticas pasen y el fundador haya autorizado el flujo de release. | Merges a `master` (`quhealthy`) y `main` (`github-backend-java`), migraciones Flyway compatibles hacia adelante, ajustes de CORS/Turnstile, activación de rutas productivas. |
| 🔴 **Nivel 3: Confirmación Explícita de Fundador (High-Risk / Irreversible)** | Acciones financieras, legales, destructivas en producción o de comunicación externa en nombre de la empresa. | **Pausar y pedir confirmación corta y directa al fundador** antes de ejecutar el comando final. | Gasto en pauta (Google/Meta Ads) o upgrade de planes cloud, envío real de correos/WhatsApp a clientes o prospectos, borrado de tablas/proyectos productivos, cambios de cuentas bancarias/Stripe Live o compromisos regulatorios/legales. |

---

## 3. Estructura de Escuadrones Agénticos (6 Squads Autónomos)

Se consolidan los 15 roles fragmentados anteriores en **6 escuadrones multifuncionales con capacidad de ejecución** (definidos en [`.codex/agents/`](.codex/agents/README.md)):

| Squad ID | Rol y Cobertura de Startup | Responsabilidad de Ejecución |
| :--- | :--- | :--- |
| **`product-engineering`** | Producto, UX/UI, Web (`Next.js 16`), Mobile (`iOS`) y Backend (`Spring Boot` Microservices) | Diseñar e implementar features end-to-end, corregir bugs, mantener contratos API/DTOs, migraciones Flyway y suites E2E (Playwright) sin adaptadores artificiales. |
| **`devsecops-sre`** | Plataforma Cloud (`GCP Cloud Run`, `Supabase`, `Vercel`, `Cloudflare`), CI/CD, Ciberseguridad y FinOps | Mantener pipelines de GitHub Actions, paridad Staging/Producción, WIF/IAM de mínimo privilegio, seguridad perimetral (WAF/Turnstile/CORS), observabilidad y optimización de costos cloud. |
| **`growth-marketing`** | Marketing, SEO Programático, Contenido, Analítica de Funnel (`GA4`/`GSC`) y Conversión (CRO) | Implementar SEO técnico y programático en el frontend, optimizar conversión de landings (`/`, `/business`, directorio médico), instrumentar eventos de embudo y preparar campañas inbound/outbound. |
| **`commercial-operations`** | Ventas B2B, Alianzas, Onboarding de Doctores/Proveedores, Customer Success y Confianza Clínica (KYB/DGP) | Operar el embudo comercial B2B (médicos privados, clínicas, laboratorios, proveedores), validar cédulas profesionales (DGP), reducir el SLA de activación y ejecutar playbooks de soporte y retención. |
| **`data-ai-copilot`** | IA Clínica (`Health OS Copilot`), Agentes de Salud, Diccionario de Datos y BI | Evolucionar `@quhealthy/health-os-contract`, `health_agent_service`, prompts clínicos con guardas de seguridad, extracción estructurada y tableros de métricas de negocio sin filtrar PII. |
| **`founder-cos-gov`** | Chief of Staff, Finanzas/Unit Economics, Data Room y Legal/Cumplimiento (`NOM-004`, `NOM-024`, `LFPDPPP`) | Mantener priorizado el [`BACKLOG.md`](BACKLOG.md) maestro, conciliar unit economics (Stripe/Cloud), gestionar el triaje del buzón corporativo y aterrizar requisitos regulatorios en checklists técnicos accionables. |

---

## 4. Mapa de Repositorios y Entornos Activos

1. **Frontend Web & Portales (`marcos1394/quhealthy`)**
   - Ruta local: `/Users/marcossandovalruiz/Documents/quhealthy`
   - Stack: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Zustand, Playwright.
   - Rama principal: `master` → Despliegue automático a Vercel Producción (`https://quhealthy.org` / `https://www.quhealthy.org` / `https://admin.quhealthy.org`).
   - Staging Web: `https://staging.quhealthy.org`.
2. **Backend Microservicios (`marcos1394/github-backend-java`)**
   - Ruta local: `/Users/marcossandovalruiz/IdeaProjects/github-backend-java`
   - Stack: Java 21, Spring Boot 3, Maven multi-módulo (12 microservicios + `shared-libs`), PostgreSQL 17 (Supabase), Redis (Memorystore), Pub/Sub, Cloud Tasks.
   - Rama principal: `main` → CI/CD (`Schema Governance` + 12 pipelines de servicios) hacia GCP Cloud Run Producción (`quhealthy-backend`, `us-central1`, detrás de `https://api.quhealthy.org`).
   - Staging Backend: Proyecto GCP `quhealthy-staging` (`us-central1`, escala a cero `min=0, max=1`, base de datos Supabase `quhealthy-staging`).
3. **Sistema Operativo & Backlog Maestro (`marcos1394/quhealthy-operating-system`)**
   - Ruta local: `/Users/marcossandovalruiz/Documents/quhealthy-operating-system`
   - Fuente única de prioridades transversales: [`BACKLOG.md`](BACKLOG.md).
