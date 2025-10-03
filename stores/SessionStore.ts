/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { create } from 'zustand';
import axios from 'axios';


// Interfaz para una conexión social individual
interface SocialConnection {
  id: any;
  platform: 'facebook' | 'instagram' | 'tiktok' | 'youtube' | 'linkedin' | 'google_business';
}

// Tipos para nuestro store unificado
export interface UserSession {
  id: number;
  name: string;
  email: string;
  role: 'provider' | 'consumer';
  planStatus?: 'trial' | 'free' | 'active' | 'expired' | 'canceled';
  google_calendar_id?: string | null; // <-- Ya lo teníamos
  socialConnections?: SocialConnection[]; // <-- AÑADE ESTA LÍNEA
}

interface SessionState {
  user: UserSession | null;
  isLoading: boolean;
  fetchSession: () => Promise<void>;
  clearSession: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  user: null,
  isLoading: true,
  
  fetchSession: async () => {
    if (typeof window === 'undefined') {
      return set({ isLoading: false });
    }
    set({ isLoading: true });
    try {
      // Llamamos a un nuevo endpoint unificado que identifica al usuario por su cookie
      const { data } = await axios.get('/api/auth/session', { withCredentials: true });
      set({ user: data.user, isLoading: false });
      console.log("✅ [Session Store] Sesión recuperada:", data.user);
    } catch (error) {
      // Si falla (no hay cookie o es inválida), el usuario es null
      set({ user: null, isLoading: false });
      console.log("🟡 [Session Store] No se encontró una sesión activa.");
    }
  },

  clearSession: () => {
    set({ user: null, isLoading: false });
    console.log("🧹 [Session Store] Sesión limpiada (logout).");
  },
}));