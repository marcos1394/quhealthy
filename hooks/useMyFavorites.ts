import { useState, useEffect } from 'react';
import axiosInstance from '@/lib/axios';
import { useSessionStore } from '@/stores/SessionStore';

export const useMyFavorites = (entityType: 'PROVIDER' | 'PACKAGE' | 'COURSE' | 'PRODUCT') => {
    const { token, user } = useSessionStore();
    const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());

    useEffect(() => {
        // Solo buscamos si el paciente está logueado
        if (!token || !user) return;

        const fetchFavorites = async () => {
            try {
                // Traemos los favoritos (ponemos un size grande para abarcar el mapa)
                const res = await axiosInstance.get(`/api/catalog/favorites/me?typeFilter=${entityType}&size=100`);
                
                // Extraemos solo los IDs y los metemos en un Set para búsqueda ultrarrápida
                const ids = res.data.content.map((fav: any) => fav.entityId);
                setFavoriteIds(new Set(ids));
            } catch (error) {
                console.error(`Error cargando favoritos de ${entityType}:`, error);
            }
        };

        fetchFavorites();
    }, [token, user, entityType]);

    return { favoriteIds };
};