import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.services'; // Asegúrate de la ruta correcta
import {
  // Tipos
  RegisterProviderRequest,
  RegisterConsumerRequest,
  LoginRequest,
  ResendVerificationRequest,
  ResetPasswordRequest,
  // Responses
  AuthResponse,
  ProviderRegistrationResponse,
  ConsumerRegistrationResponse,
  MessageResponse,
  UserRole
} from '@/types/auth';

// ✅ Interfaz actualizada
interface UseAuthReturn {
  loading: boolean;
  error: string | null;

  // Registro
  registerProvider: (data: RegisterProviderRequest) => Promise<ProviderRegistrationResponse>;
  registerConsumer: (data: RegisterConsumerRequest) => Promise<ConsumerRegistrationResponse>;

  // Autenticación
  login: (data: LoginRequest) => Promise<AuthResponse>;
  loginWithGoogle: (token: string, role: UserRole) => Promise<AuthResponse>;
  checkSession: () => Promise<AuthResponse | null>; // 👈 NUEVO
  logout: () => void;

  // Verificación
  verifyEmail: (token: string) => Promise<MessageResponse>;
  verifyPhone: (phone: string, code: string) => Promise<MessageResponse>;
  resendVerification: (data: ResendVerificationRequest) => Promise<MessageResponse>;

  // Password
  forgotPassword: (email: string) => Promise<MessageResponse>;
  resetPassword: (data: ResetPasswordRequest) => Promise<MessageResponse>;
}

export const useAuth = (): UseAuthReturn => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Helper de errores
  const handleError = (err: any): never => {
    const msg = err.response?.data?.message || err.message || 'Ocurrió un error inesperado';
    setError(msg);
    throw new Error(msg);
  };

  const handleLoginSuccess = (response: AuthResponse) => {
    if (response.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('refreshToken', response.refreshToken || '');
      localStorage.setItem('user', JSON.stringify({
        role: response.role,
        status: response.status
      }));
    }
  };

  // --- Registro ---
  const registerProvider = async (data: RegisterProviderRequest) => {
    setLoading(true); setError(null);
    try { return await authService.registerProvider(data); }
    catch (err) { return handleError(err); }
    finally { setLoading(false); }
  };

  const registerConsumer = async (data: RegisterConsumerRequest) => {
    setLoading(true); setError(null);
    try { return await authService.registerConsumer(data); }
    catch (err) { return handleError(err); }
    finally { setLoading(false); }
  };

  // --- Login ---
  const login = async (data: LoginRequest) => {
    setLoading(true); setError(null);
    try {
      const res = await authService.login(data);
      handleLoginSuccess(res);
      return res;
    } catch (err) { return handleError(err); }
    finally { setLoading(false); }
  };

  const loginWithGoogle = async (token: string, role: UserRole) => {
    setLoading(true); setError(null);
    try {
      const res = await authService.googleLogin({ token, role });
      handleLoginSuccess(res);
      return res;
    } catch (err) { return handleError(err); }
    finally { setLoading(false); }
  };

  // ✅ NUEVO: Validar Sesión
  const checkSession = async () => {
    // Si no hay token local, ni intentamos llamar al back
    const token = localStorage.getItem('token');
    if (!token) return null;

    setLoading(true);
    try {
      const res = await authService.getSession();
      // Si el back responde OK, actualizamos/confirmamos data local
      handleLoginSuccess(res); 
      return res;
    } catch (err) {
      // Si falla (401/403), limpiamos sesión
      logout();
      return null;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    router.push('/auth/login');
  };

  // --- Verificación ---
  const verifyEmail = async (token: string) => {
    setLoading(true); setError(null);
    try {
      // 🔄 Ahora llamamos directo con el string, el servicio se encarga del GET param
      return await authService.verifyEmail(token);
    } catch (err) { return handleError(err); }
    finally { setLoading(false); }
  };

  const verifyPhone = async (phone: string, code: string) => {
    setLoading(true); setError(null);
    try {
      return await authService.verifyPhone({ phone, code }); // Ajuste de nombre campo
    } catch (err) { return handleError(err); }
    finally { setLoading(false); }
  };

  const resendVerification = async (data: ResendVerificationRequest) => {
    setLoading(true); setError(null);
    try { return await authService.resendVerification(data); }
    catch (err) { return handleError(err); }
    finally { setLoading(false); }
  };

  // --- Password ---
  const forgotPassword = async (email: string) => {
    setLoading(true); setError(null);
    try { return await authService.forgotPassword({ email }); }
    catch (err) { return handleError(err); }
    finally { setLoading(false); }
  };

  const resetPassword = async (data: ResetPasswordRequest) => {
    setLoading(true); setError(null);
    try { return await authService.resetPassword(data); }
    catch (err) { return handleError(err); }
    finally { setLoading(false); }
  };

  return {
    loading,
    error,
    registerProvider,
    registerConsumer,
    login,
    loginWithGoogle,
    checkSession, // 👈 Exportamos
    logout,
    verifyEmail,
    verifyPhone,
    resendVerification,
    forgotPassword,
    resetPassword
  };
};