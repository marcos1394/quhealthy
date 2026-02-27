// hooks/useDashboardData.ts

import { useState, useEffect, useCallback } from 'react';
import { dashboardService } from '@/services/dashboard.service';
import { ProviderDashboardResponse } from '@/types/dashboard';

export const useDashboardData = (dateRange: string = 'this_month') => {
  const [data, setData] = useState<ProviderDashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // 🚀 Hacemos la llamada al backend. 
      // Nota: Por ahora el backend calcula automáticamente el "mes actual" 
      // usando la zona horaria del doctor. Si luego le añades filtros por fecha
      // al backend, aquí le pasarías el parámetro `dateRange`.
      const response = await dashboardService.getSummary();
      setData(response);
    } catch (err: any) {
      console.error("❌ Error cargando el dashboard:", err);
      // Extraemos el mensaje de error de forma segura
      const errorMessage = err.response?.data?.message || "Ocurrió un error al sincronizar la información.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [dateRange]); // Se re-ejecuta si el usuario cambia el filtro en la UI

  // Ejecutar al montar el componente
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { 
    data, 
    isLoading, 
    error, 
    refetch: fetchData // 🔄 Exportamos refetch para el botón de "Reintentar"
  };
};