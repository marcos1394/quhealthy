// src/stores/SessionStore.ts
import { create } from 'zustand';
import { AuthResponse, AuthUser, AuthStatus } from '@/types/auth'; // Nuevas interfaces

interface SessionState {
  // Estado
  token: string | null;
  expiresAt: number | null; // Seguimiento de expiración sugerido en el plan 4.2
  user: AuthUser | null;
  role: 'CONSUMER' | 'PROVIDER' | 'ADMIN' | null;
  status: AuthStatus | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Acciones
  setSession: (authResponse: AuthResponse) => void;
  updateToken: (payload: Partial<AuthResponse>) => void; // Para interceptor
  clearSession: () => void;
  setLoading: (loading: boolean) => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  // Estado Inicial
  token: null,
  expiresAt: null,
  user: null,
  role: null,
  status: null,
  isAuthenticated: false,
  isLoading: true, // Empieza cargando para que la app valide vía GET /session primero si es necesario

  // Acción: Guardar Sesión (Login Exitoso o Refresco Maestro)
  setSession: (response) => {
    set({
      token: response.token,
      expiresAt: response.expiresIn ? Date.now() + response.expiresIn * 1000 : null,
      user: response.user,
      role: response.role,
      status: response.status,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  updateToken: (payload) => {
    set((state) => ({
      token: payload.token !== undefined ? payload.token : state.token,
      expiresAt: payload.expiresIn ? Date.now() + payload.expiresIn * 1000 : state.expiresAt,
      role: payload.role !== undefined ? payload.role : state.role,
      user: payload.user !== undefined ? payload.user : state.user,
      status: payload.status !== undefined ? payload.status : state.status,
      isAuthenticated: !!(payload.token || state.token),
    }));
  },

  // Acción: Cerrar Sesión (No hay persistencia en origin así que basta setear memory a null)
  clearSession: () => {
    set({
      token: null,
      expiresAt: null,
      user: null,
      role: null,
      status: null,
      isAuthenticated: false,
      isLoading: false, // Dejar en false para renderizar el fallback (login)
    });
  },

  setLoading: (loading) => set({ isLoading: loading }),
}));