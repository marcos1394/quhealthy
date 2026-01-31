import { useState } from 'react';
import { authService } from '@/services/auth.services';
import { RegisterProviderRequest, AuthResponse } from '@/types/auth';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
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

  return { registerProvider, loading, error };
};