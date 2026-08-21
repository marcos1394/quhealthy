"use client";

/* eslint-disable react-doctor/no-giant-component */
/* eslint-disable react-doctor/button-has-type */

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { QhSpinner } from "@/components/ui/QhSpinner";

import { foundationOnboardingService } from "@/services/foundation-onboarding.service";
import {
  FoundationProfile,
  FoundationDocument,
  FoundationStaffMember,
  FoundationProgram,
  FoundationIdentityPayload,
  FoundationLegalTaxPayload,
  FoundationTeamInvitePayload,
  FoundationProgramPayload,
} from "@/types/foundation";

import { FoundationOnboardingHeader } from "@/components/onboarding/foundation/FoundationOnboardingHeader";
import { Step1Identity } from "@/components/onboarding/foundation/Step1Identity";
import { Step2LegalTax } from "@/components/onboarding/foundation/Step2LegalTax";
import { Step3Team } from "@/components/onboarding/foundation/Step3Team";
import { Step4ProgramSetup } from "@/components/onboarding/foundation/Step4ProgramSetup";
import { Step5Success } from "@/components/onboarding/foundation/Step5Success";

export default function FoundationOnboardingPage() {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [profile, setProfile] = useState<FoundationProfile | undefined>(undefined);
  const [documents, setDocuments] = useState<FoundationDocument[]>([]);
  const [teamMembers, setTeamMembers] = useState<FoundationStaffMember[]>([]);
  const [programs, setPrograms] = useState<FoundationProgram[]>([]);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        setIsLoading(true);
        const data = await foundationOnboardingService.getStatus();
        if (data.profile) {
          setProfile(data.profile);
          setCurrentStep(data.currentStep || 1);
        }
        setDocuments(data.documents || []);
        setTeamMembers(data.teamMembers || []);
        setPrograms(data.programs || []);
      } catch (error: any) {
        if (error?.response?.status === 401) {
          router.push("/foundation/register");
        }
        console.error("Error al cargar estado de onboarding institucional:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatus();
  }, [router]);

  const handleSaveIdentity = async (data: FoundationIdentityPayload) => {
    try {
      setIsSaving(true);
      const saved = await foundationOnboardingService.saveIdentity(data);
      setProfile(saved);
      setCurrentStep(2);
      toast.success("Identidad institucional guardada correctamente.");
    } catch (error) {
      console.error("Error al guardar identidad:", error);
      toast.error("Error al guardar los datos de identidad.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveLegalTax = async (data: FoundationLegalTaxPayload) => {
    try {
      setIsSaving(true);
      const saved = await foundationOnboardingService.saveLegalTax(data);
      setProfile(saved);
      setCurrentStep(3);
      toast.success("Datos legales y fiscales guardados.");
    } catch (error) {
      console.error("Error al guardar datos legales:", error);
      toast.error("Error al guardar los datos fiscales.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUploadDoc = async (docType: string, file: File) => {
    try {
      const doc = await foundationOnboardingService.uploadDocument(docType, file);
      setDocuments((prev) => {
        const filtered = prev.filter((d) => d.documentType !== docType);
        return [...filtered, doc];
      });
      toast.success("Documento cargado correctamente.");
    } catch (error) {
      console.error("Error al subir documento:", error);
      toast.error("Error al cargar el archivo. Intenta de nuevo.");
      throw error;
    }
  };

  const handleDeleteDoc = async (docId: number) => {
    try {
      await foundationOnboardingService.deleteDocument(docId);
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
      toast.info("Documento eliminado.");
    } catch (error) {
      console.error("Error al eliminar documento:", error);
      toast.error("Error al eliminar el documento.");
    }
  };

  const handleSaveTeam = async (data: FoundationTeamInvitePayload) => {
    try {
      setIsSaving(true);
      const savedMembers = await foundationOnboardingService.saveTeam(data);
      setTeamMembers(savedMembers);
      setCurrentStep(4);
      toast.success("Equipo institucional registrado.");
    } catch (error) {
      console.error("Error al guardar equipo:", error);
      toast.error("Error al registrar el equipo.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveInitialProgram = async (data: FoundationProgramPayload) => {
    try {
      setIsSaving(true);
      const savedProg = await foundationOnboardingService.saveInitialProgram(data);
      setPrograms([savedProg]);
      await foundationOnboardingService.completeOnboarding();
      setCurrentStep(5);
      toast.success("¡Programa creado y onboarding completado con éxito!");
    } catch (error) {
      console.error("Error al guardar programa:", error);
      toast.error("Error al configurar el programa asistencial.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFinish = () => {
    router.push("/foundation/dashboard");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50/50 dark:bg-[#050505]">
        <QhSpinner size="lg" />
        <p className="text-xs font-semibold text-gray-500 mt-4 animate-pulse">
          Cargando entorno institucional...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] flex flex-col transition-colors">
      {/* ── HEADER DEL ONBOARDING ────────────────────────────────────── */}
      <FoundationOnboardingHeader
        currentStep={currentStep}
        onStepClick={(step) => {
          if (step < currentStep || (profile && profile.currentStep && step <= profile.currentStep)) {
            setCurrentStep(step);
          }
        }}
      />

      {/* ── CONTENIDO PRINCIPAL ──────────────────────────────────────── */}
      <main className="flex-1 py-8 sm:py-12 px-4 sm:px-8">
        {currentStep === 1 && (
          <Step1Identity
            initialData={profile}
            onSave={handleSaveIdentity}
            isLoading={isSaving}
          />
        )}

        {currentStep === 2 && (
          <Step2LegalTax
            initialData={profile}
            documents={documents}
            onSave={handleSaveLegalTax}
            onUploadDoc={handleUploadDoc}
            onDeleteDoc={handleDeleteDoc}
            onBack={() => setCurrentStep(1)}
            onSkip={() => setCurrentStep(3)}
            isLoading={isSaving}
          />
        )}

        {currentStep === 3 && (
          <Step3Team
            initialMembers={teamMembers}
            onSave={handleSaveTeam}
            onBack={() => setCurrentStep(2)}
            onSkip={() => setCurrentStep(4)}
            isLoading={isSaving}
          />
        )}

        {currentStep === 4 && (
          <Step4ProgramSetup
            initialData={programs[0]}
            onSave={handleSaveInitialProgram}
            onBack={() => setCurrentStep(3)}
            onSkip={async () => {
              try {
                setIsSaving(true);
                await foundationOnboardingService.completeOnboarding();
                setCurrentStep(5);
              } catch (err) {
                console.error("Error al finalizar onboarding:", err);
                setCurrentStep(5);
              } finally {
                setIsSaving(false);
              }
            }}
            isLoading={isSaving}
          />
        )}

        {currentStep === 5 && (
          <Step5Success
            profile={profile}
            program={programs[0]}
            teamMembers={teamMembers}
            onFinish={handleFinish}
            isLoading={isSaving}
          />
        )}
      </main>
    </div>
  );
}
