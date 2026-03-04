// src/services/favorite.service.ts
import axiosInstance from '@/lib/axios';

const BASE_URL = '/api/catalog/favorites';

export const favoriteService = {
    addFavorite: async (entityType: 'PROVIDER' | 'PACKAGE' | 'COURSE' | 'PRODUCT', entityId: number): Promise<void> => {
        await axiosInstance.post(`${BASE_URL}/${entityType}/${entityId}`);
    },

    removeFavorite: async (entityType: 'PROVIDER' | 'PACKAGE' | 'COURSE' | 'PRODUCT', entityId: number): Promise<void> => {
        await axiosInstance.delete(`${BASE_URL}/${entityType}/${entityId}`);
    }
};