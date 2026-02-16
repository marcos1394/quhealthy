import axiosInstance from '@/lib/axios';

export const googleService = {
  autocomplete: async (input: string) => {
    const res = await axiosInstance.get(`/api/google/places/autocomplete?input=${input}`);
    return res.data; // Retorna lista de AutocompletePrediction
  },
  
  getDetails: async (placeId: string) => {
    const res = await axiosInstance.get(`/api/google/places/details?placeId=${placeId}`);
    return res.data; // Retorna PlaceDetails
  }
};