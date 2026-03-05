// services/provider-order.service.ts
import axiosInstance from '@/lib/axios';
import { PageResponse } from '@/types/appointments'; // Reutilizamos tu tipo de paginación
import { OrderResponseDto, ShipOrderRequest } from '@/types/order';

const BASE_URL = '/api/provider/orders';

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
  }
};