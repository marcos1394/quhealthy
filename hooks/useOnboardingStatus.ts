"use client";

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { OnboardingStatusResponse } from '@/app/quhealthy/types/provider'; // Asegúrate de tener este tipo exportado

export const useOnboardingStatus = () => {
  const [data, setData] = useState<OnboardingStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get<OnboardingStatusResponse>('/api/auth/provider/status', {
        withCredentials: true,
      });
      setData(response.data);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "No se pudieron cargar los datos del onboarding.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // La función 'refetch' permite a los componentes volver a cargar los datos si es necesario
  return { data, isLoading, error, refetch: fetchData };
};