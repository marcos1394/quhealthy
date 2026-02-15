// ================================
// ENUMS & TYPES
// ================================
export type UserRole = 'PROVIDER' | 'CONSUMER' | 'ADMIN';
export type ServiceType = 'HEALTH' | 'WELLNESS'; // Debe coincidir con tu Enum de Java

// ================================
// REGISTRO (REQUESTS)
// ================================

export interface RegisterConsumerRequest {
  firstName: string;      // 👈 Cambiado de 'name'
  lastName: string;       // 👈 Nuevo campo
  email: string;
  password: string;
  phone?: string;         // 👈 Opcional según tu @Pattern en Java
  termsAccepted: boolean; // 👈 Alineado con el nombre en Java
  referralCode?: string;
  utmSource?: string;
  utmMedium?: string;
}

export interface RegisterProviderRequest {
  // Datos divididos
  firstName: string;
  lastName: string;
  
  // Datos de contacto
  email: string;
  phone: string;
  password: string;
  
  // Datos de negocio requeridos
  businessName: string;
  parentCategoryId: number; // ⚠️ El backend pide ID numérico, no Enum string
  
  termsAccepted: boolean;
}
// ================================
// LOGIN (REQUESTS)
// ================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SocialLoginRequest {
  token: string; // Token de Google/Firebase
  role: UserRole;
}

// ================================
// RESPUESTAS (RESPONSES)
// ================================

/**
 * Respuesta exitosa del LOGIN.
 * Contiene el JWT y el estado del usuario.
 */
export interface AuthResponse {
  image: null;
  message: any;
  lastName: any;
  firstName: any;
  token: string;        // JWT Access Token
  refreshToken: string; // Refresh Token
  type: string;         // "Bearer"
  id: number;
  email: string;
  roles: string[];
  status?: {            // Estado de la cuenta para redirección en el Front
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
    onboardingComplete: boolean;
    hasActivePlan: boolean;
  };
}

/**
 * Respuesta al REGISTRAR un CONSUMER (201 Created)
 */
export interface ConsumerRegistrationResponse {
  message: string;
  consumerId: number; // o string, según tu Long en Java
  email: string;
}

/**
 * Respuesta al REGISTRAR un PROVIDER (201 Created)
 */
export interface ProviderRegistrationResponse {
  message: string;
  providerId: number; // o string
  email: string;
}

// ================================
// VERIFICACIÓN & RECUPERACIÓN
// ================================

export interface VerifyEmailRequest {
  token: string;
}

export interface VerifyPhoneRequest {
  phone: string;
  code: string;
}

export interface ResendVerificationRequest {
  email?: string; // Puede ser email o phone, según el caso
  phone?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  selector: string; // Token de seguridad parte 1
  verifier: string; // Token de seguridad parte 2
  newPassword: string;
}

// Respuesta genérica para operaciones simples (ej: "Email enviado")
export interface MessageResponse {
  message: string;
}