import { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';
import { onboardingService } from '@/services/onboarding.service';
import { KycDocumentResponse, PersonType } from '@/types/onboarding';

/**
 * 🚀 Hook refactorizado: Los documentos fiscales ahora se gestionan como
 * documentos KYC, usando el endpoint unificado POST /api/onboarding/kyc/upload.
 * type = 'TAX_CERTIFICATE' para Constancia Fiscal
 * type = 'ACTA_CONSTITUTIVA' para Acta Constitutiva (Persona Moral)
 * type = 'CSD_CERTIFICATE' para Certificado de Sello Digital (.cer)
 * type = 'CSD_KEY' para Llave Privada del CSD (.key)
 *
 * Ya no existen endpoints separados de Fiscal/License en el backend.
 * El estado fiscal se obtiene del OnboardingStatus (fiscalStatus).
 */
export const useFiscalOnboarding = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);

    const [personType, setPersonType] = useState<PersonType>('FISICA');
    const [taxCertificate, setTaxCertificate] = useState<KycDocumentResponse | null>(null);
    const [actaConstitutiva, setActaConstitutiva] = useState<KycDocumentResponse | null>(null);
    const [csdCertificate, setCsdCertificate] = useState<KycDocumentResponse | null>(null);
    const [csdKey, setCsdKey] = useState<KycDocumentResponse | null>(null);

    const loadData = useCallback(async () => {
        try {
            setIsLoading(true);
            const [status, documents] = await Promise.all([
                onboardingService.getOnboardingStatus(),
                onboardingService.getKycDocuments(),
            ]);

            setPersonType(status.personType || 'FISICA');

            // Buscamos los documentos fiscales en la lista KYC
            const taxDoc = documents.find(d => d.documentType === 'TAX_CERTIFICATE') || null;
            const actaDoc = documents.find(d => d.documentType === 'ACTA_CONSTITUTIVA') || null;
            const csdCerDoc = documents.find(d => d.documentType === 'CSD_CERTIFICATE') || null;
            const csdKeyDoc = documents.find(d => d.documentType === 'CSD_KEY') || null;
            setTaxCertificate(taxDoc);
            setActaConstitutiva(actaDoc);
            setCsdCertificate(csdCerDoc);
            setCsdKey(csdKeyDoc);
        } catch (error) {
            console.error("Error cargando datos fiscales", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const uploadDocument = async (file: File, docType: 'TAX_CERTIFICATE' | 'ACTA_CONSTITUTIVA' | 'CSD_CERTIFICATE' | 'CSD_KEY') => {
        setIsUploading(true);
        const isCsd = docType === 'CSD_CERTIFICATE' || docType === 'CSD_KEY';
        const toastId = toast.loading(
            isCsd ? "Validando archivo CSD..." : "Analizando tu documento con IA... esto puede tardar unos segundos."
        );

        try {
            const response = await onboardingService.uploadKycDocument(file, docType);

            if (docType === 'TAX_CERTIFICATE') {
                setTaxCertificate(response);
            } else if (docType === 'ACTA_CONSTITUTIVA') {
                setActaConstitutiva(response);
            } else if (docType === 'CSD_CERTIFICATE') {
                setCsdCertificate(response);
            } else {
                setCsdKey(response);
            }

            if (response.verificationStatus === 'APPROVED') {
                toast.update(toastId, {
                    render: isCsd ? `✅ Archivo CSD verificado correctamente` : `✅ Documento fiscal verificado correctamente`,
                    type: "success", isLoading: false, autoClose: 5000
                });
            } else if (response.verificationStatus === 'REJECTED') {
                toast.update(toastId, {
                    render: `❌ Archivo rechazado: ${response.rejectionReason || "No válido"}`,
                    type: "error", isLoading: false, autoClose: 5000
                });
            } else {
                toast.update(toastId, {
                    render: "📋 Documento recibido, en proceso de verificación...",
                    type: "info", isLoading: false, autoClose: 5000
                });
            }
            return response;
        } catch (error: any) {
            console.error("Error subiendo documento:", error);
            const msg = error.response?.data?.message || "Error al procesar el documento.";
            toast.update(toastId, {
                render: `Error: ${msg}`,
                type: "error", isLoading: false, autoClose: 4000
            });
            return null;
        } finally {
            setIsUploading(false);
        }
    };

    return {
        taxCertificate,
        actaConstitutiva,
        csdCertificate,
        csdKey,
        personType,
        isLoading,
        isUploading,
        uploadDocument,
        refetch: loadData
    };
};
