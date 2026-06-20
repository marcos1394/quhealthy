"use client";

import React, { useState, useRef, useEffect } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { consumerProfileService } from "@/services/consumerProfile.service";
import { cn } from "@/lib/utils";

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
      
      {/* Selected Blocks (Architectural Tags) */}
      {selectedConditions.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedConditions.map((condition, idx) => (
            <div 
              key={idx} 
              className="flex items-center gap-3 bg-gray-50 dark:bg-[#050505] text-black dark:text-white pl-3 pr-1 py-1.5 border border-gray-200 dark:border-gray-800"
            >
              {condition.icd10Code && (
                <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500 border-r border-gray-200 dark:border-gray-800 pr-2">
                  {condition.icd10Code}
                </span>
              )}
              <span className="text-xs font-medium tracking-wide">
                {condition.name}
              </span>
              <button 
                type="button"
                onClick={() => handleRemove(condition.icd10Code || condition.name)}
                className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="w-3.5 h-3.5" strokeWidth={2} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Strict Search Input */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors" strokeWidth={1.5} />
        </div>
        <input
          type="text"
          className="w-full pl-12 pr-4 py-4 rounded-none border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] focus:border-black dark:focus:border-white focus:ring-0 outline-none transition-colors text-sm font-light text-black dark:text-white placeholder:text-gray-400"
          placeholder="Buscar enfermedad (ej. Diabetes, Hipertensión...)"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
      </div>

      {/* Autocomplete Dropdown (Blueprint style) */}
      {isOpen && query.length > 0 && (
        <div className="absolute z-20 mt-[-1px] w-full bg-white dark:bg-[#0a0a0a] border border-black dark:border-white shadow-2xl max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="px-5 py-6 flex items-center gap-3 text-black dark:text-white">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-[10px] font-bold uppercase tracking-widest">
                Consultando CIE-10...
              </span>
            </div>
          ) : results.length > 0 ? (
            results.map((item) => (
              <div
                key={item.code}
                className="px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer flex justify-between items-center border-b border-gray-100 dark:border-gray-800/50 last:border-0 group transition-colors"
                onClick={() => handleSelect(item)}
              >
                <span className="text-xs text-black dark:text-white font-medium pr-4 leading-relaxed">
                  {item.name}
                </span>
                <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-black dark:group-hover:text-white transition-colors shrink-0">
                  {item.code}
                </span>
              </div>
            ))
          ) : (
            <div className="px-5 py-6">
              <p className="text-xs text-gray-500 font-light mb-4">
                No se encontraron coincidencias en el catálogo oficial CIE-10.
              </p>
              <button 
                type="button"
                className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white border-b border-black dark:border-white pb-0.5 hover:opacity-60 transition-opacity flex items-center gap-2"
                onClick={() => {
                  if (!selectedConditions.some(c => c.name === query)) {
                    onChange([...selectedConditions, { name: query }]);
                  }
                  setQuery("");
                  setIsOpen(false);
                }}
              >
                + Registrar "{query}" Manualmente
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}