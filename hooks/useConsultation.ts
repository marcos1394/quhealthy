// Ubicación: src/hooks/useConsultation.ts
import { useState, useCallback, useEffect } from 'react';
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
  const [patientProfile, setPatientProfile] = useState<PatientClinicalProfile | null>(null);
  const [vaultDocuments, setVaultDocuments] = useState<VaultDocument[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [soapNotes, setSoapNotes] = useState<SoapNotes>({
    subjective: '',
    objective: '',
    assessment: '',
    plan: ''
  });

  const [prescription, setPrescription] = useState<PrescriptionItem[]>([]);

  // 🚀 PLUS FU-003: RECUPERAR RESPALDO LOCAL AL MONTAR (Opcional pero recomendado)
  useEffect(() => {
    const draft = localStorage.getItem(`draft_consultation_${appointmentId}`);
    if (draft) {
      try {
        const parsedDraft = JSON.parse(draft);
        if (parsedDraft.clinicalNotes) setSoapNotes(parsedDraft.clinicalNotes);
        toast.info("Se ha recuperado un borrador no guardado de esta consulta.", { autoClose: 5000 });
      } catch (e) {
        console.error("Error al parsear el borrador local", e);
      }
    }
  }, [appointmentId]);

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
    } finally {
      setIsLoading(false);
    }
  }, [consumerId]);

  const addPrescriptionItem = (item: Omit<PrescriptionItem, 'id'>) => {
    const newItem: PrescriptionItem = { ...item, id: uuidv4() };
    setPrescription(prev => [...prev, newItem]);
  };

  const removePrescriptionItem = (id: string) => {
    setPrescription(prev => prev.filter(item => item.id !== id));
  };

  const updateSoapNote = (field: keyof SoapNotes, value: string) => {
    setSoapNotes(prev => ({ ...prev, [field]: value }));
  };

  const completeConsultation = async (successMsg: string, errorMsg: string): Promise<boolean> => {
    setIsSubmitting(true);
    
    // 1. Armamos el payload estructurado (Logro de la FF-004)
    const payload = {
      clinicalNotes: {
        subjective: soapNotes.subjective,
        objective: soapNotes.objective,
        assessment: soapNotes.assessment,
        plan: soapNotes.plan
      },
      prescriptionItems: prescription.map(({ id, ...rest }) => rest),
      sendPrescriptionToVault: prescription.length > 0
    };

    // 2. 🛡️ FIX FU-003: RESPALDO DE EMERGENCIA EN LOCALSTORAGE ANTES DE ENVIAR
    try {
      localStorage.setItem(`draft_consultation_${appointmentId}`, JSON.stringify(payload));
    } catch (storageError) {
      console.warn("No se pudo guardar el respaldo local:", storageError);
    }

    try {
      // 3. Intento de envío al Backend
      await ehrService.completeConsultation(appointmentId, payload);
      
      // 4. Si el backend responde 200 OK, borramos el respaldo de emergencia
      localStorage.removeItem(`draft_consultation_${appointmentId}`);
      
      toast.success(successMsg, { theme: 'colored' });
      return true;

    } catch (error) {
      console.error(error);
      handleApiError(error); 
      
      // 🚨 FIX FU-003: MENSAJE CRÍTICO PERSISTENTE
      toast.error(
        'Error crítico al guardar la consulta. NO CIERRES ESTA PANTALLA. Por favor, revisa tu conexión e intenta de nuevo.', 
        { 
          theme: 'colored', 
          autoClose: false, // El mensaje se queda pegado hasta que el doctor lo cierre
          closeOnClick: false,
          draggable: false
        }
      );
      return false; // El doctor se queda en la pantalla
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