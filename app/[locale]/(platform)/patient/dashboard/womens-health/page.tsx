"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  BrainCircuit,
  AlertTriangle,
  Flower2,
  HeartPulse,
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

import { useSessionStore } from "@/stores/SessionStore";
import {
  womensHealthService,
  CyclePredictionDto,
  CycleAiInsightDto,
  MenstrualCycleLog
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

  const [isCycleModalOpen, setIsCycleModalOpen] = useState(false);
  const [isSymptomModalOpen, setIsSymptomModalOpen] = useState(false);
  const [isFertilityModalOpen, setIsFertilityModalOpen] = useState(false);

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

  const handleQuickLogCycle = async (startDate: string, endDate?: string) => {
    if (!user?.id) return;
    try {
      setIsSavingCycle(true);
      await womensHealthService.logCycle(user.id, {
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
            Monitoreo inteligente de tu ciclo con IA
          </p>
        </div>
      </div>

      <TodayCheckInWidget 
        cycles={cycles}
        prediction={prediction}
        onOpenSymptomModal={() => setIsSymptomModalOpen(true)}
        onOpenFertilityModal={() => setIsFertilityModalOpen(true)}
        onOpenCycleModal={() => setIsCycleModalOpen(true)}
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
          <div className="bg-gradient-to-b from-indigo-50/50 to-white dark:from-indigo-950/20 dark:to-[#0a0a0a] rounded-3xl p-6 border border-indigo-100 dark:border-indigo-900/30 shadow-sm flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Gemini AI Insights</h2>
            </div>

            {insights ? (
              <div className="space-y-6 flex-1">
                {insights.requiresMedicalAttention && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-2xl p-4 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-800 dark:text-red-300 font-medium">
                      La IA ha detectado patrones que podrían requerir evaluación médica.
                    </p>
                  </div>
                )}
                
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {insights.summary}
                  </p>
                </div>

                {insights.detectedPatterns?.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                      Patrones Detectados
                    </h3>
                    <ul className="space-y-2">
                      {insights.detectedPatterns.map((pattern, idx) => (
                        <li key={idx} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                          <span className="text-indigo-500 mt-1">•</span> {pattern}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  La Inteligencia Artificial de Gemini necesita más historial para generar un análisis.
                </p>
              </div>
            )}
          </div>
          
          <RemindersWidget prediction={prediction} />
        </div>
      </div>

      <div className="mt-8">
        <CycleHistoryTable consumerId={user!.id} />
      </div>

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
        </>
      )}
    </div>
  );
}
