import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useSessionStore } from '@/stores/SessionStore';

export interface RecommendationConfigDto {
  discountAmount: number;
  isDiscountPercentage: boolean;
  commissionAmount: number;
  isCommissionPercentage: boolean;
  isActive: boolean;
}

export function useRecommendationConfig() {
  const [config, setConfig] = useState<RecommendationConfigDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const token = useSessionStore((state) => state.token) || '';

  const fetchConfig = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get<RecommendationConfigDto>(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/referrals/recommendations/config`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setConfig(response.data);
    } catch (error) {
      console.error('Error fetching recommendation config:', error);
      // We don't need to show an error toast here, it might just mean they haven't configured it yet.
      setConfig({
        discountAmount: 0,
        isDiscountPercentage: false,
        commissionAmount: 0,
        isCommissionPercentage: false,
        isActive: false
      });
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const saveConfig = async (newConfig: RecommendationConfigDto) => {
    setIsSaving(true);
    try {
      const response = await axios.post<RecommendationConfigDto>(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/referrals/recommendations/config`,
        newConfig,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setConfig(response.data);
      toast.success('Configuración guardada exitosamente');
      return true;
    } catch (error) {
      console.error('Error saving recommendation config:', error);
      toast.error('Ocurrió un error al guardar la configuración');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchConfig();
    } else {
      setIsLoading(false);
    }
  }, [fetchConfig, token]);

  return {
    config,
    isLoading,
    isSaving,
    saveConfig,
    refreshConfig: fetchConfig
  };
}
