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

export const useProviderStatusStore = create<ProviderStatusState>((set, get) => ({
  status: null,
  isLoading: true,
  
  fetchStatus: async () => {
    // --- INICIO DE LOGS Y VERIFICACIONES ---
    console.log("🔵 [Zustand Store] Se ha invocado fetchStatus.");

    if (typeof window === 'undefined') {
      console.log("🟡 [Zustand Store] Entorno de servidor detectado. Omitiendo fetch.");
      return set({ isLoading: false });
    }
    
    // Para evitar llamadas redundantes si ya estamos cargando o ya tenemos datos.
    if (get().isLoading && get().status !== null) {
      console.log("🟡 [Zustand Store] Fetch ya en progreso o datos ya existen. Omitiendo.");
      return;
    }
    // --- FIN DE LOGS Y VERIFICACIONES ---

    set({ isLoading: true });
    console.log("⏳ [Zustand Store] Poniendo isLoading = true y comenzando llamada a API...");

    try {
      const response = await axios.get<ProviderStatus>('/api/auth/simplified-status', {
        withCredentials: true,
      });

      console.log("✅ [Zustand Store] Petición exitosa. Datos recibidos:", response.data);
      set({ status: response.data, isLoading: false });
      console.log("✅ [Zustand Store] Estado global actualizado.");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("❌ [Zustand Store] Error en la petición a /simplified-status:", error.response?.data || error.message);
      set({ status: null, isLoading: false });
      console.error("❌ [Zustand Store] Estado global reseteado a null.");
    }
  },

  clearStatus: () => {
    console.log("🧹 [Zustand Store] Limpiando estado del proveedor (logout).");
    set({ status: null, isLoading: false });
  },
}));