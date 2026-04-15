import { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';
import { onboardingService } from '@/services/onboarding.service';
import { KycDocumentResponse, ProviderSector } from '@/types/onboarding';

/**
 * 🚀 Hook refactorizado: La cédula profesional ahora se gestiona como un
 * documento KYC más, usando el endpoint unificado POST /api/onboarding/kyc/upload.
 * Ya no existen endpoints separados de License en el backend.
 */
export const useLicenseOnboarding = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  const [sector, setSector] = useState<ProviderSector>('HEALTH');
  const [license, setLicense] = useState<KycDocumentResponse | null>(null);

  const loadLicense = useCallback(async () => {
    try {
      setIsLoading(true);
      const status = await onboardingService.getOnboardingStatus();
      if (status.sector) {
        setSector(status.sector);
        // Buscamos el documento PROFESSIONAL_LICENSE en la lista KYC
        const doc = await onboardingService.getKycDocumentByType('PROFESSIONAL_LICENSE');
        setLicense(doc);
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
      // 🚀 Usamos el endpoint unificado de KYC con type='PROFESSIONAL_LICENSE'
      const response = await onboardingService.uploadKycDocument(file, 'PROFESSIONAL_LICENSE');
      setLicense(response);

      if (response.verificationStatus === 'APPROVED') {
        toast.update(toastId, {
          render: `✅ Cédula profesional verificada exitosamente`,
          type: "success", isLoading: false, autoClose: 5000
        });
      } else if (response.verificationStatus === 'REJECTED') {
        toast.update(toastId, {
          render: `❌ No aprobada: ${response.rejectionReason || "Documento no válido"}`,
          type: "error", isLoading: false, autoClose: 5000
        });
      } else {
        // PROCESSING o MANUAL_REVIEW_NEEDED
        toast.update(toastId, {
          render: "📋 Documento recibido, en proceso de verificación...",
          type: "info", isLoading: false, autoClose: 5000
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