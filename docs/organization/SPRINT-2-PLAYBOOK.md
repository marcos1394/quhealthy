# SPRINT 2 PLAYBOOK — Ejecución Autónoma (Horizonte 2 / P1: Tracción, Retención, Copiloto Clínico y FinOps)

Este documento define las instrucciones exactas, alcance técnico, criterios de aceptación (DoD) y orden de ejecución para que cualquier agente de IA (Antigravity, Codex, Claude Code, Cursor) ejecute el **Sprint 2 (Horizonte 2 / P1)** de **QuHealthy** bajo el **Sistema Operativo Agéntico Lean v2**, con **autonomía de Nivel 1 (🟢) y Nivel 2 (🟡)** y **cero burocracia documental**.

---

## 1. Reglas de Oro para el Agente Ejecutor

1. **PROHIBIDO escribir propuestas burocráticas previas:** No crees archivos en `proposals/`, ni carpetas `specs/` con `brief.md`, `decision.md` o `execution-mandate.md`. Ve directo al código, tests, scripts o entregables operativos.
2. **El Pull Request con CI + pruebas en verde ES el entregable:** Todo cambio en `quhealthy` (Frontend) o `github-backend-java` (Backend) debe entregarse en una rama limpia con pruebas unitarias/integración/E2E pasando y PR abierto/listo para merge.
3. **Rutas de los Repositorios Locales:**
   - **Frontend (`marcos1394/quhealthy`):** `/Users/marcossandovalruiz/Documents/quhealthy` (rama principal: `master`)
   - **Backend (`marcos1394/github-backend-java`):** `/Users/marcossandovalruiz/IdeaProjects/github-backend-java` (rama principal: `main`)
   - **Operating System (`marcos1394/quhealthy-operating-system`):** `/Users/marcossandovalruiz/Documents/quhealthy-operating-system` (rama principal: `main`)
4. **Compuerta de Producción:** Nunca introduzcas una entidad JPA nueva en `github-backend-java` sin su migración/inicializador de esquema idempotente compatible con `spring.jpa.hibernate.ddl-auto: validate`.

---

## 2. Cola de Ejecución del Sprint 2 (En Orden de Prioridad)

### Bloque A — Escuadrones `product-engineering` + `data-ai-copilot` (Retención Clínica, Agenda, Telemedicina y Copiloto IA)

#### 1. `ENG-NOTIF-01` (P1): Recordatorios Automatizados de Cita y Acciones Rápidas Anti No-Show
- **Contexto actual:** `notification_service` y `appointment_service` procesan eventos de citas, pero se requiere garantizar la secuencia de recordatorios (24h y 2h antes) con enlaces directos de confirmación o reprogramación para reducir el ausentismo (*no-show*) por debajo del 10%.
- **Acción requerida:**
  1. Verificar/completar en `appointment_service` y `notification_service` el disparo de recordatorios de cita con token/enlace seguro de confirmación y reprogramación.
  2. Asegurar en `quhealthy` la vista/acción rápida de confirmación de cita para el paciente con selectores `data-testid` estables y pruebas unitarias.

#### 2. `ENG-CAL-01` (P1): Sincronización Bidireccional con Google Calendar para Doctores
- **Contexto actual:** Los médicos especialistas necesitan evitar dobles reservas entre su agenda externa y QuHealthy.
- **Acción requerida:**
  1. Auditar y completar la integración de Google Calendar en `appointment_service` / `onboarding_service` y el panel de configuración de agenda del médico en `quhealthy` (`/provider/dashboard/calendar` o settings).
  2. Garantizar manejo limpio de estados de conexión OAuth, bloqueo de horarios ocupados y pruebas unitarias de sincronización.

#### 3. `AI-COPILOT-01` (P1): Asistente Clínico Pre-Consulta (Triage) y Borrador SOAP en `Health OS Copilot`
- **Contexto actual:** QuHealthy cuenta con capacidades de IA clínica (`health_agent_service` / `appointment_service`), y se requiere conectar el formulario de motivo de consulta/antecedentes pre-cita con la generación de un borrador estructurado SOAP en la consola del médico.
- **Acción requerida:**
  1. Permitir que el paciente complete su motivo de consulta y síntomas previos a la cita, y que el médico visualice en su consola un borrador estructurado (`Subjetivo`, `Objetivo`, `Análisis`, `Plan`) claramente etiquetado como **"Sugerencia de Copiloto IA — Requiere revisión y firma del médico"** (`NOM-004`/`NOM-024`).
  2. Añadir pruebas unitarias en frontend y backend verificando que el borrador nunca cierre ni firme el expediente sin acción explícita del médico.

#### 4. `ENG-TELEMED-01` (P1): Resiliencia End-to-End de Videoconsulta (`LiveKit`) y Sala de Espera
- **Acción requerida:**
  1. Validar y endurecer en `quhealthy` (`useTeleconsultation`, `WaitingRoom`, `ConsultationRoom`) y `appointment_service` el manejo de reconexión automática ante microcortes de red, temporizador sincronizado con servidor y transición limpia entre sala de espera y videollamada activa con pruebas automatizadas.

