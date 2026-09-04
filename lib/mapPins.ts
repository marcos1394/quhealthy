// src/lib/mapPins.ts

/**
 * 🗺️ Configuración visual de pines de mapa según Rol, Especialidad Médica y Nombre de Proveedor/Institución
 */

export interface MapPinOptions {
  role?: string;
  specialty?: string;
  name?: string;
  category?: string;
  isClinic?: boolean;
  isHomeVisit?: boolean;
  isPromoted?: boolean;
  isSelected?: boolean;
  isHovered?: boolean;
  logoUrl?: string;
}

export interface MapPinTheme {
  primaryColor: string;
  secondaryColor: string;
  iconSvgPath?: string;
  customSvgHtml?: string;
  label: string;
  categoryKey: string;
}

/**
 * Normaliza cualquier string clínico o comercial para comparación tolerante a acentos y mayúsculas
 */
export function normalizeSpecialty(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '_');
}

// 🩺 Catálogo de Especialidades y Grupos Clínicos
interface SpecialtyGroupConfig {
  primary: string;
  secondary: string;
  svgPath: string;
  label: string;
  keywords: string[];
}

const CLINICAL_SPECIALTY_GROUPS: Record<string, SpecialtyGroupConfig> = {
  CARDIOLOGY: {
    primary: '#E11D48', // Rose / Carmesí
    secondary: '#FFE4E6',
    // Corazón con línea de pulso
    svgPath: 'M3 12h3l2-4 4 8 2-4h4m2 0a5 5 0 00-5-5c-1.8 0-3 .8-4 2-1-1.2-2.2-2-4-2a5 5 0 00-5 5c0 4.5 9 10 9 10s9-5.5 9-10z',
    label: 'Cardiología',
    keywords: ['CARDIO', 'VASCULAR', 'CORAZON', 'ANGIOLOG', 'HEMODINAMIA'],
  },
  DENTISTRY: {
    primary: '#0891B2', // Cyan 600
    secondary: '#CFFAFE',
    // Diente / Odontología
    svgPath: 'M7 3C5 3 4 5 4 8c0 3 1.5 6 2 9 0 2 1 4 2.5 4s2-2 2-4c0-2 .5-4 1.5-6 1 2 1.5 4 1.5 6 0 2 .5 4 2 4s2.5-2 2.5-4c.5-3 2-6 2-9 0-3-1-5-3-5s-3 1-4.5 2C10 4 9 3 7 3z',
    label: 'Odontología',
    keywords: ['ODONTO', 'DENT', 'ORTODON', 'PERIODON', 'ENDODON', 'MAXILO', 'DIENTE', 'BUCAL', 'SONRISA'],
  },
  PEDIATRICS: {
    primary: '#F59E0B', // Amber 500
    secondary: '#FEF3C7',
    // Niño / Carita infantil
    svgPath: 'M12 3a5 5 0 100 10A5 5 0 0012 3zm-6 17c0-3.3 2.7-6 6-6s6 2.7 6 6v1H6v-1zm3-11.5a1 1 0 112 0 1 1 0 01-2 0zm6 0a1 1 0 112 0 1 1 0 01-2 0z',
    label: 'Pediatría',
    keywords: ['PEDIATR', 'NINO', 'INFANTIL', 'NEONATO', 'PUERICULTURA'],
  },
  DERMATOLOGY: {
    primary: '#9333EA', // Purple 600
    secondary: '#F3E8FF',
    // Destellos / Cuidado de la piel
    svgPath: 'M12 2l1.8 4.6L18 8.4l-3.6 3.2L15.3 16 12 13.8 8.7 16l.9-4.4L6 8.4l4.2-1.8L12 2z',
    label: 'Dermatología',
    keywords: ['DERMA', 'PIEL', 'COSMIATR', 'ESTETICA', 'TRICOLOG'],
  },
  MENTAL_HEALTH: {
    primary: '#6366F1', // Indigo 500
    secondary: '#E0E7FF',
    // Cerebro / Salud mental
    svgPath: 'M9.5 3A2.5 2.5 0 007 5.5V7a3 3 0 00-2 2.8V11a3 3 0 001.5 2.6A3 3 0 006 15.5a3 3 0 003 3h.5v2.5a2 2 0 004 0V18.5h.5a3 3 0 003-3 3 3 0 00-.5-1.9A3 3 0 0018 11V9.8A3 3 0 0016 7V5.5A2.5 2.5 0 0013.5 3h-4z',
    label: 'Salud Mental',
    keywords: ['PSICO', 'PSIQUIAT', 'MENTAL', 'TERAPIA_PSIC', 'CONDUCTUAL', 'EMOCIONAL', 'NEUROPSICO'],
  },
  OPHTHALMOLOGY: {
    primary: '#0284C7', // Sky 600
    secondary: '#E0F2FE',
    // Ojo / Visión
    svgPath: 'M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7zm10 3.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z',
    label: 'Oftalmología',
    keywords: ['OFTALMO', 'OPTOMETR', 'OCULISTA', 'VISION', 'OJOS', 'RETINA', 'OPTICA'],
  },
  GYNECOLOGY: {
    primary: '#DB2777', // Pink 600
    secondary: '#FCE7F3',
    // Flor / Símbolo femenino
    svgPath: 'M12 2a5 5 0 100 10 5 5 0 000-10zm0 10v8m-3.5-4h7',
    label: 'Ginecología',
    keywords: ['GINECO', 'OBSTETR', 'MATERN', 'REPRODUC', 'MUJER', 'COLPOSCOP'],
  },
  NUTRITION: {
    primary: '#65A30D', // Lime 600
    secondary: '#ECFCCB',
    // Manzana / Hoja
    svgPath: 'M12 20.94c1.88-1.55 7-6.2 7-10.94a6 6 0 00-6-6 4.9 4.9 0 00-1 .1A4.9 4.9 0 0011 4a6 6 0 00-6 6c0 4.74 5.12 9.39 7 10.94zM12 4v4',
    label: 'Nutrición',
    keywords: ['NUTRI', 'DIETET', 'BARIATR', 'ALIMENT', 'OBESIDAD'],
  },
  TRAUMATOLOGY: {
    primary: '#D97706', // Amber 600
    secondary: '#FEF3C7',
    // Hueso / Articulación
    svgPath: 'M18 4a2 2 0 00-2 2v1h-8V6a2 2 0 00-4 0v1a2 2 0 002 2h1v6H6a2 2 0 00-2 2v1a2 2 0 004 0v-1h8v1a2 2 0 004 0v-1a2 2 0 00-2-2h-1V9h1a2 2 0 002-2V6a2 2 0 00-2-2z',
    label: 'Traumatología',
    keywords: ['TRAUMA', 'ORTOPED', 'COLUMNA', 'HUESO', 'ARTICUL', 'QUIROPRACT', 'ARTROSCOP'],
  },
  PHYSIOTHERAPY: {
    primary: '#2563EB', // Blue 600
    secondary: '#DBEAFE',
    // Actividad / Movimiento
    svgPath: 'M22 12h-4l-3 9L9 3l-3 9H2',
    label: 'Fisioterapia',
    keywords: ['FISIO', 'REHABILIT', 'KINESIO', 'DEPORT', 'TERAPIA_FISICA'],
  },
  LABORATORY: {
    primary: '#0D9488', // Teal 600
    secondary: '#CCFBF1',
    // Matraz / Laboratorio clínico
    svgPath: 'M10 2v7.3M14 2v7.3M8.5 2h7M14 9.3a6.5 6.5 0 11-4 0L10 2h4l.5 7.3z',
    label: 'Laboratorio',
    keywords: ['LABORATORIO', 'ANALISIS_CLINICO', 'PATOLOG', 'QFB', 'BIOQUIM', 'MUESTRAS', 'CLINICOS', 'SANGRE'],
  },
  ENT: {
    primary: '#0F766E', // Dark Teal
    secondary: '#CCFBF1',
    // Oído / Audición
    svgPath: 'M6 8.5a5.5 5.5 0 0110.6-2.1A4.5 4.5 0 0118 15a4 4 0 01-4 4h-2a2 2 0 01-2-2v-1a2 2 0 012-2h1a2 2 0 002-2V9.5A3.5 3.5 0 009.5 6 3.5 3.5 0 006 8.5v2',
    label: 'Otorrinolaringología',
    keywords: ['OTORRINO', 'OIDO', 'GARGANTA', 'NARIZ', 'AUDIOLOG', 'LARI'],
  },
  GASTROENTEROLOGY: {
    primary: '#EA580C', // Orange 600
    secondary: '#FFEDD5',
    // Tubo digestivo / Sistema
    svgPath: 'M7 4h10v3a5 5 0 01-10 0V4zm0 10v2a5 5 0 0010 0v-2',
    label: 'Gastroenterología',
    keywords: ['GASTRO', 'DIGESTIV', 'ENDOSCOP', 'HEPAT', 'COLON', 'CIRROSIS'],
  },
  UROLOGY: {
    primary: '#0369A1', // Sky 700
    secondary: '#E0F2FE',
    // Riñón / Vías urinarias
    svgPath: 'M12 3a6 6 0 00-6 6c0 4 6 12 6 12s6-8 6-12a6 6 0 00-6-6z',
    label: 'Urología / Nefrología',
    keywords: ['UROLOG', 'NEFROLOG', 'RENAL', 'PROSTATA', 'VIAS_URINARIAS'],
  },
  ONCOLOGY: {
    primary: '#A21CAF', // Magenta 700
    secondary: '#FAE8FF',
    // Lazo / Oncología
    svgPath: 'M12 2c-2.5 0-4 2-4 4.5 0 3 4 8.5 4 8.5s4-5.5 4-8.5C16 4 14.5 2 12 2zm-2 15l-3 5m7-5l3 5',
    label: 'Oncología',
    keywords: ['ONCOLOG', 'CANCER', 'QUIMIOTERAPIA', 'RADIOTERAPIA', 'TUMOR'],
  },
  SURGERY: {
    primary: '#DC2626', // Red 600
    secondary: '#FEE2E2',
    // Cruz Quirúrgica / Bisturí
    svgPath: 'M12 5v14m-7-7h14',
    label: 'Cirugía',
    keywords: ['CIRUG', 'SURGER', 'QUIRURG', 'OPERACION'],
  },
  GENERAL_PRACTICE: {
    primary: '#059669', // Esmeralda QuHealthy
    secondary: '#D1FAE5',
    // Estetoscopio (Solo para medicina general/familiar explícita)
    svgPath: 'M4.8 2.3A.3.3 0 104.2 2a2 2 0 00-2 2v5a6 6 0 006 6v0a6 6 0 006-6V4a2 2 0 00-2-2 .3.3 0 10-.6.3A1 1 0 0113 3v6a5 5 0 01-5 5 5 5 0 01-5-5V3a1 1 0 011.8-.7zM14 18v3a2 2 0 002 2h0a2 2 0 002-2v-3a2 2 0 00-4 0z',
    label: 'Medicina General',
    keywords: ['MEDICINA_GENERAL', 'MEDICO_GENERAL', 'MEDICINA_FAMILIAR', 'MEDICO_FAMILIAR', 'MEDICINA_INTERNA', 'INTERNISTA', 'MEDICO_DE_CABECERA'],
  },
};

