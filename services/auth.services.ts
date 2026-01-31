import axiosInstance from '@/lib/axios';
import { RegisterProviderRequest, AuthResponse, SocialLoginRequest } from '@/types/auth';

const BASE_PATH = '/api/auth'; // Tu Balanceador lo ruteará al auth-service

export const authService = {
  /**
   * Registra un Doctor/Especialista
   * Endpoint Real: POST https://api.quhealthy.org/api/auth/provider/register
   */
  registerProvider: async (data: RegisterProviderRequest): Promise<AuthResponse> => {
    // 🎯 Corrección clave: usamos '/provider/register' que es lo que espera tu Java
    const response = await axiosInstance.post<AuthResponse>(`${BASE_PATH}/provider/register`, data);
    return response.data;
  },

  googleLogin: async (data: SocialLoginRequest): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>(`${BASE_PATH}/social/google`, data);
    return response.data;
  },

  // ... (Aquí irían login, registerConsumer, etc.)
};