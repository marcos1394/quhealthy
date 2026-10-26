# Modelo Maestro de Unit Economics y Pricing — QuHealthy

**Código:** `FIN-UNIT-01`
**Versión:** 1.0 (Octubre 2026)
**Propietarios:** Escuadrón `founder-cos-gov`

---

## 1. Estructura de Planes y Monetización

QuHealthy opera un modelo híbrido **B2B SaaS + Take Rate Transaccional**:

| Plan | Tarifa Mensual (SaaS) | Comisión por Cita Procesada | Funcionalidades Incluidas |
| :--- | :--- | :--- | :--- |
| **Plan Básico (Free)** | $0 MXN | 10% + tarifa Stripe | Agenda básica, hasta 15 citas/mes, cobros en línea, perfil estándar en directorio. |
| **Plan Profesional (SaaS)** | $599 MXN / mes | 5% + tarifa Stripe | Citas ilimitadas, Receta Digital PDF con QR, Expediente SOAP conforme a NOM-004, Telemedicina cifrada, recordatorios automáticos. |
| **Plan Clínica / Enterprise** | Desde $1,999 MXN / mes | 3% + tarifa Stripe | Multi-médico (hasta 5 consultorios), roles de recepcionista/asistente, reportes financieros y módulos de laboratorio/insumos. |

---

## 2. Desglose Unitario por Transacción (Consulta de $1,000 MXN)

Tomando como base una consulta médica estándar de **$1,000.00 MXN** cobrada en línea:

```text
Pago del Paciente:                             $1,000.00 MXN
(-) Comisión de Pasarela (Stripe Connect):
    - Tarifa fija: $3.00 MXN
    - Tarifa variable (3.6%): $36.00 MXN
    - IVA sobre comisión (16% de $39): $6.24 MXN
    Subtotal Pasarela Stripe:                    -$45.24 MXN

(-) Comisión QuHealthy (Take Rate 5% Plan Pro):
    - Comisión plataforma:                       +$50.00 MXN
    - IVA sobre comisión QuHealthy (16%):         +$8.00 MXN

(=) Depósito Neto al Médico (Stripe Payout):     $904.76 MXN
(=) Margen Bruto QuHealthy por Cita:              $50.00 MXN
```

### Costos Marginales de Infraestructura por Cita
- LiveKit WebRTC (videoconsulta de 30 min): ~$0.004 USD (~$0.08 MXN)
- Cloud Run + Supabase DB queries por cita: ~$0.02 MXN
- Generación y almacenamiento de PDF (Cloud Storage): ~$0.01 MXN
- **Costo Marginal Total por Cita:** **~$0.11 MXN**
- **Margen de Contribución por Transacción:** **>$49.80 MXN (99.6% de margen bruto transaccional)**

---

## 3. Retenciones Fiscales (Régimen de Plataformas Digitales México)

Conforme a la Ley del Impuesto sobre la Renta (LISR) y Ley del IVA para plataformas digitales en México:
- Si el médico **registra su RFC con homoclave válida ante el SAT**:
  - Retención de ISR: **2.1%** sobre el ingreso bruto.
  - Retención de IVA: **50% del IVA trasladado (8%)**.
- Si el médico **NO proporciona RFC**:
  - Retención de ISR provisional: **20%**.
  - Retención de IVA: **100% (16%)**.
- *Nota operativa:* La integración de Stripe Connect Custom/Express automatiza la emisión de constancias de retención anuales/mensuales según la configuración fiscal de la cuenta del profesional.

---

## 4. Proyección de Cohorte (Primeros 20 Médicos Fundadores)

- **Doctores Activos:** 20
- **Citas promedio por médico al mes:** 30 consultas
- **Volumen Total Procesado (GMV mensual):** 20 × 30 × $1,000 = **$600,000 MXN / mes**
- **Ingresos por Suscripción SaaS (meses 1 a 3):** $0 MXN (bonificado por Cohorte Fundadora)
- **Ingresos por Suscripción SaaS (a partir del mes 4):** 20 × $599 = **$11,980 MXN / mes**
- **Ingresos por Take Rate (5% a partir de mes 4):** $30,000 MXN / mes
- **Ingresos Recurrentes Totales Proyectados (Mes 4+):** **$41,980 MXN / mes**
- **Gasto Cloud mensual estimado (GCP + Vercel + Supabase):** < $1,000 MXN / mes
- **Cash Flow Operativo Neto de la Cohorte:** **+$40,980 MXN / mes**
