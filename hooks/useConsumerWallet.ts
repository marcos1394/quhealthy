// src/hooks/useConsumerWallet.ts
import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { handleApiError } from '@/lib/handleApiError';
import { consumerPackageService } from '@/services/consumer-package.service';
import { ConsumerPackage } from '@/types/packages';

export const useConsumerWallet = () => {
  const [packages, setPackages] = useState<ConsumerPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWallet = useCallback(async (errorMsg: string) => {
    setIsLoading(true);
    try {
      const data = await consumerPackageService.getMyWallet();
      setPackages(data || []);
    } catch (error) {
      console.error("Error fetching wallet:", error);
      return;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 🚀 Opcional: Aquí podrías agregar métodos futuros para canjear un ítem
  // const redeemCredit = async (creditId: number) => { ... }

  return { 
    packages, 
    isLoading, 
    fetchWallet 
  };
};