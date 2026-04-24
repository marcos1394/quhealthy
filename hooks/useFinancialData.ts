// hooks/useFinancialData.ts
import { useState, useEffect, useCallback } from 'react';
import { dashboardService } from '@/services/dashboard.service';

export const useFinancialData = (months: number = 6) => {
  const [data, setData] = useState<{ name: string, revenue: number }[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await dashboardService.getFinancialTimeseries(months);
      setData(response);
    } catch (err: any) {
      console.error("❌ Error cargando la serie de tiempo financiera:", err);
      setError(err.response?.data?.message || "Error al cargar datos financieros.");
    } finally {
      setIsLoading(false);
    }
  }, [months]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
};
