"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";
import { Plus, Trash2, Save, GripVertical, ShieldCheck } from "lucide-react";

import { QhSpinner } from "@/components/ui/QhSpinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  approvalService,
  ApprovalChainStepDTO,
  ApprovalScope,
} from "@/services/approval.service";

interface ApprovalChainConfigProps {
  providerId: number;
}

export function ApprovalChainConfig({ providerId }: ApprovalChainConfigProps) {
  const t = useTranslations("ApprovalChainConfig");

  const [chain, setChain] = useState<ApprovalChainStepDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadChain = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await approvalService.getApprovalChain(providerId);
      setChain(data || []);
    } catch (error) {
      console.error(error);
      toast.error(t("toasts.load_error"));
    } finally {
      setIsLoading(false);
    }
  }, [providerId, t]);

  useEffect(() => {
    loadChain();
  }, [loadChain]);

  const addStep = () => {
    const newStep: ApprovalChainStepDTO = {
      stepOrder: chain.length + 1,
      scope: ApprovalScope.ALL,
      active: true,
      minimumRole: "FINANCE_APPROVER",
    };
    setChain([...chain, newStep]);
  };

  const updateStep = (
    index: number,
    field: keyof ApprovalChainStepDTO,
    value: any
  ) => {
    const newChain = [...chain];
    newChain[index] = { ...newChain[index], [field]: value };
    setChain(newChain);
  };

  const removeStep = async (index: number) => {
    const step = chain[index];
    if (step.id) {
      try {
        await approvalService.deleteChainStep(providerId, step.id);
      } catch (error) {
        console.error(error);
        toast.error(t("toasts.delete_step_error"));
        return;
      }
    }

    const newChain = chain
      .filter((_, i) => i !== index)
      .map((s, i) => ({ ...s, stepOrder: i + 1 }));
    setChain(newChain);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const savedSteps: ApprovalChainStepDTO[] = [];
      for (const step of chain) {
        const saved = await approvalService.saveChainStep(providerId, step);
        savedSteps.push(saved);
      }
      setChain(savedSteps);
      toast.success(t("toasts.save_success"));
    } catch (error) {
      console.error(error);
      toast.error(t("toasts.save_error"));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[220px]">
        <QhSpinner size="md" />
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans text-gray-900 dark:text-white">
      {chain.length === 0 ? (
        <div className="text-center p-12 border border-dashed border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] rounded-3xl flex flex-col items-center justify-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-sm">
            <ShieldCheck className="w-6 h-6" strokeWidth={2} />
          </div>
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400">
            {t("empty_state")}
          </p>
          <Button
            onClick={addStep}
            className="bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 h-11 px-6 rounded-xl text-xs font-bold shadow-sm transition-all border-0 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" strokeWidth={2} />
            <span>{t("btn_create_first")}</span>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {chain.map((step, index) => (
            <div
              key={index}
              className="flex flex-col md:flex-row gap-4 p-5 sm:p-6 rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-sm hover:shadow-md transition-all duration-300 items-start md:items-center relative group"
            >
              {/* Badge de Orden y Grip */}
              <div className="flex items-center gap-3 shrink-0">
                <GripVertical
                  className="w-5 h-5 text-gray-300 dark:text-gray-700 cursor-move group-hover:text-gray-400 transition-colors"
                  strokeWidth={2}
                />
                <div className="w-9 h-9 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40 flex items-center justify-center text-xs font-mono font-bold shadow-sm">
                  {step.stepOrder}
                </div>
              </div>

              {/* Formulario del Paso */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-1 w-full">
                {/* Rol Mínimo */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    {t("labels.minimum_role")}
                  </Label>
                  <Select
                    value={step.minimumRole || ""}
                    onValueChange={(val) =>
                      updateStep(index, "minimumRole", val)
                    }
                  >
                    <SelectTrigger className="h-11 text-xs font-bold rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-sm">
                      <SelectValue placeholder={t("placeholders.select_role")} />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-lg">
                      <SelectItem value="FINANCE_VIEWER" className="text-xs font-bold">
                        {t("roles.finance_viewer")}
                      </SelectItem>
                      <SelectItem value="FINANCE_OPERATOR" className="text-xs font-bold">
                        {t("roles.finance_operator")}
                      </SelectItem>
                      <SelectItem value="FINANCE_APPROVER" className="text-xs font-bold">
                        {t("roles.finance_approver")}
                      </SelectItem>
                      <SelectItem value="FINANCE_DIRECTOR" className="text-xs font-bold">
                        {t("roles.finance_director")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Alcance */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    {t("labels.scope")}
                  </Label>
                  <Select
                    value={step.scope}
                    onValueChange={(val) =>
                      updateStep(index, "scope", val as ApprovalScope)
                    }
                  >
                    <SelectTrigger className="h-11 text-xs font-bold rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-lg">
                      <SelectItem value={ApprovalScope.ALL} className="text-xs font-bold">
                        {t("scopes.all")}
                      </SelectItem>
                      <SelectItem value={ApprovalScope.EXECUTION} className="text-xs font-bold">
                        {t("scopes.execution")}
                      </SelectItem>
                      <SelectItem value={ApprovalScope.TRANSFER} className="text-xs font-bold">
                        {t("scopes.transfer")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Aprobador Específico */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    {t("labels.specific_approver")}
                  </Label>
                  <Input
                    placeholder={t("placeholders.user_id_optional")}
                    className="h-11 text-xs font-mono font-bold rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-sm"
                    value={step.approverId || ""}
                    onChange={(e) =>
                      updateStep(
                        index,
                        "approverId",
                        e.target.value ? parseInt(e.target.value, 10) : undefined
                      )
                    }
                  />
                </div>

                {/* Monto Mínimo */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    {t("labels.min_amount")}
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">
                      $
                    </span>
                    <Input
                      type="number"
                      placeholder={t("placeholders.no_minimum")}
                      className="h-11 pl-7 text-xs font-mono font-bold rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-sm"
                      value={step.amountThreshold || ""}
                      onChange={(e) =>
                        updateStep(
                          index,
                          "amountThreshold",
                          e.target.value ? parseFloat(e.target.value) : undefined
                        )
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Botón Eliminar */}
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors shrink-0"
                onClick={() => removeStep(index)}
              >
                <Trash2 className="w-4 h-4" strokeWidth={2} />
              </Button>
            </div>
          ))}

          {/* Footer Botones */}
          <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-gray-100 dark:border-gray-800 gap-4">
            <Button
              variant="outline"
              onClick={addStep}
              className="w-full sm:w-auto h-11 px-5 rounded-xl text-xs font-bold border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" strokeWidth={2} />
              <span>{t("btn_add_step")}</span>
            </Button>

            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full sm:w-auto h-11 px-6 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white shadow-sm border-0 transition-all flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <QhSpinner size="sm" />
              ) : (
                <Save className="w-4 h-4" strokeWidth={2} />
              )}
              <span>{t("btn_save_chain")}</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}