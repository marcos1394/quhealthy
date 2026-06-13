import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { consumerProfileService } from '@/services/consumerProfile.service';
import { ConsumerOnboardingData, INITIAL_CONSUMER_ONBOARDING_DATA } from '@/types/consumerOnboarding';

export function useConsumerOnboarding(stepsLength: number) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<ConsumerOnboardingData>(INITIAL_CONSUMER_ONBOARDING_DATA);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);

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

  const updateData = (fields: Partial<ConsumerOnboardingData>) => {
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
      // Lanza el error para que la UI pueda manejar o loggear fallos específicos
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    setLoading(true);
    try {
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
    initialLoading
  };
}
