"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  Flower2,
  HeartPulse,
  Baby,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { QhSpinner } from "@/components/ui/QhSpinner";

import { LogCycleModal } from "@/components/patient/womens-health/LogCycleModal";
import { LogSymptomModal } from "@/components/patient/womens-health/LogSymptomModal";
import { LogFertilityModal } from "@/components/patient/womens-health/LogFertilityModal";
import { RemindersWidget } from "@/components/patient/womens-health/RemindersWidget";
import { CycleHistoryTable } from "@/components/patient/womens-health/CycleHistoryTable";
import { TodayCheckInWidget } from "@/components/patient/womens-health/TodayCheckInWidget";
import { WomensHealthCalendar } from "@/components/patient/womens-health/WomensHealthCalendar";
import { CycleInsightsWidget } from "@/components/patient/womens-health/CycleInsightsWidget";
import { RegisterPregnancyModal } from "@/components/patient/womens-health/RegisterPregnancyModal";
import { PregnancyTimelineWidget } from "@/components/patient/womens-health/PregnancyTimelineWidget";
import { PregnancyVitalsGrid } from "@/components/patient/womens-health/PregnancyVitalsGrid";
import { FetalMonitoringWidget } from "@/components/patient/womens-health/FetalMonitoringWidget";
import { PrenatalCareWidget } from "@/components/patient/womens-health/PrenatalCareWidget";
import { PregnancyAiChatWidget } from "@/components/patient/womens-health/PregnancyAiChatWidget";
import { PostpartumDashboard } from "@/components/patient/womens-health/PostpartumDashboard";
import { StartPostpartumModal } from "@/components/patient/womens-health/StartPostpartumModal";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

import { useSessionStore } from "@/stores/SessionStore";
import {
  womensHealthService,
  CyclePredictionDto,
  CycleAiInsightDto,
  MenstrualCycleLog,
  PregnancyProfileDto
} from "@/services/womensHealth.service";
import { toast } from "react-toastify";
import { useParams } from "next/navigation";

