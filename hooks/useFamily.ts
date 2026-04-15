// src/hooks/useFamily.ts
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { handleApiError } from '@/lib/handleApiError';
import { dependentService } from '@/services/dependent.service';
import { Dependent, DependentRequest } from '@/types/dependent';

export const useFamily = () => {
    const [family, setFamily] = useState<Dependent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchFamily = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await dependentService.getMyFamily();
            setFamily(data);
        } catch (error) {
            console.error("Error cargando familiares:", error);
            return;
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFamily();
    }, [fetchFamily]);

    const addMember = async (data: DependentRequest, onSuccess?: () => void) => {
        setIsSubmitting(true);
        try {
            const newMember = await dependentService.addDependent(data);
            setFamily(prev => [...prev, newMember]);
            toast.success("Familiar agregado con éxito.");
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error("Error agregando familiar:", error);
            return;
        } finally {
            setIsSubmitting(false);
        }
    };

    // 🚀 NUEVO: Conecta con PUT /api/auth/me/dependents/{id}
    const updateMember = async (id: number, data: DependentRequest, onSuccess?: () => void) => {
        setIsSubmitting(true);
        try {
            const updated = await dependentService.updateDependent(id, data);
            setFamily(prev => prev.map(member => member.id === id ? updated : member));
            toast.success("Familiar actualizado con éxito.");
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error("Error actualizando familiar:", error);
            return;
        } finally {
            setIsSubmitting(false);
        }
    };

    const removeMember = async (id: number) => {
        try {
            await dependentService.deleteDependent(id);
            setFamily(prev => prev.filter(member => member.id !== id));
            toast.success("Familiar eliminado.");
        } catch (error) {
            console.error("Error eliminando familiar:", error);
            return;
        }
    };

    return { family, isLoading, isSubmitting, addMember, updateMember, removeMember, refetch: fetchFamily };
};