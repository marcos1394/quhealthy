// Ubicación: src/hooks/useConsultation.ts
import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { handleApiError } from '@/lib/handleApiError';
import { ehrService } from '@/services/ehr.service';
import { 
  PatientClinicalProfile, 
  VaultDocument, 
  SoapNotes, 
  PrescriptionItem 
} from '@/types/ehr';
import { v4 as uuidv4 } from 'uuid'; 

export const useConsultation = (appointmentId: number, consumerId: number) => {
  // Estados de datos
  const [patientProfile, setPatientProfile] = useState<PatientClinicalProfile | null>(null);
  const [vaultDocuments, setVaultDocuments] = useState<VaultDocument[]>([]);
  
  // Estados de carga y envío
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estado del Formulario SOAP
  const [soapNotes, setSoapNotes] = useState<SoapNotes>({
    subjective: '',
    objective: '',
    assessment: '',
    plan: ''
  });

  // Estado de la Receta Digital
  const [prescription, setPrescription] = useState<PrescriptionItem[]>([]);

  /**
   * 📥 Carga el Expediente y la Bóveda en paralelo
   */
  const loadPatientRecord = useCallback(async (errorMsg: string) => {
    setIsLoading(true);
    try {
      const [profileData, vaultData] = await Promise.all([
        ehrService.getPatientProfile(consumerId),
        ehrService.getPatientVault(consumerId)
      ]);
      setPatientProfile(profileData);
      setVaultDocuments(vaultData || []);
    } catch (error) {
      console.error("Error loading patient record:", error);
      // Opcional: handleApiError(error) si quieres mostrar un toast de error al cargar
      return;
    } finally {
      setIsLoading(false);
    }
  }, [consumerId]);

  /**
   * 💊 Manejo de la Receta
   */
  const addPrescriptionItem = (item: Omit<PrescriptionItem, 'id'>) => {
    const newItem: PrescriptionItem = { ...item, id: uuidv4() };
    setPrescription(prev => [...prev, newItem]);
  };

  const removePrescriptionItem = (id: string) => {
    setPrescription(prev => prev.filter(item => item.id !== id));
  };

  /**
   * 📝 Manejo de Notas SOAP
   */
  const updateSoapNote = (field: keyof SoapNotes, value: string) => {
    setSoapNotes(prev => ({ ...prev, [field]: value }));
  };

  /**
   * 🏁 Finalizar Consulta
   * 🚀 FIX FF-004: Payload estructurado basado en CompleteConsultationRequest.java
   */
  const completeConsultation = async (successMsg: string, errorMsg: string): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      // Construimos el JSON anidado que espera Spring Boot
      const payload = {
        clinicalNotes: {
          subjective: soapNotes.subjective,
          objective: soapNotes.objective,
          assessment: soapNotes.assessment,
          plan: soapNotes.plan
        },
        // Filtramos el ID temporal de React antes de enviar al backend
        prescriptionItems: prescription.map(({ id, ...rest }) => rest),
        sendPrescriptionToVault: prescription.length > 0
      };

      await ehrService.completeConsultation(appointmentId, payload);
      toast.success(successMsg, { theme: 'colored' });
      return true;
    } catch (error) {
      console.error(error);
      handleApiError(error); // Manejo estandarizado de errores
      toast.error(errorMsg, { theme: 'colored' });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    patientProfile,
    vaultDocuments,
    isLoading,
    isSubmitting,
    soapNotes,
    prescription,
    loadPatientRecord,
    updateSoapNote,
    addPrescriptionItem,
    removePrescriptionItem,
    completeConsultation
  };
};