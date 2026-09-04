"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "@/i18n/routing";
import { toast } from "react-toastify";
import { AnimatePresence, motion } from "framer-motion";
import { QhSpinner } from "@/components/ui/QhSpinner";

import { laboratoryOnboardingService } from "@/services/laboratory-onboarding.service";
import {
  LaboratoryOnboardingStatusResponse,
  SaveLaboratoryIdentityPayload,
  SaveLaboratorySanitaryPayload,
  SaveLaboratoryBranchPayload,
  SaveLaboratoryCatalogPayload,
} from "@/types/laboratory";

import { LaboratoryOnboardingHeader } from "@/components/onboarding/laboratory/LaboratoryOnboardingHeader";
import { Step1Identity } from "@/components/onboarding/laboratory/Step1Identity";
import { Step2SanitaryLegal } from "@/components/onboarding/laboratory/Step2SanitaryLegal";
import { Step3BranchesDelivery } from "@/components/onboarding/laboratory/Step3BranchesDelivery";
import { Step4CatalogPricing } from "@/components/onboarding/laboratory/Step4CatalogPricing";
import { Step5SummaryActivation } from "@/components/onboarding/laboratory/Step5SummaryActivation";

export default function LaboratoryOnboardingPage() {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<LaboratoryOnboardingStatusResponse | null>(null);

  // Estados de datos guardados en memoria del flujo
  const [identityData, setIdentityData] = useState<Partial<SaveLaboratoryIdentityPayload>>({});
  const [sanitaryData, setSanitaryData] = useState<Partial<SaveLaboratorySanitaryPayload>>({});
  const [branchData, setBranchData] = useState<Partial<SaveLaboratoryBranchPayload>>({});
  const [catalogData, setCatalogData] = useState<Partial<SaveLaboratoryCatalogPayload>>({});

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        setIsLoading(true);
        const data = await laboratoryOnboardingService.getStatus();
        setStatus(data);
        if (data.currentStep && data.currentStep >= 1 && data.currentStep <= 5) {
          setCurrentStep(data.currentStep);
        }
      } catch (error: any) {
        if (error?.response?.status === 401) {
          router.push("/laboratory/register");
        }
        console.error("Error al cargar estado de onboarding del laboratorio:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatus();
  }, [router]);

  // Recargar status del backend
  const refreshStatus = async () => {
    try {
      const data = await laboratoryOnboardingService.getStatus();
      setStatus(data);
    } catch (e) {
      console.error("Error al refrescar status:", e);
    }
  };

  // ===================== PASO 1 =====================
  const handleSaveStep1 = async (data: SaveLaboratoryIdentityPayload) => {
    try {
      setIsSaving(true);
      await laboratoryOnboardingService.saveIdentity(data);
      setIdentityData(data);
      toast.success("Identidad del laboratorio guardada correctamente");
      await refreshStatus();
      setCurrentStep(2);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Error al guardar identidad del laboratorio");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSkipStep1 = async () => {
    try {
      setIsSaving(true);
      await laboratoryOnboardingService.skipStep(1, "USER_DEFERRED", ["identity"]);
      toast.info("Paso 1 omitido temporalmente");
      await refreshStatus();
      setCurrentStep(2);
    } catch (e) {
      setCurrentStep(2);
    } finally {
      setIsSaving(false);
    }
  };

  // ===================== PASO 2 =====================
  const handleSaveStep2 = async (data: SaveLaboratorySanitaryPayload, file?: File) => {
    try {
      setIsSaving(true);
      await laboratoryOnboardingService.saveSanitary(data);
      if (file) {
        await laboratoryOnboardingService.uploadDocument(
          "COFEPRIS_NOTICE",
          file,
          data.cofeprisNoticeNumber
        );
      }
      setSanitaryData(data);
      toast.success("Datos sanitarios guardados correctamente");
      await refreshStatus();
      setCurrentStep(3);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Error al guardar datos sanitarios");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSkipStep2 = async () => {
    try {
      setIsSaving(true);
      await laboratoryOnboardingService.skipStep(2, "USER_DEFERRED", ["cofeprisNotice", "professionalLicense"]);
      toast.info("Paso 2 omitido. Podrás ingresar tu Aviso COFEPRIS más adelante.");
      await refreshStatus();
      setCurrentStep(3);
    } catch (e) {
      setCurrentStep(3);
    } finally {
      setIsSaving(false);
    }
  };

  // ===================== PASO 3 =====================
  const handleSaveStep3 = async (data: SaveLaboratoryBranchPayload) => {
    try {
      setIsSaving(true);
      await laboratoryOnboardingService.saveBranch(data);
      setBranchData(data);
      toast.success("Sede principal guardada correctamente");
      await refreshStatus();
      setCurrentStep(4);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Error al guardar sede principal");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSkipStep3 = async () => {
    try {
      setIsSaving(true);
      await laboratoryOnboardingService.skipStep(3, "USER_DEFERRED", ["branches"]);
      toast.info("Paso 3 omitido temporalmente");
      await refreshStatus();
      setCurrentStep(4);
    } catch (e) {
      setCurrentStep(4);
    } finally {
      setIsSaving(false);
    }
  };

  // ===================== PASO 4 =====================
  const handleSaveStep4 = async (data: SaveLaboratoryCatalogPayload) => {
    try {
      setIsSaving(true);
      await laboratoryOnboardingService.saveCatalog(data);
      setCatalogData(data);
      toast.success("Catálogo inicial de estudios guardado correctamente");
      const finalStatus = await laboratoryOnboardingService.completeOnboarding();
      setStatus(finalStatus);
      setCurrentStep(5);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Error al guardar catálogo");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSkipStep4 = async () => {
    try {
      setIsSaving(true);
      await laboratoryOnboardingService.skipStep(4, "USER_DEFERRED", ["catalog", "rpbi"]);
      const finalStatus = await laboratoryOnboardingService.completeOnboarding();
      setStatus(finalStatus);
      toast.info("Paso 4 omitido. Podrás cargar tu catálogo completo desde el panel.");
      setCurrentStep(5);
    } catch (e) {
      setCurrentStep(5);
    } finally {
      setIsSaving(false);
    }
  };

  // ===================== PASO 5 =====================
  const handleFinish = () => {
    toast.success("¡Onboarding de laboratorio finalizado!");
    router.push("/laboratory/dashboard");
  };

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-3">
        <QhSpinner size="lg" />
        <p className="text-xs text-gray-500 font-medium">Cargando expediente del laboratorio...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-[#070707] flex flex-col">
      {/* Header con Stepper */}
      <LaboratoryOnboardingHeader
        currentStep={currentStep}
        completionPercentage={status?.completionPercentage}
        onStepClick={(step) => {
          if (step <= (status?.currentStep || 1) + 1) {
            setCurrentStep(step);
          }
        }}
      />

      {/* Contenedor del Paso Activo con Animación */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              <Step1Identity
                initialData={identityData}
                onSave={handleSaveStep1}
                onSkip={handleSkipStep1}
                isLoading={isSaving}
              />
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              <Step2SanitaryLegal
                initialData={sanitaryData}
                onSave={handleSaveStep2}
                onSkip={handleSkipStep2}
                isLoading={isSaving}
              />
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              <Step3BranchesDelivery
                initialData={branchData}
                onSave={handleSaveStep3}
                onSkip={handleSkipStep3}
                isLoading={isSaving}
              />
            </motion.div>
          )}

          {currentStep === 4 && (
            <motion.div
              key="step-4"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              <Step4CatalogPricing
                initialData={catalogData}
                onSave={handleSaveStep4}
                onSkip={handleSkipStep4}
                isLoading={isSaving}
              />
            </motion.div>
          )}

          {currentStep === 5 && (
            <motion.div
              key="step-5"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              <Step5SummaryActivation
                status={status}
                onFinish={handleFinish}
                isLoading={isSaving}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
