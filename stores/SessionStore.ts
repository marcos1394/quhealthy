// src/stores/SessionStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AuthResponse, UserDTO, AuthStatus } from '@/types/auth'; // Importamos las interfaces nuevas

interface SessionState {
  // Estado
  token: string | null;
  user: UserDTO | null;
  role: 'CONSUMER' | 'PROVIDER' | 'ADMIN' | null;
  status: AuthStatus | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Acciones
  setSession: (authResponse: AuthResponse) => void;
  clearSession: () => void;
  setLoading: (loading: boolean) => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      // Estado Inicial
      token: null,
      user: null,
      role: null,
      status: null,
      isAuthenticated: false,
      isLoading: true, // Empieza cargando para que el layout valide

      // Acción: Guardar Sesión (Login Exitoso)
      setSession: (response) => {
        set({
          token: response.token,
          user: response.user,     // ✅ Guardamos el objeto UserDTO directo
          role: response.role,
          status: response.status,
          isAuthenticated: true,
          isLoading: false,
        });
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
        // Opcional: Limpieza forzada de cookies/storage si es necesario
        localStorage.removeItem('quhealthy-session'); 
      },
      
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'quhealthy-session', // Nombre de la key en localStorage
      storage: createJSONStorage(() => localStorage), // Persistencia automática
      partialize: (state) => ({ 
        // Solo persistimos estos campos (No persistimos isLoading para evitar bugs visuales)
        token: state.token,
        user: state.user,
        role: state.role,
        status: state.status,
        isAuthenticated: state.isAuthenticated
      }),
    }
  )
);