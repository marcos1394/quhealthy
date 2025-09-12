"use client";

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

// Asegúrate de crear o tener este tipo en tus archivos de tipos.
// Debe coincidir con la estructura que devuelve tu backend.
export interface OnboardingStep {
  id: 'kyc' | 'license' | 'marketplace';
  title: string;
  description: string;
  isComplete: boolean;
  isRequired: boolean;
  statusText: string;
  actionPath?: string;
  actionDisabled: boolean;
}

export const useOnboardingChecklist = () => {
  const [steps, setSteps] = useState<OnboardingStep[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChecklist = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Llamamos al nuevo endpoint que devuelve la lista de tareas dinámica
      const response = await axios.get<OnboardingStep[]>('/api/providers/onboarding/checklist', {
        withCredentials: true,
      });
      // Guardamos el array de pasos en el estado
      setSteps(response.data);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const message = err.response?.data?.message || "No se pudo cargar tu lista de tareas pendientes.";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChecklist();
  }, [fetchChecklist]);

  // Devolvemos los pasos y una función para recargarlos si es necesario
  return { steps, isLoading, error, refetch: fetchChecklist };
};