import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import axios from 'axios';
import { AuthResponse, AuthUser, AuthStatus } from '@/types/auth';

// 🚀 FIX BUG-5: Mutex compartido con axios.ts para prevenir race condition en token rotation
// Exportamos este flag para que el interceptor de axios sepa si initializeSession ya está en progreso
export let isInitialRefreshInProgress = false;
export let initialRefreshPromise: Promise<string | null> | null = null;

// =========================================================================
// 🧹 NUCLEAR COOKIE CLEANUP
// Borra TODAS las cookies accesibles desde JS (las HttpOnly las borra el
// backend con Set-Cookie: Max-Age=0 en POST /logout).
// Se ejecuta en CADA path de cierre de sesión.
// =========================================================================
export function nukeCookies(): void {
  if (typeof document === 'undefined') return;

  const cookies = document.cookie.split(';');
  const domains = [window.location.hostname, `.${window.location.hostname}`, ''];
  const paths = ['/', window.location.pathname];

  for (const cookie of cookies) {
    const name = cookie.split('=')[0].trim();
    if (!name) continue;
    for (const domain of domains) {
      for (const path of paths) {
        const domainPart = domain ? `;domain=${domain}` : '';
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=${path}${domainPart}`;
        document.cookie = `${name}=;max-age=0;path=${path}${domainPart}`;
      }
    }
  }

  // 🚀 FIX: Aseguramos borrar la cookie de rol específicamente
  document.cookie = "userRole=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";

  console.log('🧹 [Auth] Cookies nucleadas.');
}

interface SessionState {
  // Estado
  token: string | null;
  user: AuthUser | null;
  role: 'ROLE_CONSUMER' | 'ROLE_PROVIDER' | 'ROLE_ADMIN' | 'ROLE_STAFF' | null;
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
  forceRefreshSession: () => Promise<void>;
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

      // 🚀 ENTERPRISE: Acción de Cerrar Sesión — limpia state + localStorage + cookies
      clearSession: () => {
        set({
          token: null,
          user: null,
          role: null,
          status: null,
          isAuthenticated: false,
          isLoading: false,
        });

        if (typeof window !== 'undefined') {
          // 1. Borrar la data persistida de Zustand en localStorage
          localStorage.removeItem('quhealthy-session');
          // 2. Nuclear: borrar TODAS las cookies accesibles
          nukeCookies();
        }
      },

      setLoading: (loading) => set({ isLoading: loading }),

      // =========================================================================
      // RESTAURAR SESIÓN AL RECARGAR 
      // 🚀 FIX BUG-5: Ahora usa un mutex global para que el interceptor de axios
      //    no intente un refresh paralelo que dispare un falso Replay Attack
      // =========================================================================
      initializeSession: async () => {
        const state = get();

        // 1. Navegación tipo SPA (El token sigue vivo en la RAM)
        if (state.token) {
          set({ isAuthenticated: true, isLoading: false });
          return;
        }

        // 🚀 FIX: Si ya hay una inicialización en progreso, esperamos a que termine
        if (isInitialRefreshInProgress && initialRefreshPromise) {
          await initialRefreshPromise;
          return;
        }

        // 2. Hard Refresh (F5) - La RAM se limpió. Intentamos recuperar vía Cookie HttpOnly
        set({ isLoading: true });

        // Activar el mutex global — el interceptor de axios lo leerá y esperará
        isInitialRefreshInProgress = true;

        initialRefreshPromise = (async (): Promise<string | null> => {
          try {
            const response = await axios.post<AuthResponse>(
              `${process.env.NEXT_PUBLIC_API_URL || 'https://api.quhealthy.org'}/api/auth/refresh-token`,
              {}, // Body vacío
              { withCredentials: true } 
            );

            const newToken = response.data.token;

            set({
              token: newToken,
              user: response.data.user || state.user,
              role: response.data.role || state.role,
              status: response.data.status || state.status,
              isAuthenticated: true,
              isLoading: false,
            });

            console.log('✅ [Auth] Token recuperado de la memoria (Cookie HttpOnly)');
            return newToken;
            
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

            if (typeof window !== 'undefined') {
              // Limpieza total: localStorage + cookies
              localStorage.removeItem('quhealthy-session');
              nukeCookies();

              // Solo redirigir si estamos en una ruta verdaderamente protegida
              const currentPath = window.location.pathname;
              const isProtectedRoute = 
                /\/dashboard/.test(currentPath) ||
                /\/profile/.test(currentPath) ||
                /\/wallet/.test(currentPath) ||
                /\/appointments/.test(currentPath) ||
                /\/orders/.test(currentPath) ||
                /\/checkout/.test(currentPath) ||
                /\/settings/.test(currentPath) ||
                /\/reviews/.test(currentPath);

              if (isProtectedRoute) {
                // Obtenemos el locale actual
                const localeMatch = window.location.pathname.match(/^\/([a-zA-Z]{2})(\/|$)/);
                const currentLocale = localeMatch ? `/${localeMatch[1]}` : '/es';
                // Si la sesión expiró estando en una zona protegida, lo pateamos a login con el flag
                window.location.href = `${currentLocale}/login?clear_session=true&expired=true`;
              } else {
                // Si estamos en una zona pública, limpiamos las cookies fantasma en segundo plano sin recargar la página para no atrapar a los invitados en un bucle
                fetch('/?clear_session=true', { method: 'HEAD' }).catch(() => {});
              }
            }

            return null;

          } finally {
            isInitialRefreshInProgress = false;
            initialRefreshPromise = null;
          }
        })();

        await initialRefreshPromise;
      },

      // =========================================================================
      // REFRESH FORZOSO (Usado tras un cambio de plan o suscripción)
      // =========================================================================
      forceRefreshSession: async () => {
        const state = get();
        try {
          const response = await axios.post<AuthResponse>(
            `${process.env.NEXT_PUBLIC_API_URL || 'https://api.quhealthy.org'}/api/auth/refresh-token`,
            {}, 
            { withCredentials: true } 
          );

          set({
            token: response.data.token,
            user: response.data.user || state.user,
            role: response.data.role || state.role,
            status: response.data.status || state.status,
            isAuthenticated: true,
          });
          console.log('🔄 [Auth] Sesión refrescada forzosamente (ej. tras cambio de plan)');
        } catch (error) {
          console.error('⚠️ [Auth] Falló el refresh forzoso', error);
        }
      },
    }),
    {
      name: 'quhealthy-session',
      storage: createJSONStorage(() => localStorage),

      // 🚀 FIX BUG-8: NO persistimos isAuthenticated para evitar estado stale
      // Al rehidratar, isAuthenticated será false hasta que initializeSession valide la cookie
      partialize: (state) => ({
        user: state.user,
        role: state.role,
        status: state.status,
        // isAuthenticated REMOVIDO — se deriva del token al rehidratar
      }),

      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true);
        }
      },
    }
  )
);