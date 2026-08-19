"use client";

import React, { useState } from "react";
import {
  Server,
  Activity,
  ShieldCheck,
  Download,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Lock,
  RefreshCw,
  Search,
} from "lucide-react";
import {
  MicroserviceHealthDTO,
  AuditLogDTO,
} from "@/services/admin.service";

interface TabSystemHealthProps {
  services: MicroserviceHealthDTO[];
  auditLogs: AuditLogDTO[];
  formatDate: (dateStr: string) => string;
  onRefreshHealth: () => void;
}

export const TabSystemHealth: React.FC<TabSystemHealthProps> = ({
  services,
  auditLogs,
  formatDate,
  onRefreshHealth,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredLogs = auditLogs.filter(
    (l) =>
      l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.detail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.ipAddress.includes(searchTerm)
  );

  const exportAuditCsv = () => {
    const headers = [
      "ID",
      "Fecha",
      "Tipo Evento",
      "Accion",
      "Detalle",
      "IP Origen",
      "User Agent",
      "Rol",
      "Exitoso",
    ];
    const csvContent =
      "data:text/csv;charset=utf-8," +
      headers.join(",") +
      "\n" +
      filteredLogs
        .map(
          (l) =>
            `${l.id},${l.performedAt},${l.eventType},${l.action},"${l.detail.replace(/"/g, '""')}",${l.ipAddress},"${l.userAgent}",${l.role},${l.success}`
        )
        .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `auditoria_lfpdppp_quhealthy_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* 🩺 Live Microservices Cluster Overview */}
      <div className="bg-slate-900 text-white border border-slate-800 rounded-3xl p-6 lg:p-8 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-medical-500/20 text-medical-400 border border-medical-500/30">
                <Server className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl lg:text-2xl font-bold text-white tracking-tight">
                  Estado del Clúster de Microservicios (14 Servicios)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Monitoreo activo de endpoints Spring Boot Actuator, JVM y latencias.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onRefreshHealth}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border border-slate-700 flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Ping Actuators
            </button>
            <a
              href="http://grafana.localhost:3000"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-orange-500 hover:bg-orange-600 text-white px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 shadow-sm"
            >
              <Activity className="w-3.5 h-3.5" />
              Abrir Grafana
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Grid of 14 Microservices */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
          {services.map((srv) => (
            <div
              key={srv.serviceKey}
              className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/80 hover:border-slate-600 transition-all flex flex-col justify-between space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-bold text-slate-100 text-sm block">
                    {srv.name}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Port :{srv.port} • v{srv.version}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-[10px] font-bold text-emerald-400">UP</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-700/60 font-mono">
                <span>Latencia: <strong className="text-slate-200">{srv.latencyMs}ms</strong></span>
                <span>Uptime: <strong className="text-slate-200">{srv.uptime}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 🛡️ LFPDPPP & Security Audit Trail */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">
                Bitácora de Auditoría de Seguridad & LFPDPPP
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Trazabilidad inmutable de inicios de sesión, cambios de privilegios y acciones de soporte.
              </p>
            </div>
          </div>
          <button
            onClick={exportAuditCsv}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm"
          >
            <Download className="w-4 h-4" />
            Descargar Log LFPDPPP (CSV)
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full pt-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por acción, detalle o dirección IP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-medical-500/20 focus:border-medical-500 transition-all"
          />
        </div>

        {/* Audit Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="text-[11px] uppercase bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 rounded-tl-xl">Fecha & Hora</th>
                <th className="px-4 py-3">Tipo de Evento</th>
                <th className="px-4 py-3">Detalle / Acción</th>
                <th className="px-4 py-3">IP & Dispositivo</th>
                <th className="px-4 py-3">Rol</th>
                <th className="px-4 py-3 text-right rounded-tr-xl">Resultado</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr
                  key={log.id}
                  className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors"
                >
                  <td className="px-4 py-3.5 whitespace-nowrap font-medium text-slate-900">
                    {formatDate(log.performedAt)}
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        log.eventType === "LOGIN_SUCCESS"
                          ? "bg-emerald-50 text-emerald-700"
                          : log.eventType === "ADMIN_ACTION"
                          ? "bg-indigo-50 text-indigo-700"
                          : "bg-amber-50 text-amber-800"
                      }`}
                    >
                      {log.eventType}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-medium text-slate-700 max-w-sm truncate">
                    {log.detail}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-[11px] text-slate-500">
                    <span className="block font-semibold text-slate-700">{log.ipAddress}</span>
                    <span className="text-[10px] truncate max-w-xs block text-slate-400">
                      {log.userAgent}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-semibold text-slate-800">
                    {log.role}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Éxito
                    </span>
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400 bg-slate-50 rounded-b-xl">
                    No se encontraron registros de auditoría.
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
