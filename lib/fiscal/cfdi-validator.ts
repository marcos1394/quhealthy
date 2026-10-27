/**
 * Validador SAT CFDI 4.0 para Personas Físicas y Morales en QuHealthy
 * Conforme al Anexo 20 del SAT y catálogos c_RegimenFiscal y c_UsoCFDI.
 */

export type RfcType = 'FISICA' | 'MORAL' | 'GENERICO';

export interface RfcValidationResult {
  isValid: boolean;
  type?: RfcType;
  normalizedRfc?: string;
  error?: string;
}

export interface GenericValidationResult {
  isValid: boolean;
  error?: string;
}

export interface CfdiValidationPayload {
  rfc: string;
  name: string;
  zipCode: string;
  regime: string;
  cfdiUse: string;
  email?: string;
}

export interface CfdiPayloadValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

// RFC Regex oficial SAT:
// Persona Física: 4 letras + 6 dígitos AAMMDD + 3 caracteres homoclave (13 caracteres)
const RFC_FISICA_REGEX = /^[A-ZÑ&]{4}\d{6}[A-Z0-9]{3}$/;

// Persona Moral: 3 letras + 6 dígitos AAMMDD + 3 caracteres homoclave (12 caracteres)
const RFC_MORAL_REGEX = /^[A-ZÑ&]{3}\d{6}[A-Z0-9]{3}$/;

// RFC Genéricos del SAT
const RFC_GENERICO_NACIONAL = 'XAXX010101000';
const RFC_GENERICO_EXTRANJERO = 'XEXX010101000';

// Catálogo básico SAT CFDI 4.0 de Regímenes Fiscales vigentes
export const VALID_SAT_REGIMES = new Set([
  '601', // General de Ley Personas Morales
  '603', // Personas Morales con Fines no Lucrativos
  '605', // Sueldos y Salarios e Ingresos Asimilados a Salarios
  '606', // Arrendamiento
  '607', // Régimen de Enajenación o Adquisición de Bienes
  '608', // Demás ingresos
  '610', // Residentes en el Extranjero sin Establecimiento Permanente en México
  '611', // Ingresos por Dividendos (socios y accionistas)
  '612', // Personas Físicas con Actividades Empresariales y Profesionales
  '614', // Ingresos por intereses
  '615', // Régimen de los ingresos por obtención de premios
  '616', // Sin obligaciones fiscales
  '620', // Sociedades Cooperativas de Producción que optan por diferir sus ingresos
  '621', // Incorporación Fiscal
  '622', // Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras
  '623', // Opcional para Grupos de Sociedades
  '624', // Coordinados
  '625', // Régimen de las Actividades Empresariales con ingresos a través de Plataformas Tecnológicas
  '626', // Régimen Simplificado de Confianza (RESICO)
]);

// Catálogo SAT CFDI 4.0 de Usos de CFDI
export const VALID_SAT_CFDI_USES = new Set([
  'G01', // Adquisición de mercancías
  'G02', // Devoluciones, descuentos o bonificaciones
  'G03', // Gastos en general
  'I01', // Construcciones
  'I02', // Mobilario y equipo de oficina por inversiones
  'I03', // Equipo de transporte
  'I04', // Equipo de computo y accesorios
  'I05', // Dados, troqueles, moldes, matrices y herramental
  'I06', // Comunicaciones telefónicas
  'I07', // Comunicaciones satelitales
  'I08', // Otra maquinaria y equipo
  'D01', // Honorarios médicos, dentales y gastos hospitalarios
  'D02', // Gastos médicos por incapacidad o discapacidad
  'D03', // Gastos funerales
  'D04', // Donativos
  'D05', // Intereses reales efectivamente pagados por créditos hipotecarios (casa habitación)
  'D06', // Aportaciones voluntarias al SAR
  'D07', // Primas por seguros de gastos médicos
  'D08', // Gastos de transportación escolar obligatoria
  'D09', // Depósitos en cuentas personales especiales para el ahorro
  'D10', // Pagos por servicios educativos (colegiaturas)
  'CP01', // Pagos
  'CN01', // Nómina
  'S01', // Sin efectos fiscales
]);

// Usos de CFDI deducibles exclusivos para Personas Físicas
const FISICA_ONLY_USES = new Set([
  'D01', 'D02', 'D03', 'D04', 'D05', 'D06', 'D07', 'D08', 'D09', 'D10',
]);

/**
 * Valida un RFC mexicano con formato SAT (Física 13 chars, Moral 12 chars o Genérico).
 */
