import { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';
import { handleApiError } from '@/lib/handleApiError';
import { onboardingService } from '@/services/onboarding.service';
import { FiscalDataResponse, FiscalDataRequest, PersonType, FiscalRegimeOption } from '@/types/onboarding';

export const useFiscalOnboarding = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const [personType, setPersonType] = useState<PersonType>('FISICA');
    const [fiscalData, setFiscalData] = useState<FiscalDataResponse | null>(null);
    const [regimes, setRegimes] = useState<FiscalRegimeOption[]>([]);

    const loadData = useCallback(async () => {
        try {
            setIsLoading(true);
            const [status, data, catalog] = await Promise.all([
                onboardingService.getOnboardingStatus(),
                onboardingService.getFiscalData(),
                onboardingService.getFiscalRegimes()
            ]);

            setPersonType(status.personType || 'FISICA');
            setFiscalData(data);
            setRegimes(catalog);
        } catch (error) {
            console.error("Error cargando datos fiscales", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const saveFiscalInfo = async (data: FiscalDataRequest) => {
        setIsSaving(true);
        try {
            await onboardingService.saveFiscalData(data);
            toast.success("✅ Datos fiscales guardados correctamente.");
            // Refresh to ensure we have the latest payload from server
            await loadData();
            return true;
        } catch (error: any) {
            console.error("Error guardando datos fiscales:", error);
            return;
            return false;
        } finally {
            setIsSaving(false);
        }
    };

    const uploadDocument = async (file: File, docType: 'TAX_CERTIFICATE' | 'ACTA_CONSTITUTIVA') => {
        setIsUploading(true);
        const toastId = toast.loading("Analizando tu documento con IA... esto puede tardar unos segundos.");

        try {
            const response = await onboardingService.uploadFiscalDocument(file, docType);

            // Update local state with the newly extracted data
            if (response.extractedRfc || response.extractedLegalName) {
                setFiscalData(prev => prev ? {
                    ...prev,
                    rfc: response.extractedRfc || prev.rfc,
                    legalName: response.extractedLegalName || prev.legalName
                } : {
                    personType: personType,
                    rfc: response.extractedRfc || '',
                    legalName: response.extractedLegalName || '',
                    fiscalRegime: '',
                    taxCertificateUrl: null,
                    actaConstitutivaUrl: null,
                    status: 'PENDING',
                    rejectionReason: null
                });
            }

            toast.update(toastId, {
                render: `✅ Documento verificado correctamente`,
                type: "success", isLoading: false, autoClose: 5000
            });
            return response;
        } catch (error: any) {
            console.error("Error subiendo documento:", error);
            const msg = error.response?.data?.message || "Error al procesar el documento.";
            toast.update(toastId, {
                render: `Error: ${msg}`,
                type: "error", isLoading: false, autoClose: 4000
            });
            return false;
        } finally {
            setIsUploading(false);
            // Ensure we trigger a reload to get the newly updated file urls from server (if needed)
            loadData();
        }
    };

    return {
        fiscalData,
        personType,
        regimes,
        isLoading,
        isSaving,
        isUploading,
        saveFiscalInfo,
        uploadDocument,
        refetch: loadData
    };
};
