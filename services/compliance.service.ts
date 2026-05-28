import axiosInstance from '@/lib/axios';

export interface ComplianceSuggestResponse {
  found: boolean;
  activeIngredient: string;
  cofeprisCategory: string;
  requiresPrescription: boolean;
  isAntibiotic: boolean;
  requiresPhysicalRetention: boolean;
  allowsInterstateShipping: boolean;
}

export const complianceService = {
  suggestComplianceByIngredient: async (ingredient: string): Promise<ComplianceSuggestResponse> => {
    const response = await axiosInstance.get('/api/catalog/compliance/suggest', {
      params: { ingredient }
    });
    return response.data;
  }
};
