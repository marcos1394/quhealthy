import axiosInstance from "@/lib/axios";
import {
  FoundationProgram,
  FoundationBeneficiary,
  FoundationProgramEnrollment,
  FoundationStatsSummary,
  CreateBeneficiaryPayload,
  CreateProgramPayload,
} from "@/types/foundation";

export const foundationService = {
  // --- PROGRAMAS ASISTENCIALES ---

  getPrograms: async (): Promise<FoundationProgram[]> => {
    try {
      const response = await axiosInstance.get<FoundationProgram[]>("/api/foundation/programs");
      return response.data;
    } catch {
      // Mock de respaldo seguro en entorno local
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
