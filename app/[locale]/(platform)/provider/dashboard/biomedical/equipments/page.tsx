"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/prefer-module-scope-pure-function */

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Activity,
  Plus,
  Search,
  Settings,
  AlertTriangle,
  ShieldCheck,
  FileText,
  Download,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";

import { cn } from "@/lib/utils";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { Button } from "@/components/ui/button";

import { BiomedicalEquipmentDTO } from "@/types/biomedical";
import { RegisterEquipmentDrawer } from "./RegisterEquipmentDrawer";
import { biomedicalService } from "@/services/biomedical.service";
import { useSessionStore } from "@/stores/SessionStore";

export default function BiomedicalEquipmentsPage() {
  const t = useTranslations("BiomedicalEquipments");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [isRegisterDrawerOpen, setIsRegisterDrawerOpen] = useState(false);

  const { user } = useSessionStore();
  const providerId = user?.id?.toString() || "";

  const [equipments, setEquipments] = useState<BiomedicalEquipmentDTO[]>([]);

  const fetchEquipments = async () => {
    if (!providerId) return;
    setIsLoading(true);
    try {
      const data = await biomedicalService.listEquipments(providerId);
      setEquipments(data);
    } catch (error) {
      console.error(error);
      toast.error(t("toast_load_error"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipments();
  }, [providerId]);

  const handleEquipmentRegistered = () => {
    fetchEquipments();
  };

  const filteredEquipments = equipments.filter((eq) => {
    const query = searchQuery.toLowerCase();
    const matchSearch =
      eq.name.toLowerCase().includes(query) ||
      eq.serialNumber.toLowerCase().includes(query) ||
      (eq.internalCode && eq.internalCode.toLowerCase().includes(query));
    const matchStatus = filterStatus === "ALL" || eq.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleExportPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Inventario de Equipos Biomédicos", 14, 15);
    doc.setFontSize(10);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 22);

    const tableColumn = [
      t("th_equipment"),
      t("th_category"),
      t("th_manufacturer_model"),
      "Serie",
      t("th_status"),
    ];
    const tableRows = filteredEquipments.map((eq) => [
      eq.internalCode ? `${eq.name} (${eq.internalCode})` : eq.name,
      eq.categoryName || t("not_available"),
      `${eq.manufacturer || t("not_available")} / ${eq.model || t("not_available")}`,
      eq.serialNumber,
      eq.status,
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
    });

    doc.save("inventario-biomedico.pdf");
  };

  const handleExportExcel = () => {
    const wsData = filteredEquipments.map((eq) => ({
      "Código Interno": eq.internalCode || t("not_available"),
      Nombre: eq.name,
      Categoría: eq.categoryName || t("not_available"),
      Fabricante: eq.manufacturer || t("not_available"),
      Modelo: eq.model || t("not_available"),
      "Número de Serie": eq.serialNumber,
      Estado: eq.status,
      "Vida Útil (Años)": eq.usefulLifeYears || t("not_available"),
    }));

    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inventario");
    XLSX.writeFile(wb, "inventario-biomedico.xlsx");
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] font-sans text-gray-900 dark:text-white selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500 pb-24">
      <div className="max-w-7xl mx-auto px-6 py-10 sm:py-12 space-y-8">
        
        {/* ── HEADER ────────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 dark:border-gray-800 pb-8">
          <div className="flex items-center gap-5">
            <Button
              variant="outline"
              onClick={() => router.push("/provider/dashboard/biomedical")}
              className="w-14 h-14 p-0 rounded-2xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] hover:bg-gray-50 dark:hover:bg-[#111] text-emerald-600 dark:text-emerald-400 shadow-sm shrink-0 flex items-center justify-center"
            >
              <Activity className="w-7 h-7" strokeWidth={2} />
            </Button>
            <div>
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-400 px-3 py-1 text-xs font-bold shadow-sm">
                <span>{t("subtitle")}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                {t("title")}
              </h1>
            </div>
          </div>

          <div className="flex gap-2.5 shrink-0 flex-wrap">
            <Button
              variant="outline"
              onClick={handleExportPdf}
              className="rounded-xl border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#111] text-xs font-bold transition-all h-11 px-4 shadow-sm flex items-center gap-2"
            >
              <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
              <span>{t("btn_export_pdf")}</span>
            </Button>

            <Button
              variant="outline"
              onClick={handleExportExcel}
              className="rounded-xl border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#111] text-xs font-bold transition-all h-11 px-4 shadow-sm flex items-center gap-2"
            >
              <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
              <span>{t("btn_export_excel")}</span>
            </Button>

            <Button
              onClick={() => setIsRegisterDrawerOpen(true)}
              className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 h-11 px-5 text-xs font-bold transition-all shadow-sm border-0 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" strokeWidth={2} />
              <span>{t("btn_register")}</span>
            </Button>
          </div>
        </div>

        {/* ── FILTROS Y BÚSQUEDA ────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-4 rounded-3xl shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={2} />
            <input
              placeholder={t("search_placeholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-11 pr-4 rounded-xl bg-gray-50/50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-gray-400 placeholder:font-medium"
            />
          </div>

          <div className="flex bg-gray-50/50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 rounded-xl p-1 gap-1">
            <button
              onClick={() => setFilterStatus("ALL")}
              className={cn(
                "px-4 h-9 flex items-center justify-center rounded-lg transition-all text-xs font-bold",
                filterStatus === "ALL"
                  ? "bg-white dark:bg-[#0a0a0a] text-emerald-600 dark:text-emerald-400 shadow-sm border border-gray-100 dark:border-gray-800"
                  : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              {t("filter_all")}
            </button>
            <button
              onClick={() => setFilterStatus("ACTIVE")}
              className={cn(
                "px-4 h-9 flex items-center justify-center rounded-lg transition-all text-xs font-bold gap-1.5",
                filterStatus === "ACTIVE"
                  ? "bg-white dark:bg-[#0a0a0a] text-emerald-600 dark:text-emerald-400 shadow-sm border border-gray-100 dark:border-gray-800"
                  : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              <ShieldCheck className="w-3.5 h-3.5" strokeWidth={2} />
              <span>{t("filter_active")}</span>
            </button>
            <button
              onClick={() => setFilterStatus("OUT_OF_SERVICE")}
              className={cn(
                "px-4 h-9 flex items-center justify-center rounded-lg transition-all text-xs font-bold gap-1.5",
                filterStatus === "OUT_OF_SERVICE"
                  ? "bg-white dark:bg-[#0a0a0a] text-rose-600 dark:text-rose-400 shadow-sm border border-gray-100 dark:border-gray-800"
                  : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              <AlertTriangle className="w-3.5 h-3.5" strokeWidth={2} />
              <span>{t("filter_out_of_service")}</span>
            </button>
          </div>
        </div>

        {/* ── TABLA DE DATOS ────────────────────────────────────────────── */}
        <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 flex flex-col rounded-3xl shadow-sm overflow-hidden min-h-[400px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center flex-1 min-h-[400px] gap-4 bg-white dark:bg-[#0a0a0a]">
              <QhSpinner size="lg" />
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 animate-pulse">
                {t("loading")}
              </p>
            </div>
          ) : filteredEquipments.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 min-h-[400px] text-center p-8">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 shadow-sm">
                <Activity className="w-7 h-7" strokeWidth={2} />
              </div>
              <p className="text-base font-bold text-gray-900 dark:text-white mb-1">
                {t("empty_title")}
              </p>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed">
                {t("empty_desc")}
              </p>
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 dark:bg-[#050505] border-b border-gray-100 dark:border-gray-800">
                    <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      {t("th_equipment")}
                    </th>
                    <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      {t("th_category")}
                    </th>
                    <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      {t("th_manufacturer_model")}
                    </th>
                    <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      {t("th_status")}
                    </th>
                    <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      {t("th_risk")}
                    </th>
                    <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-wider text-gray-400 text-right">
                      {t("th_actions")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
                  {filteredEquipments.map((eq) => (
                    <tr
                      key={eq.id}
                      className="hover:bg-gray-50/50 dark:hover:bg-[#111]/50 transition-colors group"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 flex items-center justify-center shrink-0">
                            <Activity className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" strokeWidth={2} />
                          </div>
                          <div>
                            <span className="block text-xs font-bold text-gray-900 dark:text-white">
                              {eq.name}
                            </span>
                            <span className="block text-[10px] font-mono text-gray-400">
                              {eq.internalCode || eq.serialNumber}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6 text-xs font-bold text-gray-700 dark:text-gray-300">
                        {eq.categoryName || t("not_available")}
                      </td>

                      <td className="py-4 px-6">
                        <span className="block text-xs font-bold text-gray-900 dark:text-white">
                          {eq.manufacturer}
                        </span>
                        <span className="block text-[10px] font-medium text-gray-400">
                          {eq.model}
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        {eq.status === "AVAILABLE" && (
                          <span className="inline-flex px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/40 text-[10px] font-bold shadow-sm">
                            {t("status_available")}
                          </span>
                        )}
                        {eq.status === "ACTIVE" && (
                          <span className="inline-flex px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40 text-[10px] font-bold shadow-sm">
                            {t("status_active")}
                          </span>
                        )}
                        {eq.status === "OUT_OF_SERVICE" && (
                          <span className="inline-flex px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/40 text-[10px] font-bold shadow-sm">
                            {t("status_out_of_service")}
                          </span>
                        )}
                        {eq.status === "IN_MAINTENANCE" && (
                          <span className="inline-flex px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/40 text-[10px] font-bold shadow-sm">
                            {t("status_in_maintenance")}
                          </span>
                        )}
                        {eq.status === "DECOMMISSIONED" && (
                          <span className="inline-flex px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 text-[10px] font-bold shadow-sm">
                            {t("status_decommissioned")}
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-6">
                        {eq.riskLevel === "LOW" && (
                          <span className="text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                            {t("risk_low")}
                          </span>
                        )}
                        {eq.riskLevel === "MEDIUM" && (
                          <span className="text-amber-600 dark:text-amber-400 text-xs font-bold">
                            {t("risk_medium")}
                          </span>
                        )}
                        {eq.riskLevel === "HIGH" && (
                          <span className="text-rose-600 dark:text-rose-400 text-xs font-bold">
                            {t("risk_high")}
                          </span>
                        )}
                        {!eq.riskLevel && (
                          <span className="text-gray-400 text-xs font-bold">
                            {t("not_available")}
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            onClick={() =>
                              router.push(
                                `/provider/dashboard/biomedical/equipments/${eq.id}`
                              )
                            }
                            className="w-8 h-8 p-0 rounded-lg text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                          >
                            <FileText className="w-4 h-4" strokeWidth={2} />
                          </Button>
                          <Button
                            variant="ghost"
                            className="w-8 h-8 p-0 rounded-lg text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                          >
                            <Settings className="w-4 h-4" strokeWidth={2} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* ── DRAWER REGISTRO ───────────────────────────────────────────── */}
      <RegisterEquipmentDrawer
        open={isRegisterDrawerOpen}
        onOpenChange={setIsRegisterDrawerOpen}
        onSuccess={handleEquipmentRegistered}
      />
    </div>
  );
}