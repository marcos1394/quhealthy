# PLAYBOOK DE EJECUCIÓN: SPRINT 4 (HORIZONTE 4 / P2+ — TELEMETRÍA EJECUTIVA EN VIVO, CONCILIACIÓN STRIPE/CFDI 4.0, ÓRDENES B2B LABS Y LANZAMIENTO MOBILE iOS)

> **Propósito:** Ejecutar de principio a fin las Historias de Usuario (HUs) del **Horizonte 4 (Sprint 4)** tras el cierre y despliegue exitoso en Staging y Producción de los Sprints 1, 2 y 3 (Frontend + Backend + Radar Ejecutivo de las 6 Aristas en el Portal de Administrador).
> **Regla de Oro:** Cero documentos burocráticos intermedios (`proposals/`, `brief.md`, `decision.md`). Todo agente va directo al código en `quhealthy` (Frontend) y `github-backend-java` (Backend), escribe pruebas automatizadas, abre/actualiza PRs, verifica CI en verde y despliega en Staging y Producción.

---

## 1. Mapa de Ejecución por Escuadrón (Sprint 4)

### Bloque A: `founder-cos-gov` + `product-engineering` (Portal de Admin en Vivo & Conciliación Financiera CFDI 4.0)

1. **`ADMIN-PULSE-02` — Telemetría Real de las 6 Aristas Conectada en Vivo en el Portal del Administrador:**
   - **Problema:** En el Sprint 3 rediseñamos el Portal del Administrador (`TabExecutivePulse.tsx` + `StartupAristasRadar.tsx`) para eliminar la saturación visual y mostrar las 6 Aristas de la Startup (`product-engineering`, `data-ai-copilot`, `growth-marketing`, `commercial-operations`, `devsecops-sre`, `founder-cos-gov`). Ahora debemos conectar contadores operativos en vivo desde el backend para cada arista.
   - **Acción en Backend (`github-backend-java` - `appointment_service` / `payment_service`):**
     * Enriquecer el endpoint administrativo (`AdminMetricsController` en `appointment_service`: `GET /api/appointments/admin/metrics` o `/api/appointments/admin/startup-pulse`) para devolver métricas reales auditables:
       - `signedConsentsCount` (total de consentimientos `NOM-004` firmados en el periodo),
       - `aiSoapDraftsCount` (total de borradores SOAP generados en staging),
       - `activeTreatmentPlansCount` (planes longitudinales activos),
       - `b2bOrdersCount` (órdenes de laboratorio/insumos).
   - **Acción en Frontend (`quhealthy`):**
     * Conectar `services/admin.service.ts` y `StartupAristasRadar.tsx` a los nuevos campos del DTO con selectores `data-testid="arista-live-telemetry-badge"` manteniendo la regla `ADMIN-TRUST-01` (nunca inventar ceros falsos si el servicio no responde).
   - **Verificación:** Test unitario en `AdminMetricsServiceTest.java` y `tests/admin/TabExecutivePulse.test.tsx`.

2. **`ENG-BILLING-01` — Conciliación Automática Stripe Balance & Solicitud de Factura CFDI 4.0:**
   - **Problema:** Los médicos y pacientes en México requieren solicitar su CFDI 4.0 tras un cobro confirmado en Stripe, y el Admin Portal requiere distinguir transacciones conciliadas (`CERTIFIED`) vs provisionales (`PROVISIONAL`).
   - **Acción en Backend (`github-backend-java` - `payment_service`) y Frontend (`quhealthy`):**
     * Asegurar que el endpoint de facturación/transacciones exponga el estado de conciliación y permita solicitar timbrado CFDI 4.0 con validación de RFC y Régimen Fiscal SAT (`lib/fiscal/cfdi-validator.ts` + componente/acción con `data-testid="cfdi-invoice-request-btn"`).
   - **Verificación:** Suite unitaria `tests/fiscal/cfdi-validator.test.ts` validando RFC (persona física 13 caracteres / persona moral 12 caracteres), código postal y uso de CFDI (`D01` Honorarios médicos, `G03` Gastos en general).

---

### Bloque B: `commercial-operations` + `product-engineering` (Órdenes Clínicas B2B Laboratorios y Trazabilidad de Subsidios en Fundaciones)

3. **`COM-B2B-ORDERS-01` — Flujo End-to-End de Órdenes de Laboratorio e Insumos Biomédicos:**
   - **Problema:** Los portales `/laboratory` y `/supplier` ya están en producción, pero necesitamos cerrar el ciclo entre la orden de estudios emitida por el médico en la consulta y el cambio de estado en el portal del laboratorio (`ORDERED` -> `SAMPLE_COLLECTED` -> `RESULTS_READY`).
   - **Acción en Backend (`github-backend-java` - `appointment_service`) y Frontend (`quhealthy`):**
     * Implementar/verificar el servicio y componente de seguimiento de órdenes clínicas B2B con selector `data-testid="b2b-lab-order-status-badge"` y actualización de estado en el dashboard de laboratorio/paciente.
   - **Verificación:** Test automatizado `tests/b2b/LabOrderFulfillment.test.tsx`.