// 🎨 Paletas y SVG Paths por Rol Institucional
const ROLE_THEMES: Record<string, { primary: string; secondary: string; svgPath?: string; customSvgHtml?: string; label: string }> = {
  CLINIC: {
    primary: '#1E40AF', // Azul hospitalario
    secondary: '#DBEAFE',
    svgPath: 'M3 21h18M5 21V5a2 2 0 012-2h10a2 2 0 012 2v16M9 9h1m-1 4h1m4-4h1m-1 4h1m-4 8v-4h4v4',
    label: 'Clínica / Centro Médico',
  },
  HOSPITAL: {
    primary: '#1E40AF',
    secondary: '#DBEAFE',
    svgPath: 'M3 21h18M5 21V5a2 2 0 012-2h10a2 2 0 012 2v16M9 9h1m-1 4h1m4-4h1m-1 4h1m-4 8v-4h4v4',
    label: 'Hospital',
  },
  FOUNDATION: {
    primary: '#E11D48', // Carmesí / Rose distintivo para Fundaciones (nunca verde ni estetoscopio)
    secondary: '#FFE4E6',
    customSvgHtml: `
      <g transform="translate(6.5, 5) scale(0.62)">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#E11D48"/>
        <path d="M12 7.5v6m-3-3h6" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round"/>
      </g>
    `,
    label: 'Fundación / ONG',
  },
  PHARMACY: {
    primary: '#D97706', // Ámbar
    secondary: '#FEF3C7',
    svgPath: 'M10.5 20.5l10-10a4.95 4.95 0 10-7-7l-10 10a4.95 4.95 0 107 7zM8.5 8.5l7 7',
    label: 'Farmacia',
  },
  SUPPLIER: {
    primary: '#EA580C', // Naranja
    secondary: '#FFEDD5',
    svgPath: 'M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0',
    label: 'Proveedor Médico',
  },
  LABORATORY: {
    primary: '#0D9488', // Teal
    secondary: '#CCFBF1',
    svgPath: 'M10 2v7.3M14 2v7.3M8.5 2h7M14 9.3a6.5 6.5 0 11-4 0L10 2h4l.5 7.3z',
    label: 'Laboratorio Clínico',
  },
};

