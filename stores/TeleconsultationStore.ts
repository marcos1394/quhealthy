import { create } from 'zustand';

export type TeleconsultationState = 
  | 'IDLE' 
  | 'AI_CONSENT'
  | 'CHECKING_ACCESS' 
  | 'DEVICE_SETUP' 
  | 'JOINING' 
  | 'WAITING' 
  | 'CONNECTING' 
  | 'CONNECTED' 
  | 'RECONNECTING' 
  | 'COMPLETED' 
  | 'FAILED';

export type ParticipantRole = 'PATIENT' | 'PROVIDER';

interface TeleconsultationStore {
  // Session State
  state: TeleconsultationState;
  setState: (state: TeleconsultationState) => void;
  
  // Core Identifiers
  appointmentId: string | null;
  teleconsultationId: string | null;
  role: ParticipantRole | null;
  setIdentifiers: (appId: string, teleId: string, role: ParticipantRole) => void;

  // Media state
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isAudioMuted: boolean;
  isVideoMuted: boolean;
  setLocalStream: (stream: MediaStream | null) => void;
  setRemoteStream: (stream: MediaStream | null) => void;
  toggleAudioMuted: () => void;
  toggleVideoMuted: () => void;
  
  // Timer state
  remainingSeconds: number | null;
  serverEndTime: string | null;
  setTimerConfig: (serverEndTime: string, remainingSeconds: number) => void;
  updateRemainingSeconds: (seconds: number) => void;
  
  // System checks
  systemChecks: {
    camera: boolean;
    mic: boolean;
    internet: boolean;
    browser: boolean;
  };
  setSystemCheck: (key: keyof TeleconsultationStore['systemChecks'], value: boolean) => void;

  // Cleanup
  reset: () => void;
}

const initialState = {
  state: 'IDLE' as TeleconsultationState,
  appointmentId: null,
  teleconsultationId: null,
  role: null,
  localStream: null,
  remoteStream: null,
  isAudioMuted: false,
  isVideoMuted: false,
  remainingSeconds: null,
  serverEndTime: null,
  systemChecks: {
    camera: false,
    mic: false,
    internet: typeof navigator !== 'undefined' ? navigator.onLine : true,
    browser: typeof navigator !== 'undefined' ? !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) : false
  }
};

export const useTeleconsultationStore = create<TeleconsultationStore>((set) => ({
  ...initialState,
  
  setState: (state) => set({ state }),
  
  setIdentifiers: (appId, teleId, role) => set({ 
    appointmentId: appId, 
    teleconsultationId: teleId, 
    role 
  }),
  
  setLocalStream: (stream) => set({ localStream: stream }),
  
  setRemoteStream: (stream) => set({ remoteStream: stream }),
  
  toggleAudioMuted: () => set((state) => {
    if (state.localStream) {
      state.localStream.getAudioTracks().forEach(track => {
        track.enabled = state.isAudioMuted; // Si estaba muteado, lo habilitamos y viceversa
      });
    }
    return { isAudioMuted: !state.isAudioMuted };
  }),
  
  toggleVideoMuted: () => set((state) => {
    if (state.localStream) {
      state.localStream.getVideoTracks().forEach(track => {
        track.enabled = state.isVideoMuted;
      });
    }
    return { isVideoMuted: !state.isVideoMuted };
  }),
  
  setTimerConfig: (serverEndTime, remainingSeconds) => set({ 
    serverEndTime, 
    remainingSeconds 
  }),
  
  updateRemainingSeconds: (seconds) => set({ remainingSeconds: seconds }),
  
  setSystemCheck: (key, value) => set((state) => ({
    systemChecks: { ...state.systemChecks, [key]: value }
  })),

  reset: () => set({ ...initialState, systemChecks: { ...initialState.systemChecks, internet: typeof navigator !== 'undefined' ? navigator.onLine : true } })
}));
