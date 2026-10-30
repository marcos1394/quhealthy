import axiosInstance from '@/lib/axios';
import { HealthOSResponse } from '@quhealthy/health-os-contract';

export interface AttachmentData {
  mimeType: string;
  base64Data: string;
}

export interface VoiceDesignPayload {
  displayName?: string;
  description?: string;
  gender?: string;
  languageCode?: string;
  setActive?: boolean;
}

export interface VoiceDesignResult {
  voiceId: string;
  displayName: string;
  status: string;
  sampleAudioBase64?: string;
  format: string;
  isActive: boolean;
  message: string;
}

export interface VoiceItem {
  id: string;
  name: string;
  displayName: string;
  type: string;
  gender?: string;
  languageCode?: string;
  description?: string;
  sampleAudioBase64?: string;
  sampleAudioMimeType?: string;
  isActive: boolean;
}

export interface ActiveVoiceConfig {
  activeVoice: string;
  secondaryVoice: string;
  model: string;
  style: string;
  isCustomDesignedVoice: boolean;
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
  },

  /**
   * Diseña y genera una voz propietaria para Pulso vía Gemini 3.8 Flash TTS Voice Design
   */
  designVoice: async (payload?: VoiceDesignPayload): Promise<VoiceDesignResult> => {
    const response = await axiosInstance.post('/api/v1/health-agent/voices/design', payload || {});
    return response.data;
  },

  /**
   * Lista las voces disponibles en Gemini (prebuilt o custom)
   */
  listVoices: async (type?: string): Promise<VoiceItem[]> => {
    const response = await axiosInstance.get('/api/v1/health-agent/voices', {
      params: type ? { type } : undefined
    });
    return response.data;
  },

  /**
   * Obtiene la configuración de la voz activa actual de Pulso
   */
  getActiveVoice: async (): Promise<ActiveVoiceConfig> => {
    const response = await axiosInstance.get('/api/v1/health-agent/voices/active');
    return response.data;
  },

  /**
   * Establece la voz activa de Pulso en tiempo de ejecución
   */
  setActiveVoice: async (voiceId: string): Promise<ActiveVoiceConfig> => {
    const response = await axiosInstance.post('/api/v1/health-agent/voices/active', { voiceId });
    return response.data;
  }
};
