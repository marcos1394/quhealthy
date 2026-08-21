// src/hooks/useConsumerProfile.ts
import { useState, useCallback } from 'react';
import { consumerProfileService } from '@/services/consumerProfile.service';
import { ConsumerProfile, defaultConsumerProfile } from '@/types/consumerProfile';
import { toast } from 'react-toastify';
import { handleApiError } from '@/lib/handleApiError';

const SYSTEM_KEYS = new Set([
  "curp",
  "rfc",
  "ethnicGroup",
  "healthInsurance",
  "insuranceType",
  "insuranceProvider",
  "insurancePolicyNumber",
  "insurancePlanName",
  "maritalStatus",
  "occupation",
  "nationality",
  "organDonor",
  "addressStreet",
  "addressCity",
  "addressState",
  "addressPostalCode",
  "emergencyContactRelationship",
  "emergencyContactPhoneAlt",
  "emergencyContactName",
  "emergencyContactPhone",
  "chronicDiseases",
  "surgeries",
  "implantsDevices",
  "vaccinations",
  "primaryPhysician",
]);

function cleanSystemKeys(map?: Record<string, any> | null): Record<string, string> {
  if (!map) return {};
  const cleaned: Record<string, string> = {};
  for (const [k, v] of Object.entries(map)) {
    if (!SYSTEM_KEYS.has(k) && v !== undefined && v !== null) {
      cleaned[k] = typeof v === "string" ? v : JSON.stringify(v);
    }
  }
  return cleaned;
}

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
      const safeData: ConsumerProfile = {
        ...defaultConsumerProfile,
        ...data,
        curp: data.curp || pb.curp || "",
        rfc: data.rfc || pb.rfc || "",
        ethnicGroup: data.ethnicGroup || pb.ethnicGroup || "",
        healthInsurance: data.healthInsurance || pb.healthInsurance || "",
        insuranceType: data.insuranceType || pb.insuranceType || (data.healthInsurance ? "PUBLIC" : "NONE"),
        insuranceProvider: data.insuranceProvider || pb.insuranceProvider || data.healthInsurance || "",
        insurancePolicyNumber: data.insurancePolicyNumber || pb.insurancePolicyNumber || "",
        insurancePlanName: data.insurancePlanName || pb.insurancePlanName || "",
        maritalStatus: data.maritalStatus || pb.maritalStatus || "",
        occupation: data.occupation || pb.occupation || "",
        nationality: data.nationality || pb.nationality || "Mexicana",
        organDonor: data.organDonor || pb.organDonor || "FAMILY_DECIDES",
        addressStreet: data.addressStreet || pb.addressStreet || "",
        addressCity: data.addressCity || data.location || pb.addressCity || "",
        addressState: data.addressState || pb.addressState || "",
        addressPostalCode: data.addressPostalCode || pb.addressPostalCode || "",
        emergencyContactRelationship: data.emergencyContactRelationship || pb.emergencyContactRelationship || "",
        emergencyContactPhoneAlt: data.emergencyContactPhoneAlt || pb.emergencyContactPhoneAlt || "",
        chronicDiseases: data.chronicDiseases || pb.chronicDiseases || "",
        surgeries: data.surgeries || pb.surgeries || "",
        implantsDevices: data.implantsDevices || pb.implantsDevices || "",
        vaccinations: data.vaccinations || pb.vaccinations || "",
        primaryPhysician: data.primaryPhysician || pb.primaryPhysician || "",
        // Nos aseguramos de que los arrays nunca sean null
        medicalConditions: data.medicalConditions ?? [],
        allergies: data.allergies ?? [],
        currentMedications: data.currentMedications ?? [],
        healthGoals: data.healthGoals ?? [],
        preferredModality: data.preferredModality ?? "",
        bloodType: data.bloodType ?? "",
        emergencyContactName: data.emergencyContactName ?? "",
        emergencyContactPhone: data.emergencyContactPhone ?? "",
        // Limpiamos personalBackground para que no contenga llaves del sistema
        personalBackground: cleanSystemKeys(data.personalBackground),
        familyBackground: cleanSystemKeys(data.familyBackground),
        socialBackground: cleanSystemKeys(data.socialBackground),
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
      const payload: ConsumerProfile = {
        ...data,
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
        location: data.addressCity || data.location || "",
        emergencyContactRelationship: data.emergencyContactRelationship || "",
        emergencyContactPhoneAlt: data.emergencyContactPhoneAlt || "",
        chronicDiseases: data.chronicDiseases || "",
        surgeries: data.surgeries || "",
        implantsDevices: data.implantsDevices || "",
        vaccinations: data.vaccinations || "",
        primaryPhysician: data.primaryPhysician || "",
        personalBackground: cleanSystemKeys(data.personalBackground),
        familyBackground: cleanSystemKeys(data.familyBackground),
        socialBackground: cleanSystemKeys(data.socialBackground),
      };

      const updatedProfile = await consumerProfileService.updateProfile(payload);

      setProfile({
        ...defaultConsumerProfile,
        ...data,
        ...updatedProfile,
        personalBackground: cleanSystemKeys(updatedProfile.personalBackground || data.personalBackground),
        familyBackground: cleanSystemKeys(updatedProfile.familyBackground || data.familyBackground),
        socialBackground: cleanSystemKeys(updatedProfile.socialBackground || data.socialBackground),
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