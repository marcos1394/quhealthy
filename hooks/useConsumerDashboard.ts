// src/hooks/dashboard/useConsumerDashboard.ts
import { useState, useEffect } from 'react';
import { appointmentService } from '@/services/appointment.service';
import { Appointment } from '@/types/appointments'; // 🚀 Asegúrate de usar la ruta correcta a tu archivo de tipos

export const useConsumerDashboard = (profileId?: number) => {
  const [data, setData] = useState<{
    nextAppointment: Appointment | null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    healthMetrics: any[];
    pendingPrescriptionsCount: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recentActivity: any[]; 
  }>({
    nextAppointment: null,
    healthMetrics: [],
    pendingPrescriptionsCount: 0,
    recentActivity: [],
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Obtenemos el resumen del dashboard (métricas + próxima cita)
        const summary = await appointmentService.getConsumerDashboardSummary(profileId);
        
        setData({
          nextAppointment: summary.upcomingAppointment || null,
          healthMetrics: summary.healthMetrics || [],
          pendingPrescriptionsCount: summary.pendingPrescriptionsCount || 0,
          recentActivity: [], // Puedes llenar esto con citas recientes si lo deseas
        });
      } catch (err: unknown) {
        console.error('Error fetching consumer dashboard summary:', err);
        setError('No se pudo cargar la información del dashboard.');
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, [profileId]);

  return {
    nextAppointment: data.nextAppointment,
    healthMetrics: data.healthMetrics,
    pendingPrescriptionsCount: data.pendingPrescriptionsCount,
    recentActivity: data.recentActivity,
    isLoading,
    error,
  };
};