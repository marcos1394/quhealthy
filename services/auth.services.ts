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
  SendRecoveryCodeRequest,
  VerifyRecoveryCodeRequest,
  RecoveryResetPasswordRequest,
  ValidateResetTokenRequest,
  ConfirmResetPasswordRequest,
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

  // =================================================================
  // 🚨 AQUÍ ESTABA EL PROBLEMA (CORREGIDO)
  // =================================================================

  getSession: async (): Promise<AuthResponse | null> => {
    const store = useSessionStore.getState();
    const token = store.token;

    // 1. EL GUARDIA CORREGIDO
    if (!token) {
      // 🚨 AQUÍ ESTABA EL DETALLE:
      // Si no hay token, debemos apagar el loading manualmente.
      store.setLoading(false);
      return null;
    }

    try {
      const response = await axiosInstance.get<AuthResponse>(`${BASE_AUTH}/session`);
      store.setSession(response.data); // Esto ya pone isLoading: false internamente
      return response.data;
    } catch (error) {
      // Si falla, también apagamos el loading
      store.setLoading(false);
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
  },

  // =================================================================
  // ✅ 5. RECOVERY FLOW (forgot-password multi-step)
  // =================================================================

  sendRecoveryCode: async (data: SendRecoveryCodeRequest): Promise<MessageResponse> => {
    const endpoint = data.method === 'email'
      ? `${BASE_AUTH}/recovery/send-email`
      : `${BASE_AUTH}/recovery/send-sms`;
    const response = await axiosInstance.post<MessageResponse>(endpoint, { contact: data.contact });
    return response.data;
  },

  verifyRecoveryCode: async (data: VerifyRecoveryCodeRequest): Promise<MessageResponse> => {
    const response = await axiosInstance.post<MessageResponse>(
      `${BASE_AUTH}/recovery/verify-code`,
      data
    );
    return response.data;
  },

  recoveryResetPassword: async (data: RecoveryResetPasswordRequest): Promise<MessageResponse> => {
    const response = await axiosInstance.post<MessageResponse>(
      `${BASE_AUTH}/recovery/reset-password`,
      data
    );
    return response.data;
  },

  // =================================================================
  // ✅ 6. RESET PASSWORD (token-based from email link)
  // =================================================================

  validateResetToken: async (data: ValidateResetTokenRequest): Promise<MessageResponse> => {
    const response = await axiosInstance.post<MessageResponse>(
      `${BASE_AUTH}/reset-password/validate`,
      data
    );
    return response.data;
  },

  confirmResetPassword: async (data: ConfirmResetPasswordRequest): Promise<MessageResponse> => {
    const response = await axiosInstance.post<MessageResponse>(
      `${BASE_AUTH}/reset-password/confirm`,
      data
    );
    return response.data;
  },

  // =================================================================
  // ✅ 7. RESEND PHONE CODE
  // =================================================================

  resendPhoneCode: async (): Promise<MessageResponse> => {
    const response = await axiosInstance.post<MessageResponse>(
      `${BASE_AUTH}/resend-phone-code`,
      {},
      { withCredentials: true }
    );
    return response.data;
  },

  // Verify phone with token (cookie-based auth)
  verifyPhoneWithToken: async (token: string): Promise<MessageResponse> => {
    const response = await axiosInstance.post<MessageResponse>(
      `${BASE_AUTH}/verify-phone`,
      { token },
      { withCredentials: true }
    );
    return response.data;
  }
};