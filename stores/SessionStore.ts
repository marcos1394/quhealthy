// src/stores/SessionStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import axios from 'axios';
import { AuthResponse, AuthUser, AuthStatus } from '@/types/auth';

interface SessionState {
  // Estado
  token: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  user: AuthUser | null;
  role: 'CONSUMER' | 'PROVIDER' | 'ADMIN' | null;
  status: AuthStatus | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Hidratación
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;

  // Acciones
  setSession: (authResponse: AuthResponse) => void;
  updateToken: (payload: Partial<AuthResponse>) => void;
  clearSession: () => void;
  setLoading: (loading: boolean) => void;
  initializeSession: () => Promise<void>;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      // Estado Inicial
      token: null,
      refreshToken: null,
      expiresAt: null,
      user: null,
      role: null,
      status: null,
      isAuthenticated: false,
      isLoading: true,

      // Hidratación: indica si el store ya cargó del localStorage
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),

      // Acción: Guardar Sesión (Login Exitoso)
      setSession: (response) => {
        set({
          token: response.token,
          refreshToken: response.refreshToken || null,
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
          refreshToken: payload.refreshToken !== undefined ? payload.refreshToken : state.refreshToken,
          expiresAt: payload.expiresIn ? Date.now() + payload.expiresIn * 1000 : state.expiresAt,
          role: payload.role !== undefined ? payload.role : state.role,
          user: payload.user !== undefined ? payload.user : state.user,
          status: payload.status !== undefined ? payload.status : state.status,
          isAuthenticated: !!(payload.token || state.token),
        }));
      },

      // Acción: Cerrar Sesión
      clearSession: () => {
        set({
          token: null,
          refreshToken: null,
          expiresAt: null,
          user: null,
          role: null,
          status: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      setLoading: (loading) => set({ isLoading: loading }),

      // =========================================================================
      // RESTAURAR SESIÓN AL RECARGAR
      // Primero verifica si hay datos persistidos válidos en localStorage.
      // Si el token está por expirar o ya expiró, intenta renovar vía refresh.
      // =========================================================================
      initializeSession: async () => {
        const state = get();

        // Si ya tenemos token y no ha expirado, simplemente marcamos como listo
        if (state.token && state.expiresAt && state.expiresAt > Date.now()) {
          set({ isAuthenticated: true, isLoading: false });
          console.log('✅ [Auth] Sesión restaurada desde almacenamiento local');
          return;
        }

        // Si tenemos refreshToken, intentamos renovar el access token
        const refreshTokenValue = state.refreshToken;
        if (refreshTokenValue) {
          try {
            const response = await axios.post<AuthResponse>(
              `${process.env.NEXT_PUBLIC_API_URL || 'https://api.quhealthy.org'}/api/auth/refresh-token`,
              { refreshToken: refreshTokenValue },
              { withCredentials: true }
            );

            set({
              token: response.data.token,
              refreshToken: response.data.refreshToken || refreshTokenValue,
              expiresAt: response.data.expiresIn ? Date.now() + response.data.expiresIn * 1000 : null,
              user: response.data.user || state.user,
              role: response.data.role || state.role,
              status: response.data.status || state.status,
              isAuthenticated: true,
              isLoading: false,
            });

            console.log('✅ [Auth] Token renovado exitosamente vía refresh token');
            return;
          } catch {
            console.log('⚠️ [Auth] Refresh token expirado o inválido');
          }
        }

        // Si no se pudo restaurar ni renovar, limpiar sesión
        console.log('ℹ️ [Auth] No hay sesión activa. Usuario debe loguearse.');
        set({
          token: null,
          refreshToken: null,
          expiresAt: null,
          user: null,
          role: null,
          status: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },
    }),
    {
      name: 'quhealthy-session', // clave en localStorage
      storage: createJSONStorage(() => localStorage),

      // Solo persistimos los datos de sesión, NO el loading ni las funciones
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        expiresAt: state.expiresAt,
        user: state.user,
        role: state.role,
        status: state.status,
        isAuthenticated: state.isAuthenticated,
      }),

      // Callback que se ejecuta cuando el store se hidrata del localStorage
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true);
        }
      },
    }
  )
);