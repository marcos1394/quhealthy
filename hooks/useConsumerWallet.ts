// src/hooks/useConsumerWallet.ts
import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { consumerWalletService } from '@/services/consumer-wallet.service';
import { ConsumerWalletResponse } from '@/types/wallet';

export const useConsumerWallet = () => {
  const [wallet, setWallet] = useState<ConsumerWalletResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isToppingUp, setIsToppingUp] = useState(false);

  const fetchWallet = useCallback(async (errorMsg?: string) => {
    setIsLoading(true);
    try {
      const data = await consumerWalletService.getMyWallet();
      setWallet(data);
    } catch (error) {
      console.error("Error fetching wallet:", error);
      if (errorMsg) {
        toast.error(errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const topUpWallet = useCallback(async (amount: number, successCallback?: (url: string) => void) => {
    setIsToppingUp(true);
    try {
      const response = await consumerWalletService.topUpWallet(amount);
      if (response.url) {
        if (successCallback) {
          successCallback(response.url);
        } else {
          window.location.href = response.url;
        }
      }
    } catch (error) {
      console.error("Error topping up wallet:", error);
      toast.error("Ocurrió un error al generar la recarga.");
    } finally {
      setIsToppingUp(false);
    }
  }, []);

  return { 
    wallet, 
    isLoading,
    isToppingUp, 
    fetchWallet,
    topUpWallet
  };
};