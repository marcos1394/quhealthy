import { useState, useEffect, useCallback } from 'react';
import { patientDetailService } from '@/services/patientDetail.service';
import { MedicalHistoryResponse, PatientDirectoryProfile } from '@/types/medicalHistory';
import { handleApiError } from '@/lib/handleApiError';
import { toast } from 'react-toastify';

export const usePatientDetail = (patientDirectoryId: number) => {
  const [profile, setProfile] = useState<PatientDirectoryProfile | null>(null);
  const [history, setHistory] = useState<MedicalHistoryResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasAccessError, setHasAccessError] = useState<boolean>(false);

  const fetchData = useCallback(async () => {
    if (!patientDirectoryId) return;
    setIsLoading(true);
    setHasAccessError(false);

    try {
      // Cargamos el perfil básico siempre
      const profileData = await patientDetailService.getPatientProfile(patientDirectoryId);
      setProfile(profileData);

      // Intentamos cargar el historial (puede fallar si no hay consentimiento)
      try {
        const historyData = await patientDetailService.getMedicalHistory(patientDirectoryId);
        setHistory(historyData);
      } catch (historyError: any) {
        if (historyError.response?.status === 403 || historyError.response?.status === 401) {
          setHasAccessError(true); // El candado de seguridad bloqueó la petición
        } else {
          throw historyError;
        }
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  }, [patientDirectoryId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    profile,
    history,
    isLoading,
    hasAccessError,
    refetch: fetchData
  };
};