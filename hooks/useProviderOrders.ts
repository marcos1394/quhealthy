/* eslint-disable react-doctor/prefer-module-scope-pure-function */
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
    errorMsg: string,
    shippingCarrier = 'OTHER',
    packageEvidenceUrls?: string // 🚀 NUEVO PARÁMETRO
  ): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      const updatedOrder = await providerOrderService.shipOrder(orderId, { 
        trackingNumber, 
        shippingCarrier,
        packageEvidenceUrls // 🚀 Lo enviamos en el payload
      });
      setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
      toast.success(successMsg, { theme: 'colored' });
      return true;
    } catch (error) {
      handleApiError(error);
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

  const deliverWithPin = async (
    orderId: number, 
    pin: string,
    successMsg: string, 
    errorMsg: string
  ): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      await providerOrderService.deliverWithPin(orderId, pin);
      // Actualizar el estado localmente ya que el backend no devuelve la orden
      setOrders(prev => prev.map(o => 
        o.id === orderId ? { ...o, orderStatus: 'DELIVERED' } : o
      ));
      toast.success(successMsg, { theme: 'colored' });
      return true;
    } catch (error) {
      handleApiError(error);
      toast.error(errorMsg, { theme: 'colored' });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const cancelOrder = async (
    orderId: number, 
    successMsg: string, 
    errorMsg: string
  ): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      await providerOrderService.cancelAndRefundOrder(orderId);
      // Como el endpoint no devuelve la orden completa, actualizamos el estado localmente
      setOrders(prev => prev.map(o => 
        o.id === orderId ? { ...o, orderStatus: 'CANCELLED', paymentStatus: 'REFUNDED' } : o
      ));
      toast.success(successMsg, { theme: 'colored' });
      return true;
    } catch (error) {
      handleApiError(error);
      toast.error(errorMsg, { theme: 'colored' });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🚀 NUEVA FUNCIÓN en useProviderOrders
  const downloadSlip = async (orderId: number, successMsg: string, errorMsg: string) => {
    try {
      // Usamos isSubmitting global o puedes crear un estado específico isDownloading
      const blob = await providerOrderService.downloadPackingSlip(orderId);
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `hoja-empaque-${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success(successMsg, { theme: 'colored' });
    } catch (error) {
      handleApiError(error);
      toast.error(errorMsg, { theme: 'colored' });
    }
  };

  const rejectOrder = async (
    orderId: number,
    reason: string,
    successMsg: string,
    errorMsg: string
  ): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      await providerOrderService.rejectOrderForPrescription(orderId, reason);
      // Actualizar localmente sin refetch
      setOrders(prev =>
        prev.map(o =>
          o.id === orderId
            ? { ...o, orderStatus: 'CANCELLED', paymentStatus: 'REFUNDED' }
            : o
        )
      );
      toast.success(successMsg, { theme: 'colored' });
      return true;
    } catch (error) {
      handleApiError(error);
      toast.error(errorMsg, { theme: 'colored' });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🚀 NUEVA FUNCIÓN: Aprobar Receta
  const approvePrescription = async (
    orderId: number,
    successMsg: string,
    errorMsg: string
  ): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      const updatedOrder = await providerOrderService.approvePrescription(orderId);
      // Actualizamos la orden en la tabla
      setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
      toast.success(successMsg, { theme: 'colored' });
      return true;
    } catch (error) {
      handleApiError(error);
      toast.error(errorMsg, { theme: 'colored' });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    orders,
    isLoading,
    isSubmitting,
    fetchOrders,
    shipOrder,
    markAsDelivered,
    deliverWithPin,
    cancelOrder,
    downloadSlip,
    rejectOrder,
    approvePrescription, // 🚀 Añadir aquí
  };
};