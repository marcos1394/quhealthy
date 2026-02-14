import { useState } from 'react';
import { useRouter } from 'next/navigation'; // O 'next/router' si usas Pages Router
import { authService } from '@/services/auth.services';
import {
  // Tipos de Request
  RegisterProviderRequest,
  RegisterConsumerRequest,
  LoginRequest,
  VerifyEmailRequest,
  VerifyPhoneRequest,
  ResendVerificationRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  // Tipos de Response
  AuthResponse,
  ProviderRegistrationResponse,
  ConsumerRegistrationResponse,
  MessageResponse,
  // Enums
  UserRole
} from '@/types/auth';

// ✅ DEFINIMOS EL CONTRATO DE RETORNO (Interfaz Completa)
interface UseAuthReturn {
  // Estado
  loading: boolean;
  error: string | null;

  // Registro
  registerProvider: (data: RegisterProviderRequest) => Promise<ProviderRegistrationResponse>;
  registerConsumer: (data: RegisterConsumerRequest) => Promise<ConsumerRegistrationResponse>;

  // Autenticación
  login: (data: LoginRequest) => Promise<AuthResponse>;
  loginWithGoogle: (token: string, role: UserRole) => Promise<AuthResponse>;
  logout: () => void;

  // Verificación
  verifyEmail: (token: string) => Promise<MessageResponse>;
  verifyPhone: (phone: string, code: string) => Promise<MessageResponse>;
  resendVerification: (data: ResendVerificationRequest) => Promise<MessageResponse>;

  // Recuperación de Password
  forgotPassword: (email: string) => Promise<MessageResponse>;
  resetPassword: (data: ResetPasswordRequest) => Promise<MessageResponse>;
}

export const useAuth = (): UseAuthReturn => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // 🛠️ Helper para manejar errores de forma uniforme
  const handleError = (err: any): never => {
    const msg = err.response?.data?.message || err.message || 'Ocurrió un error inesperado';
    setError(msg);
    throw new Error(msg); // Re-lanzamos para que el componente (UI) pueda mostrar el toast
  };

  // =================================================================
  // 📝 1. REGISTRO
  // =================================================================

  const registerProvider = async (data: RegisterProviderRequest): Promise<ProviderRegistrationResponse> => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.registerProvider(data);
      return response;
    } catch (err) {
      return handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const registerConsumer = async (data: RegisterConsumerRequest): Promise<ConsumerRegistrationResponse> => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.registerConsumer(data);
      return response;
    } catch (err) {
      return handleError(err);
    } finally {
      setLoading(false);
    }
  };

  // =================================================================
  // 🔐 2. LOGIN (Guarda Token)
  // =================================================================

  const handleLoginSuccess = (response: AuthResponse) => {
    if (response.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('refreshToken', response.refreshToken);
      // Opcional: Guardar info básica del usuario
      localStorage.setItem('user', JSON.stringify({
        id: response.id,
        email: response.email,
        roles: response.roles
      }));
    }
  };

  const login = async (data: LoginRequest): Promise<AuthResponse> => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.login(data);
      handleLoginSuccess(response);
      return response;
    } catch (err) {
      return handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (token: string, role: UserRole): Promise<AuthResponse> => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.googleLogin({ token, role });
      handleLoginSuccess(response);
      return response;
    } catch (err) {
      return handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    router.push('/login'); // Redirigir al login
  };

  // =================================================================
  // ✅ 3. VERIFICACIÓN
  // =================================================================

  const verifyEmail = async (token: string): Promise<MessageResponse> => {
    setLoading(true);
    try {
      return await authService.verifyEmail({ token });
    } catch (err) {
      return handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const verifyPhone = async (phone: string, code: string): Promise<MessageResponse> => {
    setLoading(true);
    try {
      return await authService.verifyPhone({ phone, code });
    } catch (err) {
      return handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const resendVerification = async (data: ResendVerificationRequest): Promise<MessageResponse> => {
    setLoading(true);
    try {
      return await authService.resendVerification(data);
    } catch (err) {
      return handleError(err);
    } finally {
      setLoading(false);
    }
  };

  // =================================================================
  // 🔄 4. PASSWORD RESET
  // =================================================================

  const forgotPassword = async (email: string): Promise<MessageResponse> => {
    setLoading(true);
    try {
      return await authService.forgotPassword({ email });
    } catch (err) {
      return handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (data: ResetPasswordRequest): Promise<MessageResponse> => {
    setLoading(true);
    try {
      return await authService.resetPassword(data);
    } catch (err) {
      return handleError(err);
    } finally {
      setLoading(false);
    }
  };

  // Retornamos todas las funciones y el estado
  return {
    loading,
    error,
    registerProvider,
    registerConsumer,
    login,
    loginWithGoogle,
    logout,
    verifyEmail,
    verifyPhone,
    resendVerification,
    forgotPassword,
    resetPassword
  };
};