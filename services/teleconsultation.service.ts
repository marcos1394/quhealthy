import axiosInstance from "@/lib/axios";

export interface TeleconsultationAccessResponse {
  teleconsultationId: string;
  status: string;
  canStartWebRTC: boolean;
  message: string;
  serverEndTime: string;
  remainingSeconds: number;
  livekitWsUrl?: string;
  livekitToken?: string;
}

export const teleconsultationService = {
  joinTeleconsultation: async (
    appointmentId: string,
    isProvider: boolean,
  ): Promise<TeleconsultationAccessResponse> => {
    const response = await axiosInstance.post(
      `/api/appointments/teleconsultations/${appointmentId}/join`,
      {
        isProvider,
      },
    );
    return response.data;
  },
  
  saveAiConsent: async (
    appointmentId: string,
    preferences: {
      audioProcessingAccepted: boolean;
      clinicalNoteAccepted: boolean;
      dataStorageAccepted: boolean;
      consentVersion: string;
    }
  ): Promise<void> => {
    await axiosInstance.post(
      `/api/appointments/teleconsultations/${appointmentId}/ai-consent`,
      preferences
    );
  },
};
