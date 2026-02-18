import axiosInstance from '@/lib/axios';
import { useSessionStore } from '@/stores/SessionStore'; // ✅ Importamos el Store
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
    
    // ✅ ACTUALIZAMOS EL STORE GLOBAL AUTOMÁTICAMENTE
    useSessionStore.getState().setSession(response.data);
    
    return response.data;
  },

  googleLogin: async (data: SocialLoginRequest): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>(
      `${BASE_AUTH}/social/google`,
      data
    );
    
    // ✅ ACTUALIZAMOS EL STORE GLOBAL AUTOMÁTICAMENTE
    useSessionStore.getState().setSession(response.data);
    
    return response.data;
  },

  // ✅ Validar sesión al recargar página (F5)
  getSession: async (): Promise<AuthResponse | null> => {
    try {
      // Axios interceptor inyectará el token automáticamente desde el Store
      const response = await axiosInstance.get<AuthResponse>(
        `${BASE_AUTH}/session`
      );
      
      // ✅ REFRESCA LOS DATOS EN EL STORE
      useSessionStore.getState().setSession(response.data);
      
      return response.data;
    } catch (error) {
      // Si falla (401), el interceptor ya limpió la sesión.
      return null;
    }
  },

  logout: async (): Promise<void> => {
    // 1. Limpiamos el Store Global
    useSessionStore.getState().clearSession();
    
    // 2. (Opcional) Llamada al backend si implementas lista negra de tokens
    // await axiosInstance.post(`${BASE_AUTH}/logout`);
  },

  // =================================================================
  // ✅ 3. VERIFICACIÓN DE IDENTIDAD
  // =================================================================

  verifyEmail: async (token: string): Promise<MessageResponse> => {
    const response = await axiosInstance.get<MessageResponse>(
      `${BASE_AUTH}/verify-email`,
      { params: { token } }
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