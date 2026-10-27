import { describe, it, expect } from 'vitest';
import { checkPrescriptionInteractions } from '@/lib/clinical/drug-interactions';

describe('AI-PULSO-01: Motor Clínico de Interacciones Medicamentosas', () => {
  it('detecta interacción severa entre Warfarina y AINEs (Aspirina)', () => {
    const result = checkPrescriptionInteractions(['Warfarina Sódica 5mg', 'Aspirina Protect 100mg']);
    expect(result.hasInteractions).toBe(true);
    expect(result.interactions.length).toBeGreaterThan(0);
    expect(result.interactions[0].severity).toBe('HIGH');
    expect(result.interactions[0].title).toContain('hemorragia');
    expect(result.regulatoryDisclaimer).toContain('NOM-004');
  });

  it('detecta contraindicación absoluta entre Sildenafil y Nitratos', () => {
    const result = checkPrescriptionInteractions(['Sildenafil 50mg', 'Nitroglicerina sublingual']);
    expect(result.hasInteractions).toBe(true);
    const pde5Interaction = result.interactions.find((i) => i.id.startsWith('PDE5_NITRATES'));
    expect(pde5Interaction).toBeDefined();
    expect(pde5Interaction?.severity).toBe('HIGH');
    expect(pde5Interaction?.clinicalRecommendation).toContain('Contraindicación absoluta');
  });

  it('detecta alerta de alergia conocida del paciente', () => {
    const result = checkPrescriptionInteractions(['Amoxicilina 500mg', 'Paracetamol 500mg'], ['Penicilina', 'Amoxicilina']);
    expect(result.hasInteractions).toBe(true);
    expect(result.allergyAlerts.length).toBeGreaterThan(0);
    expect(result.allergyAlerts[0].allergen).toBe('amoxicilina');
  });

  it('retorna sin interacciones para fármacos seguros no interactuantes', () => {
    const result = checkPrescriptionInteractions(['Paracetamol 500mg', 'Loratadina 10mg']);
    expect(result.hasInteractions).toBe(false);
    expect(result.interactions).toHaveLength(0);
    expect(result.allergyAlerts).toHaveLength(0);
  });

  it('soporta lista vacía de medicamentos sin errores', () => {
    const result = checkPrescriptionInteractions([]);
    expect(result.hasInteractions).toBe(false);
    expect(result.checkedMedicationsCount).toBe(0);
  });
});
