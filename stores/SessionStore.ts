// src/stores/SessionStore.ts
import { create } from 'zustand';
import axios from 'axios'; // Importamos el axios genérico (sin interceptores) para el refresh
import { AuthResponse, AuthUser, AuthStatus } from '@/types/auth';

interface SessionState {
  // Estado
  token: string | null;
  expiresAt: number | null;
  user: AuthUser | null;
  role: 'CONSUMER' | 'PROVIDER' | 'ADMIN' | null;
  status: AuthStatus | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Acciones
  setSession: (authResponse: AuthResponse) => void;
  updateToken: (payload: Partial<AuthResponse>) => void;
  clearSession: () => void;
  setLoading: (loading: boolean) => void;
  
  // 🚀 LA NUEVA ACCIÓN PROFESIONAL
  initializeSession: () => Promise<void>; 
}

export const useSessionStore = create<SessionState>((set) => ({
  // Estado Inicial
  token: null,
  expiresAt: null,
  user: null,
  role: null,
  status: null,
  isAuthenticated: false,
  
  // 🔥 Iniciar en TRUE es la mejor práctica. Evita parpadeos de UI no autorizada
  isLoading: true, 

  // Acción: Guardar Sesión (Login Exitoso)
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

  // Acción: Cerrar Sesión
  clearSession: () => {
    set({
      token: null,
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
  // 🚀 MAGIA DE SEGURIDAD: RESTAURAR SESIÓN AL RECARGAR (F5)
  // =========================================================================
  initializeSession: async () => {
    try {
      // Hacemos un post al endpoint de refresh. 
      // Al tener withCredentials: true, el navegador envía la cookie HttpOnly automáticamente.
      const response = await axios.post<AuthResponse>(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://api.quhealthy.org'}/api/auth/refresh-token`, 
        {}, 
        { withCredentials: true }
      );

      // Si el backend nos da un token nuevo, restauramos la memoria
      set({
        token: response.data.token,
        expiresAt: response.data.expiresIn ? Date.now() + response.data.expiresIn * 1000 : null,
        user: response.data.user,
        role: response.data.role,
        status: response.data.status,
        isAuthenticated: true,
        isLoading: false, // Terminamos de cargar
      });
      
      console.log("✅ [Auth] Sesión restaurada de forma segura vía HttpOnly Cookie");

    } catch (error) {
      // Si falla (no hay cookie o expiró), simplemente lo tratamos como "No logueado"
      console.log("ℹ️ [Auth] No hay sesión activa. Usuario debe loguearse.");
      set({
        token: null,
        user: null,
        role: null,
        status: null,
        isAuthenticated: false,
        isLoading: false, // 👈 CRÍTICO: pasarlo a false para que la app termine de cargar y muestre el Login
      });
    }
  },
}));