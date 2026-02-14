import axiosInstance from '@/lib/axios';
import {
  RegisterProviderRequest,
  RegisterConsumerRequest,
  AuthResponse,
  SocialLoginRequest
} from '@/types/auth';

const BASE_AUTH = '/api/auth';
const BASE_REGISTER = '/api/auth/register';

export const authService = {

  // =========================
  // REGISTRO
  // =========================

  registerProvider: async (data: RegisterProviderRequest): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>(
      `${BASE_REGISTER}/provider`,
      data
    );
    return response.data;
  },

  registerConsumer: async (data: RegisterConsumerRequest): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>(
      `${BASE_REGISTER}/consumer`,
      data
    );
    return response.data;
  },

  // =========================
  // LOGIN
  // =========================

  login: async (data: { email: string; password: string }): Promise<AuthResponse> => {
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

  // =========================
  // VERIFICACIÓN
  // =========================

  verifyEmail: async (data: { token: string }) => {
    return axiosInstance.post(`${BASE_AUTH}/verify-email`, data);
  },

  verifyPhone: async (data: { phone: string; code: string }) => {
    return axiosInstance.post(`${BASE_AUTH}/verify-phone`, data);
  },

  resendVerification: async (data: { email?: string; phone?: string }) => {
    return axiosInstance.post(`${BASE_AUTH}/resend-verification`, data);
  },

  // =========================
  // PASSWORD RESET
  // =========================

  forgotPassword: async (data: { email: string }) => {
    return axiosInstance.post(`${BASE_AUTH}/forgot-password`, data);
  },

  resetPassword: async (data: {
    selector: string;
    verifier: string;
    newPassword: string;
  }) => {
    return axiosInstance.post(`${BASE_AUTH}/reset-password`, data);
  }
};
