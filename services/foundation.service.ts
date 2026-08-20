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
    try {
      const response = await axiosInstance.get<FoundationProgram[]>("/api/foundation/programs");
      return response.data;
    } catch {
      return [
        {
          id: 1,
          foundationId: 10,
          name: "Programa de Apoyo a Pacientes Trasplantados",
          description: "Subsidio de medicamentos inmunosupresores, consultas de nefrología y laboratorios de química sanguínea.",
          cause: "RENAL",
          supportTypes: ["MEDICATION", "CONSULTATION", "LABS"],
          requiredDocuments: ["CURP", "SOCIOECONOMIC_STUDY", "MEDICAL_SUMMARY"],
          targetBeneficiariesCount: 80,
          activeBeneficiariesCount: 42,
          allocatedBudget: 250000,
          disbursedBudget: 142000,
          status: "ACTIVE",
          createdAt: "2026-01-10T10:00:00Z",
        },
        {
          id: 2,
          foundationId: 10,
          name: "Campaña de Salud Visual & Cirugía de Cataratas",
          description: "Valoración oftalmológica, estudios de biometría ocular y co-financiamiento de cirugía facoemulsificación.",
          cause: "VISUAL",
          supportTypes: ["CONSULTATION", "SURGERY", "LABS"],
          requiredDocuments: ["CURP", "SOCIOECONOMIC_STUDY"],
          targetBeneficiariesCount: 120,
          activeBeneficiariesCount: 68,
          allocatedBudget: 180000,
          disbursedBudget: 95400,
          status: "ACTIVE",
          createdAt: "2026-02-01T12:00:00Z",
        },
        {
          id: 3,
          foundationId: 10,
          name: "Asistencia Oncológica Pediátrica",
          description: "Acompañamiento a niños con cáncer y subsidio de estudios de imagen y nutrición clínica.",
          cause: "ONCOLOGY",
          supportTypes: ["CONSULTATION", "NUTRITION", "PSYCHOLOGY", "MEDICATION"],
          requiredDocuments: ["CURP", "SOCIOECONOMIC_STUDY", "MEDICAL_SUMMARY", "INCOME_PROOF"],
          targetBeneficiariesCount: 50,
          activeBeneficiariesCount: 26,
          allocatedBudget: 320000,
          disbursedBudget: 210000,
          status: "ACTIVE",
          createdAt: "2026-03-05T09:30:00Z",
        },
      ];
    }
  },

  getProgramsPaged: async (
    status: string = "ALL",
    page: number = 0,
    size: number = 20
  ): Promise<{ content: FoundationProgram[]; totalElements: number }> => {
    try {
      const response = await axiosInstance.get<{ content: FoundationProgram[]; totalElements: number }>(
        `/api/foundation/programs/paged?status=${status}&page=${page}&size=${size}`
      );
      return response.data;
    } catch {
      const all = await foundationService.getPrograms();
      const filtered = status === "ALL" ? all : all.filter((p) => p.status === status);
      return { content: filtered, totalElements: filtered.length };
    }
  },

  getProgramById: async (id: number): Promise<FoundationProgram> => {
    const response = await axiosInstance.get<FoundationProgram>(`/api/foundation/programs/${id}`);
    return response.data;
  },

  createProgram: async (payload: CreateProgramPayload): Promise<FoundationProgram> => {
    const response = await axiosInstance.post<FoundationProgram>("/api/foundation/programs", payload);
    return response.data;
  },

  updateProgram: async (id: number, payload: Partial<CreateProgramPayload>): Promise<FoundationProgram> => {
    const response = await axiosInstance.put<FoundationProgram>(`/api/foundation/programs/${id}`, payload);
    return response.data;
  },

  deleteProgram: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/api/foundation/programs/${id}`);
  },

  // --- PADRÓN DE BENEFICIARIOS ---

  getBeneficiaries: async (
    search?: string,
    status: string = "ALL",
    page: number = 0,
    size: number = 20
  ): Promise<{ content: FoundationBeneficiary[]; totalElements: number }> => {
    try {
      let url = `/api/foundation/beneficiaries?status=${status}&page=${page}&size=${size}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      const response = await axiosInstance.get<{ content: FoundationBeneficiary[]; totalElements: number }>(url);
      return response.data;
    } catch {
      return {
        content: [
          {
            id: 101,
            foundationId: 10,
            curp: "GARM880415HDFRRL01",
            firstName: "Manuel",
            lastName: "García Ramos",
            fullName: "Manuel García Ramos",
            gender: "MALE",
            birthDate: "1988-04-15",
            email: "m.garcia@gmail.com",
            phone: "+52 668 123 4567",
            vulnerabilityLevel: "HIGH",
            socioEconomicLevel: "D",
            city: "Los Mochis",
            state: "Sinaloa",
            diagnosisSummary: "Enfermedad Renal Crónica Estadio 5 post-trasplante renal (2 años)",
            status: "ACTIVE",
            origin: "FOUNDATION_MANUAL",
            notes: "Excelente apego. Requiere apoyo mensual para Tacrolimus y laboratorios.",
            enrolledProgramIds: [1],
            createdAt: "2026-01-15T11:00:00Z",
          },
          {
            id: 102,
            foundationId: 10,
            curp: "LOPE721104MDFNLR09",
            firstName: "Esperanza",
            lastName: "López Vega",
            fullName: "Esperanza López Vega",
            gender: "FEMALE",
            birthDate: "1972-11-04",
            email: "esperanza.lopez@yahoo.com",
            phone: "+52 667 987 6543",
            vulnerabilityLevel: "MEDIUM",
            socioEconomicLevel: "D_PLUS",
            city: "Culiacán",
            state: "Sinaloa",
            diagnosisSummary: "Catarata bilateral senil con agudeza visual 20/200",
            status: "ACTIVE",
            origin: "FOUNDATION_MANUAL",
            notes: "Candidata a facoemulsificación en ojo derecho.",
            enrolledProgramIds: [2],
            createdAt: "2026-02-10T15:20:00Z",
          },
          {
            id: 103,
            foundationId: 10,
            curp: "ROSE150820HDFLNS03",
            firstName: "Emiliano",
            lastName: "Rosas Beltrán",
            fullName: "Emiliano Rosas Beltrán",
            gender: "MALE",
            birthDate: "2015-08-20",
            phone: "+52 554 321 0987",
            vulnerabilityLevel: "CRITICAL",
            socioEconomicLevel: "E",
            city: "Guasave",
            state: "Sinaloa",
            diagnosisSummary: "Leucemia Linfoblástica Aguda en fase de mantenimiento",
            status: "ACTIVE",
            origin: "PATIENT_SELF",
            notes: "En seguimiento pediátrico y soporte nutricional.",
            enrolledProgramIds: [3],
            createdAt: "2026-03-08T10:15:00Z",
          },
        ],
        totalElements: 3,
      };
    }
  },

  getBeneficiaryById: async (id: number): Promise<FoundationBeneficiary> => {
    const response = await axiosInstance.get<FoundationBeneficiary>(`/api/foundation/beneficiaries/${id}`);
    return response.data;
  },

  createBeneficiary: async (payload: CreateBeneficiaryPayload): Promise<FoundationBeneficiary> => {
    const response = await axiosInstance.post<FoundationBeneficiary>("/api/foundation/beneficiaries", payload);
    return response.data;
  },

  updateBeneficiary: async (id: number, payload: Partial<CreateBeneficiaryPayload>): Promise<FoundationBeneficiary> => {
    const response = await axiosInstance.put<FoundationBeneficiary>(`/api/foundation/beneficiaries/${id}`, payload);
    return response.data;
  },

  enrollBeneficiary: async (
    beneficiaryId: number,
    programId: number,
    approvedSubsidyCap?: number,
    notes?: string
  ): Promise<FoundationProgramEnrollment> => {
    const response = await axiosInstance.post<FoundationProgramEnrollment>("/api/foundation/beneficiaries/enroll", {
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
    try {
      const response = await axiosInstance.get<{ content: FoundationVoucher[]; totalElements: number }>(
        `/api/foundation/vouchers?status=${status}&page=${page}&size=${size}`
      );
      return response.data;
    } catch {
      return {
        content: [
          {
            id: 1,
            voucherCode: "VCH-2026-8F2B1C",
            foundationId: 10,
            programId: 1,
            programName: "Programa de Apoyo a Pacientes Trasplantados",
            beneficiaryId: 101,
            beneficiaryName: "Manuel García Ramos",
            beneficiaryCurp: "GARM880415HDFRRL01",
            supportType: "MEDICATION",
            authorizedAmount: 3200,
            redeemedAmount: 3200,
            remainingAmount: 0,
            subsidyPercentage: 100,
            status: "REDEEMED",
            prescriptionFolio: "REC-2026-0941",
            evidenceUrl: "/api/storage/receipt_0941.pdf",
            notes: "Subsidio mensual de Tacrolimus y Micofenolato.",
            issuedAt: "2026-03-01T09:00:00Z",
            redeemedAt: "2026-03-02T14:30:00Z",
            expiresAt: "2026-06-01T23:59:59Z",
            createdAt: "2026-03-01T09:00:00Z",
          },
          {
            id: 2,
            voucherCode: "VCH-2026-3A7D9E",
            foundationId: 10,
            programId: 2,
            programName: "Campaña de Salud Visual & Cirugía de Cataratas",
            beneficiaryId: 102,
            beneficiaryName: "Esperanza López Vega",
            beneficiaryCurp: "LOPE721104MDFNLR09",
            supportType: "SURGERY",
            authorizedAmount: 8500,
            redeemedAmount: 0,
            remainingAmount: 8500,
            subsidyPercentage: 70,
            status: "ACTIVE",
            notes: "Co-financiamiento del 70% en procedimiento quirúrgico de facoemulsificación.",
            issuedAt: "2026-03-10T11:00:00Z",
            expiresAt: "2026-06-10T23:59:59Z",
            createdAt: "2026-03-10T11:00:00Z",
          },
        ],
        totalElements: 2,
      };
    }
  },

  createVoucher: async (payload: CreateVoucherPayload): Promise<FoundationVoucher> => {
    const response = await axiosInstance.post<FoundationVoucher>("/api/foundation/vouchers", payload);
    return response.data;
  },

  redeemVoucher: async (voucherId: number, payload: RedeemVoucherPayload): Promise<FoundationVoucher> => {
    const response = await axiosInstance.post<FoundationVoucher>(`/api/foundation/vouchers/${voucherId}/redeem`, payload);
    return response.data;
  },

  cancelVoucher: async (voucherId: number): Promise<void> => {
    await axiosInstance.delete(`/api/foundation/vouchers/${voucherId}`);
  },

  getVoucherStats: async (): Promise<VoucherStats> => {
    try {
      const response = await axiosInstance.get<VoucherStats>("/api/foundation/vouchers/stats/summary");
      return response.data;
    } catch {
      return {
        totalVouchers: 84,
        activeVouchers: 28,
        redeemedVouchers: 56,
        totalAuthorizedAmount: 342000,
        totalRedeemedAmount: 228500,
        activeRemainingAmount: 113500,
      };
    }
  },

  // --- BANDEJA DE VALIDACIÓN DOCUMENTAL ---

  getDocuments: async (
    status: string = "ALL",
    page: number = 0,
    size: number = 20
  ): Promise<{ content: BeneficiaryDocument[]; totalElements: number }> => {
    try {
      const response = await axiosInstance.get<{ content: BeneficiaryDocument[]; totalElements: number }>(
        `/api/foundation/documents?status=${status}&page=${page}&size=${size}`
      );
      return response.data;
    } catch {
      return {
        content: [
          {
            id: 1,
            foundationId: 10,
            beneficiaryId: 101,
            beneficiaryName: "Manuel García Ramos",
            beneficiaryCurp: "GARM880415HDFRRL01",
            programId: 1,
            documentType: "SOCIOECONOMIC_STUDY",
            title: "Estudio Socioeconómico Integral 2026",
            fileName: "estudio_socioeconomico_garcia.pdf",
            fileUrl: "/api/storage/estudio_socioeconomico_garcia.pdf",
            contentType: "application/pdf",
            fileSizeBytes: 1450000,
            verificationStatus: "APPROVED",
            reviewNotes: "Familia de 4 integrantes, ingreso familiar menor a 2 salarios mínimos.",
            uploadedAt: "2026-01-16T14:20:00Z",
            reviewedAt: "2026-01-17T09:15:00Z",
          },
        ],
        totalElements: 1,
      };
    }
  },

  getDocumentsByBeneficiary: async (beneficiaryId: number): Promise<BeneficiaryDocument[]> => {
    try {
      const response = await axiosInstance.get<BeneficiaryDocument[]>(
        `/api/foundation/documents/beneficiary/${beneficiaryId}`
      );
      return response.data;
    } catch {
      const all = await foundationService.getDocuments();
      return all.content.filter((d) => d.beneficiaryId === beneficiaryId);
    }
  },

  requestDocument: async (payload: RequestDocumentPayload): Promise<BeneficiaryDocument> => {
    const response = await axiosInstance.post<BeneficiaryDocument>("/api/foundation/documents/request", payload);
    return response.data;
  },

  reviewDocument: async (documentId: number, payload: ReviewDocumentPayload): Promise<BeneficiaryDocument> => {
    const response = await axiosInstance.put<BeneficiaryDocument>(
      `/api/foundation/documents/${documentId}/review`,
      payload
    );
    return response.data;
  },

  // --- HEALTH DATA SHARING & CAREGIVERS ---

  getDataSharingByBeneficiary: async (beneficiaryId: number): Promise<HealthDataSharing[]> => {
    try {
      const response = await axiosInstance.get<HealthDataSharing[]>(
        `/api/foundation/data-sharing/beneficiary/${beneficiaryId}`
      );
      return response.data;
    } catch {
      return [
        {
          id: 1,
          foundationId: 10,
          beneficiaryId: 101,
          beneficiaryName: "Manuel García Ramos",
          beneficiaryCurp: "GARM880415HDFRRL01",
          programId: 1,
          programName: "Programa de Apoyo a Pacientes Trasplantados",
          authorizedScopes: ["LAB_RESULTS", "PRESCRIPTIONS"],
          purpose: "Monitoreo de niveles séricos de Tacrolimus y función renal post-trasplante",
          validFrom: "2026-01-15T00:00:00Z",
          validTo: "2026-04-15T23:59:59Z",
          isRevoked: false,
          status: "ACTIVE",
          createdAt: "2026-01-15T11:00:00Z",
        },
      ];
    }
  },

  createDataSharing: async (payload: CreateDataSharingPayload): Promise<HealthDataSharing> => {
    const response = await axiosInstance.post<HealthDataSharing>("/api/foundation/data-sharing", payload);
    return response.data;
  },

  revokeDataSharing: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/api/foundation/data-sharing/${id}`);
  },

  getCaregiversByBeneficiary: async (beneficiaryId: number): Promise<CaregiverLink[]> => {
    try {
      const response = await axiosInstance.get<CaregiverLink[]>(
        `/api/foundation/caregivers/beneficiary/${beneficiaryId}`
      );
      return response.data;
    } catch {
      return [
        {
          id: 1,
          beneficiaryId: 101,
          caregiverName: "María Ramos de García",
          caregiverPhone: "+52 668 555 4321",
          caregiverEmail: "m.ramos@gmail.com",
          relationship: "CONYUGE",
          caregiverRole: "AUTHORIZED_CAREGIVER",
          permissions: ["RECEIVE_ALERTS", "LOG_MEDICATIONS", "MANAGE_APPOINTMENTS"],
          isVerified: true,
          createdAt: "2026-01-15T11:30:00Z",
        },
      ];
    }
  },

  createCaregiverLink: async (payload: CreateCaregiverLinkPayload): Promise<CaregiverLink> => {
    const response = await axiosInstance.post<CaregiverLink>("/api/foundation/caregivers", payload);
    return response.data;
  },

  deleteCaregiverLink: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/api/foundation/caregivers/${id}`);
  },

  // --- CAMPAÑAS & JORNADAS DE SALUD ---

  getCampaigns: async (
    status: string = "ALL",
    page: number = 0,
    size: number = 20
  ): Promise<{ content: FoundationCampaign[]; totalElements: number }> => {
    try {
      const response = await axiosInstance.get<{ content: FoundationCampaign[]; totalElements: number }>(
        `/api/foundation/campaigns?status=${status}&page=${page}&size=${size}`
      );
      return response.data;
    } catch {
      return {
        content: [
          {
            id: 1,
            foundationId: 10,
            programId: 2,
            programName: "Campaña de Salud Visual & Cirugía de Cataratas",
            name: "Jornada Comunitaria de Salud Visual Los Mochis 2026",
            cause: "VISUAL",
            description: "Exámenes de agudeza visual, detección de cataratas, retinopatía diabética y glaucoma.",
            targetAttendees: 200,
            screenedAttendees: 142,
            startDate: "2026-03-01",
            endDate: "2026-03-31",
            locationCity: "Los Mochis",
            locationAddress: "Centro Comunitario Siglo XXI, Calle Degollado #450",
            status: "IN_PROGRESS",
            createdAt: "2026-02-15T10:00:00Z",
          },
          {
            id: 2,
            foundationId: 10,
            programId: 1,
            programName: "Programa de Apoyo a Pacientes Trasplantados",
            name: "Campaña de Detección Temprana de Enfermedad Renal & Diabetes",
            cause: "RENAL",
            description: "Tamizaje de microalbuminuria, glucosa capilar y toma de presión arterial en población vulnerable.",
            targetAttendees: 150,
            screenedAttendees: 98,
            startDate: "2026-03-10",
            endDate: "2026-04-10",
            locationCity: "Guasave",
            locationAddress: "Plaza Central Cívica, Av. Madero s/n",
            status: "IN_PROGRESS",
            createdAt: "2026-02-20T14:30:00Z",
          },
          {
            id: 3,
            foundationId: 10,
            name: "Jornada Rosa: Mastografía y Detección de Cáncer de Mama",
            cause: "ONCOLOGY",
            description: "Estudios de mastografía digital y ultrasonido mamario con canalización a oncología.",
            targetAttendees: 100,
            screenedAttendees: 0,
            startDate: "2026-04-01",
            endDate: "2026-04-15",
            locationCity: "Culiacán",
            locationAddress: "Hospital General de Culiacán, Módulo Asistencial",
            status: "UPCOMING",
            createdAt: "2026-03-01T09:00:00Z",
          },
        ],
        totalElements: 3,
      };
    }
  },

  createCampaign: async (payload: CreateCampaignPayload): Promise<FoundationCampaign> => {
    const response = await axiosInstance.post<FoundationCampaign>("/api/foundation/campaigns", payload);
    return response.data;
  },

  getScreeningsByCampaign: async (
    campaignId: number,
    page: number = 0,
    size: number = 50
  ): Promise<{ content: CampaignScreeningRecord[]; totalElements: number }> => {
    try {
      const response = await axiosInstance.get<{ content: CampaignScreeningRecord[]; totalElements: number }>(
        `/api/foundation/campaigns/${campaignId}/screenings?page=${page}&size=${size}`
      );
      return response.data;
    } catch {
      return {
        content: [
          {
            id: 1,
            campaignId: 1,
            campaignName: "Jornada Comunitaria de Salud Visual Los Mochis 2026",
            foundationId: 10,
            beneficiaryId: 102,
            attendeeName: "Esperanza López Vega",
            attendeeCurp: "LOPE721104MDFNLR09",
            attendeePhone: "+52 667 987 6543",
            screeningType: "VISUAL_ACUITY",
            measurements: { visual_od: "20/200", visual_oi: "20/70", intraocular_pressure_mmhg: 16 },
            riskLevel: "HIGH_RISK",
            observations: "Opacidad significativa del cristalino en ojo derecho, compatible con catarata madura.",
            aiSummary: "📋 Síntesis de Tamizaje (IA de Acompañamiento):\n• Agudeza visual OD 20/200 y OI 20/70. Presión intraocular normal (16 mmHg).\n• Canalizada al Programa de Salud Visual para facoemulsificación con subsidio del 70%.\n• Nota: Resumen para orientación médica.",
            referredToProgramId: 2,
            screenedByStaffName: "Opt. David Valenzuela",
            screenedAt: "2026-03-05T11:30:00Z",
          },
        ],
        totalElements: 1,
      };
    }
  },

  createScreeningRecord: async (payload: CreateScreeningRecordPayload): Promise<CampaignScreeningRecord> => {
    const response = await axiosInstance.post<CampaignScreeningRecord>(
      "/api/foundation/campaigns/screenings",
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
    try {
      const response = await axiosInstance.post<{ summary: string }>("/api/foundation/campaigns/ai-summary", {
        screeningType,
        measurements,
        observations,
        attendeeName,
      });
      return response.data.summary;
    } catch {
      return `📋 Síntesis de Tamizaje (IA de Acompañamiento):\n• Tipo de Tamizaje: ${screeningType}\n• Parámetros Registrados: ${JSON.stringify(
        measurements
      )}\n• Observaciones: ${observations || "Sin observaciones adicionales."}\n• Nota: Este resumen no constituye un diagnóstico clínico.`;
    }
  },

  getCampaignStats: async (): Promise<CampaignStats> => {
    try {
      const response = await axiosInstance.get<CampaignStats>("/api/foundation/campaigns/stats/summary");
      return response.data;
    } catch {
      return {
        totalCampaigns: 5,
        activeCampaigns: 2,
        completedCampaigns: 2,
        totalScreenedAttendees: 240,
        totalTargetAttendees: 450,
      };
    }
  },

  // --- STATS & RESUMEN EJECUTIVO ---

  getStatsSummary: async (): Promise<FoundationStatsSummary> => {
    try {
      const response = await axiosInstance.get<FoundationStatsSummary>("/api/foundation/beneficiaries/stats/summary");
      return response.data;
    } catch {
      return {
        totalPrograms: 3,
        activePrograms: 3,
        totalBeneficiaries: 136,
        activeBeneficiaries: 136,
        pendingReviewBeneficiaries: 4,
        totalAllocatedBudget: 750000,
        totalDisbursedBudget: 447400,
        availableBudget: 302600,
      };
    }
  },
};
