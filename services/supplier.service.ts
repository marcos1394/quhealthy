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