// 🏥 Tema Default: Cruz Médica Universal (NUNCA un estetoscopio como fallback genérico)
const DEFAULT_CLINICAL_THEME: MapPinTheme = {
  primaryColor: '#0D9488', // Teal profesional
  secondaryColor: '#CCFBF1',
  iconSvgPath: 'M12 4v16m-8-8h16', // Cruz médica universal limpia
  label: 'Profesional de la Salud',
  categoryKey: 'GENERAL_HEALTH',
};

/**
 * Determina el tema visual (color, ícono, etiqueta) según la especialidad, el rol, y el nombre comercial
 */
export function resolvePinTheme(options: MapPinOptions): MapPinTheme {
  const normRole = (options.role || '').toUpperCase().trim();
  const normCategory = normalizeSpecialty(options.category || '');
  const normSpecialty = normalizeSpecialty(options.specialty || '');
  const normName = normalizeSpecialty(options.name || '');

  // 1. Detección prioritaria de Fundaciones / ONGs
  if (
    normRole === 'FOUNDATION' ||
    normRole === 'ONG' ||
    normRole === 'IAP' ||
    normCategory.includes('FUNDACION') ||
    normCategory.includes('ASOCIACION') ||
    normName.includes('FUNDACION') ||
    normName.includes('IAP')
  ) {
    const fTheme = ROLE_THEMES.FOUNDATION;
    return {
      primaryColor: fTheme.primary,
      secondaryColor: fTheme.secondary,
      customSvgHtml: fTheme.customSvgHtml,
      label: fTheme.label,
      categoryKey: 'FOUNDATION',
    };
  }

  // 2. Detección exhaustiva por texto acumulado (Especialidad, Categoría y Nombre comercial)
  const combinedClinicalText = `${normSpecialty} ${normCategory} ${normName}`;

  // Comprobar primero especialidades específicas (excluyendo medicina general)
  for (const [key, group] of Object.entries(CLINICAL_SPECIALTY_GROUPS)) {
    if (key === 'GENERAL_PRACTICE') continue;
    if (group.keywords.some((kw) => combinedClinicalText.includes(kw))) {
      return {
        primaryColor: group.primary,
        secondaryColor: group.secondary,
        iconSvgPath: group.svgPath,
        label: group.label,
        categoryKey: key,
      };
    }
  }

  // 3. Comprobar Medicina General explícita
  const generalGroup = CLINICAL_SPECIALTY_GROUPS.GENERAL_PRACTICE;
  if (generalGroup.keywords.some((kw) => combinedClinicalText.includes(kw))) {
    return {
      primaryColor: generalGroup.primary,
      secondaryColor: generalGroup.secondary,
      iconSvgPath: generalGroup.svgPath,
      label: generalGroup.label,
      categoryKey: 'GENERAL_PRACTICE',
    };
  }

  // 4. Roles institucionales (Clínica, Hospital, Farmacia, Laboratorio, Proveedor)
  if (options.isClinic || normName.includes('CLINICA') || normName.includes('HOSPITAL') || normRole === 'CLINIC' || normRole === 'HOSPITAL') {
    const cTheme = ROLE_THEMES.CLINIC;
    return {
      primaryColor: cTheme.primary,
      secondaryColor: cTheme.secondary,
      iconSvgPath: cTheme.svgPath,
      label: cTheme.label,
      categoryKey: 'CLINIC',
    };
  }

  if (normRole && ROLE_THEMES[normRole]) {
    const roleTheme = ROLE_THEMES[normRole];
    return {
      primaryColor: roleTheme.primary,
      secondaryColor: roleTheme.secondary,
      iconSvgPath: roleTheme.svgPath,
      customSvgHtml: roleTheme.customSvgHtml,
      label: roleTheme.label,
      categoryKey: normRole,
    };
  }

  // 5. Fallback Universal: Cruz Médica QuHealthy (No estetoscopio)
  return DEFAULT_CLINICAL_THEME;
}

