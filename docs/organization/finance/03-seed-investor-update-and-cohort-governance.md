# REPORTE EJECUTIVO: Investor Update Mensual y Gobierno de Cohortes Seed (`FIN-SEED-01`)

**Código de Iniciativa:** `FIN-SEED-01`
**Escuadrón Responsable:** `founder-cos-gov`
**Periodicidad:** Mensual (Primeros 5 días hábiles posteriores al cierre de mes)
**Destinatarios:** Fundadores, Inversionistas Ángel, Fondos de Capital Semilla (Pre-Seed / Seed) y Consejo Asesor.

---

## 1. Plantilla Estándar de Investor Update

```markdown
# QuHealthy — Investor Update [Mes / Año]

Hola [Nombre de Inversionista / Fondo],

Les compartimos la actualización operativa, financiera y de producto de QuHealthy correspondiente al cierre de [Mes / Año].

---

### 1. Resumen Ejecutivo (El "TL;DR")
- **Highlights del Mes:** [1 a 3 hitos clave: ej. Cierre de alianza con 2 clínicas, lanzamiento de Health OS Pulso, reducción de no-show].
- **Lowlights / Retos Principales:** [1 a 2 obstáculos: ej. Tiempos de validación bancaria Stripe Connect, costo fijo de Redis].
- **Runway & Saldo en Caja:** [$XX,XXX USD / XX meses de pista financiera al ritmo actual de gasto neto].

---

### 2. Tablero de Métricas Clave (KPIs Core)

| Métrica | Mes Anterior | Mes Actual | Variación MoM | Meta Q4 2026 |
| :--- | :---: | :---: | :---: | :---: |
| **Médicos Verificados Activos (DGP)** | XX | YY | +XX% | 100 |
| **Consultas Completadas (Booking Volume)** | XX | YY | +XX% | 500 |
| **GMV Total Transaccionado ($ MXN)** | $XX,XXX | $YY,YYY | +XX% | $500,000 |
| **Net Revenue ($ MXN)** | $XX,XXX | $YY,YYY | +XX% | $65,000 |
| **Take Rate Promedio Marketplace** | X.X% | Y.Y% | +X bps | 10.0% |
| **Tasa de No-Show Clínico** | XX% | YY% | -X% | < 8.0% |
| **CAC Blended (Médico / Paciente)** | $XXX / $XX | $YYY / $YY | -X% | $800 / $60 |
| **LTV Estimado Médico (SaaS + Take)** | $XX,XXX | $YY,YYY | — | $36,000 |
| **Net Burn Mensual ($ USD)** | $X,XXX | $Y,YYY | -X% | < $4,000 |
| **Runway (Meses restantes)** | XX | YY | — | > 18 meses |

---

### 3. Hitos de Producto & Ingeniería Completados
- **Clínicas Multi-Médico (`COM-ENTERPRISE-01`):** Gestión de sucursales y permisos por rol (`CLINIC_ADMIN`, `RECEPTIONIST`, `PHYSICIAN`).
- **Health OS Pulso (`AI-PULSO-01`):** Verificador asistido de interacciones medicamentosas con alertas clínicas y seguimiento longitudinal de pacientes crónicos.
- **Mobile Readiness (`ENG-IOS-01`):** Universal Links activos y contrato unificado de tokens de notificación Push.
- **Atribución First-Party (`MKT-PAID-01`):** Motor de captura de UTM/GCLID con guardia estricta Anti-PII.

---

### 4. Finanzas y FinOps
- **Estructura de Gasto Cloud:** Infraestructura Cloud Run + Supabase + Vercel optimizada. Costo por consulta procesada: < $1.50 MXN.
- **Unit Economics:** Margen de contribución positivo por consulta médica pagada.

---

### 5. ¿En qué nos pueden ayudar este mes? (Asks)
1. **Intros Comerciales:** Conexión con directores médicos de clínicas ambulatorias (3 a 10 consultorios) en CDMX o Monterrey.
2. **Partnerships de Salud:** Contacto con aseguradoras medianas o brokers de beneficios para pilotos B2B2C.
3. **Talento:** Recomendaciones de ingenieros móviles React Native / Swift con experiencia en apps de salud.
```

---

## 2. Marco de Gobierno y Conciliación Trimestral

1. **Reconciliación Contable:** Cruce mensual de Stripe Balance contra reportes bancarios y facturación fiscal electrónica (CFDI 4.0).
2. **Auditoría de Retención de Cohortes:** Análisis mensual de cohorte de médicos (M1, M3, M6, M12) midiendo qué porcentaje de doctores continúa generando al menos 5 consultas al mes en la plataforma.
