/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export interface OnboardingStep {
  // Ampliamos los IDs para incluir 'profile' que mencionamos antes
  id: 'profile' | 'kyc' | 'license' | 'marketplace' | string; 
  title: string;
  description: string;
  isComplete: boolean;
  isRequired: boolean;
  statusText: string; // Ej: "Pendiente", "En Revisión", "Completado"
  actionPath?: string; // La ruta a la que redirige el botón
  actionDisabled: boolean; // Si es true, el botón se bloquea (ej: paso secuencial)
}

export const useOnboardingChecklist = () => {
  const [steps, setSteps] = useState<OnboardingStep[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChecklist = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Nota: Asegúrate de que esta ruta exista en tu backend o Next.js API Route
      const response = await axios.get<OnboardingStep[]>('/api/auth/provider/onboarding/checklist');
      setSteps(response.data);
    } catch (err: any) {
      console.error("Error fetching checklist:", err);
      // Fallback elegante: Si falla (404/500), no rompemos la app, mostramos error
      const message = err.response?.data?.message || "No pudimos sincronizar tu progreso.";
      setError(message);
      // Opcional: toast.error(message); // A veces es mejor solo mostrar el error en la UI
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChecklist();
  }, [fetchChecklist]);

  return { steps, isLoading, error, refetch: fetchChecklist };
};