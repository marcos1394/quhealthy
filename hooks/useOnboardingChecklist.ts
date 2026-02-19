import { useState, useEffect, useCallback, useMemo } from 'react';
import { onboardingService } from '@/services/onboarding.service';
import { OnboardingStepUI, OnboardingStatusResponse, OnboardingStepStatus } from '@/types/onboarding';
import { toast } from 'react-toastify';

/**
 * useOnboardingChecklist Hook
 * 
 * LÓGICA INTELIGENTE POR SECTOR:
 * - Sector SALUD (parentCategoryId === 1): License es OBLIGATORIO
 * - Sector BELLEZA (parentCategoryId === 2): License es OPCIONAL
 * 
 * El porcentaje se calcula solo con pasos obligatorios:
 * - Salud: 100% = Profile + KYC + License
 * - Belleza: 100% = Profile + KYC (License opcional, no cuenta para %)
 */

export const useOnboardingChecklist = () => {
  const [steps, setSteps] = useState<OnboardingStepUI[]>([]);
  const [percentage, setPercentage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userSector, setUserSector] = useState<number>(1); // 1=Salud, 2=Belleza

  // Helper para textos amigables
  const getStatusText = (status: OnboardingStepStatus) => {
    switch (status) {
      case 'COMPLETED': return 'Completado';
      case 'IN_PROGRESS': return 'En Progreso';
      case 'REJECTED': return 'Requiere Cambios';
      default: return 'Pendiente';
    }
  };

  const fetchChecklist = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await onboardingService.getStatus();
      
      // Obtener el sector del usuario desde el backend
      const sector = data.parentCategoryId || 1; // Default Salud si no viene
      setUserSector(sector);

      // --- PASO 1: PERFIL ---
      const profileStep: OnboardingStepUI = {
        id: 'profile',
        title: 'Perfil Profesional',
        description: 'Información básica, especialidad y ubicación',
        status: data.profileStatus,
        statusText: getStatusText(data.profileStatus),
        isComplete: data.profileStatus === 'COMPLETED',
        isLocked: false, // Siempre disponible
        isRequired: true, // SIEMPRE obligatorio
        actionPath: '/onboarding/profile',
        rejectionReason: data.rejectionReasons?.['PROFILE']
      };

      // --- PASO 2: KYC (IDENTIDAD) ---
      const kycStep: OnboardingStepUI = {
        id: 'kyc',
        title: 'Validación de Identidad',
        description: 'Identificación oficial y Prueba de Vida',
        status: data.kycStatus,
        statusText: getStatusText(data.kycStatus),
        isComplete: data.kycStatus === 'COMPLETED',
        isLocked: data.profileStatus !== 'COMPLETED', // Se desbloquea al completar perfil
        isRequired: true, // SIEMPRE obligatorio
        actionPath: '/onboarding/kyc',
        rejectionReason: data.rejectionReasons?.['KYC']
      };

      // --- PASO 3: LICENSE (CÉDULA/LICENCIA) ---
      // 🔥 LÓGICA INTELIGENTE SEGÚN SECTOR
      const isLicenseRequired = sector === 1; // Solo obligatorio en Salud

      const licenseStep: OnboardingStepUI = {
        id: 'license',
        title: sector === 1 
          ? 'Validación de Cédula Profesional' 
          : 'Licencia de Funcionamiento (Opcional)',
        description: sector === 1
          ? 'Cédula profesional para ejercer'
          : 'Licencia sanitaria o permiso de operación',
        status: data.licenseStatus,
        statusText: getStatusText(data.licenseStatus),
        isComplete: data.licenseStatus === 'COMPLETED',
        isLocked: data.kycStatus !== 'COMPLETED', // Se desbloquea al completar KYC
        isRequired: isLicenseRequired, // 🆕 NUEVA PROPIEDAD
        actionPath: '/onboarding/license',
        rejectionReason: data.rejectionReasons?.['LICENSE']
      };

      const generatedSteps = [profileStep, kycStep, licenseStep];

      // 🚀 CÁLCULO DE PORCENTAJE INTELIGENTE
      // Solo cuenta los pasos OBLIGATORIOS (isRequired === true)
      const requiredSteps = generatedSteps.filter(step => step.isRequired);
      const completedRequiredSteps = requiredSteps.filter(step => step.isComplete);
      const calculatedPercentage = Math.round(
        (completedRequiredSteps.length / requiredSteps.length) * 100
      );

      // Actualizar estados
      setSteps(generatedSteps);
      setPercentage(calculatedPercentage);

    } catch (err: any) {
      console.error("Error onboarding status:", err);
      setError("No pudimos cargar tu progreso. Intenta recargar.");
      toast.error("Error al cargar el progreso");
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
    userSector, // 🆕 Exportamos el sector para uso en otros componentes
    refetch: fetchChecklist 
  };
};