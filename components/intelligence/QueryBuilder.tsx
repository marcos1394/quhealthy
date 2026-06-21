"use client";

import { useBIStore } from "@/store/intelligence.store";
import { Filter, X } from "lucide-react";

export function QueryBuilder() {
  const { filters, groupBy, setFilter, setGroupBy, clearFilters } = useBIStore();

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="w-full bg-white dark:bg-[#0a0a0a] border border-black dark:border-white shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff] p-6 mb-8 flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        
        {/* GROUP BY (DIMENSION) */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full md:w-auto">
          <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 whitespace-nowrap">
            DIMENSIÓN DE AGRUPACIÓN:
          </label>
          <select 
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value)}
            className="flex-1 sm:w-64 bg-gray-50 dark:bg-[#050505] border border-black dark:border-white text-black dark:text-white text-[10px] font-bold uppercase tracking-widest rounded-none focus:ring-0 focus:border-black dark:focus:border-white block p-3 outline-none cursor-pointer"
          >
            <option value="entidad">ENTIDAD FEDERATIVA</option>
            <option value="nombre_institucion">INSTITUCIÓN RECTORA</option>
            <option value="nivel_atencion">NIVEL DE ATENCIÓN</option>
            <option value="nombre_tipo_establecimiento">TIPO DE ESTABLECIMIENTO</option>
          </select>
        </div>

        {/* ACTIVE FILTERS BADGES */}
        <div className="flex items-center gap-3 flex-1 overflow-x-auto custom-scrollbar pb-2 md:pb-0">
          {activeFilterCount > 0 ? (
            <>
              <Filter className="w-4 h-4 text-black dark:text-white shrink-0" strokeWidth={1.5} />
              <span className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white whitespace-nowrap">
                FILTROS ACTIVOS:
              </span>
              
              {filters.estado && (
                <Badge label="EST" value={filters.estado} onRemove={() => setFilter('estado', undefined)} />
              )}
              {filters.institucion && (
                <Badge label="INST" value={filters.institucion} onRemove={() => setFilter('institucion', undefined)} />
              )}
              {filters.nivel && (
                <Badge label="NIV" value={filters.nivel} onRemove={() => setFilter('nivel', undefined)} />
              )}
              {filters.tipo && (
                <Badge label="TIP" value={filters.tipo} onRemove={() => setFilter('tipo', undefined)} />
              )}
              
              <button 
                onClick={clearFilters}
                className="text-[9px] font-bold uppercase tracking-widest text-gray-400 hover:text-black dark:hover:text-white ml-2 border-b border-transparent hover:border-black dark:hover:border-white transition-colors shrink-0"
              >
                PURGAR PARÁMETROS
              </button>
            </>
          ) : (
            <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500 md:ml-auto">
              INTERACTÚE CON LOS GRÁFICOS PARA APLICAR FILTROS CRUZADOS.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function Badge({ label, value, onRemove }: { label: string; value: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-2 px-3 py-1.5 border border-black dark:border-white bg-gray-50 dark:bg-[#050505] text-[9px] font-bold uppercase tracking-widest text-black dark:text-white whitespace-nowrap shrink-0">
      <span className="text-gray-500">{label}:</span> {value}
      <button 
        type="button" 
        onClick={onRemove}
        className="inline-flex items-center justify-center w-4 h-4 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors border border-transparent hover:border-black dark:hover:border-white"
      >
        <X className="w-3 h-3" strokeWidth={2} />
      </button>
    </span>
  );
}