import { useState } from 'react';
import { authService } from '@/services/auth.services';
import { RegisterProviderRequest, AuthResponse } from '@/types/auth';
import { UserRole } from '@/types/subscriptions';

// ✅ DEFINIMOS EL CONTRATO DE RETORNO
interface UseAuthReturn {
  registerProvider: (data: RegisterProviderRequest) => Promise<AuthResponse>;
  loginWithGoogle: (token: string, role: UserRole) => Promise<AuthResponse>;
  loading: boolean;
  error: string | null;
}

export const useAuth = (): UseAuthReturn => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const registerProvider = async (data: RegisterProviderRequest): Promise<AuthResponse> => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.registerProvider(data);
      return response;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al registrar';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (token: string, role: UserRole): Promise<AuthResponse> => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.googleLogin({ token, role });
      
      if (response.token) {
        localStorage.setItem('token', response.token);
      }
      return response;
    } catch (err: any) {
      const msg = err.message || 'Error al iniciar sesión con Google';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Al retornar, TypeScript valida que cumplimos la interfaz UseAuthReturn
  return { registerProvider, loginWithGoogle, loading, error };
};