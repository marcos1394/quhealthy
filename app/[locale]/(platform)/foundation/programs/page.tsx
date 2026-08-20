"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Layers,
  PlusCircle,
  Search,
  Filter,
  Users,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  FileText,
  Stethoscope,
  Pill,
  Syringe,
  Activity,
  Trash2,
} from "lucide-react";
import { toast } from "react-toastify";
import { foundationService } from "@/services/foundation.service";
import {
  FoundationProgram,
  CreateProgramPayload,
} from "@/types/foundation";

export default function FoundationProgramsPage() {
  const searchParams = useSearchParams();
  const [programs, setPrograms] = useState<FoundationProgram[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [cause, setCause] = useState("ONCOLOGY");
  const [supportTypes, setSupportTypes] = useState<string[]>(["CONSULTATION", "MEDICATION"]);
  const [requiredDocs, setRequiredDocs] = useState<string[]>(["CURP", "SOCIOECONOMIC_STUDY"]);
  const [targetCount, setTargetCount] = useState<number>(50);
  const [budget, setBudget] = useState<number>(100000);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadPrograms = async () => {
    try {
      setIsLoading(true);
      const data = await foundationService.getPrograms();
      setPrograms(data);
    } catch {
      toast.error("Error al cargar programas asistenciales.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPrograms();
    if (searchParams?.get("action") === "new") {
      setIsCreateModalOpen(true);
    }
  }, [searchParams]);

  const handleCreateProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.warning("Ingresa el nombre del programa.");
      return;
    }
    if (supportTypes.length === 0) {
      toast.warning("Selecciona al menos un tipo de apoyo.");
      return;
    }
    if (!budget || budget <= 0) {
      toast.warning("Ingresa un presupuesto asignado válido.");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload: CreateProgramPayload = {
        name: name.trim(),
        description: description.trim(),
        cause,
        supportTypes,
        requiredDocuments: requiredDocs,
        targetBeneficiariesCount: targetCount,
        allocatedBudget: budget,
        status: "ACTIVE",
      };

      await foundationService.createProgram(payload);
      toast.success("Programa asistencial creado exitosamente.");
      setIsCreateModalOpen(false);
      // Reset form
      setName("");
      setDescription("");
      loadPrograms();
    } catch {
      toast.error("No se pudo crear el programa.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleSupportType = (type: string) => {
    setSupportTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const toggleRequiredDoc = (doc: string) => {
    setRequiredDocs((prev) =>
      prev.includes(doc) ? prev.filter((d) => d !== doc) : [...prev, doc]
    );
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      maximumFractionDigits: 0,
    }).format(val);

  const filteredPrograms = programs.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.cause.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = selectedStatus === "ALL" || p.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const CAUSE_OPTIONS = [
    { value: "ONCOLOGY", label: "Oncología & Cáncer" },
    { value: "RENAL", label: "Salud Renal & Trasplantes" },
    { value: "VISUAL", label: "Salud Visual & Cataratas" },
    { value: "DIABETES", label: "Diabetes & Metabolismo" },
    { value: "PEDIATRIC", label: "Pediatría & Salud Infantil" },
    { value: "CARDIOVASCULAR", label: "Cardiología & Salud Cardíaca" },
    { value: "DISABILITY", label: "Discapacidad & Rehabilitación" },
    { value: "MENTAL_HEALTH", label: "Salud Mental & Adicciones" },
    { value: "MATERNAL_INFANT", label: "Materno Infantil" },
    { value: "GENERAL_HEALTH", label: "Salud General & Comunitaria" },
  ];

  const SUPPORT_OPTIONS = [
    { id: "CONSULTATION", label: "Consultas Médicas" },
    { id: "MEDICATION", label: "Medicamentos" },
    { id: "LABS", label: "Laboratorios & Gabinete" },
    { id: "SURGERY", label: "Cirugías & Procedimientos" },
    { id: "NUTRITION", label: "Nutrición Clínica" },
    { id: "PSYCHOLOGY", label: "Psicología & Salud Mental" },
    { id: "FINANCIAL", label: "Apoyo Económico Directo" },
  ];

  const DOC_OPTIONS = [
    { id: "CURP", label: "CURP Oficial" },
    { id: "SOCIOECONOMIC_STUDY", label: "Estudio Socioeconómico" },
    { id: "MEDICAL_SUMMARY", label: "Dictamen / Resumen Médico" },
    { id: "INCOME_PROOF", label: "Comprobante de Ingresos" },
    { id: "PRESCRIPTION", label: "Receta Médica Vigente" },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-rose-600" />
            Programas Asistenciales
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Diseño de programas de apoyo, asignación presupuestal y criterios de elegibilidad para cualquier causa social.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-md shadow-rose-600/20 self-stretch sm:self-auto justify-center"
        >
          <PlusCircle className="w-4 h-4" />
          Nuevo Programa Asistencial
        </button>
      </div>

      {/* Search & Status Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar programa por nombre, causa o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 text-slate-700 font-medium focus:outline-none"
          >
            <option value="ALL">Todos los Estados</option>
            <option value="ACTIVE">Activos</option>
            <option value="PAUSED">Pausados</option>
            <option value="COMPLETED">Completados</option>
          </select>
        </div>
      </div>

      {/* Programs Grid */}
      {isLoading ? (
        <div className="py-16 text-center text-slate-400 text-sm">
          Cargando programas asistenciales...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrograms.map((prog) => {
            const progAllocated = prog.allocatedBudget || 1;
            const progDisbursed = prog.disbursedBudget || 0;
            const percent = Math.min(100, Math.round((progDisbursed / progAllocated) * 100));

            return (
              <div
                key={prog.id}
                className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                      {prog.cause}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        prog.status === "ACTIVE"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {prog.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base leading-tight">
                    {prog.name}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {prog.description || "Sin descripción detallada."}
                  </p>

                  {/* Support Types Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {prog.supportTypes.map((st) => (
                      <span
                        key={st}
                        className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md"
                      >
                        {st}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Budget & Beneficiaries Progress */}
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <strong>{prog.activeBeneficiariesCount || 0}</strong> / {prog.targetBeneficiariesCount} benef.
                    </span>
                    <span className="font-bold text-slate-900">{percent}%</span>
                  </div>

                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-rose-500 h-full rounded-full transition-all"
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Ejercido: <strong className="text-slate-800">{formatCurrency(progDisbursed)}</strong></span>
                    <span>Total: {formatCurrency(progAllocated)}</span>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredPrograms.length === 0 && (
            <div className="col-span-full py-16 bg-white rounded-2xl border border-slate-200 text-center text-slate-400 space-y-2">
              <Layers className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-sm font-medium">No se encontraron programas asistenciales.</p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="text-xs font-bold text-rose-600 hover:text-rose-700"
              >
                Crear el primer programa
              </button>
            </div>
          )}
        </div>
      )}

      {/* 🚀 Modal / Drawer: Crear Nuevo Programa */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 lg:p-8 space-y-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600">
                  <PlusCircle className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 text-lg">
                    Crear Programa Asistencial
                  </h2>
                  <p className="text-xs text-slate-500">
                    Define la causa, apoyos médicos, requisitos y presupuesto asignado.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProgram} className="space-y-4 text-xs">
              {/* Name & Cause */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Nombre del Programa *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Programa de Apoyo a Pacientes con Cáncer"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Causa Social / Especialidad *
                  </label>
                  <select
                    value={cause}
                    onChange={(e) => setCause(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 bg-white"
                  >
                    {CAUSE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Descripción y Objetivos Asistenciales
                </label>
                <textarea
                  rows={2}
                  placeholder="Describe la población objetivo, alcances y apoyos que se otorgarán..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>

              {/* Support Types Checkboxes */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1.5">
                  Tipos de Apoyo Incluidos *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {SUPPORT_OPTIONS.map((opt) => (
                    <button
                      type="button"
                      key={opt.id}
                      onClick={() => toggleSupportType(opt.id)}
                      className={`p-2 rounded-xl text-left border transition-all flex items-center gap-2 ${
                        supportTypes.includes(opt.id)
                          ? "bg-rose-50 border-rose-300 text-rose-800 font-semibold"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <CheckCircle2
                        className={`w-3.5 h-3.5 ${
                          supportTypes.includes(opt.id) ? "text-rose-600" : "text-slate-300"
                        }`}
                      />
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Required Documents Checkboxes */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1.5">
                  Documentación Requerida para Elegibilidad
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {DOC_OPTIONS.map((opt) => (
                    <button
                      type="button"
                      key={opt.id}
                      onClick={() => toggleRequiredDoc(opt.id)}
                      className={`p-2 rounded-xl text-left border transition-all flex items-center gap-2 ${
                        requiredDocs.includes(opt.id)
                          ? "bg-indigo-50 border-indigo-300 text-indigo-800 font-semibold"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <CheckCircle2
                        className={`w-3.5 h-3.5 ${
                          requiredDocs.includes(opt.id) ? "text-indigo-600" : "text-slate-300"
                        }`}
                      />
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Beneficiaries & Budget */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Meta de Beneficiarios (Pacientes)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={targetCount}
                    onChange={(e) => setTargetCount(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Presupuesto Asignado (MXN) *
                  </label>
                  <input
                    type="number"
                    min={1000}
                    step={1000}
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md shadow-rose-600/30 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? "Creando..." : "Guardar y Activar Programa"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