export function validateRfc(rawRfc: string): RfcValidationResult {
  if (!rawRfc || typeof rawRfc !== 'string') {
    return { isValid: false, error: 'El RFC es requerido.' };
  }

  const normalized = rawRfc.trim().toUpperCase();

  if (normalized === RFC_GENERICO_NACIONAL || normalized === RFC_GENERICO_EXTRANJERO) {
    return { isValid: true, type: 'GENERICO', normalizedRfc: normalized };
  }

  if (normalized.length === 13) {
    if (RFC_FISICA_REGEX.test(normalized)) {
      return { isValid: true, type: 'FISICA', normalizedRfc: normalized };
    }
    return {
      isValid: false,
      error: 'Estructura de RFC de Persona Física inválida (debe tener 4 letras, 6 dígitos de fecha AAMMDD y 3 caracteres homoclave).',
    };
  }

  if (normalized.length === 12) {
    if (RFC_MORAL_REGEX.test(normalized)) {
      return { isValid: true, type: 'MORAL', normalizedRfc: normalized };
    }
    return {
      isValid: false,
      error: 'Estructura de RFC de Persona Moral inválida (debe tener 3 letras, 6 dígitos de fecha AAMMDD y 3 caracteres homoclave).',
    };
  }

  return {
    isValid: false,
    error: `Longitud de RFC inválida (${normalized.length} caracteres). Debe ser de 13 para Persona Física o 12 para Persona Moral.`,
  };
}

/**
 * Valida el Código Postal fiscal mexicano (5 dígitos numéricos).
 */
export function validateZipCode(rawZipCode: string): GenericValidationResult {
  if (!rawZipCode || typeof rawZipCode !== 'string') {
    return { isValid: false, error: 'El código postal es requerido.' };
  }

  const clean = rawZipCode.trim();
  if (!/^\d{5}$/.test(clean)) {
    return {
      isValid: false,
      error: 'El código postal debe constar exactamente de 5 dígitos numéricos.',
    };
  }

  return { isValid: true };
}

/**
 * Valida que la clave de Régimen Fiscal pertenezca al catálogo del SAT.
 */
export function validateRegime(regime: string): GenericValidationResult {
  if (!regime || typeof regime !== 'string') {
    return { isValid: false, error: 'El régimen fiscal es requerido.' };
  }

  const clean = regime.trim();
  if (!VALID_SAT_REGIMES.has(clean)) {
    return {
      isValid: false,
      error: `El régimen fiscal '${clean}' no es válido conforme al catálogo del SAT.`,
    };
  }

  return { isValid: true };
}

/**
 * Valida el Uso de CFDI y su compatibilidad con el tipo de persona (Física vs Moral).
 */
export function validateCfdiUse(
  cfdiUse: string,
  rfcType?: RfcType
): GenericValidationResult {
  if (!cfdiUse || typeof cfdiUse !== 'string') {
    return { isValid: false, error: 'El uso de CFDI es requerido.' };
  }

  const clean = cfdiUse.trim().toUpperCase();
  if (!VALID_SAT_CFDI_USES.has(clean)) {
    return {
      isValid: false,
      error: `El uso de CFDI '${clean}' no es válido conforme al catálogo c_UsoCFDI del SAT.`,
    };
  }

  // Las deducciones personales D01-D10 solo aplican a Personas Físicas
  if (rfcType === 'MORAL' && FISICA_ONLY_USES.has(clean)) {
    return {
      isValid: false,
      error: `El uso de CFDI '${clean}' (deducción personal) no es aplicable para Personas Morales.`,
    };
  }

  return { isValid: true };
}

/**
 * Valida integralmente el payload de emisión o solicitud de CFDI 4.0.
 */
export function validateCfdiPayload(payload: CfdiValidationPayload): CfdiPayloadValidationResult {
  const errors: Record<string, string> = {};

  const rfcResult = validateRfc(payload.rfc);
  if (!rfcResult.isValid) {
    errors.rfc = rfcResult.error || 'RFC inválido.';
  }

  if (!payload.name || payload.name.trim().length < 2) {
    errors.name = 'La razón social o nombre completo es obligatorio y debe coincidir con la CSF.';
  }

  const zipResult = validateZipCode(payload.zipCode);
  if (!zipResult.isValid) {
    errors.zipCode = zipResult.error || 'Código postal inválido.';
  }

  const regimeResult = validateRegime(payload.regime);
  if (!regimeResult.isValid) {
    errors.regime = regimeResult.error || 'Régimen fiscal inválido.';
  }

  const useResult = validateCfdiUse(payload.cfdiUse, rfcResult.type);
  if (!useResult.isValid) {
    errors.cfdiUse = useResult.error || 'Uso de CFDI incompatible.';
  }

  if (payload.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(payload.email.trim())) {
      errors.email = 'Formato de correo electrónico inválido.';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
