"use client";

/* eslint-disable react-doctor/rerender-state-only-in-handlers */
/* eslint-disable react-doctor/no-chain-state-updates */
/* eslint-disable react-doctor/no-event-handler */
/* eslint-disable react-doctor/button-has-type */

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, Save, FileWarning, Calendar, PackageCheck, Layers } from "lucide-react";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import {
  CancellationPolicySection,
  generateCancellationPolicyText,
} from "@/components/marketplace/CancellationPolicySection";
import {
  ReturnPolicySection,
  generateReturnPolicyText,
} from "@/components/marketplace/ReturnPolicySection";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { useStoreProfile } from "@/hooks/useStoreProfile";
import { useSessionStore } from "@/stores/SessionStore";
import { cn } from "@/lib/utils";

export default function PoliciesSetupPage() {
  const router = useRouter();
  const t = useTranslations("StorePolicies");

  const { role } = useSessionStore();
  const isSupplierRole = (role as string) === "SUPPLIER" || (role as string) === "SUPPLIER_ADMIN";

  const { profile, isLoading, isSaving, updateProfile } = useStoreProfile();

  // Estados de Política de Cancelación (Citas / Servicios)
  const [cancellationText, setCancellationText] = useState("");
  const [deadlineHours, setDeadlineHours] = useState(24);
  const [refundPercent, setRefundPercent] = useState(100);
  const [cancellationPolicyType, setCancellationPolicyType] = useState("FLEXIBLE");

  // Estados de Política de Devolución (Productos / Insumos)
  const [returnText, setReturnText] = useState("");
  const [returnWindowDays, setReturnWindowDays] = useState(7);
  const [returnRefundPercent, setReturnRefundPercent] = useState(100);
  const [returnPolicyType, setReturnPolicyType] = useState("STANDARD_7_DAYS");

  const [activeTab, setActiveTab] = useState<"cancellation" | "return">(
    isSupplierRole ? "return" : "cancellation"
  );

  useEffect(() => {
    if (profile) {
      setCancellationText(profile.cancellationPolicy || "");
      setDeadlineHours(profile.cancellationDeadlineHours ?? 24);
      setRefundPercent(profile.cancellationRefundPercent ?? 100);
      setCancellationPolicyType(profile.cancellationPolicyType || "FLEXIBLE");

      setReturnText(profile.returnPolicy || "");
      setReturnWindowDays(profile.returnWindowDays ?? 7);
      setReturnRefundPercent(profile.returnRefundPercent ?? 100);
      setReturnPolicyType(profile.returnPolicyType || "STANDARD_7_DAYS");

      if (isSupplierRole) {
        setActiveTab("return");
      }
    }
  }, [profile, isSupplierRole]);

  const handleSave = async () => {
    const finalCancellationText =
      cancellationText.trim() || generateCancellationPolicyText(deadlineHours, refundPercent);
    const finalReturnText =
      returnText.trim() || generateReturnPolicyText(returnWindowDays, returnRefundPercent);

    const success = await updateProfile({
      cancellationPolicy: finalCancellationText,
      cancellationDeadlineHours: deadlineHours,
      cancellationRefundPercent: refundPercent,
      cancellationPolicyType,
      returnPolicy: finalReturnText,
      returnWindowDays,
      returnRefundPercent,
      returnPolicyType,
    });

    if (success) {
      toast.success(t("toast_success", { defaultValue: "Políticas guardadas exitosamente." }));
      router.push("/provider/store");
    } else {
      toast.error(t("toast_error", { defaultValue: "Error al guardar políticas." }));
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] bg-gray-50/50 dark:bg-[#050505] transition-colors duration-500 gap-3">
        <QhSpinner size="lg" />
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 animate-pulse">
          {t("loading", { defaultValue: "Cargando configuración de políticas..." })}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] font-sans text-gray-900 dark:text-white selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500 pt-8 px-6 md:px-10 pb-24">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between pb-6 border-b border-gray-100 dark:border-gray-800">
          <Button
            variant="outline"
            onClick={() => router.push("/provider/store")}
            className="h-10 px-4 rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-xs font-bold shadow-sm"
          >
            <ArrowLeft
              className="w-4 h-4 mr-2 text-gray-700 dark:text-gray-200"
              strokeWidth={2}
            />
            <span>{t("back", { defaultValue: "Volver" })}</span>
          </Button>

          <Button
            onClick={handleSave}
            disabled={isSaving}
            className={cn(
              "h-11 px-6 rounded-xl text-xs font-bold transition-all border-0 shadow-sm flex items-center gap-2",
              isSaving
                ? "bg-gray-100 text-gray-400 dark:bg-gray-900 dark:text-gray-600 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white"
            )}
          >
            {isSaving ? (
              <QhSpinner size="sm" />
            ) : (
              <>
                <Save className="w-4 h-4" strokeWidth={2} />
                <span>{t("btn_save", { defaultValue: "Guardar Políticas" })}</span>
              </>
            )}
          </Button>
        </div>

        {/* Contextual Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-[#0a0a0a] p-6 md:p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col sm:flex-row sm:items-center gap-5"
        >
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-sm">
            <FileWarning className="w-7 h-7" strokeWidth={2} />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight">
              {isSupplierRole
                ? "Políticas de Devolución y Garantías"
                : "Políticas de Cancelación y Devolución"}
            </h1>
            <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl">
              {isSupplierRole
                ? "Configura las reglas paramétricas de devolución de producto, garantías de fabricante y bioseguridad para tus compradores en QuHealthy."
                : "Define los plazos en horas o días y los porcentajes de reembolso aplicables por defecto a tus citas y productos, con opción de personalización atómica en el catálogo."}
            </p>
          </div>
        </motion.div>

        {/* SEGMENTED TABS PARA PERFILES MIXTOS O MÉDICOS CON PRODUCTOS */}
        {!isSupplierRole && (
          <div className="flex flex-wrap items-center justify-between gap-4 p-2 bg-white dark:bg-[#0a0a0a] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-2xs">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("cancellation")}
                className={cn(
                  "h-10 px-4 sm:px-5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer",
                  activeTab === "cancellation"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#141414] hover:text-gray-900 dark:hover:text-white"
                )}
              >
                <Calendar className="w-4 h-4" />
                <span>Cancelación de Citas Médicas</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("return")}
                className={cn(
                  "h-10 px-4 sm:px-5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer",
                  activeTab === "return"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#141414] hover:text-gray-900 dark:hover:text-white"
                )}
              >
                <PackageCheck className="w-4 h-4" />
                <span>Devolución de Insumos / Productos</span>
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-semibold text-gray-400 px-3">
              <Layers className="w-3.5 h-3.5 text-gray-400" />
              <span>Políticas Globales Parametrizables</span>
            </div>
          </div>
        )}

        {/* Policy Form Section */}
        <AnimatePresence mode="wait">
          {activeTab === "cancellation" ? (
            <motion.div
              key="cancellation"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] rounded-3xl shadow-sm overflow-hidden"
            >
              <CancellationPolicySection
                policyText={cancellationText}
                onChange={setCancellationText}
                deadlineHours={deadlineHours}
                onChangeDeadlineHours={setDeadlineHours}
                refundPercent={refundPercent}
                onChangeRefundPercent={setRefundPercent}
                policyType={cancellationPolicyType}
                onChangePolicyType={setCancellationPolicyType}
              />
            </motion.div>
          ) : (
            <motion.div
              key="return"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] rounded-3xl shadow-sm overflow-hidden"
            >
              <ReturnPolicySection
                policyText={returnText}
                onChange={setReturnText}
                returnWindowDays={returnWindowDays}
                onChangeReturnWindowDays={setReturnWindowDays}
                returnRefundPercent={returnRefundPercent}
                onChangeReturnRefundPercent={setReturnRefundPercent}
                policyType={returnPolicyType}
                onChangePolicyType={setReturnPolicyType}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
