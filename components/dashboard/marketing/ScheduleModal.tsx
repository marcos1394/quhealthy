"use client";

import React, { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { X, Calendar, Clock, CheckCircle2, AlertCircle, Loader2, ChevronDown, Image as ImageIcon, Send } from "lucide-react";
import { useSocial } from "@/hooks/useSocial";
import type { SocialConnectionDTO, ScheduledPostDTO } from "@/types/social";

// UI Components
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarUI } from "@/components/ui/calendar";
import { format, parseISO, setHours, setMinutes, isBefore, addMinutes } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { QhSpinner } from "@/components/ui/QhSpinner";

// ── Fallback Image Component ───────────────────────────────────────────────────
const SafeImage = ({ src, alt, className, fallback }: { src: string, alt: string, className?: string, fallback: React.ReactNode }) => {
  const [error, setError] = useState(false);
  if (!src || error) {
    return <>{fallback}</>;
  }
  return (
    <img 
      src={src} 
      alt={alt} 
      className={className}
      onError={() => setError(true)}
    />
  );
};

// ── Types ──────────────────────────────────────────────────────────────────────

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScheduled?: () => void;
  post?: ScheduledPostDTO;
  prefill?: {
    content: string;
    mediaUrls?: string[];
    mediaType?: "image" | "video";
    generatedByAi?: boolean;
  };
}

type ScheduleStatus = "idle" | "loading" | "success" | "error";

// ── Helpers ────────────────────────────────────────────────────────────────────

function getMinDateTime(): Date {
  return addMinutes(new Date(), 5);
}

const PLATFORM_ICONS: Record<string, string> = {
  FACEBOOK: "📘",
  INSTAGRAM: "📸",
  LINKEDIN: "💼",
  GOOGLE_BUSINESS: "📍",
  YOUTUBE: "▶️",
  TIKTOK: "🎵",
};

// ── Component ──────────────────────────────────────────────────────────────────

