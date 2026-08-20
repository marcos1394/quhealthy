import axiosInstance from "@/lib/axios";
import {
  SupplierOrganization,
  SupplierOnboardingStatus,
  SupplierWarehouse,
  SupplierMember,
  SupplierDocument,
  SaveSupplierIdentityPayload,
  SaveSupplierLegalTaxPayload,
  SaveSupplierWarehousePayload,
  InviteSupplierMemberPayload,
  AdditiveMigrationPayload,
  SupplierDocumentType,
  MedicalProduct,
  SaveMedicalProductPayload,
  ProductBatch,
  SaveProductBatchPayload,
  BatchStatus,
  InventoryMovement,
  InventoryAdjustmentPayload,
  InventoryTransfer,
  CreateInventoryTransferPayload,
  BulkImportResult,
  ProductPriceTier,
  SavePriceTierPayload,
  SupplierQuote,
  SaveSupplierQuotePayload,
  SupplierPurchaseOrder,
  UpdatePurchaseOrderStatusPayload,
} from "@/types/supplier";

export const supplierService = {
  // --- ONBOARDING & ORGANIZACIÓN ---

  getOnboardingStatus: async (): Promise<SupplierOnboardingStatus> => {
    const response = await axiosInstance.get<SupplierOnboardingStatus>("/api/onboarding/supplier/status");
    return response.data;
  },

  getProfile: async (): Promise<SupplierOrganization> => {
    const response = await axiosInstance.get<SupplierOrganization>("/api/onboarding/supplier/profile");
    return response.data;
  },

  saveIdentity: async (payload: SaveSupplierIdentityPayload): Promise<SupplierOrganization> => {
    const response = await axiosInstance.post<SupplierOrganization>("/api/onboarding/supplier/identity", payload);
    return response.data;
  },

  saveLegalTax: async (payload: SaveSupplierLegalTaxPayload): Promise<SupplierOrganization> => {
    const response = await axiosInstance.post<SupplierOrganization>("/api/onboarding/supplier/legal-tax", payload);
    return response.data;
  },

  uploadDocument: async (
    documentType: SupplierDocumentType,
    file: File,
    documentNumber?: string,
    expiresAt?: string
  ): Promise<SupplierDocument> => {
    const formData = new FormData();
    formData.append("documentType", documentType);
    formData.append("file", file);
    if (documentNumber) formData.append("documentNumber", documentNumber);
    if (expiresAt) formData.append("expiresAt", expiresAt);

    const response = await axiosInstance.post<SupplierDocument>(
      "/api/onboarding/supplier/documents/upload",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data;
  },

  enableSupplierCapability: async (payload: AdditiveMigrationPayload): Promise<SupplierOrganization> => {
    const response = await axiosInstance.post<SupplierOrganization>(
      "/api/onboarding/supplier/migrate-capability",
      payload
    );
    return response.data;
  },

  // --- MULTI-ALMACÉN ---

  getWarehouses: async (): Promise<SupplierWarehouse[]> => {
    const response = await axiosInstance.get<SupplierWarehouse[]>("/api/onboarding/supplier/warehouses");
    return response.data;
  },

  createWarehouse: async (payload: SaveSupplierWarehousePayload): Promise<SupplierWarehouse> => {
    const response = await axiosInstance.post<SupplierWarehouse>(
      "/api/onboarding/supplier/warehouses",
      payload
    );
    return response.data;
  },

  updateWarehouse: async (warehouseId: number, payload: SaveSupplierWarehousePayload): Promise<SupplierWarehouse> => {
    const response = await axiosInstance.put<SupplierWarehouse>(
      `/api/onboarding/supplier/warehouses/${warehouseId}`,
      payload
    );
    return response.data;
  },

  deleteWarehouse: async (warehouseId: number): Promise<void> => {
    await axiosInstance.delete(`/api/onboarding/supplier/warehouses/${warehouseId}`);
  },

  // --- EQUIPO & RBAC ---

  getTeamMembers: async (): Promise<SupplierMember[]> => {
    const response = await axiosInstance.get<SupplierMember[]>("/api/onboarding/supplier/team");
    return response.data;
  },

  inviteMember: async (payload: InviteSupplierMemberPayload): Promise<SupplierMember> => {
    const response = await axiosInstance.post<SupplierMember>(
      "/api/onboarding/supplier/team/invite",
      payload
    );
    return response.data;
  },

  removeMember: async (memberId: number): Promise<void> => {
    await axiosInstance.delete(`/api/onboarding/supplier/team/${memberId}`);
  },

  // --- CATÁLOGO & PRODUCTOS (FASE 2) ---

  getProducts: async (): Promise<MedicalProduct[]> => {
    const response = await axiosInstance.get<MedicalProduct[]>("/api/onboarding/supplier/products");
    return response.data;
  },

  getProduct: async (productId: number): Promise<MedicalProduct> => {
    const response = await axiosInstance.get<MedicalProduct>(`/api/onboarding/supplier/products/${productId}`);
    return response.data;
  },

  createProduct: async (payload: SaveMedicalProductPayload): Promise<MedicalProduct> => {
    const response = await axiosInstance.post<MedicalProduct>("/api/onboarding/supplier/products", payload);
    return response.data;
  },

  updateProduct: async (productId: number, payload: SaveMedicalProductPayload): Promise<MedicalProduct> => {
    const response = await axiosInstance.put<MedicalProduct>(`/api/onboarding/supplier/products/${productId}`, payload);
    return response.data;
  },

  deleteProduct: async (productId: number): Promise<void> => {
    await axiosInstance.delete(`/api/onboarding/supplier/products/${productId}`);
  },

  importProductsCsv: async (file: File): Promise<BulkImportResult> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await axiosInstance.post<BulkImportResult>(
      "/api/onboarding/supplier/products/import-csv",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return response.data;
  },

  // --- TRAZABILIDAD POR LOTES (PRODUCT BATCHES) ---

  getBatches: async (productId?: number, warehouseId?: number): Promise<ProductBatch[]> => {
    let url = "/api/onboarding/supplier/batches";
    const params = new URLSearchParams();
    if (productId) params.append("productId", productId.toString());
    if (warehouseId) params.append("warehouseId", warehouseId.toString());
    if (params.toString()) url += `?${params.toString()}`;

    const response = await axiosInstance.get<ProductBatch[]>(url);
    return response.data;
  },

  createBatch: async (payload: SaveProductBatchPayload): Promise<ProductBatch> => {
    const response = await axiosInstance.post<ProductBatch>("/api/onboarding/supplier/batches", payload);
    return response.data;
  },

  updateBatchStatus: async (batchId: number, status: BatchStatus): Promise<ProductBatch> => {
    const response = await axiosInstance.patch<ProductBatch>(
      `/api/onboarding/supplier/batches/${batchId}/status?status=${status}`
    );
    return response.data;
  },

  // --- MOVIMIENTOS & AUDITORÍA DE INVENTARIO ---

  getMovementsPaged: async (page = 0, size = 30): Promise<{ content: InventoryMovement[]; totalElements: number }> => {
    const response = await axiosInstance.get<{ content: InventoryMovement[]; totalElements: number }>(
      `/api/onboarding/supplier/movements?page=${page}&size=${size}`
    );
    return response.data;
  },

  getMovementsByProduct: async (productId: number): Promise<InventoryMovement[]> => {
    const response = await axiosInstance.get<InventoryMovement[]>(
      `/api/onboarding/supplier/movements/product/${productId}`
    );
    return response.data;
  },

  createInventoryAdjustment: async (payload: InventoryAdjustmentPayload): Promise<InventoryMovement> => {
    const response = await axiosInstance.post<InventoryMovement>(
      "/api/onboarding/supplier/movements/adjustment",
      payload
    );
    return response.data;
  },

  // --- TRANSFERENCIAS INTER-ALMACÉN ---

  getTransfers: async (): Promise<InventoryTransfer[]> => {
    const response = await axiosInstance.get<InventoryTransfer[]>("/api/onboarding/supplier/transfers");
    return response.data;
  },

  requestTransfer: async (payload: CreateInventoryTransferPayload): Promise<InventoryTransfer> => {
    const response = await axiosInstance.post<InventoryTransfer>(
      "/api/onboarding/supplier/transfers/request",
      payload
    );
    return response.data;
  },

  approveTransfer: async (transferId: number): Promise<InventoryTransfer> => {
    const response = await axiosInstance.post<InventoryTransfer>(
      `/api/onboarding/supplier/transfers/${transferId}/approve`
    );
    return response.data;
  },

  receiveTransfer: async (transferId: number): Promise<InventoryTransfer> => {
    const response = await axiosInstance.post<InventoryTransfer>(
      `/api/onboarding/supplier/transfers/${transferId}/receive`
    );
    return response.data;
  },

  cancelTransfer: async (transferId: number): Promise<InventoryTransfer> => {
    const response = await axiosInstance.post<InventoryTransfer>(
      `/api/onboarding/supplier/transfers/${transferId}/cancel`
    );
    return response.data;
  },

  // --- MOTOR DE PRECIOS B2B & ESCALAS POR VOLUMEN (FASE 3) ---

  getPriceTiersByProduct: async (productId: number): Promise<ProductPriceTier[]> => {
    const response = await axiosInstance.get<ProductPriceTier[]>(
      `/api/onboarding/supplier/pricing-tiers/product/${productId}`
    );
    return response.data;
  },

  savePriceTier: async (payload: SavePriceTierPayload): Promise<ProductPriceTier> => {
    const response = await axiosInstance.post<ProductPriceTier>(
      "/api/onboarding/supplier/pricing-tiers",
      payload
    );
    return response.data;
  },

  deletePriceTier: async (tierId: number): Promise<void> => {
    await axiosInstance.delete(`/api/onboarding/supplier/pricing-tiers/${tierId}`);
  },

  // --- COTIZACIONES B2B & RFQ (FASE 3) ---

  getQuotes: async (): Promise<SupplierQuote[]> => {
    const response = await axiosInstance.get<SupplierQuote[]>("/api/onboarding/supplier/quotes");
    return response.data;
  },

  getQuote: async (quoteId: number): Promise<SupplierQuote> => {
    const response = await axiosInstance.get<SupplierQuote>(`/api/onboarding/supplier/quotes/${quoteId}`);
    return response.data;
  },

  createQuote: async (payload: SaveSupplierQuotePayload): Promise<SupplierQuote> => {
    const response = await axiosInstance.post<SupplierQuote>("/api/onboarding/supplier/quotes", payload);
    return response.data;
  },

  sendQuote: async (quoteId: number): Promise<SupplierQuote> => {
    const response = await axiosInstance.post<SupplierQuote>(`/api/onboarding/supplier/quotes/${quoteId}/send`);
    return response.data;
  },

  acceptQuote: async (quoteId: number): Promise<SupplierQuote> => {
    const response = await axiosInstance.post<SupplierQuote>(`/api/onboarding/supplier/quotes/${quoteId}/accept`);
    return response.data;
  },

  convertQuoteToPo: async (quoteId: number): Promise<SupplierPurchaseOrder> => {
    const response = await axiosInstance.post<SupplierPurchaseOrder>(
      `/api/onboarding/supplier/quotes/${quoteId}/convert-to-po`
    );
    return response.data;
  },

  // --- PURCHASE ORDERS B2B (FASE 3) ---

  getPurchaseOrders: async (): Promise<SupplierPurchaseOrder[]> => {
    const response = await axiosInstance.get<SupplierPurchaseOrder[]>("/api/onboarding/supplier/orders");
    return response.data;
  },

  getPurchaseOrder: async (orderId: number): Promise<SupplierPurchaseOrder> => {
    const response = await axiosInstance.get<SupplierPurchaseOrder>(`/api/onboarding/supplier/orders/${orderId}`);
    return response.data;
  },

  updatePurchaseOrderStatus: async (
    orderId: number,
    payload: UpdatePurchaseOrderStatusPayload
  ): Promise<SupplierPurchaseOrder> => {
    const response = await axiosInstance.patch<SupplierPurchaseOrder>(
      `/api/onboarding/supplier/orders/${orderId}/status`,
      payload
    );
    return response.data;
  },

  // --- DIRECTORIO DE PROVEEDORES CLÍNICOS (INVENTARIO DE CONSULTORIO) ---

  getSuppliers: async (page = 0, size = 100): Promise<{ content: Array<{ id: number; name: string; contactName?: string; phone?: string; email?: string }>; totalElements: number }> => {
    const response = await axiosInstance.get<{ content: Array<{ id: number; name: string; contactName?: string; phone?: string; email?: string }>; totalElements: number }>(
      `/api/inventory/suppliers?page=${page}&size=${size}`
    );
    return response.data;
  },

  createSupplier: async (data: any): Promise<any> => {
    const response = await axiosInstance.post("/api/inventory/suppliers", data);
    return response.data;
  },

  updateSupplier: async (id: number, data: any): Promise<any> => {
    const response = await axiosInstance.put(`/api/inventory/suppliers/${id}`, data);
    return response.data;
  },

  deleteSupplier: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/api/inventory/suppliers/${id}`);
  },
};
