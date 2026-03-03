// src/hooks/usePackages.ts
import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import { useSessionStore } from '@/stores/SessionStore';
import { packageService } from '@/services/package.service';
import { ConsumerPackage } from '@/types/packages';

export const usePackages = () => {
    const { token, user } = useSessionStore();
    const t = useTranslations('PatientPackages'); // Asumiendo que tu diccionario tiene esta llave
    
    // Estados
    const [packages, setPackages] = useState<ConsumerPackage[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    /**
     * Función principal para cargar la billetera.
     * Envuelto en useCallback para permitir refetching manual seguro.
     */
    const fetchPackages = useCallback(async () => {
        // Si no hay token, no intentamos hacer la llamada para evitar 401s innecesarios
        if (!token || !user) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const data = await packageService.getMyPackages();
            setPackages(data);
        } catch (err: any) {
            console.error("❌ Error cargando los paquetes del paciente:", err);
            
            // Extraer mensaje del backend o usar fallback del diccionario
            const errorMessage = err.response?.data?.message 
                || t('toast_error', { defaultValue: 'No pudimos cargar tus suscripciones. Intenta de nuevo.' });
            
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [token, user, t]);

    // Disparador inicial cuando el componente se monta y el token está listo
    useEffect(() => {
        fetchPackages();
    }, [fetchPackages]);

    return {
        packages,
        isLoading,
        error,
        refetch: fetchPackages // 🚀 Exponemos esta función por si pones un botón de "Pull to refresh"
    };
};