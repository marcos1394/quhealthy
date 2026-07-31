"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Trash2, AlertTriangle, CheckCircle, Activity, Plus } from "lucide-react";
import { format } from "date-fns";

import { PatientActiveProblem } from "@/types/healthProfile";
import { DatePicker } from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";
import { QhSpinner } from "@/components/ui/QhSpinner";

interface ActiveProblemsTableProps {
  problems: PatientActiveProblem[];
  isReadOnly: boolean;
  onAdd: (problem: any) => Promise<boolean>;
  onDelete: (id: number) => Promise<boolean>;
}

export function ActiveProblemsTable({
  problems,
  isReadOnly,
  onAdd,
  onDelete,
}: ActiveProblemsTableProps) {
  const t = useTranslations("HealthProfile.ActiveProblems");

  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    diagnosis: "",
    status: "ACTIVE",
    startDate: "",
    professional: "",
    priority: "MEDIA",
  });

  const handleSubmit = async () => {
    if (!formData.diagnosis) return;
    setIsSubmitting(true);
    const success = await onAdd(formData);
    if (success) {
      setIsAdding(false);
      setFormData({
        diagnosis: "",
        status: "ACTIVE",
        startDate: "",
        professional: "",
        priority: "MEDIA",
      });
    }
    setIsSubmitting(false);
  };

  return (
    <div className="flex flex-col bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl shadow-2xs overflow-hidden mb-6 font-sans transition-colors select-none">
      {/* ── CABECERA DE LA TABLA ────────────────────────────────────────── */}
      <div className="p-5 bg-gray-50/60 dark:bg-[#050505] border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-2xs">
            <Activity className="w-5 h-5" strokeWidth={2} />
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

      {/* ── FORMULARIO DE ALTA RÁPIDA DE DIAGNÓSTICO ──────────────────── */}
      {isAdding && (
        <div className="p-5 md:p-6 bg-gray-50/40 dark:bg-[#050505] border-b border-gray-100 dark:border-gray-800 flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-4">
            {/* Diagnóstico */}
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
                {t("col_diagnosis")}
              </label>
              <input
                type="text"
                className="w-full h-11 px-3.5 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-2xs placeholder:text-gray-400 placeholder:font-normal"
                placeholder={t("placeholder_diagnosis")}
                value={formData.diagnosis}
                onChange={(e) =>
                  setFormData({ ...formData, diagnosis: e.target.value })
                }
              />
            </div>

            {/* Estado */}
            <div className="flex flex-col gap-1.5 md:col-span-1">
              <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
                {t("col_status")}
              </label>
              <select
                className="w-full h-11 px-3 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-2xs cursor-pointer"
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
              >
                <option value="ACTIVE" className="bg-white dark:bg-[#0a0a0a]">
                  {t("status_active")}
                </option>
                <option value="RESOLVED" className="bg-white dark:bg-[#0a0a0a]">
                  {t("status_resolved")}
                </option>
              </select>
            </div>

            {/* Fecha Inicio */}
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
                {t("col_start_date")}
              </label>
              <DatePicker
                value={
                  formData.startDate
                    ? new Date(formData.startDate + "T12:00:00")
                    : undefined
                }
                onChange={(date) =>
                  setFormData({
                    ...formData,
                    startDate: date ? format(date, "yyyy-MM-dd") : "",
                  })
                }
                className="h-11 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-xs font-semibold text-gray-900 dark:text-white shadow-2xs"
              />
            </div>

            {/* Prioridad */}
            <div className="flex flex-col gap-1.5 md:col-span-1">
              <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
                {t("col_priority")}
              </label>
              <select
                className="w-full h-11 px-3 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-2xs cursor-pointer"
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value })
                }
              >
                <option value="ALTA" className="bg-white dark:bg-[#0a0a0a]">
                  {t("priority_high")}
                </option>
                <option value="MEDIA" className="bg-white dark:bg-[#0a0a0a]">
                  {t("priority_medium")}
                </option>
                <option value="BAJA" className="bg-white dark:bg-[#0a0a0a]">
                  {t("priority_low")}
                </option>
              </select>
            </div>

            {/* Profesional */}
            <div className="flex flex-col gap-1.5 md:col-span-6">
              <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
                {t("col_professional")}
              </label>
              <input
                type="text"
                className="w-full h-11 px-3.5 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-2xs placeholder:text-gray-400 placeholder:font-normal"
                placeholder={t("placeholder_professional")}
                value={formData.professional}
                onChange={(e) =>
                  setFormData({ ...formData, professional: e.target.value })
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
              disabled={isSubmitting || !formData.diagnosis}
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

      {/* ── MATRIZ DE PROBLEMAS ACTIVOS ────────────────────────────────── */}
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-gray-50/60 dark:bg-[#050505] border-b border-gray-100 dark:border-gray-800">
              <th className="px-5 py-3.5 font-bold text-gray-400 uppercase tracking-wider">
                {t("col_diagnosis")}
              </th>
              <th className="px-5 py-3.5 font-bold text-gray-400 uppercase tracking-wider">
                {t("col_status")}
              </th>
              <th className="px-5 py-3.5 font-bold text-gray-400 uppercase tracking-wider">
                {t("col_start_date")}
              </th>
              <th className="px-5 py-3.5 font-bold text-gray-400 uppercase tracking-wider">
                {t("col_professional")}
              </th>
              <th className="px-5 py-3.5 font-bold text-gray-400 uppercase tracking-wider">
                {t("col_priority")}
              </th>
              {!isReadOnly && (
                <th className="px-5 py-3.5 font-bold text-gray-400 uppercase tracking-wider text-right">
                  {t("col_action")}
                </th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {problems.length === 0 && !isAdding ? (
              <tr>
                <td
                  colSpan={6}
                  className="p-8 text-center text-gray-400 text-xs font-medium italic"
                >
                  {t("empty_text")}
                </td>
              </tr>
            ) : (
              problems.map((p) => (
                <tr
                  key={p.id}
                  className="bg-white dark:bg-[#0a0a0a] hover:bg-gray-50/50 dark:hover:bg-[#050505] transition-colors"
                >
                  <td className="px-5 py-4 font-bold text-gray-900 dark:text-white">
                    {p.diagnosis}
                  </td>

                  <td className="px-5 py-4">
                    {p.status === "ACTIVE" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-bold border rounded-full whitespace-nowrap border-amber-200 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-400 shadow-2xs">
                        <AlertTriangle className="w-3.5 h-3.5" strokeWidth={2} />
                        <span>{t("status_active")}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-bold border rounded-full whitespace-nowrap border-emerald-200 dark:border-emerald-900/40 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 shadow-2xs">
                        <CheckCircle className="w-3.5 h-3.5" strokeWidth={2} />
                        <span>{t("status_resolved")}</span>
                      </span>
                    )}
                  </td>

                  <td className="px-5 py-4 text-gray-600 dark:text-gray-300 font-mono font-bold">
                    {p.startDate
                      ? format(new Date(p.startDate + "T12:00:00"), "dd/MM/yyyy")
                      : "—"}
                  </td>

                  <td className="px-5 py-4 text-gray-700 dark:text-gray-300 font-semibold">
                    {p.professional || "—"}
                  </td>

                  <td className="px-5 py-4 text-gray-700 dark:text-gray-300 font-semibold">
                    {p.priority === "ALTA"
                      ? t("priority_high")
                      : p.priority === "MEDIA"
                      ? t("priority_medium")
                      : p.priority === "BAJA"
                      ? t("priority_low")
                      : p.priority || "—"}
                  </td>

                  {!isReadOnly && (
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => onDelete(p.id)}
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