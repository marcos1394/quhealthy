// Ubicación: hooks/useConsumerOrders.ts

import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { ConsumerOrder } from '@/types/consumer-order';
import { ConsumerOrderService } from '@/services/consumer-order.service';

export const useConsumerOrders = () => {
  const [orders, setOrders] = useState<ConsumerOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<number | null>(null);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await ConsumerOrderService.getOrders();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("No se pudieron cargar tus pedidos.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleMarkAsDelivered = async (orderId: number) => {
    setIsUpdating(orderId);
    try {
      await ConsumerOrderService.markAsDelivered(orderId);
      toast.success("¡Qué emoción! Gracias por confirmar de recibido.");

      // Actualización optimista del estado local
      setOrders(prev =>
        prev.map(o => o.id === orderId ? { ...o, orderStatus: 'DELIVERED' as const } : o)
      );
    } catch (error) {
      console.error("Error al actualizar la orden:", error);
      toast.error("No pudimos actualizar el estado de tu pedido.");
    } finally {
      setIsUpdating(null);
    }
  };

  return {
    orders,
    isLoading,
    isUpdating,
    fetchOrders,
    handleMarkAsDelivered,
  };
};
