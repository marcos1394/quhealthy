/**
 * QuHealthy - Motor de Detección de Interacciones Medicamentosas y Alergias (Health OS Pulso)
 * Cumplimiento estricto con NOM-004-SSA3-2012 y NOM-024-SSA3-2012.
 * Las alertas emitidas son de apoyo clínico y no reemplazan el juicio médico independiente.
 */

export type InteractionSeverity = 'HIGH' | 'MODERATE' | 'LOW';

export interface ClinicalInteraction {
  id: string;
  drugs: [string, string];
  severity: InteractionSeverity;
  title: string;
  mechanism: string;
  clinicalRecommendation: string;
  disclaimer: string;
}

export interface AllergyAlert {
  medication: string;
  allergen: string;
  severity: 'HIGH';
  reaction: string;
}

export interface InteractionCheckResult {
  hasInteractions: boolean;
  interactions: ClinicalInteraction[];
  allergyAlerts: AllergyAlert[];
  checkedMedicationsCount: number;
  evaluatedAt: string;
  regulatoryDisclaimer: string;
}

const REGULATORY_DISCLAIMER =
  'Alerta de Farmacovigilancia y Soporte a la Decisión Clínica — Health OS Pulso (NOM-004-SSA3-2012 / NOM-024-SSA3-2012). Herramienta de asistencia; el médico tratante es el único responsable de la prescripción.';

/**
 * Catálogo de pares farmacológicos con interacciones clínicas de relevancia alta y moderada.
 */
const KNOWN_INTERACTION_RULES: Array<{
  drugAKeywords: string[];
  drugBKeywords: string[];
  id: string;
  title: string;
  severity: InteractionSeverity;
  mechanism: string;
  clinicalRecommendation: string;
}> = [
  {
    drugAKeywords: ['warfarina', 'warfarin', 'acenocumarol', 'anticoagulante'],
    drugBKeywords: ['aspirina', 'acido acetilsalicilico', 'ibuprofeno', 'naproxeno', 'ketorolaco', 'diclofenaco', 'aines'],
    id: 'WARFARIN_NSAIDS',
    title: 'Riesgo elevado de hemorragia gastrointestinal y sistémica',
    severity: 'HIGH',
    mechanism: 'Sinergia inhibitoria de la coagulación plaquetaria y daño directo a la mucosa gástrica.',
    clinicalRecommendation: 'Evitar combinación. Si es indispensable analgesia, valorar paracetamol o protector gástrico (IBP).',
  },
  {
    drugAKeywords: ['sildenafil', 'tadalafil', 'vardenafil'],
    drugBKeywords: ['nitroglicerina', 'dinitrato de isosorbida', 'mononitrato de isosorbida', 'nitratos'],
    id: 'PDE5_NITRATES',
    title: 'Hipotensión severa y colapso cardiovascular potencialmente mortal',
    severity: 'HIGH',
    mechanism: 'Potenciación masiva del óxido nítrico y vasodilatación sistémica profunda.',
    clinicalRecommendation: 'Contraindicación absoluta. No administrar nitratos en al menos 24-48 horas de uso de inhibidores de PDE5.',
  },
  {
    drugAKeywords: ['fluoxetina', 'sertralina', 'escitalopram', 'paroxetina', 'citalopram', 'isrs'],
    drugBKeywords: ['tramadol', 'linezolid', 'moclobemida', 'selegilina'],
    id: 'SEROTONIN_SYNDROME',
    title: 'Riesgo de Síndrome Serotoninérgico potencialmente grave',
    severity: 'HIGH',
    mechanism: 'Acumulación de serotonina en SNC por inhibición de recaptura combinada con agonismo/metabolismo reducido.',
    clinicalRecommendation: 'Monitorear rigurosamente signos autonómicos y neuromusculares. Considerar analgésicos alternativos al tramadol.',
  },
  {
    drugAKeywords: ['enalapril', 'lisinopril', 'losartan', 'candesartan', 'valsartan', 'ieca', 'ara2'],
    drugBKeywords: ['espironolactona', 'eplerenona', 'amilorida', 'suplemento de potasio'],
    id: 'HYPERKALEMIA_RISK',
    title: 'Riesgo de Hiperpotasemia (Hipercalemia) y Arritmias Cardíacas',
    severity: 'MODERATE',
    mechanism: 'Doble bloqueo del eje renina-angiotensina-aldosterona que reduce la excreción renal de potasio.',
    clinicalRecommendation: 'Monitorear niveles séricos de potasio y función renal (creatinina/TFG) en 7 a 14 días.',
  },
  {
    drugAKeywords: ['metformina', 'metformin'],
    drugBKeywords: ['medio de contraste', 'contraste iodado', 'contraste radiologico'],
    id: 'METFORMIN_CONTRAST',
    title: 'Riesgo de Acidosis Láctica secundaria a Nefropatía Inducida por Contraste',
    severity: 'HIGH',
    mechanism: 'Posible deterioro renal agudo transitorio que incrementa los niveles de metformina.',
    clinicalRecommendation: 'Suspender metformina 48h antes o en el momento del estudio con contraste; reiniciar tras verificar TFG.',
  },
  {
    drugAKeywords: ['ciprofloxacino', 'levofloxacino', 'norfloxacino', 'quinolonas'],
    drugBKeywords: ['antiacido', 'hidroxido de aluminio', 'magnesio', 'sucralfato', 'carbonato de calcio'],
    id: 'QUINOLONE_CATION_CHELATION',
    title: 'Disminución crítica de la absorción y biodisponibilidad del antibiótico',
    severity: 'MODERATE',
    mechanism: 'Quelación del antimicrobiano con cationes bivalentes/trivalentes en el tracto digestivo.',
    clinicalRecommendation: 'Espaciar la administración del antiácido al menos 2 horas antes o 4 horas después de la quinolona.',
  },
  {
    drugAKeywords: ['clopidogrel'],
    drugBKeywords: ['omeprazol', 'esomeprazol'],
    id: 'CLOPIDOGREL_OMEPRAZOLE',
    title: 'Atenuación del efecto antiagregante plaquetario',
    severity: 'MODERATE',
    mechanism: 'Competencia en la activación hepática por el citocromo CYP2C19.',
    clinicalRecommendation: 'Preferir protectores gástricos con menor inhibición de CYP2C19 como pantoprazol o famotidina.',
  },
];

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Evalúa una lista de medicamentos en prescripción médica y detecta interacciones fármaco-fármaco.
 */
