// ================================
// ENUMS & TYPES
// ================================
export type UserRole = 'CONSUMER' | 'PROVIDER' | 'ADMIN';
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
  referralCode?: string;
  utmSource?: string;
  utmMedium?: string;
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
  role?: 'CONSUMER' | 'PROVIDER' | 'ADMIN';
  planStatus?: string;
  trialExpiresAt?: string;
}

export interface AuthStatus {
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
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
}

export interface SocialLoginRequest {
  token: string;      // id_token de Google o Apple
  provider: 'GOOGLE' | 'APPLE';
  role: 'CONSUMER' | 'PROVIDER';  // ADMIN nunca desde este flujo
}

// ================================
// RECUPERACIÓN DE CONTRASEÑA (FORGOT PASSWORD)
// ================================

export interface ForgotPasswordRequest {
  contact: string;            // email o número de teléfono
  method: 'EMAIL' | 'SMS';
}

export interface VerifyRecoveryCodeRequest {
  contact: string;
  code: string;               // 6 dígitos
}

export interface RecoveryResetPasswordRequest {
  contact: string;
  code: string;               // mismo PIN verificado
  newPassword: string;
}

// ================================
// RESET PASSWORD (VÍA LINK)
// ================================

export interface ValidateResetTokenRequest {
  token: string;              // viene del query param de la URL
}

export interface ConfirmResetPasswordRequest {
  token: string;
  newPassword: string;
}

// ================================
// VERIFICACIÓN DE IDENTIDAD (EMAIL & PHONE)
// ================================

// Verify Email: GET con query param, no necesita interface de request
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