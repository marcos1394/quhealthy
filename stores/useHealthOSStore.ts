import { create } from 'zustand';
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
  setPatientContext: (context: Partial<PatientContext>) => void;
  setIntent: (intent: HealthOSIntent) => void;
  clearState: () => void;
}

export const useHealthOSStore = create<HealthOSState>((set) => ({
  conversation: [],
  widgets: [],
  patientContext: {},
  sessionContext: {},
  pendingActions: [],
  streamingState: 'idle',
  selectedEntities: {},
  toolResults: {},

  addUserMessage: (text) => set((state) => ({
    conversation: [...state.conversation, { id: crypto.randomUUID(), role: 'user', content: text }],
    streamingState: 'processing',
  })),

  updateAssistantStream: (chunk) => set((state) => {
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
        widgets: chunk.widgets ? [...(lastMsg.response?.widgets || []), ...chunk.widgets] : lastMsg.response?.widgets,
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

  setPatientContext: (context) => set((state) => ({
    patientContext: { ...state.patientContext, ...context },
  })),

  setIntent: (intent) => set({ activeIntent: intent }),

  clearState: () => set({
    conversation: [],
    widgets: [],
    activeIntent: undefined,
    pendingActions: [],
    streamingState: 'idle',
    selectedEntities: {},
    toolResults: {},
  }),
}));
