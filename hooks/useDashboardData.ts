// hooks/useDashboardData.ts

import { useState, useEffect, useCallback } from 'react';
import { dashboardService } from '@/services/dashboard.service';
import { ProviderDashboardResponse } from '@/types/dashboard';
import { analyticsService } from '@/services/analytics.service';
import { useSessionStore } from '@/stores/SessionStore';

export const useDashboardData = (dateRange: string = 'this_month') => {
  const [data, setData] = useState<ProviderDashboardResponse | null>(null);
  const [visitsData, setVisitsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useSessionStore();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // 🚀 Hacemos la llamada al backend. 
      const response = await dashboardService.getSummary();
      setData(response);

      // Obtener métricas de visitas a la tienda si el usuario es proveedor
      if (user?.id) {
        try {
          const visits = await analyticsService.getStoreVisitsMetrics(user.id);
          setVisitsData(visits);
        } catch (visitErr) {
          console.warn("⚠️ No se pudieron cargar las métricas de visitas a la tienda", visitErr);
        }
      }
    } catch (err: any) {
      console.error("❌ Error cargando el dashboard:", err);
      const errorMessage = err.response?.data?.message || "Ocurrió un error al sincronizar la información.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [dateRange, user?.id]); 

  // Ejecutar al montar el componente
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { 
    data,
    visitsData, 
    isLoading, 
    error, 
    refetch: fetchData 
  };
};