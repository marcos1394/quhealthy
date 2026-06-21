"use client";

import { useEffect, useState } from "react";
import { Download, Search } from "lucide-react";
import { useIntelligenceMap } from "@/hooks/useIntelligence";
import { HealthcareMapDTO } from "@/types/intelligence";
import { cn } from "@/lib/utils";

export function HealthcareExplorerTable() {
  const { data: rawData, loading } = useIntelligenceMap();
  const data = rawData || [];
  const [filtered, setFiltered] = useState<HealthcareMapDTO[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 15;

  useEffect(() => {
    if (!search) {
      setFiltered(data);
    } else {
      const s = search.toLowerCase();
      setFiltered(
        data.filter(
          item =>
            item.nombreUnidad?.toLowerCase().includes(s) ||
            item.clues?.toLowerCase().includes(s) ||
            item.entidad?.toLowerCase().includes(s) ||
            item.nombreInstitucion?.toLowerCase().includes(s)
        )
      );
    }
    setPage(1);
  }, [search, data]);

  const exportCSV = () => {
    const headers = ["CLUES", "Unidad", "Estado", "Municipio", "Institución", "Nivel", "Tipo"];
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + filtered.map(e => `"${e.clues}","${e.nombreUnidad}","${e.entidad}","${e.municipio}","${e.nombreInstitucion}","${e.nivelAtencion}","${e.nombreTipoEstablecimiento}"`).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "quhealthy_directorio_salud.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const currentData = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize);

  return (
    <div className="flex flex-col space-y-6">
      
      {/* Controles Superiores */}
      <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center gap-4">
        <div className="relative w-full sm:w-[400px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" strokeWidth={2} />
          <input 
            type="text" 
            placeholder="BUSCAR CLUES, UNIDAD O INSTITUCIÓN..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 h-12 border border-black dark:border-white rounded-none text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:ring-0 bg-white dark:bg-[#0a0a0a] text-black dark:text-white placeholder:text-gray-400 transition-colors"
          />
        </div>
        <button 
          onClick={exportCSV}
          className="w-full sm:w-auto flex items-center justify-center gap-3 bg-black text-white dark:bg-white dark:text-black h-12 px-6 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
        >
          <Download className="h-4 w-4" strokeWidth={1.5} />
          EXTRAER DATOS ({filtered.length})
        </button>
      </div>

      {/* Tabla Arquitectónica */}
      <div className="border border-black dark:border-white overflow-x-auto bg-white dark:bg-[#0a0a0a]">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead className="bg-gray-50 dark:bg-[#050505] text-[9px] font-bold uppercase tracking-widest text-gray-500 border-b border-black dark:border-white">
            <tr>
              <th className="px-6 py-4">CLUES</th>
              <th className="px-6 py-4">Unidad Médica</th>
              <th className="px-6 py-4">Entidad</th>
              <th className="px-6 py-4">Institución</th>
              <th className="px-6 py-4">Nivel</th>
            </tr>
          </thead>
          <tbody className="text-xs uppercase tracking-wider text-black dark:text-white">
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-[10px] font-bold tracking-widest text-gray-400 animate-pulse">SINTETIZANDO BASE DE DATOS NACIONAL...</td></tr>
            ) : currentData.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-[10px] font-bold tracking-widest text-gray-400">0 RESULTADOS ENCONTRADOS.</td></tr>
            ) : (
              currentData.map((item, idx) => (
                <tr key={item.clues} className={cn("border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#111] transition-colors", idx === currentData.length - 1 && "border-b-0")}>
                  <td className="px-6 py-4 font-mono font-bold">{item.clues}</td>
                  <td className="px-6 py-4 truncate max-w-xs font-semibold" title={item.nombreUnidad}>{item.nombreUnidad}</td>
                  <td className="px-6 py-4 text-[10px] font-bold tracking-widest text-gray-500">{item.entidad}</td>
                  <td className="px-6 py-4">
                    <span className="border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#050505] px-2 py-1 text-[9px] font-bold tracking-widest">
                      {item.nombreInstitucion}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[10px] font-bold tracking-widest text-gray-500">{item.nivelAtencion}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación Técnica */}
      {!loading && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between text-[10px] font-bold uppercase tracking-widest text-gray-500 gap-4">
          <div>
            ÍNDICE {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, filtered.length)} / {filtered.length}
          </div>
          <div className="flex gap-0 border border-black dark:border-white">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 h-10 bg-white dark:bg-[#0a0a0a] hover:bg-gray-100 dark:hover:bg-[#111] text-black dark:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors border-r border-black dark:border-white"
            >
              ANTERIOR
            </button>
            <button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 h-10 bg-white dark:bg-[#0a0a0a] hover:bg-gray-100 dark:hover:bg-[#111] text-black dark:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            >
              SIGUIENTE
            </button>
          </div>
        </div>
      )}
    </div>
  );
}