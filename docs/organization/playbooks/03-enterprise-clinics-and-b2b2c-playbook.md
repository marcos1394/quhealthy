# PLAYBOOK: Clínicas Multi-Médico, Alianzas B2B2C y Programas Asistenciales (`COM-B2B2C-01`)

**Código de Iniciativa:** `COM-B2B2C-01` / `COM-ENTERPRISE-01`
**Escuadrón Responsable:** `commercial-operations` (con soporte de `product-engineering`)
**Fecha de Vigencia:** Q4 2026 — Q1 2027
**Público Objetivo:** Clínicas privadas multi-especialidad, centros de diagnóstico ambulatorio, empresas medianas con beneficios de salud (B2B2C) y fundaciones aliadas (`/foundation`).

---

## 1. Tesis Comercial y Segmentación Enterprise

El marketplace de médicos independientes es el "wedge" de tracción inicial de QuHealthy. Para acelerar el volumen transaccional (GMV) y elevar la retención neta de ingresos (NRR > 120%), se activa la oferta para organizaciones médicas estructuradas:

| Segmento | Tamaño de Equipo | Propuesta de Valor Central | Modelo de Monetización |
| :--- | :---: | :--- | :--- |
| **Clínica Boutique / Consultorio Compartido** | 2 a 5 especialistas | Agenda compartida, recepción única, cobro centralizado o individual, expedientes clínicos independientes conforme a `NOM-004`. | Suscripción SaaS Base ($2,499 MXN/mes) + $499 MXN por médico adicional + Take rate transaccional 4%. |
| **Policlínica / Centro Médico Ambulatorio** | 6 a 15 especialistas | Múltiples sucursales, permisos por rol (`CLINIC_ADMIN`, `RECEPTIONIST`, `PHYSICIAN`), reportes de caja consolidados y enlace a farmacia/laboratorio. | Suscripción Enterprise ($5,999 MXN/mes) con hasta 10 asientos + $399 MXN por médico adicional + Take rate 3.5%. |
| **Empresas & Brokers (B2B2C)** | 50 a 500 colaboradores | Acceso subsidiado o con copago preferencial a videoconsultas de medicina general, psicología y nutrición sin costo fijo oneroso. | Paquete anual de consultas prepagadas o membresía de acceso ($49 MXN/colaborador/mes). |
| **Fundaciones e I.A.P.s (`/foundation`)** | N/A (Beneficiarios) | Emisión de vales de salud digital, expedientes asistenciales trazables, transparencia para donantes y canalización a especialistas aliados. | Tarifa social bonificada / Costo por transacción de liquidación (2%). |

---

## 2. Arquitectura de Roles y Permisos (RBAC Enterprise)

Cada organización clínica opera bajo un esquema estricto de segregación de funciones:

```
                          ┌───────────────────────┐
                          │     CLINIC_ADMIN      │
                          │ (Dueño / Director)   │
                          └──────────┬────────────┘
                                     │
           ┌─────────────────────────┼─────────────────────────┐
           ▼                         ▼                         ▼
┌─────────────────────┐   ┌─────────────────────┐   ┌─────────────────────┐
│    RECEPTIONIST     │   │      PHYSICIAN      │   │      ASSISTANT      │
│ (Recepción / Caja)  │   │ (Médico Especialista)│  │ (Enfermería / Triage│
├─────────────────────┤   ├─────────────────────┤   ├─────────────────────┤
│ • Agenda citas      │   │ • Consulta clínica  │   │ • Toma de signos    │
│ • Cobro en mostrador│   │ • Expediente NOM-004│   │ • Pre-consulta      │
│ • Check-in QR       │   │ • Emisión de receta │   │ • Apoyo procedim.   │
│ ❌ Sin acceso a EMR │   │ ❌ Sin ver caja gen.│   │ ❌ Sin firma receta │
└─────────────────────┘   └─────────────────────┘   └─────────────────────┘
```

---

## 3. Playbook de Venta Consultiva y Onboarding

1. **Detección y Calificación (SDR):**
   - Clínicas privadas en CDMX, Guadalajara, Monterrey y Culiacán con más de 3 médicos y presencia física.
   - Dolor principal: Descoordinación de agenda, fugas de cobro en efectivo y expedientes de papel no conformes a COFEPRIS.
2. **Demo en Vivo (15 minutos):**
   - Demostración de recepción compartida, cobro integrado (Stripe + Caja Efectivo), emisión de receta digital con verificador de interacciones (`Health OS Pulso`) y portal público de la clínica.
3. **Migración de Datos y Activación Asistida ("White-Glove"):**
   - Configuración de sucursales, consultorios y catálogo de procedimientos/precios en menos de 48 horas.
   - Validación de cédulas DGP de todos los especialistas antes del lanzamiento.
4. **Acuerdo de Nivel de Servicio (SLA):**
   - Disponibilidad del sistema: 99.9% mensual.
   - Soporte clínico y técnico prioritario vía WhatsApp corporativo con tiempo de respuesta < 15 minutos en horario hábil.
