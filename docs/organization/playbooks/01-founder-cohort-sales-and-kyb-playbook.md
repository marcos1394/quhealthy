# Playbook Comercial y Operativo: Cohorte Fundadora (Primeros 20 Médicos) & SLA KYB < 24h

**Código:** `COM-WEDGE-01` / `OPS-KYB-01`
**Versión:** 1.0 (Octubre 2026)
**Propietarios:** Escuadrones `commercial-operations` + `founder-cos-gov`

---

## 1. Perfil del Cliente Ideal (ICP de Cuña Inicial)

Para maximizar velocidad y retención, la prospección inicial se enfoca exclusivamente en:
- **Especialidades prioritarias:** Cardiología, Dermatología, Pediatría, Ginecología, Psicología y Medicina General con consulta activa privada.
- **Geografía:** Zona Metropolitana del Valle de México (CDMX), Guadalajara y Monterrey.
- **Tamaño:** Consultorio individual privado o clínica ambulatoria de 2 a 5 especialistas.
- **Dolor principal:** Pérdida de tiempo en agendamiento manual por WhatsApp, *no-shows* sin cobro de anticipo, recetas en formatos Word/papel y cobros desorganizados.

---

## 2. Oferta de Lanzamiento: Cohorte Fundadora

| Elemento | Condición Estándar | Oferta Cohorte Fundadora |
| :--- | :--- | :--- |
| **Suscripción SaaS Mensual** | $599 MXN / mes (Plan Pro) | **$0 MXN los primeros 3 meses** (Cero costo fijo) |
| **Comisión Marketplace por Cita** | 10% + costo pasarela Stripe | **Solo tarifa Stripe Connect** (3.6% + $3 MXN + IVA) |
| **Configuración & Onboarding** | Autoservicio | **Onboarding Asistido "White-Glove"** (llamada de 30 min para cargar horarios, servicios y cuenta bancaria) |
| **Perfil en Directorio QuHealthy** | Estándar | **Insignia "Médico Fundador Verificado" + Posicionamiento Preferente** |

---

## 3. Guion de Contacto Comercial (Outreach Directo)

### Mensaje Inicial (LinkedIn / WhatsApp / Email Directo)
> *"Hola Dr. [Apellido], un gusto saludarte. Soy [Nombre] de QuHealthy. Estamos seleccionando a 20 especialistas médicos líderes en [Ciudad/Especialidad] para nuestra Cohorte Fundadora.*
>
> *Desarrollamos una plataforma integral que te permite:*
> 1. *Tener tu agenda en línea con cobro automático de anticipos (reduciendo cancelaciones).*
> 2. *Emitir recetas digitales con código QR y expediente clínico estructurado.*
> 3. *Tener videoconsultas cifradas con transcripción asistida opcional.*
>
> *Para esta cohorte, les estamos otorgando 3 meses sin costo de suscripción y configuración asistida en 30 minutos.*
>
> *¿Tendrías 10 minutos esta semana para una demostración rápida y activar tu perfil verificado?"*

### Respuestas a Objeciones Comunes
- **Objeción 1: "Ya uso Doctoralia / otra agenda."**
  - *Respuesta:* *"Excelente. QuHealthy no exige exclusividad. Muchos médicos usan QuHealthy en paralelo para sus cobros en línea con menor comisión y para la emisión de recetas digitales estructuradas y telemedicina sin pagar mensualidades altas."*
- **Objeción 2: "¿Cómo cobran mis consultas?"**
  - *Respuesta:* *"El cobro lo realiza el paciente directamente con tarjeta de crédito/débito o SPEI vía Stripe. Los fondos se depositan directamente a tu cuenta bancaria registrada en 48 horas hábiles."*
- **Objeción 3: "¿Es legal la receta digital?"**
  - *Respuesta:* *"Sí, el formato de receta de QuHealthy incluye todos los requisitos de COFEPRIS: nombre del médico, cédula profesional verificada, domicilio de consulta, fecha, firma digitalizable y código único de folio."*

---

## 4. Protocolo Operativo de Verificación KYB (SLA < 24 Horas)

Para habilitar a un médico en el directorio público y permitirle recibir pagos, debe cumplirse la compuerta de verificación en el Portal Administrador (`/admin` -> pestaña `Verificaciones`):

### Paso 1: Cotejo de Cédula Profesional ante la DGP (SEP)
1. Ingresar al **Registro Nacional de Profesionistas** (`cedulaprofesional.sep.gob.mx`).
2. Buscar por número de cédula y nombre completo proporcionado en el registro.
3. Validar:
   - Coincidencia exacta de nombres y apellidos.
   - Profesión / Licenciatura en Medicina (Cédula de Médico Cirujano).
   - En caso de ostentar especialidad, verificar que exista la cédula de posgrado correspondiente emitida por la DGP.
4. Tomar captura de pantalla o folio de consulta oficial.

### Paso 2: Aprobación en el Portal Admin (`admin_service`)
1. Abrir `/admin` -> `Verificaciones`.
2. Localizar el registro del profesional (`provider_id`).
3. Adjuntar o registrar el número de cédula y cambiar el estado del documento a `APPROVED`.
4. El sistema actualiza `verification_status = 'APPROVED'` y habilita automáticamente el perfil público en el buscador `/discover`.

### Criterio de Pausa / Rechazo Inmediato
- Cédula no localizada en la base de datos oficial de la DGP.
- Cédula correspondiente a otra persona o profesión no médica.
- Indicios de falsificación de documentos.
- *Acción:* Marcar como `REJECTED`, registrar motivo en bitácora y notificar al solicitante por correo solicitando aclaración oficial.
