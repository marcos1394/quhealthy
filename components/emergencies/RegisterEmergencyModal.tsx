"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useState, useEffect, useRef } from "react";
import {
  UserPlus,
  X,
  Search,
  Activity,
  Sparkles,
  Mic,
  AlertTriangle,
  UserCheck,
  UserX,
  HeartPulse,
  Clock,
  ShieldAlert,
} from "lucide-react";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";

import {
  emergencyService,
  TriageLevel,
} from "@/services/emergency.service";
import { patientDirectoryService } from "@/services/patientDirectory.service";
import { healthOSService } from "@/services/healthOS.service";
import { useSessionStore } from "@/stores/SessionStore";
import { QhSpinner } from "@/components/ui/QhSpinner";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { PatientDirectorySearchResult } from "@/types/patient";
import { cn } from "@/lib/utils";

interface RegisterEmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// Preset chips de motivos frecuentes de urgencias
const FREQUENT_EMERGENCY_REASONS = [
  "Dolor torácico opresivo",
  "Dificultad respiratoria aguda",
  "Traumatismo craneoencefálico",
  "Crisis convulsiva",
  "Hemorragia activa",
  "Dolor abdominal agudo",
  "Sospecha de EVC / Déficit neurológico",
  "Crisis hipertensiva",
];

