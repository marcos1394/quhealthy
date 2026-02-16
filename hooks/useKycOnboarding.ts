import { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';
import { onboardingService } from '@/services/onboarding.service';
// 1. Asegúrate de importar DocumentType de tus tipos
import { DocumentType, KycDocumentResponse } from '@/types/onboarding';

export const useKycOnboarding = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [documents, setDocuments] = useState<Partial<Record<DocumentType, KycDocumentResponse>>>({});
  const [uploadingState, setUploadingState] = useState<Partial<Record<DocumentType, boolean>>>({});

  const loadDocuments = useCallback(async () => {
    try {
      const docs = await onboardingService.getKycDocuments();
      const docsMap: Partial<Record<DocumentType, KycDocumentResponse>> = {};
      
      docs.forEach(d => {
        // Forzamos a TS a entender que el string del backend es un tipo válido
        docsMap[d.documentType as DocumentType] = d;
      });
      
      setDocuments(docsMap);
    } catch (error) {
      console.error("Error cargando documentos KYC", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  // ✅ CORRECCIÓN AQUÍ:
  // Asegúrate de que 'type' tenga el tipo ': DocumentType' explícito.
  // Si pones ': string' o lo dejas vacío, TS dará el error que ves.
  const uploadDocument = async (file: File, type: DocumentType) => {
    setUploadingState(prev => ({ ...prev, [type]: true }));
    
    try {
      // Validaciones Previas
      if (type === 'SELFIE') {
        const hasIne = documents['INE_FRONT']?.verificationStatus === 'APPROVED';
        const hasPassport = documents['PASSPORT']?.verificationStatus === 'APPROVED';
        
        if (!hasIne && !hasPassport) {
          throw new Error("Primero debes aprobar tu Identificación Oficial.");
        }
      }

      // 🔍 EL ERROR ESTABA AQUÍ:
      // Como ahora 'type' es estrictamente 'DocumentType', el servicio lo acepta felizmente.
      const response = await onboardingService.uploadKycDocument(file, type);
      
      setDocuments(prev => ({ 
        ...prev, 
        [type]: response 
      }));

      if (response.verificationStatus === 'APPROVED') {
        toast.success("✅ Documento verificado correctamente.");
      } else if (response.verificationStatus === 'REJECTED') {
        toast.error(`❌ Rechazado: ${response.rejectionReason || "Documento inválido"}`);
      } else {
        toast.info("⏳ Documento en revisión manual.");
      }

    } catch (error: any) {
      console.error(`Error subiendo ${type}:`, error);
      const msg = error.response?.data?.message || error.message || "Error al subir.";
      toast.error(msg);
    } finally {
      setUploadingState(prev => ({ ...prev, [type]: false }));
    }
  };

  const isKycComplete = (): boolean => {
    const ineFront = documents['INE_FRONT']?.verificationStatus === 'APPROVED';
    const ineBack = documents['INE_BACK']?.verificationStatus === 'APPROVED';
    const passport = documents['PASSPORT']?.verificationStatus === 'APPROVED';
    const idReady = (ineFront && ineBack) || passport;
    const selfieReady = documents['SELFIE']?.verificationStatus === 'APPROVED';
    
    // Si no usas licencia profesional en este paso, quita esta línea
    const licenseReady = documents['PROFESSIONAL_LICENSE']?.verificationStatus === 'APPROVED';

    // Ajusta el return según tus reglas. Ejemplo: solo ID + Selfie
    return !!(idReady && selfieReady);
  };

  return {
    documents,
    isLoading,
    uploadingState,
    uploadDocument,
    isKycComplete,
    refetch: loadDocuments
  };
};