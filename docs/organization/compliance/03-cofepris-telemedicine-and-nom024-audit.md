# DOSSIER REGULATORIO: Telemedicina, Software Médico y Auditoría NOM-024 (`LEG-COFEPRIS-01`)

**Código de Iniciativa:** `LEG-COFEPRIS-01`
**Escuadrón Responsable:** `founder-cos-gov` (en coordinación con Asesoría Jurídica Sanitaria)
**Marco Regulatorio:** Ley General de Salud, Reglamento de la Ley General de Salud en Materia de Prestación de Servicios de Atención Médica, `NOM-004-SSA3-2012` (Del Expediente Clínico), `NOM-024-SSA3-2012` (Sistemas de Información de Registro Electrónico para la Salud — SIRES) y lineamientos de COFEPRIS para plataformas de teleconsulta.

---

## 1. Clasificación Regulatoria de QuHealthy

Ante la Comisión Federal para la Protección contra Riesgos Sanitarios (COFEPRIS):

1. **Naturaleza del Software:**
   - QuHealthy opera como una **Plataforma Tecnológica de Intermediación, Gestión Administrativa y Expediente Clínico Electrónico (SIRES)**.
   - **No clasifica como Dispositivo Médico (Software as a Medical Device - SaMD)** porque sus módulos de IA (`Health OS Copilot` y `Health OS Pulso`) emiten **asistencias de redacción y alertas de decisión clínica preliminares**, requiriendo de forma mandatoria la revisión, edición y firma bajo el criterio médico independiente del profesional titulado.
2. **Trámite Sanitario Aplicable:**
   - **Aviso de Funcionamiento** ante COFEPRIS como prestador de servicios de intermediación en salud y desarrollo de tecnologías de registro electrónico.
   - Los médicos y clínicas asociadas son los titulares directos de sus consultorios físicos y deberán contar con su propio Aviso de Funcionamiento y Responsable Sanitario según aplique.

---

## 2. Matriz de Control y Cumplimiento NOM-024-SSA3-2012

| Requisito Normativo (`NOM-024`) | Implementación Técnica en QuHealthy | Estado de Cumplimiento |
| :--- | :--- | :---: |
| **Autenticación e Identificación Unívoca** | Control de acceso basado en roles (RBAC), verificación de identidad de médicos vía DGP/SEP, tokens de sesión seguros con expiración y soporte de MFA institucional. | ✅ Cumple |
| **Integridad y No Repudio de Registros** | Las notas médicas SOAP cerradas son inmutables. Toda edición posterior genera un apéndice cronológico sin sobrescribir la nota original. Emisión de firma digitalizada con sello de tiempo UTC. | ✅ Cumple |
| **Confidencialidad y Control de Acceso** | Separación estricta de expedientes entre pacientes. Ningún médico ajeno al acto clínico puede acceder al expediente sin consentimiento o asignación directa. Aislamiento estricto de PII en telemetría. | ✅ Cumple |
| **Disponibilidad y Respaldo Mínimo de 5 Años** | Base de datos PostgreSQL con replicación continua, backups automáticos diarios certificados en Supabase y política de retención inalterable de expedientes clínicos por 5 años mínimo (`NOM-004`, Numeral 5.4). | ✅ Cumple |
| **Interoperabilidad y Catálogos Estándar** | Mapeo de diagnósticos clínicos mediante codificación estándar internacional **CIE-10** (`Icd10Autocomplete.tsx`) y exportación de resumen clínico estructurado para portabilidad ARCO. | ✅ Cumple |
| **Consentimiento Informado en Telemedicina** | Bitácora inmutable de aceptación digital de consentimiento informado previo a la sesión de teleconsulta (`AiConsentModal.tsx` conectado a endpoints auditables). | ✅ Cumple |

---

## 3. Lista de Verificación para Auditoría Sanitaria Externa

- [x] Copia certificada de cédulas profesionales de la cohorte médica fundadora registradas en el Registro Nacional de Profesionistas.
- [x] Contrato de términos y condiciones y Aviso de Privacidad Integral para Datos Personales Sensibles de Salud (`LFPDPPP`).
- [x] Trazabilidad técnica de logs de acceso (quién, cuándo y desde qué IP consultó el expediente).
- [x] Diagrama de arquitectura de red con cifrado TLS 1.3 en tránsito y AES-256 en reposo.
- [x] Protocolo de contingencia y recuperación ante desastres (RPO < 1 hora, RTO < 4 horas).
