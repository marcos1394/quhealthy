import axiosInstance from '@/lib/axios';

export interface WearableConnection {
  provider: string; // "google_fit", "apple_health", "garmin", "fitbit", "oura"
  status: "CONNECTED" | "DISCONNECTED" | "ERROR" | "PENDING";
  lastSyncAt?: string;
  errorMessage?: string;
}

export const wearableService = {
  /**
   * Obtiene la lista de wearables conectados del paciente.
   */
  getConnections: async (): Promise<WearableConnection[]> => {
    const response = await axiosInstance.get<WearableConnection[]>("/api/onboarding/wearables/oauth/connections");
    return response.data;
  },

  /**
   * Envía el Authorization Code de OAuth al backend para que lo intercambie por los tokens.
   */
  handleCallback: async (provider: string, code: string, error?: string): Promise<void> => {
    await axiosInstance.post("/api/onboarding/wearables/oauth/callback", {
      provider,
      code,
      error
    });
  },

  /**
   * Desconecta un proveedor de wearable y borra los tokens del usuario.
   */
  disconnectProvider: async (provider: string): Promise<void> => {
    await axiosInstance.post(`/api/onboarding/wearables/oauth/disconnect/${provider}`);
  }
};
