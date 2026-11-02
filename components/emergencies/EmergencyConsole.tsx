"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Activity,
  Save,
  CheckCircle2,
  Clock,
  FileText,
  Play,
  Sparkles,
  Mic,
  AlertTriangle,
  History,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";

import {
  EmergencyQueueItem,
  emergencyService,
} from "@/services/emergency.service";
import { patientDetailService } from "@/services/patientDetail.service";
import { healthOSService } from "@/services/healthOS.service";
import { useSessionStore } from "@/stores/SessionStore";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { cn } from "@/lib/utils";

interface EmergencyConsoleProps {
  isOpen: boolean;
  onClose: () => void;
  emergency: EmergencyQueueItem;
  onUpdate: () => void;
}

export const EmergencyConsole: React.FC<EmergencyConsoleProps> = ({
  isOpen,
  onClose,
  emergency,
  onUpdate,
}) => {
  const t = useTranslations("EmergencyConsole");
  const { user } = useSessionStore();

  const [isStartingAttention, setIsStartingAttention] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isGeneratingAiSoap, setIsGeneratingAiSoap] = useState(false);

  // Notas clínicas SOAP de la hora actual
  const [clinicalNotes, setClinicalNotes] = useState({
    subjective: "",
    objective: "",
    assessment: "",
    plan: "",
  });
  const [destination, setDestination] = useState("ALTA");

  // Historial de notas horarias registradas
  const [hourlyNotesHistory, setHourlyNotesHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);

  // Alergias del paciente
  const [knownAllergies, setKnownAllergies] = useState<string[]>([]);

  // Dictado por voz
  const [activeDictatingField, setActiveDictatingField] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Cargar historial de notas y perfil de salud del paciente
  useEffect(() => {
    if (!isOpen || !emergency.appointmentId) return;

    const loadData = async () => {
      setIsLoadingHistory(true);
      try {
        const notes = await emergencyService.getHourlyNotes(emergency.appointmentId);
        setHourlyNotesHistory(notes || []);
      } catch (err) {
        console.warn("No se pudieron cargar las notas horarias:", err);
      } finally {
        setIsLoadingHistory(false);
      }

      if (emergency.patientDirectoryId && emergency.patientDirectoryId > 0) {
        try {
          const profile = await patientDetailService.getHealthProfile(emergency.patientDirectoryId);
          if (profile && profile.allergies && profile.allergies.length > 0) {
            setKnownAllergies(profile.allergies.map((a: any) => a.allergenName || a.allergy || "Alergia sin especificar"));
          } else {
            setKnownAllergies([]);
          }
        } catch (err) {
          console.warn("No se pudo cargar el perfil de alergias:", err);
        }
      }
    };

    loadData();
  }, [isOpen, emergency.appointmentId, emergency.patientDirectoryId]);

  if (!isOpen) return null;

  // Iniciar Atención Médica activa
  const handleStartAttention = async () => {
    setIsStartingAttention(true);
    try {
      await emergencyService.startMedicalAttention(emergency.appointmentId);
      toast.success(t("toast_attention_started"));
      onUpdate();
    } catch {
      toast.error("Error al iniciar la atención médica.");
    } finally {
      setIsStartingAttention(false);
    }
  };

  // Dictado por voz para un campo específico
  const handleToggleVoiceDictation = async (field: "subjective" | "objective" | "assessment" | "plan") => {
    if (activeDictatingField === field) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      setActiveDictatingField(null);
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
              setClinicalNotes((prev) => ({
                ...prev,
                [field]: prev[field] ? `${prev[field]}. ${text}` : text,
              }));
              toast.success("Texto dictado insertado correctamente");
            }
          } catch (err) {
            console.error("Error transcribiendo voz:", err);
            toast.error("Error al transcribir dictado.");
          } finally {
            setIsTranscribing(false);
          }
        };
      };

      mediaRecorder.start();
      setActiveDictatingField(field);
    } catch {
      toast.warn("Permiso de micrófono requerido para dictar.");
    }
  };

  // Estructurar nota con IA (NOM-004-SSA3-2012)
  const handleAiStructureSoap = async () => {
    const rawContent = `
Paciente: ${emergency.patientName}
Motivo de Urgencia: ${emergency.reasonForEmergency || "No especificado"}
Borrador Subjetivo: ${clinicalNotes.subjective}
Borrador Objetivo: ${clinicalNotes.objective}
Borrador Análisis: ${clinicalNotes.assessment}
Borrador Plan: ${clinicalNotes.plan}
Alergias conocidas: ${knownAllergies.join(", ") || "Ninguna conocida"}
    `.trim();

    setIsGeneratingAiSoap(true);
    try {
      const prompt = `Actúa como Médico Especialista en Urgencias en México y estructura una Nota de Evolución Médica en Urgencias bajo la norma NOM-004-SSA3-2012 numeral 5.5 a partir de los siguientes datos clínicos:
${rawContent}

Genera un JSON estricto con los siguientes 4 campos claros, profesionales y concisos:
{
  "subjective": "Interrogatorio, síntomas actuales y antecedentes agudos",
  "objective": "Exploración física, signos vitales y hallazgos relevantes",
  "assessment": "Juicio clínico, diagnóstico presuntivo o definitivo con código CIE-10 sugerido",
  "plan": "Plan de estudio, tratamiento agudo farmacológico/soluciones y pronóstico para la vida y la función"
}`;

      const resp: any = await healthOSService.sendIntent(prompt);
      const textResponse = resp?.text || resp?.reply || resp?.message || "";
      if (textResponse) {
        const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          setClinicalNotes({
            subjective: parsed.subjective || clinicalNotes.subjective,
            objective: parsed.objective || clinicalNotes.objective,
            assessment: parsed.assessment || clinicalNotes.assessment,
            plan: parsed.plan || clinicalNotes.plan,
          });
          toast.success("Nota de urgencia estructurada con IA según NOM-004.");
        }
      }
    } catch (err) {
      console.error("Error estructurando nota con IA:", err);
      toast.error("No se pudo estructurar con IA. Conservando notas actuales.");
    } finally {
      setIsGeneratingAiSoap(false);
    }
  };

  const handleAddNote = async () => {
    if (!user?.id) return;
    setIsSubmitting(true);
    try {
      await emergencyService.addHourlyNote(emergency.appointmentId, {
        providerId: user.id,
        clinicalNotes,
      });
      toast.success(t("toast_note_success"));
      setClinicalNotes({
        subjective: "",
        objective: "",
        assessment: "",
        plan: "",
      });

      // Recargar historial de notas
      const notes = await emergencyService.getHourlyNotes(emergency.appointmentId);
      setHourlyNotesHistory(notes || []);
      onUpdate();
    } catch {
      toast.error(t("toast_note_error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      await emergencyService.completeEmergency(
        emergency.appointmentId,
        destination
      );
      toast.success(t("toast_complete_success"));
      onUpdate();
      onClose();
    } catch {
      toast.error(t("toast_complete_error"));
    } finally {
      setIsCompleting(false);
    }
  };

  const isAttending = emergency.status === "IN_PROGRESS";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs transition-opacity font-sans">
        <motion.div
          initial={{ opacity: 0, x: 400 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 400 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="w-full max-w-2xl bg-white dark:bg-[#0a0a0a] border-l border-gray-100 dark:border-gray-800 h-full shadow-2xl flex flex-col overflow-hidden"
        >
          {/* ── HEADER CONSOLA ─────────────────────────────────────────── */}
          <div className="flex items-center justify-between p-5 md:p-6 bg-gradient-to-r from-rose-50/70 via-gray-50/50 to-white dark:from-rose-950/20 dark:via-[#050505] dark:to-[#0a0a0a] border-b border-gray-100 dark:border-gray-800 shrink-0">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400 shadow-2xs shrink-0">
                <Activity className="w-6 h-6" strokeWidth={2.5} />
              </div>
              <div className="min-w-0 space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                    {t("console_title")}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[9.5px] font-mono px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-300">
                    NOM-004-SSA3
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white truncate leading-tight">
                  {emergency.patientName}
                </h2>
                {emergency.reasonForEmergency && (
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate">
                    {emergency.reasonForEmergency}
                  </p>
                )}
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

          {/* ── BODY CON SCROLL ────────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 bg-white dark:bg-[#0a0a0a] custom-scrollbar">
            
            {/* ESTADO DE ATENCIÓN Y BOTÓN INICIAR ATENCIÓN */}
            <div className="p-4 rounded-2xl bg-gray-50/80 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span
                  className={cn(
                    "w-3 h-3 rounded-full shrink-0",
                    isAttending ? "bg-emerald-500 animate-ping" : "bg-amber-500"
                  )}
                />
                <div>
                  <p className="text-xs font-bold text-gray-900 dark:text-white">
                    {isAttending ? t("attention_started_badge") : "En Sala de Espera de Urgencias"}
                  </p>
                  <p className="text-[11px] text-gray-500">
                    {isAttending ? "Cronómetro de atención clínica en curso" : "Listo para pasar a valoración médica activa"}
                  </p>
                </div>
              </div>

              {!isAttending && (
                <button
                  type="button"
                  onClick={handleStartAttention}
                  disabled={isStartingAttention}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isStartingAttention ? (
                    <QhSpinner size="sm" className="w-3 h-3 text-white" />
                  ) : (
                    <Play className="w-3.5 h-3.5 fill-current" />
                  )}
                  <span>{t("btn_start_attention")}</span>
                </button>
              )}
            </div>

            {/* ALERTA CRÍTICA DE ALERGIAS */}
            {knownAllergies.length > 0 && (
              <div className="p-4 rounded-2xl bg-red-50/90 dark:bg-red-950/40 border border-red-300 dark:border-red-900/60 flex items-start gap-3 shadow-xs">
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-red-800 dark:text-red-300 uppercase tracking-wide">
                    {t("allergies_alert")}
                  </p>
                  <p className="text-xs font-bold text-red-950 dark:text-red-100">
                    {knownAllergies.join(", ")}
                  </p>
                </div>
              </div>
            )}

            {/* HISTORIAL DE NOTAS HORARIAS PREVIAS */}
            <div className="bg-gray-50/60 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 rounded-2xl p-4 space-y-2">
              <button
                type="button"
                onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
                className="w-full flex items-center justify-between text-xs font-bold text-gray-800 dark:text-gray-200 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-emerald-600" />
                  <span>{t("notes_history_title")} ({hourlyNotesHistory.length})</span>
                </div>
                {isHistoryExpanded ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </button>

              {isHistoryExpanded && (
                <div className="pt-2 space-y-3">
                  {isLoadingHistory ? (
                    <div className="py-4 flex justify-center">
                      <QhSpinner size="sm" className="text-emerald-600" />
                    </div>
                  ) : hourlyNotesHistory.length === 0 ? (
                    <p className="text-[11px] text-gray-400 text-center py-2">
                      {t("no_hourly_notes")}
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-56 overflow-y-auto custom-scrollbar pr-1">
                      {hourlyNotesHistory.map((note, index) => {
                        let parsed: any = {};
                        try {
                          parsed = typeof note.clinicalNotes === "string"
                            ? JSON.parse(note.clinicalNotes)
                            : note.clinicalNotes;
                        } catch {
                          parsed = {};
                        }
                        const timeStr = note.recordedAt
                          ? new Date(note.recordedAt).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })
                          : `Nota #${index + 1}`;

                        return (
                          <div
                            key={note.id || index}
                            className="p-3 bg-white dark:bg-[#0a0a0a] rounded-xl border border-gray-100 dark:border-gray-800/80 text-xs space-y-1.5 shadow-2xs"
                          >
                            <div className="flex items-center justify-between font-bold text-[11px] text-emerald-700 dark:text-emerald-400 border-b border-gray-100 dark:border-gray-800/60 pb-1">
                              <span>Hora: {timeStr}</span>
                              <span className="text-gray-400 font-mono text-[10px]">Folio #{note.id || index + 1}</span>
                            </div>
                            {parsed.subjective && <p><strong className="text-gray-600 dark:text-gray-400">S:</strong> {parsed.subjective}</p>}
                            {parsed.objective && <p><strong className="text-gray-600 dark:text-gray-400">O:</strong> {parsed.objective}</p>}
                            {parsed.assessment && <p><strong className="text-gray-600 dark:text-gray-400">A:</strong> {parsed.assessment}</p>}
                            {parsed.plan && <p><strong className="text-gray-600 dark:text-gray-400">P:</strong> {parsed.plan}</p>}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* TARJETA: NOTA DE EVOLUCIÓN HORARIA (SOAP) */}
            <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-5 rounded-3xl shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                  <h3 className="text-xs font-bold text-gray-900 dark:text-white tracking-tight">
                    {t("soap_title")}
                  </h3>
                  <span className="inline-flex items-center gap-1 text-[9.5px] font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 px-2 py-0.5 rounded-full">
                    <Clock className="w-2.5 h-2.5" />
                    {t("hourly_badge")}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleAiStructureSoap}
                  disabled={isGeneratingAiSoap}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50 transition-all shrink-0"
                >
                  {isGeneratingAiSoap ? (
                    <>
                      <QhSpinner size="sm" className="w-3.5 h-3.5 text-white" />
                      <span>{t("ai_assistant_generating")}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{t("ai_assistant_btn")}</span>
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-4">
                {/* Subjetivo */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                      {t("subjective_label")}
                    </label>
                    <button
                      type="button"
                      onClick={() => handleToggleVoiceDictation("subjective")}
                      className={cn(
                        "inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-lg transition-colors cursor-pointer",
                        activeDictatingField === "subjective"
                          ? "bg-red-500 text-white animate-pulse"
                          : "text-gray-500 hover:bg-gray-100 dark:hover:bg-[#111]"
                      )}
                    >
                      <Mic className="w-3 h-3" />
                      <span>{activeDictatingField === "subjective" ? "Detener" : "Dictar"}</span>
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    value={clinicalNotes.subjective}
                    onChange={(e) =>
                      setClinicalNotes({
                        ...clinicalNotes,
                        subjective: e.target.value,
                      })
                    }
                    placeholder={t("subjective_placeholder")}
                    className="w-full bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-xl p-3 text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 placeholder:text-gray-400 resize-none leading-relaxed"
                  />
                </div>

                {/* Objetivo */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                      {t("objective_label")}
                    </label>
                    <button
                      type="button"
                      onClick={() => handleToggleVoiceDictation("objective")}
                      className={cn(
                        "inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-lg transition-colors cursor-pointer",
                        activeDictatingField === "objective"
                          ? "bg-red-500 text-white animate-pulse"
                          : "text-gray-500 hover:bg-gray-100 dark:hover:bg-[#111]"
                      )}
                    >
                      <Mic className="w-3 h-3" />
                      <span>{activeDictatingField === "objective" ? "Detener" : "Dictar"}</span>
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    value={clinicalNotes.objective}
                    onChange={(e) =>
                      setClinicalNotes({
                        ...clinicalNotes,
                        objective: e.target.value,
                      })
                    }
                    placeholder={t("objective_placeholder")}
                    className="w-full bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-xl p-3 text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 placeholder:text-gray-400 resize-none leading-relaxed"
                  />
                </div>

                {/* Análisis y Plan */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                        {t("assessment_label")}
                      </label>
                      <button
                        type="button"
                        onClick={() => handleToggleVoiceDictation("assessment")}
                        className={cn(
                          "inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-lg transition-colors cursor-pointer",
                          activeDictatingField === "assessment"
                            ? "bg-red-500 text-white animate-pulse"
                            : "text-gray-500 hover:bg-gray-100 dark:hover:bg-[#111]"
                        )}
                      >
                        <Mic className="w-3 h-3" />
                        <span>{activeDictatingField === "assessment" ? "Detener" : "Dictar"}</span>
                      </button>
                    </div>
                    <textarea
                      rows={2}
                      value={clinicalNotes.assessment}
                      onChange={(e) =>
                        setClinicalNotes({
                          ...clinicalNotes,
                          assessment: e.target.value,
                        })
                      }
                      placeholder={t("assessment_placeholder")}
                      className="w-full bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-xl p-3 text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 placeholder:text-gray-400 resize-none leading-relaxed"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                        {t("plan_label")}
                      </label>
                      <button
                        type="button"
                        onClick={() => handleToggleVoiceDictation("plan")}
                        className={cn(
                          "inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-lg transition-colors cursor-pointer",
                          activeDictatingField === "plan"
                            ? "bg-red-500 text-white animate-pulse"
                            : "text-gray-500 hover:bg-gray-100 dark:hover:bg-[#111]"
                        )}
                      >
                        <Mic className="w-3 h-3" />
                        <span>{activeDictatingField === "plan" ? "Detener" : "Dictar"}</span>
                      </button>
                    </div>
                    <textarea
                      rows={2}
                      value={clinicalNotes.plan}
                      onChange={(e) =>
                        setClinicalNotes({
                          ...clinicalNotes,
                          plan: e.target.value,
                        })
                      }
                      placeholder={t("plan_placeholder")}
                      className="w-full bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-xl p-3 text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 placeholder:text-gray-400 resize-none leading-relaxed"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddNote}
                  disabled={isSubmitting || (!clinicalNotes.subjective && !clinicalNotes.objective && !clinicalNotes.assessment && !clinicalNotes.plan)}
                  className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer border-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <QhSpinner size="sm" className="text-white" />
                      <span>{t("btn_saving_note")}</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" strokeWidth={2} />
                      <span>{t("btn_save_note")}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* TARJETA: CIERRE DE URGENCIA */}
            <div className="bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 p-5 rounded-3xl space-y-3 shadow-2xs">
              <div className="space-y-0.5">
                <h3 className="text-xs font-bold text-rose-800 dark:text-rose-300 tracking-tight">
                  {t("discharge_title")}
                </h3>
                <p className="text-[11px] font-medium text-rose-700/80 dark:text-rose-300/80 leading-relaxed">
                  {t("discharge_desc")}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end pt-1">
                <div className="flex-1 min-w-0 space-y-1">
                  <label className="block text-[11px] font-bold text-rose-900 dark:text-rose-300">
                    {t("destination_label")}
                  </label>
                  <select
                    className="w-full h-10 px-3 bg-white dark:bg-[#0a0a0a] border border-rose-200 dark:border-rose-900/40 rounded-xl text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 shadow-2xs cursor-pointer"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                  >
                    <option value="ALTA">{t("dest_alta")}</option>
                    <option value="HOSPITALIZACIÓN">{t("dest_hospitalizacion")}</option>
                    <option value="TRASLADO">{t("dest_traslado")}</option>
                    <option value="DEFUNCION">{t("dest_defuncion")}</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleComplete}
                  disabled={isCompleting}
                  className="h-10 px-6 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 shrink-0 border-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCompleting ? (
                    <>
                      <QhSpinner size="sm" className="text-white" />
                      <span>{t("btn_completing")}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
                      <span>{t("btn_complete")}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
