// hooks/useProviderAppointments.ts

import { useState, useEffect, useCallback } from 'react';
import { appointmentService } from '@/services/appointment.service';
import { ProviderAppointment } from '@/types/appointments';
import { toast } from 'react-toastify';

export const useProviderAppointments = () => {
  const [appointments, setAppointments] = useState<ProviderAppointment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchAppointments = useCallback(async (showLoader = true) => {
    if (showLoader) setIsLoading(true);
    
    try {
      const data = await appointmentService.getProviderAppointments();
      setAppointments(data);
    } catch (error) {
      console.error("Error al obtener las citas del proveedor:", error);
      toast.error("Error al sincronizar la agenda.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Carga inicial al montar
  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  return {
    appointments,
    setAppointments, // 🚀 Exportado para actualizaciones optimistas (ej. cancelar/completar al instante)
    isLoading,
    refetch: () => fetchAppointments(false) // Permite recargar en background sin pantallazo de carga
  };
};