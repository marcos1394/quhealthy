import axiosInstance from '@/lib/axios';
import { UI_PurchaseOrder } from '@/types/catalog';

export interface CreatePurchaseOrderRequest {
  supplierId: number;
  expectedDeliveryDate?: string;
  notes?: string;
  items: {
    catalogItemId: number;
    quantity: number;
    unitCost: number;
  }[];
}

export const purchaseOrderService = {
  async getPurchaseOrders(page = 0, size = 20): Promise<{ content: UI_PurchaseOrder[]; totalPages: number }> {
    const response = await axiosInstance.get('/api/catalog/purchases', { params: { page, size } });
    return response.data;
  },

  async getPurchaseOrderById(id: number): Promise<UI_PurchaseOrder> {
    const response = await axiosInstance.get(`/api/catalog/purchases/${id}`);
    return response.data;
  },

  async createPurchaseOrder(data: CreatePurchaseOrderRequest): Promise<UI_PurchaseOrder> {
    const response = await axiosInstance.post('/api/catalog/purchases', data);
    return response.data;
  },

  async receivePurchaseOrder(id: number, paymentMethod?: string): Promise<UI_PurchaseOrder> {
    const response = await axiosInstance.patch(`/api/catalog/purchases/${id}/receive`, { paymentMethod });
    return response.data;
  },

  async cancelPurchaseOrder(id: number): Promise<void> {
    await axiosInstance.patch(`/api/catalog/purchases/${id}/cancel`);
  }
};
