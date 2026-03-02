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
      if (err.response?.status !== 404) {
        console.error(`Error obteniendo QuScore del proveedor ${providerId}:`, err);
        setError("No pudimos cargar la reputación de este profesional.");
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
      console.error("Error obteniendo QuScores en batch:", err);
      setError("Ocurrió un error al cargar la reputación de los resultados.");
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