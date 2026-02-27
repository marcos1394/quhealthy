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
  // Datos de identidad
  firstName: string;
  lastName: string;

  // Credenciales
  email: string;
  password: string;

  // Legal
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
// 👤 USER DTO (NUEVO - ALINEADO CON BACKEND)
// ================================
export interface UserDTO {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  profileImageUrl?: string; // Puede venir null
}

// ================================
// 🚦 ESTADO DE CUENTA
// ================================
export interface AuthStatus {
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  onboardingComplete: boolean;
  hasActivePlan: boolean;
}

// ================================
// 🔐 RESPUESTA DE AUTENTICACIÓN
// ================================
export interface AuthResponse {
  token: string;
  type: string;
  refreshToken: string | null;
  role: 'CONSUMER' | 'PROVIDER' | 'ADMIN';
  message: string;

  // ✅ ESTOS SON LOS CAMBIOS CLAVE:
  user: UserDTO;      // Objeto completo del usuario
  status: AuthStatus; // Estado de la cuenta
}


// ================================
// RESPUESTAS (RESPONSES)
// ================================



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
/**
 * Respuesta al REGISTRAR un PROVIDER (201 Created)
 * Alineada con el flujo de "Auto-Login" y "Baja Fricción"
 */
export interface ProviderRegistrationResponse {
  message: string;
  token: string;
  type: string;
  refreshToken: string | null;
  role: 'PROVIDER' | 'CONSUMER';

  // Datos del usuario creado
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    profileImageUrl: string | null;
  };

  // 🚩 VITAL: Semáforos de estado para navegación
  status: {
    onboardingComplete: boolean;
    hasActivePlan: boolean;
    emailVerified: boolean;
    phoneVerified: boolean;
  };
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

// --- Recovery Flow (forgot-password page) ---
export interface SendRecoveryCodeRequest {
  contact: string;
  method: 'email' | 'phone';
}

export interface VerifyRecoveryCodeRequest {
  contact: string;
  code: string;
}

export interface RecoveryResetPasswordRequest {
  contact: string;
  code: string;
  newPassword: string;
}

// --- Reset Password (reset-password page, token-based from email link) ---
export interface ValidateResetTokenRequest {
  selector?: string | null;
  verifier?: string | null;
  token?: string | null;
}

export interface ConfirmResetPasswordRequest {
  selector?: string | null;
  verifier?: string | null;
  token?: string | null;
  password: string;
}

// --- Resend phone verification ---
export interface ResendPhoneCodeRequest {
  // Empty body—auth is handled by cookie/token
}

// Respuesta genérica para operaciones simples (ej: "Email enviado")
export interface MessageResponse {
  message: string;
}