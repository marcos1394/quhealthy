// src/hooks/useFamily.ts
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
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
            toast.error("No se pudo cargar tu perfil familiar.");
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
            toast.error("Ocurrió un error al guardar los datos.");
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
            toast.error("No se pudo eliminar al familiar.");
        }
    };

    return { family, isLoading, isSubmitting, addMember, removeMember, refetch: fetchFamily };
};