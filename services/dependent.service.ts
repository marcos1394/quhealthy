// src/services/dependent.service.ts
import axiosInstance from '@/lib/axios';
import { Dependent, DependentRequest } from '@/types/dependent';

const BASE_URL = '/api/auth/me/dependents';

export const dependentService = {
    getMyFamily: async (): Promise<Dependent[]> => {
        const response = await axiosInstance.get<Dependent[]>(BASE_URL);
        return response.data;
    },

    addDependent: async (data: DependentRequest): Promise<Dependent> => {
        const response = await axiosInstance.post<Dependent>(BASE_URL, data);
        return response.data;
    },

    deleteDependent: async (dependentId: number): Promise<void> => {
        await axiosInstance.delete(`${BASE_URL}/${dependentId}`);
    }
};