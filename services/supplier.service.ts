import axiosInstance from '@/lib/axios';
import { UI_Supplier } from '@/types/catalog';

export const supplierService = {
  async getSuppliers(page = 0, size = 20): Promise<{ content: UI_Supplier[]; totalPages: number }> {
    const response = await axiosInstance.get('/api/catalog/suppliers', { params: { page, size } });
    return response.data;
  },

  async getSupplierById(id: number): Promise<UI_Supplier> {
    const response = await axiosInstance.get(`/api/catalog/suppliers/${id}`);
    return response.data;
  },

  async createSupplier(data: Partial<UI_Supplier>): Promise<UI_Supplier> {
    const response = await axiosInstance.post('/api/catalog/suppliers', data);
    return response.data;
  },

  async updateSupplier(id: number, data: Partial<UI_Supplier>): Promise<UI_Supplier> {
    const response = await axiosInstance.put(`/api/catalog/suppliers/${id}`, data);
    return response.data;
  },

  async deleteSupplier(id: number): Promise<void> {
    await axiosInstance.delete(`/api/catalog/suppliers/${id}`);
  }
};
