import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { recommendationService, RecommendationConfigDto } from '@/services/recommendationService';

export function useRecommendationConfig() {
  // 🚀 Ahora el estado inicial es un arreglo vacío para soportar múltiples campañas
  const [campaigns, setCampaigns] = useState<RecommendationConfigDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchConfig = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await recommendationService.getConfig();
      setCampaigns(data);
    } catch (error) {
      console.error('Error fetching recommendation config:', error);
      // Fallback seguro: Si el backend devuelve error (ej. 404 porque no hay campañas),
      // dejamos la lista vacía para que el Manager muestre el estado "empty".
      setCampaigns([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveConfig = async (newConfig: RecommendationConfigDto) => {
    setIsSaving(true);
    try {
      // 1. Guardamos la campaña en el backend
      await recommendationService.saveConfig(newConfig);
      
      // 2. 🚀 Recargamos toda la lista desde el servidor para asegurar sincronía 
      // (así obtenemos el ID real generado por la base de datos)
      await fetchConfig();
      
      toast.success('Campaña guardada exitosamente');
      return true;
    } catch (error) {
      console.error('Error saving recommendation config:', error);
      toast.error('Ocurrió un error al guardar la campaña');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    // Ejecutamos la carga inicial al montar el hook
    fetchConfig();
  }, [fetchConfig]);

  return {
    campaigns,
    isLoading,
    isSaving,
    saveConfig,
    refreshConfig: fetchConfig
  };
}