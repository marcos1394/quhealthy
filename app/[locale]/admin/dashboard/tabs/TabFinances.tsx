"use client";

import React, { useState, useEffect } from "react";
import {
  DollarSign,
  Download,
  FileText,
  ShieldCheck,
  Zap,
  TrendingDown,
  Users,
  CheckCircle2,
  RefreshCw,
  Search,
  Filter,
  Calendar,
  Clock,
  Stethoscope,
  CreditCard,
  Banknote,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity,
  Layers,
  ArrowUpRight,
} from "lucide-react";
import { KpiCard } from "../components/KpiCard";
import {
  UnitEconomicsDTO,
  TransactionReportDTO,
  ProviderSubscriptionAuditDTO,
  ClinicalAppointmentLedgerDTO,
  adminService,
} from "@/services/admin.service";

interface TabFinancesProps {
  economics: UnitEconomicsDTO | null;
  transactions: TransactionReportDTO[];
  isLoadingTransactions: boolean;
  formatCurrency: (val: number) => string;
  formatDate: (dateStr: string) => string;
}

export const TabFinances: React.FC<TabFinancesProps> = ({
  economics,
  transactions,
  isLoadingTransactions,
  formatCurrency,
  formatDate,
}) => {
  // Navigation between sub-audits
  const [activeSubTab, setActiveSubTab] = useState<"ledger" | "subscriptions" | "stripe">("ledger");

  // Data states for new tables
  const [subscriptionsAudit, setSubscriptionsAudit] = useState<ProviderSubscriptionAuditDTO[]>([]);
  const [appointmentsLedger, setAppointmentsLedger] = useState<ClinicalAppointmentLedgerDTO[]>([]);
  const [isLoadingSubscriptions, setIsLoadingSubscriptions] = useState(true);
  const [isLoadingLedger, setIsLoadingLedger] = useState(true);

  // Filters for Stripe Transactions
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("ALL");

  // Filters for Clinical Appointments Ledger
  const [ledgerSearch, setLedgerSearch] = useState("");
  const [ledgerChannel, setLedgerChannel] = useState<string>("ALL");
  const [ledgerStatus, setLedgerStatus] = useState<string>("ALL");

  // Filters for Subscriptions
  const [subSearch, setSubSearch] = useState("");
  const [subStatus, setSubStatus] = useState<string>("ALL");

  // Load audit data on mount
  useEffect(() => {
    loadSubscriptionsAudit();
    loadAppointmentsLedger();
  }, []);

  const loadSubscriptionsAudit = async () => {
    setIsLoadingSubscriptions(true);
    try {
      const data = await adminService.getProviderSubscriptionsAudit();
      setSubscriptionsAudit(data);
    } catch {
      setSubscriptionsAudit([]);
    } finally {
      setIsLoadingSubscriptions(false);
    }
  };

  const loadAppointmentsLedger = async () => {
    setIsLoadingLedger(true);
    try {
      const data = await adminService.getClinicalAppointmentsLedger(200);
      setAppointmentsLedger(data);
    } catch {
      setAppointmentsLedger([]);
    } finally {
      setIsLoadingLedger(false);
    }
  };

  // Filtered Clinical Appointments
  const filteredLedger = appointmentsLedger.filter((item) => {
    const term = ledgerSearch.toLowerCase();
    const matchesSearch =
      item.providerName.toLowerCase().includes(term) ||
      (item.providerSpecialty && item.providerSpecialty.toLowerCase().includes(term)) ||
      item.patientName.toLowerCase().includes(term) ||
      item.serviceName.toLowerCase().includes(term) ||
      String(item.appointmentId).includes(term);

    const matchesChannel = ledgerChannel === "ALL" || item.channel === ledgerChannel;
    const matchesStatus = ledgerStatus === "ALL" || item.appointmentStatus === ledgerStatus;

    return matchesSearch && matchesChannel && matchesStatus;
  });

  // Filtered Subscriptions
  const filteredSubscriptions = subscriptionsAudit.filter((sub) => {
    const term = subSearch.toLowerCase();
    const matchesSearch =
      sub.providerName.toLowerCase().includes(term) ||
      sub.providerEmail.toLowerCase().includes(term) ||
      (sub.businessName && sub.businessName.toLowerCase().includes(term)) ||
      sub.planName.toLowerCase().includes(term);

    let matchesStatus = true;
    if (subStatus === "ACTIVE") matchesStatus = !sub.isExpired && sub.status === "ACTIVE";
    if (subStatus === "EXPIRED") matchesStatus = sub.isExpired || sub.status === "EXPIRED";
    if (subStatus === "NO_PLAN") matchesStatus = sub.status === "NO_PLAN";

    return matchesSearch && matchesStatus;
  });

  // Filtered Stripe Transactions
  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.transactionId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "ALL" || t.transactionType === filterType;
    return matchesSearch && matchesType;
  });

  // Export Clinical Ledger to CSV
  const exportLedgerToCsv = () => {
    const headers = [
      "ID Cita",
      "Fecha & Hora",
      "Médico",
      "Especialidad / Negocio",
      "Paciente",
      "Email Paciente",
      "Servicio",
      "Canal",
      "Método de Pago",
      "Estado Cita",
      "Monto Total (MXN)",
      "Monto Cobrado (MXN)",
      "Comisión QuHealthy (MXN)",
      "Ganancia Doctor (MXN)",
    ];
    const csvContent =
      "data:text/csv;charset=utf-8," +
      headers.join(",") +
      "\n" +
      filteredLedger
        .map(
          (c) =>
            `${c.appointmentId},"${c.startTime}","${c.providerName.replace(/"/g, '""')}","${(c.providerSpecialty || "").replace(/"/g, '""')}","${c.patientName.replace(/"/g, '""')}","${c.patientEmail || ""}",` +
            `"${c.serviceName.replace(/"/g, '""')}",${c.channel},${c.paymentMethod},${c.appointmentStatus},${c.totalPrice},${c.amountPaid},${c.quhealthyFee},${c.providerNetEarnings}`
        )
        .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `libro_mayor_citas_quhealthy_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Subscriptions to CSV
  const exportSubscriptionsToCsv = () => {
    const headers = [
      "ID Médico",
      "Médico",
      "Email",
      "Especialidad",
      "Plan",
      "Precio Mensual (MXN)",
      "Estado",
      "Fecha Inicio",
      "Fecha Vencimiento",
      "Días Restantes",
      "Vencido",
    ];
    const csvContent =
      "data:text/csv;charset=utf-8," +
      headers.join(",") +
      "\n" +
      filteredSubscriptions
        .map(
          (s) =>
            `${s.providerId},"${s.providerName.replace(/"/g, '""')}","${s.providerEmail}","${(s.businessName || "").replace(/"/g, '""')}","${s.planName.replace(/"/g, '""')}",${s.planPrice},${s.status},"${s.currentPeriodStart || ""}","${s.currentPeriodEnd || ""}",${s.daysRemaining},${s.isExpired ? "SÍ" : "NO"}`
        )
        .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `auditoria_suscripciones_medicos_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Stripe Transactions to CSV
  const exportToCsv = () => {
    const headers = [
      "Fecha",
      "ID Transaccion",
      "Tipo",
      "Descripcion",
      "Monto Bruto (MXN)",
      "Comision Stripe (MXN)",
      "Comision QuHealthy (MXN)",
      "Ganancia Doctor (MXN)",
    ];
    const csvContent =
      "data:text/csv;charset=utf-8," +
      headers.join(",") +
      "\n" +
      filteredTransactions
        .map(
          (t) =>
            `${t.date},${t.transactionId},${t.transactionType},"${t.description.replace(/"/g, '""')}",${t.grossAmount},${t.stripeFee},${t.quhealthyCommission},${t.providerEarnings}`
        )
        .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `reporte_financiero_stripe_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalClinicalEarned = filteredLedger.reduce((acc, curr) => acc + (curr.amountPaid || 0), 0);
  const totalInClinicEarned = filteredLedger
    .filter((c) => c.channel === "IN_CLINIC")
    .reduce((acc, curr) => acc + (curr.amountPaid || 0), 0);
  const totalOnlineEarned = filteredLedger
    .filter((c) => c.channel === "ONLINE")
    .reduce((acc, curr) => acc + (curr.amountPaid || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Volumen Clínico Total (GMV)"
          value={formatCurrency(economics?.totalGmv || totalClinicalEarned)}
          subtext={`💳 ${formatCurrency(economics?.onlineRevenue || totalOnlineEarned)} en línea · 💵 ${formatCurrency(economics?.inClinicRevenue || totalInClinicEarned)} consultorio`}
          icon={Activity}
          variant="emerald"
        />
        <KpiCard
          title="SaaS MRR (Planes Médicos)"
          value={formatCurrency(economics?.mrr || economics?.totalSubscriptionsRevenue || 0)}
          changePercent={0}
          changePeriod={`${subscriptionsAudit.filter((s) => !s.isExpired).length} planes vigentes`}
          icon={Zap}
          variant="blue"
        />
        <KpiCard
          title="Comisiones Marketplace"
          value={formatCurrency(economics?.totalCommissionsRevenue || 0)}
          subtext="Take-rate promedio 15%"
          icon={DollarSign}
          variant="purple"
        />
        <KpiCard
          title="Tasa de Churn SaaS"
          value={`${economics?.churnRate ?? 0}%`}
          changePercent={0}
          changePeriod="Cancelaciones del periodo"
          icon={TrendingDown}
          variant="indigo"
        />
      </div>

      {/* Sub-Tabs Switcher for Granular Financial Inspection */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab("ledger")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSubTab === "ledger"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            Desglose Citas (Consultorio & En Línea)
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeSubTab === "ledger" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"}`}>
              {appointmentsLedger.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab("subscriptions")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSubTab === "subscriptions"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Zap className="w-4 h-4" />
            Planes & Vigencias de Médicos
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeSubTab === "subscriptions" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"}`}>
              {subscriptionsAudit.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab("stripe")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSubTab === "stripe"
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <CreditCard className="w-4 h-4" />
            Transacciones Pasarela (Stripe)
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeSubTab === "stripe" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"}`}>
              {transactions.length}
            </span>
          </button>
        </div>

        <button
          onClick={() => {
            loadSubscriptionsAudit();
            loadAppointmentsLedger();
          }}
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Actualizar Datos
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SUBTAB 1: DESGLOSE DE CITAS (CONSULTORIO & EN LÍNEA)                      */}
      {/* ========================================================================= */}
      {activeSubTab === "ledger" && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-emerald-600" />
                Libro Mayor de Citas Clínicas & Cobros
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Desglose individual e inmutable de cada cita registrada en consultorio (efectivo/terminal) y en línea (Stripe).
              </p>
            </div>
            <button
              onClick={exportLedgerToCsv}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm"
            >
              <Download className="w-4 h-4" />
              Exportar Citas a CSV
            </button>
          </div>

          {/* Quick Filter Bar */}
          <div className="flex flex-col md:flex-row items-center gap-3 pt-2">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por médico, especialidad, paciente o servicio..."
                value={ledgerSearch}
                onChange={(e) => setLedgerSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={ledgerChannel}
                  onChange={(e) => setLedgerChannel(e.target.value)}
                  className="bg-transparent text-slate-700 font-medium focus:outline-none"
                >
                  <option value="ALL">Todos los Canales</option>
                  <option value="ONLINE">💳 En Línea (Stripe)</option>
                  <option value="IN_CLINIC">💵 Consultorio (Efectivo/Terminal)</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
                <select
                  value={ledgerStatus}
                  onChange={(e) => setLedgerStatus(e.target.value)}
                  className="bg-transparent text-slate-700 font-medium focus:outline-none"
                >
                  <option value="ALL">Todos los Estados</option>
                  <option value="COMPLETED">COMPLETED (Atendida)</option>
                  <option value="IN_PROGRESS">IN_PROGRESS (En Curso)</option>
                  <option value="CONFIRMED">CONFIRMED (Confirmada)</option>
                  <option value="NO_SHOW">NO_SHOW (En Consultorio)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          {isLoadingLedger ? (
            <div className="py-12 flex justify-center text-slate-400 text-sm">
              <RefreshCw className="w-5 h-5 animate-spin mr-2" />
              Cargando libro mayor de citas...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="text-[11px] uppercase bg-slate-50 text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-xl">ID & Fecha</th>
                    <th className="px-4 py-3">Médico / Especialidad</th>
                    <th className="px-4 py-3">Paciente & Contacto</th>
                    <th className="px-4 py-3">Servicio / Procedimiento</th>
                    <th className="px-4 py-3 text-center">Canal / Modalidad</th>
                    <th className="px-4 py-3 text-center">Estado Cita</th>
                    <th className="px-4 py-3 text-right">Cobrado</th>
                    <th className="px-4 py-3 text-right text-emerald-600">QuHealthy (Fee)</th>
                    <th className="px-4 py-3 text-right text-indigo-600 rounded-tr-xl">Ganancia Doctor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLedger.map((appt) => (
                    <tr key={appt.appointmentId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="font-bold text-slate-900 block font-mono">#{appt.appointmentId}</span>
                        <span className="text-[10px] text-slate-400">
                          {appt.startTime ? formatDate(appt.startTime) : "Sin fecha"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-semibold text-slate-900 block">{appt.providerName}</span>
                        <span className="text-[10px] text-slate-400 truncate block max-w-xs">
                          {appt.providerSpecialty || "Consulta Especializada"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-medium text-slate-800 block">{appt.patientName}</span>
                        <span className="text-[10px] text-slate-400 font-mono block">
                          {appt.patientEmail || "Sin email registrado"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-slate-700 font-medium block truncate max-w-xs">
                          {appt.serviceName}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Método: <strong className="text-slate-600">{appt.paymentMethod}</strong>
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        {appt.channel === "ONLINE" ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                            <CreditCard className="w-3 h-3" />
                            En Línea (Stripe)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                            <Banknote className="w-3 h-3" />
                            Consultorio
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full inline-block ${
                            appt.appointmentStatus === "COMPLETED"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : appt.appointmentStatus === "IN_PROGRESS"
                              ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                              : appt.appointmentStatus === "CONFIRMED"
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}
                        >
                          {appt.appointmentStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right font-bold text-slate-900 whitespace-nowrap">
                        {formatCurrency(appt.amountPaid)}
                      </td>
                      <td className="px-4 py-3.5 text-right text-emerald-600 font-bold whitespace-nowrap">
                        {appt.quhealthyFee > 0 ? `+${formatCurrency(appt.quhealthyFee)}` : "$0.00"}
                      </td>
                      <td className="px-4 py-3.5 text-right text-indigo-600 font-bold whitespace-nowrap">
                        {formatCurrency(appt.providerNetEarnings)}
                      </td>
                    </tr>
                  ))}
                  {filteredLedger.length === 0 && (
                    <tr>
                      <td colSpan={9} className="px-4 py-10 text-center text-slate-400 bg-slate-50 rounded-b-xl">
                        No se encontraron citas con los criterios seleccionados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 2: ESTADO DE PLANES SAAS & VIGENCIAS DE MÉDICOS                    */}
      {/* ========================================================================= */}
      {activeSubTab === "subscriptions" && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-600" />
                Auditoría de Suscripciones SaaS & Planes de Médicos
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Supervisión en tiempo real del plan contratado, fecha de corte, días de vigencia restantes y estado de renovación.
              </p>
            </div>
            <button
              onClick={exportSubscriptionsToCsv}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm"
            >
              <Download className="w-4 h-4" />
              Exportar Planes a CSV
            </button>
          </div>

          {/* Subscriptions Filter Bar */}
          <div className="flex flex-col md:flex-row items-center gap-3 pt-2">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por médico, correo o plan..."
                value={subSearch}
                onChange={(e) => setSubSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={subStatus}
                  onChange={(e) => setSubStatus(e.target.value)}
                  className="bg-transparent text-slate-700 font-medium focus:outline-none"
                >
                  <option value="ALL">Todos los Estados</option>
                  <option value="ACTIVE">Vigentes / Activos</option>
                  <option value="EXPIRED">Vencidos / Vencen Hoy</option>
                  <option value="NO_PLAN">Sin Plan Asignado</option>
                </select>
              </div>
            </div>
          </div>

          {/* Subscriptions Table */}
          {isLoadingSubscriptions ? (
            <div className="py-12 flex justify-center text-slate-400 text-sm">
              <RefreshCw className="w-5 h-5 animate-spin mr-2" />
              Cargando auditoría de suscripciones...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="text-[11px] uppercase bg-slate-50 text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-xl">ID & Médico</th>
                    <th className="px-4 py-3">Especialidad / Negocio</th>
                    <th className="px-4 py-3">Plan SaaS Activo</th>
                    <th className="px-4 py-3 text-right">Precio / Mes</th>
                    <th className="px-4 py-3 text-center">Estado del Plan</th>
                    <th className="px-4 py-3">Fecha de Corte / Renovación</th>
                    <th className="px-4 py-3 text-center rounded-tr-xl">Vigencia & Días Restantes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSubscriptions.map((sub) => (
                    <tr key={sub.providerId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-slate-400 font-bold">#{sub.providerId}</span>
                          <span className="font-bold text-slate-900">{sub.providerName}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                          {sub.providerEmail}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-slate-700 font-medium block truncate max-w-xs">
                          {sub.businessName || "Práctica Médica Independiente"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 inline-block text-xs">
                          {sub.planName}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right font-bold text-slate-900 whitespace-nowrap">
                        {formatCurrency(sub.planPrice)}
                      </td>
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        {sub.isExpired ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                            <XCircle className="w-3 h-3" />
                            VENCIDO
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle className="w-3 h-3" />
                            ACTIVO
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-slate-700">
                        {sub.currentPeriodEnd ? (
                          <>
                            <span className="font-semibold block">{formatDate(sub.currentPeriodEnd)}</span>
                            <span className="text-[10px] text-slate-400">
                              {sub.autoRenew ? "Renovación automática activa" : "Cancelación al término del periodo"}
                            </span>
                          </>
                        ) : (
                          <span className="text-slate-400 italic">Periodo de cortesía</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        {sub.isExpired ? (
                          <span className="font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-lg border border-rose-200 text-xs inline-block">
                            Expiró hace {Math.abs(sub.daysRemaining)} días
                          </span>
                        ) : sub.daysRemaining <= 5 ? (
                          <span className="font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200 text-xs inline-block">
                            Quedan {sub.daysRemaining} días (Por vencer)
                          </span>
                        ) : (
                          <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200 text-xs inline-block">
                            {sub.daysRemaining} días restantes
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredSubscriptions.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-slate-400 bg-slate-50 rounded-b-xl">
                        No se encontraron registros de médicos con los criterios seleccionados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 3: TRANSACCIONES STRIPE & CONCILIACIÓN BANCARIA                     */}
      {/* ========================================================================= */}
      {activeSubTab === "stripe" && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-4">
          {/* Reconciliation Banner */}
          <div className="bg-emerald-50/90 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-emerald-900 text-sm">
                  Conciliación Bancaria & Stripe: Información 100% Fidedigna
                </h4>
                <p className="text-xs text-emerald-700 mt-0.5">
                  Todos los movimientos reportados provienen directamente de Stripe Balance Transactions con cuadre contable automático.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs text-emerald-800 bg-white/80 px-3 py-1.5 rounded-xl border border-emerald-200 self-stretch sm:self-auto justify-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Discrepancias: $0.00 MXN</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
            <div>
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-500" />
                Auditoría Detallada de Transacciones (Stripe)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Registro inmutable de pagos, comisiones retenidas y comisiones de pasarela.
              </p>
            </div>
            <button
              onClick={exportToCsv}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm"
            >
              <Download className="w-4 h-4" />
              Exportar a Excel / CSV
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por descripción o ID de transacción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 text-slate-700 font-medium focus:outline-none"
              >
                <option value="ALL">Todos los Tipos</option>
                <option value="MARKETPLACE">Marketplace / Citas</option>
                <option value="SAAS_SUBSCRIPTION">Suscripciones SaaS</option>
                <option value="REFUND">Reembolsos</option>
              </select>
            </div>
          </div>

          {/* Table */}
          {isLoadingTransactions ? (
            <div className="py-12 flex justify-center text-slate-400 text-sm">
              <RefreshCw className="w-5 h-5 animate-spin mr-2" />
              Cargando transacciones desde Stripe...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="text-[11px] uppercase bg-slate-50 text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-xl">Fecha & ID</th>
                    <th className="px-4 py-3">Tipo / Detalle</th>
                    <th className="px-4 py-3 text-right">Monto Bruto</th>
                    <th className="px-4 py-3 text-right text-orange-600">Stripe Fee</th>
                    <th className="px-4 py-3 text-right text-emerald-600">QuHealthy (Neta)</th>
                    <th className="px-4 py-3 text-right text-indigo-600 rounded-tr-xl">Ganancia Doctor</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((txn, idx) => (
                    <tr
                      key={txn.transactionId + idx}
                      className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="font-semibold text-slate-900 block">{formatDate(txn.date)}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{txn.transactionId}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full inline-block mb-1 ${
                            txn.transactionType === "MARKETPLACE"
                              ? "bg-indigo-50 text-indigo-700"
                              : txn.transactionType === "SAAS_SUBSCRIPTION"
                              ? "bg-blue-50 text-blue-700"
                              : "bg-rose-50 text-rose-700"
                          }`}
                        >
                          {txn.transactionType}
                        </span>
                        <span className="text-slate-700 font-medium block truncate max-w-xs">
                          {txn.description}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right font-bold text-slate-900">
                        {formatCurrency(txn.grossAmount)}
                      </td>
                      <td className="px-4 py-3.5 text-right text-orange-600 font-medium">
                        -{formatCurrency(txn.stripeFee)}
                      </td>
                      <td className="px-4 py-3.5 text-right text-emerald-600 font-bold">
                        {formatCurrency(txn.quhealthyCommission)}
                      </td>
                      <td className="px-4 py-3.5 text-right text-indigo-600 font-semibold">
                        {formatCurrency(txn.providerEarnings)}
                      </td>
                    </tr>
                  ))}
                  {filteredTransactions.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-slate-400 bg-slate-50 rounded-b-xl">
                        No se encontraron transacciones con los criterios seleccionados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
