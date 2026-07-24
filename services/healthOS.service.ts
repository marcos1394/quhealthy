import axiosInstance from '@/lib/axios';
import { HealthOSResponse } from '@quhealthy/health-os-contract';

export interface AttachmentData {
  mimeType: string;
  base64Data: string;
}

export const healthOSService = {
  /**
   * Envía un mensaje de texto plano o intención al agente orquestador con archivos adjuntos opcionales
   */
  sendIntent: async (message: string, context?: Record<string, any>, attachments?: AttachmentData[]): Promise<HealthOSResponse> => {
    // El endpoint apuntará al gateway que ruteará a health-agent-service (ej: /api/v1/health-agent/intent)
    const response = await axiosInstance.post('/api/v1/health-agent/intent', {
      message,
      patientContext: context || {},
      attachments: attachments || []
    });
    
    return response.data;
  }
};
