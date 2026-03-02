// src/hooks/dashboard/useConsumerDashboard.ts
import { useState, useEffect } from 'react';
import { appointmentService } from '@/services/appointment.service';
import { Appointment } from '@/types/appointments'; // 🚀 Asegúrate de usar la ruta correcta a tu archivo de tipos

export const useConsumerDashboard = () => {
  const [data, setData] = useState<{
    nextAppointment: Appointment | null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recentActivity: any[]; 
  }>({
    nextAppointment: null,
    recentActivity: [],
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // 🚀 CORRECCIÓN 1: getMyAppointments ahora devuelve un PageResponse.
        // Extraemos el arreglo de citas desde la propiedad 'content'.
        // Pedimos solo la primera página para optimizar la carga del dashboard.
        const pageData = await appointmentService.getMyAppointments(0, 50);
        const appointmentsList = pageData.content || [];
        
        const now = new Date();
        
        // 🚀 CORRECCIÓN 2: Iteramos sobre el arreglo extraído (appointmentsList)
        const next = appointmentsList
          .filter(a => {
            const appointmentDate = new Date(a.startTime);
            // Consideramos como "próxima cita" aquellas confirmadas, en progreso o pendientes de pago
            const isValidStatus = 
              a.status === 'SCHEDULED' || 
              a.status === 'PENDING_PAYMENT' || 
              a.status === 'IN_PROGRESS';
              
            return appointmentDate > now && isValidStatus;
          })
          // Ordenamos de la más cercana a la más lejana en el tiempo
          .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())[0] || null;

        setData({
          nextAppointment: next,
          recentActivity: [], // En el futuro puedes llenar esto con citas que tengan status 'COMPLETED'
        });
      } catch (err: any) {
        console.error("Error en useConsumerDashboard:", err);
        setError(err.message || "Error al cargar datos del dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, []);

  return { ...data, isLoading, error };
};