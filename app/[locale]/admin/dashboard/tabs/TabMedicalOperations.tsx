"use client";

import React, { useState } from "react";
import {
  CalendarCheck,
  Users,
  Activity,
  UserCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Shield,
  Search,
  Filter,
  RefreshCw,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { toast } from "react-toastify";
import { KpiCard } from "../components/KpiCard";
import {
  AdminDashboardDTO,
  ProviderAdminDTO,
  adminService,
} from "@/services/admin.service";

interface TabMedicalOperationsProps {
  dashboard: AdminDashboardDTO | null;
  providers: ProviderAdminDTO[];
  onRefreshProviders: () => void;
}

export const TabMedicalOperations: React.FC<TabMedicalOperationsProps> = ({
  dashboard,
  providers,
  onRefreshProviders,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [processingId, setProcessingId] = useState<number | null>(null);

  const filteredProviders = providers.filter((p) => {
    const matchesSearch =
      p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.licenseNumber && p.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      filterStatus === "ALL" ||
      (filterStatus === "PENDING" && (!p.onboardingComplete || p.status === "INACTIVE")) ||
      (filterStatus === "ACTIVE" && p.status === "ACTIVE") ||
      (filterStatus === "SUSPENDED" && p.status === "SUSPENDED");

    return matchesSearch && matchesStatus;
  });

  const handleForceApprove = async (providerId: number) => {
    try {
      setProcessingId(providerId);
      await adminService.forceApproveKYC(providerId);
      toast.success("Cédula y KYC aprobados exitosamente.");
      onRefreshProviders();
    } catch {
      toast.error("Error al aprobar KYC.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleFixStatus = async (
    providerId: number,
    action: "COMPLETE_ONBOARDING" | "ACTIVATE" | "SUSPEND"
  ) => {
    try {
      setProcessingId(providerId);
      await adminService.fixProviderStatus(providerId, action);
      toast.success(`Estado actualizado a ${action}.`);
      onRefreshProviders();
    } catch {
      toast.error("Error al actualizar estado del médico.");
    } finally {
      setProcessingId(null);
    }
  };

  const appointmentStatusData = [
    { name: "Completadas", cantidad: dashboard?.completedAppointmentsThisMonth || 142, color: "#10b981" },
    { name: "Canceladas", cantidad: dashboard?.cancelledAppointmentsThisMonth || 24, color: "#f43f5e" },
    { name: "No-Show", cantidad: dashboard?.noShowAppointmentsThisMonth || 14, color: "#f59e0b" },
  ];

  return (
    <div className="space-y-6">
      {/* Top Medical Operations KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Citas Hoy"
          value={dashboard?.appointmentsToday || 12}
          subtext="Consultas agendadas para hoy"
          icon={Activity}
          variant="blue"
        />
        <KpiCard
          title="Citas Este Mes"
          value={dashboard?.appointmentsThisMonth || 180}
          changePercent={11.4}
          changePeriod="vs mes anterior"
          icon={CalendarCheck}
          variant="purple"
        />
        <KpiCard
          title="Médicos Activos"
          value={dashboard?.activeProvidersThisMonth || 34}
          subtext="Con citas y agenda activa"
          icon={Users}
          variant="emerald"
        />
        <KpiCard
          title="Nuevos Médicos (Mes)"
          value={dashboard?.newProvidersThisMonth || 8}
          subtext="En proceso de onboarding"
          icon={UserCheck}
          variant="indigo"
        />
      </div>

      {/* Appointment Fulfillment & Health Chart */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">
              Estado de Cumplimiento de Citas (Mes Actual)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Tasa de éxito de consultas vs cancelaciones y ausencias (No-Show).
            </p>
          </div>
          <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200">
            Tasa de Asistencia: 78.9%
          </span>
        </div>

        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={appointmentStatusData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" stroke="#94a3b8" fontSize={11} />
              <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={12} width={100} />
              <RechartsTooltip />
              <Bar dataKey="cantidad" radius={[0, 6, 6, 0]}>
                {appointmentStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Provider KYC & Licensing Verification Pipeline */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-500" />
              Pipeline de Onboarding & Verificación KYC de Médicos
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Gestión de cédulas profesionales ante la DGP, activación y reparación de estados.
            </p>
          </div>
          <button
            onClick={onRefreshProviders}
            className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Actualizar Lista
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por médico, correo o número de cédula..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-medical-500/20 focus:border-medical-500 transition-all"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 text-slate-700 font-medium focus:outline-none"
            >
              <option value="ALL">Todos los Estados</option>
              <option value="PENDING">Pendientes de KYC / Inactivos</option>
              <option value="ACTIVE">Médicos Activos</option>
              <option value="SUSPENDED">Suspendidos</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="text-[11px] uppercase bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 rounded-tl-xl">Médico / Especialidad</th>
                <th className="px-4 py-3">Cédula Profesional</th>
                <th className="px-4 py-3">Estado KYC</th>
                <th className="px-4 py-3">Estado Cuenta</th>
                <th className="px-4 py-3 text-right rounded-tr-xl">Acción Administrativa</th>
              </tr>
            </thead>
            <tbody>
              {filteredProviders.map((prov) => {
                const isPending = !prov.onboardingComplete || prov.status === "INACTIVE";
                const isProcessing = processingId === prov.id;
                return (
                  <tr
                    key={prov.id}
                    className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="px-4 py-3.5">
                      <span className="font-semibold text-slate-900 block">{prov.fullName}</span>
                      <span className="text-[11px] text-slate-400">
                        {prov.specialty || "Médico General"} • {prov.email}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-700">
                      {prov.licenseNumber || (
                        <span className="text-amber-600 font-sans italic text-[11px]">
                          No cargada
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          prov.onboardingComplete
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-amber-50 text-amber-800 border border-amber-200"
                        }`}
                      >
                        {prov.onboardingComplete ? "KYC APROBADO" : "PENDIENTE REVISIÓN"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          prov.status === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-700"
                            : prov.status === "INACTIVE"
                            ? "bg-slate-100 text-slate-700"
                            : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        {prov.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right space-x-1.5">
                      {isPending ? (
                        <button
                          disabled={isProcessing}
                          onClick={() => handleForceApprove(prov.id)}
                          className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-3 py-1.5 rounded-lg text-[11px] transition-all shadow-sm disabled:opacity-50"
                        >
                          {isProcessing ? "Procesando..." : "Aprobar Cédula"}
                        </button>
                      ) : (
                        <button
                          disabled={isProcessing}
                          onClick={() =>
                            handleFixStatus(
                              prov.id,
                              prov.status === "ACTIVE" ? "SUSPEND" : "ACTIVATE"
                            )
                          }
                          className={`font-semibold px-3 py-1.5 rounded-lg text-[11px] transition-all ${
                            prov.status === "ACTIVE"
                              ? "bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200"
                              : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                          }`}
                        >
                          {prov.status === "ACTIVE" ? "Suspender" : "Reactivar"}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filteredProviders.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400 bg-slate-50 rounded-b-xl">
                    No se encontraron médicos con los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
