import axiosInstance from '@/lib/axios';

// ✅ CAMBIO: Ahora apunta a la ruta del microservicio de onboarding
const BASE_URL = '/api/onboarding/google/places';

export const googleService = {
  autocomplete: async (input: string) => {
    // Esto llamará a: /api/onboarding/google/places/autocomplete
    const res = await axiosInstance.get(`${BASE_URL}/autocomplete?input=${input}`);
    return res.data;
  },
  
  getDetails: async (placeId: string) => {
    // Esto llamará a: /api/onboarding/google/places/details
    const res = await axiosInstance.get(`${BASE_URL}/details?placeId=${placeId}`);
    return res.data;
  },

  reverseGeocode: async (lat: number, lng: number) => {
    const res = await axiosInstance.get(`${BASE_URL}/geocode?lat=${lat}&lng=${lng}`);
    return res.data;
  }
};