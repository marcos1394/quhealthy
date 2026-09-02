/* eslint-disable react-doctor/no-event-handler */
import { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { toast } from 'react-toastify';
import { consumerProfileService } from '@/services/consumerProfile.service';
import { ConsumerOnboardingData, INITIAL_CONSUMER_ONBOARDING_DATA } from '@/types/consumerOnboarding';

export function useConsumerOnboarding(stepsLength: number) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<ConsumerOnboardingData>(INITIAL_CONSUMER_ONBOARDING_DATA);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile: any = await consumerProfileService.getProfile();
        if (profile) {
          const step = profile.onboardingStep || 0;
          
          if (step >= stepsLength) {
            router.push("/patient/dashboard");
            return;
          }
          
          setCurrentStep(step);
          setData(prev => ({
            ...prev,
            algorithmicConsentAccepted: profile.algorithmicConsentAccepted ?? prev.algorithmicConsentAccepted,
            biologicalSex: profile.biologicalSex ?? prev.biologicalSex,
            bloodType: profile.bloodType ?? prev.bloodType,
            dietaryPreference: profile.dietaryPreference ?? prev.dietaryPreference,
            medicalConditions: profile.medicalConditions ?? prev.medicalConditions,
            allergies: profile.allergies ?? prev.allergies,
            currentMedications: profile.currentMedications ?? prev.currentMedications,
            healthGoals: profile.healthGoals ?? prev.healthGoals,
            // Agregamos métricas biométricas al estado inicial para que no se pierdan
            weightKg: profile.weightKg?.toString() ?? prev.weightKg,
            heightCm: profile.heightCm?.toString() ?? prev.heightCm,
            restingHeartRate: profile.restingHeartRate?.toString() ?? prev.restingHeartRate,
            averageBloodPressureSystolic: profile.averageBloodPressureSystolic?.toString() ?? prev.averageBloodPressureSystolic,
            averageBloodPressureDiastolic: profile.averageBloodPressureDiastolic?.toString() ?? prev.averageBloodPressureDiastolic,
            isSmoker: profile.isSmoker ?? prev.isSmoker,
            alcoholUnitsWeek: profile.alcoholUnitsWeek?.toString() ?? prev.alcoholUnitsWeek,
            stressLevel: profile.stressLevel ?? prev.stressLevel,
            sleepHoursAvg: profile.sleepHoursAvg?.toString() ?? prev.sleepHoursAvg,
            // --- NOM-024 ---
            curp: profile.curp ?? prev.curp,
            ethnicGroup: profile.ethnicGroup ?? prev.ethnicGroup,
            healthInsurance: profile.healthInsurance ?? prev.healthInsurance,
            emergencyContactName: profile.emergencyContactName ?? prev.emergencyContactName,
            emergencyContactPhone: profile.emergencyContactPhone ?? prev.emergencyContactPhone,
            address: profile.address ?? prev.address,
            consentAcceptedAt: profile.consentAcceptedAt ?? prev.consentAcceptedAt,
          }));
        }
      } catch (err) {
        console.error("Error loading profile", err);
      } finally {
        setLoading(false);
        setInitialLoading(false);
      }
    };
    loadProfile();
  }, [stepsLength, router]);

  // Auto-save debounce effect with visual feedback
  useEffect(() => {
    if (initialLoading) return;
    
    setSaveStatus('saving');
    const handler = setTimeout(async () => {
      try {
        await consumerProfileService.updateProfile(data as any);
        setSaveStatus('saved');
        const resetPill = setTimeout(() => setSaveStatus('idle'), 3000);
        return () => clearTimeout(resetPill);
      } catch (err) {
        console.error("Auto-save failed", err);
        setSaveStatus('error');
      }
    }, 1200);

    return () => clearTimeout(handler);
  }, [data, initialLoading]);

  // Cálculo en tiempo real del porcentaje de completitud del expediente
  const completionPercentage = (() => {
    let score = 0;
    if (data.algorithmicConsentAccepted) score += 10;
    if (data.biologicalSex) score += 10;
    if (data.curp && data.curp.length === 18) score += 15;
    if (data.emergencyContactPhone) score += 10;
    if (data.weightKg && data.heightCm) score += 20;
    if (data.dietaryPreference || data.sleepHoursAvg) score += 10;
    if (data.healthGoals && data.healthGoals.length > 0) score += 15;
    if (data.medicalConditions && data.medicalConditions.length > 0) score += 10;
    return Math.min(100, Math.max(10, score));
  })();

  const updateData = (fields: Partial<ConsumerOnboardingData>) => {
    if (fields.algorithmicConsentAccepted && !data.consentAcceptedAt) {
      fields.consentAcceptedAt = new Date().toISOString();
    }
    setData((prev) => ({ ...prev, ...fields }));
  };

  const handleNext = async () => {
    setLoading(true);
    try {
      if (currentStep === 1) {
        await consumerProfileService.updateDemographics({
          biologicalSex: data.biologicalSex,
          bloodType: data.bloodType,
          dietaryPreference: data.dietaryPreference,
          algorithmicConsentAccepted: data.algorithmicConsentAccepted,
          // --- NOM-024 ---
          curp: data.curp,
          ethnicGroup: data.ethnicGroup,
          healthInsurance: data.healthInsurance,
          emergencyContactName: data.emergencyContactName,
          emergencyContactPhone: data.emergencyContactPhone,
          address: data.address,
        });
      } else if (currentStep === 2) {
        if (!data.weightKg || !data.heightCm) {
          toast.error("Por favor completa tu peso y estatura antes de continuar.");
          setLoading(false);
          return;
        }
        // Save to API happens on step 3 because backend expects biometrics and lifestyle together
      } else if (currentStep === 3) {
        if (!data.weightKg || !data.heightCm) {
          toast.error("Faltan datos corporales. Por favor regresa al paso anterior.");
          setLoading(false);
          return;
        }
        const weeklyExercise = (Number(data.exerciseDaysPerWeek) || 0) * (Number(data.exerciseMinutesPerDay) || 0);

        await consumerProfileService.updateBiometricsLifestyle({
          weightKg: data.weightKg,
          heightCm: data.heightCm,
          restingHeartRate: data.restingHeartRate,
          averageBloodPressureSystolic: data.averageBloodPressureSystolic,
          averageBloodPressureDiastolic: data.averageBloodPressureDiastolic,
          isSmoker: data.isSmoker,
          alcoholUnitsWeek: data.alcoholUnitsWeek,
          weeklyExerciseMinutes: weeklyExercise,
          activityLevel: weeklyExercise > 150 ? "ACTIVE" : "SEDENTARY",
          stressLevel: data.stressLevel || 5, // Default mid level
          sleepHoursAvg: data.sleepHoursAvg,
        });
      } else if (currentStep === 4) {
        await consumerProfileService.updateClinicalHistory({
          medicalConditions: data.medicalConditions,
          allergies: data.allergies,
          currentMedications: data.currentMedications,
          familyHistory: [],
        });
      } else if (currentStep === 5) {
        await consumerProfileService.updateGoals({
          healthGoals: data.healthGoals,
          preferredModality: "ANY",
        });
      }
      
      const nextStep = currentStep < stepsLength - 1 ? currentStep + 1 : currentStep;
      
      if (currentStep < stepsLength - 1) {
        await consumerProfileService.updateOnboardingStep(nextStep);
        setCurrentStep(nextStep);
      } else {
        await consumerProfileService.updateOnboardingStep(stepsLength);
        router.push("/patient/dashboard");
      }
    } catch (error) {
      console.error(error);
      toast.error("Hubo un error al guardar tu progreso. Intenta de nuevo.");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    setLoading(true);
    try {
      // Explicit auto-save to ensure data isn't lost when skipping
      await consumerProfileService.updateProfile(data as any).catch(console.error);

      if (currentStep < stepsLength - 1) {
        const nextStep = currentStep + 1;
        await consumerProfileService.updateOnboardingStep(nextStep);
        setCurrentStep(nextStep);
      } else {
        await consumerProfileService.updateOnboardingStep(stepsLength);
        router.push("/patient/dashboard");
      }
    } catch (error) {
      console.error("Error skipping step", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return {
    currentStep,
    data,
    loading,
    updateData,
    handleNext,
    handleSkip,
    handleBack,
    initialLoading,
    saveStatus,
    completionPercentage,
  };
}
