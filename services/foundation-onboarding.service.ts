// services/foundation-onboarding.service.ts

import axiosInstance from "@/lib/axios";
import {
  FoundationIdentityPayload,
  FoundationLegalTaxPayload,
  FoundationOnboardingStatusResponse,
  FoundationProfile,
  FoundationProgram,
  FoundationProgramPayload,
  FoundationStaffMember,
  FoundationTeamInvitePayload,
  FoundationDocument,
} from "@/types/foundation";

export const foundationOnboardingService = {
  async getStatus(): Promise<FoundationOnboardingStatusResponse> {
    const response = await axiosInstance.get("/api/onboarding/foundation/status");
    return response.data;
  },

  async saveIdentity(payload: FoundationIdentityPayload): Promise<FoundationProfile> {
    const response = await axiosInstance.post("/api/onboarding/foundation/identity", payload);
    return response.data;
  },

  async saveLegalTax(payload: FoundationLegalTaxPayload): Promise<FoundationProfile> {
    const response = await axiosInstance.post("/api/onboarding/foundation/legal-tax", payload);
    return response.data;
  },

  async uploadDocument(documentType: string, file: File): Promise<FoundationDocument> {
    const formData = new FormData();
    formData.append("documentType", documentType);
    formData.append("file", file);

    const response = await axiosInstance.post(
      "/api/onboarding/foundation/documents/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  async deleteDocument(documentId: number): Promise<{ message: string }> {
    const response = await axiosInstance.delete(
      `/api/onboarding/foundation/documents/${documentId}`
    );
    return response.data;
  },

  async saveTeam(payload: FoundationTeamInvitePayload): Promise<FoundationStaffMember[]> {
    const response = await axiosInstance.post("/api/onboarding/foundation/team", payload);
    return response.data;
  },

  async saveInitialProgram(payload: FoundationProgramPayload): Promise<FoundationProgram> {
    const response = await axiosInstance.post(
      "/api/onboarding/foundation/initial-program",
      payload
    );
    return response.data;
  },

  async completeOnboarding(): Promise<FoundationProfile> {
    const response = await axiosInstance.post("/api/onboarding/foundation/complete");
    return response.data;
  },
};
