"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import {
  FileText,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  Send,
  Copy,
  ExternalLink,
  Trash2,
  TrendingUp,
  User,
  Activity,
  Layers,
  Sparkles,
  Phone,
  Mail,
  Receipt,
  FileSpreadsheet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  PatientClinicalBudgetDTO,
  PatientBudgetStatus,
} from "@/types/clinical-budget";
import { clinicalBudgetService } from "@/services/clinical-budget.service";
import { CreatePatientBudgetModal } from "@/components/finance/CreatePatientBudgetModal";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function PatientBudgetsPage() {
  const [budgets, setBudgets] = useState<PatientClinicalBudgetDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState<PatientBudgetStatus | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchBudgets = useCallback(async () => {
    try {
      setIsLoading(true);
      const statusParam = activeStatus === "ALL" ? undefined : activeStatus;
      const res = await clinicalBudgetService.getBudgets(statusParam, 0, 50);
      setBudgets(res.content || []);
    } catch (err) {
      console.error("Error al cargar cotizaciones:", err);
      toast.error("No se pudieron cargar las cotizaciones.");
    } finally {
      setIsLoading(false);
    }
  }, [activeStatus]);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  const handleCopyLink = (folio: string) => {
    const url = `${window.location.origin}/budget/${folio}`;
    navigator.clipboard.writeText(url);
    toast.success("Enlace copiado al portapapeles. Listo para enviar por WhatsApp o Email.");
  };

  const handleSendBudget = async (id: number) => {
    try {
      await clinicalBudgetService.sendBudget(id);
      toast.success("Cotización marcada como enviada.");
      fetchBudgets();
    } catch (err) {
      toast.error("No se pudo actualizar el estado de la cotización.");
    }
  };

  const handleDeleteBudget = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar esta cotización?")) return;
    try {
      await clinicalBudgetService.deleteBudget(id);
      toast.success("Cotización eliminada.");
      fetchBudgets();
    } catch (err) {
      toast.error("No se pudo eliminar la cotización.");
    }
  };

  const filteredBudgets = budgets.filter((b) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      b.folio.toLowerCase().includes(q) ||
      b.patientName.toLowerCase().includes(q) ||
      b.procedureName.toLowerCase().includes(q) ||
      (b.diagnosisCie10 && b.diagnosisCie10.toLowerCase().includes(q))
    );
  });

  // KPI Metrics
  const totalVolume = budgets.reduce((acc, b) => acc + (b.totalAmount || 0), 0);
  const acceptedCount = budgets.filter((b) => b.status === "ACCEPTED").length;
  const acceptedVolume = budgets
    .filter((b) => b.status === "ACCEPTED")
    .reduce((acc, b) => acc + (b.totalAmount || 0), 0);
  const conversionRate = budgets.length > 0 ? Math.round((acceptedCount / budgets.length) * 100) : 0;

  const getStatusBadge = (status: PatientBudgetStatus) => {
    switch (status) {
      case "DRAFT":
        return <Badge variant="outline" className="bg-gray-100 dark:bg-[#181818] text-gray-600 dark:text-gray-400 font-bold border-gray-200 dark:border-gray-800">Borrador</Badge>;
      case "SENT":
        return <Badge className="bg-cyan-50 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 font-bold">Enviado</Badge>;
      case "ACCEPTED":
        return <Badge className="bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold">✓ Aceptado</Badge>;
      case "REJECTED":
        return <Badge className="bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 font-bold">Rechazado</Badge>;
      case "EXPIRED":
        return <Badge className="bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-bold">Vencido</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="p-6 sm:p-10 space-y-8 font-sans max-w-7xl mx-auto">
      {/* ── HEADER DE PÁGINA ───────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-extrabold uppercase tracking-wider">
            <FileSpreadsheet className="w-4 h-4" />
            <span>Atención al Paciente & Cotizaciones</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            Presupuestos y Cotizaciones a Pacientes
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-2xl">
            Genera cotizaciones formales para cirugías y planes de tratamiento con desglose de honorarios, compártelas con tus pacientes por WhatsApp o correo y recibe su firma de aceptación digital.
          </p>
        </div>

        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="h-11 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 gap-2 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Cotización / Presupuesto</span>
        </Button>
      </div>

      {/* ── KPI METRICS CARDS ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-[#0c0c0c] border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-2">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
            Cotizaciones Emitidas
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black font-mono text-gray-900 dark:text-white">
              {budgets.length}
            </span>
            <span className="text-xs text-gray-400">Total pacientes</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#0c0c0c] border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-2">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
            Monto Total Cotizado
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black font-mono text-gray-900 dark:text-white">
              ${totalVolume.toLocaleString("es-MX", { minimumFractionDigits: 0 })}
            </span>
            <span className="text-[10px] text-gray-400 font-mono">MXN</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#0c0c0c] border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-2">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
            Tratamientos Aceptados
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
              ${acceptedVolume.toLocaleString("es-MX", { minimumFractionDigits: 0 })}
            </span>
            <span className="text-[10px] text-emerald-600 font-bold">{acceptedCount} cerrados</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#0c0c0c] border border-gray-200/80 dark:border-gray-800 shadow-xs space-y-2">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
            Tasa de Conversión
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black font-mono text-teal-600 dark:text-teal-400">
              {conversionRate}%
            </span>
            <span className="text-xs text-teal-600 font-bold">Aceptación</span>
          </div>
        </div>
      </div>

      {/* ── FILTROS Y BÚSQUEDA ──────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {[
            { id: "ALL", label: "Todos" },
            { id: "DRAFT", label: "Borradores" },
            { id: "SENT", label: "Enviados" },
            { id: "ACCEPTED", label: "Aceptados" },
            { id: "REJECTED", label: "Rechazados" },
            { id: "EXPIRED", label: "Vencidos" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveStatus(tab.id as any)}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap",
                activeStatus === tab.id
                  ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-xs"
                  : "bg-white dark:bg-[#121212] text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1a1a1a] border border-gray-200/80 dark:border-gray-800"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar por folio, paciente o procedimiento..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 rounded-xl text-xs bg-white dark:bg-[#101010]"
          />
        </div>
      </div>

      {/* ── LISTADO DE COTIZACIONES ─────────────────────────────────── */}
      <div className="rounded-3xl bg-white dark:bg-[#0c0c0c] border border-gray-200/80 dark:border-gray-800 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-400 text-xs font-bold space-y-2">
            <div className="w-8 h-8 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin mx-auto" />
            <p>Cargando cotizaciones...</p>
          </div>
        ) : filteredBudgets.length > 0 ? (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {filteredBudgets.map((b) => (
              <div
                key={b.id}
                className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-gray-50/60 dark:hover:bg-[#111] transition-colors"
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-bold text-xs text-gray-900 dark:text-white bg-gray-100 dark:bg-[#181818] px-2.5 py-0.5 rounded-md border border-gray-200 dark:border-gray-700">
                      {b.folio}
                    </span>
                    {getStatusBadge(b.status)}
                    {b.diagnosisCie10 && (
                      <span className="text-[10px] font-mono text-gray-400 uppercase">
                        CIE-10: {b.diagnosisCie10}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-extrabold text-gray-900 dark:text-white tracking-tight">
                    {b.procedureName}
                  </h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 font-medium">
                    <span className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-gray-400" />
                      <span>{b.patientName}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      <span>Vigencia: {b.validUntil}</span>
                    </span>
                    <span>•</span>
                    <span>{b.items.length} conceptos</span>
                  </div>
                </div>

                <div className="flex items-center justify-between lg:justify-end gap-6 pt-3 lg:pt-0 border-t lg:border-t-0 border-gray-100 dark:border-gray-800">
                  <div className="text-left lg:text-right">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                      Total Cotizado
                    </span>
                    <span className="text-xl font-black font-mono text-gray-900 dark:text-white">
                      ${b.totalAmount.toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopyLink(b.folio)}
                      title="Copiar enlace para el paciente"
                      className="h-9 px-3 rounded-xl border-gray-200 dark:border-gray-800 text-xs font-bold gap-1.5 cursor-pointer hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/40"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Copiar Link</span>
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      asChild
                      className="h-9 w-9 p-0 rounded-xl border-gray-200 dark:border-gray-800 cursor-pointer"
                    >
                      <a href={`/budget/${b.folio}`} target="_blank" rel="noreferrer" title="Abrir vista del paciente">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </Button>

                    {b.status === "DRAFT" && (
                      <Button
                        size="sm"
                        onClick={() => handleSendBudget(b.id)}
                        className="h-9 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold gap-1.5 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Enviar</span>
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteBudget(b.id)}
                      className="h-9 w-9 p-0 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-16 text-center space-y-4">
            <FileSpreadsheet className="w-12 h-12 stroke-1 text-gray-300 dark:text-gray-700 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
                No hay cotizaciones en esta vista
              </h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Crea una nueva cotización quirúrgica o médica para tus pacientes con desglose de honorarios e insumos.
              </p>
            </div>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
            >
              Crear Nueva Cotización
            </Button>
          </div>
        )}
      </div>

      {/* ── MODAL DE CREACIÓN ───────────────────────────────────────── */}
      <CreatePatientBudgetModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchBudgets}
      />
    </div>
  );
}
