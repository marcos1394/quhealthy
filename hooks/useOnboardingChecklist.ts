import { useState, useEffect, useCallback } from 'react';
import { onboardingService } from '@/services/onboarding.service';
import { OnboardingStepUI, OnboardingStatusResponse, OnboardingStepStatus } from '@/types/onboarding';
import { toast } from 'react-toastify';

export const useOnboardingChecklist = () => {
  const [steps, setSteps] = useState<OnboardingStepUI[]>([]);
  const [percentage, setPercentage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper para textos amigables
  const getStatusText = (status: OnboardingStepStatus) => {
    switch (status) {
      case 'COMPLETED': return 'Completado';
      case 'IN_PROGRESS': return 'En Progreso';
      case 'REJECTED': return 'Requiere Cambios'; // ⚠️ Importante para UX
      default: return 'Pendiente';
    }
  };

  const fetchChecklist = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await onboardingService.getStatus();
      
      setPercentage(data.completionPercentage);

      // --- TRANSFORMACIÓN DE DATOS (Backend -> UI) ---
      
      // 1. Paso Perfil (Siempre desbloqueado)
      const profileStep: OnboardingStepUI = {
        id: 'profile',
        title: 'Perfil Profesional',
        description: 'Información básica, especialidad y foto.',
        status: data.profileStatus,
        statusText: getStatusText(data.profileStatus),
        isComplete: data.profileStatus === 'COMPLETED',
        isLocked: false, 
        actionPath: '/onboarding/profile',
        rejectionReason: data.rejectionReasons?.['PROFILE']
      };

      // 2. Paso Documentación (Bloqueado si Perfil no está listo)
      const kycStep: OnboardingStepUI = {
        id: 'kyc',
        title: 'Verificación de Identidad',
        description: 'Identificación oficial y Prueba de Vida',
        status: data.kycStatus,
        statusText: getStatusText(data.kycStatus),
        isComplete: data.kycStatus === 'COMPLETED',
        // Se bloquea si el perfil no está al menos "En Progreso" o "Completado"
        isLocked: data.profileStatus === 'PENDING', 
        actionPath: '/onboarding/kyc',
        rejectionReason: data.rejectionReasons?.['KYC']
      };
      
      // 3. Paso Licencia/Consultorio (Bloqueado si KYC no está listo)
      const licenseStep: OnboardingStepUI = {
        id: 'license',
        title: 'Validacion de Cédula Profesional o Licencias Sanitarias',
        description: 'Cédula profesional, licencia sanitaria o permiso de funcionamiento.',
        status: data.licenseStatus,
        statusText: getStatusText(data.licenseStatus),
        isComplete: data.licenseStatus === 'COMPLETED',
        isLocked: data.kycStatus === 'PENDING',
        actionPath: '/onboarding/license',
        rejectionReason: data.rejectionReasons?.['LICENSE']
      };

      setSteps([profileStep, kycStep, licenseStep]);

    } catch (err: any) {
      console.error("Error onboarding status:", err);
      // Fallback visual si falla la carga
      setError("No pudimos cargar tu progreso. Intenta recargar.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChecklist();
  }, [fetchChecklist]);

  return { 
    steps, 
    percentage, 
    isLoading, 
    error, 
    refetch: fetchChecklist 
  };
};