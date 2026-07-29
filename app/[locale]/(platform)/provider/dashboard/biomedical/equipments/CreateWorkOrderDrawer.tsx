"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/prefer-module-scope-pure-function */

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { X, Wrench, Calendar, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { biomedicalService } from "@/services/biomedical.service";
import {
  WorkOrderRequest,
  WorkOrderType,
  WorkOrderPriority,
} from "@/types/biomedical";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CreateWorkOrderDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  equipmentId: string;
}

export function CreateWorkOrderDrawer({
  isOpen,
  onClose,
  onSuccess,
  equipmentId,
}: CreateWorkOrderDrawerProps) {
  const t = useTranslations("CreateWorkOrderDrawer");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<WorkOrderRequest>({
    type: "CORRECTIVE",
    priority: "MEDIUM",
    diagnostic: "",
    scheduledDate: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validaciones de tipo de orden
      if (formData.type === "CORRECTIVE" && !formData.diagnostic) {
        toast.error(t("toast_diagnostic_required"));
        setIsSubmitting(false);
        return;
      }
      if (formData.type === "PREVENTIVE" && !formData.scheduledDate) {
        toast.error(t("toast_date_required"));
        setIsSubmitting(false);
        return;
      }

      const payload: any = {
        type: formData.type,
        priority: formData.priority,
      };
      if (formData.diagnostic) payload.diagnostic = formData.diagnostic;
      if (formData.scheduledDate)
        payload.scheduledDate = new Date(formData.scheduledDate).toISOString();

      await biomedicalService.createWorkOrder(equipmentId, payload);
      toast.success(t("toast_success"));
      onSuccess();
      onClose();

      // Resetear formulario
      setFormData({
        type: "CORRECTIVE",
        priority: "MEDIUM",
        diagnostic: "",
        scheduledDate: "",
      });
    } catch (error) {
      console.error(error);
      toast.error(t("toast_error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-gray-900/40 dark:bg-black/80 backdrop-blur-sm z-40 transition-opacity duration-500",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full w-full md:w-[600px] bg-white dark:bg-[#0a0a0a] border-l border-gray-100 dark:border-gray-800 z-50 transform transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-y-auto flex flex-col shadow-2xl md:rounded-l-3xl font-sans text-gray-900 dark:text-white",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header Sticky Glassmorphism */}
        <div className="sticky top-0 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 p-6 sm:p-8 flex justify-between items-center z-10 md:rounded-tl-3xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-sm">
              <Wrench className="w-6 h-6" strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                {t("title")}
              </h2>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">
                {t("subtitle")}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={onClose}
            className="w-10 h-10 p-0 rounded-full border border-gray-200 dark:border-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-[#111]"
          >
            <X className="w-5 h-5" strokeWidth={2} />
          </Button>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 flex-1">
          <form id="workOrderForm" onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100 dark:border-gray-800 pb-2">
                {t("section_main_info")}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Tipo de Orden */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    {t("label_order_type")}
                  </label>
                  <Select
                    value={formData.type}
                    onValueChange={(val) =>
                      setFormData({
                        ...formData,
                        type: val as WorkOrderType,
                      })
                    }
                  >
                    <SelectTrigger className="w-full h-11 px-4 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-emerald-500/20 transition-all">
                      <SelectValue
                        placeholder={
                          <span className="text-gray-400 font-medium">
                            {t("placeholder_order_type")}
                          </span>
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-lg">
                      <SelectItem value="CORRECTIVE" className="text-xs font-bold rounded-xl">
                        {t("type_corrective")}
                      </SelectItem>
                      <SelectItem value="PREVENTIVE" className="text-xs font-bold rounded-xl">
                        {t("type_preventive")}
                      </SelectItem>
                      <SelectItem value="CALIBRATION" className="text-xs font-bold rounded-xl">
                        {t("type_calibration")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Prioridad */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    {t("label_priority")}
                  </label>
                  <Select
                    value={formData.priority}
                    onValueChange={(val) =>
                      setFormData({
                        ...formData,
                        priority: val as WorkOrderPriority,
                      })
                    }
                  >
                    <SelectTrigger className="w-full h-11 px-4 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-emerald-500/20 transition-all">
                      <SelectValue
                        placeholder={
                          <span className="text-gray-400 font-medium">
                            {t("placeholder_priority")}
                          </span>
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-lg">
                      <SelectItem value="LOW" className="text-xs font-bold rounded-xl">
                        {t("priority_low")}
                      </SelectItem>
                      <SelectItem value="MEDIUM" className="text-xs font-bold rounded-xl">
                        {t("priority_medium")}
                      </SelectItem>
                      <SelectItem value="HIGH" className="text-xs font-bold rounded-xl">
                        {t("priority_high")}
                      </SelectItem>
                      <SelectItem value="CRITICAL" className="text-xs font-bold rounded-xl">
                        {t("priority_critical")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Campo Diagnóstico (Correctiva) */}
              {formData.type === "CORRECTIVE" && (
                <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-500" strokeWidth={2} />
                    <span>{t("label_diagnostic")}</span>
                  </label>
                  <textarea
                    className="w-full p-4 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-gray-400 min-h-[120px] resize-none"
                    value={formData.diagnostic}
                    onChange={(e) =>
                      setFormData({ ...formData, diagnostic: e.target.value })
                    }
                    placeholder={t("placeholder_diagnostic")}
                    required={formData.type === "CORRECTIVE"}
                  />
                </div>
              )}

              {/* Campo Fecha Programada (Preventiva) */}
              {formData.type === "PREVENTIVE" && (
                <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                    <span>{t("label_scheduled_date")}</span>
                  </label>
                  <DatePicker
                    value={
                      formData.scheduledDate
                        ? new Date(formData.scheduledDate)
                        : undefined
                    }
                    onChange={(date) =>
                      setFormData({
                        ...formData,
                        scheduledDate: date ? format(date, "yyyy-MM-dd") : "",
                      })
                    }
                    className="w-full h-11 px-4 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-900 dark:text-white shadow-sm"
                  />
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl border-t border-gray-100 dark:border-gray-800 p-6 sm:p-8 flex gap-3 md:rounded-bl-3xl">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 rounded-xl border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 text-xs font-bold transition-all h-11 shadow-sm"
          >
            {t("btn_cancel")}
          </Button>
          <Button
            type="submit"
            form="workOrderForm"
            disabled={isSubmitting}
            className="flex-1 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 h-11 text-xs font-bold transition-all shadow-sm border-0 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <QhSpinner size="sm" />
                <span>{t("btn_submitting")}</span>
              </>
            ) : (
              <span>{t("btn_submit")}</span>
            )}
          </Button>
        </div>
      </div>
    </>
  );
}