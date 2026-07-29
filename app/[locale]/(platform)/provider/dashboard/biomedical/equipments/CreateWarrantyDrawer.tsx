"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/prefer-module-scope-pure-function */

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { X, ShieldAlert, Calendar } from "lucide-react";
import { toast } from "react-toastify";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { biomedicalService } from "@/services/biomedical.service";
import { WarrantyRequest } from "@/types/biomedical";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { DatePicker } from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";

interface CreateWarrantyDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  equipmentId: string;
}

export function CreateWarrantyDrawer({
  isOpen,
  onClose,
  onSuccess,
  equipmentId,
}: CreateWarrantyDrawerProps) {
  const t = useTranslations("CreateWarrantyDrawer");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<WarrantyRequest>({
    providerName: "",
    startDate: "",
    expirationDate: "",
    coverageDetails: "",
    contactInfo: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.providerName ||
      !formData.startDate ||
      !formData.expirationDate
    ) {
      toast.error(t("toast_required"));
      return;
    }

    setIsSubmitting(true);
    try {
      await biomedicalService.registerWarranty(equipmentId, formData);
      toast.success(t("toast_success"));
      onSuccess();
      onClose();
      setFormData({
        providerName: "",
        startDate: "",
        expirationDate: "",
        coverageDetails: "",
        contactInfo: "",
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
              <ShieldAlert className="w-6 h-6" strokeWidth={2} />
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
          <form id="warrantyForm" onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-6">
              
              {/* Proveedor */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  {t("label_provider")}
                </label>
                <input
                  className="w-full h-11 px-4 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-gray-400 placeholder:font-medium"
                  value={formData.providerName}
                  onChange={(e) =>
                    setFormData({ ...formData, providerName: e.target.value })
                  }
                  placeholder={t("placeholder_provider")}
                  required
                />
              </div>

              {/* Grid de Fechas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                    <span>{t("label_start_date")}</span>
                  </label>
                  <DatePicker
                    value={
                      formData.startDate
                        ? new Date(formData.startDate)
                        : undefined
                    }
                    onChange={(date) =>
                      setFormData({
                        ...formData,
                        startDate: date ? format(date, "yyyy-MM-dd") : "",
                      })
                    }
                    className="w-full h-11 px-4 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-900 dark:text-white shadow-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                    <span>{t("label_expiration_date")}</span>
                  </label>
                  <DatePicker
                    value={
                      formData.expirationDate
                        ? new Date(formData.expirationDate)
                        : undefined
                    }
                    onChange={(date) =>
                      setFormData({
                        ...formData,
                        expirationDate: date ? format(date, "yyyy-MM-dd") : "",
                      })
                    }
                    className="w-full h-11 px-4 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-900 dark:text-white shadow-sm"
                  />
                </div>
              </div>

              {/* Detalles de Cobertura */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  {t("label_coverage_details")}
                </label>
                <textarea
                  className="w-full p-4 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-gray-400 min-h-[120px] resize-none"
                  value={formData.coverageDetails}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      coverageDetails: e.target.value,
                    })
                  }
                  placeholder={t("placeholder_coverage_details")}
                />
              </div>

              {/* Información de Contacto */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  {t("label_contact_info")}
                </label>
                <input
                  className="w-full h-11 px-4 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-gray-400 placeholder:font-medium"
                  value={formData.contactInfo}
                  onChange={(e) =>
                    setFormData({ ...formData, contactInfo: e.target.value })
                  }
                  placeholder={t("placeholder_contact_info")}
                />
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
            form="warrantyForm"
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