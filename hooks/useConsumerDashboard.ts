// src/hooks/dashboard/useConsumerDashboard.ts
import { useState, useEffect, useCallback } from 'react';
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

  const loadDashboard = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const summary = await appointmentService.getConsumerDashboardSummary(profileId);

      const nextAppt = summary.upcomingAppointment ? {
        id: summary.upcomingAppointment.id,
        startTime: summary.upcomingAppointment.time,
        providerNameSnapshot: summary.upcomingAppointment.providerName,
        serviceNameSnapshot: summary.upcomingAppointment.type,
        provider: {
          specialty: summary.upcomingAppointment.specialty,
          image: undefined,
        }
      } as Appointment : null;

      setData({
        nextAppointment: nextAppt,
        healthMetrics: summary.healthMetrics || [],
        pendingPrescriptionsCount: summary.pendingPrescriptionsCount || 0,
        recentActivity: [],
      });
    } catch (err: unknown) {
      console.error('Error fetching consumer dashboard summary:', err);
      setError('No se pudo cargar la información del dashboard.');
    } finally {
      setIsLoading(false);
    }
  }, [profileId]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  return {
    nextAppointment: data.nextAppointment,
    healthMetrics: data.healthMetrics,
    pendingPrescriptionsCount: data.pendingPrescriptionsCount,
    recentActivity: data.recentActivity,
    isLoading,
    error,
    refreshDashboard: loadDashboard,
  };
};