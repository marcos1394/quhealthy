"use client";

import React, { useState, useEffect } from "react";
import {
  Building2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Shield,
  Search,
  Filter,
  RefreshCw,
  Eye,
  FileText,
  DollarSign,
  Users,
  ShieldCheck,
  X,
  FileCheck2,
} from "lucide-react";
import { toast } from "react-toastify";
import { KpiCard } from "../components/KpiCard";
import { adminService } from "@/services/admin.service";

export const TabFoundations: React.FC = () => {
  const [foundations, setFoundations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFoundation, setSelectedFoundation] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State for Verification Review
  const [newStatus, setNewStatus] = useState<string>("APPROVED");
  const [rejectionReason, setRejectionReason] = useState("");
  const [adminNotes, setAdminNotes] = useState("");

  const loadFoundations = async () => {
    try {
      setIsRefreshing(true);
      const res = await adminService.getFoundations(filterStatus);
      setFoundations(res.content);
    } catch {
      toast.error("Error al cargar listado institucional de fundaciones.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadFoundations();
  }, [filterStatus]);

  const handleOpenReviewModal = (f: any) => {
    setSelectedFoundation(f);
    setNewStatus(f.verificationStatus === "APPROVED" ? "APPROVED" : "APPROVED");
    setRejectionReason(f.rejectionReason || "");
    setAdminNotes("");
    setIsModalOpen(true);
  };

  const handleUpdateVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFoundation) return;

    try {
      setIsSubmitting(true);
      await adminService.updateFoundationVerification(selectedFoundation.id, {
        verificationStatus: newStatus,
        rejectionReason: rejectionReason.trim() || undefined,
        adminNotes: adminNotes.trim() || undefined,
      });
      toast.success(`Estado de verificación actualizado a: ${newStatus}`);
      setIsModalOpen(false);
      loadFoundations();
    } catch {
      toast.error("No se pudo actualizar el estado de verificación.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = foundations.filter((f) => {
    const matchesSearch =
      f.legalName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.brandName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.rfc?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.cluniNumber?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === "ALL" || f.verificationStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const approvedCount = foundations.filter((f) => f.verificationStatus === "APPROVED").length;
  const pendingCount = foundations.filter(
    (f) => f.verificationStatus === "PENDING" || f.verificationStatus === "MANUAL_REVIEW_NEEDED"
  ).length;
  const totalDisbursed = foundations.reduce((acc, f) => acc + (f.totalDisbursedBudget || 0), 0);

  return (
    <div className="space-y-6">
      {/* 📊 Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Fundaciones Registradas"
          value={foundations.length.toString()}
          subtext="Instituciones en plataforma"
          variant="indigo"
          icon={Building2}
        />

        <KpiCard
          title="Verificadas & Activas"
          value={approvedCount.toString()}
          subtext="KYB validado por Admin"
          variant="emerald"
          icon={ShieldCheck}
        />

        <KpiCard
          title="Pendientes de Revisión"
          value={pendingCount.toString()}
          subtext="Dictámenes en espera"
          variant={pendingCount > 0 ? "rose" : "slate"}
          icon={AlertTriangle}
        />

        <KpiCard
          title="Subsidios Auditados"
          value={`$${Number(totalDisbursed).toLocaleString("es-MX")}`}
          subtext="Presupuesto social canalizado"
          variant="purple"
          icon={DollarSign}
        />
      </div>

      {/* 🧭 Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por Razón Social, Marca, RFC o CLUNI..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 text-slate-700 font-medium focus:outline-none"
          >
            <option value="ALL">Estado Verificación (Todos)</option>
            <option value="APPROVED">Aprobadas</option>
            <option value="PENDING">Pendientes</option>
            <option value="MANUAL_REVIEW_NEEDED">Revisión Manual</option>
            <option value="REJECTED">Rechazadas</option>
          </select>

          <button
            onClick={loadFoundations}
            disabled={isRefreshing}
            className="p-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
            title="Refrescar listado"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* 📋 Foundations Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-slate-400 text-sm">
            Cargando instituciones registradas...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="text-[11px] uppercase bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3.5 rounded-tl-xl">Institución / Razón Social</th>
                  <th className="px-4 py-3.5">RFC & CLUNI</th>
                  <th className="px-4 py-3.5">Régimen SAT</th>
                  <th className="px-4 py-3.5">Programas & Padrón</th>
                  <th className="px-4 py-3.5">Subsidios Ejercidos</th>
                  <th className="px-4 py-3.5">Estado KYB</th>
                  <th className="px-4 py-3.5 text-right rounded-tr-xl">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((f) => (
                  <tr
                    key={f.id}
                    className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="px-4 py-3.5">
                      <span className="font-bold text-slate-900 text-sm block">
                        {f.legalName}
                      </span>
                      {f.brandName && (
                        <span className="text-slate-500 text-[11px] block">
                          Marca: {f.brandName} • Tipo: {f.organizationType}
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400 block">
                        {f.contactEmail} • {f.contactPhone}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 font-mono">
                      <span className="font-bold text-slate-800 block">{f.rfc || "Sin RFC"}</span>
                      <span className="text-[10px] text-slate-400 block">
                        CLUNI: {f.cluniNumber || "Sin CLUNI"}
                      </span>
                    </td>

                    <td className="px-4 py-3.5">
                      {f.isAuthorizedDonatary ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Donataria Autorizada
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-slate-500">
                          Sin autorización SAT
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-900 block">
                          {f.activeProgramsCount || 0} Programas Activos
                        </span>
                        <span className="text-[11px] text-slate-500 block">
                          {f.totalBeneficiariesCount || 0} Beneficiarios
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="font-bold text-slate-900 block">
                        ${Number(f.totalDisbursedBudget || 0).toLocaleString("es-MX")}
                      </span>
                      <span className="text-[10px] text-slate-400 block">Subsidios ejercidos</span>
                    </td>

                    <td className="px-4 py-3.5">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full inline-block ${
                          f.verificationStatus === "APPROVED"
                            ? "bg-emerald-100 text-emerald-800"
                            : f.verificationStatus === "MANUAL_REVIEW_NEEDED"
                            ? "bg-amber-100 text-amber-800"
                            : f.verificationStatus === "REJECTED"
                            ? "bg-rose-100 text-rose-800"
                            : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {f.verificationStatus}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => handleOpenReviewModal(f)}
                        className="p-1.5 text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all font-semibold inline-flex items-center gap-1"
                        title="Revisar Expediente KYB"
                      >
                        <Shield className="w-3.5 h-3.5 text-indigo-600" />
                        Dictaminar
                      </button>
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-slate-400 bg-slate-50 rounded-b-xl">
                      No se encontraron fundaciones registradas con los filtros actuales.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 🚀 Modal: Dictaminar Verificación Institucional */}
      {isModalOpen && selectedFoundation && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-100 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <Shield className="w-5 h-5 text-indigo-600" />
                  Dictaminar Verificación KYB
                </h3>
                <p className="text-xs text-slate-500">{selectedFoundation.legalName}</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateVerification} className="space-y-3.5 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-slate-600">
                <div><strong>RFC:</strong> {selectedFoundation.rfc || "N/A"}</div>
                <div><strong>CLUNI:</strong> {selectedFoundation.cluniNumber || "N/A"}</div>
                <div><strong>Donataria Autorizada SAT:</strong> {selectedFoundation.isAuthorizedDonatary ? "Sí" : "No"}</div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Dictamen de Admin Master *</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewStatus("APPROVED")}
                    className={`p-2.5 rounded-xl border font-bold text-center transition-all ${
                      newStatus === "APPROVED"
                        ? "bg-emerald-50 border-emerald-400 text-emerald-800"
                        : "bg-slate-50 border-slate-200 text-slate-600"
                    }`}
                  >
                    Aprobada
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewStatus("MANUAL_REVIEW_NEEDED")}
                    className={`p-2.5 rounded-xl border font-bold text-center transition-all ${
                      newStatus === "MANUAL_REVIEW_NEEDED"
                        ? "bg-amber-50 border-amber-400 text-amber-800"
                        : "bg-slate-50 border-slate-200 text-slate-600"
                    }`}
                  >
                    Observada
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewStatus("REJECTED")}
                    className={`p-2.5 rounded-xl border font-bold text-center transition-all ${
                      newStatus === "REJECTED"
                        ? "bg-rose-50 border-rose-400 text-rose-800"
                        : "bg-slate-50 border-slate-200 text-slate-600"
                    }`}
                  >
                    Rechazada
                  </button>
                </div>
              </div>

              {(newStatus === "REJECTED" || newStatus === "MANUAL_REVIEW_NEEDED") && (
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Motivo / Observaciones para la Fundación *</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Ej. El acta constitutiva no es legible o el CLUNI no coincide..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
              )}

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Notas Internas de Auditoría (Privadas)</label>
                <textarea
                  rows={2}
                  placeholder="Notas de control interno para el equipo de QuHealthy..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? "Guardando..." : "Guardar Dictamen"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
