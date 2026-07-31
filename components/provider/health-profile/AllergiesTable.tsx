"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Trash2, AlertOctagon, Plus } from "lucide-react";

import { PatientAllergy } from "@/types/healthProfile";
import { Button } from "@/components/ui/button";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { cn } from "@/lib/utils";

interface AllergiesTableProps {
  allergies: PatientAllergy[];
  isReadOnly: boolean;
  onAdd: (allergy: any) => Promise<boolean>;
  onDelete: (id: number) => Promise<boolean>;
}

export function AllergiesTable({
  allergies,
  isReadOnly,
  onAdd,
  onDelete,
}: AllergiesTableProps) {
  const t = useTranslations("HealthProfile.Allergies");

  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    substance: "",
    type: t("type_food"),
    severity: "Leve",
    reaction: "",
    status: "ACTIVE",
  });

  const handleSubmit = async () => {
    if (!formData.substance) return;
    setIsSubmitting(true);
    const success = await onAdd(formData);
    if (success) {
      setIsAdding(false);
      setFormData({
        substance: "",
        type: t("type_food"),
        severity: "Leve",
        reaction: "",
        status: "ACTIVE",
      });
    }
    setIsSubmitting(false);
  };

  const getSeverityBadgeClass = (severity?: string) => {
    const s = (severity || "").toLowerCase();
    if (s.includes("sever") || s.includes("alt")) {
      return "bg-rose-50 text-rose-800 dark:bg-rose-950/30 dark:text-rose-400 border-rose-200 dark:border-rose-900/40";
    }
    if (s.includes("moderat") || s.includes("medi")) {
      return "bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400 border-amber-200 dark:border-amber-900/40";
    }
    return "bg-sky-50 text-sky-800 dark:bg-sky-950/30 dark:text-sky-400 border-sky-200 dark:border-sky-900/40";
  };

  return (
    <div className="flex flex-col bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl shadow-2xs overflow-hidden mb-6 mt-6 font-sans transition-colors select-none">
      {/* ── CABECERA DE LA TABLA ────────────────────────────────────────── */}
      <div className="p-5 bg-gray-50/60 dark:bg-[#050505] border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0 shadow-2xs">
            <AlertOctagon className="w-5 h-5" strokeWidth={2} />
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

      {/* ── FORMULARIO DE ALTA RÁPIDA DE ALERGIA ──────────────────────── */}
      {isAdding && (
        <div className="p-5 md:p-6 bg-gray-50/40 dark:bg-[#050505] border-b border-gray-100 dark:border-gray-800 flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* Sustancia */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
                {t("col_substance")}
              </label>
              <input
                type="text"
                className="w-full h-11 px-3.5 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-2xs placeholder:text-gray-400 placeholder:font-normal"
                placeholder={t("placeholder_substance")}
                value={formData.substance}
                onChange={(e) =>
                  setFormData({ ...formData, substance: e.target.value })
                }
              />
            </div>

            {/* Tipo */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
                {t("col_type")}
              </label>
              <input
                type="text"
                className="w-full h-11 px-3.5 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-2xs placeholder:text-gray-400 placeholder:font-normal"
                placeholder={t("placeholder_type")}
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
              />
            </div>

            {/* Gravedad */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
                {t("col_severity")}
              </label>
              <select
                className="w-full h-11 px-3 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-2xs cursor-pointer"
                value={formData.severity}
                onChange={(e) =>
                  setFormData({ ...formData, severity: e.target.value })
                }
              >
                <option value="Leve" className="bg-white dark:bg-[#0a0a0a]">
                  {t("severity_mild")}
                </option>
                <option value="Moderada" className="bg-white dark:bg-[#0a0a0a]">
                  {t("severity_moderate")}
                </option>
                <option value="Severa" className="bg-white dark:bg-[#0a0a0a]">
                  {t("severity_severe")}
                </option>
              </select>
            </div>

            {/* Reacción */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
                {t("col_reaction")}
              </label>
              <input
                type="text"
                className="w-full h-11 px-3.5 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-2xs placeholder:text-gray-400 placeholder:font-normal"
                placeholder={t("placeholder_reaction")}
                value={formData.reaction}
                onChange={(e) =>
                  setFormData({ ...formData, reaction: e.target.value })
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
              disabled={isSubmitting || !formData.substance}
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

      {/* ── MATRIZ DE ALERGIAS ─────────────────────────────────────────── */}
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-gray-50/60 dark:bg-[#050505] border-b border-gray-100 dark:border-gray-800">
              <th className="px-5 py-3.5 font-bold text-gray-400 uppercase tracking-wider">
                {t("col_substance")}
              </th>
              <th className="px-5 py-3.5 font-bold text-gray-400 uppercase tracking-wider">
                {t("col_type")}
              </th>
              <th className="px-5 py-3.5 font-bold text-gray-400 uppercase tracking-wider">
                {t("col_severity")}
              </th>
              <th className="px-5 py-3.5 font-bold text-gray-400 uppercase tracking-wider">
                {t("col_reaction")}
              </th>
              {!isReadOnly && (
                <th className="px-5 py-3.5 font-bold text-gray-400 uppercase tracking-wider text-right">
                  {t("col_action")}
                </th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {allergies.length === 0 && !isAdding ? (
              <tr>
                <td
                  colSpan={5}
                  className="p-8 text-center text-gray-400 text-xs font-medium italic"
                >
                  {t("empty_text")}
                </td>
              </tr>
            ) : (
              allergies.map((a) => (
                <tr
                  key={a.id}
                  className="bg-white dark:bg-[#0a0a0a] hover:bg-gray-50/50 dark:hover:bg-[#050505] transition-colors"
                >
                  <td className="px-5 py-4 font-bold text-gray-900 dark:text-white">
                    {a.substance}
                  </td>

                  <td className="px-5 py-4 text-gray-600 dark:text-gray-300 font-semibold">
                    {a.type || "—"}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={cn(
                        "px-2.5 py-0.5 border text-[11px] font-bold rounded-full whitespace-nowrap shadow-2xs",
                        getSeverityBadgeClass(a.severity || "")
                      )}
                    >
                      {a.severity || "—"}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-gray-600 dark:text-gray-300 font-medium">
                    {a.reaction || "—"}
                  </td>

                  {!isReadOnly && (
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => onDelete(a.id)}
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