export const RegisterEmergencyModal: React.FC<RegisterEmergencyModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const t = useTranslations("RegisterEmergencyModal");
  const { user } = useSessionStore();

  // Pestaña activa: "search" | "walkin" | "unidentified"
  const [activeTab, setActiveTab] = useState<"search" | "walkin" | "unidentified">("search");

  // Estado pestaña Búsqueda
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<PatientDirectorySearchResult[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientDirectorySearchResult | null>(null);

  // Estado pestaña Walk-in (Nuevo paciente)
  const [walkinFirstName, setWalkinFirstName] = useState("");
  const [walkinLastName, setWalkinLastName] = useState("");
  const [walkinGender, setWalkinGender] = useState<"MALE" | "FEMALE" | "OTHER">("MALE");
  const [walkinAge, setWalkinAge] = useState("");
  const [walkinPhone, setWalkinPhone] = useState("");

  // Estado pestaña Código Cero (Desconocido)
  const [unidentifiedGender, setUnidentifiedGender] = useState<"MALE" | "FEMALE">("MALE");
  const [unidentifiedApproxAge, setUnidentifiedApproxAge] = useState("~35");

  // Sección Clínica & Triage
  const [reasonForEmergency, setReasonForEmergency] = useState("");
  const [triageLevel, setTriageLevel] = useState<TriageLevel>(TriageLevel.LEVEL_3_URGENT);

  // Signos Vitales Rápidos
  const [bp, setBp] = useState("");
  const [hr, setHr] = useState("");
  const [rr, setRr] = useState("");
  const [spo2, setSpo2] = useState("");
  const [temp, setTemp] = useState("");
  const [glucose, setGlucose] = useState("");

  // Estados Asistente IA de Triage
  const [isAnalyzingAi, setIsAnalyzingAi] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<{
    level: TriageLevel;
    reason: string;
    redFlags?: string[];
  } | null>(null);

  // Dictado de voz para el motivo
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Envío
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Debounced search en el directorio
  useEffect(() => {
    if (activeTab !== "search") return;
    const q = searchQuery.trim();
    if (q.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await patientDirectoryService.searchPatients(q);
        setSearchResults(results || []);
      } catch (err) {
        console.error("Error buscando pacientes:", err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, activeTab]);

  // Limpiar estados al cerrar o abrir
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      setSearchResults([]);
      setSelectedPatient(null);
      setWalkinFirstName("");
      setWalkinLastName("");
      setWalkinAge("");
      setWalkinPhone("");
      setReasonForEmergency("");
      setTriageLevel(TriageLevel.LEVEL_3_URGENT);
      setAiSuggestion(null);
      setBp("");
      setHr("");
      setRr("");
      setSpo2("");
      setTemp("");
      setGlucose("");
    }
  }, [isOpen]);

  // Dictado por voz del motivo con Gemini Transcribe
  const handleToggleVoiceDictation = async () => {
    if (isRecording) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        if (audioBlob.size < 100) return;

        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = (reader.result as string)?.split(",")[1];
          if (!base64Audio) return;

          setIsTranscribing(true);
          try {
            const resp = await healthOSService.transcribeAudio({
              audioBase64: base64Audio,
              mode: "smart",
              mimeType: "audio/webm",
            });
            if (resp && resp.transcribedText) {
              const text = resp.transcribedText.trim();
              setReasonForEmergency((prev) => (prev ? `${prev}. ${text}` : text));
              toast.success("Motivo dictado correctamente con Gemini");
            }
          } catch (err) {
            console.error("Error transcribiendo voz:", err);
            toast.error("No se pudo transcribir el audio.");
          } finally {
            setIsTranscribing(false);
          }
        };
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch {
      toast.warn("Por favor permite el acceso al micrófono.");
    }
  };

  // Asistente IA de Triage (Analiza motivo + signos vitales bajo NOM-027)
  const handleAnalyzeTriageAi = async () => {
    if (!reasonForEmergency.trim() && !bp && !hr && !spo2) {
      toast.info("Ingresa al menos el motivo de urgencia o signos vitales para analizar.");
      return;
    }

    setIsAnalyzingAi(true);
    try {
      // 1. Evaluación heurística inmediata como base
      let suggestedLevel = TriageLevel.LEVEL_3_URGENT;
      let rationale = "Cuadro agudo que requiere evaluación en menos de 30 minutos.";
      const redFlags: string[] = [];

      const spo2Num = parseFloat(spo2);
      const hrNum = parseFloat(hr);
      const lowerReason = reasonForEmergency.toLowerCase();

      if (
        (spo2Num && spo2Num < 88) ||
        (hrNum && (hrNum > 150 || hrNum < 40)) ||
        lowerReason.includes("paro") ||
        lowerReason.includes("resucit") ||
        lowerReason.includes("inconsciente") ||
        lowerReason.includes("cianosis severa")
      ) {
        suggestedLevel = TriageLevel.LEVEL_1_RESUSCITATION;
        rationale = "Inestabilidad hemodinámica / respiratoria inminente. Riesgo vital inmediato.";
        redFlags.push("Compromiso de vía aérea o hemodinámico");
      } else if (
        (spo2Num && spo2Num < 92) ||
        (hrNum && hrNum > 125) ||
        lowerReason.includes("toracico") ||
        lowerReason.includes("infarto") ||
        lowerReason.includes("hemorragia") ||
        lowerReason.includes("convuls") ||
        lowerReason.includes("neurol") ||
        lowerReason.includes("evc")
      ) {
        suggestedLevel = TriageLevel.LEVEL_2_EMERGENT;
        rationale = "Signos de alarma o sospecha de evento cardiovascular/neurológico agudo.";
        redFlags.push("Posible Síndrome Coronario o evento vascular");
      } else if (lowerReason.includes("leve") || lowerReason.includes("curacion") || lowerReason.includes("resfriado")) {
        suggestedLevel = TriageLevel.LEVEL_5_NON_URGENT;
        rationale = "Condición sin compromiso sistémico agudo. Atención no urgente.";
      }

      // 2. Consulta al agente Vertex AI para refinamiento clínico si hay motivo
      try {
        const aiPrompt = `Evalúa el nivel de triage hospitalario (Escala Manchester y NOM-027-SSA3-2013):
Motivo: ${reasonForEmergency}
Signos: PA=${bp || "N/A"}, FC=${hr || "N/A"}, FR=${rr || "N/A"}, SpO2=${spo2 || "N/A"}%, Temp=${temp || "N/A"}°C.
Responde estrictamente en formato JSON: {"level":"LEVEL_1_RESUSCITATION"|"LEVEL_2_EMERGENT"|"LEVEL_3_URGENT"|"LEVEL_4_LESS_URGENT"|"LEVEL_5_NON_URGENT", "rationale":"texto breve"}`;

        const aiResponse: any = await healthOSService.sendIntent(aiPrompt);
        const textResp = aiResponse?.text || aiResponse?.reply || aiResponse?.message || "";
        if (textResp) {
          const jsonMatch = textResp.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            if (parsed.level && Object.values(TriageLevel).includes(parsed.level)) {
              suggestedLevel = parsed.level;
            }
            if (parsed.rationale) {
              rationale = parsed.rationale;
            }
          }
        }
      } catch (e) {
        console.warn("Fallo refinamiento con Gemini, usando evaluación clínica local:", e);
      }

      setTriageLevel(suggestedLevel);
      setAiSuggestion({
        level: suggestedLevel,
        reason: rationale,
        redFlags,
      });
      toast.success("Triage sugerido por IA aplicado.");
    } finally {
      setIsAnalyzingAi(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    let targetPatientDirectoryId = 0;
    let targetConsumerId: number | undefined;
    let targetPatientName = "";

    setIsSubmitting(true);
    try {
      if (activeTab === "search") {
        if (!selectedPatient) {
          toast.warn("Por favor selecciona un paciente o utiliza el registro rápido.");
          setIsSubmitting(false);
          return;
        }
        targetPatientDirectoryId = selectedPatient.id;
        targetConsumerId = selectedPatient.consumerId ?? undefined;
        targetPatientName = `${selectedPatient.firstName} ${selectedPatient.lastName}`.trim();
      } else if (activeTab === "walkin") {
        if (!walkinFirstName.trim()) {
          toast.warn("El nombre del paciente es obligatorio.");
          setIsSubmitting(false);
          return;
        }

        // Calcular fecha estimada de nacimiento basada en edad
        const ageNum = parseInt(walkinAge, 10) || 30;
        const currentYear = new Date().getFullYear();
        const birthYear = currentYear - ageNum;
        const estimatedBirthDate = `${birthYear}-01-01`;

        const newPatient = await patientDirectoryService.createOfflinePatient({
          firstName: walkinFirstName.trim(),
          lastName: walkinLastName.trim() || "Walk-In",
          gender: walkinGender,
          birthDate: estimatedBirthDate,
          phone: walkinPhone.trim() || undefined,
        });

        targetPatientDirectoryId = newPatient?.id || 0;
        targetPatientName = `${walkinFirstName.trim()} ${walkinLastName.trim() || "Walk-In"}`.trim();
      } else if (activeTab === "unidentified") {
        targetPatientDirectoryId = 0;
        const genderLabel = unidentifiedGender === "MALE" ? "Masculino" : "Femenino";
        targetPatientName = `Paciente Desconocido (${genderLabel} ${unidentifiedApproxAge})`;
      }

      // Preparar motivo de urgencia consolidado con signos vitales si fueron ingresados
      const vitalsParts: string[] = [];
      if (bp) vitalsParts.push(`PA:${bp}`);
      if (hr) vitalsParts.push(`FC:${hr}lpm`);
      if (spo2) vitalsParts.push(`SpO2:${spo2}%`);
      if (temp) vitalsParts.push(`T:${temp}°C`);
      if (glucose) vitalsParts.push(`Glu:${glucose}mg/dL`);

      const consolidatedReason = vitalsParts.length > 0
        ? `${reasonForEmergency.trim() || "Atención de urgencia"} [Signos: ${vitalsParts.join(", ")}]`
        : (reasonForEmergency.trim() || "Atención de urgencia");

      // Registrar ingreso con el nuevo endpoint enriquecido
      await emergencyService.registerEmergencyWalkIn({
        providerId: user.id,
        patientDirectoryId: targetPatientDirectoryId,
        consumerId: targetConsumerId,
        patientName: targetPatientName,
        reasonForEmergency: consolidatedReason,
        triageLevel: triageLevel,
      });

      toast.success(t("toast_patient_created"));
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Error al registrar emergencia:", err);
      toast.error(t("error_toast"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const triageOptions = [
    {
      level: TriageLevel.LEVEL_1_RESUSCITATION,
      label: "Nivel 1 • Resucitación",
      time: "Inmediato (0 min)",
      color: "border-red-500 bg-red-500/10 text-red-700 dark:text-red-400 dark:bg-red-950/30",
      activeColor: "bg-red-600 text-white border-red-600 shadow-md",
    },
    {
      level: TriageLevel.LEVEL_2_EMERGENT,
      label: "Nivel 2 • Emergencia",
      time: "< 10 min",
      color: "border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-400 dark:bg-amber-950/30",
      activeColor: "bg-amber-600 text-white border-amber-600 shadow-md",
    },
    {
      level: TriageLevel.LEVEL_3_URGENT,
      label: "Nivel 3 • Urgencia",
      time: "< 30 min",
      color: "border-yellow-500 bg-yellow-500/10 text-yellow-800 dark:text-yellow-400 dark:bg-yellow-950/30",
      activeColor: "bg-yellow-500 text-black border-yellow-500 shadow-md",
    },
    {
      level: TriageLevel.LEVEL_4_LESS_URGENT,
      label: "Nivel 4 • Menor Urgencia",
      time: "< 60 min",
      color: "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 dark:bg-emerald-950/30",
      activeColor: "bg-emerald-600 text-white border-emerald-600 shadow-md",
    },
    {
      level: TriageLevel.LEVEL_5_NON_URGENT,
      label: "Nivel 5 • No Urgente",
      time: "< 120 min",
      color: "border-cyan-500 bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 dark:bg-cyan-950/30",
      activeColor: "bg-cyan-600 text-white border-cyan-600 shadow-md",
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl max-h-[92vh] bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-0 rounded-3xl shadow-2xl overflow-hidden flex flex-col font-sans transition-colors [&>button]:hidden">
        {/* ── HEADER ─────────────────────────────────────────────────── */}
        <div className="p-5 md:p-6 bg-gradient-to-r from-rose-50/70 via-gray-50/50 to-white dark:from-rose-950/20 dark:via-[#050505] dark:to-[#0a0a0a] border-b border-gray-100 dark:border-gray-800 flex items-start justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400 shadow-2xs shrink-0">
              <Activity className="w-6 h-6 animate-pulse" strokeWidth={2.5} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                  {t("subtitle")}
                </span>
                <span className="inline-flex items-center gap-1 text-[9.5px] font-mono px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-300">
                  <Clock className="w-2.5 h-2.5" />
                  NOM-027-SSA3
                </span>
              </div>
              <DialogTitle className="text-lg md:text-xl font-bold text-gray-900 dark:text-white tracking-tight leading-none">
                {t("title")}
              </DialogTitle>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-white dark:bg-[#111] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 cursor-pointer shadow-2xs shrink-0"
          >
            <X className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>

        {/* ── CUERPO CON SCROLL ───────────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="p-5 md:p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1">
            
            {/* PESTAÑAS DE MODALIDAD DE PACIENTE */}
            <div className="flex items-center gap-2 p-1 bg-gray-100/70 dark:bg-[#111] rounded-2xl border border-gray-200/60 dark:border-gray-800 shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab("search")}
                className={cn(
                  "flex-1 h-9 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer",
                  activeTab === "search"
                    ? "bg-white dark:bg-[#1f2937] text-gray-900 dark:text-white shadow-xs"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                )}
              >
                <Search className="w-3.5 h-3.5" />
                <span>{t("tab_search")}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("walkin")}
                className={cn(
                  "flex-1 h-9 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer",
                  activeTab === "walkin"
                    ? "bg-white dark:bg-[#1f2937] text-gray-900 dark:text-white shadow-xs"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                )}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{t("tab_walkin")}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("unidentified")}
                className={cn(
                  "flex-1 h-9 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer",
                  activeTab === "unidentified"
                    ? "bg-rose-600 text-white shadow-xs"
                    : "text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                )}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{t("tab_unidentified")}</span>
              </button>
            </div>

            {/* CONTENIDO TAB 1: BUSCADOR PREDICTIVO */}
            {activeTab === "search" && (
              <div className="space-y-3">
                {selectedPatient ? (
                  <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                        <UserCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                          {t("selected_patient")}
                        </p>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                          {selectedPatient.firstName} {selectedPatient.lastName}
                        </h4>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 font-mono">
                          {selectedPatient.phone || selectedPatient.curp || selectedPatient.email || "ID: " + selectedPatient.id}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedPatient(null)}
                      className="px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:bg-white dark:hover:bg-[#111] transition-colors cursor-pointer"
                    >
                      {t("change_patient")}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t("search_placeholder")}
                        className="w-full h-11 pl-10 pr-10 bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-xs font-medium text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 placeholder:text-gray-400"
                        autoFocus
                      />
                      {isSearching && (
                        <QhSpinner size="sm" className="absolute right-3.5 top-1/2 -translate-y-1/2 text-rose-600" />
                      )}
                    </div>

                    {/* Resultados de búsqueda */}
                    {searchResults.length > 0 && (
                      <div className="max-h-48 overflow-y-auto custom-scrollbar border border-gray-100 dark:border-gray-800 rounded-2xl divide-y divide-gray-100 dark:divide-gray-800/60 bg-white dark:bg-[#0d0d0d] shadow-sm">
                        {searchResults.map((patient) => (
                          <div
                            key={patient.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => setSelectedPatient(patient)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") setSelectedPatient(patient);
                            }}
                            className="p-3 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 flex items-center justify-between cursor-pointer transition-colors"
                          >
                            <div>
                              <p className="text-xs font-bold text-gray-900 dark:text-white">
                                {patient.firstName} {patient.lastName}
                              </p>
                              <p className="text-[11px] text-gray-500 dark:text-gray-400 font-mono">
                                {patient.phone ? `Tel: ${patient.phone}` : patient.curp ? `CURP: ${patient.curp}` : patient.email}
                              </p>
                            </div>
                            <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded-lg border border-rose-200 dark:border-rose-900/40">
                              Seleccionar
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {searchQuery.length >= 2 && !isSearching && searchResults.length === 0 && (
                      <p className="text-xs text-gray-500 text-center py-3 bg-gray-50 dark:bg-[#050505] rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
                        {t("no_results")}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* CONTENIDO TAB 2: ALTA RÁPIDA WALK-IN */}
            {activeTab === "walkin" && (
              <div className="p-4 rounded-2xl bg-gray-50/60 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                      {t("walkin_name")} *
                    </label>
                    <input
                      type="text"
                      required
                      value={walkinFirstName}
                      onChange={(e) => setWalkinFirstName(e.target.value)}
                      placeholder="Ej. Juan"
                      className="w-full h-10 px-3 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-xs font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                      {t("walkin_lastname")}
                    </label>
                    <input
                      type="text"
                      value={walkinLastName}
                      onChange={(e) => setWalkinLastName(e.target.value)}
                      placeholder="Ej. Pérez Gómez"
                      className="w-full h-10 px-3 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-xs font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                      {t("walkin_gender")}
                    </label>
                    <select
                      value={walkinGender}
                      onChange={(e) => setWalkinGender(e.target.value as any)}
                      className="w-full h-10 px-3 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-xs font-semibold rounded-xl focus:outline-none cursor-pointer"
                    >
                      <option value="MALE">{t("walkin_gender_male")}</option>
                      <option value="FEMALE">{t("walkin_gender_female")}</option>
                      <option value="OTHER">{t("walkin_gender_other")}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                      {t("walkin_age")}
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={120}
                      value={walkinAge}
                      onChange={(e) => setWalkinAge(e.target.value)}
                      placeholder="Ej. 42"
                      className="w-full h-10 px-3 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-xs font-semibold rounded-xl focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                      {t("walkin_phone")}
                    </label>
                    <input
                      type="tel"
                      value={walkinPhone}
                      onChange={(e) => setWalkinPhone(e.target.value)}
                      placeholder="Ej. 3312345678"
                      className="w-full h-10 px-3 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-xs font-semibold rounded-xl focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* CONTENIDO TAB 3: PACIENTE NO IDENTIFICADO */}
            {activeTab === "unidentified" && (
              <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-600 shrink-0">
                    <UserX className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-rose-900 dark:text-rose-200">
                      {t("unidentified_badge")}
                    </h4>
                    <p className="text-[11px] text-rose-700/80 dark:text-rose-300/80 leading-relaxed">
                      {t("unidentified_desc")}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setUnidentifiedGender("MALE")}
                      className={cn(
                        "flex-1 h-9 rounded-xl text-xs font-bold border transition-all cursor-pointer",
                        unidentifiedGender === "MALE"
                          ? "bg-rose-600 text-white border-rose-600"
                          : "bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800"
                      )}
                    >
                      {t("unidentified_preset_male")}
                    </button>
                    <button
                      type="button"
                      onClick={() => setUnidentifiedGender("FEMALE")}
                      className={cn(
                        "flex-1 h-9 rounded-xl text-xs font-bold border transition-all cursor-pointer",
                        unidentifiedGender === "FEMALE"
                          ? "bg-rose-600 text-white border-rose-600"
                          : "bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800"
                      )}
                    >
                      {t("unidentified_preset_female")}
                    </button>
                  </div>

                  <div>
                    <input
                      type="text"
                      value={unidentifiedApproxAge}
                      onChange={(e) => setUnidentifiedApproxAge(e.target.value)}
                      placeholder={t("unidentified_approx_age")}
                      className="w-full h-9 px-3 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-xs font-semibold rounded-xl focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* MOTIVO DE URGENCIA & DICTADO DE VOZ */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                  {t("reason_label")} *
                </label>
                <button
                  type="button"
                  onClick={handleToggleVoiceDictation}
                  disabled={isTranscribing}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer",
                    isRecording
                      ? "bg-red-500 text-white animate-pulse"
                      : isTranscribing
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40"
                      : "bg-gray-100 hover:bg-gray-200 dark:bg-[#111] text-gray-700 dark:text-gray-300"
                  )}
                  title={t("mic_dictate")}
                >
                  {isTranscribing ? (
                    <>
                      <QhSpinner size="sm" className="w-3 h-3 text-emerald-600" />
                      <span>Transcribiendo...</span>
                    </>
                  ) : isRecording ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                      <span>Grabando... (Detener)</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-3.5 h-3.5" />
                      <span>{t("mic_dictate")}</span>
                    </>
                  )}
                </button>
              </div>

              <textarea
                rows={2}
                required
                value={reasonForEmergency}
                onChange={(e) => setReasonForEmergency(e.target.value)}
                placeholder={t("reason_placeholder")}
                className="w-full p-3 bg-gray-50/60 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 resize-none leading-relaxed"
              />

              {/* Chips de motivos rápidos */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
                {FREQUENT_EMERGENCY_REASONS.map((reason) => (
                  <button
                    key={reason}
                    type="button"
                    onClick={() => {
                      setReasonForEmergency((prev) =>
                        prev ? `${prev}. ${reason}` : reason
                      );
                    }}
                    className="shrink-0 px-2.5 py-1 rounded-lg bg-gray-100/70 hover:bg-rose-50 hover:text-rose-700 dark:bg-[#111] dark:hover:bg-rose-950/30 text-[10.5px] font-medium text-gray-600 dark:text-gray-300 border border-transparent hover:border-rose-200 dark:hover:border-rose-900/40 transition-colors cursor-pointer"
                  >
                    + {reason}
                  </button>
                ))}
              </div>
            </div>

            {/* SIGNOS VITALES RÁPIDOS */}
            <div className="p-3.5 rounded-2xl bg-gray-50/50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <HeartPulse className="w-3.5 h-3.5 text-rose-600" />
                  {t("vitals_section")}
                </span>
                <span className="text-[10px] text-gray-400">NOM-004-SSA3</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 mb-0.5">PA</label>
                  <input
                    type="text"
                    value={bp}
                    onChange={(e) => setBp(e.target.value)}
                    placeholder="120/80"
                    className="w-full h-8 px-2 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-[11px] font-mono rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 mb-0.5">FC (lpm)</label>
                  <input
                    type="number"
                    value={hr}
                    onChange={(e) => setHr(e.target.value)}
                    placeholder="75"
                    className="w-full h-8 px-2 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-[11px] font-mono rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 mb-0.5">FR (rpm)</label>
                  <input
                    type="number"
                    value={rr}
                    onChange={(e) => setRr(e.target.value)}
                    placeholder="18"
                    className="w-full h-8 px-2 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-[11px] font-mono rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 mb-0.5">SpO2 (%)</label>
                  <input
                    type="number"
                    value={spo2}
                    onChange={(e) => setSpo2(e.target.value)}
                    placeholder="98"
                    className="w-full h-8 px-2 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-[11px] font-mono rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 mb-0.5">Temp (°C)</label>
                  <input
                    type="text"
                    value={temp}
                    onChange={(e) => setTemp(e.target.value)}
                    placeholder="36.5"
                    className="w-full h-8 px-2 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-[11px] font-mono rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 mb-0.5">Glucosa</label>
                  <input
                    type="number"
                    value={glucose}
                    onChange={(e) => setGlucose(e.target.value)}
                    placeholder="95"
                    className="w-full h-8 px-2 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-[11px] font-mono rounded-lg focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* SELECCIÓN Y ASISTENTE IA DE TRIAGE (ESCALA MANCHESTER / NOM-027) */}
            <div className="space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                    {t("triage_level_label")} *
                  </label>
                  <p className="text-[10px] text-gray-400">
                    {t("triage_level_desc")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAnalyzeTriageAi}
                  disabled={isAnalyzingAi}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50 transition-all shrink-0"
                >
                  {isAnalyzingAi ? (
                    <>
                      <QhSpinner size="sm" className="w-3.5 h-3.5 text-white" />
                      <span>{t("ai_triage_analyzing")}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{t("ai_triage_btn")}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Banner sugerencia IA */}
              {aiSuggestion && (
                <div className="p-3 rounded-xl bg-purple-50/80 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/40 flex items-start gap-2.5 text-xs">
                  <ShieldAlert className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="font-bold text-purple-900 dark:text-purple-200">
                      {t("ai_triage_suggestion")} {aiSuggestion.reason}
                    </p>
                    {aiSuggestion.redFlags && aiSuggestion.redFlags.length > 0 && (
                      <p className="text-[11px] text-purple-700 dark:text-purple-300">
                        Banderas rojas: {aiSuggestion.redFlags.join(", ")}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Botones de niveles de Triage */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                {triageOptions.map((opt) => {
                  const isSelected = triageLevel === opt.level;
                  return (
                    <button
                      key={opt.level}
                      type="button"
                      onClick={() => setTriageLevel(opt.level)}
                      className={cn(
                        "p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer",
                        isSelected ? opt.activeColor : opt.color
                      )}
                    >
                      <span className="text-[11px] font-bold leading-tight">
                        {opt.label}
                      </span>
                      <span className="text-[9.5px] font-mono mt-1 opacity-90">
                        {opt.time}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* ── FOOTER DE COMANDOS ────────────────────────────────────── */}
          <div className="p-4 md:p-5 bg-gray-50/80 dark:bg-[#050505] border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto h-11 px-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#111] transition-all text-xs font-bold shadow-2xs cursor-pointer"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              disabled={isSubmitting || (activeTab === "search" && !selectedPatient) || (activeTab === "walkin" && !walkinFirstName)}
              className="w-full sm:w-auto h-11 px-8 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 border-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <QhSpinner size="sm" className="text-white" />
                  <span>{t("submitting_button")}</span>
                </>
              ) : (
                <>
                  <Activity className="w-4 h-4" strokeWidth={2.5} />
                  <span>{t("submit_button")}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
