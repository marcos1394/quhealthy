// hooks/useOperatingHours.ts
import { useState, useCallback } from 'react';
import { scheduleService } from '@/services/schedule.service';
import { ProviderSchedule, mapEnumToNumber, mapNumberToEnum } from '@/types/schedule';
import { toast } from 'react-toastify';

// El tipo que usa tu UI internamente (DaySchedule)
export interface UIDaySchedule {
  dayOfWeek: number; // 0-6
  isActive: boolean;
  openTime: string;  // "HH:mm"
  closeTime: string; // "HH:mm"
}

export const useOperatingHours = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 1. OBTENER Y TRANSFORMAR DATOS (Back -> Front)
  const fetchSchedules = useCallback(async (): Promise<UIDaySchedule[]> => {
    setIsLoading(true);
    try {
      const data = await scheduleService.getMySchedule();
      
      // Transformamos ProviderSchedule a UIDaySchedule
      return data.map(schedule => ({
        dayOfWeek: mapEnumToNumber(schedule.dayOfWeek),
        isActive: schedule.isWorkingDay,
        openTime: schedule.startTime ? schedule.startTime.slice(0, 5) : '09:00',
        closeTime: schedule.endTime ? schedule.endTime.slice(0, 5) : '17:00'
      }));
    } catch (error) {
      console.error("Error cargando horarios:", error);
      toast.error("No pudimos cargar tus horarios.");
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 2. TRANSFORMAR Y GUARDAR DATOS (Front -> Back)
  const saveSchedules = async (uiSchedules: UIDaySchedule[]): Promise<boolean> => {
    setIsSaving(true);
    try {
      // Filtrar solo los activos y transformarlos al modelo de Java
      const payload: ProviderSchedule[] = uiSchedules
        .filter(ui => ui.isActive)
        .map(ui => ({
          dayOfWeek: mapNumberToEnum(ui.dayOfWeek),
          isWorkingDay: true,
          startTime: `${ui.openTime}:00`,   // Java espera "HH:mm:ss"
          endTime: `${ui.closeTime}:00`,    // Java espera "HH:mm:ss"
          breakStart: null, // Dejamos esto null por ahora hasta que agregues breaks a la UI
          breakEnd: null
        }));

      await scheduleService.updateSchedule(payload);
      return true;
    } catch (error: any) {
      console.error("Error guardando horarios:", error);
      toast.error(error.response?.data?.message || "Ocurrió un error al guardar los horarios.");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    fetchSchedules,
    saveSchedules,
    isLoading,
    isSaving
  };
};