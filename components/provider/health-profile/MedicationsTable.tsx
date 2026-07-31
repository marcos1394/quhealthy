"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Trash2, Pill, Plus } from "lucide-react";

import { PatientMedication } from "@/types/healthProfile";
import { Button } from "@/components/ui/button";
import { QhSpinner } from "@/components/ui/QhSpinner";

interface MedicationsTableProps {
  medications: PatientMedication[];
  isReadOnly: boolean;
  onAdd: (medication: any) => Promise<boolean>;
  onDelete: (id: number) => Promise<boolean>;
}

export function MedicationsTable({
  medications,
  isReadOnly,
  onAdd,
  onDelete,
}: MedicationsTableProps) {
  const t = useTranslations("HealthProfile.Medications");

  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    dosage: "",
    frequency: "",
    route: "",
    reason: "",
  });

  const handleSubmit = async () => {
    if (!formData.name) return;
    setIsSubmitting(true);
    const success = await onAdd(formData);
    if (success) {
      setIsAdding(false);
      setFormData({
        name: "",
        dosage: "",
        frequency: "",
        route: "",
        reason: "",
      });
    }
    setIsSubmitting(false);
  };

  return (
    <div className="flex flex-col bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl shadow-2xs overflow-hidden mb-6 mt-6 font-sans transition-colors select-none">
      {/* ── CABECERA DE LA TABLA ────────────────────────────────────────── */}
      <div className="p-5 bg-gray-50/60 dark:bg-[#050505] border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-2xs">
            <Pill className="w-5 h-5" strokeWidth={2} />
          </div>
          <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white tracking-tight">
            {t("title")}
          </h4>
        </div>

        {!isReadOnly && (
          <Button
            type="button"
            onClick={() => setIsAdding(true)}
            className="h-9 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 border-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" strokeWidth={2} />
            <span>{t("add_btn")}</span>
          </Button>
        )}
      </div>

      {/* ── FORMULARIO DE ALTA RÁPIDA DE MEDICAMENTO ──────────────────── */}
      {isAdding && (
        <div className="p-5 md:p-6 bg-gray-50/40 dark:bg-[#050505] border-b border-gray-100 dark:border-gray-800 flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            {/* Medicamento */}
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
                {t("col_medication")}
              </label>
              <input
                type="text"
                className="w-full h-11 px-3.5 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-2xs placeholder:text-gray-400 placeholder:font-normal"
                placeholder={t("placeholder_name")}
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            {/* Dosis */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
                {t("col_dosage_freq")}
              </label>
              <input
                type="text"
                className="w-full h-11 px-3.5 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-2xs placeholder:text-gray-400 placeholder:font-normal"
                placeholder={t("placeholder_dosage")}
                value={formData.dosage}
                onChange={(e) =>
                  setFormData({ ...formData, dosage: e.target.value })
                }
              />
            </div>

            {/* Frecuencia */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
                {t("col_dosage_freq")}
              </label>
              <input
                type="text"
                className="w-full h-11 px-3.5 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-2xs placeholder:text-gray-400 placeholder:font-normal"
                placeholder={t("placeholder_frequency")}
                value={formData.frequency}
                onChange={(e) =>
                  setFormData({ ...formData, frequency: e.target.value })
                }
              />
            </div>

            {/* Vía */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
                {t("col_route")}
              </label>
              <input
                type="text"
                className="w-full h-11 px-3.5 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-2xs placeholder:text-gray-400 placeholder:font-normal"
                placeholder={t("placeholder_route")}
                value={formData.route}
                onChange={(e) =>
                  setFormData({ ...formData, route: e.target.value })
                }
              />
            </div>

            {/* Motivo */}
            <div className="flex flex-col gap-1.5 md:col-span-5">
              <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
                {t("col_reason")}
              </label>
              <input
                type="text"
                className="w-full h-11 px-3.5 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-2xs placeholder:text-gray-400 placeholder:font-normal"
                placeholder={t("placeholder_reason")}
                value={formData.reason}
                onChange={(e) =>
                  setFormData({ ...formData, reason: e.target.value })
                }
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="h-10 px-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#111] transition-all shadow-2xs cursor-pointer"
            >
              {t("cancel")}
            </button>
            <Button
              type="button"
              disabled={isSubmitting || !formData.name}
              onClick={handleSubmit}
              className="h-10 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs border-0 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <QhSpinner size="sm" className="text-white mr-1" />
                  <span>{t("saving")}</span>
                </>
              ) : (
                <span>{t("save")}</span>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* ── MATRIZ DE MEDICAMENTOS ─────────────────────────────────────── */}
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-gray-50/60 dark:bg-[#050505] border-b border-gray-100 dark:border-gray-800">
              <th className="px-5 py-3.5 font-bold text-gray-400 uppercase tracking-wider">
                {t("col_medication")}
              </th>
              <th className="px-5 py-3.5 font-bold text-gray-400 uppercase tracking-wider">
                {t("col_dosage_freq")}
              </th>
              <th className="px-5 py-3.5 font-bold text-gray-400 uppercase tracking-wider">
                {t("col_route")}
              </th>
              <th className="px-5 py-3.5 font-bold text-gray-400 uppercase tracking-wider">
                {t("col_reason")}
              </th>
              {!isReadOnly && (
                <th className="px-5 py-3.5 font-bold text-gray-400 uppercase tracking-wider text-right">
                  {t("col_action")}
                </th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {medications.length === 0 && !isAdding ? (
              <tr>
                <td
                  colSpan={5}
                  className="p-8 text-center text-gray-400 text-xs font-medium italic"
                >
                  {t("empty_text")}
                </td>
              </tr>
            ) : (
              medications.map((m) => (
                <tr
                  key={m.id}
                  className="bg-white dark:bg-[#0a0a0a] hover:bg-gray-50/50 dark:hover:bg-[#050505] transition-colors"
                >
                  <td className="px-5 py-4 font-bold text-gray-900 dark:text-white">
                    {m.name}
                  </td>

                  <td className="px-5 py-4 text-gray-700 dark:text-gray-300 font-mono font-semibold">
                    {m.dosage} {m.frequency ? `- ${m.frequency}` : ""}
                  </td>

                  <td className="px-5 py-4 text-gray-600 dark:text-gray-300 font-semibold">
                    {m.route || "—"}
                  </td>

                  <td className="px-5 py-4 text-gray-600 dark:text-gray-300 font-medium">
                    {m.reason || "—"}
                  </td>

                  {!isReadOnly && (
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => onDelete(m.id)}
                        className="w-8 h-8 rounded-xl inline-flex items-center justify-center text-gray-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 dark:hover:text-rose-400 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" strokeWidth={2} />
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}