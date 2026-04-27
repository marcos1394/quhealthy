import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '@/lib/axios'; 
import { handleApiError } from '@/lib/handleApiError';

// --- INTERFACES (Mapeo exacto del backend) ---
export interface UsageDetail {
  current: number;
  limit: number;
  canAdd: boolean;
}

export interface PlanUsageResponse {
  planName: string;
  metrics: {
    services: UsageDetail;
    packages: UsageDetail;
    staff: UsageDetail;
    products?: UsageDetail; // 🚀 AGREGADO
    courses?: UsageDetail;  // 🚀 AGREGADO
  };
}

export function usePlanLimits() {
  const [usage, setUsage] = useState<PlanUsageResponse | null>(null);
  const [isLoadingLimits, setIsLoadingLimits] = useState(true);

  const fetchLimits = useCallback(async () => {
    try {
      setIsLoadingLimits(true);
      // Consumimos el nuevo endpoint que creamos en PlanUsageController
      const { data } = await axiosInstance.get<PlanUsageResponse>('/api/catalog/limits/usage');
      setUsage(data);
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoadingLimits(false);
    }
  }, []);

  // Cargar los límites automáticamente al montar el componente
  useEffect(() => {
    fetchLimits();
  }, [fetchLimits]);

  return { 
    usage, 
    isLoadingLimits, 
    refreshLimits: fetchLimits // Útil para recargar después de borrar o agregar algo
  };
}