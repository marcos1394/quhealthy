"use client";

import React, { useMemo, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, ArrowRight, Loader2, UserCheck, Store,
  ShieldCheck, ClipboardList, AlertCircle, RefreshCw, FileText,
  Sparkles, Trophy, Lock, Star, Gift, ChevronRight, Info
} from "lucide-react";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";
import Confetti from "react-confetti";

import { useOnboardingChecklist } from "@/hooks/useOnboardingChecklist";
import { QhSpinner } from '@/components/ui/QhSpinner';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

const getIconForStep = (id: string) => {
  switch (id) {
    case "profile": return UserCheck;
    case "kyc": return ShieldCheck;
    case "license": return FileText;
    case "marketplace": return Store;
    default: return ClipboardList;
  }
};

export default function OnboardingChecklistPage() {
  const router = useRouter();
  const t = useTranslations("OnboardingChecklist");
  const [showConfetti, setShowConfetti] = useState(false);
  const [hasShownConfetti, setHasShownConfetti] = useState(false);

  const { steps, percentage, isLoading, error, refetch, finalize, isFinalizing } = useOnboardingChecklist();

  const { completedSteps, totalRequiredSteps, activeStep, progressPercentage, canProceedToDashboard } = useMemo(() => {
    if (!steps || steps.length === 0) {
      return { completedSteps: 0, totalRequiredSteps: 0, activeStep: null, progressPercentage: 0, canProceedToDashboard: false };
    }
    const requiredSteps = steps.filter(s => s.isRequired);
    const completedRequired = requiredSteps.filter(s => s.isComplete).length;
    // El primer paso no completado será nuestro foco
    const active = steps.find(s => !s.isComplete);
    return {
      completedSteps: completedRequired,
      totalRequiredSteps: requiredSteps.length,
      activeStep: active,
      progressPercentage: percentage,
      canProceedToDashboard: requiredSteps.every(s => s.isComplete)
    };
  }, [steps, percentage]);

  useEffect(() => {
    if (canProceedToDashboard && !hasShownConfetti) {
      setShowConfetti(true);
      setHasShownConfetti(true);
      toast.success("🎉 " + t("congrats"), { position: "top-center", autoClose: 5000 });
      setTimeout(() => setShowConfetti(false), 5000);
    }
  }, [canProceedToDashboard, hasShownConfetti, t]);

  const handleAction = (path?: string) => {
    if (path) router.push(path);
    else toast.info("No route configured");
  };

  const onFinalizeAndProceed = async () => {
    const success = await finalize();
    if (success) router.push("/provider/dashboard");
  };

  if (isLoading) return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4">
      <QhSpinner size="lg" label={t("loading")} />
    </div>
  );

  if (error) return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 max-w-md w-full shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-50 dark:bg-red-500/10 rounded-xl">
                <AlertCircle className="w-6 h-6 text-red-500 dark:text-red-400" />
              </div>
              <div>
                <CardTitle className="text-red-600 dark:text-red-400 text-lg font-medium">{t("error_title")}</CardTitle>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-light">{t("error_desc")}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-700 dark:text-slate-300 text-sm">{error}</p>
            <Button onClick={refetch} variant="outline" className="w-full h-11 rounded-xl">
              <RefreshCw className="w-4 h-4 mr-2" />{t("retry")}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );

  return (
    <div className="relative overflow-hidden w-full h-full flex flex-col pt-4 md:pt-10">
      {showConfetti && <Confetti recycle={false} numberOfPieces={500} />}

      <div className="max-w-2xl w-full mx-auto relative z-10 flex-1 flex flex-col space-y-10">
        
        {/* Minimalist Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-3">
          <h1 className="text-3xl md:text-4xl font-medium text-slate-900 dark:text-white tracking-tight">
            {t("title")}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-base font-light">
            {t("desc")}
          </p>
        </motion.div>

        {/* Dynamic Stepper */}
        {!canProceedToDashboard && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="space-y-3 px-2">
            <div className="flex justify-between items-center text-sm font-medium text-slate-500 dark:text-slate-400">
              <span>Paso {completedSteps + 1} de {totalRequiredSteps}</span>
              <span>{progressPercentage}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2 bg-slate-200 dark:bg-slate-800" />
          </motion.div>
        )}

        {/* Central Focus Area */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            {canProceedToDashboard ? (
              /* Completion Final Step */
              <motion.div key="completion" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
                <Card className="bg-white dark:bg-slate-900 border-medical-200 dark:border-medical-500/20 shadow-2xl ring-1 ring-medical-500/10">
                  <CardContent className="p-10 md:p-12 text-center space-y-8">
                    <motion.div animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }} transition={{ duration: 0.6 }}>
                      <Trophy className="w-24 h-24 text-medical-600 dark:text-medical-400 mx-auto" />
                    </motion.div>
                    <div className="space-y-3">
                      <h3 className="text-3xl font-semibold text-slate-900 dark:text-white">{t("congrats")}</h3>
                      <p className="text-slate-500 dark:text-slate-400 font-light text-lg">
                        {t("congrats_desc")}
                      </p>
                    </div>
                    <Separator className="bg-slate-100 dark:bg-slate-800" />
                    <Button size="lg" onClick={onFinalizeAndProceed} disabled={isFinalizing}
                      className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 font-semibold px-10 py-6 text-lg shadow-none rounded-2xl w-full">
                      {isFinalizing ? <Loader2 className="w-6 h-6 mr-3 animate-spin" /> : <Sparkles className="w-6 h-6 mr-3" />}
                      {isFinalizing ? t("syncing") : t("go_dashboard")}
                    </Button>
                    <div className="flex items-center justify-center gap-6 text-sm pt-4">
                      <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
                        <Star className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                        <span className="font-medium text-amber-600 dark:text-amber-400">{t("verified_account")}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : activeStep ? (
              /* Active Step Focus Card */
              <motion.div key={activeStep.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden ring-1 ring-slate-900/5 dark:ring-white/5">
                  <CardContent className="p-8 md:p-10">
                    <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                      
                      {/* Icon Container */}
                      <div className="w-20 h-20 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center flex-shrink-0 border border-slate-100 dark:border-slate-800">
                        {React.createElement(getIconForStep(activeStep.id), { className: "w-10 h-10 text-slate-900 dark:text-white" })}
                      </div>

                      <div className="flex-1 space-y-4">
                        <div>
                          <h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-2">
                            {activeStep.title}
                          </h3>
                          <p className="text-slate-500 dark:text-slate-400 text-base font-light leading-relaxed">
                            {activeStep.description}
                          </p>
                        </div>

                        {/* Status Warnings */}
                        {activeStep.status === "UNDER_REVIEW" && (
                          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800/30 flex gap-3">
                            <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                              Nuestro equipo está revisando este documento. Te notificaremos pronto.
                            </p>
                          </div>
                        )}

                        {activeStep.status === "REJECTED" && activeStep.rejectionReason && (
                          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800/30 flex gap-3">
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="font-semibold text-sm text-red-700 dark:text-red-400">Motivo de rechazo:</p>
                              <p className="text-sm text-red-600 dark:text-red-300">{activeStep.rejectionReason}</p>
                            </div>
                          </div>
                        )}

                        {activeStep.isLocked && (
                          <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl flex gap-3">
                            <Lock className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              Este paso está bloqueado por el momento.
                            </p>
                          </div>
                        )}

                        {/* Action Button */}
                        <div className="pt-2">
                          <Button 
                            disabled={activeStep.isLocked || activeStep.status === "UNDER_REVIEW"} 
                            onClick={() => handleAction(activeStep.actionPath)} 
                            size="lg"
                            className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 font-semibold px-8 py-6 rounded-2xl text-base shadow-none w-full md:w-auto"
                          >
                            {activeStep.status === "REJECTED" ? "Corregir Información" : "Comenzar este paso"}
                            <ArrowRight className="w-5 h-5 ml-2" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}