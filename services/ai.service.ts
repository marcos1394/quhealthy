import axiosInstance from '@/lib/axios';
import { SoapNotes } from '@/types/ehr';

export const aiService = {
  /**
   * 🤖 Envía el audio en Base64 a Vertex AI y devuelve las notas SOAP estructuradas
   */
  generateSoapNotes: async (appointmentId: number, audioBase64: string): Promise<SoapNotes> => {
    // 🚀 FIX: Actualizamos la ruta para que pase por el enrutador de Appointments
    const response = await axiosInstance.post('/api/appointments/ai/clinical-copilot/generate-soap', {
      appointmentId,
      audioBase64
    });
    return response.data;
  }
};
