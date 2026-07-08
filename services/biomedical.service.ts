// services/biomedical.service.ts
import axiosInstance from '@/lib/axios';

const BASE_URL = '/api/catalog/biomedical';

export const biomedicalService = {
  
  // Equipos
  listEquipments: async (providerId: string) => {
    const response = await axiosInstance.get(`${BASE_URL}/${providerId}/equipments`);
    return response.data;
  },

  createEquipment: async (providerId: string, data: any) => {
    const response = await axiosInstance.post(`${BASE_URL}/${providerId}/equipments`, data);
    return response.data;
  },

  moveEquipment: async (equipmentId: string, newAreaId: string, reason?: string) => {
    const params = new URLSearchParams({ newAreaId });
    if (reason) params.append('reason', reason);
    const response = await axiosInstance.post(`${BASE_URL}/equipments/${equipmentId}/move?${params.toString()}`);
    return response.data;
  },

  // Órdenes de Trabajo
  getWorkOrders: async (equipmentId: string) => {
    const response = await axiosInstance.get(`${BASE_URL}/work-orders/${equipmentId}`);
    return response.data;
  },

  createCorrectiveOrder: async (equipmentId: string, diagnostic: string) => {
    const params = new URLSearchParams({ diagnostic });
    const response = await axiosInstance.post(`${BASE_URL}/work-orders/${equipmentId}/corrective?${params.toString()}`);
    return response.data;
  },

  updateOrderStatus: async (workOrderId: string, status: string, repairNotes?: string, partsUsed?: string, downtimeMinutes?: number) => {
    const params = new URLSearchParams({ status });
    if (repairNotes) params.append('repairNotes', repairNotes);
    if (partsUsed) params.append('partsUsed', partsUsed);
    if (downtimeMinutes) params.append('downtimeMinutes', downtimeMinutes.toString());
    const response = await axiosInstance.patch(`${BASE_URL}/work-orders/${workOrderId}/status?${params.toString()}`);
    return response.data;
  },

  // Historial y Analítica
  getHistory: async (equipmentId: string) => {
    const response = await axiosInstance.get(`${BASE_URL}/equipments/${equipmentId}/history`);
    return response.data;
  },

  getMTTR: async (equipmentId: string) => {
    const response = await axiosInstance.get(`${BASE_URL}/equipments/${equipmentId}/mttr`);
    return response.data;
  }
};
