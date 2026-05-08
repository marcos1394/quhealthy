// Ubicación: src/services/catalogAiService.ts
import axiosInstance from '@/lib/axios';

export interface AiProductScanResponse {
  name: string;
  description: string;
  activeIngredient: string;
  manufacturer: string;
  requiresPrescription: boolean;
}

export const catalogAiService = {
  /**
   * 🤖 Envía la imagen en Base64 a Vertex AI y devuelve los datos del medicamento estructurados
   */
  scanProductImage: async (imageBase64: string): Promise<AiProductScanResponse> => {
    // Apuntamos al nuevo endpoint de Spring Boot que creamos
    const response = await axiosInstance.post('/api/catalog/ai/scan-product', {
      imageBase64
    });
    return response.data;
  }
};
