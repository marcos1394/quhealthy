import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.services';
import { useSessionStore } from '@/stores/SessionStore';
import {
  RegisterProviderRequest,
  RegisterConsumerRequest,
  LoginRequest,
  SocialLoginRequest,
  VerifyPhoneRequest,
  ResendVerificationRequest,
  ForgotPasswordRequest,
  VerifyRecoveryCodeRequest,
  RecoveryResetPasswordRequest,
  ValidateResetTokenRequest,
  ConfirmResetPasswordRequest,
  AuthResponse,
  ProviderRegistrationResponse,
  ConsumerRegistrationResponse,
  MessageResponse,
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
  verifyPhone: (data: VerifyPhoneRequest) => Promise<MessageResponse>;
  resendVerification: (data: ResendVerificationRequest) => Promise<MessageResponse>;

  // Recovery Flow (Multi-step)
  sendRecoveryCode: (data: ForgotPasswordRequest) => Promise<MessageResponse>;
  verifyRecoveryCode: (data: VerifyRecoveryCodeRequest) => Promise<MessageResponse>;
  recoveryResetPassword: (data: RecoveryResetPasswordRequest) => Promise<MessageResponse>;

  // Reset Password (token-based)
  validateResetToken: (data: ValidateResetTokenRequest) => Promise<MessageResponse>;
  confirmResetPassword: (data: ConfirmResetPasswordRequest) => Promise<MessageResponse>;
}

export const useAuth = (): UseAuthReturn => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleError = (err: any): never => {
    const msg = err.response?.data?.message ||
      err.response?.data?.error ||
      err.message ||
      'Ocurrió un error inesperado';
    setError(msg);
    throw new Error(msg);
  };

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

  const login = async (data: LoginRequest) => {
    setLoading(true); setError(null);
    try { return await authService.login(data); }
    catch (err) { return handleError(err); }
    finally { setLoading(false); }
  };

  const loginWithGoogle = async (data: SocialLoginRequest) => {
    setLoading(true); setError(null);
    // authService.socialLogin lo maneja de forma simplificada
    try { return await authService.socialLogin(data); }
    catch (err) { return handleError(err); }
    finally { setLoading(false); }
  };

  const checkSession = async (): Promise<AuthResponse | null> => {
    setLoading(true);
    try {
      const res = await authService.validateSession();
      return res;
    } catch (err) {
      return null;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout({ refreshToken: '' }).catch(() => { }); // Opcional
    useSessionStore.getState().clearSession();
    router.push('/login');
  };

  const verifyEmail = async (token: string) => {
    setLoading(true); setError(null);
    try { return await authService.verifyEmailByLink(token); }
    catch (err) { return handleError(err); }
    finally { setLoading(false); }
  };

  const verifyPhone = async (data: VerifyPhoneRequest) => {
    setLoading(true); setError(null);
    try { return await authService.verifyPhone(data); }
    catch (err) { return handleError(err); }
    finally { setLoading(false); }
  };

  const resendVerification = async (data: ResendVerificationRequest) => {
    setLoading(true); setError(null);
    try { return await authService.resendVerification(data); }
    catch (err) { return handleError(err); }
    finally { setLoading(false); }
  };

  const sendRecoveryCode = async (data: ForgotPasswordRequest) => {
    setLoading(true); setError(null);
    try { return await authService.sendRecoveryCode(data); }
    catch (err) { return handleError(err); }
    finally { setLoading(false); }
  };

  const verifyRecoveryCode = async (data: VerifyRecoveryCodeRequest) => {
    setLoading(true); setError(null);
    try { return await authService.verifyRecoveryCode(data); }
    catch (err) { return handleError(err); }
    finally { setLoading(false); }
  };

  const recoveryResetPassword = async (data: RecoveryResetPasswordRequest) => {
    setLoading(true); setError(null);
    try { return await authService.recoveryResetPassword(data); }
    catch (err) { return handleError(err); }
    finally { setLoading(false); }
  };

  const validateResetToken = async (data: ValidateResetTokenRequest) => {
    setLoading(true); setError(null);
    try { return await authService.validateResetToken(data); }
    catch (err) { return handleError(err); }
    finally { setLoading(false); }
  };

  const confirmResetPassword = async (data: ConfirmResetPasswordRequest) => {
    setLoading(true); setError(null);
    try { return await authService.confirmResetPassword(data); }
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
    checkSession,
    logout,
    verifyEmail,
    verifyPhone,
    resendVerification,
    sendRecoveryCode,
    verifyRecoveryCode,
    recoveryResetPassword,
    validateResetToken,
    confirmResetPassword
  };
};