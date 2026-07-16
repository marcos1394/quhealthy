// hooks/usePackageRecommendations.ts
"use client";

import { useState, useEffect, useCallback } from 'react';
import { recommendationService } from '@/services/recommendation.service';
import { PackageRecommendation } from '@/types/recommendations';
import { useSessionStore } from '@/stores/SessionStore';

export const usePackageRecommendations = (limit = 4) => {
  const { token } = useSessionStore();

  const [recommendations, setRecommendations] = useState<PackageRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = useCallback(async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await recommendationService.getPackageRecommendations(limit);
      setRecommendations(data);
    } catch (err: any) {
      console.error('❌ Error cargando recomendaciones de paquetes:', err);
      setError('No pudimos cargar las recomendaciones.');
      // No mostramos toast de error para no interrumpir la experiencia —
      // la sección simplemente no renderizará nada si falla.
    } finally {
      setIsLoading(false);
    }
  }, [token, limit]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  return {
    recommendations,
    isLoading,
    error,
    refetch: fetchRecommendations,
  };
};
