// src/hooks/dashboard/useConsumerDashboard.ts
import { useState, useEffect } from 'react';
import { appointmentService } from '@/services/appointment.service';
import { Appointment } from '@/types/appointments'; // 🚀 Asegúrate que sea el archivo que unificamos

export const useConsumerDashboard = () => {
  const [data, setData] = useState<{
    nextAppointment: Appointment | null;
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
        
        // 🚀 Traemos las citas usando el service profesional
        const appointments = await appointmentService.getMyAppointments();
        
        // 🚀 CORRECCIÓN DE TIPO: 
        // 1. Usamos 'SCHEDULED' (Mayúsculas) que es el equivalente a "Confirmada"
        // 2. Comparamos fechas correctamente
        const now = new Date();
        
        const next = appointments
          .filter(a => {
            const appointmentDate = new Date(a.startTime);
            return appointmentDate > now && a.status === 'SCHEDULED';
          })
          .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())[0] || null;

        setData({
          nextAppointment: next,
          recentActivity: [], 
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