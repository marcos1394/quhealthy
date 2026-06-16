"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { X, Calendar, Clock, CheckCircle2, AlertCircle, Loader2, ChevronDown, Image as ImageIcon } from "lucide-react";
import { useSocial } from "@/hooks/useSocial";
import type { SocialConnectionDTO, ScheduledPostDTO } from "@/types/social";

// UI Components
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarUI } from "@/components/ui/calendar";
import { format, parseISO, setHours, setMinutes, isBefore, addMinutes } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { cn } from "@/lib/utils";

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
  // Para reprogramar un post existente
  post?: ScheduledPostDTO;
  // Para programar contenido nuevo desde AiStudioForm
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

function formatDatePreview(dateStr: string, locale = "es-MX"): string {
  if (!dateStr) return "";
  try {
    return new Intl.DateTimeFormat(locale, {
      weekday: "long", day: "numeric", month: "long",
      hour: "2-digit", minute: "2-digit",
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
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
  const [selectedConnectionId, setSelectedConnectionId] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [scheduledAt, setScheduledAt] = useState<string>("");
  const [status, setStatus] = useState<ScheduleStatus>("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [showConnectionDropdown, setShowConnectionDropdown] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Derivados para el Popover mixto (Fecha y Hora)
  const selectedDateObj = scheduledAt ? parseISO(scheduledAt) : undefined;
  const timeString = scheduledAt ? format(parseISO(scheduledAt), "HH:mm") : "";

  // ── Init ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;

    // Carga conexiones activas si no están cargadas aún
    if (connections.length === 0) loadConnections();

    // Prefill desde AiStudioForm
    if (prefill) {
      setContent(prefill.content ?? "");
    }
    // Reprogramar post existente
    if (post) {
      setContent(post.content ?? "");
      setSelectedConnectionId(post.socialConnectionId ?? "");
      if (post.scheduledAt) {
        setScheduledAt(new Date(post.scheduledAt).toISOString().slice(0, 16));
      }
    }

    // Reset status
    setStatus("idle");
    setErrorMsg("");
  }, [isOpen]);

  // ── Validation ──────────────────────────────────────────────────────────────
  function validate(): string | null {
    if (!selectedConnectionId) return t("toast_warn");
    if (!content.trim()) return t("toast_warn");
    if (!scheduledAt) return t("toast_warn");

    const selected = new Date(scheduledAt);
    const minTime = getMinDateTime();
    if (isBefore(selected, minTime)) return t("err_date_min");

    return null;
  }

  // ── Handlers Fecha y Hora ───────────────────────────────────────────────────
  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    // Mantiene la hora si ya existía
    let newDate = date;
    if (scheduledAt) {
      const oldTime = parseISO(scheduledAt);
      newDate = setHours(newDate, oldTime.getHours());
      newDate = setMinutes(newDate, oldTime.getMinutes());
    } else {
      // Si no había hora, le ponemos la actual + 1 hora
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

  // ── Submit ──────────────────────────────────────────────────────────────────
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
      setErrorMsg(err?.message ?? t("toast_error"));
    }
  }

  const selectedConnection = connections.find((c) => c.id === selectedConnectionId);

  if (!isOpen) return null;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop (Glassmorphism) */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-slate-200/50 dark:border-slate-800/50 overflow-hidden font-sans transform transition-all">

        {/* Header */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              {t("title")}
            </h2>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
              {t("subtitle")}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors"
            aria-label="Cerrar modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 sm:px-8 py-6 space-y-6">

          {/* 1. Selector de cuenta social (conexión) */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
              {t("platform_title")}
            </label>

            {connections.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 p-6 text-center bg-slate-50/50 dark:bg-slate-800/20">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t("no_accounts_title")}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                  {t("no_accounts_desc")}
                </p>
              </div>
            ) : (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowConnectionDropdown((v) => !v)}
                  className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-left hover:border-slate-400 dark:hover:border-slate-500 hover:bg-white dark:hover:bg-slate-800 transition-all focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100"
                >
                  {selectedConnection ? (
                    <span className="flex items-center gap-3 text-sm text-slate-800 dark:text-white">
                      <span className="text-xl">
                        {PLATFORM_ICONS[selectedConnection.platform] ?? "🌐"}
                      </span>
                      <span className="font-semibold">{selectedConnection.platformUserName}</span>
                      <span className="text-xs font-medium text-slate-400 dark:text-slate-500 bg-slate-200/50 dark:bg-slate-700/50 px-2 py-0.5 rounded-full">
                        {selectedConnection.platform}
                      </span>
                    </span>
                  ) : (
                    <span className="text-sm text-slate-400 dark:text-slate-500 font-medium">
                      {t("platform_placeholder")}
                    </span>
                  )}
                  <ChevronDown
                    size={18}
                    className={`text-slate-400 transition-transform duration-200 ${showConnectionDropdown ? "rotate-180" : ""}`}
                  />
                </button>

                {showConnectionDropdown && (
                  <div className="absolute z-10 mt-2 w-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-xl overflow-hidden py-1">
                    {connections.map((conn) => (
                      <button
                        key={conn.id}
                        type="button"
                        onClick={() => {
                          setSelectedConnectionId(conn.id);
                          setShowConnectionDropdown(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${
                          selectedConnectionId === conn.id
                            ? "bg-slate-50 dark:bg-slate-700/30"
                            : ""
                        }`}
                      >
                        <span className="text-xl">
                          {PLATFORM_ICONS[conn.platform] ?? "🌐"}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                            {conn.platformUserName}
                          </p>
                          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{conn.platform}</p>
                        </div>
                        {selectedConnectionId === conn.id && (
                          <CheckCircle2 size={18} className="text-slate-900 dark:text-white shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 2. Contenido editable */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
              Contenido
            </label>
            <div className="relative">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={5}
                placeholder="Escribe o edita el contenido de tu publicación..."
                className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-sm font-medium text-slate-800 dark:text-white placeholder-slate-400 resize-none hover:bg-white dark:hover:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white focus:bg-white dark:focus:bg-slate-800 transition-all"
              />
              <span className="absolute bottom-3 right-4 text-xs font-medium text-slate-400">
                {content.length} / 2200
              </span>
            </div>
          </div>

          {/* 3. Fecha y hora */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Fecha (Shadcn Calendar Popover) */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
                <span className="flex items-center gap-2">
                  <Calendar size={16} className="text-slate-500" />
                  Fecha
                </span>
              </label>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      "w-full flex items-center gap-2 px-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-sm font-medium text-left transition-all hover:bg-white dark:hover:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white",
                      !selectedDateObj ? "text-slate-400" : "text-slate-800 dark:text-white"
                    )}
                  >
                    {selectedDateObj ? format(selectedDateObj, "PPP", { locale: dateLocale }) : "Seleccionar fecha"}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl" align="start">
                  <CalendarUI
                    mode="single"
                    selected={selectedDateObj}
                    onSelect={handleDateSelect}
                    disabled={(date) => isBefore(date, new Date().setHours(0, 0, 0, 0))}
                    initialFocus
                    locale={dateLocale}
                    className="rounded-2xl"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Hora (Input Time nativo pero estilizado) */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
                <span className="flex items-center gap-2">
                  <Clock size={16} className="text-slate-500" />
                  Hora
                </span>
              </label>
              <input
                type="time"
                value={timeString}
                onChange={handleTimeChange}
                className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-sm font-medium text-slate-800 dark:text-white hover:border-slate-400 dark:hover:border-slate-500 hover:bg-white dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white transition-all [&::-webkit-calendar-picker-indicator]:dark:invert"
              />
            </div>
          </div>
          
          <div className="mt-1">
             <p className="text-xs font-medium text-slate-500 dark:text-slate-400 px-1">
                {t("timezone_info")} <span className="text-slate-700 dark:text-slate-300">{Intl.DateTimeFormat().resolvedOptions().timeZone}</span>
              </p>
          </div>

          {/* Resumen del post (si hay media prefill) */}
          {(prefill?.mediaUrls?.length || post?.mediaUrls?.length) && (
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 p-4">
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-3 uppercase tracking-wider">
                {t("summary_title")}
              </p>
              <div className="flex gap-3 flex-wrap">
                {(prefill?.mediaUrls ?? post?.mediaUrls ?? []).map((url, i) => (
                  <div
                    key={i}
                    className="w-20 h-20 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-700 shrink-0 shadow-sm border border-slate-200/50 dark:border-slate-600/50"
                  >
                    {prefill?.mediaType === "video" ? (
                      <div className="w-full h-full flex items-center justify-center text-2xl bg-slate-800 text-white">▶️</div>
                    ) : (
                      <SafeImage 
                        src={url} 
                        alt="Media Preview" 
                        className="w-full h-full object-cover" 
                        fallback={
                          <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-100 dark:bg-slate-800">
                            <ImageIcon className="w-6 h-6" />
                          </div>
                        }
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error message */}
          {errorMsg && (
            <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50">
              <AlertCircle size={18} className="text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-red-700 dark:text-red-300 leading-relaxed">{errorMsg}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 sm:px-8 py-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80">
          <button
            onClick={onClose}
            disabled={status === "loading"}
            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-all disabled:opacity-50"
          >
            {t("cancel_btn")}
          </button>

          <button
            onClick={handleSchedule}
            disabled={status === "loading" || status === "success" || connections.length === 0}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold shadow-md hover:shadow-lg hover:bg-slate-800 dark:hover:bg-slate-100 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-md disabled:cursor-not-allowed"
          >
            {status === "loading" && <Loader2 size={18} className="animate-spin" />}
            {status === "success" && <CheckCircle2 size={18} />}
            {status === "idle" && t("schedule_idle")}
            {status === "loading" && t("schedule_loading")}
            {status === "success" && t("schedule_success")}
            {status === "error" && t("schedule_idle")}
          </button>
        </div>
      </div>
    </div>
  );
}