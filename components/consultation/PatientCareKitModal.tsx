"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  FileText,
  Headphones,
  ImageIcon,
  MessageCircle,
  Copy,
  Check,
  AlertTriangle,
  HeartPulse,
  ShieldAlert,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { toast } from "react-toastify";
import {
  healthOSService,
  PatientCareKitRequest,
  PatientCareKitResponse,
} from "@/services/healthOS.service";
import { RecoveryGuideWidget } from "@/components/widgets/RecoveryGuideWidget";
import { MedicalInfographicWidget } from "@/components/widgets/MedicalInfographicWidget";

export interface PatientCareKitModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientName?: string;
  doctorName?: string;
  medicalSpecialty?: string;
  diagnosis?: string;
  plan?: string;
  medications?: string;
  careInstructions?: string;
  doctorNotes?: string;
  appointmentId?: number;
  patientPhone?: string;
  initialCareKit?: PatientCareKitResponse | null;
  initialTab?: string;
}

export const PatientCareKitModal: React.FC<PatientCareKitModalProps> = ({
  isOpen,
  onClose,
  patientName = "Paciente",
  doctorName = "Especialista QuHealthy",
  medicalSpecialty = "Medicina General",
  diagnosis = "Consulta Médica",
  plan = "Continuar tratamiento y medidas generales de recuperación.",
  medications = "",
  careInstructions = "",
  doctorNotes = "",
  appointmentId,
  patientPhone = "",
  initialCareKit = null,
  initialTab = "summary",
}) => {
  const [careKit, setCareKit] = useState<PatientCareKitResponse | null>(
    initialCareKit
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [accentId, setAccentId] = useState<string>("es-MX-journey");
  const [includeAudio, setIncludeAudio] = useState<boolean>(true);
  const [includeInfographic, setIncludeInfographic] = useState<boolean>(true);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  useEffect(() => {
    if (initialCareKit) {
      setCareKit(initialCareKit);
    }
  }, [initialCareKit]);

  const handleGenerate = async () => {
    try {
      setIsLoading(true);
      const req: PatientCareKitRequest = {
        patientName,
        doctorName,
        medicalSpecialty,
        diagnosis,
        plan,
        medications,
        careInstructions,
        doctorNotes,
        appointmentId,
        accentId,
        includeAudioGuide: includeAudio,
        includeInfographic,
      };

      const result = await healthOSService.generatePatientCareKit(req);
      setCareKit(result);
      setActiveTab("summary");
      toast.success("Kit Multimodal generado exitosamente");
    } catch (error) {
      console.error("Error generando Patient Care Kit:", error);
      toast.error(
        "No se pudo generar el Kit de Cuidados. Por favor intenta de nuevo."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyWhatsApp = () => {
    if (!careKit?.shareableWhatsAppText) return;
    navigator.clipboard.writeText(careKit.shareableWhatsAppText);
    setIsCopied(true);
    toast.success("Mensaje para WhatsApp copiado al portapapeles");
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleOpenWhatsApp = () => {
    if (!careKit?.shareableWhatsAppText) return;
    const cleanPhone = patientPhone ? patientPhone.replace(/\D/g, "") : "";
    const encoded = encodeURIComponent(careKit.shareableWhatsAppText);
    const url = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encoded}`
      : `https://wa.me/?text=${encoded}`;
    window.open(url, "_blank");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        data-testid="patient-care-kit-modal"
        className="max-w-4xl max-h-[92vh] overflow-y-auto bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-6 sm:p-7 rounded-3xl font-sans text-gray-900 dark:text-white"
      >
        <DialogHeader className="space-y-2 border-b border-gray-100 dark:border-gray-800 pb-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-md">
                <Sparkles className="w-5 h-5" />
              </span>
              <div>
                <DialogTitle className="text-xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
                  <span>Kit Multimodal Post-Consulta para el Paciente</span>
                </DialogTitle>
                <DialogDescription className="text-xs text-gray-500 dark:text-gray-400">
                  Orquestación clínica: Resumen en lenguaje claro, Audio-Guía TTS y soporte visual
                </DialogDescription>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <Badge className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 text-[10px] font-bold">
                Gemini 3.8 Flash TTS
              </Badge>
              <Badge className="bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 text-[10px] font-bold">
                Nano Banana 2.1
              </Badge>
              <Badge className="bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 text-[10px] font-bold">
                NOM-004 / NOM-024
              </Badge>
            </div>
          </div>
        </DialogHeader>

        {/* ── BANNER REGULATORIO Y CONSENTIMIENTO INFORMADO ── */}
        <div
          data-testid="care-kit-regulatory-notice"
          className="rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 p-3.5 text-xs text-emerald-900 dark:text-emerald-200 flex items-start gap-3 my-2"
        >
          <HeartPulse className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold">
              Material Educativo y Terapéutico Personalizado para el Paciente
            </p>
            <p className="text-[11px] opacity-85">
              Generado a partir del diagnóstico y plan clínico confirmados por el médico tratante.
              Refuerza la adherencia al tratamiento y reduce reingresos hospitalarios.
            </p>
          </div>
        </div>

        {/* ── ESTADO CARGANDO ── */}
        {isLoading && (
          <div className="py-16 flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm animate-pulse">
              <QhSpinner size="lg" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Construyendo Kit Multimodal Personalizado...
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm">
                Sintetizando explicación en lenguaje amigable, generando capítulos de voz de alta fidelidad y renderizando infografía anatómica.
              </p>
            </div>
          </div>
        )}

        {/* ── ESTADO INICIAL: PRE-GENERACIÓN ── */}
        {!isLoading && !careKit && (
          <div className="space-y-5 my-3">
            <div className="bg-gray-50/80 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 rounded-2xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Datos Clínicos Base de la Consulta
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800">
                  <span className="font-semibold text-gray-500 block text-[11px]">Paciente:</span>
                  <span className="font-bold text-gray-900 dark:text-white">{patientName}</span>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800">
                  <span className="font-semibold text-gray-500 block text-[11px]">Médico / Especialidad:</span>
                  <span className="font-bold text-gray-900 dark:text-white">{doctorName} ({medicalSpecialty})</span>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 md:col-span-2">
                  <span className="font-semibold text-gray-500 block text-[11px]">Diagnóstico:</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">{diagnosis}</span>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 md:col-span-2">
                  <span className="font-semibold text-gray-500 block text-[11px]">Plan y Cuidados Clínicos:</span>
                  <p className="text-gray-700 dark:text-gray-300 mt-0.5 line-clamp-3">{plan}</p>
                </div>
              </div>
            </div>

            {/* Opciones de Generación */}
            <div className="bg-gray-50/80 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 rounded-2xl p-4 space-y-4">
              <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Opciones del Kit Multimodal
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-gray-600 dark:text-gray-400 block mb-1.5">
                    Acento y Calidez de Voz (TTS)
                  </label>
                  <select
                    value={accentId}
                    onChange={(e) => setAccentId(e.target.value)}
                    className="w-full text-xs h-10 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] px-3 font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="es-MX-journey">Español México (Empática / Journey)</option>
                    <option value="es-MX-calm">Español México (Serena y Cálida)</option>
                    <option value="es-US-clear">Español Neutro (Clara y Formal)</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="includeAudio"
                    checked={includeAudio}
                    onChange={(e) => setIncludeAudio(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                  />
                  <label htmlFor="includeAudio" className="text-xs font-semibold text-gray-800 dark:text-gray-200 cursor-pointer">
                    Audio-Guía (4 capítulos con voz humana)
                  </label>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="includeInfographic"
                    checked={includeInfographic}
                    onChange={(e) => setIncludeInfographic(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                  />
                  <label htmlFor="includeInfographic" className="text-xs font-semibold text-gray-800 dark:text-gray-200 cursor-pointer">
                    Infografía Médica Nano Banana
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={onClose}
                className="rounded-xl border-gray-200 dark:border-gray-800 text-xs font-semibold"
              >
                Cancelar
              </Button>
              <Button
                data-testid="generate-care-kit-btn"
                onClick={handleGenerate}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold gap-2 px-6 shadow-sm"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generar Kit Multimodal para el Paciente</span>
              </Button>
            </div>
          </div>
        )}

        {/* ── ESTADO RESULTADO GENERADO ── */}
        {!isLoading && careKit && (
          <div className="space-y-4 my-2">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full flex flex-col"
            >
              <TabsList className="grid grid-cols-4 w-full bg-gray-50 dark:bg-[#050505] p-1 rounded-2xl border border-gray-100 dark:border-gray-800 mb-4">
                <TabsTrigger
                  value="summary"
                  className="rounded-xl text-xs font-bold transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-[#0a0a0a] data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 flex items-center justify-center gap-1.5 py-2"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Resumen & Cuidados</span>
                  <span className="sm:hidden">Resumen</span>
                </TabsTrigger>

                <TabsTrigger
                  value="audio"
                  className="rounded-xl text-xs font-bold transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-[#0a0a0a] data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 flex items-center justify-center gap-1.5 py-2"
                >
                  <Headphones className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Audio-Guía (TTS)</span>
                  <span className="sm:hidden">Audio</span>
                </TabsTrigger>

                <TabsTrigger
                  value="infographic"
                  className="rounded-xl text-xs font-bold transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-[#0a0a0a] data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 flex items-center justify-center gap-1.5 py-2"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Infografía Médica</span>
                  <span className="sm:hidden">Infografía</span>
                </TabsTrigger>

                <TabsTrigger
                  value="whatsapp"
                  className="rounded-xl text-xs font-bold transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-[#0a0a0a] data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 flex items-center justify-center gap-1.5 py-2"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
                  <span>WhatsApp</span>
                </TabsTrigger>
              </TabsList>

              {/* ── TAB 1: RESUMEN Y CUIDADOS AMIGABLES ── */}
              <TabsContent value="summary" className="space-y-4 m-0 outline-none">
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50/60 to-teal-50/40 dark:from-[#0a1410] dark:to-[#081814] border border-emerald-100 dark:border-emerald-900/40 space-y-2">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <HeartPulse className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>{careKit.kitTitle || "Guía Personalizada de Recuperación"}</span>
                  </h3>
                  <p className="text-xs leading-relaxed text-gray-700 dark:text-gray-300 font-medium">
                    {careKit.patientFriendlySummary}
                  </p>
                </div>

                {/* Puntos Clave de Cuidado */}
                {careKit.keyCarePoints && careKit.keyCarePoints.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Cuidados Esenciales en Casa</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {careKit.keyCarePoints.map((point, idx) => (
                        <div
                          key={`care-pt-${idx}`}
                          className="p-3 rounded-xl bg-gray-50/70 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 text-xs flex items-start gap-2.5"
                        >
                          <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="font-medium text-gray-800 dark:text-gray-200 leading-snug">
                            {point}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Signos de Alarma */}
                {careKit.warningSigns && careKit.warningSigns.length > 0 && (
                  <div
                    data-testid="care-kit-warning-signs"
                    className="rounded-2xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 p-4 space-y-2.5"
                  >
                    <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300">
                      <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                      <h4 className="text-xs font-bold uppercase tracking-wider">
                        Signos de Alarma — Cuándo Contactar al Médico o Acudir a Urgencias
                      </h4>
                    </div>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {careKit.warningSigns.map((sign, idx) => (
                        <li
                          key={`warn-${idx}`}
                          className="flex items-start gap-2 text-xs font-medium text-rose-900 dark:text-rose-200"
                        >
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                          <span>{sign}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </TabsContent>

              {/* ── TAB 2: AUDIO-GUÍA SINTETIZADA (TTS) ── */}
              <TabsContent value="audio" className="space-y-4 m-0 outline-none">
                {careKit.recoveryGuide ? (
                  <div className="space-y-3">
                    <RecoveryGuideWidget
                      widget={{
                        id: `carekit-guide-${appointmentId || "preview"}`,
                        type: "RecoveryGuideWidget",
                        data: {
                          ...careKit.recoveryGuide,
                          sections: careKit.recoveryGuide.sections.map((s) => ({
                            id: s.id,
                            title: s.title,
                            category: s.category,
                            summary: s.summary,
                            spokenText: s.spokenText,
                            estimatedSeconds: s.estimatedSeconds,
                          })),
                        },
                      }}
                    />
                  </div>
                ) : (
                  <div className="p-8 text-center bg-gray-50/50 dark:bg-[#050505] rounded-2xl border border-gray-100 dark:border-gray-800 text-xs text-gray-500">
                    No se incluyó Audio-Guía en esta generación. Puedes regenerar el kit marcando la opción correspondiente.
                  </div>
                )}
              </TabsContent>

              {/* ── TAB 3: INFOGRAFÍA MÉDICA (NANO BANANA 2.1) ── */}
              <TabsContent value="infographic" className="space-y-4 m-0 outline-none">
                {careKit.infographic ? (
                  <MedicalInfographicWidget
                    widget={{
                      id: `carekit-info-${appointmentId || "preview"}`,
                      type: "MedicalInfographicWidget",
                      data: {
                        title: careKit.infographic.title,
                        medicalTopic: careKit.infographic.medicalTopic,
                        category: careKit.infographic.category,
                        summary: careKit.infographic.summary,
                        imageUrl: careKit.infographic.imageUrl,
                        aspectRatio:
                          careKit.infographic.aspectRatio === "1:1" ? "1:1" : "16:9",
                        keyPoints: careKit.infographic.keyPoints,
                        disclaimer: careKit.infographic.disclaimer,
                        downloadUrl: careKit.infographic.downloadUrl,
                        createdAt: careKit.infographic.createdAt,
                      },
                    }}
                  />
                ) : (
                  <div className="p-8 text-center bg-gray-50/50 dark:bg-[#050505] rounded-2xl border border-gray-100 dark:border-gray-800 text-xs text-gray-500">
                    No se incluyó Infografía en esta generación. Puedes regenerar el kit marcando la opción correspondiente.
                  </div>
                )}
              </TabsContent>

              {/* ── TAB 4: COMPARTIR POR WHATSAPP ── */}
              <TabsContent value="whatsapp" className="space-y-4 m-0 outline-none">
                <div className="bg-gray-50/80 dark:bg-[#050505] rounded-2xl border border-gray-100 dark:border-gray-800 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                      Vista previa del mensaje con formato WhatsApp
                    </span>
                    <span className="text-[11px] text-gray-400">
                      {patientPhone ? `Destinatario: ${patientPhone}` : "Sin teléfono predeterminado"}
                    </span>
                  </div>

                  <pre className="p-4 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-xs text-gray-800 dark:text-gray-200 whitespace-pre-wrap font-sans max-h-60 overflow-y-auto leading-relaxed shadow-inner">
                    {careKit.shareableWhatsAppText}
                  </pre>

                  <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-2">
                    <Button
                      variant="outline"
                      data-testid="care-kit-copy-wa-btn"
                      onClick={handleCopyWhatsApp}
                      className="w-full sm:w-auto rounded-xl border-gray-200 dark:border-gray-800 text-xs font-semibold gap-2 h-10"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-600" />
                          <span>¡Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copiar al Portapapeles</span>
                        </>
                      )}
                    </Button>

                    <Button
                      data-testid="care-kit-send-wa-btn"
                      onClick={handleOpenWhatsApp}
                      className="w-full sm:w-auto bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl text-xs font-bold gap-2 h-10 shadow-sm"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Abrir en WhatsApp</span>
                      <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Acciones de Cierre y Regeneración */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
              <Button
                variant="ghost"
                onClick={handleGenerate}
                className="text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-emerald-600 gap-1.5 h-9"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Regenerar Contenidos</span>
              </Button>

              <Button
                onClick={onClose}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold px-6 h-9"
              >
                Cerrar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
