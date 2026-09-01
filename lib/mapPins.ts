// src/lib/mapPins.ts

/**
 * 🗺️ Configuración visual de pines de mapa según Rol y Especialidad Médica
 */

export interface MapPinOptions {
  role?: string;
  specialty?: string;
  isHomeVisit?: boolean;
  isPromoted?: boolean;
  isSelected?: boolean;
  isHovered?: boolean;
  logoUrl?: string;
}

export interface MapPinTheme {
  primaryColor: string;
  secondaryColor: string;
  iconSvgPath: string;
  label: string;
}

// 🎨 Paletas y SVG Paths por Rol
const ROLE_THEMES: Record<string, { primary: string; secondary: string; svgPath: string; label: string }> = {
  CLINIC: {
    primary: '#2563EB', // Azul médico
    secondary: '#DBEAFE',
    svgPath: 'M3 21h18M5 21V5a2 2 0 012-2h10a2 2 0 012 2v16M9 9h1m-1 4h1m4-4h1m-1 4h1m-4 8v-4h4v4',
    label: 'Clínica / Hospital',
  },
  HOSPITAL: {
    primary: '#1D4ED8',
    secondary: '#BFDBFE',
    svgPath: 'M3 21h18M5 21V5a2 2 0 012-2h10a2 2 0 012 2v16M9 9h1m-1 4h1m4-4h1m-1 4h1m-4 8v-4h4v4',
    label: 'Hospital',
  },
  FOUNDATION: {
    primary: '#059669', // Verde esmeralda
    secondary: '#D1FAE5',
    svgPath: 'M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0016.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 002 8.5c0 2.3 1.5 4.05 3 5.5l7 7z',
    label: 'Fundación',
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
    primary: '#7C3AED', // Violeta
    secondary: '#EDE9FE',
    svgPath: 'M10 2v7.31M14 2v7.31M8.5 2h7M14 9.3a6.5 6.5 0 11-4 0L10 2h4l.5 7.3z',
    label: 'Laboratorio',
  },
};

