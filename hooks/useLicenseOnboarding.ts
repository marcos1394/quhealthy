import { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';
import { onboardingService } from '@/services/onboarding.service';
import { KycDocumentResponse, ProviderSector, ProfessionalLicenseDto } from '@/types/onboarding';

export const useLicenseOnboarding = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [sector, setSector] = useState<ProviderSector>('HEALTH');
  const [license, setLicense] = useState<KycDocumentResponse | null>(null);
  const [manualLicenses, setManualLicenses] = useState<ProfessionalLicenseDto[]>([]);

  const loadLicense = useCallback(async () => {
    try {
      setIsLoading(true);
      const status = await onboardingService.getOnboardingStatus();
      if (status.sector) {
        setSector(status.sector);
        // Buscamos el documento PROFESSIONAL_LICENSE en la lista KYC
        const doc = await onboardingService.getKycDocumentByType('PROFESSIONAL_LICENSE');
        setLicense(doc);
        
        // Cargar cédulas manuales si existen
        if (status.professionalLicenses && status.professionalLicenses.length > 0) {
            setManualLicenses(status.professionalLicenses);
        } else {
            // Inicializar con un bloque vacío
            setManualLicenses([{
                licenseNumber: '',
                type: 'Licenciatura',
                institution: '',
                isPrimary: true
            }]);
        }
      }
    } catch (error) {
      console.error("Error cargando status", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLicense();
  }, [loadLicense]);

  const uploadLicense = async (file: File) => {
    setIsUploading(true);
    const toastId = toast.loading("Analizando tu documento con IA... esto puede tardar unos segundos.");

    try {
      const response = await onboardingService.uploadKycDocument(file, 'PROFESSIONAL_LICENSE');
      setLicense(response);

      if (response.verificationStatus === 'APPROVED' || response.verificationStatus === 'PROCESSING' || response.verificationStatus === 'PENDING') {
        toast.update(toastId, {
          render: `✅ Documento procesado, auto-llenando datos...`,
          type: "success", isLoading: false, autoClose: 5000
        });
        
        // Auto-llenar el primer bloque vacío o agregar uno nuevo
        if (response.extractedData) {
            const extractedNumber = response.extractedData.licenseNumber || '';
            const extractedType = response.extractedData.careerName || 'Licenciatura';
            const extractedInst = response.extractedData.institutionName || '';
            
            setManualLicenses(prev => {
                const newLicenses = [...prev];
                // Si el primero está vacío, lo llenamos
                if (newLicenses.length > 0 && !newLicenses[0].licenseNumber && !newLicenses[0].institution) {
                    newLicenses[0] = { ...newLicenses[0], licenseNumber: extractedNumber, type: extractedType, institution: extractedInst };
                } else {
                    // Sino, agregamos uno nuevo
                    newLicenses.push({
                        licenseNumber: extractedNumber,
                        type: extractedType,
                        institution: extractedInst,
                        isPrimary: false
                    });
                }
                return newLicenses;
            });
        }
      } else {
        toast.update(toastId, {
          render: `❌ No aprobada: ${response.rejectionReason || "Documento no válido"}`,
          type: "error", isLoading: false, autoClose: 5000
        });
      }
      return response;
    } catch (error: any) {
      console.error("Error subiendo licencia:", error);
      const msg = error.response?.data?.message || "Error al procesar la imagen.";
      toast.update(toastId, {
        render: `Error: ${msg}`,
        type: "error", isLoading: false, autoClose: 4000
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const saveLicenses = async (licenses: ProfessionalLicenseDto[]) => {
      setIsSaving(true);
      try {
          await onboardingService.updateLicenses({ licenses });
          return true;
      } catch (error: any) {
          console.error("Error guardando licencias:", error);
          toast.error("Error al guardar las cédulas. Por favor, intenta de nuevo.");
          return false;
      } finally {
          setIsSaving(false);
      }
  };

  return {
    license,
    sector,
    isLoading,
    isUploading,
    isSaving,
    uploadLicense,
    manualLicenses,
    setManualLicenses,
    saveLicenses,
    refetch: loadLicense
  };
};