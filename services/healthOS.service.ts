import axiosInstance from '@/lib/axios';
import { HealthOSResponse } from '@quhealthy/health-os-contract';

export const healthOSService = {
  /**
   * Envía un mensaje de texto plano o intención al agente orquestador
   */
  sendIntent: async (message: string, context?: Record<string, any>): Promise<HealthOSResponse> => {
    // El endpoint apuntará al gateway que ruteará a health-agent-service (ej: /api/v1/health-agent/intent)
    const response = await axiosInstance.post('/api/v1/health-agent/intent', {
      message,
      patientContext: context || {}
    });
    
    return response.data;
  }
};