// 🩺 Paletas y SVG Paths por Especialidad
const SPECIALTY_THEMES: Record<string, { primary: string; secondary: string; svgPath: string; label: string }> = {
  CARDIOLOGY: {
    primary: '#E11D48', // Carmesí / Rosa fuerte
    secondary: '#FFE4E6',
    svgPath: 'M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0016.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 002 8.5c0 2.3 1.5 4.05 3 5.5l7 7z',
    label: 'Cardiología',
  },
  DENTISTRY: {
    primary: '#06B6D4', // Cian / Turquesa
    secondary: '#CFFAFE',
    svgPath: 'M12 2a5 5 0 00-5 5c0 3 2 6 2 9 0 2 1 4 3 4s3-2 3-4c0-3 2-6 2-9a5 5 0 00-5-5z',
    label: 'Odontología',
  },
  ODONTOLOGY: {
    primary: '#06B6D4',
    secondary: '#CFFAFE',
    svgPath: 'M12 2a5 5 0 00-5 5c0 3 2 6 2 9 0 2 1 4 3 4s3-2 3-4c0-3 2-6 2-9a5 5 0 00-5-5z',
    label: 'Odontología',
  },
  PEDIATRICS: {
    primary: '#F59E0B', // Ámbar cálido
    secondary: '#FEF3C7',
    svgPath: 'M12 2a5 5 0 105 5 5 5 0 00-5-5zm0 12c-4 0-8 2-8 6v2h16v-2c0-4-4-6-8-6z',
    label: 'Pediatría',
  },
  DERMATOLOGY: {
    primary: '#8B5CF6', // Púrpura suave
    secondary: '#F3E8FF',
    svgPath: 'M12 3l1.5 3.5L17 8l-3.5 1.5L12 13l-1.5-3.5L7 8l3.5-1.5zM19 15l1 2 2 1-2 1-1 2-1-2-2-1 2-1z',
    label: 'Dermatología',
  },
  PSYCHOLOGY: {
    primary: '#6366F1', // Índigo
    secondary: '#E0E7FF',
    svgPath: 'M9.5 2A2.5 2.5 0 007 4.5V6a3 3 0 00-2 2.82V10a3 3 0 001.5 2.6A3 3 0 006 14.5a3 3 0 003 3h.5v2.5a2 2 0 004 0V17.5h.5a3 3 0 003-3 3 3 0 00-.5-1.9A3 3 0 0018 10V8.82A3 3 0 0016 6V4.5A2.5 2.5 0 0013.5 2h-4z',
    label: 'Psicología',
  },
  PSYCHIATRY: {
    primary: '#6366F1',
    secondary: '#E0E7FF',
    svgPath: 'M9.5 2A2.5 2.5 0 007 4.5V6a3 3 0 00-2 2.82V10a3 3 0 001.5 2.6A3 3 0 006 14.5a3 3 0 003 3h.5v2.5a2 2 0 004 0V17.5h.5a3 3 0 003-3 3 3 0 00-.5-1.9A3 3 0 0018 10V8.82A3 3 0 0016 6V4.5A2.5 2.5 0 0013.5 2h-4z',
    label: 'Psiquiatría',
  },
  NUTRITION: {
    primary: '#84CC16', // Lima / Verde saludable
    secondary: '#ECFCCB',
    svgPath: 'M12 20.94c1.88-1.55 7-6.2 7-10.94a6 6 0 00-6-6 4.9 4.9 0 00-1 .1A4.9 4.9 0 0011 4a6 6 0 00-6 6c0 4.74 5.12 9.39 7 10.94zM12 4v4',
    label: 'Nutrición',
  },
  GYNECOLOGY: {
    primary: '#EC4899', // Rosa
    secondary: '#FCE7F3',
    svgPath: 'M12 2a4 4 0 00-4 4c0 3 4 8 4 8s4-5 4-8a4 4 0 00-4-4zm0 13v7m-3-3h6',
    label: 'Ginecología',
  },
  OPHTHALMOLOGY: {
    primary: '#0EA5E9', // Azul cielo
    secondary: '#E0F2FE',
    svgPath: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zm11 3a3 3 0 100-6 3 3 0 000 6z',
    label: 'Oftalmología',
  },
  PHYSIOTHERAPY: {
    primary: '#2563EB', // Azul deportivo
    secondary: '#DBEAFE',
    svgPath: 'M22 12h-4l-3 9L9 3l-3 9H2',
    label: 'Fisioterapia',
  },
  GENERAL_PRACTICE: {
    primary: '#059669', // Esmeralda QuHealthy
    secondary: '#D1FAE5',
    svgPath: 'M4.8 2.3A.3.3 0 104.2 2a2 2 0 00-2 2v5a6 6 0 006 6v0a6 6 0 006-6V4a2 2 0 00-2-2 .3.3 0 10-.6.3A1 1 0 0113 3v6a5 5 0 01-5 5 5 5 0 01-5-5V3a1 1 0 011.8-.7zM14 18v3a2 2 0 002 2h0a2 2 0 002-2v-3a2 2 0 00-4 0z',
    label: 'Medicina General',
  },
};

// 🚗 Ícono de Visita a Domicilio (Auto / Maletín Médico)
const HOME_VISIT_ICON_PATH = 'M5 17h14M5 17a2 2 0 01-2-2V9a2 2 0 012-2h10a2 2 0 012 2v6a2 2 0 01-2 2M5 17h14m-12 0v2m10-2v2M9 7l2-4h4l2 4';

/**
 * Resuelve el tema (color e icono) basado en especialidad y rol
 */
