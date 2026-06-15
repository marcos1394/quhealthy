import apiClient from '@/lib/axios';
import { VaccinationStatusDto, MarkVaccineRequest } from '@/types/vaccination';

export const vaccinationService = {
    getVaccinations: async (dependentId: number): Promise<VaccinationStatusDto[]> => {
        const response = await apiClient.get<VaccinationStatusDto[]>(`/api/onboarding/consumer/dependents/${dependentId}/vaccinations`);
        return response.data;
    },

    markVaccine: async (dependentId: number, data: MarkVaccineRequest): Promise<void> => {
        await apiClient.post(`/api/onboarding/consumer/dependents/${dependentId}/vaccinations`, data);
    }
};
