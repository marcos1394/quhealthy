// services/provider-order.service.ts
import axiosInstance from '@/lib/axios';
import { PageResponse } from '@/types/appointments'; // Reutilizamos tu tipo de paginación
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

  // 🚀 NUEVO: Llama al payment_service para cancelar y reembolsar
  cancelAndRefundOrder: async (orderId: number): Promise<void> => {
    // Fíjate que la ruta apunta a /payments, no a /appointments
    await axiosInstance.patch(`/api/payments/provider/orders/${orderId}/cancel`);
  },

  // 🚀 NUEVO: Descargar Packing Slip
  downloadPackingSlip: async (orderId: number): Promise<Blob> => {
    const response = await axiosInstance.get(`${BASE_URL}/${orderId}/packing-slip`, {
      responseType: 'blob', // Fundamental para que no se corrompa el PDF
      headers: {
        'Accept': 'application/pdf' // 🚀 FIX: Le decimos a Spring que sí queremos un PDF
      }
    });
    return response.data;
  }
};