export function resolvePinTheme(options: MapPinOptions): MapPinTheme {
  const roleClean = (options.role || '').replace('ROLE_', '').toUpperCase();
  const specialtyClean = (options.specialty || '').toUpperCase().replace(/[\s-]/g, '_');

  // 1. Si es a domicilio prioritario
  if (options.isHomeVisit) {
    return {
      primaryColor: '#059669',
      secondaryColor: '#ECFDF5',
      iconSvgPath: HOME_VISIT_ICON_PATH,
      label: 'Visita a Domicilio',
    };
  }

  // 2. Si coincide con una especialidad médica
  for (const [key, theme] of Object.entries(SPECIALTY_THEMES)) {
    if (specialtyClean.includes(key) || key.includes(specialtyClean)) {
      return {
        primaryColor: theme.primary,
        secondaryColor: theme.secondary,
        iconSvgPath: theme.svgPath,
        label: theme.label,
      };
    }
  }

  // 3. Si coincide con un rol corporativo/clínico
  if (ROLE_THEMES[roleClean]) {
    const rTheme = ROLE_THEMES[roleClean];
    return {
      primaryColor: rTheme.primary,
      secondaryColor: rTheme.secondary,
      iconSvgPath: rTheme.svgPath,
      label: rTheme.label,
    };
  }

  // 4. Default: Médico General
  return {
    primaryColor: '#059669',
    secondaryColor: '#D1FAE5',
    iconSvgPath: SPECIALTY_THEMES.GENERAL_PRACTICE.svgPath,
    label: 'Salud y Bienestar',
  };
}

/**
 * Genera el SVG completo del Pin para Google Maps
 */
export function generateMapPinSvg(options: MapPinOptions): string {
  const theme = resolvePinTheme(options);
  const isSelected = !!options.isSelected;
  const isHovered = !!options.isHovered;
  const isPromoted = !!options.isPromoted;

  const width = isSelected ? 48 : isHovered ? 44 : 38;
  const height = isSelected ? 58 : isHovered ? 53 : 46;
  const strokeColor = '#FFFFFF';
  const strokeWidth = isSelected ? 3 : 2;

  // Pin SVG con sombra y badge interno
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 38 46" fill="none">
      <defs>
        <filter id="pinShadow" x="0" y="0" width="38" height="46" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
          <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="${theme.primaryColor}" flood-opacity="0.35"/>
        </filter>
        <linearGradient id="pinGrad" x1="19" y1="2" x2="19" y2="40" gradientUnits="userSpaceOnUse">
          <stop stop-color="${theme.primaryColor}"/>
          <stop offset="1" stop-color="${theme.primaryColor}" stop-opacity="0.9"/>
        </linearGradient>
      </defs>

      <!-- Pin Body -->
      <g filter="url(#pinShadow)">
        <path d="M19 2C10.163 2 3 9.163 3 18C3 28.5 19 41 19 41C19 41 35 28.5 35 18C35 9.163 27.837 2 19 2Z" 
              fill="url(#pinGrad)" 
              stroke="${strokeColor}" 
              stroke-width="${strokeWidth}"/>
      </g>

      <!-- Círculo interior blanco de contraste -->
      <circle cx="19" cy="17" r="11" fill="#FFFFFF" opacity="0.98"/>

      <!-- Ícono de la Especialidad / Rol -->
      <g transform="translate(7.5, 5.5) scale(0.95)" stroke="${theme.primaryColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none">
        <path d="${theme.iconSvgPath}"/>
      </g>

      ${
        isPromoted
          ? `<!-- Estrella / Badge Promocionado -->
             <circle cx="29" cy="8" r="4.5" fill="#F59E0B" stroke="#FFFFFF" stroke-width="1.5"/>
             <path d="M29 5.5l.8 1.6 1.8.3-1.3 1.2.3 1.8-1.6-.8-1.6.8.3-1.8-1.3-1.2 1.8-.3z" fill="#FFFFFF"/>`
          : ''
      }
      ${
        options.isHomeVisit
          ? `<!-- Badge Domicilio -->
             <circle cx="9" cy="8" r="4.5" fill="#10B981" stroke="#FFFFFF" stroke-width="1.5"/>
             <path d="M7 8.5l1.5 1.5 3-3" stroke="#FFFFFF" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>`
          : ''
      }
    </svg>
  `
    .replace(/\\s+/g, ' ')
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

  const width = isSelected ? 48 : isHovered ? 44 : 38;
  const height = isSelected ? 58 : isHovered ? 53 : 46;

  if (googleMaps) {
    return {
      url: generateMapPinSvg(options),
      scaledSize: new googleMaps.Size(width, height),
      anchor: new googleMaps.Point(width / 2, height - 4),
    };
  }

  return {
    url: generateMapPinSvg(options),
  };
}
