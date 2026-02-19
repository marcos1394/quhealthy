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

      // --- TRANSFORMACIÓN DE DATOS (Backend -> UI) ---
      
      // 1. Paso Perfil
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

      // 2. Paso Documentación
      const kycStep: OnboardingStepUI = {
        id: 'kyc',
        title: 'Verificación de Identidad',
        description: 'Identificación oficial y Prueba de Vida',
        status: data.kycStatus,
        statusText: getStatusText(data.kycStatus),
        isComplete: data.kycStatus === 'COMPLETED',
        isLocked: data.profileStatus === 'PENDING', 
        actionPath: '/onboarding/kyc',
        rejectionReason: data.rejectionReasons?.['KYC']
      };
      
      // 3. Paso Licencia/Consultorio
      const licenseStep: OnboardingStepUI = {
        id: 'license',
        title: 'Validación de Cédula o Licencias',
        description: 'Cédula profesional, licencia sanitaria o permiso de funcionamiento.',
        status: data.licenseStatus,
        statusText: getStatusText(data.licenseStatus),
        isComplete: data.licenseStatus === 'COMPLETED',
        isLocked: data.kycStatus === 'PENDING',
        actionPath: '/onboarding/license',
        rejectionReason: data.rejectionReasons?.['LICENSE']
      };

      const generatedSteps = [profileStep, kycStep, licenseStep];

      // 🚀 SOLUCIÓN: Calcular el porcentaje aquí mismo
      const completedCount = generatedSteps.filter(step => step.isComplete).length;
      const calculatedPercentage = Math.round((completedCount / generatedSteps.length) * 100);

      // Actualizar los estados
      setSteps(generatedSteps);
      setPercentage(calculatedPercentage);

    } catch (err: any) {
      console.error("Error onboarding status:", err);
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