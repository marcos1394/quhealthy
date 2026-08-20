"use client";

import React, { useEffect, useState } from "react";
import {
  Ticket,
  PlusCircle,
  Search,
  Filter,
  Users,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  X,
  ShieldCheck,
  Receipt,
  FileCheck2,
  Calendar,
  Clock,
  ArrowRight,
  TrendingUp,
  Percent,
} from "lucide-react";
import { toast } from "react-toastify";
import { foundationService } from "@/services/foundation.service";
import {
  FoundationVoucher,
  VoucherStats,
  FoundationProgram,
  FoundationBeneficiary,
  CreateVoucherPayload,
  RedeemVoucherPayload,
} from "@/types/foundation";

export default function FoundationSubsidiesPage() {
  const [vouchers, setVouchers] = useState<FoundationVoucher[]>([]);
  const [stats, setStats] = useState<VoucherStats | null>(null);
  const [programs, setPrograms] = useState<FoundationProgram[]>([]);
  const [beneficiaries, setBeneficiaries] = useState<FoundationBeneficiary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedSupportType, setSelectedSupportType] = useState("ALL");

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isRedeemModalOpen, setIsRedeemModalOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<FoundationVoucher | null>(null);

  // Form State (Create Voucher)
  const [createBeneficiaryId, setCreateBeneficiaryId] = useState<number | null>(null);
  const [createProgramId, setCreateProgramId] = useState<number | null>(null);
  const [createSupportType, setCreateSupportType] = useState("CONSULTATION");
  const [createAmount, setCreateAmount] = useState<number>(1500);
  const [createPercentage, setCreatePercentage] = useState<number>(100);
  const [createNotes, setCreateNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State (Redeem Voucher)
  const [redeemAmount, setRedeemAmount] = useState<number>(0);
  const [redeemFolio, setRedeemFolio] = useState("");
  const [redeemEvidenceUrl, setRedeemEvidenceUrl] = useState("");
  const [redeemNotes, setRedeemNotes] = useState("");

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [vouchData, statsData, progData, benData] = await Promise.all([
        foundationService.getVouchers("ALL", 0, 50),
        foundationService.getVoucherStats(),
        foundationService.getPrograms(),
        foundationService.getBeneficiaries(undefined, "ACTIVE", 0, 50),
      ]);
      setVouchers(vouchData.content);
      setStats(statsData);
      setPrograms(progData);
      setBeneficiaries(benData.content);

      if (benData.content.length > 0) setCreateBeneficiaryId(benData.content[0].id);
      if (progData.length > 0) setCreateProgramId(progData[0].id);
    } catch {
      toast.error("Error al cargar la información de subsidios y vouchers.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createBeneficiaryId || !createProgramId) {
      toast.warning("Selecciona un beneficiario y un programa.");
      return;
    }
    if (!createAmount || createAmount <= 0) {
      toast.warning("Ingresa un monto de subsidio válido.");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload: CreateVoucherPayload = {
        beneficiaryId: createBeneficiaryId,
        programId: createProgramId,
        supportType: createSupportType,
        authorizedAmount: createAmount,
        subsidyPercentage: createPercentage,
        notes: createNotes.trim(),
      };

      await foundationService.createVoucher(payload);
      toast.success("Autorización de subsidio (Voucher) emitida con éxito.");
      setIsCreateModalOpen(false);
      setCreateNotes("");
      loadData();
    } catch {
      toast.error("No se pudo emitir el voucher.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRedeemVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVoucher) return;
    if (!redeemAmount || redeemAmount <= 0) {
      toast.warning("Ingresa el monto a redimir.");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload: RedeemVoucherPayload = {
        amountToRedeem: redeemAmount,
        prescriptionFolio: redeemFolio.trim() || undefined,
        evidenceUrl: redeemEvidenceUrl.trim() || undefined,
        notes: redeemNotes.trim() || undefined,
      };

      await foundationService.redeemVoucher(selectedVoucher.id, payload);
      toast.success("Redención de subsidio registrada y conciliada.");
      setIsRedeemModalOpen(false);
      setSelectedVoucher(null);
      setRedeemFolio("");
      setRedeemEvidenceUrl("");
      setRedeemNotes("");
      loadData();
    } catch (err: any) {
      const msg = err.response?.data?.message || "Error al registrar redención.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelVoucher = async (voucherId: number) => {
    if (!confirm("¿Deseas cancelar esta autorización de subsidio?")) return;
    try {
      await foundationService.cancelVoucher(voucherId);
      toast.info("Voucher cancelado.");
      loadData();
    } catch {
      toast.error("No se pudo cancelar el voucher.");
    }
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      maximumFractionDigits: 0,
    }).format(val);

  const filteredVouchers = vouchers.filter((v) => {
    const matchesSearch =
      v.voucherCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.beneficiaryName && v.beneficiaryName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (v.beneficiaryCurp && v.beneficiaryCurp.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (v.programName && v.programName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = selectedStatus === "ALL" || v.status === selectedStatus;
    const matchesType = selectedSupportType === "ALL" || v.supportType === selectedSupportType;

    return matchesSearch && matchesStatus && matchesType;
  });

  const totalAuth = stats?.totalAuthorizedAmount || 0;
  const totalRed = stats?.totalRedeemedAmount || 0;
  const redemptionRate = totalAuth > 0 ? Math.round((totalRed / totalAuth) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <Ticket className="w-6 h-6 text-rose-600" />
            Subsidios & Vouchers Administrativos
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Control de autorizaciones de apoyo para consultas, fármacos y procedimientos sin custodia de fondos de terceros.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-md shadow-rose-600/20 self-stretch sm:self-auto justify-center"
        >
          <PlusCircle className="w-4 h-4" />
          Emitir Autorización de Subsidio
        </button>
      </div>

      {/* 📊 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs border-l-4 border-l-rose-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500">Total Autorizado</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-2">
            {formatCurrency(totalAuth)}
          </h3>
          <span className="text-xs text-slate-400 mt-1 block">
            {stats?.totalVouchers || 0} autorizaciones emitidas
          </span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500">Subsidios Redimidos</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-emerald-600 mt-2">
            {formatCurrency(totalRed)}
          </h3>
          <span className="text-xs text-emerald-700 font-semibold mt-1 block">
            {redemptionRate}% tasa de redención
          </span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500">Remanente por Redimir</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-amber-600 mt-2">
            {formatCurrency(stats?.activeRemainingAmount || 0)}
          </h3>
          <span className="text-xs text-slate-400 mt-1 block">
            En vouchers activos vigentes
          </span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs border-l-4 border-l-indigo-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500">Vouchers Activos</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Ticket className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-2">
            {stats?.activeVouchers || 0}
          </h3>
          <span className="text-xs text-indigo-600 font-semibold mt-1 block">
            Listos para aplicar en citas
          </span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por código de voucher, CURP o nombre del beneficiario..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedSupportType}
            onChange={(e) => setSelectedSupportType(e.target.value)}
            className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 text-slate-700 font-medium focus:outline-none"
          >
            <option value="ALL">Tipo de Apoyo (Todos)</option>
            <option value="CONSULTATION">Consultas</option>
            <option value="MEDICATION">Medicamentos</option>
            <option value="LABS">Laboratorios</option>
            <option value="SURGERY">Cirugías</option>
            <option value="FINANCIAL">Económico</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 text-slate-700 font-medium focus:outline-none"
          >
            <option value="ALL">Estado (Todos)</option>
            <option value="ACTIVE">Activos</option>
            <option value="REDEEMED">Redimidos</option>
            <option value="EXPIRED">Expirados</option>
            <option value="CANCELLED">Cancelados</option>
          </select>
        </div>
      </div>

      {/* Vouchers Data Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-slate-400 text-sm">
            Cargando autorizaciones de subsidio...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="text-[11px] uppercase bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3.5 rounded-tl-xl">Código / Emisión</th>
                  <th className="px-4 py-3.5">Beneficiario / CURP</th>
                  <th className="px-4 py-3.5">Programa & Apoyo</th>
                  <th className="px-4 py-3.5">Subsidio Autorizado</th>
                  <th className="px-4 py-3.5">Estado</th>
                  <th className="px-4 py-3.5 text-right rounded-tr-xl">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredVouchers.map((v) => {
                  const authAmt = v.authorizedAmount || 1;
                  const redAmt = v.redeemedAmount || 0;
                  const percentRed = Math.min(100, Math.round((redAmt / authAmt) * 100));

                  return (
                    <tr
                      key={v.id}
                      className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="px-4 py-3.5">
                        <span className="font-mono font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 block w-max">
                          {v.voucherCode}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-1">
                          Vence: {v.expiresAt ? v.expiresAt.substring(0, 10) : "Sin fecha"}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="font-bold text-slate-900 block">
                          {v.beneficiaryName || `Beneficiario #${v.beneficiaryId}`}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono block">
                          {v.beneficiaryCurp}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="font-semibold text-slate-800 block">
                          {v.programName}
                        </span>
                        <span className="inline-block text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md mt-0.5">
                          {v.supportType} • {v.subsidyPercentage}% Cubierto
                        </span>
                      </td>

                      <td className="px-4 py-3.5 min-w-[140px]">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                          <span>{formatCurrency(authAmt)}</span>
                          <span className="text-[11px] text-slate-400">{percentRed}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden my-1">
                          <div
                            className="bg-emerald-500 h-full rounded-full"
                            style={{ width: `${percentRed}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-400 block">
                          Redimido: <strong className="text-emerald-700">{formatCurrency(redAmt)}</strong>
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full inline-block ${
                            v.status === "ACTIVE"
                              ? "bg-amber-50 text-amber-800 border border-amber-200"
                              : v.status === "REDEEMED"
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {v.status === "ACTIVE"
                            ? "Activo (Disponible)"
                            : v.status === "REDEEMED"
                            ? "Redimido (Conciliado)"
                            : v.status}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                        {v.status === "ACTIVE" && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedVoucher(v);
                                setRedeemAmount(v.remainingAmount || v.authorizedAmount);
                                setIsRedeemModalOpen(true);
                              }}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1.5 rounded-lg text-[11px] transition-all shadow-xs"
                            >
                              Redimir
                            </button>
                            <button
                              onClick={() => handleCancelVoucher(v.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                              title="Cancelar voucher"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                        {v.status === "REDEEMED" && (
                          <span className="text-[11px] font-semibold text-emerald-700 flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Conciliado
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {filteredVouchers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-slate-400 bg-slate-50 rounded-b-xl">
                      No se encontraron vouchers de subsidio registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 🚀 Modal: Emitir Nuevo Voucher de Subsidio */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 lg:p-8 space-y-5 shadow-2xl border border-slate-100 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
                  <Ticket className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Emitir Voucher de Subsidio</h3>
                  <p className="text-xs text-slate-500">Autorización administrativa de apoyo médico.</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateVoucher} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Beneficiario del Padrón *</label>
                <select
                  value={createBeneficiaryId || ""}
                  onChange={(e) => setCreateBeneficiaryId(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-rose-500/20"
                >
                  {beneficiaries.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.fullName} ({b.curp})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Programa Asistencial *</label>
                  <select
                    value={createProgramId || ""}
                    onChange={(e) => setCreateProgramId(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
                  >
                    {programs.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tipo de Apoyo *</label>
                  <select
                    value={createSupportType}
                    onChange={(e) => setCreateSupportType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
                  >
                    <option value="CONSULTATION">Consulta Médica</option>
                    <option value="MEDICATION">Medicamentos</option>
                    <option value="LABS">Laboratorios</option>
                    <option value="SURGERY">Cirugía / Procedimiento</option>
                    <option value="FINANCIAL">Apoyo Económico</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Monto Autorizado ($ MXN) *</label>
                  <input
                    type="number"
                    min={100}
                    step={100}
                    value={createAmount}
                    onChange={(e) => setCreateAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Porcentaje de Cobertura</label>
                  <select
                    value={createPercentage}
                    onChange={(e) => setCreatePercentage(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
                  >
                    <option value={100}>100% (Subsidio Total)</option>
                    <option value={80}>80% Subsidio</option>
                    <option value={70}>70% Subsidio</option>
                    <option value={50}>50% Co-pago</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Notas / Justificación de Trabajo Social</label>
                <textarea
                  rows={2}
                  placeholder="Justificación del apoyo o indicación especial..."
                  value={createNotes}
                  onChange={(e) => setCreateNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? "Emitiendo..." : "Emitir Voucher"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🚀 Modal: Registrar Redención de Subsidio */}
      {isRedeemModalOpen && selectedVoucher && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Registrar Redención de Subsidio</h3>
                <span className="font-mono text-xs text-rose-600 font-bold">{selectedVoucher.voucherCode}</span>
              </div>
              <button
                onClick={() => setIsRedeemModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRedeemVoucher} className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-slate-500">Beneficiario:</span>
                <span className="font-bold text-slate-900 block">{selectedVoucher.beneficiaryName}</span>
                <span className="text-slate-500">Monto Disponible:</span>
                <span className="font-extrabold text-emerald-700 block">
                  {formatCurrency(selectedVoucher.remainingAmount || selectedVoucher.authorizedAmount)}
                </span>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Monto a Redimir ($ MXN) *</label>
                <input
                  type="number"
                  min={1}
                  max={selectedVoucher.remainingAmount || selectedVoucher.authorizedAmount}
                  value={redeemAmount}
                  onChange={(e) => setRedeemAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Folio de Cita o Receta Médica QuHealthy</label>
                <input
                  type="text"
                  placeholder="Ej. REC-2026-0941 o CITA-#1042"
                  value={redeemFolio}
                  onChange={(e) => setRedeemFolio(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono uppercase"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Notas de Conciliación</label>
                <textarea
                  rows={2}
                  placeholder="Detalles del servicio otorgado por el médico/farmacia..."
                  value={redeemNotes}
                  onChange={(e) => setRedeemNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRedeemModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? "Registrando..." : "Confirmar Redención"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
