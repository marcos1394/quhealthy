// src/hooks/useHealthScore.ts
import { useState, useCallback } from 'react';
import { healthScoreService } from '@/services/healthscore.service';
import { HealthScoreResponse, HealthProfilePayload } from '@/types/healthscore';
import { toast } from 'react-toastify';

export const useHealthScore = () => {
  const [scoreData, setScoreData] = useState<HealthScoreResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 📥 Obtiene el Score Actual (Ideal para el Dashboard)
   */
  const fetchMyScore = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await healthScoreService.getMyScore();
      setScoreData(data);
    } catch (err: any) {
      // Si da 404, significa que el usuario es nuevo y no ha llenado el onboarding
      if (err.response?.status === 404) {
        setScoreData(null);
      } else {
        console.error("Error obteniendo QuScore:", err);
        setError("No pudimos cargar tu Índice de Salud.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * 📤 Envía el formulario de Onboarding de Salud
   */
  const submitHealthProfile = async (payload: HealthProfilePayload): Promise<boolean> => {
    setIsSubmitting(true);
    setError(null);
    try {
      const data = await healthScoreService.submitProfile(payload);
      setScoreData(data); // Actualizamos el estado local con el nuevo score calculado
      
      // Mostrar feedback gamificado
      if (data.delta && data.delta > 0) {
        toast.success(`¡Genial! Tu QuScore subió a ${data.quscore} (+${data.delta} pts) 🚀`);
      } else {
        toast.success(`Perfil guardado. Tu QuScore es ${data.quscore} 🌟`);
      }
      
      return true;
    } catch (err: any) {
      console.error("Error guardando perfil de salud:", err);
      const errorMsg = err.response?.data?.message || "Ocurrió un error al guardar tu perfil.";
      setError(errorMsg);
      toast.error(errorMsg);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    scoreData,
    isLoading,
    isSubmitting,
    error,
    fetchMyScore,
    submitHealthProfile
  };
};