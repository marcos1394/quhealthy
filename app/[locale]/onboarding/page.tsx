"use client";

import React, { useMemo, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, ArrowRight, Loader2, UserCheck, Store,
  ShieldCheck, ClipboardList, AlertCircle, RefreshCw, FileText,
  Sparkles, Trophy, Lock, Star, Info
} from "lucide-react";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";
import Confetti from "react-confetti";

import { useOnboardingChecklist } from "@/hooks/useOnboardingChecklist";
import { QhSpinner } from '@/components/ui/QhSpinner';
import { Button } from "@/components/ui/button";
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
    let timerId: NodeJS.Timeout;
    if (canProceedToDashboard && !hasShownConfetti) {
      setShowConfetti(true);
      setHasShownConfetti(true);
      toast.success("🎉 " + t("congrats"), { position: "top-center", autoClose: 5000 });
      timerId = setTimeout(() => setShowConfetti(false), 5000);
    }
    return () => clearTimeout(timerId);
  }, [canProceedToDashboard, hasShownConfetti, t]);

  const handleAction = (path?: string) => {
    if (path) router.push(path);
    else toast.info("No route configured");
  };

  const onFinalizeAndProceed = async () => {
    const success = await finalize();
    if (success) router.push("/provider/dashboard");
  };

  // ---------------------------------------------------------------------------
  // LOADING STATE
  // ---------------------------------------------------------------------------
  if (isLoading) return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center bg-white dark:bg-[#0a0a0a] selection:bg-gray-200 dark:selection:bg-white/20 transition-colors duration-300">
      <QhSpinner size="lg" label={t("loading")} />
    </div>
  );

  // ---------------------------------------------------------------------------
  // ERROR STATE (Architectural)
  // ---------------------------------------------------------------------------
  if (error) return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 bg-white dark:bg-[#0a0a0a] selection:bg-gray-200 dark:selection:bg-white/20 transition-colors duration-300">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="border border-red-200 dark:border-red-900/50 bg-white dark:bg-[#0a0a0a] p-8 relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-red-500" />
          <div className="flex items-start gap-4 mb-6">
            <div className="w-10 h-10 border border-red-200 dark:border-red-900 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-red-600 dark:text-red-400 mb-1">
                {t("error_title")}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-light leading-relaxed">
                {t("error_desc")}
              </p>
            </div>
          </div>
          <div className="space-y-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white border-l-2 border-red-500 pl-3 py-1">
              {error}
            </p>
            <Button 
              onClick={refetch} 
              className="w-full rounded-none bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 h-12 text-[10px] font-bold uppercase tracking-widest transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-3" /> {t("retry")}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );

  // ---------------------------------------------------------------------------
  // MAIN ONBOARDING VIEW
  // ---------------------------------------------------------------------------
  return (
    <div className="relative overflow-x-hidden w-full min-h-[80vh] flex flex-col pt-12 md:pt-20 bg-white dark:bg-[#0a0a0a] font-sans selection:bg-gray-200 dark:selection:bg-white/20 transition-colors duration-300">
      {showConfetti && <Confetti recycle={false} numberOfPieces={500} />}

      <div className="max-w-3xl w-full mx-auto relative z-10 flex-1 flex flex-col px-6 md:px-0">
        
        {/* Minimalist Editorial Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-16">
          <div className="border-l-2 border-black dark:border-white pl-4 mb-8">
            <span className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
              {t("setup_badge")}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold text-black dark:text-white tracking-tight mb-4">
            {t("title")}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg font-light leading-relaxed">
            {t("desc")}
          </p>
        </motion.div>

        {/* Architectural Stepper */}
        {!canProceedToDashboard && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="mb-12">
            <div className="flex justify-between items-end mb-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                {t("step")} 0{completedSteps + 1} <span className="mx-2 text-gray-300 dark:text-gray-700">/</span> 0{totalRequiredSteps}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
                {progressPercentage}%
              </span>
            </div>
            
            <div className="w-full h-px bg-gray-200 dark:bg-gray-800 relative">
              <motion.div 
                className="absolute top-0 left-0 h-full bg-black dark:bg-white"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
          </motion.div>
        )}

        {/* Central Focus Area */}
        <div className="flex-1 pb-20">
          <AnimatePresence mode="wait">
            
            {canProceedToDashboard ? (
              /* Completion Final Step (Blueprint Success) */
              <motion.div key="completion" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <div className="border border-black dark:border-white p-10 md:p-16 text-center bg-gray-50 dark:bg-[#050505]">
                  <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 0.6 }} className="mb-8">
                    <div className="w-20 h-20 mx-auto border border-black dark:border-white flex items-center justify-center bg-white dark:bg-black">
                      <Trophy className="w-8 h-8 text-black dark:text-white" strokeWidth={1.5} />
                    </div>
                  </motion.div>

                  <h3 className="text-3xl font-semibold text-black dark:text-white mb-4 tracking-tight">
                    {t("congrats")}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 font-light text-lg mb-12 max-w-lg mx-auto">
                    {t("congrats_desc")}
                  </p>

                  <div className="w-full h-px bg-gray-200 dark:bg-gray-800 mb-12" />

                  <Button 
                    size="lg" 
                    onClick={onFinalizeAndProceed} 
                    disabled={isFinalizing}
                    className="w-full md:w-auto min-w-[240px] rounded-none bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 h-14 text-[10px] font-bold uppercase tracking-widest transition-all"
                  >
                    {isFinalizing ? <Loader2 className="w-4 h-4 mr-3 animate-spin" /> : <Sparkles className="w-4 h-4 mr-3" />}
                    {isFinalizing ? t("syncing") : t("go_dashboard")}
                  </Button>

                  <div className="mt-12 flex items-center justify-center">
                    <div className="inline-flex items-center gap-3 border border-black dark:border-white px-4 py-2">
                      <Star className="w-3.5 h-3.5 text-black dark:text-white fill-current" />
                      <span className="text-[9px] font-bold uppercase tracking-widest text-black dark:text-white">
                        {t("verified_account")}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : activeStep ? (
              
              /* Active Step Focus Card (Flush & Rigid) */
              <motion.div key={activeStep.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <div className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-8 md:p-12 hover:border-black dark:hover:border-white transition-colors duration-500">
                  <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                    
                    {/* Icon Container (Square) */}
                    <div className="w-16 h-16 border border-gray-300 dark:border-gray-700 flex items-center justify-center shrink-0">
                      {React.createElement(getIconForStep(activeStep.id), { className: "w-6 h-6 text-black dark:text-white", strokeWidth: 1.5 })}
                    </div>

                    <div className="flex-1 space-y-6">
                      <div>
                        <h3 className="text-2xl font-semibold text-black dark:text-white mb-3 tracking-tight">
                          {activeStep.title}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-light leading-relaxed">
                          {activeStep.description}
                        </p>
                      </div>

                      {/* Status Warnings (Architectural Margin Notes) */}
                      {activeStep.status === "UNDER_REVIEW" && (
                        <div className="border-l-2 border-blue-500 pl-4 py-1">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-1 flex items-center gap-2">
                            <Info className="w-3 h-3" /> {t("status_under_review")}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-light">
                            {t("desc_under_review")}
                          </p>
                        </div>
                      )}

                      {activeStep.status === "REJECTED" && activeStep.rejectionReason && (
                        <div className="border-l-2 border-red-500 pl-4 py-1">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-red-600 dark:text-red-400 mb-1 flex items-center gap-2">
                            <AlertCircle className="w-3 h-3" /> {t("status_action_required")}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-300 font-light">
                            {activeStep.rejectionReason}
                          </p>
                        </div>
                      )}

                      {activeStep.isLocked && (
                        <div className="border-l-2 border-gray-300 dark:border-gray-700 pl-4 py-1">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1 flex items-center gap-2">
                            <Lock className="w-3 h-3" /> {t("status_locked")}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-light">
                            {t("desc_locked")}
                          </p>
                        </div>
                      )}

                      {/* Action Button (Flush) */}
                      <div className="pt-4">
                        <Button 
                          disabled={activeStep.isLocked || activeStep.status === "UNDER_REVIEW"} 
                          onClick={() => handleAction(activeStep.actionPath)} 
                          className="w-full md:w-auto min-w-[200px] rounded-none bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 h-14 text-[10px] font-bold uppercase tracking-widest transition-all group border-0"
                        >
                          <span className="flex-1 text-center md:text-left">
                            {activeStep.status === "REJECTED" ? t("btn_correct_info") : t("btn_start")}
                          </span>
                          <ArrowRight className="w-4 h-4 ml-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}