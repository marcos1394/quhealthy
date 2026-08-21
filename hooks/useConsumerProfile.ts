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
      const pb = (data?.personalBackground as Record<string, string>) || {};

      // Combinamos el perfil por defecto con la data que llega del backend.
      // Esto asegura que si el backend manda nulls, se usan los defaults.
      const safeData: ConsumerProfile = {
        ...defaultConsumerProfile,
        ...data,
        curp: data.curp || pb.curp || "",
        rfc: pb.rfc || "",
        ethnicGroup: data.ethnicGroup || pb.ethnicGroup || "",
        healthInsurance: data.healthInsurance || pb.healthInsurance || "",
        insuranceType: pb.insuranceType || (data.healthInsurance ? "PUBLIC" : "NONE"),
        insuranceProvider: pb.insuranceProvider || data.healthInsurance || "",
        insurancePolicyNumber: pb.insurancePolicyNumber || "",
        insurancePlanName: pb.insurancePlanName || "",
        maritalStatus: pb.maritalStatus || "",
        occupation: pb.occupation || "",
        nationality: pb.nationality || "Mexicana",
        organDonor: pb.organDonor || "FAMILY_DECIDES",
        addressStreet: pb.addressStreet || "",
        addressCity: pb.addressCity || data.location || "",
        addressState: pb.addressState || "",
        addressPostalCode: pb.addressPostalCode || "",
        emergencyContactRelationship: pb.emergencyContactRelationship || "",
        emergencyContactPhoneAlt: pb.emergencyContactPhoneAlt || "",
        chronicDiseases: pb.chronicDiseases || "",
        surgeries: pb.surgeries || "",
        implantsDevices: pb.implantsDevices || "",
        vaccinations: pb.vaccinations || "",
        primaryPhysician: pb.primaryPhysician || "",
        // Nos aseguramos de que los arrays nunca sean null
        medicalConditions: data.medicalConditions ?? [],
        allergies: data.allergies ?? [],
        currentMedications: data.currentMedications ?? [],
        healthGoals: data.healthGoals ?? [],
        preferredModality: data.preferredModality ?? "",
        bloodType: data.bloodType ?? "",
        emergencyContactName: data.emergencyContactName ?? "",
        emergencyContactPhone: data.emergencyContactPhone ?? "",
      };

      setProfile(safeData);
    } catch (error: any) {
      console.error("Error al cargar el perfil del paciente:", error);
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
      // Sincronizamos los campos extendidos dentro de personalBackground para persistencia JSONB
      const personalBackground = {
        ...((data.personalBackground as Record<string, string>) || {}),
        curp: data.curp || "",
        rfc: data.rfc || "",
        ethnicGroup: data.ethnicGroup || "",
        healthInsurance: data.insuranceProvider
          ? `${data.insuranceProvider}${data.insurancePolicyNumber ? ` - ${data.insurancePolicyNumber}` : ""}`
          : data.healthInsurance || "",
        insuranceType: data.insuranceType || "NONE",
        insuranceProvider: data.insuranceProvider || "",
        insurancePolicyNumber: data.insurancePolicyNumber || "",
        insurancePlanName: data.insurancePlanName || "",
        maritalStatus: data.maritalStatus || "",
        occupation: data.occupation || "",
        nationality: data.nationality || "Mexicana",
        organDonor: data.organDonor || "FAMILY_DECIDES",
        addressStreet: data.addressStreet || "",
        addressCity: data.addressCity || data.location || "",
        addressState: data.addressState || "",
        addressPostalCode: data.addressPostalCode || "",
        emergencyContactRelationship: data.emergencyContactRelationship || "",
        emergencyContactPhoneAlt: data.emergencyContactPhoneAlt || "",
        chronicDiseases: data.chronicDiseases || "",
        surgeries: data.surgeries || "",
        implantsDevices: data.implantsDevices || "",
        vaccinations: data.vaccinations || "",
        primaryPhysician: data.primaryPhysician || "",
      };

      const payload: ConsumerProfile = {
        ...data,
        curp: data.curp,
        healthInsurance: personalBackground.healthInsurance,
        location: data.addressCity || data.location,
        personalBackground,
      };

      const updatedProfile = await consumerProfileService.updateProfile(payload);

      setProfile({
        ...defaultConsumerProfile,
        ...data,
        ...updatedProfile,
        personalBackground,
      });

      return true;
    } catch (error: any) {
      console.error("Error al guardar el perfil:", error);
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