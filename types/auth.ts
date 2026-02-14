// ================================
// REGISTRO
// ================================

export interface RegisterConsumerRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
  acceptTerms: boolean;
  referralCode?: string;
}

export interface RegisterProviderRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
  serviceType: string;
  acceptTerms: boolean;
  referralCode?: string;
}

// ================================
// LOGIN
// ================================

export interface LoginRequest {
  email: string;
  password: string;
}

// ================================
// RESPUESTAS
// ================================

export interface AuthResponse {
  message: string;
  token?: string | null;
  status?: {
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
    onboardingComplete: boolean;
    hasActivePlan: boolean;
  };
}

export interface ConsumerRegistrationResponse {
  message: string;
  consumerId: string;
}

export interface ProviderRegistrationResponse {
  message: string;
  providerId: string;
}

// ================================
// VERIFICACIÓN
// ================================

export interface VerifyEmailRequest {
  token: string;
}

export interface VerifyPhoneRequest {
  phone: string;
  code: string;
}

export interface ResendVerificationRequest {
  email?: string;
  phone?: string;
}

// ================================
// PASSWORD RESET
// ================================

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  selector: string;
  verifier: string;
  newPassword: string;
}

export interface MessageResponse {
  message: string;
}

// ================================
// LOGIN SOCIAL (si lo agregas)
// ================================

export interface SocialLoginRequest {
  token: string;
  role: 'PROVIDER' | 'CONSUMER';
}
