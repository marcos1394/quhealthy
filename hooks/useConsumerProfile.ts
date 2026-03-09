// src/hooks/useConsumerProfile.ts
import { useState, useCallback } from 'react';
import { consumerProfileService } from '@/services/consumerProfile.service';
import { ConsumerProfile, defaultConsumerProfile } from '@/types/consumerProfile';
import { toast } from 'react-toastify';
import { handleApiError } from '@/lib/handleApiError';

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

      // Combinamos el perfil por defecto con la data que llega del backend.
      // Esto asegura que si el backend manda nulls, se usan los defaults.
      const safeData: ConsumerProfile = {
        ...defaultConsumerProfile,
        ...data,
        // Nos aseguramos de que los arrays nunca sean null
        medicalConditions: data.medicalConditions ?? [],
        allergies: data.allergies ?? [],
        currentMedications: data.currentMedications ?? [],
        healthGoals: data.healthGoals ?? [],
        preferredModality: data.preferredModality ?? "",
      };

      setProfile(safeData);
    } catch (error: any) {
      console.error("Error al cargar el perfil del paciente:", error);
      return;
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

      return true;
    } catch (error: any) {
      console.error("Error al guardar el perfil:", error);
      return;
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