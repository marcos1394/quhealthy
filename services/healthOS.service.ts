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
  activeAccent?: string;
  activeAccentName?: string;
  activeAccentFlag?: string;
}

export interface RegionalAccent {
  id: string;
  name: string;
  countryCode: string;
  flagEmoji: string;
  dialectDescription: string;
  promptStyle: string;
  gcpFallbackVoice: string;
  sampleGreeting: string;
  isActive: boolean;
}

export interface TranscribeAudioRequest {
  audioBase64?: string;
  audioUri?: string;
  mimeType?: string;
  mode?: 'smart' | 'verbatim';
  languageCodes?: string[];
  customVocabulary?: string[];
}

export interface WordTimestamp {
  word: string;
  speaker?: string;
  startOffset: string;
  endOffset: string;
}

export interface TranscribeAudioResponse {
  id: string;
  transcribedText: string;
  mode: string;
  detectedLanguage: string;
  words?: WordTimestamp[];
  status: string;
  durationMs: number;
}

export interface RecoveryGuideRequest {
  patientName?: string;
  diagnosis?: string;
  medications?: string;
  careInstructions?: string;
  doctorNotes?: string;
  voice?: string;
  style?: string;
  language?: string;
}

export interface RecoveryGuideSectionItem {
  id: string;
  title: string;
  category: string;
  summary: string;
  spokenText: string;
  estimatedSeconds?: number;
}

export interface RecoveryGuideResponse {
  id: string;
  guideTitle: string;
  patientName: string;
  diagnosis: string;
  fullScriptText: string;
  sections: RecoveryGuideSectionItem[];
  audioBase64?: string;
  format: string;
  totalDurationSeconds: number;
  createdAt: string;
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
  },

  /**
   * Genera una Audio-Guía estructurada de recuperación y tratamiento de larga duración
   * con Gemini 3.8 Flash TTS.
   */
  generateRecoveryGuide: async (request?: RecoveryGuideRequest): Promise<RecoveryGuideResponse> => {
    const response = await axiosInstance.post('/api/v1/health-agent/guides/recovery', request || {});
    return response.data;
  },

  /**
   * Lista todos los acentos y dialectos regionales soportados por Gemini 3.8 Flash TTS
   */
  listAccents: async (): Promise<RegionalAccent[]> => {
    const response = await axiosInstance.get('/api/v1/health-agent/voices/accents');
    return response.data;
  },

  /**
   * Establece el acento regional dinámico activo de Pulso en tiempo de ejecución
   */
  setActiveAccent: async (accentId: string): Promise<ActiveVoiceConfig> => {
    const response = await axiosInstance.post('/api/v1/health-agent/voices/accent', { accentId });
    return response.data;
  },

  /**
   * Transcribe un archivo o nota de audio a texto utilizando Gemini 3.5 Transcribe (gemini-3.5-transcribe).
   * Modo "smart": elimina muletillas y autocorrige disfluencias con formato clínico.
   */
  transcribeAudio: async (request: TranscribeAudioRequest): Promise<TranscribeAudioResponse> => {
    const response = await axiosInstance.post('/api/v1/health-agent/transcribe', request);
    return response.data;
  }
};
