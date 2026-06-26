import { useState, useCallback } from 'react';
import { socialService } from '@/services/social.service';

export interface GoogleBusinessProfile {
  name: string;
  title: string;
  description: string;
  phone: string;
  websiteUrl: string;
}

export const useGoogleBusinessProfile = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<GoogleBusinessProfile | null>(null);

  const handleError = useCallback((err: any) => {
    const msg =
      err.response?.data?.message ||
      err.response?.data?.error ||
      err.message ||
      'Ocurrió un error inesperado al conectar con Google Business';
    setError(msg);
    throw new Error(msg);
  }, []);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await socialService.getGoogleBusinessProfile();
      setProfile(data);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const updateDescription = useCallback(async (description: string) => {
    setLoading(true);
    setError(null);
    try {
      await socialService.updateGoogleBusinessProfile(description);
      // Actualizamos localmente tras la respuesta exitosa
      setProfile((prev) => (prev ? { ...prev, description } : prev));
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  return {
    profile,
    loading,
    error,
    loadProfile,
    updateDescription,
  };
};
