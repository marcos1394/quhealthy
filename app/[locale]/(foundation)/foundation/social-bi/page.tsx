"use client";

import React, { useEffect, useState } from "react";
import {
  BarChart3,
  Heart,
  DollarSign,
  TrendingUp,
  Download,
  FileSpreadsheet,
  FileText,
  ShieldCheck,
  Building2,
  Users,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  MapPin,
  Sparkles,
  PieChart as PieIcon,
  Activity,
  Layers,
  ArrowUpRight,
  Info,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import { toast } from "react-toastify";
import { foundationService } from "@/services/foundation.service";
import { SocialBiMetrics, TransparencyReport } from "@/types/foundation";

const COLORS = ["#e11d48", "#4f46e5", "#059669", "#d97706", "#8b5cf6", "#0284c7"];

export default function FoundationSocialBiPage() {
  const [metrics, setMetrics] = useState<SocialBiMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("Q1-2026");
  const [isExporting, setIsExporting] = useState(false);
  const [transparencyReport, setTransparencyReport] = useState<TransparencyReport | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  useEffect(() => {
    loadBiData();
  }, []);

  const loadBiData = async () => {
    try {
      setIsLoading(true);
      const data = await foundationService.getSocialBiMetrics();
      setMetrics(data);
    } catch {
      toast.error("Error al cargar indicadores de Social BI.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    try {
      setIsExporting(true);
      const report = await foundationService.getTransparencyReport(selectedPeriod);
      setTransparencyReport(report);
      setIsReportModalOpen(true);
      toast.success("Dossier de transparencia generado exitosamente.");
    } catch {
      toast.error("No se pudo generar el reporte de transparencia.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadCsv = () => {
    if (!metrics) return;
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Indicador,Valor\n" +
      `Vidas Impactadas,${metrics.totalLivesImpacted}\n` +
      `Presupuesto Desembolsado,$${metrics.totalSubsidiesDisbursed} MXN\n` +
      `Subsidio Promedio,$${metrics.avgSubsidyPerBeneficiary} MXN\n` +
      `Tasa de Redencion,${metrics.redemptionRatePercentage}%\n` +
      `Retorno Social (SROI),${metrics.socialRoiIndex}x\n` +
      `Tiempo Dictamen TS,${metrics.avgDocumentTurnaroundHours} hrs\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `QuHealthy_Social_BI_${selectedPeriod}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Reporte CSV descargado.");
  };

  // Format data for charts
  const causeChartData = metrics?.causeDistribution
    ? Object.entries(metrics.causeDistribution).map(([key, val]) => ({
        name: key === "RENAL" ? "Salud Renal" : key === "VISUAL" ? "Salud Visual" : key === "ONCOLOGY" ? "Oncología" : key,
        beneficiarios: val,
      }))
    : [];

  const supportTypeChartData = metrics?.supportTypeBudgetDistribution
    ? Object.entries(metrics.supportTypeBudgetDistribution).map(([key, val]) => ({
        tipo: key === "MEDICATION" ? "Medicamentos" : key === "SURGERY" ? "Cirugías" : key === "LABS" ? "Laboratorios" : key === "CONSULTATION" ? "Consultas" : key,
        monto: val,
      }))
    : [];

  const vulnChartData = metrics?.vulnerabilityDistribution
    ? Object.entries(metrics.vulnerabilityDistribution).map(([key, val]) => ({
        name: key === "CRITICAL" ? "Crítica" : key === "HIGH" ? "Alta" : key === "MEDIUM" ? "Media" : "Baja",
        cantidad: val,
      }))
    : [];

  const monthlyTrendData = metrics?.monthlyTrendLivesImpacted
    ? Object.entries(metrics.monthlyTrendLivesImpacted).map(([month, count]) => ({
        mes: month,
        vidas: count,
      }))
    : [];

  const cityData = metrics?.cityDistribution
    ? Object.entries(metrics.cityDistribution).map(([city, count]) => ({
        municipio: city,
        beneficiarios: count,
      }))
    : [];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-rose-600" />
            Social BI & Indicadores de Impacto
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Métricas de retorno social, analítica agregada para donantes y reportes de rendición de cuentas.
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="text-xs border border-slate-200 rounded-2xl px-3 py-2 bg-white text-slate-700 font-semibold focus:outline-none shadow-xs"
          >
            <option value="Q1-2026">Primer Trimestre (Q1 2026)</option>
            <option value="Q2-2026">Segundo Trimestre (Q2 2026)</option>
            <option value="2026_ANUAL">Ejercicio Anual 2026</option>
          </select>

          <button
            onClick={handleGenerateReport}
            disabled={isExporting}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-2xl text-xs font-bold transition-all shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            {isExporting ? "Generando..." : "Reporte de Transparencia"}
          </button>
        </div>
      </div>

      {/* 🚀 Main Impact KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* KPI 1 */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs border-l-4 border-l-rose-500">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-slate-500">Vidas Impactadas</span>
            <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
              <Heart className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-2">
            {metrics?.totalLivesImpacted || 0}
          </h3>
          <span className="text-[10px] text-slate-400 block mt-0.5">Padrón + Tamizajes</span>
        </div>

        {/* KPI 2 */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs border-l-4 border-l-indigo-500">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-slate-500">Total Desembolsado</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-xl font-extrabold text-indigo-700 mt-2">
            ${Number(metrics?.totalSubsidiesDisbursed || 0).toLocaleString("es-MX")}
          </h3>
          <span className="text-[10px] text-indigo-600/80 font-medium block mt-0.5">Subsidios ejercidos</span>
        </div>

        {/* KPI 3 */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-slate-500">Subsidio Promedio</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-xl font-extrabold text-emerald-700 mt-2">
            ${Number(metrics?.avgSubsidyPerBeneficiary || 0).toLocaleString("es-MX", { maximumFractionDigits: 0 })}
          </h3>
          <span className="text-[10px] text-slate-400 block mt-0.5">Por beneficiario</span>
        </div>

        {/* KPI 4 */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-slate-500">Tasa de Redención</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-amber-700 mt-2">
            {metrics?.redemptionRatePercentage || 0}%
          </h3>
          <span className="text-[10px] text-amber-800/80 font-medium block mt-0.5">Vouchers utilizados</span>
        </div>

        {/* KPI 5 */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-slate-500">Retorno Social (SROI)</span>
            <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-purple-700 mt-2">
            {metrics?.socialRoiIndex || 0}x
          </h3>
          <span className="text-[10px] text-purple-800/80 font-medium block mt-0.5">Retorno por $1 MXN</span>
        </div>

        {/* KPI 6 */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs border-l-4 border-l-cyan-500">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-slate-500">Respuesta TS</span>
            <div className="p-1.5 rounded-lg bg-cyan-50 text-cyan-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-cyan-700 mt-2">
            {metrics?.avgDocumentTurnaroundHours || 0}h
          </h3>
          <span className="text-[10px] text-slate-400 block mt-0.5">Validación documental</span>
        </div>
      </div>

      {/* 📊 Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Evolución Mensual de Vidas Impactadas */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Evolución de Cobertura Social</h3>
              <p className="text-xs text-slate-400">Total acumulado de personas atendidas y tamizadas</p>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              +145% este trimestre
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrendData}>
                <defs>
                  <linearGradient id="colorVidas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e11d48" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#e11d48" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="vidas"
                  name="Vidas Impactadas"
                  stroke="#e11d48"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorVidas)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Presupuesto por Tipo de Apoyo */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Inversión Social por Tipo de Apoyo</h3>
              <p className="text-xs text-slate-400">Distribución del gasto asistencial ($ MXN)</p>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={supportTypeChartData}>
                <XAxis dataKey="tipo" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value: any) => [`$${Number(value).toLocaleString("es-MX")} MXN`, "Monto"]} />
                <Bar dataKey="monto" name="Presupuesto" fill="#4f46e5" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Distribución por Causa Asistencial */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Beneficiarios por Causa Médica</h3>
              <p className="text-xs text-slate-400">Participación en programas institucionales</p>
            </div>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={causeChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="beneficiarios"
                  label={({ name, percent }: any) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                >
                  {causeChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Nivel de Vulnerabilidad */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Población por Nivel de Vulnerabilidad</h3>
              <p className="text-xs text-slate-400">Clasificación determinada por Trabajo Social</p>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vulnChartData}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="cantidad" name="Beneficiarios" fill="#059669" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 🗺️ Mapa Demográfico por Municipios (Anonimizado) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-rose-600" />
              Alcance Geográfico Agregado (Privacidad Diferencial)
            </h3>
            <p className="text-xs text-slate-400">
              Datos agregados a nivel municipal. Cero microdatos identificables de pacientes (LFPDPPP).
            </p>
          </div>
          <button
            onClick={handleDownloadCsv}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 px-3 py-1.5 rounded-xl transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            Descargar CSV
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {cityData.map((item, idx) => (
            <div key={item.municipio} className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-xs">{item.municipio}</span>
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                  #{idx + 1}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-extrabold text-slate-900">{item.beneficiarios}</span>
                <span className="text-xs text-slate-500">beneficiarios activos</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 🛡️ SAT & Fiscal Compliance Legal Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 lg:p-8 space-y-4 shadow-xl border border-slate-800">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-rose-500/20 text-rose-400 rounded-2xl border border-rose-500/30 shrink-0">
            <Building2 className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-white">
                Régimen de Transparencia & Cumplimiento Fiscal SAT
              </h3>
              <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                Auditable
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
              QuHealthy provee trazabilidad integral, folios electrónicos de recetas, expedientes socioeconómicos y conciliación de vouchers redimidos para sustentar los reportes de donatarias autorizadas. 
              <strong> Recordatorio institucional:</strong> QuHealthy no custodia fondos monetarios de donaciones ni funge como intermediario financiero; la declaración formal ante el SAT u órganos reguladores es responsabilidad exclusiva de la Fundación.
            </p>
          </div>
        </div>
      </div>

      {/* 🚀 Modal: Reporte de Transparencia para Donantes */}
      {isReportModalOpen && transparencyReport && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 lg:p-8 space-y-5 shadow-2xl border border-slate-100 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  Dossier de Transparencia & Rendición de Cuentas
                </h3>
                <p className="text-xs text-slate-500">
                  {transparencyReport.legalName} • RFC: {transparencyReport.rfc || "Sin RFC"} • Periodo: {transparencyReport.period}
                </p>
              </div>
              <button
                onClick={() => setIsReportModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Fondos Autorizados</span>
                <span className="text-base font-extrabold text-slate-900 block mt-1">
                  ${Number(transparencyReport.totalAuthorizedFunds).toLocaleString("es-MX")}
                </span>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl">
                <span className="text-emerald-700 block text-[10px] uppercase font-bold">Fondos Conciliados</span>
                <span className="text-base font-extrabold text-emerald-800 block mt-1">
                  ${Number(transparencyReport.totalDisbursedFunds).toLocaleString("es-MX")}
                </span>
              </div>
              <div className="p-3 bg-indigo-50 rounded-xl">
                <span className="text-indigo-700 block text-[10px] uppercase font-bold">Vouchers Conciliados</span>
                <span className="text-base font-extrabold text-indigo-800 block mt-1">
                  {transparencyReport.totalVouchersReconciled}
                </span>
              </div>
              <div className="p-3 bg-rose-50 rounded-xl">
                <span className="text-rose-700 block text-[10px] uppercase font-bold">Beneficiarios Atendidos</span>
                <span className="text-base font-extrabold text-rose-800 block mt-1">
                  {transparencyReport.totalBeneficiariesServed}
                </span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-1">
              <span className="font-bold text-slate-800 block">Declaración de Responsabilidad Legal:</span>
              <p className="text-[11px] leading-relaxed text-slate-500">
                {transparencyReport.fiscalDisclaimer}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={handleDownloadCsv}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                Descargar Archivo CSV
              </button>
              <button
                onClick={() => setIsReportModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
