import { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';
import { handleApiError } from '@/lib/handleApiError';
import { onboardingService } from '@/services/onboarding.service';
import { KycDocumentType, KycDocumentResponse, PersonType } from '@/types/onboarding';

export const useKycOnboarding = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [documents, setDocuments] = useState<Partial<Record<KycDocumentType, KycDocumentResponse>>>({});
  const [uploadingState, setUploadingState] = useState<Partial<Record<KycDocumentType, boolean>>>({});
  const [personType, setPersonType] = useState<PersonType>('FISICA');

  const startPolling = useCallback((type: KycDocumentType) => {
    setUploadingState(prev => ({ ...prev, [type]: true }));
    onboardingService.pollKycDocumentStatus(type)
      .then(response => {
        setDocuments(prev => ({ ...prev, [type]: response }));
        if (response.verificationStatus === 'APPROVED') {
          toast.success("✅ Documento verificado correctamente.");
        } else if (response.verificationStatus === 'REJECTED') {
          return;
        }
      })
      .catch(err => {
        console.error("Polling timeout/error", err);
        handleApiError(err);
      })
      .finally(() => {
        setUploadingState(prev => ({ ...prev, [type]: false }));
      });
  }, []);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [docs, status] = await Promise.all([
        onboardingService.getKycDocuments(),
        onboardingService.getOnboardingStatus()
      ]);

      setPersonType(status.personType || 'FISICA');

      const docsMap: Partial<Record<KycDocumentType, KycDocumentResponse>> = {};
      docs.forEach(d => {
        docsMap[d.documentType] = d;
      });
      setDocuments(docsMap);

      docs.forEach(d => {
        if (d.verificationStatus === 'PROCESSING') {
          startPolling(d.documentType);
        }
      });

    } catch (error) {
      console.error("Error cargando datos KYC", error);
    } finally {
      setIsLoading(false);
    }
  }, [startPolling]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const uploadDocument = async (file: File, type: KycDocumentType) => {
    setUploadingState(prev => ({ ...prev, [type]: true }));
    try {
      if (type === 'SELFIE') {
        const hasIne = documents['INE_FRONT']?.verificationStatus === 'APPROVED' && documents['INE_BACK']?.verificationStatus === 'APPROVED';
        const hasPassport = documents['PASSPORT']?.verificationStatus === 'APPROVED';
        if (!hasIne && !hasPassport) {
          throw new Error("Primero debes aprobar tu Identificación Oficial.");
        }
      }

      const response = await onboardingService.uploadKycDocument(file, type);
      setDocuments(prev => ({ ...prev, [type]: response }));

      if (response.verificationStatus === 'APPROVED') {
        toast.success("✅ Documento verificado correctamente.");
      } else if (response.verificationStatus === 'REJECTED') {
        return;
      } else if (response.verificationStatus === 'PROCESSING') {
        // We leave uploadingState true intentionally until polling finishes
        startPolling(type);
      } else {
        toast.info("⏳ Documento en revisión manual.");
      }
    } catch (error: any) {
      console.error(`Error subiendo ${type}:`, error);
      const msg = error.response?.data?.message || error.message || "Error al subir.";
      return;
      setUploadingState(prev => ({ ...prev, [type]: false }));
    }
  };

  const isKycComplete = (): boolean => {
    const ineFront = documents['INE_FRONT']?.verificationStatus === 'APPROVED';
    const ineBack = documents['INE_BACK']?.verificationStatus === 'APPROVED';
    const passport = documents['PASSPORT']?.verificationStatus === 'APPROVED';
    const idReady = (ineFront && ineBack) || passport;

    // Acta constitutva verification
    const actaConstitutiva = documents['ACTA_CONSTITUTIVA']?.verificationStatus === 'APPROVED';
    const legalDocReady = personType === 'MORAL' ? actaConstitutiva : true;

    const selfieReady = documents['SELFIE']?.verificationStatus === 'APPROVED';

    return !!(idReady && legalDocReady && selfieReady);
  };

  return {
    documents,
    isLoading,
    uploadingState,
    uploadDocument,
    isKycComplete,
    personType,
    refetch: loadData
  };
};