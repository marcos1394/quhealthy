export interface RegisterProviderRequest {
  name: string;        // Java: String name
  email: string;       // Java: String email
  phone: string;       // Java: String phone
  password: string;    // Java: String password
  serviceType: string; // Java: String serviceType
  acceptTerms: boolean; // Java: boolean acceptTerms
  referralCode?: string; // Java: String referralCode (Opcional)
}

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