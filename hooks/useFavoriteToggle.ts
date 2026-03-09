// src/hooks/useFavoriteToggle.ts
import { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';
import { handleApiError } from '@/lib/handleApiError';
import { favoriteService } from '@/services/favorite.service';

export const useFavoriteToggle = (
    entityType: 'PROVIDER' | 'PACKAGE' | 'COURSE' | 'PRODUCT',
    entityId: number,
    initialState: boolean = false
) => {
    const [isFavorite, setIsFavorite] = useState(initialState);
    const [isLoading, setIsLoading] = useState(false);

    // 🚀 NUEVO: Si el estado inicial llega tarde (después de consultar al backend), actualizamos el corazón
    useEffect(() => {
        setIsFavorite(initialState);
    }, [initialState]);

    const toggleFavorite = useCallback(async (e?: React.MouseEvent) => {
        if (e) {
            e.stopPropagation(); // Evita que el clic en el corazón abra la tarjeta completa
            e.preventDefault();
        }

        const previousState = isFavorite;
        
        // 1. Actualización Optimista (Cambio instantáneo en UI)
        setIsFavorite(!previousState);
        setIsLoading(true);

        try {
            // 2. Petición en background
            if (!previousState) {
                await favoriteService.addFavorite(entityType, entityId);
            } else {
                await favoriteService.removeFavorite(entityType, entityId);
            }
        } catch (error) {
            console.error("❌ Error toggling favorite:", error);
            // 3. Rollback si falla
            setIsFavorite(previousState);
            return;
        } finally {
            setIsLoading(false);
        }
    }, [entityType, entityId, isFavorite]);

    return { isFavorite, toggleFavorite, isLoading };
};