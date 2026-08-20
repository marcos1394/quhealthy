"use client";

import React, { useEffect, useState } from "react";
import {
  CalendarDays,
  PlusCircle,
  Search,
  Filter,
  Users,
  MapPin,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  X,
  Stethoscope,
  Sparkles,
  Activity,
  ArrowRight,
  ShieldCheck,
  FileText,
  Clock,
  Eye,
} from "lucide-react";
import { toast } from "react-toastify";
import { foundationService } from "@/services/foundation.service";
import {
  FoundationCampaign,
  CampaignScreeningRecord,
  CampaignStats,
  FoundationProgram,
  CreateCampaignPayload,
  CreateScreeningRecordPayload,
} from "@/types/foundation";

export default function FoundationCampaignsPage() {
  const [campaigns, setCampaigns] = useState<FoundationCampaign[]>([]);
  const [stats, setStats] = useState<CampaignStats | null>(null);
  const [programs, setPrograms] = useState<FoundationProgram[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedCause, setSelectedCause] = useState("ALL");

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<FoundationCampaign | null>(null);
  const [isScreeningModalOpen, setIsScreeningModalOpen] = useState(false);
  const [screeningsList, setScreeningsList] = useState<CampaignScreeningRecord[]>([]);
  const [isLoadingScreenings, setIsLoadingScreenings] = useState(false);

  // Form State (Create Campaign)
  const [name, setName] = useState("");
  const [cause, setCause] = useState("VISUAL");
  const [programId, setProgramId] = useState<number | null>(null);
  const [description, setDescription] = useState("");
  const [targetAttendees, setTargetAttendees] = useState<number>(100);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [locationCity, setLocationCity] = useState("Los Mochis");
  const [locationAddress, setLocationAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State (New Screening Record)
  const [attendeeName, setAttendeeName] = useState("");
  const [attendeeCurp, setAttendeeCurp] = useState("");
  const [attendeePhone, setAttendeePhone] = useState("");
  const [screeningType, setScreeningType] = useState("VISUAL_ACUITY");
  const [param1, setParam1] = useState(""); // ej. Glucosa o Agudeza OD
  const [param2, setParam2] = useState(""); // ej. Presión Sistólica o Agudeza OI
  const [riskLevel, setRiskLevel] = useState("NORMAL");
  const [observations, setObservations] = useState("");
  const [aiSummary, setAiSummary] = useState("");
  const [referredProgramId, setReferredProgramId] = useState<number | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [campData, statsData, progData] = await Promise.all([
        foundationService.getCampaigns("ALL", 0, 50),
        foundationService.getCampaignStats(),
        foundationService.getPrograms(),
      ]);
      setCampaigns(campData.content);
      setStats(statsData);
      setPrograms(progData);
      if (progData.length > 0) setProgramId(progData[0].id);
    } catch {
      toast.error("Error al cargar jornadas y campañas.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadScreenings = async (campId: number) => {
    try {
      setIsLoadingScreenings(true);
      const res = await foundationService.getScreeningsByCampaign(campId);
      setScreeningsList(res.content);
    } catch {
      toast.error("Error al cargar registros de tamizaje.");
    } finally {
      setIsLoadingScreenings(false);
    }
  };

  const handleOpenCampaignScreenings = (camp: FoundationCampaign) => {
    setSelectedCampaign(camp);
    setIsScreeningModalOpen(true);
    setReferredProgramId(camp.programId || null);
    loadScreenings(camp.id);
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !startDate || !endDate) {
      toast.warning("Completa los campos obligatorios de la campaña.");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload: CreateCampaignPayload = {
        name: name.trim(),
        cause,
        programId: programId || undefined,
        description: description.trim(),
        targetAttendees,
        startDate,
        endDate,
        locationCity: locationCity.trim(),
        locationAddress: locationAddress.trim(),
        status: "IN_PROGRESS",
      };

      await foundationService.createCampaign(payload);
      toast.success("Campaña de salud creada exitosamente.");
      setIsCreateModalOpen(false);
      setName("");
      setDescription("");
      loadData();
    } catch {
      toast.error("No se pudo crear la campaña.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateAiSummary = async () => {
    if (!attendeeName.trim()) {
      toast.warning("Ingresa el nombre del asistente.");
      return;
    }

    try {
      setIsGeneratingAi(true);
      const measurements: Record<string, any> = {
        param_principal: param1,
        param_secundario: param2,
      };
      const summary = await foundationService.generateAiScreeningSummary(
        screeningType,
        measurements,
        observations,
        attendeeName
      );
      setAiSummary(summary);
      toast.success("Síntesis con IA de acompañamiento generada.");
    } catch {
      toast.error("Error al generar síntesis con IA.");
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleCreateScreening = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCampaign || !attendeeName.trim()) {
      toast.warning("Ingresa el nombre del asistente tamizado.");
      return;
    }

    try {
      setIsSubmitting(true);
      const measurements: Record<string, any> = {
        parametro_1: param1,
        parametro_2: param2,
      };

      const payload: CreateScreeningRecordPayload = {
        campaignId: selectedCampaign.id,
        attendeeName: attendeeName.trim(),
        attendeeCurp: attendeeCurp.trim() ? attendeeCurp.trim().toUpperCase() : undefined,
        attendeePhone: attendeePhone.trim() || undefined,
        screeningType,
        measurements,
        riskLevel,
        observations: observations.trim(),
        referredToProgramId: referredProgramId || undefined,
        screenedByStaffName: "Personal de Campo QuHealthy",
      };

      await foundationService.createScreeningRecord(payload);
      toast.success("Tamizaje registrado correctamente en la campaña.");

      // Reset form
      setAttendeeName("");
      setAttendeeCurp("");
      setAttendeePhone("");
      setParam1("");
      setParam2("");
      setObservations("");
      setAiSummary("");
      loadScreenings(selectedCampaign.id);
      loadData();
    } catch {
      toast.error("Error al registrar tamizaje.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCampaigns = campaigns.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.cause.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.locationCity && c.locationCity.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = selectedStatus === "ALL" || c.status === selectedStatus;
    const matchesCause = selectedCause === "ALL" || c.cause === selectedCause;

    return matchesSearch && matchesStatus && matchesCause;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <CalendarDays className="w-6 h-6 text-rose-600" />
            Campañas & Jornadas de Salud
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Gestión de eventos de detección temprana y tamizajes masivos con síntesis de IA de acompañamiento.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-md shadow-rose-600/20 self-stretch sm:self-auto justify-center"
        >
          <PlusCircle className="w-4 h-4" />
          Nueva Campaña de Salud
        </button>
      </div>

      {/* 📊 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs border-l-4 border-l-rose-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500">Total Campañas</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <CalendarDays className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-2">
            {stats?.totalCampaigns || 0}
          </h3>
          <span className="text-xs text-slate-400 mt-1 block">Jornadas programadas</span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs border-l-4 border-l-indigo-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500">En Curso en Campo</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-indigo-600 mt-2">
            {stats?.activeCampaigns || 0}
          </h3>
          <span className="text-xs text-indigo-700 font-semibold mt-1 block">Sedes activas</span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500">Personas Tamizadas</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-emerald-600 mt-2">
            {stats?.totalScreenedAttendees || 0}
          </h3>
          <span className="text-xs text-slate-400 mt-1 block">Atenciones registradas</span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500">Meta Poblacional</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Stethoscope className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-2">
            {stats?.totalTargetAttendees || 0}
          </h3>
          <span className="text-xs text-amber-700 font-semibold mt-1 block">Capacidad programada</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre de campaña, causa o municipio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedCause}
            onChange={(e) => setSelectedCause(e.target.value)}
            className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 text-slate-700 font-medium focus:outline-none"
          >
            <option value="ALL">Causas (Todas)</option>
            <option value="VISUAL">Salud Visual</option>
            <option value="DIABETES">Diabetes</option>
            <option value="RENAL">Salud Renal</option>
            <option value="ONCOLOGY">Oncología</option>
            <option value="GENERAL_HEALTH">Salud General</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 text-slate-700 font-medium focus:outline-none"
          >
            <option value="ALL">Estado (Todos)</option>
            <option value="IN_PROGRESS">En Curso</option>
            <option value="UPCOMING">Próximas</option>
            <option value="COMPLETED">Completadas</option>
          </select>
        </div>
      </div>

      {/* Campaigns Grid */}
      {isLoading ? (
        <div className="py-16 text-center text-slate-400 text-sm">
          Cargando campañas y jornadas asistenciales...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaigns.map((camp) => {
            const target = camp.targetAttendees || 1;
            const screened = camp.screenedAttendees || 0;
            const percent = Math.min(100, Math.round((screened / target) * 100));

            return (
              <div
                key={camp.id}
                className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                      {camp.cause}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        camp.status === "IN_PROGRESS"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200 animate-pulse"
                          : camp.status === "UPCOMING"
                          ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {camp.status === "IN_PROGRESS" ? "En Curso" : camp.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base leading-tight">
                    {camp.name}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {camp.description || "Sin descripción detallada."}
                  </p>

                  <div className="space-y-1 text-xs text-slate-600 pt-1">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{camp.locationCity} • {camp.locationAddress || "Sede Comunitaria"}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{camp.startDate} al {camp.endDate}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span className="flex items-center gap-1 font-semibold">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <strong>{screened}</strong> / {target} tamizados
                    </span>
                    <span className="font-bold text-slate-900">{percent}%</span>
                  </div>

                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full transition-all"
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <button
                    onClick={() => handleOpenCampaignScreenings(camp)}
                    className="w-full flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded-xl text-xs transition-all shadow-xs"
                  >
                    <Stethoscope className="w-3.5 h-3.5 text-rose-400" />
                    Jornada de Tamizaje en Campo
                  </button>
                </div>
              </div>
            );
          })}

          {filteredCampaigns.length === 0 && (
            <div className="col-span-full py-16 bg-white rounded-2xl border border-slate-200 text-center text-slate-400 space-y-2">
              <CalendarDays className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-sm font-medium">No se encontraron campañas o jornadas registradas.</p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="text-xs font-bold text-rose-600 hover:text-rose-700"
              >
                Crear la primera campaña de salud
              </button>
            </div>
          )}
        </div>
      )}

      {/* 🚀 Modal: Crear Nueva Campaña */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 lg:p-8 space-y-5 shadow-2xl border border-slate-100 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
                  <CalendarDays className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Crear Campaña o Jornada</h3>
                  <p className="text-xs text-slate-500">Planificación de evento comunitario de salud.</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nombre de la Campaña *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Jornada Comunitaria de Salud Visual Los Mochis 2026"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Causa / Especialidad *</label>
                  <select
                    value={cause}
                    onChange={(e) => setCause(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
                  >
                    <option value="VISUAL">Salud Visual</option>
                    <option value="DIABETES">Diabetes & Metabolismo</option>
                    <option value="RENAL">Salud Renal</option>
                    <option value="ONCOLOGY">Oncología & Mastografía</option>
                    <option value="PEDIATRIC">Pediatría</option>
                    <option value="GENERAL_HEALTH">Salud General</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Programa Vinculado</label>
                  <select
                    value={programId || ""}
                    onChange={(e) => setProgramId(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
                  >
                    <option value="">Sin programa directo</option>
                    {programs.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Descripción y Objetivos</label>
                <textarea
                  rows={2}
                  placeholder="Objetivos del tamizaje, población meta y pruebas a realizar..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Meta Asistentes</label>
                  <input
                    type="number"
                    min={10}
                    value={targetAttendees}
                    onChange={(e) => setTargetAttendees(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Fecha Inicio *</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Fecha Fin *</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Ciudad / Municipio</label>
                  <input
                    type="text"
                    value={locationCity}
                    onChange={(e) => setLocationCity(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Dirección / Sede</label>
                  <input
                    type="text"
                    placeholder="Ej. Centro Comunitario Siglo XXI"
                    value={locationAddress}
                    onChange={(e) => setLocationAddress(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
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
                  {isSubmitting ? "Guardando..." : "Crear Campaña"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🚀 Modal / Drawer: Jornada de Tamizaje en Campo & IA de Acompañamiento */}
      {isScreeningModalOpen && selectedCampaign && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 lg:p-8 space-y-6 shadow-2xl border border-slate-100 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-rose-600" />
                  Jornada de Tamizaje: {selectedCampaign.name}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedCampaign.locationCity} • {selectedCampaign.cause} • {selectedCampaign.screenedAttendees} / {selectedCampaign.targetAttendees} personas atendidas
                </p>
              </div>
              <button
                onClick={() => setIsScreeningModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Form: Nuevo Registro de Tamizaje */}
              <form onSubmit={handleCreateScreening} className="space-y-3.5 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <PlusCircle className="w-4 h-4 text-indigo-600" />
                  Registrar Asistente & Parámetros
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Nombre del Asistente *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. María Elena Beltrán"
                      value={attendeeName}
                      onChange={(e) => setAttendeeName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">CURP (Opcional)</label>
                    <input
                      type="text"
                      maxLength={18}
                      placeholder="CURP (18 Dígitos)"
                      value={attendeeCurp}
                      onChange={(e) => setAttendeeCurp(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-mono uppercase"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Teléfono</label>
                    <input
                      type="tel"
                      placeholder="+52 668 123 4567"
                      value={attendeePhone}
                      onChange={(e) => setAttendeePhone(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Tipo de Tamizaje *</label>
                    <select
                      value={screeningType}
                      onChange={(e) => setScreeningType(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
                    >
                      <option value="VISUAL_ACUITY">Salud Visual (Agudeza OD/OI)</option>
                      <option value="GLUCOSE">Glucosa Capilar (mg/dL)</option>
                      <option value="BLOOD_PRESSURE">Presión Arterial (Sistólica/Diastólica)</option>
                      <option value="MAMMOGRAPHY_SCREENING">Tamizaje Mastográfico</option>
                      <option value="BMI_OBESITY">Índice Masa Corporal (IMC)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Parámetro Principal</label>
                    <input
                      type="text"
                      placeholder="Ej. 20/200 o 145 mg/dL"
                      value={param1}
                      onChange={(e) => setParam1(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Nivel de Riesgo Observado</label>
                    <select
                      value={riskLevel}
                      onChange={(e) => setRiskLevel(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-xl font-bold ${
                        riskLevel === "HIGH_RISK"
                          ? "bg-rose-50 border-rose-300 text-rose-800"
                          : riskLevel === "MODERATE_RISK"
                          ? "bg-amber-50 border-amber-300 text-amber-800"
                          : "bg-emerald-50 border-emerald-300 text-emerald-800"
                      }`}
                    >
                      <option value="NORMAL">Normal / Sin Riesgo Inmediato</option>
                      <option value="MODERATE_RISK">Riesgo Moderado</option>
                      <option value="HIGH_RISK">Riesgo Alto (Canalización Urgente)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Observaciones de Campo</label>
                  <textarea
                    rows={2}
                    placeholder="Detalles observados durante la valoración..."
                    value={observations}
                    onChange={(e) => setObservations(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
                  />
                </div>

                {/* AI Accompaniment Button */}
                <div className="p-3 bg-gradient-to-r from-rose-900 to-slate-900 text-white rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-rose-200 flex items-center gap-1.5 text-xs">
                      <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                      IA de Acompañamiento
                    </span>
                    <button
                      type="button"
                      onClick={handleGenerateAiSummary}
                      disabled={isGeneratingAi}
                      className="text-[10px] font-bold bg-rose-600 hover:bg-rose-700 px-2.5 py-1 rounded-lg transition-all shadow-xs"
                    >
                      {isGeneratingAi ? "Sintetizando..." : "Sintetizar Datos"}
                    </button>
                  </div>
                  {aiSummary ? (
                    <p className="text-[11px] text-slate-200 whitespace-pre-line leading-relaxed font-sans">
                      {aiSummary}
                    </p>
                  ) : (
                    <p className="text-[10px] text-slate-400">
                      Organiza los datos recopilados y sugiere preguntas de seguimiento para el médico (No diagnóstica).
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md transition-all disabled:opacity-50"
                >
                  {isSubmitting ? "Guardando..." : "Registrar Tamizaje en Padrón"}
                </button>
              </form>

              {/* History Table of Screenings */}
              <div className="space-y-3 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-emerald-600" />
                    Atenciones Registradas en Esta Jornada
                  </h4>
                  <span className="text-xs font-bold text-slate-600">
                    {screeningsList.length} registros
                  </span>
                </div>

                {isLoadingScreenings ? (
                  <div className="py-12 text-center text-slate-400 text-xs">Cargando registros...</div>
                ) : (
                  <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                    {screeningsList.map((rec) => (
                      <div
                        key={rec.id}
                        className="p-3 bg-slate-50 border border-slate-200/90 rounded-xl space-y-1.5 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{rec.attendeeName}</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              rec.riskLevel === "HIGH_RISK"
                                ? "bg-rose-100 text-rose-800"
                                : rec.riskLevel === "MODERATE_RISK"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            {rec.riskLevel}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2">
                          <span className="font-semibold text-slate-700">{rec.screeningType}</span>
                          <span>•</span>
                          <span>{rec.screenedAt ? rec.screenedAt.substring(0, 10) : "Hoy"}</span>
                        </div>
                        {rec.observations && (
                          <p className="text-[11px] text-slate-600 leading-snug">{rec.observations}</p>
                        )}
                        {rec.aiSummary && (
                          <div className="p-2 bg-indigo-50/60 rounded-lg text-[10px] text-indigo-900 border border-indigo-100/60">
                            {rec.aiSummary}
                          </div>
                        )}
                      </div>
                    ))}

                    {screeningsList.length === 0 && (
                      <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-slate-100">
                        Aún no se han registrado tamizajes en esta jornada.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
