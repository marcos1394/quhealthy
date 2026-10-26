# Modelo Operativo Lean y OKRs de QuHealthy (v2)

**Estado:** Vigente (Octubre 2026 — Sustituye a los documentos burocráticos v1 `01` a `05`)
**Propietarios:** Fundadores + Escuadrón `founder-cos-gov`

---

## 1. Diagnóstico del Modelo v1 y Por Qué Cambiamos

El modelo organizacional v1 sufría de tres problemas estructurales para una startup de 2 fundadores:
1. **Fragmentación excesiva:** 15 agentes separados configurados en modo `read-only` que tenían prohibido escribir código, crear pruebas o ejecutar tareas operativas.
2. **Cadena burocrática de 7 pasos:** Antes de tocar una línea de código se exigía `Investigación → Propuesta MD → Revisión Chief of Staff → Agenda de Junta → Registro de Decisión → Carpeta Spec de 5 archivos → Ticket`. Esto generó más de 70 documentos administrativos mientras frenaba el avance real del producto y del go-to-market.
3. **Desfase entre papel y código:** El portafolio documental marcaba como "en descubrimiento" flujos que ya estaban implementados o requerían validación técnica directa en Staging/Producción.

---

## 2. Nuevo Flujo Operativo (De Idea a Producción en 3 Pasos)

```text
1. Priorización en BACKLOG.md (Impacto / Esfuerzo)
       │
       ▼
2. Ejecución Directa por Squad Autónomo (Código + Tests + Staging E2E / Playbook Operativo)
       │
       ▼
3. Compuerta Automática CI/CD → Merge a Producción → Medición de KPI
```

- **Sin propuestas intermedias para trabajo Nivel 1 (🟢) y Nivel 2 (🟡):** El Pull Request con CI en verde y evidencia de prueba E2E es el único artefacto requerido para cambios de producto, tecnología, SEO y DevSecOps.
- **Confirmación humana rápida (🔴 Nivel 3):** Sólo se solicita aprobación explícita antes de gastar presupuesto externo (Ads/infraestructura), enviar comunicaciones reales a terceros, alterar cuentas financieras o borrar datos productivos.

---

## 3. Cuña Comercial Inicial (Go-To-Market Wedge)

Para evitar dispersión entre 8 segmentos simultáneos, el foco comercial y de producto se concentra en orden de prioridad:

1. **Cuña Primaria (Oferta Core):** Médicos especialistas de consulta privada y clínicas ambulatorias en México (Suscripción SaaS + Agenda Inteligente + Expediente Clínico / Receta Digital + Cobro en línea con Stripe Connect + Perfil en Directorio).
2. **Cuña Secundaria (Liquidez de Pacientes):** Pacientes que buscan consulta presencial o telemedicina con reserva sin fricción y seguimiento en su portal de salud.
3. **Ecosistema B2B Complementario (Ya habilitado en código, activación por alianzas):** Proveedores de insumos médicos (`/supplier`), laboratorios (`/laboratory`) y fundaciones (`/foundation`).

---

## 4. Objetivos y Resultados Clave (OKRs Q4 2026)

| Objetivo | Resultado Clave (KR) | Squad Líder | Fuente de Verdad |
| :--- | :--- | :--- | :--- |
| **O1. Confiabilidad y Cierre del Embudo Clínico-Transaccional** | **KR1.1:** 100% de los flujos críticos (Login, Reserva, Consulta, Receta, Consentimiento y Pago) con compuerta E2E automatizada en Staging y CI en verde.<br>**KR1.2:** 0 errores 5xx no controlados en los 12 microservicios de Cloud Run y tiempo de respuesta P95 < 500 ms. | `product-engineering` + `devsecops-sre` | GitHub Actions, Playwright, Cloud Monitoring |
| **O2. Adquisición y Activación de Doctores (Oferta)** | **KR2.1:** Primeros **20 médicos especialistas / clínicas verificados** con agenda activa y perfil público indexado.<br>**KR2.2:** SLA de verificación KYB (Cédula DGP) y onboarding completo < 24 horas.<br>**KR2.3:** Activar cobro recurrente SaaS y onboarding de Stripe Connect Express en producción. | `commercial-operations` + `growth-marketing` | Admin Portal (`/verification`), Supabase (`auth`/`onboarding`), Stripe |
| **O3. Adquisición Orgánica de Pacientes y Conversión (Demanda)** | **KR3.1:** Publicar e indexar en Google Search Console el directorio programático por especialidad y ciudad + páginas `/business`.<br>**KR3.2:** Instrumentar 100% del embudo en GA4 (`view_doctor` → `start_booking` → `appointment_created` → `consultation_completed`). | `growth-marketing` + `product-engineering` | Google Search Console, GA4, `analytics_service` |
| **O4. Gobierno Financiero, Seguridad y Cumplimiento Clínico** | **KR4.1:** Gasto cloud mensual total (GCP + Vercel + Supabase) bajo control (< MXN $1,000/mes en etapa semilla) y origen Cloud Run protegido detrás de Cloudflare.<br>**KR4.2:** Matriz técnica y jurídica de cumplimiento `NOM-004`, `NOM-024` y `LFPDPPP` implementada sobre el flujo real de expediente y consentimiento. | `devsecops-sre` + `founder-cos-gov` | GCP Billing, Cloudflare, Auditoría Clínica-Legal |
