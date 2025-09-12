import { create } from 'zustand';
import axios from 'axios';

// Interfaces para definir la estructura de los datos
interface ProviderDetails {
  name: string;
  email: string;
}

interface ProviderStatus {
  planStatus: 'trial' | 'free' | 'active' | 'expired' | 'canceled';
  trialExpiresAt: string | null;
  hasActivePlan: boolean;
  providerDetails: ProviderDetails | null;
}

interface ProviderStatusState {
  status: ProviderStatus | null;
  isLoading: boolean;
  fetchStatus: () => Promise<void>;
  clearStatus: () => void;
}

export const useProviderStatusStore = create<ProviderStatusState>((set) => ({
  status: null,
  isLoading: true,
  
  fetchStatus: async () => {
    // --- INICIO DE LA CORRECCIÓN ---
    // Esta línea es crucial: asegura que este código solo se ejecute en el navegador.
    // En el servidor (SSR), 'window' no existe, por lo que no hacemos nada.
    if (typeof window === 'undefined') {
      return set({ isLoading: false }); 
    }
    // --- FIN DE LA CORRECCIÓN ---

    set({ isLoading: true });
    try {
      // Usamos la ruta relativa que apunta a nuestro endpoint "ligero"
      const response = await axios.get<ProviderStatus>('/api/auth/simplified-status', {
        withCredentials: true,
      });
      set({ status: response.data, isLoading: false });
    } catch (error) {
      console.error("No se pudo obtener el estado del proveedor:", error);
      set({ status: null, isLoading: false });
    }
  },

  clearStatus: () => set({ status: null, isLoading: false }),
}));