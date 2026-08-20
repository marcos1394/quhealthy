import axiosInstance from "@/lib/axios";
import {
  FoundationProgram,
  FoundationBeneficiary,
  FoundationProgramEnrollment,
  FoundationStatsSummary,
  FoundationVoucher,
  VoucherStats,
  BeneficiaryDocument,
  HealthDataSharing,
  CaregiverLink,
  FoundationCampaign,
  CampaignScreeningRecord,
  CampaignStats,
  SocialBiMetrics,
  TransparencyReport,
  CreateBeneficiaryPayload,
  CreateProgramPayload,
  CreateVoucherPayload,
  RedeemVoucherPayload,
  RequestDocumentPayload,
  ReviewDocumentPayload,
  CreateDataSharingPayload,
  CreateCaregiverLinkPayload,
  CreateCampaignPayload,
  CreateScreeningRecordPayload,
} from "@/types/foundation";

export const foundationService = {
  // --- PROGRAMAS ASISTENCIALES ---

  getPrograms: async (): Promise<FoundationProgram[]> => {
    const response = await axiosInstance.get<FoundationProgram[]>("/api/onboarding/foundation/programs");
    return response.data;
  },

  getProgramsPaged: async (
    status: string = "ALL",
    page: number = 0,
    size: number = 20
  ): Promise<{ content: FoundationProgram[]; totalElements: number }> => {
    const response = await axiosInstance.get<{ content: FoundationProgram[]; totalElements: number }>(
      `/api/onboarding/foundation/programs/paged?status=${status}&page=${page}&size=${size}`
    );
    return response.data;
  },

  getProgramById: async (id: number): Promise<FoundationProgram> => {
    const response = await axiosInstance.get<FoundationProgram>(`/api/onboarding/foundation/programs/${id}`);
    return response.data;
  },

  createProgram: async (payload: CreateProgramPayload): Promise<FoundationProgram> => {
    const response = await axiosInstance.post<FoundationProgram>("/api/onboarding/foundation/programs", payload);
    return response.data;
  },

  updateProgram: async (id: number, payload: Partial<CreateProgramPayload>): Promise<FoundationProgram> => {
    const response = await axiosInstance.put<FoundationProgram>(`/api/onboarding/foundation/programs/${id}`, payload);
    return response.data;
  },

  deleteProgram: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/api/onboarding/foundation/programs/${id}`);
  },

  // --- PADRÓN DE BENEFICIARIOS ---

  getBeneficiaries: async (
    search?: string,
    status: string = "ALL",
    page: number = 0,
    size: number = 20
  ): Promise<{ content: FoundationBeneficiary[]; totalElements: number }> => {
    let url = `/api/onboarding/foundation/beneficiaries?status=${status}&page=${page}&size=${size}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    const response = await axiosInstance.get<{ content: FoundationBeneficiary[]; totalElements: number }>(url);
    return response.data;
  },

  getBeneficiaryById: async (id: number): Promise<FoundationBeneficiary> => {
    const response = await axiosInstance.get<FoundationBeneficiary>(`/api/onboarding/foundation/beneficiaries/${id}`);
    return response.data;
  },

  createBeneficiary: async (payload: CreateBeneficiaryPayload): Promise<FoundationBeneficiary> => {
    const response = await axiosInstance.post<FoundationBeneficiary>("/api/onboarding/foundation/beneficiaries", payload);
    return response.data;
  },

  updateBeneficiary: async (id: number, payload: Partial<CreateBeneficiaryPayload>): Promise<FoundationBeneficiary> => {
    const response = await axiosInstance.put<FoundationBeneficiary>(`/api/onboarding/foundation/beneficiaries/${id}`, payload);
    return response.data;
  },

  enrollBeneficiary: async (
    beneficiaryId: number,
    programId: number,
    approvedSubsidyCap?: number,
    notes?: string
  ): Promise<FoundationProgramEnrollment> => {
    const response = await axiosInstance.post<FoundationProgramEnrollment>("/api/onboarding/foundation/beneficiaries/enroll", {
      beneficiaryId,
      programId,
      approvedSubsidyCap,
      notes,
    });
    return response.data;
  },

  // --- SUBSIDIOS & VOUCHERS ADMINISTRATIVOS ---

  getVouchers: async (
    status: string = "ALL",
    page: number = 0,
    size: number = 20
  ): Promise<{ content: FoundationVoucher[]; totalElements: number }> => {
    const response = await axiosInstance.get<{ content: FoundationVoucher[]; totalElements: number }>(
      `/api/onboarding/foundation/vouchers?status=${status}&page=${page}&size=${size}`
    );
    return response.data;
  },

  createVoucher: async (payload: CreateVoucherPayload): Promise<FoundationVoucher> => {
    const response = await axiosInstance.post<FoundationVoucher>("/api/onboarding/foundation/vouchers", payload);
    return response.data;
  },

  redeemVoucher: async (voucherId: number, payload: RedeemVoucherPayload): Promise<FoundationVoucher> => {
    const response = await axiosInstance.post<FoundationVoucher>(`/api/onboarding/foundation/vouchers/${voucherId}/redeem`, payload);
    return response.data;
  },

  cancelVoucher: async (voucherId: number): Promise<void> => {
    await axiosInstance.delete(`/api/onboarding/foundation/vouchers/${voucherId}`);
  },

  getVoucherStats: async (): Promise<VoucherStats> => {
    const response = await axiosInstance.get<VoucherStats>("/api/onboarding/foundation/vouchers/stats/summary");
    return response.data;
  },

  // --- BANDEJA DE VALIDACIÓN DOCUMENTAL ---

  getDocuments: async (
    status: string = "ALL",
    page: number = 0,
    size: number = 20
  ): Promise<{ content: BeneficiaryDocument[]; totalElements: number }> => {
    const response = await axiosInstance.get<{ content: BeneficiaryDocument[]; totalElements: number }>(
      `/api/onboarding/foundation/documents?status=${status}&page=${page}&size=${size}`
    );
    return response.data;
  },

  getDocumentsByBeneficiary: async (beneficiaryId: number): Promise<BeneficiaryDocument[]> => {
    const response = await axiosInstance.get<BeneficiaryDocument[]>(
      `/api/onboarding/foundation/documents/beneficiary/${beneficiaryId}`
    );
    return response.data;
  },

  requestDocument: async (payload: RequestDocumentPayload): Promise<BeneficiaryDocument> => {
    const response = await axiosInstance.post<BeneficiaryDocument>("/api/onboarding/foundation/documents/request", payload);
    return response.data;
  },

  reviewDocument: async (documentId: number, payload: ReviewDocumentPayload): Promise<BeneficiaryDocument> => {
    const response = await axiosInstance.put<BeneficiaryDocument>(
      `/api/onboarding/foundation/documents/${documentId}/review`,
      payload
    );
    return response.data;
  },

  // --- HEALTH DATA SHARING & CAREGIVERS ---

  getDataSharingByBeneficiary: async (beneficiaryId: number): Promise<HealthDataSharing[]> => {
    const response = await axiosInstance.get<HealthDataSharing[]>(
      `/api/onboarding/foundation/data-sharing/beneficiary/${beneficiaryId}`
    );
    return response.data;
  },

  createDataSharing: async (payload: CreateDataSharingPayload): Promise<HealthDataSharing> => {
    const response = await axiosInstance.post<HealthDataSharing>("/api/onboarding/foundation/data-sharing", payload);
    return response.data;
  },

  revokeDataSharing: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/api/onboarding/foundation/data-sharing/${id}`);
  },

  getCaregiversByBeneficiary: async (beneficiaryId: number): Promise<CaregiverLink[]> => {
    const response = await axiosInstance.get<CaregiverLink[]>(
      `/api/onboarding/foundation/caregivers/beneficiary/${beneficiaryId}`
    );
    return response.data;
  },

  createCaregiverLink: async (payload: CreateCaregiverLinkPayload): Promise<CaregiverLink> => {
    const response = await axiosInstance.post<CaregiverLink>("/api/onboarding/foundation/caregivers", payload);
    return response.data;
  },

  deleteCaregiverLink: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/api/onboarding/foundation/caregivers/${id}`);
  },

  // --- CAMPAÑAS & JORNADAS DE SALUD ---

  getCampaigns: async (
    status: string = "ALL",
    page: number = 0,
    size: number = 20
  ): Promise<{ content: FoundationCampaign[]; totalElements: number }> => {
    const response = await axiosInstance.get<{ content: FoundationCampaign[]; totalElements: number }>(
      `/api/onboarding/foundation/campaigns?status=${status}&page=${page}&size=${size}`
    );
    return response.data;
  },

  createCampaign: async (payload: CreateCampaignPayload): Promise<FoundationCampaign> => {
    const response = await axiosInstance.post<FoundationCampaign>("/api/onboarding/foundation/campaigns", payload);
    return response.data;
  },

  getScreeningsByCampaign: async (
    campaignId: number,
    page: number = 0,
    size: number = 50
  ): Promise<{ content: CampaignScreeningRecord[]; totalElements: number }> => {
    const response = await axiosInstance.get<{ content: CampaignScreeningRecord[]; totalElements: number }>(
      `/api/onboarding/foundation/campaigns/${campaignId}/screenings?page=${page}&size=${size}`
    );
    return response.data;
  },

  createScreeningRecord: async (payload: CreateScreeningRecordPayload): Promise<CampaignScreeningRecord> => {
    const response = await axiosInstance.post<CampaignScreeningRecord>(
      "/api/onboarding/foundation/campaigns/screenings",
      payload
    );
    return response.data;
  },

  generateAiScreeningSummary: async (
    screeningType: string,
    measurements: Record<string, any>,
    observations?: string,
    attendeeName?: string
  ): Promise<string> => {
    const response = await axiosInstance.post<{ summary: string }>("/api/onboarding/foundation/campaigns/ai-summary", {
      screeningType,
      measurements,
      observations,
      attendeeName,
    });
    return response.data.summary;
  },

  getCampaignStats: async (): Promise<CampaignStats> => {
    const response = await axiosInstance.get<CampaignStats>("/api/onboarding/foundation/campaigns/stats/summary");
    return response.data;
  },

  // --- SOCIAL BI & TRANSPARENCIA ---

  getSocialBiMetrics: async (): Promise<SocialBiMetrics> => {
    const response = await axiosInstance.get<SocialBiMetrics>("/api/onboarding/foundation/analytics/social-bi");
    return response.data;
  },

  getTransparencyReport: async (period: string = "Q1-2026"): Promise<TransparencyReport> => {
    const response = await axiosInstance.get<TransparencyReport>(`/api/onboarding/foundation/reports/transparency?period=${period}`);
    return response.data;
  },

  // --- STATS & RESUMEN EJECUTIVO ---

  getStatsSummary: async (): Promise<FoundationStatsSummary> => {
    const response = await axiosInstance.get<FoundationStatsSummary>("/api/onboarding/foundation/beneficiaries/stats/summary");
    return response.data;
  },
};
