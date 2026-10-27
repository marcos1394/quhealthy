export const SPECIALTY_MAP: Record<string, { es: string; en: string }> = {
  cardiologia: { es: "Cardiología", en: "Cardiology" },
  dermatologia: { es: "Dermatología", en: "Dermatology" },
  pediatria: { es: "Pediatría", en: "Pediatrics" },
  ginecologia: { es: "Ginecología y Obstetricia", en: "Gynecology & Obstetrics" },
  psicologia: { es: "Psicología Clínica", en: "Clinical Psychology" },
  "medicina-general": { es: "Medicina General", en: "General Medicine" },
};

export const CITY_MAP: Record<string, { es: string; en: string }> = {
  cdmx: { es: "Ciudad de México", en: "Mexico City" },
  guadalajara: { es: "Guadalajara", en: "Guadalajara" },
  monterrey: { es: "Monterrey", en: "Monterrey" },
  queretaro: { es: "Querétaro", en: "Queretaro" },
  puebla: { es: "Puebla", en: "Puebla" },
};

export function getProgrammaticMetadata(specialtySlug: string, citySlug: string, locale: string) {
  const specialty = SPECIALTY_MAP[specialtySlug]?.[locale === "en" ? "en" : "es"] || specialtySlug;
  const city = CITY_MAP[citySlug]?.[locale === "en" ? "en" : "es"] || citySlug;

  const title =
    locale === "en"
      ? `Top ${specialty} Doctors in ${city} | Book Online - QuHealthy`
      : `Los Mejores Especialistas en ${specialty} en ${city} | Citas en Línea - QuHealthy`;

  const description =
    locale === "en"
      ? `Find and book verified ${specialty} doctors in ${city}. Certified medical license, instant online booking, video consultation and in-person care on QuHealthy.`
      : `Encuentra y agenda con especialistas certificados en ${specialty} en ${city}. Cédula profesional verificada, citas presenciales o videoconsulta inmediata en QuHealthy.`;

  const canonicalUrl = `https://www.quhealthy.org/${locale}/especialistas/${specialtySlug}/${citySlug}`;

  return { specialty, city, title, description, canonicalUrl };
}
