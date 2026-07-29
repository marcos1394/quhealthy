"use client";

/* eslint-disable react-doctor/no-giant-component */
/* eslint-disable react-doctor/button-has-type */

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import Link from "next/link";
import {
  Clock,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Info,
  Shield,
  FileCheck,
  Camera,
  CreditCard,
  Zap,
  X,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

// ── TIPOS ─────────────────────────────────────────────────────────────
export interface VerificationStatusData {
  kyc: {
    isComplete: boolean;
    status: "pending" | "verified" | "rejected" | "not_started";
    submittedAt?: string;
    rejectionReason?: string;
  };
  license?: {
    isComplete: boolean;
    status: "pending" | "verified" | "rejected" | "not_started";
    submittedAt?: string;
    rejectionReason?: string;
  };
  payment?: {
    isComplete: boolean;
    status: "pending" | "verified" | "not_started";
  };
}

interface VerificationStatusProps {
  status: VerificationStatusData;
  onDismiss?: () => void;
  showDismiss?: boolean;
}

export const VerificationStatus: React.FC<VerificationStatusProps> = ({
  status,
  onDismiss,
  showDismiss = false,
}) => {
  const t = useTranslations("VerificationStatus");

  // Calcular progreso (Feedback Visual)
  let completed = 0;
  let total = 2; // KYC + Payment

  if (status.kyc.isComplete) completed++;
  if (status.payment?.isComplete) completed++;

  if (status.license) {
    total++;
    if (status.license.isComplete) completed++;
  }

  const progress = (completed / total) * 100;

  // Calcular tiempo estimado (Credibilidad)
  let timeLeft = "";
  const isPending =
    status.kyc.status === "pending" || status.license?.status === "pending";

  if (isPending && status.kyc.submittedAt) {
    const submitted = new Date(status.kyc.submittedAt);
    const now = new Date();
    const hoursPassed = Math.floor(
      (now.getTime() - submitted.getTime()) / (1000 * 60 * 60)
    );
    const hoursLeft = Math.max(0, 24 - hoursPassed);

    if (hoursLeft > 0) {
      timeLeft = t("time_left", { hours: hoursLeft });
    } else {
      timeLeft = t("time_soon");
    }
  }

  const isKycComplete = status.kyc.isComplete;
  const isLicenseRequired = !!status.license;
  const isLicenseComplete = status.license?.isComplete || false;
  const isPaymentComplete = status.payment?.isComplete || false;

  // Si todo está completo, no mostramos el widget
  const allComplete =
    isKycComplete &&
    (!isLicenseRequired || isLicenseComplete) &&
    isPaymentComplete;

  if (allComplete) return null;

  // ── ESTADOS DE CONFIGURACIÓN ─────────────────────────────────────────
  const getStatusConfig = () => {
    const hasRejection =
      status.kyc.status === "rejected" || status.license?.status === "rejected";
    const isUnderReview =
      status.kyc.status === "pending" || status.license?.status === "pending";
    const isNotStarted = status.kyc.status === "not_started";

    if (hasRejection) {
      return {
        type: "rejected",
        bgColor: "bg-rose-50/60 dark:bg-rose-950/20",
        borderColor: "border-rose-200 dark:border-rose-900/40",
        iconColor: "text-rose-600 dark:text-rose-400",
        iconBg: "bg-rose-50 dark:bg-rose-950/40",
        titleColor: "text-rose-800 dark:text-rose-300",
        icon: XCircle,
        title: t("rejected_title"),
        description: t("rejected_desc"),
        actionText: t("rejected_btn"),
        buttonClass: "bg-rose-600 hover:bg-rose-700 text-white border-0",
        urgency: "high",
      };
    } else if (isUnderReview) {
      return {
        type: "pending",
        bgColor: "bg-amber-50/60 dark:bg-amber-950/20",
        borderColor: "border-amber-200 dark:border-amber-900/40",
        iconColor: "text-amber-600 dark:text-amber-400",
        iconBg: "bg-amber-50 dark:bg-amber-950/40",
        titleColor: "text-amber-800 dark:text-amber-300",
        icon: Clock,
        title: t("pending_title"),
        description: t("pending_desc"),
        actionText: t("pending_btn"),
        buttonClass: "bg-amber-600 hover:bg-amber-700 text-white border-0",
        urgency: "low",
      };
    } else if (!isNotStarted && progress > 50) {
      return {
        type: "almost",
        bgColor: "bg-emerald-50/60 dark:bg-emerald-950/20",
        borderColor: "border-emerald-200 dark:border-emerald-900/40",
        iconColor: "text-emerald-600 dark:text-emerald-400",
        iconBg: "bg-emerald-50 dark:bg-emerald-950/40",
        titleColor: "text-emerald-800 dark:text-emerald-300",
        icon: Zap,
        title: t("almost_title"),
        description: t("almost_desc"),
        actionText: t("almost_btn"),
        buttonClass: "bg-emerald-600 hover:bg-emerald-700 text-white border-0",
        urgency: "medium",
      };
    } else {
      return {
        type: "required",
        bgColor: "bg-indigo-50/60 dark:bg-indigo-950/20",
        borderColor: "border-indigo-200 dark:border-indigo-900/40",
        iconColor: "text-indigo-600 dark:text-indigo-400",
        iconBg: "bg-indigo-50 dark:bg-indigo-950/40",
        titleColor: "text-indigo-800 dark:text-indigo-300",
        icon: AlertTriangle,
        title: t("required_title"),
        description: t("required_desc"),
        actionText: t("required_btn"),
        buttonClass: "bg-indigo-600 hover:bg-indigo-700 text-white border-0",
        urgency: "high",
      };
    }
  };

  const config = getStatusConfig();
  const StatusIcon = config.icon;

  // ── PASOS A COMPLETAR ───────────────────────────────────────────────
  const steps = [
    {
      id: "kyc",
      label: t("step_kyc"),
      icon: Camera,
      isComplete: status.kyc.isComplete,
      isPending: status.kyc.status === "pending",
      isRejected: status.kyc.status === "rejected",
      rejectionReason: status.kyc.rejectionReason,
    },
    ...(isLicenseRequired
      ? [
          {
            id: "license",
            label: t("step_license"),
            icon: FileCheck,
            isComplete: status.license?.isComplete || false,
            isPending: status.license?.status === "pending",
            isRejected: status.license?.status === "rejected",
            rejectionReason: status.license?.rejectionReason,
          },
        ]
      : []),
    {
      id: "payment",
      label: t("step_payment"),
      icon: CreditCard,
      isComplete: status.payment?.isComplete || false,
      isPending: status.payment?.status === "pending",
      isRejected: false,
    },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6 overflow-hidden font-sans"
      >
        <Card
          className={cn(
            "border shadow-sm transition-all duration-200 rounded-3xl",
            config.bgColor,
            config.borderColor
          )}
        >
          <CardContent className="p-6 sm:p-8">
            {/* Header del Widget */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-start gap-4 flex-1">
                <div
                  className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border shadow-2xs",
                    config.iconBg,
                    config.borderColor,
                    config.iconColor
                  )}
                >
                  <StatusIcon className="w-6 h-6" strokeWidth={2} />
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <h3
                      className={cn(
                        "font-bold text-lg tracking-tight",
                        config.titleColor
                      )}
                    >
                      {config.title}
                    </h3>
                    {config.urgency === "high" && (
                      <span className="bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-2xs font-mono">
                        {t("urgent_badge")}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 leading-relaxed max-w-md">
                    {config.description}
                  </p>
                </div>
              </div>

              {showDismiss && onDismiss && (
                <button
                  type="button"
                  onClick={onDismiss}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-[#111] transition-colors shadow-2xs cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4" strokeWidth={2} />
                </button>
              )}
            </div>

            {/* Progress Bar (Feedback Visual) */}
            <div className="mb-6 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  {t("progress_label")}
                </p>
                <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {Math.round(progress)}%
                </span>
              </div>
              <Progress
                value={progress}
                className="h-2 bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800"
                indicatorColor={cn(
                  progress === 100
                    ? "bg-emerald-500"
                    : "bg-indigo-500"
                )}
              />
            </div>

            {/* Pasos a Completar */}
            <div className="space-y-2.5 mb-6">
              {steps.map((step, index) => {
                const StepIcon = step.icon;

                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      "flex items-center gap-3 p-3.5 rounded-2xl border transition-all shadow-2xs bg-white dark:bg-[#0a0a0a]",
                      step.isComplete
                        ? "border-emerald-200 dark:border-emerald-900/40"
                        : step.isPending
                        ? "border-amber-200 dark:border-amber-900/40"
                        : step.isRejected
                        ? "border-rose-200 dark:border-rose-900/40"
                        : "border-gray-100 dark:border-gray-800 opacity-70"
                    )}
                  >
                    {/* Icono del Paso */}
                    <div
                      className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border",
                        step.isComplete
                          ? "bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-950/30 dark:border-emerald-900/30 dark:text-emerald-400"
                          : step.isPending
                          ? "bg-amber-50 border-amber-100 text-amber-600 dark:bg-amber-950/30 dark:border-amber-900/30 dark:text-amber-400"
                          : step.isRejected
                          ? "bg-rose-50 border-rose-100 text-rose-600 dark:bg-rose-950/30 dark:border-rose-900/30 dark:text-rose-400"
                          : "bg-gray-50 border-gray-200 text-gray-400 dark:bg-[#050505] dark:border-gray-800"
                      )}
                    >
                      <StepIcon className="w-4 h-4" strokeWidth={2} />
                    </div>

                    {/* Etiqueta y Estado */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p
                          className={cn(
                            "text-xs font-bold truncate",
                            step.isComplete
                              ? "text-gray-900 dark:text-white"
                              : "text-gray-500"
                          )}
                        >
                          {step.label}
                        </p>
                        {step.isComplete && (
                          <CheckCircle2
                            className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400"
                            strokeWidth={2.5}
                          />
                        )}
                        {step.isPending && (
                          <span className="bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/40 text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-2xs font-mono">
                            {t("badge_review")}
                          </span>
                        )}
                      </div>

                      {step.isRejected && step.rejectionReason && (
                        <p className="text-[11px] font-medium text-rose-600 dark:text-rose-400 mt-0.5 truncate">
                          ⚠️ {step.rejectionReason}
                        </p>
                      )}
                    </div>

                    {/* Tiempo Restante */}
                    {step.isPending && timeLeft && (
                      <span className="flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/40 px-2 py-1 rounded-lg text-[10px] font-bold font-mono shadow-2xs">
                        <Clock className="w-3 h-3" strokeWidth={2} />
                        <span>{timeLeft}</span>
                      </span>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Info de Beneficios (Credibilidad) */}
            {config.type === "required" && (
              <div className="bg-indigo-50/50 dark:bg-indigo-950/10 border border-indigo-100 dark:border-indigo-900/30 rounded-2xl p-4 mb-6 shadow-2xs">
                <div className="flex items-start gap-3">
                  <Info
                    className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5"
                    strokeWidth={2}
                  />
                  <div className="space-y-1.5">
                    <p className="text-xs font-bold text-indigo-800 dark:text-indigo-300">
                      {t("benefits_title")}
                    </p>
                    <ul className="space-y-1.5 text-[11px] font-medium text-indigo-700/80 dark:text-indigo-300/80">
                      <li className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3 h-3 flex-shrink-0 mt-0.5 text-indigo-500" />
                        <span>{t("benefit_1")}</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3 h-3 flex-shrink-0 mt-0.5 text-indigo-500" />
                        <span>{t("benefit_2")}</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3 h-3 flex-shrink-0 mt-0.5 text-indigo-500" />
                        <span>{t("benefit_3")}</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3 h-3 flex-shrink-0 mt-0.5 text-indigo-500" />
                        <span>{t("benefit_4")}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Info de Revisión (Reducción de Ansiedad) */}
            {config.type === "pending" && (
              <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-2xl p-4 mb-6 shadow-2xs">
                <div className="flex items-start gap-3">
                  <Shield
                    className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0 mt-0.5"
                    strokeWidth={2}
                  />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-gray-800 dark:text-gray-200">
                      {t("review_time_title")}
                    </p>
                    <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                      {t("review_time_desc")}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Botón de Acción Principal */}
            <Link href="/onboarding" className="block w-full">
              <button
                type="button"
                className={cn(
                  "w-full h-12 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer",
                  config.buttonClass
                )}
              >
                <span>{config.actionText}</span>
                <ArrowRight className="w-4 h-4" strokeWidth={2} />
              </button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};