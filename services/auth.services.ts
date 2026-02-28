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
  ConfirmResetPasswordRequest,
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
      data
    );
    return response.data;
  },

  socialLogin: async (data: SocialLoginRequest): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>(
      `${BASE_AUTH}/social/google`,
      {
        token: data.token,
        role: data.role,
      }
    );
    return response.data;
  },

  // =================================================================
  // 🛡 3. SESIÓN Y REFRESH
  // =================================================================

  validateSession: async (): Promise<AuthResponse> => {
    const response = await axiosInstance.get<AuthResponse>(
      `${BASE_AUTH}/session`
    );
    return response.data;
  },

  refreshToken: async (data: RefreshTokenRequest): Promise<RefreshTokenResponse> => {
    const response = await axiosInstance.post<RefreshTokenResponse>(
      `${BASE_AUTH}/refresh-token`,
      data
    );
    return response.data;
  },

  logout: async (data: LogoutRequest): Promise<MessageResponse> => {
    const response = await axiosInstance.post<MessageResponse>(
      `${BASE_AUTH}/logout`,
      data
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
  // 🔄 6. RECUPERACIÓN DE CONTRASEÑA (OTP MULTI-STEP)
  // =================================================================

  sendRecoveryCode: async (data: ForgotPasswordRequest): Promise<MessageResponse> => {
    const endpoint = data.method === 'EMAIL'
      ? `${BASE_AUTH}/recovery/send-email`
      : `${BASE_AUTH}/recovery/send-sms`;
    const response = await axiosInstance.post<MessageResponse>(endpoint, { contact: data.contact });
    return response.data;
  },

  verifyRecoveryCode: async (data: VerifyRecoveryCodeRequest): Promise<MessageResponse> => {
    const response = await axiosInstance.post<MessageResponse>(
      `${BASE_AUTH}/recovery/verify-code`,
      {
        contact: data.contact,
        code: data.code,
      }
    );
    return response.data;
  },

  recoveryResetPassword: async (data: RecoveryResetPasswordRequest): Promise<MessageResponse> => {
    const response = await axiosInstance.post<MessageResponse>(
      `${BASE_AUTH}/recovery/reset-password`,
      {
        contact: data.contact,
        code: data.code,
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

  confirmResetPassword: async (data: ConfirmResetPasswordRequest): Promise<MessageResponse> => {
    const response = await axiosInstance.post<MessageResponse>(
      `${BASE_AUTH}/reset-password/confirm`,
      {
        token: data.token,
        newPassword: data.newPassword,
      }
    );
    return response.data;
  },

};