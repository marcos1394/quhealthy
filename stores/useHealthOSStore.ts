import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { HealthOSResponse, HealthOSIntent, HealthOSAction } from '@quhealthy/health-os-contract';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content?: string;
  response?: HealthOSResponse;
}

interface PatientContext {
  id?: string;
  name?: string;
  location?: string;
}

interface HealthOSState {
  conversation: Message[];
  widgets: any[]; // Widgets correspondientes al mensaje actual
  activeIntent?: HealthOSIntent;
  patientContext: PatientContext;
  sessionContext: Record<string, any>;
  pendingActions: HealthOSAction[];
  streamingState: 'idle' | 'streaming' | 'processing';
  selectedEntities: Record<string, any>;
  toolResults: Record<string, any>;

  // Acciones
  addUserMessage: (text: string) => void;
  updateAssistantStream: (chunk: Partial<HealthOSResponse>) => void;
  finalizeStream: () => void;
  resetConversation: () => void;
  resetState: () => void;
  setPatientContext: (context: Partial<PatientContext>) => void;
  setIntent: (intent: HealthOSIntent) => void;
  clearState: () => void;
}

const initialResetState = {
  conversation: [],
  widgets: [],
  activeIntent: undefined,
  pendingActions: [],
  streamingState: 'idle' as const,
  selectedEntities: {},
  toolResults: {},
};

export const useHealthOSStore = create<HealthOSState>()(
  persist(
    (set) => ({
  conversation: [],
  widgets: [],
  patientContext: {},
  sessionContext: {},
  pendingActions: [],
  streamingState: 'idle',
  selectedEntities: {},
  toolResults: {},

  addUserMessage: (text) =>
    set((state) => ({
      conversation: [
        ...state.conversation,
        { id: crypto.randomUUID(), role: 'user', content: text },
      ],
      streamingState: 'processing',
    })),

  updateAssistantStream: (chunk) =>
    set((state) => {
      // Si no hay un mensaje del asistente activo al final, crearlo
      const lastMsg = state.conversation[state.conversation.length - 1];
      let newConversation = [...state.conversation];

      if (!lastMsg || lastMsg.role !== 'assistant') {
        newConversation.push({
          id: chunk.id || crypto.randomUUID(),
          role: 'assistant',
          response: chunk as HealthOSResponse,
        });
      } else {
        // Actualizar el chunk actual
        const updatedResponse = {
          ...lastMsg.response,
          ...chunk,
          widgets: chunk.widgets
            ? [...(lastMsg.response?.widgets || []), ...chunk.widgets]
            : lastMsg.response?.widgets,
        } as HealthOSResponse;

        newConversation[newConversation.length - 1] = {
          ...lastMsg,
          response: updatedResponse,
        };
      }

      return {
        conversation: newConversation,
        streamingState: 'streaming',
        activeIntent: chunk.intent || state.activeIntent,
      };
    }),

  finalizeStream: () => set({ streamingState: 'idle' }),

  setPatientContext: (context) =>
    set((state) => ({
      patientContext: { ...state.patientContext, ...context },
    })),

  setIntent: (intent) => set({ activeIntent: intent }),

  // 🔄 Reiniciar conversación / Limpiar chat
  resetConversation: () => set(initialResetState),

  // 🔄 Restablecer estado completo manteniendo contexto
  resetState: () => set(initialResetState),

  // 🧹 Limpieza completa incluyendo context
  clearState: () =>
    set({
      ...initialResetState,
      patientContext: {},
      sessionContext: {},
    }),
  }),
  {
    name: 'healthos-chat-storage', // key in localStorage
    partialize: (state) => ({ 
      conversation: state.conversation, 
      patientContext: state.patientContext 
    }), // we only persist the conversation and user context
  }
)
);