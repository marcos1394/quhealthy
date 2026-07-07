import { useState, useEffect, useCallback } from 'react';
import { patientDetailService } from '@/services/patientDetail.service';
import { MedicalHistoryResponse, PatientDirectoryProfile } from '@/types/medicalHistory';
import { PatientHealthProfile } from '@/types/healthProfile';
import { handleApiError } from '@/lib/handleApiError';
import { toast } from 'react-toastify';

export const usePatientDetail = (patientDirectoryId: number) => {
  const [profile, setProfile] = useState<PatientDirectoryProfile | null>(null);
  const [history, setHistory] = useState<MedicalHistoryResponse | null>(null);
  const [healthProfile, setHealthProfile] = useState<PatientHealthProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [hasAccessError, setHasAccessError] = useState<boolean>(false);
  const [vaultDocuments, setVaultDocuments] = useState<any[]>([]);

  const fetchData = useCallback(async () => {
    if (!patientDirectoryId) return;
    setIsLoading(true);
    setHasAccessError(false);

    try {
      // Cargamos el perfil básico siempre
      const profileData = await patientDetailService.getPatientProfile(patientDirectoryId);
      setProfile(profileData);

      const [historyResult, healthResult, vaultResult] = await Promise.allSettled([
        patientDetailService.getMedicalHistory(patientDirectoryId),
        patientDetailService.getHealthProfile(patientDirectoryId),
        profileData.consumerId ? import('@/services/ehr.service').then(m => m.ehrService.getPatientVault(profileData.consumerId)) : Promise.resolve([])
      ]);

      if (historyResult.status === 'fulfilled') {
        setHistory(historyResult.value);
      } else {
        const error = historyResult.reason;
        if (error?.response?.status === 403 || error?.response?.status === 401) {
          setHasAccessError(true);
        }
        setHistory({
          consumerId: profileData.consumerId,
          totalConsultations: 0,
          timeline: []
        });
      }

      if (healthResult.status === 'fulfilled') {
        setHealthProfile(healthResult.value);
      } else {
        setHealthProfile(null);
      }

      if (vaultResult.status === 'fulfilled') {
        setVaultDocuments(vaultResult.value);
      } else {
        setVaultDocuments([]);
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  }, [patientDirectoryId]);

  const updateHealthProfile = async (payload: Partial<PatientHealthProfile>) => {
    setIsUpdating(true);
    try {
      const updated = await patientDetailService.updateHealthProfile(patientDirectoryId, payload);
      setHealthProfile(updated);
      toast.success('Informacion clinica actualizada');
      return true;
    } catch (error) {
      handleApiError(error);
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const addActiveProblem = async (problem: any) => {
    setIsUpdating(true);
    try {
      await patientDetailService.addActiveProblem(patientDirectoryId, problem);
      toast.success('Problema activo registrado');
      await fetchData();
      return true;
    } catch (error) {
      handleApiError(error);
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteActiveProblem = async (problemId: number) => {
    setIsUpdating(true);
    try {
      await patientDetailService.deleteActiveProblem(patientDirectoryId, problemId);
      toast.success('Problema activo eliminado');
      await fetchData();
      return true;
    } catch (error) {
      handleApiError(error);
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const addAllergy = async (allergy: any) => {
    setIsUpdating(true);
    try {
      await patientDetailService.addAllergy(patientDirectoryId, allergy);
      toast.success('Alergia registrada');
      await fetchData();
      return true;
    } catch (error) {
      handleApiError(error);
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteAllergy = async (allergyId: number) => {
    setIsUpdating(true);
    try {
      await patientDetailService.deleteAllergy(patientDirectoryId, allergyId);
      toast.success('Alergia eliminada');
      await fetchData();
      return true;
    } catch (error) {
      handleApiError(error);
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const addMedication = async (medication: any) => {
    setIsUpdating(true);
    try {
      await patientDetailService.addMedication(patientDirectoryId, medication);
      toast.success('Medicamento registrado');
      await fetchData();
      return true;
    } catch (error) {
      handleApiError(error);
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteMedication = async (medicationId: number) => {
    setIsUpdating(true);
    try {
      await patientDetailService.deleteMedication(patientDirectoryId, medicationId);
      toast.success('Medicamento eliminado');
      await fetchData();
      return true;
    } catch (error) {
      handleApiError(error);
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    profile,
    history,
    healthProfile,
    vaultDocuments,
    isLoading,
    isUpdating,
    hasAccessError,
    updateHealthProfile,
    addActiveProblem,
    deleteActiveProblem,
    addAllergy,
    deleteAllergy,
    addMedication,
    deleteMedication,
    refetch: fetchData
  };
};