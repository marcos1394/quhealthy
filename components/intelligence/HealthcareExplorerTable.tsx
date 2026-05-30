"use client";

import { useEffect, useState } from "react";
import { Download, Search } from "lucide-react";

interface HealthcareMapDto {
  clues: string;
  entidad: string;
  municipio: string;
  localidad: string;
  nombreUnidad: string;
  nombreInstitucion: string;
  nivelAtencion: string;
  nombreTipoEstablecimiento: string;
}

export function HealthcareExplorerTable() {
  const [data, setData] = useState<HealthcareMapDto[]>([]);
  const [filtered, setFiltered] = useState<HealthcareMapDto[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 15;

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_ANALYTICS_API_URL || "http://localhost:8087";
    fetch(`${url}/api/intelligence/map`)
      .then(res => res.json())
      .then(d => {
        setData(d);
        setFiltered(d);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

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
    link.setAttribute("download", "quhealthy_establecimientos.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const currentData = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize);

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar por CLUES, Unidad, Estado o Institución..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 dark:bg-slate-900"
          />
        </div>
        <button 
          onClick={exportCSV}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Download className="h-4 w-4" />
          Exportar CSV ({filtered.length})
        </button>
      </div>

      <div className="border rounded-lg overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 border-b">
            <tr>
              <th className="px-4 py-3 font-semibold">CLUES</th>
              <th className="px-4 py-3 font-semibold">Unidad Médica</th>
              <th className="px-4 py-3 font-semibold">Estado</th>
              <th className="px-4 py-3 font-semibold">Institución</th>
              <th className="px-4 py-3 font-semibold">Nivel</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">Cargando base de datos nacional...</td></tr>
            ) : currentData.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">No se encontraron resultados</td></tr>
            ) : (
              currentData.map(item => (
                <tr key={item.clues} className="border-b last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/20">
                  <td className="px-4 py-3 font-medium text-blue-600">{item.clues}</td>
                  <td className="px-4 py-3 truncate max-w-xs" title={item.nombreUnidad}>{item.nombreUnidad}</td>
                  <td className="px-4 py-3">{item.entidad}</td>
                  <td className="px-4 py-3">
                    <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-xs font-medium">
                      {item.nombreInstitucion}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{item.nivelAtencion}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-slate-500">
          <div>
            Mostrando {(page - 1) * pageSize + 1} a {Math.min(page * pageSize, filtered.length)} de {filtered.length} registros
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 border rounded hover:bg-slate-50 disabled:opacity-50"
            >
              Anterior
            </button>
            <button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 border rounded hover:bg-slate-50 disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
