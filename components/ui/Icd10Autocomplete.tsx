"use client";

/* eslint-disable react-doctor/click-events-have-key-events */

import React, { useState, useRef, useEffect } from "react";
import { Search, X, Plus, Check } from "lucide-react";
import { consumerProfileService } from "@/services/consumerProfile.service";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { cn } from "@/lib/utils";

interface ConditionItem {
  name: string;
  icd10Code?: string;
}

interface Icd10AutocompleteProps {
  selectedConditions: ConditionItem[];
  onChange: (conditions: ConditionItem[]) => void;
}

export function Icd10Autocomplete({
  selectedConditions,
  onChange,
}: Icd10AutocompleteProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Efecto de búsqueda con debounce
  useEffect(() => {
    if (query.trim().length === 0) {
      setResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await consumerProfileService.searchIcd10(query);
        if (response && response.content) {
          setResults(response.content);
        } else {
          setResults([]);
        }
      } catch (error) {
        console.error("Error fetching ICD10 catalog", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  // Cerrar dropdown al hacer clic fuera del componente
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (item: { code: string; name: string }) => {
    if (!selectedConditions.some((c) => c.icd10Code === item.code)) {
      onChange([
        ...selectedConditions,
        { name: item.name, icd10Code: item.code },
      ]);
    }
    setQuery("");
    setIsOpen(false);
  };

  const handleRemove = (identifier: string) => {
    onChange(
      selectedConditions.filter(
        (c) => c.icd10Code !== identifier && c.name !== identifier
      )
    );
  };

  const handleAddManual = () => {
    if (
      query.trim() &&
      !selectedConditions.some(
        (c) => c.name.toLowerCase() === query.trim().toLowerCase()
      )
    ) {
      onChange([...selectedConditions, { name: query.trim() }]);
    }
    setQuery("");
    setIsOpen(false);
  };

  return (
    <div className="w-full relative font-sans" ref={wrapperRef}>
      
      {/* ── ETIQUETAS DE DIAGNÓSTICOS SELECCIONADOS ──────────────────────── */}
      {selectedConditions.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {selectedConditions.map((condition, idx) => (
            <div
              key={`${condition.icd10Code || condition.name}-${idx}`}
              className="inline-flex items-center gap-2 pl-3 pr-1.5 py-1.5 rounded-xl bg-gray-50/80 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white shadow-sm transition-all hover:border-emerald-500/40"
            >
              {condition.icd10Code && (
                <span className="font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-lg border border-emerald-200/60 dark:border-emerald-900/40">
                  {condition.icd10Code}
                </span>
              )}
              <span className="truncate max-w-[220px]">{condition.name}</span>
              <button
                type="button"
                onClick={() =>
                  handleRemove(condition.icd10Code || condition.name)
                }
                className="w-5 h-5 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                title="Eliminar diagnóstico"
              >
                <X className="w-3.5 h-3.5" strokeWidth={2} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── CAMPO DE BÚSQUEDA ─────────────────────────────────────────────── */}
      <div className="relative">
        <Search
          className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none"
          strokeWidth={2}
        />
        <input
          type="text"
          className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-xs font-semibold text-gray-900 dark:text-white placeholder:text-gray-400 transition-all shadow-sm"
          placeholder="Buscar condición o código CIE-10 (ej. Diabetes, E11, Hipertensión...)"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
      </div>

      {/* ── DESPLEGABLE DE RESULTADOS Y AUTOCOMPLETADO ────────────────────── */}
      {isOpen && query.trim().length > 0 && (
        <div className="absolute z-30 mt-2 w-full bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl max-h-64 overflow-y-auto custom-scrollbar">
          {isLoading ? (
            <div className="p-6 flex flex-col items-center justify-center gap-2.5 text-center">
              <QhSpinner size="sm" className="text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-semibold text-gray-400">
                Consultando catálogo médico CIE-10...
              </span>
            </div>
          ) : results.length > 0 ? (
            <div className="p-1.5 space-y-1">
              {results.map((item) => {
                const isSelected = selectedConditions.some(
                  (c) => c.icd10Code === item.code
                );
                return (
                  <div
                    key={item.code}
                    onClick={() => handleSelect(item)}
                    className={cn(
                      "p-3 rounded-xl cursor-pointer flex items-center justify-between gap-3 transition-all",
                      isSelected
                        ? "bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/30"
                        : "hover:bg-gray-50 dark:hover:bg-[#111]"
                    )}
                  >
                    <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 leading-snug">
                      {item.name}
                    </span>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-lg border border-emerald-200/60 dark:border-emerald-900/40">
                        {item.code}
                      </span>
                      {isSelected && (
                        <Check
                          className="w-4 h-4 text-emerald-600 dark:text-emerald-400"
                          strokeWidth={2.5}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-5 text-center space-y-3">
              <p className="text-xs font-medium text-gray-400">
                No se encontraron coincidencias en el catálogo oficial CIE-10.
              </p>

              <button
                type="button"
                onClick={handleAddManual}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 text-xs font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" strokeWidth={2.5} />
                <span>Registrar "{query}" manualmente</span>
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
}