export default function ScheduleModal({
  isOpen,
  onClose,
  onScheduled,
  post,
  prefill,
}: ScheduleModalProps) {
  const t = useTranslations("DashboardMarketing.imageModal");
  const locale = useLocale();
  const dateLocale = locale === 'es' ? es : enUS;

  const { connections, schedulePost, loadConnections } = useSocial();

  // ── Form state ──────────────────────────────────────────────────────────────
    const [{ selectedConnectionId, content, scheduledAt, status, errorMsg, showConnectionDropdown, calendarOpen }, dispatch] = React.useReducer(
      (state: any, action: any) => {
        switch (action.type) {
      case 'SET_SELECTEDCONNECTIONID': return { ...state, selectedConnectionId: typeof action.payload === 'function' ? action.payload(state.selectedConnectionId) : action.payload };
      case 'SET_CONTENT': return { ...state, content: typeof action.payload === 'function' ? action.payload(state.content) : action.payload };
      case 'SET_SCHEDULEDAT': return { ...state, scheduledAt: typeof action.payload === 'function' ? action.payload(state.scheduledAt) : action.payload };
      case 'SET_STATUS': return { ...state, status: typeof action.payload === 'function' ? action.payload(state.status) : action.payload };
      case 'SET_ERRORMSG': return { ...state, errorMsg: typeof action.payload === 'function' ? action.payload(state.errorMsg) : action.payload };
      case 'SET_SHOWCONNECTIONDROPDOWN': return { ...state, showConnectionDropdown: typeof action.payload === 'function' ? action.payload(state.showConnectionDropdown) : action.payload };
      case 'SET_CALENDAROPEN': return { ...state, calendarOpen: typeof action.payload === 'function' ? action.payload(state.calendarOpen) : action.payload };
          default: return state;
        }
      },
      {
        selectedConnectionId: "", content: "", scheduledAt: "", status: "idle", errorMsg: "", showConnectionDropdown: false, calendarOpen: false
      }
    );

    const setSelectedConnectionId = (val: any) => dispatch({ type: 'SET_SELECTEDCONNECTIONID', payload: val });
    const setContent = (val: any) => dispatch({ type: 'SET_CONTENT', payload: val });
    const setScheduledAt = (val: any) => dispatch({ type: 'SET_SCHEDULEDAT', payload: val });
    const setStatus = (val: any) => dispatch({ type: 'SET_STATUS', payload: val });
    const setErrorMsg = (val: any) => dispatch({ type: 'SET_ERRORMSG', payload: val });
    const setShowConnectionDropdown = (val: any) => dispatch({ type: 'SET_SHOWCONNECTIONDROPDOWN', payload: val });
    const setCalendarOpen = (val: any) => dispatch({ type: 'SET_CALENDAROPEN', payload: val });








  // Derivados
  const selectedDateObj = scheduledAt ? parseISO(scheduledAt) : undefined;
  const timeString = scheduledAt ? format(parseISO(scheduledAt), "HH:mm") : "";

  // ── Init ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    if (connections.length === 0) loadConnections();

    if (prefill) setContent(prefill.content ?? "");
    if (post) {
      setContent(post.content ?? "");
      setSelectedConnectionId(post.socialConnectionId ?? "");
      if (post.scheduledAt) {
        setScheduledAt(new Date(post.scheduledAt).toISOString().slice(0, 16));
      }
    }

    setStatus("idle");
    setErrorMsg("");
  }, [isOpen]);

  // ── Validation ──────────────────────────────────────────────────────────────
  function validate(): string | null {
    if (!selectedConnectionId) return t("toast_warn", { defaultValue: 'SELECCIONE UNA RED SOCIAL.' });
    if (!content.trim()) return t("toast_warn", { defaultValue: 'EL CONTENIDO NO PUEDE ESTAR VACÍO.' });
    if (!scheduledAt) return t("toast_warn", { defaultValue: 'ESPECIFIQUE FECHA Y HORA.' });

    const selected = new Date(scheduledAt);
    const minTime = getMinDateTime();
    if (isBefore(selected, minTime)) return t("err_date_min", { defaultValue: 'LA FECHA DEBE SER FUTURA.' });

    return null;
  }

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    let newDate = date;
    if (scheduledAt) {
      const oldTime = parseISO(scheduledAt);
      newDate = setHours(newDate, oldTime.getHours());
      newDate = setMinutes(newDate, oldTime.getMinutes());
    } else {
      newDate = setHours(newDate, new Date().getHours() + 1);
      newDate = setMinutes(newDate, 0);
    }
    setScheduledAt(format(newDate, "yyyy-MM-dd'T'HH:mm"));
    setErrorMsg("");
    setCalendarOpen(false);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const timeVal = e.target.value;
    if (!timeVal) return;
    const [hours, minutes] = timeVal.split(":").map(Number);
    let newDate = scheduledAt ? parseISO(scheduledAt) : new Date();
    newDate = setHours(newDate, hours);
    newDate = setMinutes(newDate, minutes);
    setScheduledAt(format(newDate, "yyyy-MM-dd'T'HH:mm"));
    setErrorMsg("");
  };

  async function handleSchedule() {
    const validationError = validate();
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    try {
      await schedulePost({
        socialConnectionId: selectedConnectionId,
        content: content.trim(),
        mediaUrls: prefill?.mediaUrls ?? post?.mediaUrls ?? [],
        scheduledAt: new Date(scheduledAt).toISOString(),
        generatedByAi: prefill?.generatedByAi ?? post?.generatedByAi ?? false,
      });

      setStatus("success");
      setTimeout(() => {
        onScheduled?.();
        onClose();
        setStatus("idle");
      }, 1500);
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err?.message ?? t("toast_error", { defaultValue: 'ERROR AL PROGRAMAR.' }));
    }
  }

  const selectedConnection = connections.find((c) => c.id === selectedConnectionId);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
      
      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#0a0a0a] border border-black dark:border-white shadow-2xl flex flex-col rounded-none overflow-hidden transition-colors max-h-[95vh]">

        {/* HEADER ARQUITECTÓNICO */}
        <div className="flex items-start md:items-center justify-between p-6 md:p-8 border-b border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] shrink-0">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] text-black dark:text-white flex items-center justify-center shrink-0">
              <Calendar className="w-6 h-6" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-1">
                Motor de Distribución
              </p>
              <h2 className="text-xl md:text-2xl font-semibold uppercase tracking-tight text-black dark:text-white leading-none">
                {t("title", { defaultValue: 'PROGRAMAR CONTENIDO' })}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-12 h-12 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-[#050505] transition-colors shrink-0"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5 text-gray-500 hover:text-black dark:hover:text-white transition-colors" strokeWidth={1.5} />
          </button>
        </div>

        {/* CUERPO DEL FORMULARIO (GRID BLUEPRINT) */}
        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col bg-gray-50 dark:bg-[#050505]">

          {/* 1. Selector de Conexión */}
          <div className="p-6 md:p-8 border-b border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0a]">
            <label className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-3 flex items-center gap-2">
              <span className="w-3 h-3 flex items-center justify-center border border-black/20 dark:border-white/20">1</span>
              {t("platform_title", { defaultValue: 'SELECCIÓN DE CANAL DE SALIDA' })}
            </label>

            {connections.length === 0 ? (
              <div className="border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] p-6 text-center">
                <p className="text-xs font-semibold uppercase tracking-widest text-black dark:text-white mb-2">
                  {t("no_accounts_title", { defaultValue: 'NO HAY CANALES VINCULADOS' })}
                </p>
                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500">
                  {t("no_accounts_desc", { defaultValue: 'VINCULE UNA RED SOCIAL EN LA CONFIGURACIÓN ANTES DE PROGRAMAR.' })}
                </p>
              </div>
            ) : (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowConnectionDropdown((v: any) => !v)}
                  className="w-full h-14 px-4 flex items-center justify-between border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] text-left hover:bg-white dark:hover:bg-[#111] transition-colors focus:outline-none focus:border-black dark:focus:border-white rounded-none"
                >
                  {selectedConnection ? (
                    <span className="flex items-center gap-3 text-xs font-semibold uppercase tracking-widest text-black dark:text-white">
                      <span className="text-lg leading-none">{PLATFORM_ICONS[selectedConnection.platform] ?? "🌐"}</span>
                      {selectedConnection.platformUserName}
                      <span className="text-[8px] border border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0a] px-2 py-0.5 ml-2">
                        {selectedConnection.platform}
                      </span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      {t("platform_placeholder", { defaultValue: 'SELECCIONE RED SOCIAL...' })}
                    </span>
                  )}
                  <ChevronDown className={cn("w-4 h-4 text-gray-500 transition-transform duration-200", showConnectionDropdown && "rotate-180")} strokeWidth={1.5} />
                </button>

                {showConnectionDropdown && (
                  <div className="absolute z-50 top-full left-0 w-full bg-white dark:bg-[#0a0a0a] border-x border-b border-black/20 dark:border-white/20 shadow-2xl flex flex-col rounded-none mt-0">
                    {connections.map((conn) => (
                      <button
                        key={conn.id}
                        type="button"
                        onClick={() => {
                          setSelectedConnectionId(conn.id);
                          setShowConnectionDropdown(false);
                        }}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors text-xs font-semibold uppercase tracking-widest",
                          selectedConnectionId === conn.id
                            ? "bg-black text-white dark:bg-white dark:text-black"
                            : "hover:bg-gray-50 dark:hover:bg-[#111] text-black dark:text-white"
                        )}
                      >
                        <span className="text-lg leading-none">{PLATFORM_ICONS[conn.platform] ?? "🌐"}</span>
                        <div className="flex-1 min-w-0 flex items-center justify-between">
                          <span className="truncate">{conn.platformUserName}</span>
                          <span className={cn(
                            "text-[8px] px-2 py-0.5 border",
                            selectedConnectionId === conn.id ? "border-white/30 dark:border-black/30 bg-transparent" : "border-black/10 dark:border-white/10 bg-gray-50 dark:bg-[#050505]"
                          )}>
                            {conn.platform}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 2. Contenido Editable */}
          <div className="p-6 md:p-8 border-b border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0a]">
            <div className="flex items-center justify-between mb-3">
              <label className="text-[9px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                <span className="w-3 h-3 flex items-center justify-center border border-black/20 dark:border-white/20">2</span>
                CUERPO DE LA PUBLICACIÓN
              </label>
              <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">
                LENG: {content.length} / 2200
              </span>
            </div>
            
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              placeholder="ESCRIBA EL CONTENIDO..."
              className="w-full p-4 bg-gray-50 dark:bg-[#050505] border border-black/20 dark:border-white/20 text-xs font-semibold text-black dark:text-white focus:outline-none focus:ring-0 focus:border-black dark:focus:border-white transition-colors rounded-none placeholder:text-gray-400 resize-none uppercase"
            />

            {/* Media Summary Integrado */}
            {(prefill?.mediaUrls?.length || post?.mediaUrls?.length) && (
              <div className="mt-4 border border-black/10 dark:border-white/10 p-4 bg-gray-50 dark:bg-[#050505]">
                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-3">
                  ARCHIVOS ADJUNTOS ({prefill?.mediaUrls?.length ?? post?.mediaUrls?.length})
                </p>
                <div className="flex gap-2 flex-wrap">
                  {(prefill?.mediaUrls ?? post?.mediaUrls ?? []).map((url, i) => (
                    <div
                      key={i}
                      className="w-16 h-16 border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] overflow-hidden shrink-0"
                    >
                      {prefill?.mediaType === "video" ? (
                        <div className="w-full h-full flex items-center justify-center text-sm bg-black text-white">▶</div>
                      ) : (
                        <SafeImage 
                          src={url} 
                          alt="Media Preview" 
                          className="w-full h-full object-cover" 
                          fallback={<div className="w-full h-full flex items-center justify-center text-gray-400"><ImageIcon className="w-4 h-4" strokeWidth={1.5} /></div>}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 3. Fecha y Hora (Grid Split) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 border-b border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0a]">
            
            {/* Fecha */}
            <div className="p-6 md:p-8 border-b sm:border-b-0 sm:border-r border-black/10 dark:border-white/10 flex flex-col justify-center">
              <label className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-3 flex items-center gap-2">
                <span className="w-3 h-3 flex items-center justify-center border border-black/20 dark:border-white/20">3</span>
                FECHA DE DISTRIBUCIÓN
              </label>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      "w-full h-14 px-4 flex items-center justify-start gap-3 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] hover:bg-white dark:hover:bg-[#111] transition-colors rounded-none focus:outline-none focus:border-black dark:focus:border-white text-xs uppercase font-semibold",
                      !selectedDateObj ? "text-gray-400" : "text-black dark:text-white"
                    )}
                  >
                    <Calendar className="w-4 h-4 text-gray-500 shrink-0" strokeWidth={1.5} />
                    {selectedDateObj ? format(selectedDateObj, "PPP", { locale: dateLocale }) : "SELECCIONAR..."}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-white dark:bg-[#0a0a0a] border border-black dark:border-white rounded-none shadow-2xl" align="start">
                  <CalendarUI
                    mode="single"
                    selected={selectedDateObj}
                    onSelect={handleDateSelect}
                    disabled={(date) => isBefore(date, new Date().setHours(0, 0, 0, 0))}
                    initialFocus
                    locale={dateLocale}
                    className="rounded-none font-sans bg-white dark:bg-[#0a0a0a] text-black dark:text-white p-3"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Hora */}
            <div className="p-6 md:p-8 flex flex-col justify-center">
              <label className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-3 flex items-center gap-2">
                <span className="w-3 h-3 flex items-center justify-center border border-black/20 dark:border-white/20">4</span>
                HORA DE EJECUCIÓN
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-gray-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" strokeWidth={1.5} />
                <input
                  type="time"
                  value={timeString}
                  onChange={handleTimeChange}
                  className="w-full h-14 pl-12 pr-4 bg-gray-50 dark:bg-[#050505] border border-black/20 dark:border-white/20 text-xs font-semibold text-black dark:text-white uppercase focus:outline-none focus:ring-0 focus:border-black dark:focus:border-white transition-colors rounded-none placeholder:text-gray-400 [&::-webkit-calendar-picker-indicator]:dark:invert"
                />
              </div>
              <p className="text-[8px] font-bold uppercase tracking-widest text-gray-400 mt-2">
                ZONA: {Intl.DateTimeFormat().resolvedOptions().timeZone}
              </p>
            </div>

          </div>

          {/* Bloque de Error */}
          {errorMsg && (
            <div className="p-6 border-b border-black/10 dark:border-white/10 bg-red-50 dark:bg-red-900/10 border-l-4 border-l-red-500 flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" strokeWidth={1.5} />
              <p className="text-[10px] font-bold uppercase tracking-widest text-red-700 dark:text-red-400 leading-relaxed">
                {errorMsg}
              </p>
            </div>
          )}

        </div>

        {/* FOOTER DE COMANDOS */}
        <div className="bg-white dark:bg-[#0a0a0a] p-6 md:p-8 flex flex-col sm:flex-row justify-end gap-4 border-t border-black/20 dark:border-white/20 shrink-0">
          <button
            onClick={onClose}
            disabled={status === "loading"}
            className="w-full sm:w-auto h-14 px-8 border border-black/20 dark:border-white/20 bg-transparent text-black dark:text-white hover:bg-gray-50 dark:hover:bg-[#111] transition-colors text-[10px] font-bold uppercase tracking-widest rounded-none disabled:opacity-50"
          >
            {t("cancel_btn", { defaultValue: 'ANULAR' })}
          </button>

          <button
            onClick={handleSchedule}
            disabled={status === "loading" || status === "success" || connections.length === 0}
            className="w-full sm:w-auto h-14 px-10 bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-3 border-0 rounded-none disabled:opacity-50"
          >
            {status === "loading" && <QhSpinner size="sm" className="text-current" />}
            {status === "success" && <CheckCircle2 className="w-4 h-4" strokeWidth={1.5} />}
            {status === "idle" && <><Send className="w-4 h-4" strokeWidth={1.5} /> {t("schedule_idle", { defaultValue: 'CONFIRMAR PROGRAMACIÓN' })}</>}
            {status === "loading" && t("schedule_loading", { defaultValue: 'PROCESANDO...' })}
            {status === "success" && t("schedule_success", { defaultValue: 'PUBLICACIÓN GUARDADA' })}
            {status === "error" && <><Send className="w-4 h-4" strokeWidth={1.5} /> REINTENTAR</>}
          </button>
        </div>

      </div>
    </div>
  );
}