/**
 * Obtiene el tema visual a partir de una especialidad, rol clínico, nombre o indicador de clínica
 */
export function getSpecialtyTheme(
  specialty?: string,
  role?: string,
  name?: string,
  isClinic?: boolean
): MapPinTheme {
  return resolvePinTheme({ specialty, role, name, isClinic });
}

/**
 * Genera el SVG completo del Pin para Google Maps
 * Optimizado a tamaños compactos (26x34 en estado normal) con IDs únicos por color
 */
export function generateMapPinSvg(options: MapPinOptions): string {
  const theme = resolvePinTheme(options);
  const isSelected = !!options.isSelected;
  const isHovered = !!options.isHovered;
  const isPromoted = !!options.isPromoted;

  // 📐 Dimensiones compactas tipo Google Maps (26x34px base)
  const width = isSelected ? 36 : isHovered ? 32 : 26;
  const height = isSelected ? 46 : isHovered ? 41 : 34;
  const strokeColor = '#FFFFFF';
  const strokeWidth = isSelected ? 2.2 : 1.6;

  // Safe unique IDs preventing browser cache collision across pins of different themes
  const safeId = theme.primaryColor.replace('#', '');
  const filterId = `ps_${safeId}`;
  const gradId = `pg_${safeId}`;

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 28 36" fill="none">
      <defs>
        <filter id="${filterId}" x="0" y="0" width="28" height="36" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.8" flood-color="${theme.primaryColor}" flood-opacity="0.35"/>
        </filter>
        <linearGradient id="${gradId}" x1="14" y1="1.5" x2="14" y2="33" gradientUnits="userSpaceOnUse">
          <stop stop-color="${theme.primaryColor}"/>
          <stop offset="1" stop-color="${theme.primaryColor}" stop-opacity="0.92"/>
        </linearGradient>
      </defs>

      <!-- Pin Teardrop Body -->
      <g filter="url(#${filterId})">
        <path d="M14 1.5C7.6 1.5 2.5 6.6 2.5 13c0 8.5 11.5 20.2 11.5 20.2S25.5 21.5 25.5 13c0-6.4-5.1-11.5-11.5-11.5z" 
              fill="url(#${gradId})" 
              stroke="${strokeColor}" 
              stroke-width="${strokeWidth}"/>
      </g>

      <!-- Círculo interior blanco de contraste -->
      <circle cx="14" cy="12.5" r="8.2" fill="#FFFFFF"/>

      ${
        theme.customSvgHtml
          ? theme.customSvgHtml
          : `<!-- Ícono de la Especialidad / Rol -->
             <g transform="translate(6, 4.5) scale(0.67)" stroke="${theme.primaryColor}" stroke-width="${theme.categoryKey === 'GENERAL_HEALTH' ? '3' : '2.2'}" stroke-linecap="round" stroke-linejoin="round" fill="none">
               <path d="${theme.iconSvgPath || 'M12 4v16m-8-8h16'}"/>
             </g>`
      }

      ${
        isPromoted
          ? `<!-- Badge Promocionado (Estrella) -->
             <circle cx="22" cy="6" r="3.5" fill="#F59E0B" stroke="#FFFFFF" stroke-width="1.2"/>
             <path d="M22 4.2l.6 1.2 1.3.2-1 .9.2 1.3-1.1-.6-1.1.6.2-1.3-1-.9 1.3-.2z" fill="#FFFFFF"/>`
          : ''
      }
      ${
        options.isHomeVisit
          ? `<!-- Badge Domicilio (Check) -->
             <circle cx="6" cy="6" r="3.5" fill="#10B981" stroke="#FFFFFF" stroke-width="1.2"/>
             <path d="M4.5 6.2l1 1 2-2" stroke="#FFFFFF" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>`
          : ''
      }
    </svg>
  `
    .replace(/\s+/g, ' ')
    .trim();

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

/**
 * Devuelve el objeto Icon listo para ser consumido por MarkerF de @react-google-maps/api
 */
export function getMapMarkerIcon(
  options: MapPinOptions,
  googleMaps?: typeof google.maps
): google.maps.Icon | { url: string } {
  const isSelected = !!options.isSelected;
  const isHovered = !!options.isHovered;

  const width = isSelected ? 36 : isHovered ? 32 : 26;
  const height = isSelected ? 46 : isHovered ? 41 : 34;

  if (googleMaps) {
    return {
      url: generateMapPinSvg(options),
      scaledSize: new googleMaps.Size(width, height),
      anchor: new googleMaps.Point(width / 2, height - 2),
    };
  }

  return {
    url: generateMapPinSvg(options),
  };
}
