/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';
import { authService } from '@/services/auth.services';

// --- TIPOS E INTERFACES ---

export interface SocialConnection {
  id: number;
  platform: 'facebook' | 'instagram' | 'tiktok' | 'youtube' | 'linkedin' | 'google_business';
}

export interface UserSession {
  id: number;
  name: string;
  firstName?: string;
  lastName?: string;
  phone?: string | null;
  email: string;
  image?: string | null;
  role: 'PROVIDER' | 'CONSUMER' | 'ADMIN'; // Alineado con el Backend (Mayúsculas)
  planStatus?: 'trial' | 'free' | 'active' | 'expired' | 'canceled';
  google_calendar_id?: string | null;
  socialConnections?: SocialConnection[];
  
  // Flags de estado
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  onboardingComplete?: boolean;
}

interface SessionState {
  user: UserSession | null;
  isLoading: boolean;
  
  // Acciones
  fetchSession: () => Promise<void>;
  clearSession: () => void;
  updateUser: (userData: Partial<UserSession>) => void;
}

// --- STORE IMPLEMENTATION ---

export const useSessionStore = create<SessionState>((set) => ({
  user: null,
  isLoading: true, // Iniciamos cargando para verificar token al montar

  fetchSession: async () => {
    // 1. Evitar ejecución en servidor (SSR)
    if (typeof window === 'undefined') {
      return set({ isLoading: false });
    }

    // 2. Verificación rápida: ¿Hay token en localStorage?
    // Si no hay token, no tiene sentido llamar al backend (ahorramos la petición)
    const token = localStorage.getItem('token');
    if (!token) {
      console.log("ℹ️ [Session Store] No hay token almacenado (Visitante)");
      return set({ user: null, isLoading: false });
    }

    set({ isLoading: true });
    
    try {
      // 3. Llamada al Backend usando el Servicio (Inyecta el Token en Headers)
      // Esto llama a GET /api/auth/session
      const response = await authService.getSession();
      
      if (response && response.token) {
        // 4. Mapeo de Respuesta (AuthResponse -> UserSession)
        // Asumimos que el backend devuelve la info necesaria en la respuesta
        // Si faltan datos en AuthResponse, el backend debería agregarlos.
        const userSession: UserSession = {
          id: response.id || 0, // Asegúrate de que el backend envíe el ID
          email: response.email || '',
          // Construimos el nombre completo si viene separado
          name: response.firstName && response.lastName 
            ? `${response.firstName} ${response.lastName}`
            : response.message.replace('Bienvenido, ', ''), // Fallback temporal usando el mensaje
          firstName: response.firstName,
          lastName: response.lastName,
          role: response.roles as unknown as 'PROVIDER' | 'CONSUMER' | 'ADMIN',
          image: response.image || null,
          
          // Mapeo de estado (Status object)
          isEmailVerified: response.status?.isEmailVerified,
          isPhoneVerified: response.status?.isPhoneVerified,
          onboardingComplete: typeof response.status?.onboardingComplete === 'boolean' 
            ? response.status.onboardingComplete 
            : response.status?.onboardingComplete === 'COMPLETED',
          
          // Otros campos opcionales
          planStatus: 'active', // Esto debería venir del backend idealmente
        };

        set({ user: userSession, isLoading: false });
        console.log("✅ [Session Store] Sesión activa:", userSession.email);
      } else {
        // Respuesta vacía o inválida
        set({ user: null, isLoading: false });
      }

    } catch (error) {
      // 5. Manejo de Errores (Token expirado o inválido)
      console.warn("⚠️ [Session Store] Sesión inválida o expirada.");
      
      // Limpiamos basura local si el token ya no sirve (403/401)
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      set({ user: null, isLoading: false });
    }
  },

  clearSession: () => {
    // Limpieza de estado global
    set({ user: null, isLoading: false });
    
    // Limpieza de almacenamiento local (Redundancia de seguridad)
    if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
    }
    console.log("🧹 [Session Store] Sesión cerrada y limpiada.");
  },

  updateUser: (userData) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...userData } : null
    }));
  }
}));