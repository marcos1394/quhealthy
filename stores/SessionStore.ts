/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';
import axios from 'axios';

// --- TIPOS E INTERFACES ---

// Interfaz para una conexión social individual
export interface SocialConnection {
  id: number;
  platform: 'facebook' | 'instagram' | 'tiktok' | 'youtube' | 'linkedin' | 'google_business';
}

// Interfaz principal del Usuario en Sesión
export interface UserSession {
  id: number;
  name: string;
  phone?: string | null;
  email: string;
  // Corregido: Usamos string | null porque la API devuelve una URL, no un Blob
  image?: string | null; 
  role: 'provider' | 'consumer' | 'admin';
  planStatus?: 'trial' | 'free' | 'active' | 'expired' | 'canceled';
  google_calendar_id?: string | null;
  socialConnections?: SocialConnection[];
}

// Interfaz del Estado de Zustand
interface SessionState {
  user: UserSession | null;
  isLoading: boolean;
  
  // Acciones
  fetchSession: () => Promise<void>;
  clearSession: () => void;
  // Opcional: Acción para actualizar el usuario manualmente sin recargar (ej. después de editar perfil)
  updateUser: (userData: Partial<UserSession>) => void;
}

// --- STORE IMPLEMENTATION ---

export const useSessionStore = create<SessionState>((set) => ({
  user: null,
  isLoading: true, // Empezamos cargando para verificar la cookie httpOnly

  fetchSession: async () => {
    // Evitamos ejecutar esto en el servidor durante el build (SSG/SSR)
    if (typeof window === 'undefined') {
      return set({ isLoading: false });
    }

    set({ isLoading: true });
    
    try {
      // Endpoint unificado que valida la cookie de sesión
      const { data } = await axios.get('/api/auth/session', { withCredentials: true });
      
      if (data && data.user) {
        set({ user: data.user, isLoading: false });
        console.log("✅ [Session Store] Sesión activa:", data.user.email);
      } else {
        set({ user: null, isLoading: false });
      }
    } catch (error) {
      // Si falla (401 Unauthorized o Network Error), asumimos que no hay sesión
      set({ user: null, isLoading: false });
      // console.log("ℹ️ [Session Store] Usuario no autenticado (Visitante)");
    }
  },

  clearSession: () => {
    set({ user: null, isLoading: false });
    console.log("🧹 [Session Store] Estado local limpiado.");
  },

  updateUser: (userData) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...userData } : null
    }));
  }
}));