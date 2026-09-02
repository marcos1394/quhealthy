export interface SymptomMapping {
  symptomEs: string;
  symptomEn: string;
  specialtyEs: string;
  specialtyEn: string;
  keywords: string[];
  iconName?: string;
}

export const SYMPTOM_SPECIALTY_CATALOG: SymptomMapping[] = [
  {
    symptomEs: "Dolor en el pecho o palpitaciones",
    symptomEn: "Chest pain or palpitations",
    specialtyEs: "Cardiología",
    specialtyEn: "Cardiology",
    keywords: ["pecho", "corazon", "palpitaciones", "taquicardia", "presion alta", "infarto", "chest", "heart"],
  },
  {
    symptomEs: "Tos persistente o falta de aire",
    symptomEn: "Persistent cough or shortness of breath",
    specialtyEs: "Neumología",
    specialtyEn: "Pulmonology",
    keywords: ["tos", "asma", "pulmones", "respirar", "aire", "gripe", "bronquitis", "cough", "breath"],
  },
  {
    symptomEs: "Dolor estomacal, gastritis o reflujo",
    symptomEn: "Stomach pain, gastritis or acid reflux",
    specialtyEs: "Gastroenterología",
    specialtyEn: "Gastroenterology",
    keywords: ["estomago", "gastritis", "reflujo", "acidez", "diarrea", "colitis", "digestivo", "stomach", "acid"],
  },
  {
    symptomEs: "Manchas, acné o alergias en la piel",
    symptomEn: "Skin spots, acne or rashes",
    specialtyEs: "Dermatología",
    specialtyEn: "Dermatology",
    keywords: ["piel", "acne", "manchas", "granos", "comezon", "dermatitis", "lunar", "skin", "rash"],
  },
  {
    symptomEs: "Dolor de cabeza intenso o migraña",
    symptomEn: "Severe headache or migraine",
    specialtyEs: "Neurología",
    specialtyEn: "Neurology",
    keywords: ["cabeza", "migraña", "jaqueca", "mareo", "vertigo", "convulsiones", "headache", "migraine"],
  },
  {
    symptomEs: "Control prenatal, fertilidad o ciclo menstrual",
    symptomEn: "Prenatal care, fertility or menstrual cycle",
    specialtyEs: "Ginecología y Obstetricia",
    specialtyEn: "Gynecology & Obstetrics",
    keywords: ["embarazo", "menstruacion", "periodo", "colicos", "ovulacion", "prenatal", "papanicolau", "pregnancy", "gynecology"],
  },
  {
    symptomEs: "Atención infantil, vacunas y desarrollo",
    symptomEn: "Childcare, vaccines and growth",
    specialtyEs: "Pediatría",
    specialtyEn: "Pediatrics",
    keywords: ["niño", "bebe", "hijo", "vacunas", "pediatra", "crecimiento", "fiebre infantil", "child", "baby", "pediatrics"],
  },
  {
    symptomEs: "Ansiedad, depresión o manejo del estrés",
    symptomEn: "Anxiety, depression or stress management",
    specialtyEs: "Psicología y Salud Mental",
    specialtyEn: "Psychology & Mental Health",
    keywords: ["ansiedad", "estres", "depresion", "tristeza", "panico", "terapia", "emocional", "insomnio", "anxiety", "stress", "therapy"],
  },
  {
    symptomEs: "Dolor de muelas, caries o limpieza dental",
    symptomEn: "Toothache, cavities or dental cleaning",
    specialtyEs: "Odontología",
    specialtyEn: "Dentistry",
    keywords: ["muela", "diente", "caries", "encias", "brackets", "ortodoncia", "limpieza dental", "tooth", "teeth", "dental"],
  },
  {
    symptomEs: "Dolor muscular, articular o fracturas",
    symptomEn: "Muscle, joint pain or fractures",
    specialtyEs: "Traumatología y Ortopedia",
    specialtyEn: "Traumatology & Orthopedics",
    keywords: ["hueso", "rodilla", "espalda", "cuello", "columna", "fractura", "esguince", "articulacion", "bone", "joint", "knee"],
  },
  {
    symptomEs: "Plan de alimentación, peso o diabetes",
    symptomEn: "Diet plan, weight loss or diabetes",
    specialtyEs: "Nutrición y Dietética",
    specialtyEn: "Nutrition & Dietetics",
    keywords: ["nutricion", "dieta", "peso", "calorias", "glucosa", "sobrepeso", "metabolismo", "nutrition", "diet"],
  },
  {
    symptomEs: "Problemas de visión o graduación de lentes",
    symptomEn: "Vision problems or eye care",
    specialtyEs: "Oftalmología",
    specialtyEn: "Ophthalmology",
    keywords: ["ojos", "vista", "lentes", "borroso", "cataratas", "oftalmologo", "eye", "vision"],
  },
];

export function findSymptomMatches(query: string, isEnglish: boolean = false): SymptomMapping[] {
  if (!query || query.trim().length < 2) return [];
  const clean = query.toLowerCase().trim();

  return SYMPTOM_SPECIALTY_CATALOG.filter((item) => {
    return (
      item.keywords.some((k) => clean.includes(k) || k.includes(clean)) ||
      (isEnglish ? item.specialtyEn.toLowerCase().includes(clean) : item.specialtyEs.toLowerCase().includes(clean)) ||
      (isEnglish ? item.symptomEn.toLowerCase().includes(clean) : item.symptomEs.toLowerCase().includes(clean))
    );
  }).slice(0, 4);
}
