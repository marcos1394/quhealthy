"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";
import {
  Shield,
  Save,
  AlertTriangle,
  XCircle,
  CheckCircle,
  Link2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { budgetService, BudgetPolicyDTO } from "@/services/budget.service";
import { ApprovalChainConfig } from "./ApprovalChainConfig";

const DEFAULT_POLICY: BudgetPolicyDTO = {
  allowNegativeBudget: false,
  allowOverExecution: false,
  overExecutionMode: "BLOCK",
  approvalLevels: 1,
  transferLimitPercentage: null,
  allowCrossDepartmentTransfer: false,
  monthlyControlEnabled: false,
};

// Provider ID temporal - en producción provendrá del contexto de autenticación/organización
const PROVIDER_ID = 1;

export default function BudgetPoliciesPage() {
  const t = useTranslations("BudgetPolicies");

  const [policy, setPolicy] = useState<BudgetPolicyDTO>(DEFAULT_POLICY);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchPolicy = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await budgetService.getPolicy();
      setPolicy(data || DEFAULT_POLICY);
    } catch (error) {
      console.error(error);
      toast.error(t("toasts.load_error"));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchPolicy();
  }, [fetchPolicy]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const saved = await budgetService.savePolicy(policy);
      setPolicy(saved);
      toast.success(t("toasts.save_success"));
    } catch (error) {
      console.error(error);
      toast.error(t("toasts.save_error"));
    } finally {
      setIsSaving(false);
    }
  };

  const modeOptions: {
    value: BudgetPolicyDTO["overExecutionMode"];
    labelKey: string;
    descKey: string;
    icon: React.ReactNode;
    colors: string;
    hover: string;
  }[] = [
    {
      value: "BLOCK",
      labelKey: "overexecution_control.modes.block_label",
      descKey: "overexecution_control.modes.block_desc",
      icon: <XCircle className="w-5 h-5 text-rose-500" strokeWidth={2} />,
      colors:
        "border-rose-200 bg-rose-50/50 dark:border-rose-900/50 dark:bg-rose-950/20",
      hover:
        "hover:border-rose-200 hover:bg-rose-50/30 dark:hover:border-rose-800 dark:hover:bg-rose-950/10",
    },
    {
      value: "WARN",
      labelKey: "overexecution_control.modes.warn_label",
      descKey: "overexecution_control.modes.warn_desc",
      icon: <AlertTriangle className="w-5 h-5 text-amber-500" strokeWidth={2} />,
      colors:
        "border-amber-200 bg-amber-50/50 dark:border-amber-900/50 dark:bg-amber-950/20",
      hover:
        "hover:border-amber-200 hover:bg-amber-50/30 dark:hover:border-amber-800 dark:hover:bg-amber-950/10",
    },
    {
      value: "AUTHORIZE",
      labelKey: "overexecution_control.modes.authorize_label",
      descKey: "overexecution_control.modes.authorize_desc",
      icon: <CheckCircle className="w-5 h-5 text-emerald-500" strokeWidth={2} />,
      colors:
        "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/50 dark:bg-emerald-950/20",
      hover:
        "hover:border-emerald-200 hover:bg-emerald-50/30 dark:hover:border-emerald-800 dark:hover:bg-emerald-950/10",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-gray-50/50 dark:bg-[#050505] transition-colors duration-500">
        <QhSpinner size="lg" />
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-4 animate-pulse">
          {t("loading")}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] font-sans text-gray-900 dark:text-white selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500 pb-24">
      <div className="max-w-7xl mx-auto px-6 py-10 sm:py-12 space-y-8">
        
        {/* ── HEADER ────────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 dark:border-gray-800 pb-8">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 shadow-sm flex items-center justify-center shrink-0">
              <Shield className="w-7 h-7" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-1">
                {t("title")}
              </h1>
              <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                {t("subtitle")}
              </p>
            </div>
          </div>
        </div>

        {/* ── GRID CONFIGURACIONES PRINCIPALES ──────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Tarjeta: Control de Sobreejercicio */}
          <div className="border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] rounded-3xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 sm:p-8 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505]">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {t("overexecution_control.title")}
              </h2>
            </div>

            <div className="p-6 sm:p-8 space-y-6 flex-1">
              {/* Saldo negativo */}
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-gray-900 dark:text-white">
                    {t("overexecution_control.allow_negative_title")}
                  </p>
                  <p className="text-[11px] font-medium text-gray-400 mt-0.5">
                    {t("overexecution_control.allow_negative_desc")}
                  </p>
                </div>
                <Switch
                  checked={policy.allowNegativeBudget}
                  onCheckedChange={(v) =>
                    setPolicy((p) => ({ ...p, allowNegativeBudget: v }))
                  }
                />
              </div>

              {/* Sobre-ejecución */}
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-gray-900 dark:text-white">
                    {t("overexecution_control.allow_overexecution_title")}
                  </p>
                  <p className="text-[11px] font-medium text-gray-400 mt-0.5">
                    {t("overexecution_control.allow_overexecution_desc")}
                  </p>
                </div>
                <Switch
                  checked={policy.allowOverExecution}
                  onCheckedChange={(v) =>
                    setPolicy((p) => ({ ...p, allowOverExecution: v }))
                  }
                />
              </div>

              {/* Modo de Reacción */}
              <div className="space-y-3 pt-6 border-t border-gray-100 dark:border-gray-800">
                <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  {t("overexecution_control.action_on_exceed_title")}
                </Label>
                <div className="space-y-3">
                  {modeOptions.map((opt) => {
                    const isSelected = policy.overExecutionMode === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() =>
                          setPolicy((p) => ({
                            ...p,
                            overExecutionMode: opt.value,
                          }))
                        }
                        className={cn(
                          "w-full flex items-center gap-4 p-4 text-left transition-all rounded-2xl border",
                          isSelected
                            ? cn(opt.colors, "shadow-sm ring-1 ring-emerald-500/20")
                            : cn("border-gray-100 dark:border-gray-800", opt.hover)
                        )}
                      >
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white dark:bg-[#0a0a0a] shadow-sm shrink-0 border border-gray-100 dark:border-gray-800">
                          {opt.icon}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-900 dark:text-white">
                            {t(opt.labelKey as any)}
                          </p>
                          <p className="text-[11px] font-medium text-gray-400 mt-0.5">
                            {t(opt.descKey as any)}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {policy.overExecutionMode === "AUTHORIZE" && (
                  <div className="flex items-start gap-3 p-4 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 rounded-2xl mt-4">
                    <AlertTriangle
                      className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0"
                      strokeWidth={2}
                    />
                    <p className="text-xs font-medium text-amber-800 dark:text-amber-300 leading-relaxed">
                      {t("overexecution_control.authorize_alert")}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tarjeta: Reasignaciones y Aprobaciones */}
          <div className="border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] rounded-3xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 sm:p-8 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505]">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {t("reallocations_and_approvals.title")}
              </h2>
            </div>

            <div className="p-6 sm:p-8 space-y-6 flex-1">
              {/* Niveles de aprobación */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  {t("reallocations_and_approvals.approval_levels_label")}
                </Label>
                <Input
                  type="number"
                  min={1}
                  max={5}
                  value={policy.approvalLevels || ""}
                  onChange={(e) =>
                    setPolicy((p) => ({
                      ...p,
                      approvalLevels:
                        e.target.value === ""
                          ? 1
                          : Math.max(1, parseInt(e.target.value, 10) || 1),
                    }))
                  }
                  className="rounded-xl h-11 text-xs font-mono font-bold border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-[#0a0a0a]"
                />
                <p className="text-[11px] font-medium text-gray-400">
                  {t("reallocations_and_approvals.approval_levels_help")}
                </p>
              </div>

              {/* Límite de transferencia */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  {t("reallocations_and_approvals.transfer_limit_label")}
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    placeholder={t(
                      "reallocations_and_approvals.transfer_limit_placeholder"
                    )}
                    value={policy.transferLimitPercentage ?? ""}
                    onChange={(e) =>
                      setPolicy((p) => ({
                        ...p,
                        transferLimitPercentage: e.target.value
                          ? parseFloat(e.target.value)
                          : null,
                      }))
                    }
                    className="rounded-xl h-11 pr-8 text-xs font-mono font-bold border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-[#0a0a0a]"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">
                    %
                  </span>
                </div>
                <p className="text-[11px] font-medium text-gray-400">
                  {t("reallocations_and_approvals.transfer_limit_help")}
                </p>
              </div>

              {/* Transferencia interdepartamental */}
              <div className="flex items-center justify-between gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                <div>
                  <p className="text-xs font-bold text-gray-900 dark:text-white">
                    {t("reallocations_and_approvals.allow_cross_dept_title")}
                  </p>
                  <p className="text-[11px] font-medium text-gray-400 mt-0.5">
                    {t("reallocations_and_approvals.allow_cross_dept_desc")}
                  </p>
                </div>
                <Switch
                  checked={policy.allowCrossDepartmentTransfer}
                  onCheckedChange={(v) =>
                    setPolicy((p) => ({
                      ...p,
                      allowCrossDepartmentTransfer: v,
                    }))
                  }
                />
              </div>

              {/* Control mensual */}
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-gray-900 dark:text-white">
                    {t("reallocations_and_approvals.monthly_control_title")}
                  </p>
                  <p className="text-[11px] font-medium text-gray-400 mt-0.5">
                    {t("reallocations_and_approvals.monthly_control_desc")}
                  </p>
                </div>
                <Switch
                  checked={policy.monthlyControlEnabled}
                  onCheckedChange={(v) =>
                    setPolicy((p) => ({ ...p, monthlyControlEnabled: v }))
                  }
                />
              </div>

            </div>
          </div>

        </div>

        {/* ── BOTÓN GUARDAR POLÍTICA ────────────────────────────────────── */}
        <div className="flex justify-end pt-2">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white transition-all h-11 px-8 rounded-xl text-xs font-bold shadow-sm flex items-center gap-2 border-0"
          >
            {isSaving ? (
              <>
                <QhSpinner size="sm" />
                <span>{t("btn_saving")}</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" strokeWidth={2} />
                <span>{t("btn_save")}</span>
              </>
            )}
          </Button>
        </div>

        {/* ── SECCIÓN CADENA DE APROBACIÓN ───────────────────────────────── */}
        <div className="border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] rounded-3xl shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {t("approval_chain_card.title")}
              </h2>
              <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">
                {t("approval_chain_card.subtitle")}
              </p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 flex items-center justify-center text-gray-400 shadow-sm shrink-0">
              <Link2 className="w-5 h-5" strokeWidth={2} />
            </div>
          </div>

          <div className="p-6 sm:p-8">
            {policy.overExecutionMode !== "AUTHORIZE" &&
            policy.approvalLevels <= 0 ? (
              <div className="text-center p-10 bg-gray-50/50 dark:bg-[#050505] rounded-3xl border border-dashed border-gray-200 dark:border-gray-800">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                  {t("approval_chain_card.inactive_notice")}
                </p>
              </div>
            ) : (
              <ApprovalChainConfig providerId={PROVIDER_ID} />
            )}
          </div>
        </div>

      </div>
    </div>
  );
}