"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/no-giant-component */

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  HeartHandshake,
  ShieldCheck,
  Award,
  CheckCircle2,
  Calendar,
  MapPin,
  Mail,
  Phone,
  Globe,
  FileText,
  Users,
  Activity,
  Stethoscope,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Filter,
  Search,
  AlertCircle,
  HelpCircle,
  Clock,
  X,
  ExternalLink,
} from "lucide-react";
import { toast } from "react-toastify";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { foundationService } from "@/services/foundation.service";
import {
  FoundationPublicStorefront,
  FoundationProgram,
  FoundationCampaign,
  PublicProgramApplicationPayload,
  PublicCampaignPreregisterPayload,
} from "@/types/foundation";

export default function FoundationPublicStorefrontPage() {
  const params = useParams();
  const router = useRouter();
  const foundationId = Number(params?.id);

  const [storefront, setStorefront] = useState<FoundationPublicStorefront | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"programs" | "campaigns" | "transparency">("programs");

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCause, setSelectedCause] = useState("ALL");

  // Modal States
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<FoundationProgram | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [applicationSuccess, setApplicationSuccess] = useState(false);

  // Application Form State
  const [curp, setCurp] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [vulnerabilityLevel, setVulnerabilityLevel] = useState("MEDIUM");
  const [socioEconomicLevel, setSocioEconomicLevel] = useState("C");
  const [caseSummary, setCaseSummary] = useState("");
  const [notes, setNotes] = useState("");

  // Campaign Pre-registration Modal State
  const [preregisterModalOpen, setPreregisterModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<FoundationCampaign | null>(null);
  const [isPreregistering, setIsPreregistering] = useState(false);
  const [preregisterSuccess, setPreregisterSuccess] = useState(false);

  const [attendeeName, setAttendeeName] = useState("");
  const [attendeeCurp, setAttendeeCurp] = useState("");
  const [attendeePhone, setAttendeePhone] = useState("");
  const [screeningInterest, setScreeningInterest] = useState("GENERAL_CHECKUP");
  const [attendeeNotes, setAttendeeNotes] = useState("");

  useEffect(() => {
    if (!foundationId || isNaN(foundationId)) {
      setIsLoading(false);
      return;
    }

    foundationService
      .getPublicStorefront(foundationId)
      .then((data) => {
        setStorefront(data);
      })
      .catch(() => {
        toast.error("No se pudo cargar la información de la institución.");
      })
      .finally(() => setIsLoading(false));
  }, [foundationId]);

  const handleOpenApplyModal = (program: FoundationProgram) => {
    setSelectedProgram(program);
    setApplicationSuccess(false);
    setApplyModalOpen(true);
  };

  const handleOpenPreregisterModal = (campaign: FoundationCampaign) => {
    setSelectedCampaign(campaign);
    setPreregisterSuccess(false);
    setPreregisterModalOpen(true);
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProgram || !foundationId) return;

    if (!curp || curp.trim().length !== 18) {
      toast.warning("Ingresa una CURP válida a 18 caracteres.");
      return;
    }
    if (!firstName.trim() || !lastName.trim()) {
      toast.warning("Ingresa tu nombre completo.");
      return;
    }
    if (!phone.trim()) {
      toast.warning("Ingresa un número de teléfono de contacto.");
      return;
    }
    if (!caseSummary.trim()) {
      toast.warning("Describe brevemente tu situación médica o motivo de solicitud.");
      return;
    }

    try {
      setIsApplying(true);
      const payload: PublicProgramApplicationPayload = {
        programId: selectedProgram.id,
        curp: curp.trim().toUpperCase(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim() || undefined,
        phone: phone.trim(),
        city: city.trim() || undefined,
        state: stateName.trim() || undefined,
        vulnerabilityLevel,
        socioEconomicLevel,
        caseSummary: caseSummary.trim(),
        notes: notes.trim() || undefined,
      };

      await foundationService.applyToProgramPublic(foundationId, payload);
      setApplicationSuccess(true);
      toast.success("¡Solicitud de apoyo enviada con éxito!");
    } catch {
      toast.error("Error al enviar la solicitud de apoyo. Inténtalo de nuevo.");
    } finally {
      setIsApplying(false);
    }
  };

  const handleSubmitPreregister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCampaign) return;

    if (!attendeeName.trim()) {
      toast.warning("Ingresa el nombre del asistente.");
      return;
    }
    if (!attendeePhone.trim()) {
      toast.warning("Ingresa un teléfono de contacto.");
      return;
    }

    try {
      setIsPreregistering(true);
      const payload: PublicCampaignPreregisterPayload = {
        campaignId: selectedCampaign.id,
        attendeeName: attendeeName.trim(),
        attendeeCurp: attendeeCurp.trim().toUpperCase() || undefined,
        attendeePhone: attendeePhone.trim(),
        screeningTypeInterest: screeningInterest,
        notes: attendeeNotes.trim() || undefined,
      };

      await foundationService.preregisterToCampaignPublic(selectedCampaign.id, payload);
      setPreregisterSuccess(true);
      toast.success("¡Pre-registro confirmado para la jornada de salud!");
    } catch {
      toast.error("No se pudo completar el pre-registro.");
    } finally {
      setIsPreregistering(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <QhSpinner size="lg" className="text-rose-600" />
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mt-4 animate-pulse">
          Cargando Tienda Institucional...
        </p>
      </div>
    );
  }

  if (!storefront) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-slate-50">
        <Building2 className="w-16 h-16 text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-800">Institución no encontrada</h2>
        <p className="text-xs text-slate-500 max-w-md mt-1 mb-6">
          La fundación que buscas no existe o aún no ha completado su proceso de acreditación pública.
        </p>
        <button
          onClick={() => router.push("/discover")}
          className="bg-slate-900 text-white text-xs font-bold px-5 py-2.5 rounded-2xl hover:bg-slate-800 transition-all shadow-sm"
        >
          Explorar Discover & Marketplace
        </button>
      </div>
    );
  }

  const filteredPrograms = (storefront.programs || []).filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCause = selectedCause === "ALL" || p.cause === selectedCause;
    return matchesSearch && matchesCause;
  });

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20 font-sans">
      {/* 🚀 Header Breadcrumb */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-2 text-xs text-slate-500">
          <Link href="/discover" className="hover:text-rose-600 font-medium transition-colors">
            Discover
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400">Fundaciones & Apoyo Social</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 font-bold truncate">{storefront.brandName || storefront.legalName}</span>
        </div>
      </div>

      {/* 🏛️ Institutional Hero Storefront */}
      <div className="bg-gradient-to-b from-white to-slate-100/70 border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start gap-4 sm:gap-6">
              {/* Logo / Badge Avatar */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-rose-600 to-rose-800 text-white flex items-center justify-center font-black text-2xl sm:text-3xl shadow-lg shadow-rose-600/20 shrink-0 border-2 border-white">
                {storefront.logoUrl ? (
                  <img
                    src={storefront.logoUrl}
                    alt={storefront.brandName || storefront.legalName}
                    className="w-full h-full object-cover rounded-3xl"
                  />
                ) : (
                  (storefront.brandName || storefront.legalName).substring(0, 2).toUpperCase()
                )}
              </div>

              {/* Title & Badges */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-900 text-white tracking-wide uppercase">
                    {storefront.organizationType || "OSC"}
                  </span>

                  {storefront.isAuthorizedDonatary && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      Donataria Autorizada SAT
                    </span>
                  )}

                  {storefront.cluniNumber && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono">
                      CLUNI: {storefront.cluniNumber}
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
                  {storefront.brandName || storefront.legalName}
                </h1>

                {storefront.legalName && storefront.brandName && (
                  <p className="text-xs text-slate-500 font-medium">{storefront.legalName}</p>
                )}

                {/* Location & Contact Meta */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
                  {storefront.addressCity && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {storefront.addressCity}, {storefront.addressState || "México"}
                    </span>
                  )}

                  {storefront.contactEmail && (
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      {storefront.contactEmail}
                    </span>
                  )}

                  {storefront.contactPhone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {storefront.contactPhone}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Stats Badges */}
            <div className="flex items-center gap-3 w-full md:w-auto bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs self-stretch md:self-auto justify-around sm:justify-start">
              <div className="text-center px-3 border-r border-slate-100">
                <span className="text-xl font-extrabold text-slate-900 block">
                  {storefront.totalActiveProgramsCount || storefront.programs.length || 0}
                </span>
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                  Programas
                </span>
              </div>

              <div className="text-center px-3 border-r border-slate-100">
                <span className="text-xl font-extrabold text-rose-600 block">
                  {storefront.campaigns?.length || 0}
                </span>
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                  Jornadas
                </span>
              </div>

              <div className="text-center px-3">
                <span className="text-xl font-extrabold text-emerald-600 block">
                  {storefront.totalBeneficiariesCount || 0}+
                </span>
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                  Vidas Apoyadas
                </span>
              </div>
            </div>
          </div>

          {/* Mission & Vision */}
          {storefront.mission && (
            <div className="mt-6 pt-6 border-t border-slate-200/80 max-w-4xl">
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                <span className="font-bold text-slate-900">Misión Institucional: </span>
                {storefront.mission}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 🧭 Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="flex border-b border-slate-200 gap-6">
          <button
            onClick={() => setActiveTab("programs")}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === "programs"
                ? "border-rose-600 text-rose-600"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            Programas Asistenciales ({storefront.programs?.length || 0})
          </button>

          <button
            onClick={() => setActiveTab("campaigns")}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === "campaigns"
                ? "border-rose-600 text-rose-600"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Activity className="w-4 h-4" />
            Campañas & Jornadas Comunitarias ({storefront.campaigns?.length || 0})
          </button>

          <button
            onClick={() => setActiveTab("transparency")}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === "transparency"
                ? "border-rose-600 text-rose-600"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Award className="w-4 h-4" />
            Transparencia & Marco Legal
          </button>
        </div>

        {/* 📋 TAB 1: PROGRAMAS ASISTENCIALES */}
        {activeTab === "programs" && (
          <div className="mt-6 space-y-6 animate-in fade-in duration-300">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar programa por causa médica o tipo de apoyo..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
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
                  <option value="ALL">Todas las Causas</option>
                  <option value="VISUAL">Salud Visual / Cataratas</option>
                  <option value="ONCOLOGY">Oncología</option>
                  <option value="RENAL">Salud Renal</option>
                  <option value="DIABETES">Diabetes & Metabolismo</option>
                  <option value="PEDIATRIC">Pediatría</option>
                  <option value="CARDIOVASCULAR">Cardiovascular</option>
                  <option value="GENERAL_HEALTH">Salud Integral</option>
                </select>
              </div>
            </div>

            {/* Programs Grid */}
            {filteredPrograms.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-400">
                <Stethoscope className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-semibold text-slate-700">No se encontraron programas activos</p>
                <p className="text-xs text-slate-400 mt-1">
                  Intenta ajustar tu término de búsqueda o filtro de causa médica.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPrograms.map((prog) => (
                  <div
                    key={prog.id}
                    className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200">
                          {prog.cause || "SALUD GENERAL"}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Activo
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-slate-900 leading-snug">{prog.name}</h3>

                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                        {prog.description || "Programa asistencial enfocado en brindar subsidios y atención médica especializada a pacientes vulnerables."}
                      </p>

                      {/* Support Types Pills */}
                      {prog.supportTypes && prog.supportTypes.length > 0 && (
                        <div className="space-y-1.5 pt-2">
                          <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
                            Tipos de Apoyo Incluidos:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {prog.supportTypes.map((st, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700"
                              >
                                {st === "MEDICATION"
                                  ? "💊 Fármacos"
                                  : st === "CONSULTATION"
                                  ? "🩺 Consultas"
                                  : st === "SURGERY"
                                  ? "🏥 Cirugías"
                                  : st === "LABS"
                                  ? "🧪 Laboratorios"
                                  : st}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Required Documents Pills */}
                      {prog.requiredDocuments && prog.requiredDocuments.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
                            Requisitos Base:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {prog.requiredDocuments.map((doc, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-50 text-slate-600 border border-slate-100"
                              >
                                {doc === "CURP"
                                  ? "CURP"
                                  : doc === "SOCIOECONOMIC_STUDY"
                                  ? "Estudio Socioeconómico"
                                  : doc === "MEDICAL_SUMMARY"
                                  ? "Dictamen Médico"
                                  : doc === "INCOME_PROOF"
                                  ? "Comprobante de Ingresos"
                                  : doc}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div className="text-[11px] text-slate-500 font-medium">
                        <span className="font-bold text-slate-800">{prog.activeBeneficiariesCount || 0}</span> inscritos
                      </div>

                      <button
                        onClick={() => handleOpenApplyModal(prog)}
                        className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                      >
                        Solicitar Apoyo
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 💉 TAB 2: CAMPAÑAS & JORNADAS COMUNITARIAS */}
        {activeTab === "campaigns" && (
          <div className="mt-6 space-y-6 animate-in fade-in duration-300">
            {storefront.campaigns?.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-400">
                <Activity className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-semibold text-slate-700">No hay jornadas programadas en este momento</p>
                <p className="text-xs text-slate-400 mt-1">
                  La fundación publicará nuevas fechas y sedes de atención comunitaria próximamente.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {storefront.campaigns.map((camp) => (
                  <div
                    key={camp.id}
                    className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {camp.cause || "JORNADA DE SALUD"}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            camp.status === "IN_PROGRESS"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {camp.status === "IN_PROGRESS" ? "● En Curso en Campo" : "Próxima"}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-slate-900">{camp.name}</h3>

                      <p className="text-xs text-slate-600 leading-relaxed">
                        {camp.description || "Jornada comunitaria de tamizaje, detección oportuna y canalización médica especializada."}
                      </p>

                      <div className="space-y-1.5 text-xs text-slate-600 pt-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {camp.startDate} al {camp.endDate}
                          </span>
                        </div>

                        {camp.locationCity && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span>
                              {camp.locationCity} {camp.locationAddress ? `— ${camp.locationAddress}` : ""}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500">
                        Capacidad: <span className="font-bold text-slate-800">{camp.targetAttendees || 100} personas</span>
                      </span>

                      <button
                        onClick={() => handleOpenPreregisterModal(camp)}
                        className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                      >
                        Pre-registrarse
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ⚖️ TAB 3: TRANSPARENCIA & MARCO LEGAL */}
        {activeTab === "transparency" && (
          <div className="mt-6 space-y-6 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <ShieldCheck className="w-8 h-8 text-emerald-600" />
                <h4 className="font-bold text-slate-900 text-sm">Donataria Autorizada SAT</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {storefront.isAuthorizedDonatary
                    ? "Esta institución cuenta con autorización oficial emitida por el Servicio de Administración Tributaria (SAT) para recibir donativos deducibles de impuestos."
                    : "Institución en proceso de certificación fiscal o registro asistencial acreditado."}
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <Award className="w-8 h-8 text-indigo-600" />
                <h4 className="font-bold text-slate-900 text-sm">Registro Federal CLUNI</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {storefront.cluniNumber ? (
                    <>
                      Inscrita en el Registro Federal de las Organizaciones de la Sociedad Civil con folio oficial{" "}
                      <span className="font-mono font-bold text-indigo-700">{storefront.cluniNumber}</span>.
                    </>
                  ) : (
                    "Registro institucional verificado bajo el marco jurídico mexicano correspondiente a su figura legal."
                  )}
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <HeartHandshake className="w-8 h-8 text-rose-600" />
                <h4 className="font-bold text-slate-900 text-sm">No Custodia de Fondos</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  QuHealthy actúa exclusivamente como plataforma tecnológica de validación, trazabilidad y dictamen socioeconómico. No custodia ni intermedia recursos financieros de terceros.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 🚀 MODAL: AUTO-POSTULACIÓN A PROGRAMA */}
      {applyModalOpen && selectedProgram && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="space-y-0.5">
                <span className="text-[10px] font-extrabold uppercase text-rose-600 tracking-wider">
                  Auto-postulación de Paciente
                </span>
                <h3 className="text-lg font-bold text-slate-900">Solicitud de Apoyo</h3>
                <p className="text-xs text-slate-500 font-medium truncate">{selectedProgram.name}</p>
              </div>
              <button
                onClick={() => setApplyModalOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {applicationSuccess ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md shadow-emerald-600/10">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-bold text-slate-900">¡Solicitud Recibida con Éxito!</h4>
                <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                  Tu expediente ha sido creado y canalizado al área de <b>Trabajo Social</b> de la fundación. Un coordinador se pondrá en contacto contigo a través del teléfono o correo proporcionado.
                </p>
                <div className="pt-4">
                  <button
                    onClick={() => setApplyModalOpen(false)}
                    className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-6 py-2.5 rounded-2xl shadow-sm"
                  >
                    Entendido
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitApplication} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Nombre(s) *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. María Elena"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Apellidos *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. López Pérez"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">CURP (18 dígitos) *</label>
                    <input
                      type="text"
                      required
                      maxLength={18}
                      placeholder="ABCD900101HDFRRN01"
                      value={curp}
                      onChange={(e) => setCurp(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 font-mono"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Teléfono Móvil / WhatsApp *</label>
                    <input
                      type="tel"
                      required
                      placeholder="Ej. 668 123 4567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Correo Electrónico</label>
                    <input
                      type="email"
                      placeholder="ejemplo@correo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Ciudad / Municipio</label>
                    <input
                      type="text"
                      placeholder="Ej. Los Mochis"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Exposición de Caso / Motivo de Solicitud *
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Describe tu situación médica actual, diagnóstico y por qué requieres el apoyo de este programa..."
                    value={caseSummary}
                    onChange={(e) => setCaseSummary(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setApplyModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isApplying}
                    className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-5 py-2 rounded-xl transition-all shadow-md shadow-rose-600/20"
                  >
                    {isApplying ? "Enviando..." : "Enviar Postulación"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 🚀 MODAL: PRE-REGISTRO A CAMPAÑA */}
      {preregisterModalOpen && selectedCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="space-y-0.5">
                <span className="text-[10px] font-extrabold uppercase text-indigo-600 tracking-wider">
                  Jornada de Salud Comunitaria
                </span>
                <h3 className="text-lg font-bold text-slate-900">Pre-registro de Asistencia</h3>
                <p className="text-xs text-slate-500 font-medium truncate">{selectedCampaign.name}</p>
              </div>
              <button
                onClick={() => setPreregisterModalOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {preregisterSuccess ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md shadow-emerald-600/10">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-bold text-slate-900">¡Pre-registro Exitoso!</h4>
                <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                  Has quedado registrado para la jornada <b>{selectedCampaign.name}</b>. Presenta tu identificación en el módulo de recepción al llegar a la sede.
                </p>
                <div className="pt-4">
                  <button
                    onClick={() => setPreregisterModalOpen(false)}
                    className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-6 py-2.5 rounded-2xl shadow-sm"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitPreregister} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nombre Completo del Asistente *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Juan Manuel Castro"
                    value={attendeeName}
                    onChange={(e) => setAttendeeName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">CURP (Opcional)</label>
                    <input
                      type="text"
                      maxLength={18}
                      placeholder="18 caracteres"
                      value={attendeeCurp}
                      onChange={(e) => setAttendeeCurp(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-mono"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Teléfono de Contacto *</label>
                    <input
                      type="tel"
                      required
                      placeholder="Ej. 668 987 6543"
                      value={attendeePhone}
                      onChange={(e) => setAttendeePhone(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tipo de Tamizaje de Interés</label>
                  <select
                    value={screeningInterest}
                    onChange={(e) => setScreeningInterest(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="GENERAL_CHECKUP">Chequeo General de Signos</option>
                    <option value="VISUAL_ACUITY">Tamizaje Visual & Agudeza Ocular</option>
                    <option value="GLUCOSE_BP">Glucosa y Presión Arterial</option>
                    <option value="MAMMOGRAPHY">Detección Oportuna / Mastografía</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Observaciones o Requerimientos Especiales</label>
                  <input
                    type="text"
                    placeholder="Ej. Requiere asistencia para traslado / silla de ruedas"
                    value={attendeeNotes}
                    onChange={(e) => setAttendeeNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setPreregisterModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isPreregistering}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2 rounded-xl transition-all shadow-md shadow-indigo-600/20"
                  >
                    {isPreregistering ? "Registrando..." : "Confirmar Pre-registro"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
