// services/biomedical.service.ts
import axiosInstance from '@/lib/axios';

const BASE_URL = '/api/catalog/biomedical';

export const biomedicalService = {
  
  // Equipos
  listEquipments: async (providerId: string) => {
    const response = await axiosInstance.get(`${BASE_URL}/${providerId}/equipments`);
    return response.data;
  },

  getCategories: async (providerId: string) => {
    const response = await axiosInstance.get(`${BASE_URL}/${providerId}/categories`);
    return response.data;
  },

  createEquipment: async (providerId: string, data: any) => {
    const response = await axiosInstance.post(`${BASE_URL}/${providerId}/equipments`, data);
    return response.data;
  },

  moveEquipment: async (equipmentId: string, newCostCenterId: string, reason?: string) => {
    const params = new URLSearchParams({ newCostCenterId });
    if (reason) params.append('reason', reason);
    const response = await axiosInstance.post(`${BASE_URL}/equipments/${equipmentId}/move?${params.toString()}`);
    return response.data;
  },

  // Órdenes de Trabajo
  getWorkOrders: async (equipmentId: string) => {
    const response = await axiosInstance.get(`${BASE_URL}/work-orders/${equipmentId}`);
    return response.data;
  },

  createWorkOrder: async (equipmentId: string, data: any) => {
    const response = await axiosInstance.post(`${BASE_URL}/work-orders/${equipmentId}`, data);
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
  },

  // Dashboard
  getDashboardStats: async (providerId: string) => {
    const response = await axiosInstance.get(`${BASE_URL}/${providerId}/dashboard/stats`);
    return response.data;
  },

  // Documentos
  getUploadUrl: async (equipmentId: string, originalFilename: string, contentType: string) => {
    const params = new URLSearchParams({ originalFilename, contentType });
    const response = await axiosInstance.get(`${BASE_URL}/equipments/${equipmentId}/documents/upload-url?${params.toString()}`);
    return response.data;
  },
  registerDocument: async (equipmentId: string, type: string, fileUrl: string) => {
    const params = new URLSearchParams({ type, fileUrl });
    const response = await axiosInstance.post(`${BASE_URL}/equipments/${equipmentId}/documents?${params.toString()}`);
    return response.data;
  },
  getDocuments: async (equipmentId: string) => {
    const response = await axiosInstance.get(`${BASE_URL}/equipments/${equipmentId}/documents`);
    return response.data;
  },

  // Garantías
  registerWarranty: async (equipmentId: string, data: any) => {
    const response = await axiosInstance.post(`${BASE_URL}/equipments/${equipmentId}/warranties`, data);
    return response.data;
  },
  getWarranties: async (equipmentId: string) => {
    const response = await axiosInstance.get(`${BASE_URL}/equipments/${equipmentId}/warranties`);
    return response.data;
  },

  // Mantenimientos
  createSchedule: async (equipmentId: string, data: any) => {
    const response = await axiosInstance.post(`${BASE_URL}/equipments/${equipmentId}/schedules`, data);
    return response.data;
  },
  getSchedules: async (equipmentId: string) => {
    const response = await axiosInstance.get(`${BASE_URL}/equipments/${equipmentId}/schedules`);
    return response.data;
  }
};
