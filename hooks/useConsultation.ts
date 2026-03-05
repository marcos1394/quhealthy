// src/hooks/useConsultation.ts
import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { ehrService } from '@/services/ehr.service';
import { 
  PatientClinicalProfile, 
  VaultDocument, 
  SoapNotes, 
  PrescriptionItem 
} from '@/types/ehr';
import { v4 as uuidv4 } from 'uuid'; // Asegúrate de tener npm install uuid

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
      toast.error(errorMsg, { theme: 'colored' });
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
   */
  const completeConsultation = async (successMsg: string, errorMsg: string): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      // Preparamos el payload. El backend puede recibir las notas como un JSON stringificado
      // o puedes adaptar esto si tu backend prefiere un formato específico.
      const payload = {
        notes: JSON.stringify(soapNotes), 
        // Filtramos el ID temporal de React antes de enviar al backend
        prescriptionItems: prescription.map(({ id, ...rest }) => rest),
        sendPrescriptionToVault: prescription.length > 0
      };

      await ehrService.completeConsultation(appointmentId, payload);
      toast.success(successMsg, { theme: 'colored' });
      return true;
    } catch (error) {
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