---

### Bloque B — Escuadrón `growth-marketing` (SEO Programático, E-E-A-T Médico y Referidos)

#### 5. `MKT-SEO-02` (P1): Páginas Programáticas de Especialidad × Ciudad (Programmatic SEO)
- **Acción requerida en `quhealthy`:**
  1. Implementar/optimizar rutas dinámicas indexables con ISR para combinaciones de alta intención de búsqueda (ej. `/[locale]/especialistas/[specialty]/[city]` o equivalente en `/discover`), inyectando metadatos dinámicos (`generateMetadata`), canonical URLs, JSON-LD `ItemList`/`Physician` y actualización en `app/sitemap.ts`.
  2. Incluir pruebas unitarias de renderizado y generación de metadatos SEO.

#### 6. `MKT-CONTENT-01` (P1): Sello de Revisión Médica Verificada (E-E-A-T / YMYL) en Blog y Guías Clínicas
- **Acción requerida en `quhealthy`:**
  1. Añadir a las páginas de artículos del blog (`/blog/[slug]`) el componente de atribución clínica verificada (**"Revisado clínicamente por Dr(a). [Nombre], Cédula Profesional [Número]"**) junto con datos estructurados `MedicalWebPage` (`schema.org`) para maximizar autoridad orgánica en Google Salud (*YMYL*).

#### 7. `MKT-REF-01` (P1): Activación del Programa de Referidos Médico-a-Médico (`referral_service`)
- **Acción requerida:**
  1. Conectar y verificar la interfaz de invitaciones y códigos de referido para médicos en `quhealthy` con `referral_service` (`github-backend-java`), instrumentando el evento analítico `referral_invite_sent` en `lib/analytics/funnel-events.ts` (cero PII) con pruebas unitarias.

---

### Bloque C — Escuadrón `devsecops-sre` (FinOps, Seguridad de Cloud Storage IAM y Resiliencia DB)

#### 8. `OPS-FINOPS-01` & `OPS-SEC-02` (P1): Auditoría Automatizada de Costos Redis, Buckets GCS y Mínimo Privilegio IAM
- **Acción requerida en `quhealthy-operating-system` y `github-backend-java`:**
  1. Crear el script ejecutable `scripts/ops/audit-gcs-iam-and-finops.sh` que audite los 6 buckets de Cloud Storage (separando buckets públicos de catálogo/avatares vs buckets privados clínicos que exigen Signed URLs), detecte cuentas de servicio con `roles/editor` y genere el reporte/comandos de remediación de mínimo privilegio y optimización de Memorystore Redis.

#### 9. `OPS-DB-01` (P1): Verificación de Backups, Retención Clínica y RLS en Base de Datos
- **Acción requerida en `quhealthy-operating-system`:**
  1. Crear `scripts/ops/verify-db-backup-and-rls-policy.sh` y el runbook de recuperación ante desastres (`docs/operations/02-database-dr-and-rls-runbook.md`) certificando RPO/RTO de PostgreSQL (`xvqwhapfmkswozjhchvw`) y la política de retención mínima de 5 años exigida por `NOM-004-SSA3-2012`.

---

### Bloque D — Escuadrones `commercial-operations` & `founder-cos-gov` (Customer Success, B2B, ARCO y Data Room)

#### 10. `OPS-CS-01` & `COM-B2B-01` (P1): Playbook "Primera Cita en 7 Días" y Convenios Piloto B2B (Laboratorios e Insumos)
- **Acción requerida en `quhealthy-operating-system`:**
  1. Crear `docs/playbooks/02-first-appointment-7days-and-b2b-pilots.md` con la secuencia operativa de activación post-KYB para que todo médico verificado reciba su primera consulta pagada en < 7 días, más el contrato/propuesta comercial para los 2 primeros laboratorios (`/laboratory`) y 2 proveedores de insumos (`/supplier`).

#### 11. `LEG-PRIV-01` & `FIN-DATAROOM-01` (P1): Procedimiento ARCO / Portabilidad Clínica y Estructura de Data Room Pre-Seed
- **Acción requerida en `quhealthy-operating-system`:**
  1. Crear `docs/compliance/02-arco-rights-and-clinical-portability-sop.md` con el flujo técnico-legal para atender solicitudes de Acceso, Rectificación, Cancelación, Oposición y entrega de resumen clínico en los plazos de ley (`LFPDPPP` y `NOM-004`).
  2. Crear `docs/finance/02-pre-seed-dataroom-index-and-kpis.md` con el índice maestro del Data Room de inversión, tesis de la compañía, arquitectura verificada y tablero de métricas de cohorte (CAC, LTV, Payback, GMV, Take Rate, Net Dollar Retention).
