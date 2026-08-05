// hooks/useAvailability.ts
import { useState, useCallback } from 'react';
import { scheduleService } from '@/services/schedule.service';
import { toast } from 'react-toastify';
import { handleApiError } from '@/lib/handleApiError';
import { format } from 'date-fns';

export const useAvailability = () => {
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  const [monthAvailability, setMonthAvailability] = useState<Record<string, string[]>>({});
  const [isLoadingMonth, setIsLoadingMonth] = useState(false);

  // Consulta al servicio los horarios libres reales para una fecha exacta
  const fetchAvailableSlots = useCallback(async (providerId: number, locationId: number | undefined, date: Date, durationMinutes: number, staffId?: number | null) => {
    setIsLoadingSlots(true);
    setAvailableSlots([]); // Limpiamos los slots de la fecha anterior mientras carga

    try {
      // Formateamos la fecha al estándar ISO (YYYY-MM-DD) para Spring Boot
      const formattedDate = format(date, 'yyyy-MM-dd'); 
      
      const slots = await scheduleService.getAvailableSlots(
        providerId,
        locationId,
        formattedDate,
        formattedDate,
        durationMinutes,
        staffId || undefined
      );
      
      setAvailableSlots(slots);
    } catch (error: any) {
      console.error("Error al obtener disponibilidad:", error);
      
      // 🚀 Manejo específico para el error 403 (Problema de permisos en el backend)
      if (error.response?.status === 403) {
      } else {
        const errorMessage = error.response?.data?.message || "No pudimos cargar los horarios para este día.";
      }
      
      setAvailableSlots([]); // Nos aseguramos de limpiar en caso de error
    } finally {
      setIsLoadingSlots(false);
    }
  }, []);

  // Consulta al servicio los horarios libres para un rango de fechas (ej. un mes)
  const fetchMonthAvailability = useCallback(async (providerId: number, locationId: number | undefined, startDate: Date, endDate: Date, durationMinutes: number, staffId?: number | null) => {
    setIsLoadingMonth(true);
    
    try {
      const formattedStartDate = format(startDate, 'yyyy-MM-dd');
      const formattedEndDate = format(endDate, 'yyyy-MM-dd');
      
      const slotsMap = await scheduleService.getAvailableSlotsForRange(
        providerId,
        locationId,
        formattedStartDate,
        formattedEndDate,
        durationMinutes,
        staffId || undefined
      );
      
      setMonthAvailability(slotsMap);
    } catch (error: any) {
      console.error("Error al obtener disponibilidad mensual:", error);
      setMonthAvailability({});
    } finally {
      setIsLoadingMonth(false);
    }
  }, []);

  return {
    availableSlots,
    isLoadingSlots,
    fetchAvailableSlots,
    monthAvailability,
    isLoadingMonth,
    fetchMonthAvailability
  };
};