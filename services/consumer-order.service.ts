// Ubicación: services/consumer-order.service.ts

import axiosInstance from "@/lib/axios";
import { ConsumerOrder } from "@/types/consumer-order";

const BASE_URL = '/api/appointments/consumer/orders';

export const ConsumerOrderService = {

  // 🚀 Obtener todas las órdenes del paciente logueado
  getOrders: async (): Promise<ConsumerOrder[]> => {
    const response = await axiosInstance.get(BASE_URL);
    // Manejamos paginación de Spring Boot (content) o arreglos directos
    return response.data.content || response.data || [];
  },

  // 🚀 Cambiar el estatus de la orden a DELIVERED
  markAsDelivered: async (orderId: number): Promise<void> => {
    await axiosInstance.patch(`${BASE_URL}/${orderId}/deliver`);
  },
};
