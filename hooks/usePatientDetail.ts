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

  const fetchData = useCallback(async () => {
    if (!patientDirectoryId) return;
    setIsLoading(true);
    setHasAccessError(false);

    try {
      // Cargamos el perfil básico siempre
      const profileData = await patientDetailService.getPatientProfile(patientDirectoryId);
      setProfile(profileData);

      const [historyResult, healthResult] = await Promise.allSettled([
        patientDetailService.getMedicalHistory(patientDirectoryId),
        patientDetailService.getHealthProfile(patientDirectoryId)
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

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    profile,
    history,
    healthProfile,
    isLoading,
    isUpdating,
    hasAccessError,
    updateHealthProfile,
    refetch: fetchData
  };
};