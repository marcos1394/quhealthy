// Ubicación: src/services/provider-order.service.ts
import axiosInstance from '@/lib/axios';
import { PageResponse } from '@/types/appointments'; 
import { OrderResponseDto, ShipOrderRequest } from '@/types/order';

// 🚀 FIX: Ruta actualizada para coincidir con el microservicio a través del Gateway
const BASE_URL = '/api/appointments/provider/orders';

export const providerOrderService = {
  
  getOrders: async (page = 0, size = 20): Promise<PageResponse<OrderResponseDto>> => {
    const response = await axiosInstance.get<PageResponse<OrderResponseDto>>(BASE_URL, {
      params: { page, size }
    });
    return response.data;
  },

  shipOrder: async (orderId: number, data: ShipOrderRequest): Promise<OrderResponseDto> => {
    const response = await axiosInstance.patch<OrderResponseDto>(`${BASE_URL}/${orderId}/ship`, data);
    return response.data;
  },

  markAsDelivered: async (orderId: number): Promise<OrderResponseDto> => {
    const response = await axiosInstance.patch<OrderResponseDto>(`${BASE_URL}/${orderId}/deliver`);
    return response.data;
  },

  cancelAndRefundOrder: async (orderId: number): Promise<void> => {
    await axiosInstance.patch(`/api/payments/provider/orders/${orderId}/cancel`);
  },

  rejectOrderForPrescription: async (orderId: number, reason: string): Promise<void> => {
    await axiosInstance.patch(`/api/payments/provider/orders/${orderId}/reject`, null, {
      params: { reason }
    });
  },

  downloadPackingSlip: async (orderId: number): Promise<Blob> => {
    const response = await axiosInstance.get(`${BASE_URL}/${orderId}/packing-slip`, {
      responseType: 'blob', 
      headers: {
        'Accept': 'application/pdf' 
      }
    });
    return response.data;
  },

  approvePrescription: async (orderId: number): Promise<OrderResponseDto> => {
    // 🚀 FIX: Usa BASE_URL para apuntar a appointment_service
    const response = await axiosInstance.patch<OrderResponseDto>(`${BASE_URL}/${orderId}/approve-prescription`);
    return response.data;
  }
};