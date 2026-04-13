// Ubicación: src/services/auth.services.ts

import axiosInstance from '@/lib/axios';

import {
  RegisterProviderRequest,
  RegisterConsumerRequest,
  ConsumerRegistrationResponse,
  ProviderRegistrationResponse,
  LoginRequest,
  SocialLoginRequest,
  AuthResponse,
  VerifyPhoneRequest,
  ResendVerificationRequest,
  ForgotPasswordRequest,
  VerifyRecoveryCodeRequest,
  RecoveryResetPasswordRequest,
  ValidateResetTokenRequest,
  // ConfirmResetPasswordRequest eliminado
  RefreshTokenRequest,
  RefreshTokenResponse,
  LogoutRequest,
  RegisterDeviceTokenRequest,
  MessageResponse,
} from '@/types/auth';

const BASE_AUTH = '/api/auth';
const BASE_REGISTER = '/api/auth/register';

export const authService = {

  // =================================================================
  // 📝 1. REGISTRO
  // =================================================================

  registerConsumer: async (data: RegisterConsumerRequest): Promise<ConsumerRegistrationResponse> => {
    const response = await axiosInstance.post<ConsumerRegistrationResponse>(
      `${BASE_REGISTER}/consumer`,
      data
    );
    return response.data;
  },

  registerProvider: async (data: RegisterProviderRequest): Promise<ProviderRegistrationResponse> => {
    const response = await axiosInstance.post<ProviderRegistrationResponse>(
      `${BASE_REGISTER}/provider`,
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
      data,
      { withCredentials: true } 
    );
    return response.data;
  },

 /**
   * 🚀 FIX FF-002: Enrutamiento dinámico para Google y Apple
   */
  socialLogin: async (data: SocialLoginRequest): Promise<AuthResponse> => {
    // 1. Determinamos el endpoint según el provider que venga de la UI
    const endpoint = data.provider === 'APPLE' 
      ? `${BASE_AUTH}/social/apple` 
      : `${BASE_AUTH}/social/google`;

    const response = await axiosInstance.post<AuthResponse>(
      endpoint,
      {
        token: data.token,
        role: data.role,
        // Nota: data.provider no se envía en el body porque la ruta ya lo define, 
        // a menos que tu backend explícitamente pida el campo 'provider' en el JSON.
      },
      { withCredentials: true } 
    );
    return response.data;
  },

  // =================================================================
  // 🛡 3. SESIÓN Y REFRESH
  // =================================================================

  validateSession: async (): Promise<AuthResponse> => {
    const response = await axiosInstance.get<AuthResponse>(
      `${BASE_AUTH}/session`,
      { withCredentials: true } 
    );
    return response.data;
  },

  refreshToken: async (data: RefreshTokenRequest): Promise<RefreshTokenResponse> => {
    const response = await axiosInstance.post<RefreshTokenResponse>(
      `${BASE_AUTH}/refresh-token`,
      data,
      { withCredentials: true } 
    );
    return response.data;
  },

  logout: async (data: LogoutRequest): Promise<MessageResponse> => {
    const response = await axiosInstance.post<MessageResponse>(
      `${BASE_AUTH}/logout`,
      data,
      { withCredentials: true } 
    );
    return response.data;
  },

  // =================================================================
  // 📱 4. DEVICE TOKENS (FCM)
  // =================================================================

  registerDeviceToken: async (data: RegisterDeviceTokenRequest): Promise<MessageResponse> => {
    const response = await axiosInstance.put<MessageResponse>(
      `${BASE_AUTH}/device-token`,
      data
    );
    return response.data;
  },

  // =================================================================
  // ✅ 5. VERIFICACIÓN DE IDENTIDAD
  // =================================================================

  verifyEmailByLink: async (token: string): Promise<MessageResponse> => {
    const response = await axiosInstance.get<MessageResponse>(
      `${BASE_AUTH}/verify-email?token=${token}`
    );
    return response.data;
  },

  verifyPhone: async (data: VerifyPhoneRequest): Promise<MessageResponse> => {
    const response = await axiosInstance.post<MessageResponse>(
      `${BASE_AUTH}/verify-phone`,
      {
        code: data.code,
        identifier: data.identifier,
      }
    );
    return response.data;
  },

  resendVerification: async (data: ResendVerificationRequest): Promise<MessageResponse> => {
    const response = await axiosInstance.post<MessageResponse>(
      `${BASE_AUTH}/resend-verification`,
      {
        email: data.email,
        type: data.type,
      }
    );
    return response.data;
  },

  // =================================================================
  // 🔄 6. RECUPERACIÓN DE CONTRASEÑA (Flujo Unificado: OTP / Link)
  // =================================================================

  sendRecoveryCode: async (data: ForgotPasswordRequest): Promise<MessageResponse> => {
    try {
      // 🚀 Endpoint y Payload alineados al backend
      const response = await axiosInstance.post<MessageResponse>(
        `${BASE_AUTH}/forgot-password`, 
        { 
          email: data.email, 
          deliveryMethod: data.deliveryMethod 
        }
      );
      return response.data;
    } catch (error: any) {
      // 🛡️ Manejo del Rate Limiting
      if (error.response?.status === 429) {
        throw new Error('Has superado el límite de intentos (3 por hora). Por favor, intenta más tarde.');
      }
      throw error;
    }
  },

  verifyRecoveryCode: async (data: VerifyRecoveryCodeRequest): Promise<MessageResponse> => {
    try {
      const response = await axiosInstance.post<MessageResponse>(
        `${BASE_AUTH}/recovery/verify-code`,
        {
          email: data.email,
          code: data.code,
        }
      );
      return response.data;
    } catch (error: any) {
      // 🛡️ Manejo del Rate Limiting
      if (error.response?.status === 429) {
        throw new Error('Demasiados intentos fallidos. Intente más tarde.');
      }
      throw error;
    }
  },

  recoveryResetPassword: async (data: RecoveryResetPasswordRequest): Promise<MessageResponse> => {
    // 🚀 Endpoint unificado para establecer nueva contraseña
    const response = await axiosInstance.post<MessageResponse>(
      `${BASE_AUTH}/reset-password`,
      {
        token: data.token,
        newPassword: data.newPassword,
      }
    );
    return response.data;
  },

  // =================================================================
  // 🔗 7. RESET PASSWORD (VÍA LINK)
  // =================================================================

  validateResetToken: async (data: ValidateResetTokenRequest): Promise<MessageResponse> => {
    const response = await axiosInstance.post<MessageResponse>(
      `${BASE_AUTH}/reset-password/validate`,
      {
        token: data.token,
      }
    );
    return response.data;
  },

  // 🚀 confirmResetPassword eliminado (usamos recoveryResetPassword en su lugar)

};