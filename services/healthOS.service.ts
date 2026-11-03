import axiosInstance from '@/lib/axios';
import { HealthOSResponse } from '@quhealthy/health-os-contract';
import { SoapNotes } from '@/types/ehr';

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
  medicalSpecialty?: string;
  includeMedicalVocabulary?: boolean;
  enableDiarization?: boolean;
  enableTimestamps?: boolean;
}

export interface WordTimestamp {
  word: string;
  speaker?: string;
  startOffset: string;
  endOffset: string;
  startSeconds?: number;
  endSeconds?: number;
}

export interface SpeakerTurn {
  speakerId: string;
  speakerLabel: string;
  text: string;
  startOffset?: string;
  endOffset?: string;
  words?: WordTimestamp[];
}

export interface TranscribeAudioResponse {
  id: string;
  transcribedText: string;
  mode: string;
  detectedLanguage: string;
  words?: WordTimestamp[];
  appliedVocabulary?: string[];
  diarizationEnabled?: boolean;
  timestampsEnabled?: boolean;
  speakerTurns?: SpeakerTurn[];
  status: string;
  durationMs: number;
}

export interface ConsultationSoapRequest {
  audioBase64?: string;
  audioUri?: string;
  mimeType?: string;
  consultationText?: string;
  patientName?: string;
  doctorName?: string;
  medicalSpecialty?: string;
  appointmentId?: number;
  dependentId?: number;
  shareToVault?: boolean;
}

export interface ConsultationSoapResponse {
  id: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  vitalSigns?: Record<string, any>;
  suggestedDiagnoses?: string[];
  suggestedPrescriptions?: Array<Record<string, string>>;
  transcription?: TranscribeAudioResponse;
  vaultDocument?: Record<string, any>;
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

export interface MedicalInfographicRequest {
  title?: string;
  medicalTopic?: string;
  category?: 'ANATOMY' | 'SURGERY' | 'REHABILITATION' | 'NUTRITION' | 'PEDIATRICS' | 'CARDIOLOGY';
  summary?: string;
  keyPoints?: string[];
  aspectRatio?: '16:9' | '1:1';
}

export interface MedicalInfographicResponse {
  id: string;
  title: string;
  medicalTopic: string;
  category: string;
  summary: string;
  imageUrl: string;
  aspectRatio: string;
  keyPoints: string[];
  disclaimer: string;
  downloadUrl?: string;
  createdAt: string;
}

export interface PatientCareKitRequest {
  patientName?: string;
  doctorName?: string;
  medicalSpecialty?: string;
  diagnosis?: string;
  plan?: string;
  medications?: string;
  careInstructions?: string;
  doctorNotes?: string;
  appointmentId?: number;
  accentId?: string;
  includeAudioGuide?: boolean;
  includeInfographic?: boolean;
}

export interface PatientCareKitResponse {
  id: string;
  kitTitle: string;
  patientName: string;
  doctorName: string;
  medicalSpecialty: string;
  diagnosis: string;
  patientFriendlySummary: string;
  keyCarePoints: string[];
  warningSigns: string[];
  recoveryGuide?: RecoveryGuideResponse;
  infographic?: MedicalInfographicResponse;
  shareableWhatsAppText: string;
  createdAt: string;
  status: string;
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
  },

  /**
   * Obtiene el catálogo de vocabulario médico y farmacológico especializado (custom_vocabulary)
   */
  getClinicalVocabulary: async (): Promise<Record<string, any>> => {
    const response = await axiosInstance.get('/api/v1/health-agent/transcribe/vocabulary');
    return response.data;
  },

  /**
   * Transcribe un audio de consulta médica con Gemini 3.5 Transcribe y genera automáticamente
   * una Nota SOAP clínica (Subjetivo, Objetivo, Análisis, Plan) lista para el Vault Digital.
   */
  generateConsultationSoap: async (request: ConsultationSoapRequest): Promise<ConsultationSoapResponse> => {
    const response = await axiosInstance.post('/api/v1/health-agent/transcribe/soap', request);
    return response.data;
  },

  /**
   * Síntesis de voz directa con Gemini 3.8 Flash TTS.
   * Recibe turnos y oradores para generar audio WAV de alta fidelidad.
   */
  synthesizeMultiSpeaker: async (request: {
    speakers?: { speaker: string; voice?: string }[];
    turns: { speaker: string; text: string; style?: string }[];
  }): Promise<{ audioBase64: string; format?: string; turnsCount?: number }> => {
    const response = await axiosInstance.post('/api/v1/health-agent/tts/multi-speaker', request);
    return response.data;
  },

  /**
   * Genera una Infografía Médica o Ilustración Anatómica con Gemini Nano Banana 2.1
   */
  generateMedicalInfographic: async (request?: MedicalInfographicRequest): Promise<MedicalInfographicResponse> => {
    const response = await axiosInstance.post('/api/v1/health-agent/infographics/medical', request || {});
    return response.data;
  },

  /**
   * Genera el Kit Multimodal Post-Consulta para el Paciente
   * Combina resumen en lenguaje paciente, Audio-Guía TTS, Infografía Nano Banana 2.1 y plantilla WhatsApp
   */
  generatePatientCareKit: async (request: PatientCareKitRequest): Promise<PatientCareKitResponse> => {
    const response = await axiosInstance.post('/api/v1/health-agent/care-kit/generate', request);
    return response.data;
  },

  /**
   * Copiloto Clínico Ambiental en Tiempo Real para Consulta Médica (Fase 5).
   * Actualiza incrementalmente la nota SOAP (NOM-004) y genera alertas clínicas de interacciones farmacológicas.
   */
  consultationLiveAssist: async (request: ConsultationLiveAssistRequest): Promise<ConsultationLiveAssistResponse> => {
    const response = await axiosInstance.post('/api/v1/health-agent/consultation/live-assist', request);
    return response.data;
  }
};

export interface ConsultationLiveAssistRequest {
  transcriptChunk: string;
  appointmentId?: number;
  ephemeralVaultShareToken?: string;
  existingSoapDraft?: SoapNotes | Partial<SoapNotes> | Record<string, string | undefined>;
  doctorSpecialty?: string;
  patientName?: string;
}

export interface LiveClinicalAlert {
  alertType: string;
  severity: string;
  medicationA?: string;
  medicationB?: string;
  medication?: string;
  condition?: string;
  allergy?: string;
  message: string;
  suggestedSpecialty?: string;
}

export interface ConsultationLiveAssistResponse {
  updatedDraftSoap: Record<string, string>;
  liveClinicalAlerts: LiveClinicalAlert[];
  detectedMedications: string[];
  detectedConditions: string[];
  vaultPatientSummary?: Record<string, any>;
  nomComplianceVerified: boolean;
  timestamp: string;
}
