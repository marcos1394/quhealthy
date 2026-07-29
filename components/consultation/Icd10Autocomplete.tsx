"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Search, X, Stethoscope, Plus } from "lucide-react";

import { consumerProfileService } from "@/services/consumerProfile.service";
import { AppointmentDiagnosis } from "@/types/ehr";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { cn } from "@/lib/utils";

interface Icd10AutocompleteProps {
  diagnoses: AppointmentDiagnosis[];
  addDiagnosis: (diagnosis: Omit<AppointmentDiagnosis, "id">) => void;
  removeDiagnosis: (id: string) => void;
}

export const Icd10Autocomplete: React.FC<Icd10AutocompleteProps> = ({
  diagnoses,
  addDiagnosis,
  removeDiagnosis,
}) => {
  const t = useTranslations("EHR");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim().length > 2) {
        setLoading(true);
        try {
          const data = await consumerProfileService.searchIcd10(query, 10);
          setResults(data.content || data || []);
          setShowResults(true);
        } catch (error) {
          console.error("Error fetching ICD10", error);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  // Cierra el menú desplegable al hacer clic fuera del componente
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (item: any) => {
    addDiagnosis({
      cie10Code: item.code,
      cie10Description: item.name || item.description,
      type: "PRIMARY",
    });
    setQuery("");
    setShowResults(false);
  };

  return (
    <div className="flex flex-col gap-4 font-sans" ref={containerRef}>
      {/* ── CAMPO DE BÚSQUEDA Y DROPDOWN ─────────────────────────────── */}
      <div className="relative">
        <div className="relative flex items-center">
          <Search
            className="absolute left-3.5 w-4 h-4 text-gray-400 pointer-events-none"
            strokeWidth={2}
          />
          <input
            type="text"
            className="w-full h-11 pl-10 pr-10 rounded-2xl bg-gray-50/80 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-xs font-medium text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-xs"
            placeholder={t("icd10_search_placeholder")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (results.length > 0) setShowResults(true);
            }}
          />
          {loading && (
            <div className="absolute right-3.5 flex items-center pointer-events-none">
              <QhSpinner size="sm" className="text-emerald-600 dark:text-emerald-400" />
            </div>
          )}
        </div>

        {/* Menu Desplegable de Resultados */}
        {showResults && (
          <div className="absolute z-50 mt-2 w-full bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl overflow-hidden max-h-60 overflow-y-auto custom-scrollbar">
            {results.length > 0 ? (
              <ul className="divide-y divide-gray-100 dark:divide-gray-800/60">
                {results.map((item) => (
                  <li
                    key={item.code}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleSelect(item)}
                    onKeyDown={(e) => e.key === "Enter" && handleSelect(item)}
                    className="p-3.5 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 transition-colors cursor-pointer flex items-center justify-between gap-3 text-xs group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 font-mono font-bold shrink-0 text-[11px]">
                        {item.code}
                      </span>
                      <span className="font-medium text-gray-800 dark:text-gray-200 truncate">
                        {item.name || item.description}
                      </span>
                    </div>

                    <div className="w-6 h-6 rounded-lg bg-gray-50 dark:bg-[#111] group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center shrink-0 text-gray-400 transition-colors shadow-xs">
                      <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-4 text-center text-xs font-semibold text-gray-400">
                {t("icd10_no_results")}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── DIAGNÓSTICOS SELECCIONADOS ───────────────────────────────── */}
      {diagnoses.length > 0 && (
        <div className="space-y-2">
          {diagnoses.map((diag) => {
            const isPrimary = diag.type === "PRIMARY";
            const typeLabel = isPrimary
              ? t("icd10_type_primary")
              : t("icd10_type_secondary");

            return (
              <div
                key={diag.id}
                className="flex items-start justify-between p-3.5 rounded-2xl bg-gray-50/50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 shadow-xs transition-all"
              >
                <div className="flex items-start gap-3 min-w-0 pr-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5 shadow-xs">
                    <Stethoscope className="w-4 h-4" strokeWidth={2} />
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-xs text-gray-900 dark:text-white bg-white dark:bg-[#0a0a0a] px-2 py-0.5 rounded-md border border-gray-200 dark:border-gray-800 shadow-xs">
                        {diag.cie10Code}
                      </span>
                      <p className="font-bold text-xs text-gray-900 dark:text-white truncate">
                        {diag.cie10Description}
                      </p>
                    </div>

                    <p className="text-[11px] font-medium text-gray-400">
                      {t("icd10_type_label", { type: typeLabel })}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeDiagnosis(diag.id)}
                  className="w-8 h-8 rounded-xl flex items-center justify-center bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 dark:hover:border-red-900/40 transition-colors shrink-0 cursor-pointer shadow-xs"
                >
                  <X className="w-4 h-4" strokeWidth={2} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};