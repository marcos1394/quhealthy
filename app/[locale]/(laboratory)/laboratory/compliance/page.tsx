"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Award,
  FileText,
  Trash2,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Calendar,
  Truck,
  X
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  laboratoryOperationsService,
} from "@/services/laboratory-operations.service";
import {
  laboratoryOnboardingService,
} from "@/services/laboratory-onboarding.service";
import {
  LaboratoryRpbiLog,
  CreateRpbiLogPayload,
  LaboratoryRpbiWasteType,
  LaboratoryOnboardingStatusResponse,
} from "@/types/laboratory";

export default function LaboratoryCompliancePage() {
  const [rpbiLogs, setRpbiLogs] = useState<LaboratoryRpbiLog[]>([]);
  const [status, setStatus] = useState<LaboratoryOnboardingStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state para RPBI
  const [wasteType, setWasteType] = useState<LaboratoryRpbiWasteType>("PUNZOCORTANTES");
  const [weightKg, setWeightKg] = useState<number>(5.5);
  const [manifestFolio, setManifestFolio] = useState("");
  const [authorizedDisposalCompany, setAuthorizedDisposalCompany] = useState("Ecolimpiezas Industriales S.A. de C.V.");
  const [pickupDate, setPickupDate] = useState(new Date().toISOString().split("T")[0]);
  const [responsibleName, setResponsibleName] = useState("");

  const loadComplianceData = async () => {
    try {
      setLoading(true);
      const [logsRes, statusRes] = await Promise.allSettled([
        laboratoryOperationsService.getRpbiLogs(),
        laboratoryOnboardingService.getStatus(),
      ]);

      if (logsRes.status === "fulfilled") {
        setRpbiLogs(logsRes.value || []);
      }
      if (statusRes.status === "fulfilled") {
        setStatus(statusRes.value);
      }
    } catch (err) {
      console.error("Error al cargar datos sanitarios:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplianceData();
  }, []);

  const handleCreateRpbi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manifestFolio.trim() || !authorizedDisposalCompany.trim()) {
      alert("Por favor complete el folio de manifiesto y la empresa recolectora.");
      return;
    }

    try {
      setSubmitting(true);
      const payload: CreateRpbiLogPayload = {
        wasteType,
        weightKg: Number(weightKg),
        manifestFolio,
        authorizedDisposalCompany,
        pickupDate: new Date(pickupDate).toISOString(),
        responsibleName: responsibleName || undefined,
      };

      await laboratoryOperationsService.createRpbiLog(payload);
      setIsModalOpen(false);
      setManifestFolio("");
      await loadComplianceData();
    } catch (err) {
      console.error("Error al registrar manifiesto RPBI:", err);
      alert("Error al registrar el manifiesto en la bitácora.");
    } finally {
      setSubmitting(false);
    }
  };

  const getWasteTypeLabel = (type: LaboratoryRpbiWasteType) => {
    switch (type) {
      case "PUNZOCORTANTES":
        return "Punzocortantes (Agujas / Lancetas)";
      case "NO_ANATOMICOS":
        return "No Anatómicos (Torundas / Gasas con Sangre)";
      case "PATOLOGICOS":
        return "Patológicos (Biopsias / Tejidos)";
      case "SANGRE_LIQUIDA":
        return "Sangre Líquida y Hemoderivados";
      case "CULTIVOS_CEPAS":
        return "Cultivos y Cepas Infecciosas";
      default:
        return type;
    }
  };

  return (
    <div className="space-y-8 font-sans pb-16">
      {/* ── ENCABEZADO ────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#0a0a0a] p-6 sm:p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-900/40">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>NOM-007-SSA3-2011 & NOM-087 SEMARNAT</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Cumplimiento Sanitario & Bitácora RPBI
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Supervisión del Aviso de Funcionamiento COFEPRIS, Cédula de Responsable Sanitario y Bitácora oficial de Residuos Biológico-Infecciosos.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={loadComplianceData}
            disabled={loading}
            className="rounded-2xl h-11 w-11 border border-gray-200 dark:border-gray-800 cursor-pointer"
            title="Actualizar datos"
          >
            <RefreshCw className={cn("w-4 h-4 text-gray-500", loading && "animate-spin")} />
          </Button>

          <Button
            onClick={() => setIsModalOpen(true)}
            className="rounded-2xl gap-2 font-bold text-xs h-11 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Manifiesto RPBI</span>
          </Button>
        </div>
      </div>

      {/* ── TARJETAS DE ACREDITACIÓN SANITARIA ─────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Tarjeta 1: Aviso de Funcionamiento COFEPRIS */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Aviso de Funcionamiento
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-base font-bold text-gray-900 dark:text-white block">
              COFEPRIS Registrado
            </span>
            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Estatus Regularizado
            </span>
          </div>
          <p className="text-[11px] text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-800">
            Laboratorio autorizado para toma y procesamiento de análisis clínicos.
          </p>
        </div>

        {/* Tarjeta 2: Químico Responsable Sanitario */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Responsable Sanitario
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-base font-bold text-gray-900 dark:text-white block truncate">
              {status?.legalName || "Químico Titular"}
            </span>
            <span className="text-xs text-indigo-600 font-semibold flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Cédula Profesional DGP Verificada
            </span>
          </div>
          <p className="text-[11px] text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-800">
            Firma digital y cédula asignada en la validación de cada resultado.
          </p>
        </div>

        {/* Tarjeta 3: Protocolo RPBI */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Control RPBI (NOM-087)
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
              <Trash2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-gray-900 dark:text-white">
                {rpbiLogs.length}
              </span>
              <span className="text-xs font-bold text-amber-600">Manifiestos</span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Total recolectado:{" "}
              <strong className="text-gray-900 dark:text-white">
                {rpbiLogs.reduce((acc, l) => acc + Number(l.weightKg || 0), 0).toFixed(1)} kg
              </strong>
            </p>
          </div>
          <p className="text-[11px] text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-800">
            Bitácora de pesaje y entrega a recolector autorizado SEMARNAT.
          </p>
        </div>

      </div>

      {/* ── BITÁCORA HISTÓRICA RPBI ──────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Bitácora de Residuos Peligrosos Biológico-Infecciosos (NOM-087)
            </h2>
            <p className="text-xs text-gray-400">
              Registro obligatorio ante SEMARNAT y COFEPRIS para disposición segura de punzocortantes y fluidos
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-2">
            <RefreshCw className="w-5 h-5 text-emerald-600 animate-spin" />
            <span className="text-xs text-gray-400">Cargando bitácora...</span>
          </div>
        ) : rpbiLogs.length === 0 ? (
          <div className="py-12 px-4 rounded-2xl bg-gray-50/50 dark:bg-gray-900/20 border border-dashed border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                No hay recolecciones de RPBI registradas
              </h3>
              <p className="text-xs text-gray-500 max-w-sm">
                Registra tu primer manifiesto de recolección para mantener tu laboratorio en regla ante COFEPRIS.
              </p>
            </div>
            <Button
              onClick={() => setIsModalOpen(true)}
              size="sm"
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Registrar Manifiesto</span>
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="pb-3 px-2">Folio Manifiesto</th>
                  <th className="pb-3 px-2">Tipo de Residuo</th>
                  <th className="pb-3 px-2">Peso</th>
                  <th className="pb-3 px-2">Empresa Recolectora</th>
                  <th className="pb-3 px-2">Fecha de Recolección</th>
                  <th className="pb-3 px-2 text-right">Responsable</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/80">
                {rpbiLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/60 dark:hover:bg-[#121212] transition-colors">
                    <td className="py-3.5 px-2 font-mono font-bold text-gray-900 dark:text-white">
                      {log.manifestFolio}
                    </td>
                    <td className="py-3.5 px-2">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">
                        {getWasteTypeLabel(log.wasteType)}
                      </span>
                    </td>
                    <td className="py-3.5 px-2 font-bold text-amber-600">
                      {Number(log.weightKg).toFixed(2)} kg
                    </td>
                    <td className="py-3.5 px-2 text-gray-600 dark:text-gray-400">
                      {log.authorizedDisposalCompany}
                    </td>
                    <td className="py-3.5 px-2 text-gray-600 dark:text-gray-400">
                      {new Date(log.pickupDate).toLocaleDateString("es-MX", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3.5 px-2 text-right text-gray-500 font-medium">
                      {log.responsibleName || "Químico de Guardia"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── MODAL: REGISTRAR MANIFIESTO RPBI ─────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0f0f0f] border border-gray-100 dark:border-gray-800 w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Registrar Recolección RPBI
                </h3>
                <p className="text-xs text-gray-400">
                  Cumplimiento de la norma NOM-087-SEMARNAT-SSA1-2002
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 hover:text-gray-800 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRpbi} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-600 dark:text-gray-400 font-semibold mb-1">
                  Tipo de Residuo Peligroso *
                </label>
                <select
                  value={wasteType}
                  onChange={(e) => setWasteType(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-black text-gray-900 dark:text-white focus:outline-hidden focus:border-emerald-500 font-semibold"
                >
                  <option value="PUNZOCORTANTES">Punzocortantes (Agujas, lancetas, bisturís)</option>
                  <option value="NO_ANATOMICOS">No Anatómicos (Gasas, apósitos empapados en sangre)</option>
                  <option value="PATOLOGICOS">Patológicos (Biopsias, muestras de tejidos)</option>
                  <option value="SANGRE_LIQUIDA">Sangre Líquida y Hemoderivados</option>
                  <option value="CULTIVOS_CEPAS">Cultivos y Cepas Infecciosas</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-600 dark:text-gray-400 font-semibold mb-1">
                    Peso Neto (Kilogramos) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-black text-gray-900 dark:text-white focus:outline-hidden focus:border-emerald-500 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 dark:text-gray-400 font-semibold mb-1">
                    Fecha de Recolección *
                  </label>
                  <input
                    type="date"
                    required
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-black text-gray-900 dark:text-white focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-600 dark:text-gray-400 font-semibold mb-1">
                  Folio de Manifiesto SEMARNAT *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. MANIF-2026-SEMARNAT-08912"
                  value={manifestFolio}
                  onChange={(e) => setManifestFolio(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-black font-mono text-gray-900 dark:text-white focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-gray-600 dark:text-gray-400 font-semibold mb-1">
                  Empresa Recolectora Autorizada *
                </label>
                <input
                  type="text"
                  required
                  value={authorizedDisposalCompany}
                  onChange={(e) => setAuthorizedDisposalCompany(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-black text-gray-900 dark:text-white focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-gray-600 dark:text-gray-400 font-semibold mb-1">
                  Nombre del Químico / Responsable de Entrega
                </label>
                <input
                  type="text"
                  placeholder="QFB de Entrega"
                  value={responsibleName}
                  onChange={(e) => setResponsibleName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-black text-gray-900 dark:text-white focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100 dark:border-gray-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1.5 cursor-pointer"
                >
                  {submitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  <span>Registrar en Bitácora</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
