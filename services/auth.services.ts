import axiosInstance from '@/lib/axios';
import {
  // Requests
  RegisterProviderRequest,
  RegisterConsumerRequest,
  LoginRequest,
  SocialLoginRequest,
  VerifyPhoneRequest,
  ResendVerificationRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  // Responses
  AuthResponse,
  ProviderRegistrationResponse,
  ConsumerRegistrationResponse,
  MessageResponse
} from '@/types/auth';

const BASE_AUTH = '/api/auth';
const BASE_REGISTER = '/api/auth/register';

export const authService = {

  // =================================================================
  // 📝 1. REGISTRO
  // =================================================================

  registerProvider: async (data: RegisterProviderRequest): Promise<ProviderRegistrationResponse> => {
    const response = await axiosInstance.post<ProviderRegistrationResponse>(
      `${BASE_REGISTER}/provider`,
      data
    );
    return response.data;
  },

  registerConsumer: async (data: RegisterConsumerRequest): Promise<ConsumerRegistrationResponse> => {
    const response = await axiosInstance.post<ConsumerRegistrationResponse>(
      `${BASE_REGISTER}/consumer`,
      data
    );
    return response.data;
  },

  // =================================================================
  // 🔐 2. AUTENTICACIÓN
  // =================================================================

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>(
      `${BASE_AUTH}/login`,
      data
    );
    return response.data;
  },

  googleLogin: async (data: SocialLoginRequest): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>(
      `${BASE_AUTH}/social/google`,
      data
    );
    return response.data;
  },

  // ✅ AGREGADO: Validar sesión al recargar página
  getSession: async (): Promise<AuthResponse> => {
    // Axios interceptor inyectará el token "Authorization: Bearer ..."
    const response = await axiosInstance.get<AuthResponse>(
      `${BASE_AUTH}/session`
    );
    return response.data;
  },

  logout: async (): Promise<void> => {
    // Limpieza local
    if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
    }
  },

  // =================================================================
  // ✅ 3. VERIFICACIÓN DE IDENTIDAD
  // =================================================================

  // 🔄 MODIFICADO: Usamos GET para token de email (más estándar para links)
  verifyEmail: async (token: string): Promise<MessageResponse> => {
    const response = await axiosInstance.get<MessageResponse>(
      `${BASE_AUTH}/verify-email`,
      { params: { token } } // Esto genera: /api/auth/verify-email?token=xyz
    );
    return response.data;
  },

  verifyPhone: async (data: VerifyPhoneRequest): Promise<MessageResponse> => {
    const response = await axiosInstance.post<MessageResponse>(
      `${BASE_AUTH}/verify-phone`,
      data
    );
    return response.data;
  },

  resendVerification: async (data: ResendVerificationRequest): Promise<MessageResponse> => {
    const response = await axiosInstance.post<MessageResponse>(
      `${BASE_AUTH}/resend-verification`,
      data
    );
    return response.data;
  },

  // =================================================================
  // 🔄 4. RECUPERACIÓN DE CONTRASEÑA
  // =================================================================

  forgotPassword: async (data: ForgotPasswordRequest): Promise<MessageResponse> => {
    const response = await axiosInstance.post<MessageResponse>(
      `${BASE_AUTH}/forgot-password`,
      data
    );
    return response.data;
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<MessageResponse> => {
    const response = await axiosInstance.post<MessageResponse>(
      `${BASE_AUTH}/reset-password`,
      data
    );
    return response.data;
  }
};