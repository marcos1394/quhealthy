import axiosInstance from '@/lib/axios';
import { OnboardingStatusResponse } from '@/types/onboarding';

const BASE_URL = '/api/onboarding';

export const onboardingService = {

  /**
   * Obtiene el estado actual de todos los pasos del onboarding.
   * Inyecta manualmente el header X-User-Id requerido por el backend.
   */
  getStatus: async (): Promise<OnboardingStatusResponse> => {
    
    // 1. Recuperamos el ID del usuario desde el almacenamiento local
    // (Esto se guardó en useAuth / SessionStore al hacer login)
    let userId = '';
    
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          // Asegúrate de que tu objeto user tenga la propiedad 'id'
          userId = user.id || user.providerId || ''; 
        } catch (e) {
          console.error("Error al leer usuario del storage", e);
        }
      }
    }

    // 2. Hacemos la petición inyectando el Header
    const response = await axiosInstance.get<OnboardingStatusResponse>(
      `${BASE_URL}/status`,
      {
        headers: {
          'X-User-Id': userId // 👈 AQUÍ ESTÁ LA SOLUCIÓN
        }
      }
    );
    
    return response.data;
  },

  // Futuros métodos (ejemplo para guardar perfil)
  /*
  saveProfile: async (data: any) => {
    // ... lógica similar para obtener userId
    return axiosInstance.post(`${BASE_URL}/profile`, data, {
       headers: { 'X-User-Id': userId }
    });
  }
  */
};