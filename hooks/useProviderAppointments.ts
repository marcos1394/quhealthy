// hooks/useProviderAppointments.ts

import { useState, useEffect, useCallback } from 'react';
import { appointmentService } from '@/services/appointment.service';
import { ProviderAppointment } from '@/types/appointments';
import { toast } from 'react-toastify';
import { handleApiError } from '@/lib/handleApiError';

export const LOCAL_STORAGE_KEY = 'quhealthy_appointments_times';

const getStoredTimes = () => {
  if (typeof window === 'undefined') return {};
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
};

export const saveApptTime = (appointmentId: number | string, field: 'arrivedAt' | 'startedAt' | 'completedAt', timeStr: string) => {
  if (typeof window === 'undefined') return;
  try {
    const current = getStoredTimes();
    if (!current[appointmentId]) current[appointmentId] = {};
    current[appointmentId][field] = timeStr;
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(current));
  } catch (e) {
    console.error("No se pudo guardar el tiempo localmente", e);
  }
};

export const useProviderAppointments = () => {
  const [appointments, setAppointments] = useState<ProviderAppointment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchAppointments = useCallback(async (showLoader = true) => {
    if (showLoader) setIsLoading(true);
    
    try {
      const data = await appointmentService.getProviderAppointments();
      const storedTimes = getStoredTimes();
      
      const enrichedData = data.map(appt => {
        const stored = storedTimes[appt.id] || {};
        return {
          ...appt,
          arrivedAt: appt.arrivedAt || stored.arrivedAt,
          startedAt: appt.startedAt || stored.startedAt,
          completedAt: appt.completedAt || stored.completedAt
        };
      });
      
      setAppointments(enrichedData);
    } catch (error) {
      console.error("Error al obtener las citas del proveedor:", error);
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