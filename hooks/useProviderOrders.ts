// Ubicación: src/hooks/useProviderOrders.ts
import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { handleApiError } from '@/lib/handleApiError';
import { providerOrderService } from '@/services/provider-order.service';
import { OrderResponseDto } from '@/types/order';

export const useProviderOrders = () => {
  const [orders, setOrders] = useState<OrderResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchOrders = useCallback(async (errorMsg: string, page = 0, size = 50) => {
    setIsLoading(true);
    try {
      const data = await providerOrderService.getOrders(page, size);
      setOrders(data.content || []);
    } catch (error) {
      handleApiError(error);
      // 🚀 FIX: Mostramos el mensaje visualmente
      toast.error(errorMsg, { theme: 'colored' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const shipOrder = async (
    orderId: number, 
    trackingNumber: string, 
    successMsg: string, 
    errorMsg: string
  ): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      const updatedOrder = await providerOrderService.shipOrder(orderId, { trackingNumber });
      setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
      toast.success(successMsg, { theme: 'colored' });
      return true;
    } catch (error) {
      handleApiError(error);
      // 🚀 FIX: Retorno falso explícito con notificación de error
      toast.error(errorMsg, { theme: 'colored' });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const markAsDelivered = async (
    orderId: number, 
    successMsg: string, 
    errorMsg: string
  ) => {
    try {
      const updatedOrder = await providerOrderService.markAsDelivered(orderId);
      setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
      toast.success(successMsg, { theme: 'colored' });
    } catch (error) {
      handleApiError(error);
      // 🚀 FIX: Notificación de error activa
      toast.error(errorMsg, { theme: 'colored' });
    }
  };

  return {
    orders,
    isLoading,
    isSubmitting,
    fetchOrders,
    shipOrder,
    markAsDelivered
  };
};