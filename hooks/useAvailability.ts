// hooks/useAvailability.ts
import { useState, useCallback } from 'react';
import { scheduleService } from '@/services/schedule.service';
import { toast } from 'react-toastify';
import { handleApiError } from '@/lib/handleApiError';
import { format } from 'date-fns';

export const useAvailability = () => {
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  // Consulta al servicio los horarios libres reales para una fecha exacta
  const fetchAvailableSlots = useCallback(async (providerId: number, locationId: number, date: Date, durationMinutes: number) => {
    setIsLoadingSlots(true);
    setAvailableSlots([]); // Limpiamos los slots de la fecha anterior mientras carga

    try {
      // Formateamos la fecha al estándar ISO (YYYY-MM-DD) para Spring Boot
      const formattedDate = format(date, 'yyyy-MM-dd'); 
      
      // 🚀 FIX: Ahora pasamos locationId como query param requerido
      const slots = await scheduleService.getAvailableSlots(
        providerId,
        locationId,
        formattedDate,
        formattedDate,
        durationMinutes
      );
      
      setAvailableSlots(slots);
    } catch (error: any) {
      console.error("Error al obtener disponibilidad:", error);
      
      // 🚀 Manejo específico para el error 403 (Problema de permisos en el backend)
      if (error.response?.status === 403) {
        return;
      } else {
        const errorMessage = error.response?.data?.message || "No pudimos cargar los horarios para este día.";
        return;
      }
      
      setAvailableSlots([]); // Nos aseguramos de limpiar en caso de error
    } finally {
      setIsLoadingSlots(false);
    }
  }, []);

  return {
    availableSlots,
    isLoadingSlots,
    fetchAvailableSlots
  };
};