// services/laboratory-onboarding.service.ts

import axiosInstance from "@/lib/axios";
import {
  LaboratoryOnboardingStatusResponse,
  LaboratoryOrganizationDto,
  SaveLaboratoryIdentityPayload,
  SaveLaboratorySanitaryPayload,
  SaveLaboratoryBranchPayload,
  SaveLaboratoryCatalogPayload,
  LaboratoryDocumentType,
} from "@/types/laboratory";

export const laboratoryOnboardingService = {
  async getStatus(): Promise<LaboratoryOnboardingStatusResponse> {
    const response = await axiosInstance.get("/api/onboarding/laboratory/status");
    return response.data;
  },

  async getProfile(): Promise<LaboratoryOrganizationDto> {
    const response = await axiosInstance.get("/api/onboarding/laboratory/profile");
    return response.data;
  },

  async saveIdentity(payload: SaveLaboratoryIdentityPayload): Promise<LaboratoryOrganizationDto> {
    const response = await axiosInstance.post("/api/onboarding/laboratory/identity", payload);
    return response.data;
  },

  async saveSanitary(payload: SaveLaboratorySanitaryPayload): Promise<any> {
    const response = await axiosInstance.post("/api/onboarding/laboratory/sanitary", payload);
    return response.data;
  },

  async saveBranch(payload: SaveLaboratoryBranchPayload): Promise<any> {
    const response = await axiosInstance.post("/api/onboarding/laboratory/branch", payload);
    return response.data;
  },

  async saveCatalog(payload: SaveLaboratoryCatalogPayload): Promise<any> {
    const response = await axiosInstance.post("/api/onboarding/laboratory/catalog", payload);
    return response.data;
  },

  async uploadDocument(documentType: LaboratoryDocumentType, file: File, documentNumber?: string): Promise<any> {
    const formData = new FormData();
    formData.append("documentType", documentType);
    if (documentNumber) {
      formData.append("documentNumber", documentNumber);
    }
    formData.append("file", file);

    const response = await axiosInstance.post(
      "/api/onboarding/laboratory/documents/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  async skipStep(stepNumber: number, reason?: string, skippedFields?: string[]): Promise<any> {
    const response = await axiosInstance.post(
      `/api/onboarding/laboratory/skip-step/${stepNumber}`,
      {
        stepNumber,
        reason: reason || "USER_DEFERRED",
        skippedFields: skippedFields || [],
      }
    );
    return response.data;
  },

  async completeOnboarding(): Promise<LaboratoryOnboardingStatusResponse> {
    const response = await axiosInstance.post("/api/onboarding/laboratory/complete");
    return response.data;
  },
};
