import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import axios from 'axios';
import { AuthResponse, AuthUser, AuthStatus } from '@/types/auth';

interface SessionState {
  // Estado
  token: string | null;
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
      user: null,
      role: null,
      status: null,
      isAuthenticated: false,
      isLoading: true, 

      // Hidratación
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),

      // Acción: Guardar Sesión (Login Exitoso)
      setSession: (response) => {
        set({
          token: response.token,
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
      // =========================================================================
      initializeSession: async () => {
        const state = get();

        // 1. Navegación tipo SPA (El token sigue vivo en la RAM)
        if (state.token) {
          set({ isAuthenticated: true, isLoading: false });
          return;
        }

        // 2. Hard Refresh (F5) - La RAM se limpió. Intentamos recuperar vía Cookie HttpOnly
        set({ isLoading: true });

        try {
          const response = await axios.post<AuthResponse>(
            `${process.env.NEXT_PUBLIC_API_URL || 'https://api.quhealthy.org'}/api/auth/refresh-token`,
            {}, // Body vacío
            { withCredentials: true } 
          );

          set({
            token: response.data.token,
            user: response.data.user || state.user,
            role: response.data.role || state.role,
            status: response.data.status || state.status,
            isAuthenticated: true,
            isLoading: false,
          });

          console.log('✅ [Auth] Token recuperado de la memoria (Cookie HttpOnly)');
          
        } catch (error) {
          console.log('⚠️ [Auth] No hay sesión activa o cookie expirada. Requiere login.');
          
          set({
            token: null,
            user: null,
            role: null,
            status: null,
            isAuthenticated: false,
            isLoading: false,
          });

          // 🛡️ FIX BUCLE DEFINITIVO: Evaluamos dónde estamos parados
          if (typeof window !== 'undefined') {
            const currentPath = window.location.pathname;
            
            // Solo lanzamos la señal de auxilio si estamos en una ruta PRIVADA
            if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
              window.location.href = '/login?clear_session=true'; 
            } else {
              // Si ya estamos en el login, borramos la cookie localmente por las dudas
              document.cookie = "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=quhealthy.org; SameSite=None; Secure";
            }
          }
        }
      },
    }),
    {
      name: 'quhealthy-session',
      storage: createJSONStorage(() => localStorage),

      // SOLO persistimos info no sensible.
      partialize: (state) => ({
        user: state.user,
        role: state.role,
        status: state.status,
        isAuthenticated: state.isAuthenticated,
      }),

      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true);
        }
      },
    }
  )
);