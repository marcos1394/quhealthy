// hooks/useRetentionData.ts
import { useState, useEffect, useCallback } from 'react';
import { dashboardService } from '@/services/dashboard.service';

export interface RetentionData {
  retentionRate: number;
  previousRetentionRate: number;
  retentionRateGrowth: number;
  avgVisitsPerPatient: number;
  churnRiskCount: number;
}

export const useRetentionData = () => {
  const [data, setData] = useState<RetentionData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await dashboardService.getRetentionMetrics();
      setData(response);
    } catch (err: any) {
      console.error("❌ Error cargando métricas de retención:", err);
      setError(err.response?.data?.message || "Error al cargar datos de retención.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
};
