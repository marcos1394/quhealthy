import axiosInstance from "@/lib/axios";

export enum TriageLevel {
  LEVEL_1_RESUSCITATION = "LEVEL_1_RESUSCITATION",
  LEVEL_2_EMERGENT = "LEVEL_2_EMERGENT",
  LEVEL_3_URGENT = "LEVEL_3_URGENT",
  LEVEL_4_LESS_URGENT = "LEVEL_4_LESS_URGENT",
  LEVEL_5_NON_URGENT = "LEVEL_5_NON_URGENT",
}

export interface EmergencyQueueItem {
  appointmentId: number;
  patientDirectoryId: number;
  patientName: string;
  status: string;
  triageLevel: TriageLevel;
  reasonForEmergency: string;
  arrivedAt: string;
  triageStartedAt: string;
  triageEndedAt: string;
  waitingTimeSeconds: number;
}

export interface TriageRequest {
  triageLevel: TriageLevel;
  reasonForEmergency: string;
  mentalState: string;
}

export interface HourlyNoteRequest {
  providerId: number;
  clinicalNotes: any; // SOAP structure
}

export const emergencyService = {
  registerEmergencyWalkIn: async (
    providerId: number,
    patientDirectoryId: number,
    consumerId?: number
  ): Promise<any> => {
    const params = new URLSearchParams({
      providerId: providerId.toString(),
      patientDirectoryId: patientDirectoryId.toString(),
    });
    if (consumerId) params.append("consumerId", consumerId.toString());

    const response = await axiosInstance.post(`/api/emergencies/register?${params.toString()}`);
    return response.data;
  },

  startTriage: async (appointmentId: number): Promise<any> => {
    const response = await axiosInstance.post(`/api/emergencies/${appointmentId}/triage/start`);
    return response.data;
  },

  completeTriage: async (appointmentId: number, request: TriageRequest): Promise<any> => {
    const response = await axiosInstance.put(`/api/emergencies/${appointmentId}/triage/complete`, request);
    return response.data;
  },

  startMedicalAttention: async (appointmentId: number): Promise<any> => {
    const response = await axiosInstance.post(`/api/emergencies/${appointmentId}/attention/start`);
    return response.data;
  },

  addHourlyNote: async (appointmentId: number, request: HourlyNoteRequest): Promise<any> => {
    const response = await axiosInstance.post(`/api/emergencies/${appointmentId}/notes`, request);
    return response.data;
  },

  completeEmergency: async (appointmentId: number, patientDestination?: string): Promise<any> => {
    const url = patientDestination 
      ? `/api/emergencies/${appointmentId}/complete?patientDestination=${encodeURIComponent(patientDestination)}`
      : `/api/emergencies/${appointmentId}/complete`;
    const response = await axiosInstance.post(url);
    return response.data;
  },

  getEmergencyQueue: async (providerId: number): Promise<EmergencyQueueItem[]> => {
    const response = await axiosInstance.get(`/api/emergencies/queue?providerId=${providerId}`);
    return response.data;
  },
};
