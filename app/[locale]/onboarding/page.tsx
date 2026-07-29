"use client";

/* eslint-disable react-doctor/rerender-state-only-in-handlers */
/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/no-giant-component */

import React, { useMemo, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  ArrowRight,
  UserCheck,
  Store,
  ShieldCheck,
  ClipboardList,
  AlertCircle,
  RefreshCw,
  FileText,
  Sparkles,
  Trophy,
  Lock,
  Star,
  Info,
  Shield,
} from "lucide-react";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";
import Confetti from "react-confetti";

import { useOnboardingChecklist } from "@/hooks/useOnboardingChecklist";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const getIconForStep = (id: string) => {
  switch (id) {
    case "profile":
      return UserCheck;
    case "kyc":
      return ShieldCheck;
    case "license":
      return FileText;
    case "marketplace":
      return Store;
    default:
      return ClipboardList;
  }
};

export default function OnboardingChecklistPage() {
  const router = useRouter();
  const t = useTranslations("OnboardingChecklist");
  const [showConfetti, setShowConfetti] = useState(false);
  const [hasShownConfetti, setHasShownConfetti] = useState(false);

  const {
    steps,
    percentage,
    isLoading,
    error,
    refetch,
    finalize,
    isFinalizing,
  } = useOnboardingChecklist();

  const {
    completedSteps,
    totalRequiredSteps,
    activeStep,
    progressPercentage,
    canProceedToDashboard,
  } = useMemo(() => {
    if (!steps || steps.length === 0) {
      return {
        completedSteps: 0,
        totalRequiredSteps: 0,
        activeStep: null,
        progressPercentage: 0,
        canProceedToDashboard: false,
      };
    }
    const requiredSteps = steps.filter((s) => s.isRequired);
    const completedRequired = requiredSteps.filter((s) => s.isComplete).length;
    const active = steps.find((s) => !s.isComplete);
    return {
      completedSteps: completedRequired,
      totalRequiredSteps: requiredSteps.length,
      activeStep: active,
      progressPercentage: percentage,
      canProceedToDashboard: requiredSteps.every((s) => s.isComplete),
    };
  }, [steps, percentage]);

  useEffect(() => {
    let timerId: NodeJS.Timeout;
    if (canProceedToDashboard && !hasShownConfetti) {
      setShowConfetti(true);
      setHasShownConfetti(true);
      toast.success(t("congrats"), {
        position: "top-center",
        autoClose: 5000,
      });
      timerId = setTimeout(() => setShowConfetti(false), 5000);
    }
    return () => clearTimeout(timerId);
  }, [canProceedToDashboard, hasShownConfetti, t]);

  const handleAction = (path?: string) => {
    if (path) router.push(path);
    else toast.info("Ruta no configurada");
  };

  const onFinalizeAndProceed = async () => {
    const success = await finalize();
    if (success) router.push("/provider/dashboard");
  };

  // ── ESTADO: CARGANDO ───────────────────────────────────────────────────────
  if (isLoading)
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-3 bg-gray-50/50 dark:bg-[#050505] selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500 font-sans">
        <QhSpinner size="lg" className="text-emerald-600 dark:text-emerald-400" />
        <p className="text-xs font-semibold text-gray-400 animate-pulse">
          {t("loading")}
        </p>
      </div>
    );

  // ── ESTADO: ERROR ──────────────────────────────────────────────────────────
  if (error)
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6 bg-gray-50/50 dark:bg-[#050505] selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500 font-sans">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-white dark:bg-[#0a0a0a] border border-red-200 dark:border-red-900/40 rounded-3xl p-8 shadow-sm space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/30 flex items-center justify-center text-red-500 shrink-0 shadow-sm">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">
                  {t("error_title")}
                </h3>
                <p className="text-xs font-medium text-gray-500 leading-relaxed">
                  {t("error_desc")}
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-red-50/50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 text-xs font-semibold text-red-700 dark:text-red-300">
              {error}
            </div>

            <button
              type="button"
              onClick={refetch}
              className="w-full h-11 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-xs font-bold shadow-sm flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{t("retry")}</span>
            </button>
          </div>
        </motion.div>
      </div>
    );

  // ── VISTA PRINCIPAL ────────────────────────────────────────────────────────
  return (
    <div className="relative overflow-x-hidden w-full min-h-[80vh] flex flex-col pt-12 md:pt-16 bg-gray-50/50 dark:bg-[#050505] font-sans selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500 pb-20">
      {showConfetti && <Confetti recycle={false} numberOfPieces={500} />}

      <div className="max-w-3xl w-full mx-auto relative z-10 flex-1 flex flex-col px-6 md:px-0 space-y-8">
        {/* Header Editorial */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-900/40">
            <Sparkles className="w-3.5 h-3.5" strokeWidth={2} />
            <span>{t("setup_badge")}</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-white leading-[1.15]">
            {t("title")}
          </h1>

          <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 max-w-2xl leading-relaxed">
            {t("desc")}
          </p>
        </motion.div>

        {/* Stepper de Progreso */}
        {!canProceedToDashboard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm space-y-3"
          >
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-gray-400 uppercase tracking-wider">
                {t("step")} 0{completedSteps + 1}{" "}
                <span className="mx-1 text-gray-300 dark:text-gray-700">/</span>{" "}
                0{totalRequiredSteps}
              </span>
              <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">
                {progressPercentage}%
              </span>
            </div>

            <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <motion.div
                className="h-full bg-emerald-600 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
          </motion.div>
        )}

        {/* Área Central de Enfoque */}
        <div className="flex-1 pb-10">
          <AnimatePresence mode="wait">
            {canProceedToDashboard ? (
              /* PASO FINAL: COMPLETADO CON ÉXITO */
              <motion.div
                key="completion"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
              >
                <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-8 sm:p-12 text-center shadow-sm space-y-8">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 0.6 }}
                    className="w-20 h-20 mx-auto rounded-3xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm"
                  >
                    <Trophy className="w-10 h-10" strokeWidth={2} />
                  </motion.div>

                  <div className="space-y-2 max-w-lg mx-auto">
                    <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                      {t("congrats")}
                    </h3>
                    <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                      {t("congrats_desc")}
                    </p>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={onFinalizeAndProceed}
                      disabled={isFinalizing}
                      className="w-full sm:w-auto min-w-[240px] h-12 px-8 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-xs font-bold shadow-sm inline-flex items-center justify-center gap-2 disabled:opacity-50 mx-auto"
                    >
                      {isFinalizing ? (
                        <>
                          <QhSpinner size="sm" className="text-white" />
                          <span>{t("syncing")}</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" strokeWidth={2} />
                          <span>{t("go_dashboard")}</span>
                          <ArrowRight className="w-4 h-4" strokeWidth={2} />
                        </>
                      )}
                    </button>
                  </div>

                  <div className="pt-4 flex justify-center">
                    <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-900/40 shadow-sm">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{t("verified_account")}</span>
                    </span>
                  </div>
                </div>
              </motion.div>
            ) : activeStep ? (
              /* PASO ACTIVO TARJETA ENFOCADA */
              <motion.div
                key={activeStep.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
              >
                <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-10 shadow-sm space-y-8">
                  <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                    {/* Icon Container */}
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-sm">
                      {React.createElement(getIconForStep(activeStep.id), {
                        className: "w-7 h-7",
                        strokeWidth: 2,
                      })}
                    </div>

                    <div className="flex-1 space-y-4">
                      <div>
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                          {activeStep.title}
                        </h3>
                        <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed pt-1">
                          {activeStep.description}
                        </p>
                      </div>

                      {/* Notificaciones de Estado */}
                      {activeStep.status === "UNDER_REVIEW" && (
                        <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 space-y-1">
                          <p className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                            <Info className="w-4 h-4" /> {t("status_under_review")}
                          </p>
                          <p className="text-xs font-medium text-blue-700 dark:text-blue-300 leading-relaxed">
                            {t("desc_under_review")}
                          </p>
                        </div>
                      )}

                      {activeStep.status === "REJECTED" &&
                        activeStep.rejectionReason && (
                          <div className="p-4 rounded-2xl bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 space-y-1">
                            <p className="text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-1.5">
                              <AlertCircle className="w-4 h-4" /> {t("status_action_required")}
                            </p>
                            <p className="text-xs font-medium text-red-700 dark:text-red-300 leading-relaxed">
                              {activeStep.rejectionReason}
                            </p>
                          </div>
                        )}

                      {activeStep.isLocked && (
                        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 space-y-1">
                          <p className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                            <Lock className="w-4 h-4 text-gray-400" /> {t("status_locked")}
                          </p>
                          <p className="text-xs font-medium text-gray-500 leading-relaxed">
                            {t("desc_locked")}
                          </p>
                        </div>
                      )}

                      {/* Botón de Acción Principal */}
                      <div className="pt-2">
                        <button
                          type="button"
                          disabled={
                            activeStep.isLocked ||
                            activeStep.status === "UNDER_REVIEW"
                          }
                          onClick={() => handleAction(activeStep.actionPath)}
                          className="w-full sm:w-auto min-w-[200px] h-12 px-7 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors text-xs font-bold shadow-sm inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span>
                            {activeStep.status === "REJECTED"
                              ? t("btn_correct_info")
                              : t("btn_start")}
                          </span>
                          <ArrowRight className="w-4 h-4" strokeWidth={2} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        {/* Footer Seguridad */}
        <div className="flex items-center justify-center gap-2 text-xs font-semibold text-gray-400 pb-4">
          <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
          <span>Sincronización encriptada en tiempo real.</span>
        </div>
      </div>
    </div>
  );
}