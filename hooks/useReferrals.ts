import { useState, useCallback, useEffect } from 'react';
import { referralService } from '@/services/referral.service';
import { ReferralDashboardResponse } from '@/types/referral';
import { toast } from 'react-toastify';
import { useTranslations } from 'next-intl';

export function useReferrals() {
  const t = useTranslations('DashboardReferrals');
  
  const [data, setData] = useState<ReferralDashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchReferralData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 🚀 Llamamos al servicio limpio
      const result = await referralService.getDashboard();
      setData(result);
    } catch (err: any) {
      console.error("❌ Error cargando el dashboard de referidos:", err);
      setError(err);
      
      // Notificación centralizada (toast) manejada directamente en el hook
      toast.error(t('error_loading', { defaultValue: 'No se pudo cargar la información de referidos.' }));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  // Autocarga de los datos cuando el componente que usa el hook se monta
  useEffect(() => {
    fetchReferralData();
  }, [fetchReferralData]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchReferralData // Exponemos refetch por si necesitas recargar los datos con un botón
  };
}
