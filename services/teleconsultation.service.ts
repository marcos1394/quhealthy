import axiosInstance from '@/lib/axios';

export interface TeleconsultationAccessResponse {
  teleconsultationId: string;
  status: string;
  canStartWebRTC: boolean;
  message: string;
  serverEndTime: string;
  remainingSeconds: number;
}

export const teleconsultationService = {
  joinTeleconsultation: async (appointmentId: string, isProvider: boolean): Promise<TeleconsultationAccessResponse> => {
    const response = await axiosInstance.post(`/appointments/teleconsultations/${appointmentId}/join`, {
      isProvider
    });
    return response.data;
  }
};
