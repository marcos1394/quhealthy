// hooks/useTimeBlock.ts
import { useState } from 'react';
import { scheduleService } from '@/services/schedule.service';
import { CreateTimeBlockPayload } from '@/types/schedule';
import { toast } from 'react-toastify';
import { handleApiError } from '@/lib/handleApiError';

export const useTimeBlock = () => {
  const [isCreating, setIsCreating] = useState(false);

  const createBlock = async (payload: CreateTimeBlockPayload): Promise<boolean> => {
    setIsCreating(true);
    try {
      await scheduleService.createTimeBlock(payload);
      return true; // Retornamos true si fue exitoso para que el Modal avance
    } catch (error: any) {
      console.error("Error al crear el bloqueo:", error);
      const errorMessage = error.response?.data?.message || "Ocurrió un error al bloquear el horario.";
      return;
      return false; // Retornamos false si falló para que el Modal no se cierre
    } finally {
      setIsCreating(false);
    }
  };

  return {
    createBlock,
    isCreating
  };
};