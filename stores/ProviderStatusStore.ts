import { create } from 'zustand';
import axios from 'axios';


// --- INICIO DE LA CORRECCIÓN ---
// 1. Creamos una interfaz para los detalles del proveedor
interface ProviderDetails {
  name: string;
  email: string;
}


// 2. Actualizamos la interfaz principal para que incluya los detalles
interface ProviderStatus {
  planStatus: 'trial' | 'free' | 'active' | 'expired' | 'canceled';
  trialExpiresAt: string | null;
  hasActivePlan: boolean;
  providerDetails: ProviderDetails | null; // <-- Propiedad añadida
}

// Define la estructura completa del store
interface ProviderStatusState {
  status: ProviderStatus | null;
  isLoading: boolean;
  fetchStatus: () => Promise<void>; // Función para obtener los datos
  clearStatus: () => void; // Función para limpiar en logout
}

export const useProviderStatusStore = create<ProviderStatusState>((set) => ({
  status: null,
  isLoading: true,
  
  // Acción para buscar el estado en el backend
  fetchStatus: async () => {
    set({ isLoading: true });
    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/simplified-status`;
      const response = await axios.get<ProviderStatus>(apiUrl, {
        withCredentials: true,
      });
      set({ status: response.data, isLoading: false });
    } catch (error) {
      console.error("No se pudo obtener el estado del proveedor:", error);
      set({ status: null, isLoading: false });
    }
  },

  // Acción para resetear el estado (ej. al cerrar sesión)
  clearStatus: () => set({ status: null, isLoading: false }),
}));