export default function WomensHealthDashboard() {
  const t = useTranslations("PatientDashboard");
  const { user } = useSessionStore();
  const params = useParams();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingCycle, setIsSavingCycle] = useState(false);
  const [hasConsent, setHasConsent] = useState(false);
  const [prediction, setPrediction] = useState<CyclePredictionDto | null>(null);
  const [insights, setInsights] = useState<CycleAiInsightDto | null>(null);
  const [cycles, setCycles] = useState<MenstrualCycleLog[]>([]);
  const [isTryingToConceive, setIsTryingToConceive] = useState(false);
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);
  const [activePregnancy, setActivePregnancy] = useState<PregnancyProfileDto | null>(null);
  const [hasPostpartum, setHasPostpartum] = useState(false);

  const [isCycleModalOpen, setIsCycleModalOpen] = useState(false);
  const [isSymptomModalOpen, setIsSymptomModalOpen] = useState(false);
  const [isFertilityModalOpen, setIsFertilityModalOpen] = useState(false);
  const [isPregnancyModalOpen, setIsPregnancyModalOpen] = useState(false);
  const [isStartPostpartumModalOpen, setIsStartPostpartumModalOpen] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const consent = await womensHealthService.checkConsent(user!.id);
      setHasConsent(consent);

      if (consent) {
        try {
          const pref = await womensHealthService.getPreferences(user!.id);
          setIsTryingToConceive(pref.tryingToConceive ?? false);
        } catch (e) {
          console.error("Error cargando preferencias:", e);
        }

        try {
          const preg = await womensHealthService.getActivePregnancy(user!.id);
          setActivePregnancy(preg);
        } catch (e) {
          console.error("Error cargando embarazo activo:", e);
        }

        if (!activePregnancy) {
          try {
            const pp = await womensHealthService.getPostpartumDashboard(user!.id);
            setHasPostpartum(!!pp);
          } catch (e) {
            setHasPostpartum(false);
          }
        }

        try {
          const fetchedCycles = await womensHealthService.getCycleLogs(user!.id);
          setCycles(fetchedCycles || []);
        } catch (e) {
          console.error("Error cargando ciclos:", e);
        }

        try {
          const pred = await womensHealthService.getPrediction(user!.id);
          setPrediction(pred);
        } catch (e) {
          console.error("Error cargando predicción:", e);
        }

        try {
          const ai = await womensHealthService.getAiInsights(user!.id);
          setInsights(ai);
        } catch (e) {
          console.error("Error cargando insights:", e);
        }
      }
    } catch (error) {
      toast.error("Error al cargar la información del ciclo.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConsent = async () => {
    if (!user?.id) return;
    try {
      await womensHealthService.recordConsent(user.id);
      setHasConsent(true);
      toast.success("Consentimiento guardado exitosamente");
      loadData();
    } catch (error) {
      toast.error("Error al guardar el consentimiento.");
    }
  };

  const handleToggleConceive = async (checked: boolean) => {
    if (!user?.id) return;
    try {
      setIsSavingPreferences(true);
      const res = await womensHealthService.updatePreferences(user.id, { tryingToConceive: checked });
      setIsTryingToConceive(res.tryingToConceive);
      if (checked) {
        toast.success("Modo Buscando Embarazo activado");
      } else {
        toast.success("Modo Monitoreo activado");
      }
    } catch (error) {
      toast.error("Error al actualizar tus preferencias");
      setIsTryingToConceive(!checked);
    } finally {
      setIsSavingPreferences(false);
    }
  };

  const handleQuickLogCycle = async (startDate: string, endDate?: string) => {
    if (!user?.id) return;
    try {
      setIsSavingCycle(true);
      await womensHealthService.logCycle(user.id, {
        consumerId: user.id,
        startDate,
        endDate,
        intensity: "MEDIUM",
        notes: "Registrado rápidamente desde el calendario"
      });
      toast.success("Menstruación registrada");
      loadData();
    } catch (error) {
      toast.error("Error al registrar la menstruación");
    } finally {
      setIsSavingCycle(false);
    }
  };

  const handleOpenDayDetails = (date: Date) => {
    setIsCycleModalOpen(true);
  };

  if (isLoading && cycles.length === 0) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <QhSpinner size="lg" />
      </div>
    );
  }

  if (!hasConsent) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2 font-sans transition-colors">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight leading-tight flex items-center gap-3">
              <Flower2 className="w-8 h-8 text-pink-500" />
              Salud Femenina
            </h1>
            <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
              Monitoreo del ciclo menstrual y salud reproductiva
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl p-8 border border-gray-100 dark:border-gray-800 text-center max-w-2xl mx-auto shadow-sm">
          <div className="w-16 h-16 bg-pink-100 dark:bg-pink-900/30 text-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <HeartPulse className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Privacidad y Consentimiento
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Para brindarte predicciones precisas y un análisis de IA sobre tu ciclo,
            necesitamos recolectar y procesar datos sobre tu salud reproductiva.
            Estos datos son altamente sensibles y están protegidos.
            ¿Autorizas a QuHealthy a procesar esta información?
          </p>
          <Button
            onClick={handleConsent}
            className="bg-pink-600 hover:bg-pink-700 text-white rounded-xl px-8 py-6 text-lg font-bold"
          >
            Aceptar y Continuar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4 font-sans transition-colors">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight leading-tight flex items-center gap-3">
            <Flower2 className="w-8 h-8 text-pink-500" />
            Salud Femenina
          </h1>
          <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
            {activePregnancy ? "Monitoreo prenatal y cuidado materno" : 
             hasPostpartum ? "Seguimiento de postparto y cuidado del recién nacido" : 
             "Monitoreo inteligente de tu ciclo con IA"}
          </p>
        </div>
        {!activePregnancy && !hasPostpartum && (
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex items-center space-x-2 bg-white dark:bg-[#111111] p-3 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm mt-4 md:mt-0">
              <Switch 
                id="conceive-mode" 
                checked={isTryingToConceive}
                onCheckedChange={handleToggleConceive}
                disabled={isSavingPreferences}
                className="data-[state=checked]:bg-purple-500"
              />
              <Label htmlFor="conceive-mode" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                Buscando embarazo
              </Label>
            </div>
            
            <Button
              onClick={() => setIsPregnancyModalOpen(true)}
              className="mt-4 md:mt-0 bg-pink-600 hover:bg-pink-700 text-white rounded-xl shadow-sm font-semibold"
            >
              <Baby className="w-4 h-4 mr-2" />
              Registrar Embarazo
            </Button>
          </div>
        )}
      </div>

      {activePregnancy ? (
        <div className="space-y-6">
          <PregnancyTimelineWidget 
            pregnancy={activePregnancy} 
            onStartPostpartum={() => setIsStartPostpartumModalOpen(true)}
          />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <PregnancyVitalsGrid pregnancy={activePregnancy} />
              <FetalMonitoringWidget pregnancy={activePregnancy} />
            </div>
            <div className="lg:col-span-1 space-y-6">
              <PrenatalCareWidget pregnancy={activePregnancy} />
            </div>
          </div>
          <PregnancyAiChatWidget pregnancy={activePregnancy} consumerId={user!.id} />
        </div>
      ) : hasPostpartum ? (
        <PostpartumDashboard />
      ) : (
        <>
          <TodayCheckInWidget 
            cycles={cycles}
            prediction={prediction}
            onOpenSymptomModal={() => setIsSymptomModalOpen(true)}
            onOpenFertilityModal={() => setIsFertilityModalOpen(true)}
            onOpenCycleModal={() => setIsCycleModalOpen(true)}
            isTryingToConceive={isTryingToConceive}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <WomensHealthCalendar 
                cycles={cycles}
                prediction={prediction}
                onQuickLogCycle={handleQuickLogCycle}
                onOpenDayDetails={handleOpenDayDetails}
                isLoading={isSavingCycle}
              />
            </div>
            <div className="lg:col-span-1 space-y-6">
              <CycleInsightsWidget prediction={prediction} insights={insights} />
              <RemindersWidget prediction={prediction} />
            </div>
          </div>

          <div className="mt-8">
            <CycleHistoryTable consumerId={user!.id} />
          </div>
        </>
      )}

      {user?.id && (
        <>
          <LogCycleModal
            isOpen={isCycleModalOpen}
            onClose={() => setIsCycleModalOpen(false)}
            consumerId={user.id}
            onSuccess={loadData}
          />
          <LogSymptomModal
            isOpen={isSymptomModalOpen}
            onClose={() => setIsSymptomModalOpen(false)}
            consumerId={user.id}
            onSuccess={loadData}
          />
          <LogFertilityModal
            isOpen={isFertilityModalOpen}
            onClose={() => setIsFertilityModalOpen(false)}
            consumerId={user.id}
            onSuccess={loadData}
          />
          <RegisterPregnancyModal
            isOpen={isPregnancyModalOpen}
            onClose={() => setIsPregnancyModalOpen(false)}
            consumerId={user.id}
            onSuccess={() => {
              setIsPregnancyModalOpen(false);
              loadData();
            }}
          />
          <StartPostpartumModal
            isOpen={isStartPostpartumModalOpen}
            onClose={() => setIsStartPostpartumModalOpen(false)}
            onSuccess={() => {
              setIsStartPostpartumModalOpen(false);
              loadData();
            }}
          />
        </>
      )}
    </div>
  );
}
