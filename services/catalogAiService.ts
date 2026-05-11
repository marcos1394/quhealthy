// Ubicación: src/services/catalogAiService.ts
import axiosInstance from '@/lib/axios';

export interface AiProductScanResponse {
  name: string;
  description: string;
  activeIngredient: string;
  manufacturer: string;
  
  // Nuevos campos de Compliance COFEPRIS
  cofeprisCategory: string;
  requiresPrescription: boolean;
  isAntibiotic: boolean;
  requiresPhysicalRetention: boolean;
  requiresBarcodePrescription: boolean;
  allowsInterstateShipping: boolean;
}

export const catalogAiService = {
  scanProductImage: async (imageBase64: string): Promise<AiProductScanResponse> => {
    const response = await axiosInstance.post('/api/catalog/ai/scan-product', {
      imageBase64
    });
    return response.data;
  }
};
