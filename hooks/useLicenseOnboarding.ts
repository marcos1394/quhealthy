import { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';
import { onboardingService } from '@/services/onboarding.service';
import { LicenseResponse, ProviderSector } from '@/types/onboarding';

export const useLicenseOnboarding = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  const [sector, setSector] = useState<ProviderSector>('HEALTH');
  const [license, setLicense] = useState<LicenseResponse | null>(null);

  const loadLicense = useCallback(async () => {
    try {
      setIsLoading(true);
      const status = await onboardingService.getOnboardingStatus();
      if (status.sector) {
        setSector(status.sector);
        try {
          const data = await onboardingService.getLicense(status.sector);
          setLicense(data);
        } catch (err) {
          console.error("No license found yet");
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
      const response = await onboardingService.uploadLicense(file, sector);
      setLicense(response);

      if (response.status === 'APPROVED') {
        if (sector === 'HEALTH' && response.licenseNumber) {
          toast.update(toastId, { render: "Validando cédula con RENAMECC...", type: "info" });
          try {
            const validation = await onboardingService.validateProfessionalLicense(response.licenseNumber);
            if (!validation.isValid) {
              toast.update(toastId, {
                render: "❌ La cédula no fue encontrada o es inválida en RENAMECC",
                type: "error", isLoading: false, autoClose: 5000
              });
              return;
            }
          } catch (authError) {
            console.warn("RENAMECC validation error", authError);
          }
        }

        toast.update(toastId, {
          render: `✅ Documento verificado${('careerName' in response && response.careerName) ? `: ${response.careerName}` : ''}`,
          type: "success", isLoading: false, autoClose: 5000
        });
      } else {
        toast.update(toastId, {
          render: `❌ No aprobada: ${response.rejectionReason || "Documento no válido"}`,
          type: "error", isLoading: false, autoClose: 5000
        });
      }
    } catch (error: any) {
      console.error("Error subiendo licencia:", error);
      const msg = error.response?.data?.message || "Error al procesar la imagen.";
      toast.update(toastId, {
        render: `Error: ${msg}`,
        type: "error", isLoading: false, autoClose: 4000
      });
    } finally {
      setIsUploading(false);
    }
  };

  return {
    license,
    sector,
    isLoading,
    isUploading,
    uploadLicense,
    refetch: loadLicense
  };
};