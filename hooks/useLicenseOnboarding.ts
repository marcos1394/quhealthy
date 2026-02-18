import { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';
import { onboardingService } from '@/services/onboarding.service';
import { LicenseResponse } from '@/types/onboarding';

export const useLicenseOnboarding = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  
  // Estado local de la licencia
  const [license, setLicense] = useState<LicenseResponse | null>(null);

  // 1. Cargar estado inicial
  const loadLicense = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await onboardingService.getLicense();
      setLicense(data);
    } catch (error) {
      console.error("Error cargando licencia", error);
      // No mostramos toast de error aquí para no molestar al cargar la página
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLicense();
  }, [loadLicense]);

  // 2. Función de subida
  const uploadLicense = async (file: File) => {
    setIsUploading(true);
    const toastId = toast.loading("Analizando tu cédula con IA... esto puede tardar unos segundos.");

    try {
      const response = await onboardingService.uploadLicense(file);
      
      setLicense(response);

      // Feedback basado en la respuesta de la IA
      if (response.status === 'APPROVED') {
        toast.update(toastId, {
            render: `✅ Cédula verificada: ${response.careerName}`,
            type: "success",
            isLoading: false,
            autoClose: 5000
        });
      } else {
        // Si fue rechazada, mostramos la razón que viene del Backend
        toast.update(toastId, {
            render: `❌ No aprobada: ${response.rejectionReason || "Documento no válido"}`,
            type: "error",
            isLoading: false,
            autoClose: 5000
        });
      }

    } catch (error: any) {
      console.error("Error subiendo licencia:", error);
      const msg = error.response?.data?.message || "Error al procesar la imagen.";
      
      toast.update(toastId, {
          render: `Error: ${msg}`,
          type: "error",
          isLoading: false,
          autoClose: 4000
      });
    } finally {
      setIsUploading(false);
    }
  };

  return {
    license,       // Datos para mostrar (Institución, Número, etc.)
    isLoading,     // Carga inicial
    isUploading,   // Carga de subida
    uploadLicense, // Acción
    refetch: loadLicense
  };
};