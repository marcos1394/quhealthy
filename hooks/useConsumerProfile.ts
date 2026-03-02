// src/hooks/useConsumerProfile.ts
import { useState, useCallback } from 'react';
import { consumerProfileService } from '@/services/consumerProfile.service';
import { ConsumerProfile, defaultConsumerProfile } from '@/types/consumerProfile';
import { toast } from 'react-toastify';

export const useConsumerProfile = () => {
  const [profile, setProfile] = useState<ConsumerProfile>(defaultConsumerProfile);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  /**
   * Carga el perfil desde el backend y limpia los posibles nulos
   */
  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await consumerProfileService.getProfile();
      
      // Combinamos el perfil por defecto con la data que llega del backend
      // Esto asegura que si el backend manda "fullName: null", se convierta en ""
      const safeData: ConsumerProfile = {
        ...defaultConsumerProfile,
        ...data,
        // Nos aseguramos de que los objetos anidados no sean null
        healthGoals: data.healthGoals || [],
        servicePreferences: data.servicePreferences || [],
        interestInActivities: data.interestInActivities || defaultConsumerProfile.interestInActivities
      };
      
      setProfile(safeData);
    } catch (error: any) {
      console.error("Error al cargar el perfil del paciente:", error);
      toast.error("No pudimos cargar tu información médica.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Guarda los cambios en el backend
   */
  const updateProfile = async (data: ConsumerProfile): Promise<boolean> => {
    setIsSaving(true);
    try {
      const updatedProfile = await consumerProfileService.updateProfile(data);
      
      setProfile({
        ...defaultConsumerProfile,
        ...updatedProfile
      });
      
      return true; // Retornamos true para que la UI sepa que fue exitoso
    } catch (error: any) {
      console.error("Error al guardar el perfil:", error);
      toast.error("Ocurrió un error al guardar tus cambios.");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    profile,
    isLoading,
    isSaving,
    fetchProfile,
    updateProfile
  };
};