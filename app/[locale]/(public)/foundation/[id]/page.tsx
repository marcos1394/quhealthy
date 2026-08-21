"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/no-giant-component */
/* eslint-disable @next/next/no-img-element */

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
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
  Clock,
  X,
  ExternalLink,
  MessageCircle,
  ChevronLeft,
  Share,
} from "lucide-react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { useMyFavorites } from "@/hooks/useMyFavorites";
import { foundationService } from "@/services/foundation.service";
import {
  FoundationPublicStorefront,
  FoundationProgram,
  FoundationCampaign,
  PublicProgramApplicationPayload,
  PublicCampaignPreregisterPayload,
} from "@/types/foundation";
import { FoundationStorefrontHero } from "@/components/foundation/FoundationStorefrontHero";
import { FoundationStickyActionCard } from "@/components/foundation/FoundationStickyActionCard";
import { cn } from "@/lib/utils";

type FoundationTabType = "programs" | "campaigns" | "transparency" | "location";

export default function FoundationPublicStorefrontPage() {
  const params = useParams();
  const router = useRouter();
  const foundationId = Number(params?.id);

  const [storefront, setStorefront] = useState<FoundationPublicStorefront | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FoundationTabType>("programs");

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

  const { favoriteIds: favoriteFoundationIds } = useMyFavorites("FOUNDATION");

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

  const handleOpenApplyModal = (program?: FoundationProgram | null) => {
    const targetProgram =
      program || (storefront?.programs && storefront.programs.length > 0 ? storefront.programs[0] : null);
    setSelectedProgram(targetProgram);
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
      <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex flex-col items-center justify-center transition-colors duration-300">
        <QhSpinner size="lg" className="text-rose-600" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-4 animate-pulse">
          Cargando Portal Institucional...
        </p>
      </div>
    );
  }

  if (!storefront) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex flex-col items-center justify-center px-6 text-center transition-colors duration-300">
        <div className="w-16 h-16 border border-rose-500 bg-rose-50 dark:bg-rose-900/10 flex items-center justify-center rounded-2xl mb-6">
          <AlertCircle className="w-6 h-6 text-rose-500" strokeWidth={1.5} />
        </div>
        <h1 className="text-xl font-bold tracking-tight uppercase text-black dark:text-white mb-2">
          Institución No Encontrada
        </h1>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 max-w-md mx-auto mb-8">
          LA FUNDACIÓN SOLICITADA NO EXISTE O SE ENCUENTRA EN PROCESO DE ACREDITACIÓN PÚBLICA.
        </p>
        <Button
          variant="outline"
          onClick={() => router.push("/discover?type=FOUNDATION")}
          className="rounded-xl border border-black dark:border-white bg-transparent hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black h-12 px-8 text-[10px] font-bold uppercase tracking-widest transition-colors cursor-pointer"
        >
          Retornar a Búsqueda
        </Button>
      </div>
    );
  }

  const primaryColor = storefront.primaryColor || "#e11d48";
  const title = storefront.brandName || storefront.legalName;

  const filteredPrograms = (storefront.programs || []).filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCause = selectedCause === "ALL" || p.cause === selectedCause;
    return matchesSearch && matchesCause;
  });

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] pb-40 font-sans selection:bg-gray-200 dark:selection:bg-white/20 text-black dark:text-white transition-colors duration-300">
      {/* ── BREADCRUMBS Y NAVEGACIÓN SUPERIOR ────────────────────────── */}
      <div className="border-b border-gray-100 dark:border-gray-800/80 bg-white dark:bg-[#0a0a0a]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between text-xs text-gray-500 font-medium">
          <div className="flex items-center gap-2 truncate">
            <Link
              href="/discover?type=FOUNDATION"
              className="hover:text-rose-600 dark:hover:text-rose-400 flex items-center gap-1 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Discover</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300 dark:text-gray-700 shrink-0" />
            <span className="text-gray-400">Fundaciones & Apoyo Social</span>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300 dark:text-gray-700 shrink-0" />
            <span className="text-gray-900 dark:text-white font-bold truncate">
              {title}
            </span>
          </div>

          <Badge className="bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50 rounded-full text-[10px] font-bold px-2.5 py-0.5 hidden sm:inline-flex">
            Portal Oficial Verificado
          </Badge>
        </div>
      </div>

      {/* ── HERO SECTION HOMOLOGADO ─────────────────────────────────── */}
      <FoundationStorefrontHero
        storefront={storefront}
        isFavorited={favoriteFoundationIds.has(storefront.id)}
      />

      {/* ── NAVEGACIÓN TABULAR ARQUITECTÓNICA STICKY ──────────────────── */}
      <div className="sticky top-0 z-40 bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex w-full overflow-x-auto custom-scrollbar gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab("programs")}
              className={cn(
                "h-14 px-4 sm:px-6 text-[11px] font-bold uppercase tracking-wider transition-colors border-b-2 flex items-center gap-2.5 whitespace-nowrap cursor-pointer",
                activeTab === "programs"
                  ? "border-rose-600 text-rose-600 dark:border-rose-500 dark:text-rose-400"
                  : "text-gray-500 hover:text-black dark:hover:text-white border-transparent"
              )}
            >
              <Stethoscope className="w-4 h-4" />
              <span>Programas Asistenciales</span>
              <span className="border border-current px-1.5 py-0.2 rounded-md text-[9px] font-mono">
                {storefront.programs?.length || 0}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("campaigns")}
              className={cn(
                "h-14 px-4 sm:px-6 text-[11px] font-bold uppercase tracking-wider transition-colors border-b-2 flex items-center gap-2.5 whitespace-nowrap cursor-pointer",
                activeTab === "campaigns"
                  ? "border-rose-600 text-rose-600 dark:border-rose-500 dark:text-rose-400"
                  : "text-gray-500 hover:text-black dark:hover:text-white border-transparent"
              )}
            >
              <Activity className="w-4 h-4" />
              <span>Jornadas & Campañas</span>
              <span className="border border-current px-1.5 py-0.2 rounded-md text-[9px] font-mono">
                {storefront.campaigns?.length || 0}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("transparency")}
              className={cn(
                "h-14 px-4 sm:px-6 text-[11px] font-bold uppercase tracking-wider transition-colors border-b-2 flex items-center gap-2.5 whitespace-nowrap cursor-pointer",
                activeTab === "transparency"
                  ? "border-rose-600 text-rose-600 dark:border-rose-500 dark:text-rose-400"
                  : "text-gray-500 hover:text-black dark:hover:text-white border-transparent"
              )}
            >
              <Award className="w-4 h-4" />
              <span>Impacto & Transparencia Legal</span>
            </button>

            <button
              onClick={() => setActiveTab("location")}
              className={cn(
                "h-14 px-4 sm:px-6 text-[11px] font-bold uppercase tracking-wider transition-colors border-b-2 flex items-center gap-2.5 whitespace-nowrap cursor-pointer",
                activeTab === "location"
                  ? "border-rose-600 text-rose-600 dark:border-rose-500 dark:text-rose-400"
                  : "text-gray-500 hover:text-black dark:hover:text-white border-transparent"
              )}
            >
              <MapPin className="w-4 h-4" />
              <span>Sede & Contacto</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── CONTENIDO PRINCIPAL: GRID DE 2 COLUMNAS ───────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-10">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* COLUMNA IZQUIERDA (CATÁLOGO & CONTENIDO) */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              {/* ── TAB 1: PROGRAMAS ASISTENCIALES ── */}
              {activeTab === "programs" && (
                <motion.div
                  key="programs"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  {/* Barra de Filtro y Buscador */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-50/70 dark:bg-[#050505] p-3 sm:p-4 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-2xs">
                    <div className="relative flex-1 w-full">
                      <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Buscar programa por causa médica o tipo de apoyo..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 text-xs border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all placeholder:text-gray-400"
                      />
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                      <Filter className="w-4 h-4 text-gray-400 shrink-0" />
                      <select
                        value={selectedCause}
                        onChange={(e) => setSelectedCause(e.target.value)}
                        className="text-xs border border-gray-200 dark:border-gray-800 rounded-2xl px-3 py-2 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 font-medium focus:outline-none cursor-pointer w-full sm:w-auto"
                      >
                        <option value="ALL">Todas las Causas</option>
                        <option value="VISUAL">Salud Visual / Cataratas</option>
                        <option value="ONCOLOGY">Oncología & Quimioterapia</option>
                        <option value="RENAL">Salud Renal & Hemodiálisis</option>
                        <option value="DIABETES">Diabetes & Metabolismo</option>
                        <option value="PEDIATRIC">Pediatría & Nutrición</option>
                        <option value="CARDIOVASCULAR">Cardiovascular</option>
                        <option value="GENERAL_HEALTH">Salud Integral Asistencial</option>
                      </select>
                    </div>
                  </div>

                  {/* Listado de Tarjetas de Programas */}
                  {filteredPrograms.length === 0 ? (
                    <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl p-12 text-center border border-dashed border-gray-200 dark:border-gray-800">
                      <Stethoscope className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-700" />
                      <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white">
                        Sin Programas Encontrados
                      </h3>
                      <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                        No hay programas que coincidan con los filtros aplicados. Intenta cambiar el término de búsqueda.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {filteredPrograms.map((prog) => (
                        <div
                          key={prog.id}
                          className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-6 md:p-8 rounded-3xl shadow-2xs hover:shadow-lg transition-all group relative space-y-5"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            <div className="space-y-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge className="bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 rounded-full text-[10px] font-bold px-2.5 py-0.5 shadow-2xs">
                                  {prog.cause || "SALUD ASISTENCIAL"}
                                </Badge>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40">
                                  Convocatoria Abierta
                                </span>
                              </div>

                              <h3 className="font-bold text-lg text-gray-900 dark:text-white leading-snug">
                                {prog.name}
                              </h3>

                              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl">
                                {prog.description || "Programa asistencial enfocado en brindar subsidios y atención médica especializada a pacientes vulnerables."}
                              </p>
                            </div>

                            <div className="shrink-0 flex sm:flex-col items-end justify-between sm:justify-start gap-2">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-900/40">
                                100% Subsidio
                              </span>
                            </div>
                          </div>

                          {/* Tipos de Apoyo Incluidos */}
                          {prog.supportTypes && prog.supportTypes.length > 0 && (
                            <div className="space-y-1.5 pt-2 border-t border-gray-100 dark:border-gray-800">
                              <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider block">
                                Apoyos y Servicios Cubiertos:
                              </span>
                              <div className="flex flex-wrap gap-2">
                                {prog.supportTypes.map((st, i) => (
                                  <span
                                    key={i}
                                    className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-gray-700 dark:text-gray-300"
                                  >
                                    {st === "MEDICATION"
                                      ? "💊 Medicamentos de Patente"
                                      : st === "CONSULTATION"
                                      ? "🩺 Consultas con Especialistas"
                                      : st === "SURGERY"
                                      ? "🏥 Cirugías & Procedimientos"
                                      : st === "LABS"
                                      ? "🧪 Estudios de Laboratorio"
                                      : st === "REHABILITATION"
                                      ? "♿ Fisioterapia & Terapia"
                                      : st === "PSYCHOLOGY"
                                      ? "🧠 Acompañamiento Psicológico"
                                      : st}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Documentación Requerida */}
                          {prog.requiredDocuments && prog.requiredDocuments.length > 0 && (
                            <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400 pt-1">
                              <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider block">
                                Requisitos Básicos:
                              </span>
                              <p className="line-clamp-1">
                                {prog.requiredDocuments.join(" • ")}
                              </p>
                            </div>
                          )}

                          {/* Botón de Postulación */}
                          <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <span className="text-xs text-gray-500">
                              Evaluación socioeconómica confidencial y acompañamiento directo.
                            </span>

                            <Button
                              onClick={() => handleOpenApplyModal(prog)}
                              className="rounded-2xl h-11 px-6 text-xs font-bold text-white shadow-md hover:brightness-105 transition-all flex items-center justify-center gap-2 cursor-pointer border-0 w-full sm:w-auto"
                              style={{ backgroundColor: primaryColor }}
                            >
                              <Stethoscope className="w-4 h-4" />
                              <span>Solicitar Apoyo a este Programa</span>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* ── TAB 2: JORNADAS & CAMPAÑAS COMUNITARIAS ── */}
              {activeTab === "campaigns" && (
                <motion.div
                  key="campaigns"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  {(!storefront.campaigns || storefront.campaigns.length === 0) ? (
                    <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl p-12 text-center border border-dashed border-gray-200 dark:border-gray-800">
                      <Activity className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-700" />
                      <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white">
                        Sin Jornadas Programadas Actualmente
                      </h3>
                      <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                        La institución publicará próximas fechas de ferias comunitarias y jornadas médicas preventivas en este apartado.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {storefront.campaigns.map((camp) => (
                        <div
                          key={camp.id}
                          className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-6 rounded-3xl shadow-2xs hover:shadow-lg transition-all flex flex-col justify-between space-y-4"
                        >
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Badge className="bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 rounded-full text-[10px] font-bold px-2.5 py-0.5">
                                {camp.cause || "JORNADA PREVENTIVA"}
                              </Badge>
                              <span className="text-[10px] font-bold uppercase text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                                {camp.status || "CONFIRMADA"}
                              </span>
                            </div>

                            <h3 className="font-bold text-base text-gray-900 dark:text-white">
                              {camp.name}
                            </h3>

                            {camp.description && (
                              <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-3 leading-relaxed">
                                {camp.description}
                              </p>
                            )}

                            <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-600 dark:text-gray-400">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-3.5 h-3.5 text-rose-600" />
                                <span>{camp.startDate} {camp.endDate ? `al ${camp.endDate}` : ""}</span>
                              </div>
                              {camp.locationAddress && (
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-3.5 h-3.5 text-rose-600" />
                                  <span className="truncate">{camp.locationAddress}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <Button
                            onClick={() => handleOpenPreregisterModal(camp)}
                            className="w-full h-10 rounded-2xl text-xs font-bold text-white shadow-xs cursor-pointer border-0 mt-2"
                            style={{ backgroundColor: primaryColor }}
                          >
                            Pre-registrarse a Jornada
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* ── TAB 3: IMPACTO & TRANSPARENCIA LEGAL ── */}
              {activeTab === "transparency" && (
                <motion.div
                  key="transparency"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  {/* Misión y Visión */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-6 rounded-3xl space-y-3">
                      <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                        <HeartHandshake className="w-5 h-5" />
                        <h4 className="font-bold text-sm uppercase tracking-wider text-gray-900 dark:text-white">
                          Misión Institucional
                        </h4>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                        {storefront.mission || "Brindar atención médica, subsidios y acompañamiento integral a personas en situación de vulnerabilidad para transformar su calidad de vida y salud."}
                      </p>
                    </div>

                    <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-6 rounded-3xl space-y-3">
                      <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                        <Sparkles className="w-5 h-5" />
                        <h4 className="font-bold text-sm uppercase tracking-wider text-gray-900 dark:text-white">
                          Visión de Futuro
                        </h4>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                        {storefront.vision || "Ser un referente de transparencia, impacto y equidad en salud, asegurando que ningún paciente vulnerable quede sin tratamiento médico oportuno."}
                      </p>
                    </div>
                  </div>

                  {/* Marco Legal & Acreditaciones */}
                  <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-6 md:p-8 rounded-3xl space-y-6">
                    <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                      <ShieldCheck className="w-5 h-5 text-emerald-600" />
                      <h4 className="font-bold text-base">
                        Marco Jurídico, Fiscal y Transparencia
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="p-4 rounded-2xl bg-gray-50/60 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 space-y-1">
                        <span className="text-[10px] font-bold uppercase text-gray-400 block">
                          Régimen Institucional
                        </span>
                        <span className="font-bold text-xs text-gray-900 dark:text-white">
                          {storefront.organizationType || "Organización de la Sociedad Civil"}
                        </span>
                      </div>

                      <div className="p-4 rounded-2xl bg-gray-50/60 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 space-y-1">
                        <span className="text-[10px] font-bold uppercase text-gray-400 block">
                          Estatus SAT
                        </span>
                        <span className="font-bold text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Donataria Autorizada
                        </span>
                      </div>

                      <div className="p-4 rounded-2xl bg-gray-50/60 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 space-y-1">
                        <span className="text-[10px] font-bold uppercase text-gray-400 block">
                          Registro Federal CLUNI
                        </span>
                        <span className="font-bold text-xs font-mono text-gray-900 dark:text-white">
                          {storefront.cluniNumber || "En Trámite / Acreditado"}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-xs text-gray-700 dark:text-gray-300 leading-relaxed space-y-2">
                      <p className="font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                        <Award className="w-4 h-4" />
                        Compromiso de Rendición de Cuentas y Ética Médica
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        Esta institución opera bajo supervisión de su Patronato y reporta periódicamente al Servicio de Administración Tributaria (SAT). El 100% de las donaciones y subsidios recibidos son canalizados a programas asistenciales, consultas, medicamentos y cirugías para pacientes vulnerables.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── TAB 4: SEDE & CONTACTO ── */}
              {activeTab === "location" && (
                <motion.div
                  key="location"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-6 md:p-8 rounded-3xl space-y-6">
                    <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                      <MapPin className="w-5 h-5 text-rose-600" />
                      <h4 className="font-bold text-base">
                        Sede de Atención y Canales Directos
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-4 text-xs">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider block">
                            Ubicación Geográfica
                          </span>
                          <p className="font-semibold text-gray-900 dark:text-white text-sm">
                            {storefront.addressCity ? `${storefront.addressCity}, ${storefront.addressState || "México"}` : "Sede Central"}
                          </p>
                        </div>

                        {storefront.contactPhone && (
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider block">
                              Teléfono de Atención Ciudadana
                            </span>
                            <a
                              href={`tel:${storefront.contactPhone}`}
                              className="font-mono font-bold text-rose-600 hover:underline flex items-center gap-1.5"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              {storefront.contactPhone}
                            </a>
                          </div>
                        )}

                        {storefront.contactEmail && (
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider block">
                              Correo de Trabajo Social
                            </span>
                            <a
                              href={`mailto:${storefront.contactEmail}`}
                              className="font-medium text-rose-600 hover:underline flex items-center gap-1.5"
                            >
                              <Mail className="w-3.5 h-3.5" />
                              {storefront.contactEmail}
                            </a>
                          </div>
                        )}
                      </div>

                      <div className="p-5 rounded-2xl bg-gray-50/80 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 space-y-3">
                        <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider block">
                          Recepción de Expedientes y Vales
                        </span>
                        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                          Puedes acudir directamente a la sede o iniciar tu postulación digital en este portal para recibir un folio de atención previo.
                        </p>
                        <Button
                          onClick={() => handleOpenApplyModal()}
                          className="w-full rounded-xl text-xs font-bold text-white shadow-xs cursor-pointer border-0"
                          style={{ backgroundColor: primaryColor }}
                        >
                          Iniciar Postulación Digital
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* COLUMNA DERECHA (SIDEBAR STICKY INSTITUCIONAL) */}
          <div className="w-full lg:w-80 shrink-0">
            <FoundationStickyActionCard
              storefront={storefront}
              onApplyClick={() => handleOpenApplyModal()}
              primaryProgram={storefront.programs?.[0]}
            />
          </div>
        </div>
      </div>

      {/* ── MODAL: POSTULACIÓN A PROGRAMA ASISTENCIAL ────────────────── */}
      {applyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-800 space-y-5 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <div className="space-y-0.5">
                <span className="text-[10px] font-extrabold uppercase text-rose-600 tracking-wider">
                  Postulación de Paciente
                </span>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Solicitud de Apoyo Médico
                </h3>
                {selectedProgram && (
                  <p className="text-xs text-gray-500 font-medium truncate">
                    Programa: {selectedProgram.name}
                  </p>
                )}
              </div>
              <button
                onClick={() => setApplyModalOpen(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {applicationSuccess ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md shadow-emerald-600/10">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                  ¡Solicitud Registrada con Éxito!
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
                  Tu postulación ha sido enviada al equipo de trabajo social de <b>{title}</b>. Te contactaremos vía WhatsApp o telefónica para validar documentación y programar tu atención médica.
                </p>
                <div className="pt-4">
                  <Button
                    onClick={() => setApplyModalOpen(false)}
                    className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold px-6 py-2.5 rounded-2xl shadow-sm cursor-pointer"
                  >
                    Entendido
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitApplication} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                      Nombre(s) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. María Elena"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-[#050505] text-gray-900 dark:text-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                      Apellidos *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. López Pérez"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-[#050505] text-gray-900 dark:text-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                      CURP (18 caracteres) *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={18}
                      placeholder="ABCD900101HDFRRN01"
                      value={curp}
                      onChange={(e) => setCurp(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-[#050505] text-gray-900 dark:text-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 font-mono uppercase"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                      Teléfono Móvil / WhatsApp *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="Ej. 668 123 4567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-[#050505] text-gray-900 dark:text-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                      Correo Electrónico
                    </label>
                    <input
                      type="email"
                      placeholder="ejemplo@correo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-[#050505] text-gray-900 dark:text-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                      Ciudad / Municipio
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Los Mochis"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-[#050505] text-gray-900 dark:text-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                    Exposición de Caso / Motivo de Solicitud *
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Describe tu situación médica actual, diagnóstico y por qué requieres el apoyo asistencial..."
                    value={caseSummary}
                    onChange={(e) => setCaseSummary(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-[#050505] text-gray-900 dark:text-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 leading-relaxed"
                  />
                </div>

                <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setApplyModalOpen(false)}
                    className="rounded-xl border-gray-200 dark:border-gray-800 text-xs font-bold"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isApplying}
                    className="rounded-xl text-xs font-bold text-white shadow-md transition-all cursor-pointer border-0"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {isApplying ? "Enviando Solicitud..." : "Enviar Solicitud de Apoyo"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── MODAL: PRE-REGISTRO A CAMPAÑA ────────────────────────────── */}
      {preregisterModalOpen && selectedCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-800 space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <div className="space-y-0.5">
                <span className="text-[10px] font-extrabold uppercase text-rose-600 tracking-wider">
                  Jornada de Salud Preventiva
                </span>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Pre-registro de Asistencia
                </h3>
                <p className="text-xs text-gray-500 font-medium truncate">{selectedCampaign.name}</p>
              </div>
              <button
                onClick={() => setPreregisterModalOpen(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {preregisterSuccess ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md shadow-emerald-600/10">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white">¡Pre-registro Exitoso!</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
                  Has quedado registrado para la jornada <b>{selectedCampaign.name}</b>. Presenta tu identificación oficial al módulo de recepción de la sede.
                </p>
                <div className="pt-4">
                  <Button
                    onClick={() => setPreregisterModalOpen(false)}
                    className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold px-6 py-2.5 rounded-2xl shadow-sm cursor-pointer"
                  >
                    Cerrar
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitPreregister} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                    Nombre Completo del Asistente *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Juan Manuel Castro"
                    value={attendeeName}
                    onChange={(e) => setAttendeeName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-[#050505] text-gray-900 dark:text-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                      CURP (Opcional)
                    </label>
                    <input
                      type="text"
                      maxLength={18}
                      placeholder="18 caracteres"
                      value={attendeeCurp}
                      onChange={(e) => setAttendeeCurp(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-[#050505] text-gray-900 dark:text-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 font-mono uppercase"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                      Teléfono de Contacto *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="Ej. 668 987 6543"
                      value={attendeePhone}
                      onChange={(e) => setAttendeePhone(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-[#050505] text-gray-900 dark:text-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                    Tipo de Tamizaje de Interés
                  </label>
                  <select
                    value={screeningInterest}
                    onChange={(e) => setScreeningInterest(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-[#050505] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 cursor-pointer"
                  >
                    <option value="GENERAL_CHECKUP">Chequeo General de Signos</option>
                    <option value="VISUAL_ACUITY">Tamizaje Visual & Agudeza Ocular</option>
                    <option value="GLUCOSE_BP">Glucosa y Presión Arterial</option>
                    <option value="MAMMOGRAPHY">Detección Oportuna / Mastografía</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                    Observaciones o Requerimientos Especiales
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Requiere asistencia para traslado o silla de ruedas"
                    value={attendeeNotes}
                    onChange={(e) => setAttendeeNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-[#050505] text-gray-900 dark:text-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  />
                </div>

                <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setPreregisterModalOpen(false)}
                    className="rounded-xl border-gray-200 dark:border-gray-800 text-xs font-bold"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isPreregistering}
                    className="rounded-xl text-xs font-bold text-white shadow-md transition-all cursor-pointer border-0"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {isPreregistering ? "Registrando..." : "Confirmar Pre-registro"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
