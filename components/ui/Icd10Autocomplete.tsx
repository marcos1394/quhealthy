"use client";

import React, { useState, useRef, useEffect } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { consumerProfileService } from "@/services/consumerProfile.service";

interface Icd10AutocompleteProps {
  selectedConditions: any[];
  onChange: (conditions: any[]) => void;
}

export function Icd10Autocomplete({ selectedConditions, onChange }: Icd10AutocompleteProps) {
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
        // Pageable response structure from Spring Boot: { content: [...] }
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

  // Cerrar dropdown si se hace click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (item: any) => {
    // Evitar duplicados
    if (!selectedConditions.some(c => c.icd10Code === item.code)) {
      onChange([...selectedConditions, { name: item.name, icd10Code: item.code }]);
    }
    setQuery("");
    setIsOpen(false);
  };

  const handleRemove = (codeToRemove: string) => {
    onChange(selectedConditions.filter(c => c.icd10Code !== codeToRemove && c.name !== codeToRemove));
  };

  return (
    <div className="w-full relative" ref={wrapperRef}>
      {/* Pills de seleccionados */}
      {selectedConditions.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {selectedConditions.map((condition, idx) => (
            <div key={idx} className="flex items-center gap-1 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 px-3 py-1.5 rounded-full text-sm font-medium border border-blue-200 dark:border-blue-800">
              <span className="opacity-60 text-xs mr-1">{condition.icd10Code}</span>
              {condition.name}
              <button 
                type="button"
                onClick={() => handleRemove(condition.icd10Code || condition.name)}
                className="ml-1 text-blue-400 hover:text-blue-600 dark:hover:text-blue-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input de Búsqueda */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-400" />
        </div>
        <input
          type="text"
          className="w-full pl-10 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition"
          placeholder="Buscar enfermedad (ej. Diabetes, Hipertensión...)"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
      </div>

      {/* Resultados Autocomplete */}
      {isOpen && query.length > 0 && (
        <div className="absolute z-20 mt-1 w-full bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="px-4 py-4 text-slate-500 text-sm flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Buscando en catálogo oficial...
            </div>
          ) : results.length > 0 ? (
            results.map((item) => (
              <div
                key={item.code}
                className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer flex justify-between items-center"
                onClick={() => handleSelect(item)}
              >
                <span className="text-slate-900 dark:text-white font-medium">{item.name}</span>
                <span className="text-sm text-slate-500 bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded-md font-mono">{item.code}</span>
              </div>
            ))
          ) : (
            <div className="px-4 py-3 text-slate-500 text-sm">
              No se encontraron coincidencias en el catálogo.
              <button 
                type="button"
                className="block mt-2 text-blue-600 font-medium hover:underline"
                onClick={() => {
                  if (!selectedConditions.some(c => c.name === query)) {
                    onChange([...selectedConditions, { name: query }]);
                  }
                  setQuery("");
                  setIsOpen(false);
                }}
              >
                + Agregar "{query}" como texto libre
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
