// Ubicación: src/types/auth.ts

// ================================
// ENUMS & TYPES
// ================================
export type UserRole = 'ROLE_CONSUMER' | 'ROLE_PROVIDER' | 'ROLE_ADMIN' | 'ROLE_STAFF';
export type ServiceType = 'HEALTH' | 'WELLNESS'; // Mantener si se usaba

// ================================
// REGISTRO (REQUESTS & RESPONSES)
// ================================

export interface RegisterConsumerRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  termsAccepted: true;
  privacyPolicyVersion: string;
  referralCode?: string;
  utmSource?: string;
  utmMedium?: string;
  captchaToken: string;
}

export interface ConsumerRegistrationResponse {
  id: number;
  email: string;
  firstName: string;
  message: string;
  createdAt: string; // ISO 8601
}

export interface RegisterProviderRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  termsAccepted: true;
  privacyPolicyVersion: string;
  referralCode?: string;
  captchaToken: string;
}

export interface ProviderRegistrationResponse {
  id: number;
  email: string;
  firstName: string;
  message: string;
  createdAt: string; // ISO 8601
}

// ================================
// AUTENTICACIÓN CENTRALIZADA (RESPONSE)
// ================================

export interface AuthUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  profileImageUrl: string | null;
  role?: 'ROLE_CONSUMER' | 'ROLE_PROVIDER' | 'ROLE_ADMIN' | 'ROLE_STAFF';
  permissions?: string[];           // módulos que el provider le otorgó al staff
  parentProviderId?: number;        // ID del proveedor al que pertenece (solo ROLE_STAFF)
  staffRole?: string;               // ej: "RECEPTIONIST", "NURSE", "ASSISTANT"
  planStatus?: string;
  trialExpiresAt?: string;
}

export interface AuthStatus {
  emailVerified: boolean;
  phoneVerified: boolean;
  onboardingComplete: boolean;
  hasActivePlan: boolean;
}

export interface AuthResponse {
  token: string;
  type: 'Bearer';
  refreshToken: string;
  expiresIn: number;        // segundos hasta expiración del access token
  role: UserRole;
  message: string;
  user: AuthUser;
  status: AuthStatus;
}

// ================================
// LOGIN (REQUESTS)
// ================================

export interface LoginRequest {
  email: string;
  password: string;
  captchaToken: string;
  role?: 'ROLE_CONSUMER' | 'ROLE_PROVIDER' | 'ROLE_STAFF' | 'ROLE_ADMIN';
}

export interface SocialLoginRequest {
  token: string;      // id_token de Google o Apple
  provider: 'GOOGLE' | 'APPLE';
  role: 'ROLE_CONSUMER' | 'ROLE_PROVIDER';  // ROLE_ADMIN nunca desde este flujo
}

// ==========================================================
// 🚀 RECUPERACIÓN DE CONTRASEÑA (ALINEADO AL BACKEND)
// ==========================================================

export interface ForgotPasswordRequest {
  email: string; // 🚀 Cambiado de 'contact' a 'email'
  deliveryMethod: 'LINK' | 'OTP_EMAIL' | 'OTP_SMS'; // 🚀 Cambiado a las opciones de Java
  captchaToken: string;
}

export interface VerifyRecoveryCodeRequest {
  email: string; // 🚀 Cambiado de 'contact' a 'email'
  code: string;  // 6 dígitos
}

export interface RecoveryResetPasswordRequest {
  token: string; // 🚀 El token que devuelve el verifyRecoveryCode o el link
  newPassword: string;
}

// ==========================================================
// 🔗 RESET PASSWORD (VÍA LINK)
// ==========================================================

export interface ValidateResetTokenRequest {
  token: string; // Viene del query param de la URL
}

// 🚀 NOTA: ConfirmResetPasswordRequest fue eliminado porque 
// RecoveryResetPasswordRequest ahora cumple esa misma función para ambos flujos.

// ================================
// VERIFICACIÓN DE IDENTIDAD (EMAIL & PHONE)
// ================================

export interface VerifyEmailResponse {
  message: string;
}

export interface VerifyPhoneRequest {
  code: string;        // 6 dígitos
  identifier: string;  // email o teléfono del usuario
}

export interface ResendVerificationRequest {
  email: string;
  type: 'EMAIL' | 'SMS';
}

// ================================
// REFRESH TOKEN & LOGOUT
// ================================

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  token: string;
  type: 'Bearer';
  refreshToken: string;
  expiresIn: number;
}

export interface LogoutRequest {
  refreshToken: string;  // para invalidar el refresh token en el backend
}

// ================================
// DEVICE TOKENS (FCM)
// ================================

export interface RegisterDeviceTokenRequest {
  fcmToken: string;
}

// ================================
// RESPUESTAS GENÉRICAS
// ================================

export interface MessageResponse {
  message: string;
}