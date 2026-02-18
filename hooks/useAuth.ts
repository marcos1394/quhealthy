import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.services';
import { useSessionStore } from '@/stores/SessionStore'; // Importamos para limpiar store al salir
import {
  // Tipos de Request
  RegisterProviderRequest,
  RegisterConsumerRequest,
  LoginRequest,
  ResendVerificationRequest,
  ResetPasswordRequest,
  // Tipos de Response
  AuthResponse,
  ProviderRegistrationResponse,
  ConsumerRegistrationResponse,
  MessageResponse,
  SocialLoginRequest // Usamos la interfaz correcta
} from '@/types/auth';

interface UseAuthReturn {
  loading: boolean;
  error: string | null;

  // Registro
  registerProvider: (data: RegisterProviderRequest) => Promise<ProviderRegistrationResponse>;
  registerConsumer: (data: RegisterConsumerRequest) => Promise<ConsumerRegistrationResponse>;

  // Autenticación
  login: (data: LoginRequest) => Promise<AuthResponse>;
  loginWithGoogle: (data: SocialLoginRequest) => Promise<AuthResponse>;
  checkSession: () => Promise<AuthResponse | null>;
  logout: () => void;

  // Verificación
  verifyEmail: (token: string) => Promise<MessageResponse>;
  verifyPhone: (data: any) => Promise<MessageResponse>; // Ajusta 'any' a VerifyPhoneRequest si lo importas
  resendVerification: (data: ResendVerificationRequest) => Promise<MessageResponse>;

  // Password
  forgotPassword: (data: any) => Promise<MessageResponse>;
  resetPassword: (data: ResetPasswordRequest) => Promise<MessageResponse>;
}

export const useAuth = (): UseAuthReturn => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Helper de errores (Mismo que tenías, está perfecto)
  const handleError = (err: any): never => {
    const msg = err.response?.data?.message || 
                err.response?.data?.error || 
                err.message || 
                'Ocurrió un error inesperado';
    setError(msg);
    // Lanzamos el error para que el componente (Formulario) también se entere si quiere
    throw new Error(msg);
  };

  // --- Registro ---
  const registerProvider = async (data: RegisterProviderRequest) => {
    setLoading(true); setError(null);
    try {
      return await authService.registerProvider(data);
    } catch (err) {
      return handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const registerConsumer = async (data: RegisterConsumerRequest) => {
    setLoading(true); setError(null);
    try {
      return await authService.registerConsumer(data);
    } catch (err) {
      return handleError(err);
    } finally {
      setLoading(false);
    }
  };

  // --- Autenticación ---

  const login = async (data: LoginRequest) => {
    setLoading(true); setError(null);
    try {
      // ✅ SIMPLIFICADO: authService ya actualiza el Store global.
      // No necesitamos guardar en localStorage manualmente aquí.
      const res = await authService.login(data);
      return res;
    } catch (err) {
      return handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (data: SocialLoginRequest) => {
    setLoading(true); setError(null);
    try {
      // ✅ SIMPLIFICADO
      const res = await authService.googleLogin(data);
      return res;
    } catch (err) {
      return handleError(err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ CORRECCIÓN DEL ERROR DE TIPOS
  const checkSession = async (): Promise<AuthResponse | null> => {
    setLoading(true);
    try {
      // authService.getSession() devuelve AuthResponse | null
      const res = await authService.getSession();
      
      // Si res es null, no pasa nada, el componente lo manejará.
      // El store ya se actualizó dentro del servicio.
      return res; 
    } catch (err) {
      // Si falló feo (ej: error de red), forzamos logout visual
      return null;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout(); // Limpia localStorage y Store
    router.push('/login'); // Redirige
  };

  // --- Verificación y Password ---
  // Estos métodos solo son "pasamanos" hacia el servicio, gestionando loading/error

  const verifyEmail = async (token: string) => {
    setLoading(true); setError(null);
    try {
      return await authService.verifyEmail(token);
    } catch (err) { return handleError(err); }
    finally { setLoading(false); }
  };

  const verifyPhone = async (data: any) => {
    setLoading(true); setError(null);
    try {
      return await authService.verifyPhone(data);
    } catch (err) { return handleError(err); }
    finally { setLoading(false); }
  };

  const resendVerification = async (data: ResendVerificationRequest) => {
    setLoading(true); setError(null);
    try {
      return await authService.resendVerification(data);
    } catch (err) { return handleError(err); }
    finally { setLoading(false); }
  };

  const forgotPassword = async (data: any) => {
    setLoading(true); setError(null);
    try {
      return await authService.forgotPassword(data);
    } catch (err) { return handleError(err); }
    finally { setLoading(false); }
  };

  const resetPassword = async (data: ResetPasswordRequest) => {
    setLoading(true); setError(null);
    try {
      return await authService.resetPassword(data);
    } catch (err) { return handleError(err); }
    finally { setLoading(false); }
  };

  return {
    loading,
    error,
    registerProvider,
    registerConsumer,
    login,
    loginWithGoogle,
    checkSession,
    logout,
    verifyEmail,
    verifyPhone,
    resendVerification,
    forgotPassword,
    resetPassword
  };
};