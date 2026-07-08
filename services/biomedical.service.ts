// services/biomedical.service.ts
import axiosInstance from '@/lib/axios';

const BASE_URL = '/api/catalog/biomedical';

export const biomedicalService = {
  
  // Equipos
  getEquipments: async (page = 0, size = 20) => {
    const response = await axiosInstance.get(`${BASE_URL}/equipments?page=${page}&size=${size}`);
    return response.data;
  },

  getEquipmentById: async (id: number) => {
    const response = await axiosInstance.get(`${BASE_URL}/equipments/${id}`);
    return response.data;
  },

  createEquipment: async (data: any) => {
    const response = await axiosInstance.post(`${BASE_URL}/equipments`, data);
    return response.data;
  },

  updateEquipment: async (id: number, data: any) => {
    const response = await axiosInstance.put(`${BASE_URL}/equipments/${id}`, data);
    return response.data;
  },

  // Órdenes de Trabajo
  getWorkOrders: async (equipmentId: number) => {
    const response = await axiosInstance.get(`${BASE_URL}/equipments/${equipmentId}/work-orders`);
    return response.data;
  },

  createWorkOrder: async (equipmentId: number, data: any) => {
    const response = await axiosInstance.post(`${BASE_URL}/equipments/${equipmentId}/work-orders`, data);
    return response.data;
  },

  updateWorkOrder: async (equipmentId: number, orderId: number, data: any) => {
    const response = await axiosInstance.put(`${BASE_URL}/equipments/${equipmentId}/work-orders/${orderId}`, data);
    return response.data;
  },

  // Documentos
  getDocuments: async (equipmentId: number) => {
    const response = await axiosInstance.get(`${BASE_URL}/equipments/${equipmentId}/documents`);
    return response.data;
  },

  uploadDocument: async (equipmentId: number, data: any) => {
    const response = await axiosInstance.post(`${BASE_URL}/equipments/${equipmentId}/documents`, data);
    return response.data;
  },

  deleteDocument: async (equipmentId: number, documentId: number) => {
    const response = await axiosInstance.delete(`${BASE_URL}/equipments/${equipmentId}/documents/${documentId}`);
    return response.data;
  },

  // Historial y Analítica
  getHistory: async (equipmentId: number) => {
    const response = await axiosInstance.get(`${BASE_URL}/equipments/${equipmentId}/history`);
    return response.data;
  },

  getMTTR: async (equipmentId: number) => {
    const response = await axiosInstance.get(`${BASE_URL}/equipments/${equipmentId}/mttr`);
    return response.data;
  }
};