export function checkPrescriptionInteractions(
  medicationNames: string[],
  patientAllergies: string[] = []
): InteractionCheckResult {
  const normalizedMeds = medicationNames
    .map(normalizeText)
    .filter((m) => m.length > 1);

  const normalizedAllergies = patientAllergies
    .map(normalizeText)
    .filter((a) => a.length > 1);

  const detectedInteractions: ClinicalInteraction[] = [];
  const detectedAllergies: AllergyAlert[] = [];
  const checkedPairs = new Set<string>();

  // 1. Evaluación de alergias conocidas
  for (const med of normalizedMeds) {
    for (const allergy of normalizedAllergies) {
      if (med.includes(allergy) || allergy.includes(med)) {
        detectedAllergies.push({
          medication: med,
          allergen: allergy,
          severity: 'HIGH',
          reaction: `Paciente con antecedente alérgico registrado a "${allergy}". Evaluar sustitución inmediata.`,
        });
      }
    }
  }

  // 2. Evaluación de interacciones cruzadas
  for (let i = 0; i < normalizedMeds.length; i++) {
    for (let j = i + 1; j < normalizedMeds.length; j++) {
      const medA = normalizedMeds[i];
      const medB = normalizedMeds[j];
      const pairKey = `${medA}_${medB}`;

      if (checkedPairs.has(pairKey)) continue;
      checkedPairs.add(pairKey);

      for (const rule of KNOWN_INTERACTION_RULES) {
        const matchAFirst =
          rule.drugAKeywords.some((k) => medA.includes(k)) &&
          rule.drugBKeywords.some((k) => medB.includes(k));

        const matchBFirst =
          rule.drugAKeywords.some((k) => medB.includes(k)) &&
          rule.drugBKeywords.some((k) => medA.includes(k));

        if (matchAFirst || matchBFirst) {
          detectedInteractions.push({
            id: `${rule.id}_${i}_${j}`,
            drugs: [medA, medB],
            severity: rule.severity,
            title: rule.title,
            mechanism: rule.mechanism,
            clinicalRecommendation: rule.clinicalRecommendation,
            disclaimer: REGULATORY_DISCLAIMER,
          });
        }
      }
    }
  }

  return {
    hasInteractions: detectedInteractions.length > 0 || detectedAllergies.length > 0,
    interactions: detectedInteractions,
    allergyAlerts: detectedAllergies,
    checkedMedicationsCount: normalizedMeds.length,
    evaluatedAt: new Date().toISOString(),
    regulatoryDisclaimer: REGULATORY_DISCLAIMER,
  };
}
