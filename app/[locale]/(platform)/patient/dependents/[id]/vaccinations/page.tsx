"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/prefer-module-scope-pure-function */

import React, { useState, useEffect, use } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2, AlertCircle, Syringe, Clock, Info } from "lucide-react";
import { toast } from "react-toastify";

import { QhSpinner } from "@/components/ui/QhSpinner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface VaccinationStatus {
  vaccineCatalogId: number;
  name: string;
  diseasePrevented: string;
  doseNumber: number | null;
  recommendedAgeMonths: number;
  notes: string;
  isApplied: boolean;
  appliedDate: string | null;
  appliedBy: string | null;
  isDelayed: boolean;
  recommendedDate: string | null;
}

export default function VaccinationCardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const t = useTranslations("PatientVaccination");
  const resolvedParams = use(params);
  const dependentId = resolvedParams.id;

  const [vaccines, setVaccines] = useState<VaccinationStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState<number | null>(null);

  useEffect(() => {
    fetchVaccines();
  }, [dependentId]);

  const fetchVaccines = async () => {
    try {
      const response = await fetch(
        `/api/dependents/${dependentId}/vaccinations`
      );
      if (response.ok) {
        const data = await response.json();
        setVaccines(data);
      } else {
        toast.error(t("toast_fetch_error"));
      }
    } catch (e) {
      console.error("Error fetching vaccination card:", e);
      toast.error(t("toast_fetch_error"));
    } finally {
      setLoading(false);
    }
  };

  const handleMarkApplied = async (vaccineId: number) => {
    setApplyingId(vaccineId);
    try {
      const today = new Date().toISOString().split("T")[0];
      const response = await fetch(
        `/api/dependents/${dependentId}/vaccinations`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            vaccineCatalogId: vaccineId,
            appliedDate: today,
            appliedBy: t("registered_by_user"),
          }),
        }
      );

      if (response.ok) {
        toast.success(t("toast_applied_success"));
        await fetchVaccines();
      } else {
        toast.error(t("toast_save_error"));
      }
    } catch (e) {
      console.error("Error updating vaccine application:", e);
      toast.error(t("toast_save_error"));
    } finally {
      setApplyingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] bg-gray-50/50 dark:bg-[#050505] transition-colors duration-500">
        <QhSpinner size="lg" />
        <p className="text-xs font-semibold tracking-wide text-gray-500 dark:text-gray-400 mt-4 animate-pulse">
          {t("loading")}
        </p>
      </div>
    );
  }

  // Agrupar por meses
  const grouped = vaccines.reduce(
    (acc, curr) => {
      const age = curr.recommendedAgeMonths;
      if (!acc[age]) acc[age] = [];
      acc[age].push(curr);
      return acc;
    },
    {} as Record<number, VaccinationStatus[]>
  );

  const formatAge = (months: number) => {
    if (months === 0) return t("age_at_birth");
    if (months === 12) return t("age_one_year");
    if (months === 18) return t("age_one_half_years");
    if (months > 12 && months % 12 === 0)
      return t("age_years", { years: months / 12 });
    return t("age_months", { months });
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] font-sans text-gray-900 dark:text-white selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500 pb-24">
      <div className="max-w-5xl mx-auto px-6 py-10 sm:py-12 space-y-10">
        
        {/* ── HEADER ────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-5 border-b border-gray-100 dark:border-gray-800 pb-8">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 text-amber-600 dark:text-amber-400 shadow-sm flex items-center justify-center shrink-0">
            <Syringe className="w-7 h-7" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              {t("title")}
            </h1>
            <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mt-0.5">
              {t("subtitle")}
            </p>
          </div>
        </div>

        {/* ── LISTADO AGRUPADO DE VACUNAS ──────────────────────────────── */}
        <div className="space-y-10">
          {Object.entries(grouped).map(([age, group]) => (
            <div key={age} className="space-y-4">
              <div className="border-b border-gray-100 dark:border-gray-800 pb-2">
                <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  {formatAge(Number(age))}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {group.map((v) => (
                  <div
                    key={v.vaccineCatalogId}
                    className={cn(
                      "p-6 rounded-3xl border relative overflow-hidden transition-all shadow-sm flex flex-col justify-between gap-4",
                      v.isApplied
                        ? "bg-white dark:bg-[#0a0a0a] border-gray-100 dark:border-gray-800"
                        : v.isDelayed
                        ? "bg-rose-50/30 dark:bg-rose-950/10 border-rose-100 dark:border-rose-900/30"
                        : "bg-white dark:bg-[#0a0a0a] border-gray-100 dark:border-gray-800"
                    )}
                  >
                    {/* Borde lateral de estado */}
                    <div
                      className={cn(
                        "absolute top-0 left-0 w-1.5 h-full",
                        v.isApplied
                          ? "bg-emerald-500"
                          : v.isDelayed
                          ? "bg-rose-500"
                          : "bg-amber-500"
                      )}
                    />

                    <div className="pl-2 flex justify-between items-start gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                            {v.name}
                          </h3>
                          {v.doseNumber && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-mono">
                              {t("dose_label", { number: v.doseNumber })}
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                          {t("prevents_label", { disease: v.diseasePrevented })}
                        </p>
                      </div>

                      {!v.isApplied && (
                        <Button
                          onClick={() => handleMarkApplied(v.vaccineCatalogId)}
                          disabled={applyingId === v.vaccineCatalogId}
                          variant="outline"
                          className="shrink-0 rounded-xl border-gray-200 dark:border-gray-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 hover:border-emerald-200 text-xs font-bold transition-all h-9 px-3.5 shadow-sm"
                        >
                          {applyingId === v.vaccineCatalogId
                            ? t("btn_saving")
                            : t("btn_mark")}
                        </Button>
                      )}
                    </div>

                    <div className="pl-2 pt-2 border-t border-gray-50 dark:border-gray-800/50 flex items-center gap-2">
                      {v.isApplied ? (
                        <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>
                            {t("status_applied", { date: v.appliedDate || "" })}
                          </span>
                        </span>
                      ) : v.isDelayed ? (
                        <span className="flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400">
                          <AlertCircle className="w-4 h-4" />
                          <span>
                            {t("status_delayed", {
                              date: v.recommendedDate || "",
                            })}
                          </span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                          <Clock className="w-4 h-4" />
                          <span>
                            {t("status_pending", {
                              date: v.recommendedDate || "",
                            })}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* ── NOTA INFORMATIVA DE IA / RECORDATORIOS ───────────────────── */}
        <div className="rounded-3xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 p-5 flex items-start gap-3.5 shadow-sm">
          <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
            <Info className="w-4.5 h-4.5" strokeWidth={2} />
          </div>
          <p className="text-xs font-medium leading-relaxed text-amber-950/80 dark:text-amber-300/80">
            {t("info_note")}
          </p>
        </div>

      </div>
    </div>
  );
}