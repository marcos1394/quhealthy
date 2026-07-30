"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/no-chain-state-updates */

import { useEffect, useState } from "react";
import { Download, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";

import { useIntelligenceMap } from "@/hooks/useIntelligence";
import { HealthcareMapDTO } from "@/types/intelligence";
import { QhSpinner } from "@/components/ui/QhSpinner";

export function HealthcareExplorerTable() {
  const t = useTranslations("Intelligence.HealthcareExplorerTable");

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
          (item) =>
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
    const headers = [
      "CLUES",
      "Unidad",
      "Estado",
      "Municipio",
      "Institución",
      "Nivel",
      "Tipo",
    ];
    const csvContent =
      "data:text/csv;charset=utf-8," +
      headers.join(",") +
      "\n" +
      filtered
        .map(
          (e) =>
            `"${e.clues}","${e.nombreUnidad}","${e.entidad}","${e.municipio}","${e.nombreInstitucion}","${e.nivelAtencion}","${e.nombreTipoEstablecimiento}"`
        )
        .join("\n");

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
    <div className="flex flex-col space-y-5 font-sans transition-colors select-none">
      {/* ── CONTROLES SUPERIORES ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3.5">
        {/* Buscador */}
        <div className="relative flex-1 sm:max-w-md">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none"
            strokeWidth={2}
          />
          <input
            type="text"
            placeholder={t("search_placeholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pl-10 pr-4 bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 placeholder:text-gray-400 shadow-2xs transition-all"
          />
        </div>

        {/* Botón Exportar */}
        <button
          type="button"
          onClick={exportCSV}
          disabled={loading || filtered.length === 0}
          className="h-11 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all text-xs font-bold shadow-xs flex items-center justify-center gap-2 cursor-pointer border-0 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="h-4 w-4" strokeWidth={2} />
          <span>{t("export_button", { count: filtered.length })}</span>
        </button>
      </div>

      {/* ── CONTENEDOR DE LA TABLA ────────────────────────────────────── */}
      <div className="border border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden bg-white dark:bg-[#0a0a0a] shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[750px] text-xs">
            {/* Header de la Tabla */}
            <thead>
              <tr className="bg-gray-50/60 dark:bg-[#050505] border-b border-gray-100 dark:border-gray-800 text-gray-800 dark:text-gray-200 font-bold">
                <th className="px-5 py-3.5">{t("th_clues")}</th>
                <th className="px-5 py-3.5">{t("th_unit")}</th>
                <th className="px-5 py-3.5">{t("th_entity")}</th>
                <th className="px-5 py-3.5">{t("th_institution")}</th>
                <th className="px-5 py-3.5">{t("th_level")}</th>
              </tr>
            </thead>

            {/* Cuerpo de la Tabla */}
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/80 font-medium text-gray-700 dark:text-gray-300">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-2.5">
                      <QhSpinner
                        size="md"
                        className="text-emerald-600 dark:text-emerald-400"
                      />
                      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                        {t("loading")}
                      </span>
                    </div>
                  </td>
                </tr>
              ) : currentData.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-xs font-semibold text-gray-400"
                  >
                    {t("empty_search")}
                  </td>
                </tr>
              ) : (
                currentData.map((item) => (
                  <tr
                    key={item.clues}
                    className="hover:bg-gray-50/50 dark:hover:bg-[#050505] transition-colors"
                  >
                    <td className="px-5 py-3.5 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {item.clues}
                    </td>
                    <td
                      className="px-5 py-3.5 truncate max-w-xs font-bold text-gray-900 dark:text-white"
                      title={item.nombreUnidad}
                    >
                      {item.nombreUnidad}
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400 font-semibold">
                      {item.entidad}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-gray-50 dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-[10px] font-bold shadow-2xs">
                        {item.nombreInstitucion}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 dark:text-gray-400 font-semibold">
                      {item.nivelAtencion}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── PAGINACIÓN ────────────────────────────────────────────────── */}
      {!loading && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between text-xs font-medium text-gray-500 dark:text-gray-400 gap-3 pt-1">
          <div>
            {t("showing_records", {
              start: (page - 1) * pageSize + 1,
              end: Math.min(page * pageSize, filtered.length),
              total: filtered.length,
            })}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="h-9 px-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] hover:bg-gray-50 dark:hover:bg-[#111] text-gray-700 dark:text-gray-200 disabled:opacity-40 transition-colors text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" strokeWidth={2} />
              <span>{t("prev")}</span>
            </button>

            <span className="px-2 text-xs font-bold font-mono text-gray-900 dark:text-white">
              {page} / {totalPages}
            </span>

            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="h-9 px-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] hover:bg-gray-50 dark:hover:bg-[#111] text-gray-700 dark:text-gray-200 disabled:opacity-40 transition-colors text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs disabled:cursor-not-allowed"
            >
              <span>{t("next")}</span>
              <ChevronRight className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}