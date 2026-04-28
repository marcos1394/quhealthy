import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { patientDirectoryService } from '@/services/patientDirectory.service';
import { PatientClient, PatientRegistrationPayload } from '@/types/patient';
import { handleApiError } from '@/lib/handleApiError';
import { useTranslations } from 'next-intl';

export const usePatientDirectory = () => {
  const [clients, setClients] = useState<PatientClient[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const t = useTranslations("DashboardPatients");

  const fetchClients = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await patientDirectoryService.getProviderClients();
      setClients(data);
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createPatient = async (payload: PatientRegistrationPayload) => {
    setIsSubmitting(true);
    try {
      await patientDirectoryService.createOfflinePatient(payload);
      toast.success(t('toast_patient_created', { defaultValue: 'Paciente creado exitosamente' }));
      await fetchClients(); // Recargamos la lista
      return true;
    } catch (error) {
      handleApiError(error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const requestAccess = async (consumerId: number) => {
    try {
      await patientDirectoryService.requestConsent(consumerId);
      toast.success(t('toast_consent_requested', { defaultValue: 'Solicitud de acceso enviada al paciente.' }));
    } catch (error) {
      handleApiError(error);
    }
  };

  return {
    clients,
    isLoading,
    isSubmitting,
    fetchClients,
    createPatient,
    requestAccess
  };
};