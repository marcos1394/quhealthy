import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { HealthOSResponse, HealthOSIntent, HealthOSAction } from '@quhealthy/health-os-contract';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content?: string;
  response?: HealthOSResponse;
}

export interface ChatSession {
  id: string;
  title: string;
  updatedAt: string;
  conversation: Message[];
}

interface PatientContext {
  id?: string;
  name?: string;
  location?: string;
}

interface HealthOSState {
  sessions: ChatSession[];
  activeSessionId: string | null;
  conversation: Message[];
  widgets: any[];
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
  loadSession: (sessionId: string) => void;
  deleteSession: (sessionId: string) => void;
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
  activeSessionId: null,
};

export const useHealthOSStore = create<HealthOSState>()(
  persist(
    (set) => ({
      sessions: [],
      activeSessionId: null,
      conversation: [],
      widgets: [],
      patientContext: {},
      sessionContext: {},
      pendingActions: [],
      streamingState: 'idle',
      selectedEntities: {},
      toolResults: {},

      addUserMessage: (text) =>
        set((state) => {
          const newConversation = [
            ...state.conversation,
            { id: crypto.randomUUID(), role: 'user' as const, content: text },
          ];

          let sessionId = state.activeSessionId;
          let newSessions = [...state.sessions];

          if (!sessionId) {
            sessionId = crypto.randomUUID();
            newSessions.unshift({
              id: sessionId,
              title: text.substring(0, 30) + (text.length > 30 ? '...' : ''),
              updatedAt: new Date().toISOString(),
              conversation: newConversation,
            });
          } else {
            const idx = newSessions.findIndex((s) => s.id === sessionId);
            if (idx !== -1) {
              newSessions[idx] = {
                ...newSessions[idx],
                updatedAt: new Date().toISOString(),
                conversation: newConversation,
              };
            }
          }

          return {
            conversation: newConversation,
            streamingState: 'processing',
            activeSessionId: sessionId,
            sessions: newSessions,
          };
        }),

      updateAssistantStream: (chunk) =>
        set((state) => {
          const lastMsg = state.conversation[state.conversation.length - 1];
          let newConversation = [...state.conversation];

          if (!lastMsg || lastMsg.role !== 'assistant') {
            newConversation.push({
              id: chunk.id || crypto.randomUUID(),
              role: 'assistant',
              response: chunk as HealthOSResponse,
            });
          } else {
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

          let newSessions = [...state.sessions];
          if (state.activeSessionId) {
            const idx = newSessions.findIndex((s) => s.id === state.activeSessionId);
            if (idx !== -1) {
              newSessions[idx] = {
                ...newSessions[idx],
                updatedAt: new Date().toISOString(),
                conversation: newConversation,
              };
            }
          }

          return {
            conversation: newConversation,
            streamingState: 'streaming',
            activeIntent: chunk.intent || state.activeIntent,
            sessions: newSessions,
          };
        }),

      finalizeStream: () => set({ streamingState: 'idle' }),

      setPatientContext: (context) =>
        set((state) => ({
          patientContext: { ...state.patientContext, ...context },
        })),

      setIntent: (intent) => set({ activeIntent: intent }),

      resetConversation: () => set(initialResetState),

      loadSession: (sessionId: string) =>
        set((state) => {
          const session = state.sessions.find((s) => s.id === sessionId);
          if (session) {
            return {
              ...initialResetState,
              activeSessionId: session.id,
              conversation: session.conversation,
            };
          }
          return {};
        }),

      deleteSession: (sessionId: string) =>
        set((state) => {
          const newSessions = state.sessions.filter((s) => s.id !== sessionId);
          if (state.activeSessionId === sessionId) {
            return { ...initialResetState, sessions: newSessions };
          }
          return { sessions: newSessions };
        }),

      resetState: () => set(initialResetState),

      clearState: () =>
        set({
          ...initialResetState,
          sessions: [],
          patientContext: {},
          sessionContext: {},
        }),
    }),
    {
      name: 'healthos-chat-storage',
      partialize: (state) => ({
        sessions: state.sessions,
        activeSessionId: state.activeSessionId,
        conversation: state.conversation,
        patientContext: state.patientContext,
      }),
    }
  )
);