# HU-EHR-024 — Cierre Clínico Estructurado de Consulta y Flujo UI de Consentimiento de IA en Teleconsulta

- **ID:** `HU-EHR-024`
- **Estado:** En Backlog (Separada del Cierre Operativo de Agenda de Iteración 2.5 / 2.5.1)
- **Módulos involucrados:** `quhealthy` (Frontend `/provider/consultation/[id]`, `/patient/video-call/[id]`), `appointment_service` (`ConsultationService`, `TeleconsultationService`, `ClinicalSubmissionService`)
- **Marco normativo de referencia (requiere dictamen clínico-jurídico):**
  - [NOM-004-SSA3-2012, Del expediente clínico](https://dof.gob.mx/normasOficiales/4909/SALUD/SALUD.html)
  - [NOM-024-SSA3-2012, Sistemas de información de registro electrónico para la salud. Intercambio de información en salud](https://dof.gob.mx/normasOficiales/4956/SALUD1/SALUD1.html)

---

## 1. Contexto y Delimitación de Alcance

Durante la **Iteración 2.5 / 2.5.1**, la compuerta E2E de staging valida:
1. **Cierre Operativo de Agenda (`PATCH /api/appointments/{id}/complete`):** Permite al profesional de la salud finalizar operativamente una cita desde el modal `CompletionModal` en `/provider/dashboard/appointments` registrando notas operativas (`privateNotes`, `publicNotes`) y liquidación de saldo (`remainingBalancePaidInClinic`), dejando la cita en estado `COMPLETED`.
2. **Integración de API de Consentimiento de IA (`POST` y `GET /api/appointments/teleconsultations/{id}/ai-consent[/status]`):** Comprueba únicamente el contrato técnico de persistencia y lectura en backend para la cita recién creada.

> [!IMPORTANT]
> **Delimitación Normativa Explícita:**
> Un `POST` y un `GET` sobre los endpoints de consentimiento de IA o el cambio de estado de una cita a `COMPLETED` **no constituyen ni certifican cumplimiento normativo con la NOM-004-SSA3-2012 ni con la NOM-024-SSA3-2012**. El cumplimiento de dichas normas oficiales mexicanas (relativas a la integración obligatoria del expediente clínico y a los sistemas de registro electrónico para la salud, autenticidad, inalterabilidad, firma electrónica y pistas de auditoría) exige revisión clínico-jurídica formal de alcance y evidencia documental completa.

---

## 2. Alcance Funcional de `HU-EHR-024`

### 2.1. Flujo UI de Consentimiento Informado de IA en Teleconsulta (`AIConsentModal`)
- Presentar al paciente en la interfaz previa a la sala de teleconsulta (`/patient/video-call/[id]`) el componente interactivo `AIConsentModal` antes de activar cualquier captura o transcripción asistida por IA.
- Permitir la aceptación o rechazo granular desde la UI (`audioProcessingAccepted`, `clinicalNoteAccepted`, `dataStorageAccepted`) y reflejar el estado en tiempo real en la consola del médico (`/provider/consultation/[id]`).
- Cubrir mediante prueba E2E de interfaz la interacción real del usuario sobre el modal de consentimiento antes de ingresar a la videollamada.

### 2.2. Cierre Clínico Estructurado de Consulta (`POST /api/appointments/{id}/consultation`)
- Validar la captura y persistencia de la nota médica estructurada (SOAP: subjetivo, objetivo, análisis/diagnóstico CIE-10, plan terapéutico, signos vitales y prescripción médica) desde `/provider/consultation/[id]`.
- Distinguir en producto y auditoría entre:
  - **Cierre administrativo/operativo de cita** (`CompletionModal` -> `PATCH /api/appointments/{id}/complete`), y
  - **Cierre clínico del acto médico en el expediente** (`ConsultationConsole` -> `POST /api/appointments/{id}/consultation`).
- Incorporar la validación clínico-jurídica de los campos mínimos obligatorios requeridos por la **NOM-004-SSA3-2012** y los controles de integridad/bitácora técnica requeridos por la **NOM-024-SSA3-2012**.

---

## 3. Criterios de Aceptación Técnicos
1. **UI de Consentimiento IA:** Prueba E2E automatizada que ejercite los controles del DOM de `AIConsentModal` en la vista del paciente y verifique el bloqueo de transcripción cuando el consentimiento es rechazado.
2. **Persistencia de Nota Clínica:** Prueba E2E automatizada que complete una consulta desde `/provider/consultation/[id]` persistiendo signos vitales, nota SOAP y diagnóstico, verificando su registro en base de datos de staging.
3. **Revisión Clínico-Jurídica:** Matriz de trazabilidad revisada por el área médica y legal frente a los numerales aplicables de [NOM-004-SSA3-2012](https://dof.gob.mx/normasOficiales/4909/SALUD/SALUD.html) y [NOM-024-SSA3-2012](https://dof.gob.mx/normasOficiales/4956/SALUD1/SALUD1.html).