4. **`COM-FOUNDATION-02` — Gobernanza y Aprobación de Subsidios Asistenciales en `/foundation` y Admin Portal:**
   - **Problema:** El botón de solicitud de subsidio (`data-testid="foundation-subsidy-apply-btn"`) ya está activo en `/foundation/[id]`. Falta conectar la bandeja de aprobación e impacto social dentro de `TabFoundations.tsx` en el Portal de Administrador.
   - **Acción en Frontend (`quhealthy`) y Backend (`github-backend-java`):**
     * Enriquecer `app/[locale]/admin/dashboard/tabs/TabFoundations.tsx` con indicadores claros de beneficiarios atendidos, solicitudes de subsidio y estado de convenio (`data-testid="admin-foundation-impact-table"`).
   - **Verificación:** Test unitario `tests/admin/TabFoundations.test.tsx`.

---

### Bloque C: `data-ai-copilot` + `growth-marketing` (Persistencia del Plan Longitudinal IA y Automatización CRM Preventiva)

5. **`AI-LONGITUDINAL-02` — API Backend para Plan de Cuidados Longitudinal 7/30/90/180 Días:**
   - **Problema:** El widget `LongitudinalFollowUpWidget.tsx` ya está montado en el dashboard del paciente (`/patient/dashboard`), pero necesita un endpoint dedicado en `appointment_service` que calcule los hitos 7/30/90/180 días a partir de la última consulta y planes de tratamiento activos del paciente.
   - **Acción en Backend (`github-backend-java` - `appointment_service`) y Frontend (`quhealthy`):**
     * Exponer `GET /api/appointments/treatment-plans/consumer/{consumerId}/longitudinal` en `TreatmentPlanController.java` devolviendo los hitos de seguimiento 7/30/90/180 días y conectar el servicio frontend con fallback seguro.
   - **Verificación:** Test unitario en `appointment_service` y `tests/clinical/longitudinal-plan.test.ts`.

6. **`MKT-CRM-02` — Cron Job de Reactivación Preventiva LFPDPPP en `notification_service` / `appointment_service`:**
   - **Problema:** El motor de elegibilidad de reactivación preventiva (`lib/crm/preventive-reactivation.ts`) ya existe en frontend; falta el endpoint de cron en backend (`/api/internal/cron/send-preventive-reactivations` protegido por `X-CloudScheduler: true`) para disparar recordatorios preventivos respetando el opt-out (`LFPDPPP`) y cero PII sensible.
   - **Acción en Backend (`github-backend-java` - `appointment_service`):**
     * Agregar `POST /api/internal/cron/send-preventive-reactivations` en `InternalCronController.java` con validación estricta del header `X-CloudScheduler`.
   - **Verificación:** Test unitario en `appointment_service`.

---

### Bloque D: `devsecops-sre` + `founder-cos-gov` (Puente Nativo iOS TestFlight, FinOps por Consulta y Data Room Serie Seed)

7. **`ENG-IOS-02` — Configuración de Puente Nativo iOS (Deep Links + Push Bridge + WebRTC Permissions):**
   - **Problema:** Con `apple-app-site-association` y `POST /api/notifications/devices` ya en vivo, necesitamos el módulo de puente nativo (`lib/mobile/native-bridge.ts`) que detecte ejecución dentro de contenedor iOS/Android (`WKWebView` / Capacitor), gestione permisos nativos de cámara/micrófono para teleconsulta `LiveKit` y sincronice el token Push automáticamente tras login.
   - **Acción:** Crear `lib/mobile/native-bridge.ts` y su suite de pruebas `tests/mobile/native-bridge.test.ts`.

8. **`OPS-FINOPS-02` & `FIN-SEED-02` — Unit Economics por Consulta (Cloud Run + Vertex AI + Stripe) y Dossier de Escalado Seed:**
   - **Acción:**
     * Crear calculadora auditable de Unit Economics por consulta/suscripción (`lib/finops/unit-economics-calculator.ts` + test) e integrarla en `TabUnitEconomics.tsx`.
     * Actualizar `BACKLOG.md` marcando el estado de cierre del Sprint 4 tras desplegar en Staging y Producción.

---

## 2. Compuertas de Calidad Obligatorias (Definition of Done — Sprint 4)

1. **`github-backend-java`:**
   - `mvn test` en verde en todos los microservicios modificados (`appointment_service`, `payment_service`, `catalog_service`, `notification_service`).
   - Cero cambios a entidades JPA sin su inicializador/migración idempotente compatible con `ddl-auto: validate`.
   - Push a `main` y `staging`, verificando workflows de GitHub Actions y despliegue en Cloud Run (`Staging` y `Producción`).
2. **`quhealthy`:**
   - `npm run type-check` con `0` errores.
   - `npx vitest run --maxWorkers=2` con `100%` de suites en verde.
   - Push a `master` y `staging`, verificando `Enterprise Frontend CI/CD` en verde en ambos ambientes.
3. **`quhealthy-operating-system`:**
   - `BACKLOG.md` actualizado reflejando el cierre verificable del Sprint 4 con hashes de commit y URLs de ejecución de CI/CD.
