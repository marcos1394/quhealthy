// src/hooks/useProviderScore.ts
import { useState, useCallback } from 'react';
import { providerScoreService } from '@/services/providerScore.service';
import { ProviderScoreResponse } from '@/types/providerScore';

export const useProviderScore = () => {
  // Estado para la vista individual (Perfil del doctor)
  const [singleScore, setSingleScore] = useState<ProviderScoreResponse | null>(null);

  // Estado para la vista de lista (Resultados de búsqueda)
  const [batchScores, setBatchScores] = useState<Record<number, ProviderScoreResponse>>({});

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 🔍 Obtiene el QuScore de un doctor específico
   */
  const fetchSingleScore = useCallback(async (providerId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await providerScoreService.getProviderScore(providerId);
      setSingleScore(data);
      return data;
    } catch (err: any) {
      const status = err?.response?.status;
      // 404 = provider not found, 500 = backend cache config issue — both are expected
      if (status !== 404 && status !== 500) {
        console.warn(`[useProviderScore] Unexpected error for provider ${providerId}:`, err?.message);
        setError("Could not load provider score.");
      }
      setSingleScore(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * 📦 Obtiene múltiples QuScores de golpe (Ideal para Search Results)
   * Lo guarda en un Record (Diccionario) para que sea O(1) buscar el score de cada tarjeta
   */
  const fetchBatchScores = useCallback(async (providerIds: number[]) => {
    if (!providerIds.length) return;

    setIsLoading(true);
    setError(null);
    try {
      const dataArray = await providerScoreService.getScoresBatch(providerIds);

      // Convertimos el arreglo [{providerId: 1...}, {providerId: 2...}]
      // a un diccionario { 1: {...}, 2: {...} } para que la UI los pinte rapidísimo
      const scoresMap: Record<number, ProviderScoreResponse> = {};
      dataArray.forEach(score => {
        scoresMap[score.providerId] = score;
      });

      setBatchScores(scoresMap);
    } catch (err: any) {
      const status = err?.response?.status;
      if (status !== 404 && status !== 500) {
        console.warn("[useProviderScore] Unexpected batch error:", err?.message);
        setError("Could not load provider scores.");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    singleScore,
    batchScores,
    isLoading,
    error,
    fetchSingleScore,
    fetchBatchScores
  };
};