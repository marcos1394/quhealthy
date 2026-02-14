import axiosInstance from '@/lib/axios';
import {
  // Requests
  RegisterProviderRequest,
  RegisterConsumerRequest,
  LoginRequest,
  SocialLoginRequest,
  VerifyEmailRequest,
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

// Rutas base del controlador Java
const BASE_AUTH = '/api/auth';
const BASE_REGISTER = '/api/auth/register';

export const authService = {

  // =================================================================
  // 📝 1. REGISTRO (ONBOARDING)
  // =================================================================

  /**
   * Registra un nuevo Profesional (Provider).
   * Retorna mensaje de éxito e ID, no loguea automáticamente.
   */
  registerProvider: async (data: RegisterProviderRequest): Promise<ProviderRegistrationResponse> => {
    const response = await axiosInstance.post<ProviderRegistrationResponse>(
      `${BASE_REGISTER}/provider`,
      data
    );
    return response.data;
  },

  /**
   * Registra un nuevo Paciente (Consumer).
   */
  registerConsumer: async (data: RegisterConsumerRequest): Promise<ConsumerRegistrationResponse> => {
    const response = await axiosInstance.post<ConsumerRegistrationResponse>(
      `${BASE_REGISTER}/consumer`,
      data
    );
    return response.data;
  },

  // =================================================================
  // 🔐 2. AUTENTICACIÓN (LOGIN)
  // =================================================================

  /**
   * Login tradicional con Email y Password.
   * Retorna el JWT y datos del usuario.
   */
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>(
      `${BASE_AUTH}/login`,
      data
    );
    return response.data;
  },

  /**
   * Login/Registro con Google (OAuth2).
   * Envía el token de Google y el rol deseado.
   */
  googleLogin: async (data: SocialLoginRequest): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>(
      `${BASE_AUTH}/social/google`,
      data
    );
    return response.data;
  },

  /**
   * Cierra sesión (Lado del cliente y opcionalmente notifica al server para invalidar refresh tokens)
   */
  logout: async (): Promise<void> => {
    // Si manejas lista negra de tokens en redis:
    // await axiosInstance.post(`${BASE_AUTH}/logout`);
    
    // Limpieza local
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  // =================================================================
  // ✅ 3. VERIFICACIÓN DE IDENTIDAD
  // =================================================================

  /**
   * Verifica el correo electrónico mediante token.
   */
  verifyEmail: async (data: VerifyEmailRequest): Promise<MessageResponse> => {
    const response = await axiosInstance.post<MessageResponse>(
      `${BASE_AUTH}/verify-email`,
      data
    );
    return response.data;
  },

  /**
   * Verifica el teléfono mediante código OTP (SMS).
   */
  verifyPhone: async (data: VerifyPhoneRequest): Promise<MessageResponse> => {
    const response = await axiosInstance.post<MessageResponse>(
      `${BASE_AUTH}/verify-phone`,
      data
    );
    return response.data;
  },

  /**
   * Reenvía el código de verificación o email de activación.
   */
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

  /**
   * Solicita un reset de contraseña (envía email con link).
   */
  forgotPassword: async (data: ForgotPasswordRequest): Promise<MessageResponse> => {
    const response = await axiosInstance.post<MessageResponse>(
      `${BASE_AUTH}/forgot-password`,
      data
    );
    return response.data;
  },

  /**
   * Establece la nueva contraseña usando los tokens de seguridad.
   */
  resetPassword: async (data: ResetPasswordRequest): Promise<MessageResponse> => {
    const response = await axiosInstance.post<MessageResponse>(
      `${BASE_AUTH}/reset-password`,
      data
    );
    return response.data;
  }
};