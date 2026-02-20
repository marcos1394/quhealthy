import { useState, useEffect, useCallback } from 'react';
import { DashboardData } from '@/types/dashboard';
import { toast } from 'react-toastify';

export const useDashboardData = (dateRange: string) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 🚧 TODO: Reemplazar con llamada real axiosInstance.get('/api/dashboard')
      // Simulamos la latencia de red
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Simulamos un usuario NUEVO
      setData({
        plan: {
          id: 'trial_basic',
          name: 'Plan Profesional (Prueba)',
          status: 'TRIAL',
          daysLeft: 14,
          renewalDate: '2026-03-05'
        },
        hasConfiguredStore: false, // 👈 Disparará el aviso en la UI
        verificationStatus: 'COMPLETED',
        analytics: {
          monthlyRevenue: 0,
          completedAppointments: 0,
          newClients: 0
        },
        upcomingAppointments: [] // Sin citas aún
      });

    } catch (err: any) {
      console.error("Error cargando dashboard:", err);
      setError("No pudimos sincronizar tus métricas.");
      toast.error("Error al cargar el dashboard");
    } finally {
      setIsLoading(false);
    }
  }, [dateRange]); // Se recarga si cambian las fechas

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return { data, isLoading, error, refetch: fetchDashboard };
};