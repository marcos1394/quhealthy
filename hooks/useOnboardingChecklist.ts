import { useState, useEffect, useCallback } from 'react';
import { onboardingService } from '@/services/onboarding.service';
import { OnboardingStepUI, OnboardingStatusResponse, StepStatus, ProviderSector, PersonType } from '@/types/onboarding';
import { toast } from 'react-toastify';

export const useOnboardingChecklist = () => {
  const [steps, setSteps] = useState<OnboardingStepUI[]>([]);
  const [percentage, setPercentage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [userSector, setUserSector] = useState<ProviderSector>('HEALTH');
  const [userPersonType, setUserPersonType] = useState<PersonType>('FISICA');

  const getStatusText = (status: StepStatus) => {
    switch (status) {
      case 'APPROVED': return 'Aprobado';
      case 'IN_PROGRESS': return 'En Progreso';
      case 'REJECTED': return 'Requiere Cambios';
      case 'UNDER_REVIEW': return 'En Revisión Manual';
      default: return 'Pendiente';
    }
  };

  const handleFinalize = async () => {
    setIsFinalizing(true);
    try {
      await onboardingService.finalizeOnboarding();
      return true;
    } catch (err: any) {
      console.error("Error al finalizar:", err);
      toast.error(err.response?.data?.message || "Hubo un problema al finalizar tu registro.");
      return false;
    } finally {
      setIsFinalizing(false);
    }
  };

  const fetchChecklist = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await onboardingService.getOnboardingStatus();

      const sector = data.sector || 'HEALTH';
      const personType = data.personType || 'FISICA';
      setUserSector(sector);
      setUserPersonType(personType);

      // --- PASO 1: PERFIL ---
      const profileStep: OnboardingStepUI = {
        id: 'profile',
        title: 'Perfil Profesional',
        description: 'Información básica, especialidad y ubicación',
        status: data.profileStatus,
        statusText: getStatusText(data.profileStatus),
        isComplete: data.profileStatus === 'APPROVED',
        isLocked: false,
        isRequired: true,
        actionPath: '/onboarding/profile',
        rejectionReason: data.rejectionReasons?.profile
      };

      // --- PASO 2: KYC (IDENTIDAD) ---
      const kycStep: OnboardingStepUI = {
        id: 'kyc',
        title: 'Validación de Identidad',
        description: 'Identificación oficial y Prueba de Vida',
        status: data.kycStatus,
        statusText: getStatusText(data.kycStatus),
        isComplete: data.kycStatus === 'APPROVED',
        isLocked: data.profileStatus !== 'APPROVED',
        isRequired: true,
        actionPath: '/onboarding/kyc',
        rejectionReason: data.rejectionReasons?.kyc
      };

      // --- PASO 3: LICENSE (CÉDULA/LICENCIA) ---
      const isLicenseRequired = true; // Ambos requieren según plan: Salud=Cedula, Belleza=Permiso Negocio. 

      const licenseStep: OnboardingStepUI = {
        id: 'license',
        title: sector === 'HEALTH' ? 'Cédula Profesional' : 'Licencia de Negocio',
        description: sector === 'HEALTH'
          ? 'Cédula profesional para ejercer'
          : 'Licencia sanitaria o permiso de operación',
        status: data.licenseStatus,
        statusText: getStatusText(data.licenseStatus),
        isComplete: data.licenseStatus === 'APPROVED',
        isLocked: data.kycStatus !== 'APPROVED',
        isRequired: isLicenseRequired,
        actionPath: '/onboarding/license',
        rejectionReason: data.rejectionReasons?.license
      };

      // --- PASO 4: FISCAL ---
      const fiscalStep: OnboardingStepUI = {
        id: 'fiscal', // Se mapeará a 'plan' provisoriamente en OnboardingStepUI si no editaste el tipo UI, pero usemos 'fiscal' si se permite
        title: 'Datos Fiscales',
        description: 'RFC, Constancia de Situación Fiscal y Régimen',
        status: data.fiscalStatus,
        statusText: getStatusText(data.fiscalStatus),
        isComplete: data.fiscalStatus === 'APPROVED',
        isLocked: data.licenseStatus !== 'APPROVED', // Se desbloquea al aprobar la licencia/cédula
        isRequired: true, // Asumimos obligatorio para emitir facturas
        actionPath: '/onboarding/fiscal',
        rejectionReason: data.rejectionReasons?.fiscal
      };

      const generatedSteps = [profileStep, kycStep, licenseStep, fiscalStep];

      setSteps(generatedSteps);
      setPercentage(data.completionPercentage || 0);

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
    finalize: handleFinalize,
    isFinalizing,
    userSector,
    userPersonType,
    refetch: fetchChecklist
  };
};