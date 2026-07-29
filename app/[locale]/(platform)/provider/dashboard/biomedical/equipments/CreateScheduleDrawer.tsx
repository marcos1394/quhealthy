"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/prefer-module-scope-pure-function */

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { X, Calendar, Clock } from "lucide-react";
import { toast } from "react-toastify";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { biomedicalService } from "@/services/biomedical.service";
import {
  MaintenanceScheduleRequest,
  MaintenancePeriodicity,
} from "@/types/biomedical";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { DatePicker } from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CreateScheduleDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  equipmentId: string;
}

export function CreateScheduleDrawer({
  isOpen,
  onClose,
  onSuccess,
  equipmentId,
}: CreateScheduleDrawerProps) {
  const t = useTranslations("CreateScheduleDrawer");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<MaintenanceScheduleRequest>({
    periodicity: "ANNUALLY",
    nextMaintenanceDate: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nextMaintenanceDate) {
      toast.error(t("toast_required_date"));
      return;
    }

    if (
      formData.periodicity === "CUSTOM" &&
      (!formData.customDays || formData.customDays <= 0)
    ) {
      toast.error(t("toast_invalid_days"));
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: any = {
        periodicity: formData.periodicity,
        nextMaintenanceDate: formData.nextMaintenanceDate,
      };
      if (formData.periodicity === "CUSTOM") {
        payload.customDays = formData.customDays;
      }

      await biomedicalService.createSchedule(equipmentId, payload);
      toast.success(t("toast_success"));
      onSuccess();
      onClose();
      setFormData({ periodicity: "ANNUALLY", nextMaintenanceDate: "" });
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
              <Clock className="w-6 h-6" strokeWidth={2} />
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

        {/* Body Content */}
        <div className="p-6 sm:p-8 flex-1">
          <form id="scheduleForm" onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-6">
              
              {/* Select Periodicidad */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  {t("label_periodicity")}
                </label>
                <Select
                  value={formData.periodicity}
                  onValueChange={(val) =>
                    setFormData({
                      ...formData,
                      periodicity: val as MaintenancePeriodicity,
                    })
                  }
                >
                  <SelectTrigger className="w-full h-11 px-4 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-emerald-500/20 transition-all">
                    <SelectValue
                      placeholder={
                        <span className="text-gray-400 font-medium">
                          {t("placeholder_periodicity")}
                        </span>
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-lg">
                    <SelectItem value="WEEKLY" className="text-xs font-bold rounded-xl">
                      {t("periodicity_weekly")}
                    </SelectItem>
                    <SelectItem value="MONTHLY" className="text-xs font-bold rounded-xl">
                      {t("periodicity_monthly")}
                    </SelectItem>
                    <SelectItem value="QUARTERLY" className="text-xs font-bold rounded-xl">
                      {t("periodicity_quarterly")}
                    </SelectItem>
                    <SelectItem value="SEMI_ANNUALLY" className="text-xs font-bold rounded-xl">
                      {t("periodicity_semi_annually")}
                    </SelectItem>
                    <SelectItem value="ANNUALLY" className="text-xs font-bold rounded-xl">
                      {t("periodicity_annually")}
                    </SelectItem>
                    <SelectItem value="CUSTOM" className="text-xs font-bold rounded-xl">
                      {t("periodicity_custom")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Días Personalizados */}
              {formData.periodicity === "CUSTOM" && (
                <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    {t("label_custom_days")}
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="w-full h-11 px-4 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-gray-400 placeholder:font-medium"
                    value={formData.customDays || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        customDays: parseInt(e.target.value, 10),
                      })
                    }
                    placeholder={t("placeholder_custom_days")}
                    required={formData.periodicity === "CUSTOM"}
                  />
                </div>
              )}

              {/* DatePicker Próximo Mantenimiento */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                  <span>{t("label_next_date")}</span>
                </label>
                <DatePicker
                  value={
                    formData.nextMaintenanceDate
                      ? new Date(formData.nextMaintenanceDate)
                      : undefined
                  }
                  onChange={(date) =>
                    setFormData({
                      ...formData,
                      nextMaintenanceDate: date ? format(date, "yyyy-MM-dd") : "",
                    })
                  }
                  className="w-full h-11 px-4 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-900 dark:text-white shadow-sm"
                />
              </div>

              {/* Mensaje Informativo */}
              <div className="p-5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-3.5 h-3.5" strokeWidth={2} />
                </div>
                <p className="text-xs font-medium text-blue-900 dark:text-blue-300 leading-relaxed">
                  <strong className="font-bold mr-1">{t("notice_title")}</strong>
                  {t("notice_desc")}
                </p>
              </div>

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
            form="scheduleForm"
            disabled={isSubmitting}
            className="flex-1 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 h-11 text-xs font-bold transition-all shadow-sm border-0 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <QhSpinner size="sm" />
                <span>{t("btn_saving")}</span>
              </>
            ) : (
              <span>{t("btn_save")}</span>
            )}
          </Button>
        </div>
      </div>
    </>
  );
}