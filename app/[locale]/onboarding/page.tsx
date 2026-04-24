"use client";

import React, { useMemo, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, ArrowRight, Loader2, UserCheck, Store,
  ShieldCheck, ClipboardList, AlertCircle, RefreshCw, FileText,
  Sparkles, Trophy, Zap, Lock, Circle, Star, Gift, ChevronRight, Info, Target
} from "lucide-react";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";
import Confetti from "react-confetti";

import { useOnboardingChecklist } from "@/hooks/useOnboardingChecklist";
import { OnboardingStepUI } from "@/types/onboarding";
import { QhSpinner } from '@/components/ui/QhSpinner';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const getIconForStep = (id: string) => {
  switch (id) {
    case "profile": return UserCheck;
    case "kyc": return ShieldCheck;
    case "license": return FileText;
    case "marketplace": return Store;
    default: return ClipboardList;
  }
};

const StepItem = ({ step, index, onAction, isNext, t }: {
  step: OnboardingStepUI; index: number; onAction: (path?: string) => void; isNext: boolean;
  t: (key: string) => string;
}) => {
  const Icon = getIconForStep(step.id);
  const isCompleted = step.isComplete;
  const isUnderReview = step.status === "UNDER_REVIEW";
  const isRejected = step.status === "REJECTED";

  // Si está en revisión o ya completado, lo consideramos bloqueado para nueva edición normal, 
  // pero el bloqueo secuencial viene de step.isLocked.
  const isLocked = step.isLocked;
  const isDisabledAction = isLocked || isUnderReview;

  // Un paso es 'current' si es el siguiente lógico a hacer y NO está completado, bloqueado, en revisión ni rechazado.
  const isCurrent = !isCompleted && !isLocked && isNext && !isUnderReview && !isRejected;
  const isOptional = !step.isRequired;

  return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ delay: index * 0.08 }} layout className="relative">
      <Card className={cn(
        "overflow-hidden transition-all duration-300 border group hover:shadow-lg",
        isCurrent ? "bg-white dark:bg-slate-900 border-medical-500/50 shadow-lg ring-1 ring-medical-500/20" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800",
        isCompleted ? "bg-medical-50/30 dark:bg-medical-500/5 border-medical-500/30" : "",
        isUnderReview ? "bg-blue-50/30 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800/50" : "",
        isRejected ? "bg-red-50/20 dark:bg-red-900/10 border-red-300 dark:border-red-800/50" : "",
        isLocked ? "bg-slate-100 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-60 cursor-not-allowed" : "",
      )}>
        <CardContent className="p-0">
          <div className="flex items-start gap-5 p-5 md:p-6">
            <div className="relative flex-shrink-0">
              <motion.div
                className={cn(
                  "w-14 h-14 rounded-xl flex items-center justify-center border transition-all duration-300",
                  isCompleted ? "bg-medical-600 border-medical-500 text-white dark:bg-medical-500" : "",
                  isUnderReview ? "bg-blue-600 border-blue-500 text-white dark:bg-blue-500" : "",
                  isRejected ? "bg-red-600 border-red-500 text-white dark:bg-red-500" : "",
                  isCurrent ? "bg-slate-900 border-slate-800 text-white dark:bg-white dark:border-slate-200 dark:text-slate-900" : "",
                  isLocked ? "bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-400 dark:text-slate-600" : "",
                  !isCurrent && !isCompleted && !isLocked && !isUnderReview && !isRejected ? "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400" : ""
                )}
                animate={isCurrent ? { scale: [1, 1.05, 1] } : {}}
                transition={{ duration: 2, repeat: isCurrent ? Infinity : 0, repeatDelay: 1 }}
              >
                {isCompleted ? <CheckCircle2 className="w-7 h-7" /> :
                  isLocked ? <Lock className="w-6 h-6" /> :
                    isUnderReview ? <Loader2 className="w-6 h-6 animate-spin" /> :
                      isRejected ? <AlertCircle className="w-6 h-6" /> :
                        <Icon className="w-6 h-6" />}
              </motion.div>
              <motion.div
                className={cn(
                  "absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border",
                  isCompleted ? "bg-medical-600 border-medical-500 text-white dark:bg-medical-500" : "",
                  isUnderReview ? "bg-blue-600 border-blue-500 text-white dark:bg-blue-500" : "",
                  isRejected ? "bg-red-600 border-red-500 text-white dark:bg-red-500" : "",
                  isCurrent ? "bg-slate-900 border-slate-800 text-white dark:bg-white dark:border-slate-200 dark:text-slate-900" : "",
                  isLocked ? "bg-slate-300 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400" : "",
                  !isCurrent && !isCompleted && !isLocked && !isUnderReview && !isRejected ? "bg-slate-200 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400" : ""
                )}
                animate={isCurrent ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 1.5, repeat: isCurrent ? Infinity : 0, repeatDelay: 1 }}
              >
                {index + 1}
              </motion.div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className={cn(
                      "font-semibold text-lg",
                      isCompleted ? "text-medical-600 dark:text-medical-400" : "",
                      isCurrent ? "text-slate-900 dark:text-white" : "",
                      isLocked ? "text-slate-400 dark:text-slate-500" : "",
                      isUnderReview ? "text-blue-700 dark:text-blue-400" : "",
                      isRejected ? "text-red-700 dark:text-red-400" : "",
                      !isCurrent && !isCompleted && !isLocked && !isUnderReview && !isRejected ? "text-slate-700 dark:text-slate-300" : ""
                    )}>
                      {step.title}
                    </h3>

                    {isCurrent && (
                      <Badge className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-0 text-[10px] px-2 py-0.5">
                        <Zap className="w-3 h-3 mr-1" />{t("in_progress")}
                      </Badge>
                    )}
                    {isOptional && !isCompleted && (
                      <Badge variant="outline" className="border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-[10px] px-2 py-0.5">
                        <Info className="w-3 h-3 mr-1" />{t("optional")}
                      </Badge>
                    )}
                    {!isOptional && !isCompleted && !isLocked && !isCurrent && !isUnderReview && !isRejected && (
                      <Badge variant="outline" className="border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 text-[10px] px-2 py-0.5">
                        <Target className="w-3 h-3 mr-1" />{t("required")}
                      </Badge>
                    )}
                    {isCompleted && (
                      <Badge className="bg-medical-50 dark:bg-medical-500/10 text-medical-600 dark:text-medical-400 border-0 text-[10px] px-2 py-0.5">
                        <CheckCircle2 className="w-3 h-3 mr-1" />{t("completed") || "Completado"}
                      </Badge>
                    )}
                    {isUnderReview && (
                      <Badge className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-0 text-[10px] px-2 py-0.5">
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" /> En revisión
                      </Badge>
                    )}
                    {isRejected && (
                      <Badge className="bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 border-0 text-[10px] px-2 py-0.5">
                        <AlertCircle className="w-3 h-3 mr-1" /> Requiere cambios
                      </Badge>
                    )}
                    {isLocked && (
                      <Badge variant="outline" className="border-slate-300 dark:border-slate-700 text-slate-400 dark:text-slate-500 text-[10px] px-2 py-0.5">
                        <Lock className="w-3 h-3 mr-1" />{t("locked")}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-sm text-slate-500 dark:text-slate-400 font-light leading-relaxed mb-3">{step.description}</p>

              {isUnderReview && (
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800/30 flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Nuestro equipo está revisando tu documento. Te notificaremos en un plazo de 24-48 horas.
                  </p>
                </div>
              )}

              {isRejected && step.rejectionReason && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800/30 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-semibold text-sm text-red-700 dark:text-red-400">Motivo de rechazo:</p>
                    <p className="text-sm text-red-600 dark:text-red-300">
                      {step.rejectionReason}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between gap-4 flex-wrap mt-2">
                <div className="flex items-center gap-2">
                  <Circle className={cn("w-2 h-2 fill-current", isCompleted ? "text-medical-500" : "", isCurrent ? "text-slate-900 dark:text-white animate-pulse" : "", isLocked ? "text-slate-300 dark:text-slate-600" : "", isUnderReview ? "text-blue-500" : "", isRejected ? "text-red-500" : "", !isCurrent && !isCompleted && !isLocked && !isUnderReview && !isRejected ? "text-slate-400" : "")} />
                  <span className={cn("text-xs font-medium", isCompleted ? "text-medical-600 dark:text-medical-400" : "", isCurrent ? "text-slate-700 dark:text-slate-300" : "", isLocked ? "text-slate-400 dark:text-slate-600" : "", isUnderReview ? "text-blue-600 dark:text-blue-400" : "", isRejected ? "text-red-600 dark:text-red-400" : "", !isCurrent && !isCompleted && !isLocked && !isUnderReview && !isRejected ? "text-slate-500" : "")}>{step.statusText}</span>
                </div>

                {isCompleted ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-medical-50 dark:bg-medical-500/10 border border-medical-200 dark:border-medical-500/20">
                    <CheckCircle2 className="w-4 h-4 text-medical-600 dark:text-medical-400" />
                    <span className="text-sm font-medium text-medical-600 dark:text-medical-400">{t("completed") || "Completado"}</span>
                  </div>
                ) : (
                  <Button disabled={isDisabledAction} onClick={() => onAction(step.actionPath)} size="sm"
                    className={cn("h-9 px-4 rounded-lg shadow-none font-medium",
                      isCurrent ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100" :
                        isRejected ? "bg-red-600 text-white hover:bg-red-700" :
                          isDisabledAction ? "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed" :
                            "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700"
                    )}>
                    {isLocked ? <><Lock className="w-3 h-3 mr-1.5" />{t("locked")}</> :
                      isUnderReview ? <><Loader2 className="w-3 h-3 mr-1.5 animate-spin" />En revisión</> :
                        isRejected ? <>Corregir<ChevronRight className="w-4 h-4 ml-1" /></> :
                          <>{isCurrent ? t("continue") : t("start")}<ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" /></>}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default function OnboardingChecklistPage() {
  const router = useRouter();
  const t = useTranslations("OnboardingChecklist");
  const [showConfetti, setShowConfetti] = useState(false);
  const [hasShownConfetti, setHasShownConfetti] = useState(false);

  const { steps, percentage, isLoading, error, refetch, finalize, isFinalizing } = useOnboardingChecklist();

  const { completedSteps, totalRequiredSteps, nextStep, progressPercentage, canProceedToDashboard } = useMemo(() => {
    if (!steps || steps.length === 0) return { completedSteps: 0, totalRequiredSteps: 0, nextStep: null, progressPercentage: 0, canProceedToDashboard: false };
    const requiredSteps = steps.filter(s => s.isRequired);
    const completedRequired = requiredSteps.filter(s => s.isComplete).length;
    const next = steps.find(s => !s.isComplete && !s.isLocked);
    return { completedSteps: completedRequired, totalRequiredSteps: requiredSteps.length, nextStep: next, progressPercentage: percentage, canProceedToDashboard: requiredSteps.every(s => s.isComplete) };
  }, [steps, percentage]);

  useEffect(() => {
    if (canProceedToDashboard && !hasShownConfetti) {
      setShowConfetti(true); setHasShownConfetti(true);
      toast.success("🎉 " + t("congrats"), { position: "top-center", autoClose: 5000 });
      setTimeout(() => setShowConfetti(false), 5000);
    }
  }, [canProceedToDashboard, hasShownConfetti, t]);

  const handleAction = (path?: string) => { if (path) router.push(path); else toast.info("No route configured"); };

  const onFinalizeAndProceed = async () => {
    const success = await finalize();
    if (success) router.push("/provider/dashboard");
  };

  if (isLoading) return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center gap-4 transition-colors">
      <QhSpinner size="lg" label={t("loading")} />
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 max-w-md w-full shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-50 dark:bg-red-500/10 rounded-xl"><AlertCircle className="w-6 h-6 text-red-500 dark:text-red-400" /></div>
              <div><CardTitle className="text-red-600 dark:text-red-400 text-lg font-medium">{t("error_title")}</CardTitle><p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-light">{t("error_desc")}</p></div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-700 dark:text-slate-300 text-sm">{error}</p>
            <Button onClick={refetch} variant="outline" className="w-full border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 h-11 rounded-xl">
              <RefreshCw className="w-4 h-4 mr-2" />{t("retry")}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 relative overflow-hidden transition-colors duration-300">
      {showConfetti && <Confetti recycle={false} numberOfPieces={500} />}

      <div className="max-w-4xl mx-auto relative z-10 space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-medical-50 dark:bg-medical-500/10 border border-medical-200 dark:border-medical-500/20 rounded-full px-5 py-2 mb-2">
            <Sparkles className="w-4 h-4 text-medical-600 dark:text-medical-400" />
            <span className="text-sm font-medium text-medical-600 dark:text-medical-400">{t("badge")}</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-medium text-slate-900 dark:text-white tracking-tight">{t("title")}</h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-lg font-light leading-relaxed">{t("desc")}</p>
        </motion.div>

        {/* Progress Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="pb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-medical-50 dark:bg-medical-500/10 rounded-xl border border-medical-200 dark:border-medical-500/20">
                    <ClipboardList className="w-6 h-6 text-medical-600 dark:text-medical-400" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-slate-900 dark:text-white font-semibold">{t("progress_title")}</CardTitle>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 font-light">{completedSteps} {t("steps_of")} {totalRequiredSteps} {t("required_steps")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {canProceedToDashboard ? (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-medical-50 dark:bg-medical-500/10 border border-medical-200 dark:border-medical-500/20">
                      <Trophy className="w-6 h-6 text-medical-600 dark:text-medical-400" />
                      <span className="text-lg font-semibold text-medical-600 dark:text-medical-400">{t("complete")}</span>
                    </div>
                  ) : (
                    <span className="text-4xl font-medium text-medical-600 dark:text-medical-400">{progressPercentage}%</span>
                  )}
                </div>
              </div>
              <div className="mt-6 space-y-2">
                <Progress value={progressPercentage} className="h-2 bg-slate-100 dark:bg-slate-800" />
                {nextStep && !canProceedToDashboard && (
                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <Zap className="w-4 h-4 text-medical-600 dark:text-medical-400" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t("next_step")}: {nextStep.title}</span>
                  </motion.div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <AnimatePresence mode="popLayout">
                {steps.length === 0 ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
                    <Trophy className="w-16 h-16 text-medical-600 dark:text-medical-400 mx-auto mb-4" />
                    <p className="text-lg font-medium text-slate-900 dark:text-white mb-2">{t("no_pending")}</p>
                    <p className="text-slate-500 dark:text-slate-400 font-light">{t("no_pending_desc")}</p>
                  </motion.div>
                ) : (
                  steps.map((step, index) => (
                    <StepItem key={step.id} step={step} index={index} onAction={handleAction} isNext={nextStep ? step.id === nextStep.id : false} t={t} />
                  ))
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        {/* Completion CTA */}
        <AnimatePresence>
          {canProceedToDashboard && (
            <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20 }} transition={{ type: "spring", stiffness: 200 }}>
              <Card className="bg-white dark:bg-slate-900 border-medical-200 dark:border-medical-500/20 shadow-sm">
                <CardContent className="p-8 text-center space-y-6">
                  <motion.div animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }} transition={{ duration: 0.6 }}>
                    <Trophy className="w-20 h-20 text-medical-600 dark:text-medical-400 mx-auto" />
                  </motion.div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-medium text-slate-900 dark:text-white">{t("congrats")}</h3>
                    <p className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto font-light leading-relaxed">{t("congrats_desc")}</p>
                  </div>
                  <Separator className="bg-slate-200 dark:bg-slate-800" />
                  <Button size="lg" onClick={onFinalizeAndProceed} disabled={isFinalizing}
                    className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 font-semibold px-8 py-5 text-base shadow-none rounded-xl h-14 group">
                    {isFinalizing ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />{t("syncing")}</> : <><Sparkles className="w-5 h-5 mr-2" />{t("go_dashboard")}<ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" /></>}
                  </Button>
                  <div className="flex items-center justify-center gap-6 text-sm text-slate-500 dark:text-slate-400 pt-2">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
                      <Star className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                      <span className="font-medium text-amber-600 dark:text-amber-400 text-xs">{t("verified_account")}</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-medical-50 dark:bg-medical-500/10 border border-medical-200 dark:border-medical-500/20">
                      <Gift className="w-4 h-4 text-medical-600 dark:text-medical-400" />
                      <span className="font-medium text-medical-600 dark:text-medical-400 text-xs">{t("active_benefits")}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Help Card */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <Card className="bg-slate-100/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800">
            <CardContent className="p-5 flex items-start gap-3">
              <div className="p-2.5 bg-slate-200 dark:bg-slate-800 rounded-xl flex-shrink-0">
                <Info className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400 font-light leading-relaxed">
                <p className="font-medium text-slate-700 dark:text-slate-300 mb-1">{t("help_title")}</p>
                <p>{t("help_desc")}{" "}<a href="mailto:support@quhealthy.com" className="underline hover:text-medical-600 dark:hover:text-medical-400 font-medium">support@quhealthy.com</a></p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}