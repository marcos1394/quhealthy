# Matriz Técnica-Jurídica de Cumplimiento: NOM-004, NOM-024 y LFPDPPP

**Código:** `LEG-NOM-01`
**Versión:** 1.0 (Octubre 2026)
**Propietarios:** Escuadrón `founder-cos-gov` + `clinical-quality-trust`

---

## 1. Alcance y Advertencia Legal

> [!IMPORTANT]
> Esta matriz documenta los controles técnicos y de software implementados en el código fuente de QuHealthy frente a los requerimientos de la regulación sanitaria y de privacidad en México. **No sustituye un dictamen pericial o legal formal**, pero constituye la evidencia objetiva para auditorías sanitarias (COFEPRIS), auditorías de protección de datos (INAI) y debida diligencia de inversionistas (*Data Room*).

---

## 2. Matriz de Cumplimiento Técnico

| Regulación / Numeral | Requerimiento Regulatorio | Implementación en QuHealthy (Código / Arquitectura) | Estado Técnico |
| :--- | :--- | :--- | :---: |
| **NOM-004-SSA3-2012**<br>Numeral 5.1 | Integración del expediente clínico por profesional de la salud legalmente facultado (Cédula Profesional). | Validación fail-closed de Cédula ante la DGP en `admin_service` antes de autorizar firma de notas y emisión de recetas (`PrescriptionPdfGenerator.java`, `DoctorDocumentLite`). | ✅ **CUMPLIDO** |
| **NOM-004-SSA3-2012**<br>Numeral 5.5 | Inalterabilidad y trazabilidad de las notas médicas (fecha, hora, autor y paciente). | Toda nota médica persiste en base de datos PostgreSQL con `created_at` inmutable (`TIMESTAMP WITHOUT TIME ZONE`), `doctor_id` verificado y registro en bitácora de auditoría (`teleconsultation_consent_audits`). | ✅ **CUMPLIDO** |
| **NOM-004-SSA3-2012**<br>Numeral 6 | Estructura de la nota de consulta (motivo, signos vitales, SOAP, diagnóstico CIE-10 y pronóstico). | Formulario estructurado en `/provider/consultation/[id]` (`ClinicalEvaluationStep.tsx`) y DTO `CompleteConsultationRequest.java` con captura de signos vitales y notas SOAP. | ✅ **CUMPLIDO** |
| **NOM-004-SSA3-2012**<br>Numeral 10.1 | Consentimiento informado previo a procedimientos diagnósticos o terapéuticos. | Flujo interactivo `AiConsentModal.tsx` (`HU-EHR-024`) y endpoint `POST /api/appointments/teleconsultations/{id}/ai-consent` previo al ingreso a la consulta médica. | ✅ **CUMPLIDO** |
| **NOM-004-SSA3-2012**<br>Numeral 5.4 | Retención mínima del expediente clínico por un periodo no menor a 5 años. | Política de retención en base de datos PostgreSQL (Supabase) con Soft-Delete (`is_deleted = false`) y almacenamiento inmutable en Cloud Storage con borrado suave de 7 días. | ✅ **CUMPLIDO** |
| **NOM-024-SSA3-2012**<br>Numeral 6.1.1 | Confidencialidad e integridad en la transmisión electrónica de datos de salud. | Cifrado en tránsito forzado TLS 1.3 / HTTPS en Vercel, Cloudflare WAF y Cloud Run. Videoconsultas cifradas punto a punto mediante WebRTC sobre LiveKit. | ✅ **CUMPLIDO** |
| **NOM-024-SSA3-2012**<br>Numeral 6.1.3 | Control de acceso basado en roles (RBAC) y separación de privilegios. | Spring Security con `CustomAuthenticationToken` que segrega estrictamente roles `ROLE_PATIENT`, `ROLE_PROVIDER`, `ROLE_ADMIN`, `ROLE_STAFF`, impidiendo acceso cruzado a expedientes no autorizados. | ✅ **CUMPLIDO** |
| **NOM-024-SSA3-2012**<br>Numeral 6.2 | Pistas de auditoría de acceso y modificación al expediente electrónico. | Filtro de correlación `CorrelationIdFilter.java`, log estructurado de auditoría en Cloud Logging y tablas dedicadas de eventos (`teleconsultation_consent_audits`, `user_events_log`). | ✅ **CUMPLIDO** |
| **LFPDPPP**<br>Art. 8, 9 y 16 | Tratamiento de Datos Personales Sensibles de Salud y Consentimiento Expreso por Escrito. | Banner de cookies con selección granular (`CookieConsent.tsx`), aviso de privacidad de datos de salud en `/privacy` y consentimiento explícito en teleconsulta y agendamiento. | ✅ **CUMPLIDO** |
| **LFPDPPP**<br>Art. 28 | Ejercicio de Derechos ARCO (Acceso, Rectificación, Cancelación y Oposición). | Procedimiento operativo documentado para atención vía `founders@quhealthy.org` y portal de ajustes de privacidad (`/patient/dashboard/settings`). | ✅ **CUMPLIDO** |

---

## 3. Hoja de Ruta para Certificación Formal NOM-024

1. **Paso 1 (Completado):** Implementación técnica de controles de integridad, bitácora de auditoría y expediente SOAP estructurado.
2. **Paso 2 (Q1 2027):** Integración opcional de firma electrónica avanzada (e.firma / FIEL del SAT) para profesionales que requieran emisión de estupefacientes/psicotrópicos (fracciones I y II de la Ley General de Salud).
3. **Paso 3 (Q2 2027):** Solicitud formal de dictamen de cumplimiento de interoperabilidad ante la Dirección General de Información en Salud (DGIS / Secretaría de Salud).
