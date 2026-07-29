"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Save,
  CheckCircle2,
  AlertCircle,
  FileText,
  ShieldCheck,
  X,
} from "lucide-react";
import { toast } from "react-toastify";

import {
  ClinicalTemplateResponse,
  ClinicalTemplateField,
} from "@/services/clinicalTemplates.service";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { cn } from "@/lib/utils";

interface DynamicFormRendererProps {
  template: ClinicalTemplateResponse;
  initialData?: any;
  onSave: (data: any, isFinal: boolean) => void;
  isSaving: boolean;
  isFinalized?: boolean;
}

export function DynamicFormRenderer({
  template,
  initialData,
  onSave,
  isSaving,
  isFinalized,
}: DynamicFormRendererProps) {
  const t = useTranslations("DynamicFormRenderer");
  const [formData, setFormData] = useState<any>(initialData || {});
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleChange = (fieldId: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [fieldId]: value }));
  };

  const handleSaveDraft = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData, false);
  };

  let schemaFields: ClinicalTemplateField[] = [];
  try {
    if (typeof template.schema === "string") {
      schemaFields = JSON.parse(template.schema).fields || [];
    } else if (template.schema && template.schema.fields) {
      schemaFields = template.schema.fields;
    }
  } catch (e) {
    console.error("Error parsing schema", e);
  }

  const handleValidateBeforeFinalize = (e: React.FormEvent) => {
    e.preventDefault();

    // Validación de campos requeridos
    const missing = schemaFields.filter((f) => f.required && !formData[f.id]);
    if (missing.length > 0) {
      const missingLabels = missing.map((f) => f.label).join(", ");
      toast.error(t("missing_fields_error", { fields: missingLabels }));
      return;
    }

    setShowConfirmModal(true);
  };

  const handleConfirmFinalize = () => {
    setShowConfirmModal(false);
    onSave(formData, true);
  };

  return (
    <div className="space-y-6 font-sans transition-colors">
      {/* ── HEADER DE LA FICHA ─────────────────────────────────────────── */}
      <div className="bg-gray-50/60 dark:bg-[#050505] p-6 sm:p-8 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <FileText className="w-4 h-4" strokeWidth={2} />
            </div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white tracking-tight">
              {template.name}
            </h2>
          </div>

          {template.description && (
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 pl-10">
              {template.description}
            </p>
          )}
        </div>

        {isFinalized && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 text-xs font-bold shadow-xs self-start sm:self-auto">
            <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
            <span>{t("status_finalized")}</span>
          </div>
        )}
      </div>

      {/* ── ALERTA DIAGNÓSTICA (SI NO HAY CAMPOS) ───────────────────────── */}
      {schemaFields.length === 0 && (
        <div className="mx-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 flex items-center gap-3 text-amber-700 dark:text-amber-400 text-xs font-medium">
          <AlertCircle className="w-5 h-5 shrink-0" strokeWidth={2} />
          <span>{t("schema_error")}</span>
        </div>
      )}

      {/* ── FORMULARIO DINÁMICO ────────────────────────────────────────── */}
      <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 bg-white dark:bg-[#0a0a0a]">
        {schemaFields.map((field) => (
          <div
            key={field.id}
            className={cn(
              "space-y-2 p-4 rounded-2xl bg-gray-50/50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 shadow-xs",
              field.type === "textarea" ? "md:col-span-2" : ""
            )}
          >
            <label className="text-xs font-bold text-gray-800 dark:text-gray-200 block">
              {field.label}{" "}
              {field.required && <span className="text-red-500">*</span>}
            </label>

            {/* Input Text */}
            {field.type === "text" && (
              <Input
                className="rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] h-11 text-xs font-medium text-gray-900 dark:text-white focus-visible:ring-emerald-500/20 shadow-xs"
                value={formData[field.id] || ""}
                onChange={(e) => handleChange(field.id, e.target.value)}
                disabled={isFinalized}
              />
            )}

            {/* Textarea */}
            {field.type === "textarea" && (
              <textarea
                className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-3.5 text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all min-h-[100px] resize-none shadow-xs disabled:opacity-60"
                value={formData[field.id] || ""}
                onChange={(e) => handleChange(field.id, e.target.value)}
                disabled={isFinalized}
              />
            )}

            {/* Number */}
            {field.type === "number" && (
              <Input
                type="number"
                className="rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] h-11 text-xs font-mono font-medium text-gray-900 dark:text-white focus-visible:ring-emerald-500/20 shadow-xs"
                value={formData[field.id] || ""}
                onChange={(e) => handleChange(field.id, e.target.value)}
                disabled={isFinalized}
              />
            )}

            {/* Date Picker */}
            {field.type === "date" && (
              <DatePicker
                disabled={isFinalized ? () => true : undefined}
                value={
                  formData[field.id] ? new Date(formData[field.id]) : undefined
                }
                onChange={(date) => {
                  if (date) {
                    const yyyy = date.getFullYear();
                    const mm = String(date.getMonth() + 1).padStart(2, "0");
                    const dd = String(date.getDate()).padStart(2, "0");
                    handleChange(field.id, `${yyyy}-${mm}-${dd}`);
                  } else {
                    handleChange(field.id, "");
                  }
                }}
              />
            )}

            {/* Select Dropdown */}
            {field.type === "select" && (
              <Select
                disabled={isFinalized}
                value={formData[field.id] || ""}
                onValueChange={(val) => handleChange(field.id, val)}
              >
                <SelectTrigger className="rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] h-11 text-xs font-medium focus:ring-emerald-500/20 shadow-xs">
                  <SelectValue placeholder={t("select_placeholder")} />
                </SelectTrigger>
                <SelectContent className="rounded-2xl font-sans">
                  {field.options?.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Boolean / Checkbox */}
            {(field.type === "boolean" || field.type === "checkbox") && (
              <div className="flex items-center gap-3 pt-1">
                <Checkbox
                  id={field.id}
                  checked={formData[field.id] || false}
                  onCheckedChange={(checked) =>
                    handleChange(field.id, checked === true)
                  }
                  disabled={isFinalized || field.readonly}
                  className="rounded-md border-gray-300 dark:border-gray-700 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600 w-4 h-4 shadow-xs"
                />
                <label
                  htmlFor={field.id}
                  className="text-xs font-medium text-gray-700 dark:text-gray-300 cursor-pointer select-none"
                >
                  {field.label}
                </label>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── FOOTER DE ACCIONES ──────────────────────────────────────────── */}
      {!isFinalized && (
        <div className="flex flex-col sm:flex-row gap-3 p-6 sm:p-8 border-t border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-[#050505]">
          <Button
            type="button"
            onClick={handleSaveDraft}
            disabled={isSaving}
            variant="outline"
            className="flex-1 rounded-2xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-900 text-xs font-bold h-12 shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <QhSpinner size="sm" className="text-emerald-600 dark:text-emerald-400" />
            ) : (
              <Save className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
            )}
            <span>{isSaving ? t("btn_saving") : t("btn_save_draft")}</span>
          </Button>

          <Button
            type="button"
            onClick={handleValidateBeforeFinalize}
            disabled={isSaving}
            className="flex-1 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold h-12 shadow-sm transition-all border-0 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <QhSpinner size="sm" className="text-white" />
            ) : (
              <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
            )}
            <span>{isSaving ? t("btn_saving") : t("btn_finalize")}</span>
          </Button>
        </div>
      )}

      {/* ── MODAL CONFIRMACIÓN FINALIZAR ──────────────────────────────── */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans">
          <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-xs">
                <ShieldCheck className="w-6 h-6" strokeWidth={2} />
              </div>

              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center bg-gray-50 dark:bg-[#111] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 cursor-pointer"
              >
                <X className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-gray-900 dark:text-white tracking-tight">
                {t("finalize_confirm_title")}
              </h3>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                {t("finalize_confirm_desc")}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-900 text-xs font-bold h-11 shadow-xs transition-all cursor-pointer"
              >
                {t("btn_cancel")}
              </Button>

              <Button
                type="button"
                onClick={handleConfirmFinalize}
                className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold h-11 shadow-sm transition-all border-0 cursor-pointer"
              >
                {t("btn_confirm_finalize")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}