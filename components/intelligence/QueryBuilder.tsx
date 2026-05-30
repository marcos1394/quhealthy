"use client";

import { useBIStore } from "@/store/intelligence.store";
import { Filter, X } from "lucide-react";

export function QueryBuilder() {
  const { filters, groupBy, setFilter, setGroupBy, clearFilters } = useBIStore();

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm mb-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* GROUP BY (DIMENSION) */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap">
            Agrupar métricas por:
          </label>
          <select 
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value)}
            className="flex-1 md:w-64 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block p-2.5 outline-none"
          >
            <option value="entidad">Entidad Federativa</option>
            <option value="nombre_institucion">Institución</option>
            <option value="nivel_atencion">Nivel de Atención</option>
            <option value="nombre_tipo_establecimiento">Tipo de Establecimiento</option>
          </select>
        </div>

        {/* ACTIVE FILTERS BADGES */}
        <div className="flex items-center gap-2 flex-1 overflow-x-auto">
          {activeFilterCount > 0 ? (
            <>
              <Filter className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Filtros Activos:</span>
              
              {filters.estado && (
                <Badge label="Estado" value={filters.estado} onRemove={() => setFilter('estado', undefined)} />
              )}
              {filters.institucion && (
                <Badge label="Institución" value={filters.institucion} onRemove={() => setFilter('institucion', undefined)} />
              )}
              {filters.nivel && (
                <Badge label="Nivel" value={filters.nivel} onRemove={() => setFilter('nivel', undefined)} />
              )}
              {filters.tipo && (
                <Badge label="Tipo" value={filters.tipo} onRemove={() => setFilter('tipo', undefined)} />
              )}
              
              <button 
                onClick={clearFilters}
                className="text-xs text-rose-500 hover:text-rose-600 font-medium ml-2 underline"
              >
                Limpiar todo
              </button>
            </>
          ) : (
            <span className="text-sm text-slate-500 dark:text-slate-500 italic">
              Haz clic en los gráficos para aplicar filtros cruzados a todo el dashboard.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function Badge({ label, value, onRemove }: { label: string; value: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
      <span className="opacity-70">{label}:</span> {value}
      <button 
        type="button" 
        onClick={onRemove}
        className="inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-emerald-200 dark:hover:bg-emerald-800 transition-colors"
      >
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}
