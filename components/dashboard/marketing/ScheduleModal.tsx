"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/no-giant-component */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect, useReducer } from "react";
import { useTranslations } from "next-intl";
import {
  X,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  Image as ImageIcon,
  Send,
  Globe,
} from "lucide-react";
import {
  format,
  parseISO,
  setHours,
  setMinutes,
  isBefore,
  addMinutes,
} from "date-fns";

import { useSocial } from "@/hooks/useSocial";
import type { ScheduledPostDTO } from "@/types/social";

// UI Components
import { DatePicker } from "@/components/ui/date-picker";
import { QhSpinner } from "@/components/ui/QhSpinner";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// ── Fallback Image Component ───────────────────────────────────────────────────
const SafeImage = ({
  src,
  alt,
  className,
  fallback,
}: {
  src: string;
  alt: string;
  className?: string;
  fallback: React.ReactNode;
}) => {
  const [error, setError] = useState(false);
  if (!src || error) {
    return <>{fallback}</>;
  }
  return (
    /* eslint-disable-next-line @next/next/no-img-element */
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

interface State {
  selectedConnectionId: string;
  content: string;
  scheduledAt: string;
  status: ScheduleStatus;
  errorMsg: string;
  showConnectionDropdown: boolean;
}

type Action =
  | { type: "SET_SELECTEDCONNECTIONID"; payload: string }
  | { type: "SET_CONTENT"; payload: string }
  | { type: "SET_SCHEDULEDAT"; payload: string }
  | { type: "SET_STATUS"; payload: ScheduleStatus }
  | { type: "SET_ERRORMSG"; payload: string }
  | { type: "SET_SHOWCONNECTIONDROPDOWN"; payload: boolean };

function scheduleReducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_SELECTEDCONNECTIONID":
      return { ...state, selectedConnectionId: action.payload };
    case "SET_CONTENT":
      return { ...state, content: action.payload };
    case "SET_SCHEDULEDAT":
      return { ...state, scheduledAt: action.payload };
    case "SET_STATUS":
      return { ...state, status: action.payload };
    case "SET_ERRORMSG":
      return { ...state, errorMsg: action.payload };
    case "SET_SHOWCONNECTIONDROPDOWN":
      return { ...state, showConnectionDropdown: action.payload };
    default:
      return state;
  }
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function ScheduleModal({
  isOpen,
  onClose,
  onScheduled,
  post,
  prefill,
}: ScheduleModalProps) {
  const t = useTranslations("DashboardMarketing.imageModal");
  const { connections, schedulePost, loadConnections } = useSocial();

  // ── Form State ──────────────────────────────────────────────────────────────
  const [state, dispatch] = useReducer(scheduleReducer, {
    selectedConnectionId: "",
    content: "",
    scheduledAt: "",
    status: "idle",
    errorMsg: "",
    showConnectionDropdown: false,
  });

  const {
    selectedConnectionId,
    content,
    scheduledAt,
    status,
    errorMsg,
    showConnectionDropdown,
  } = state;

  // Derivados
  const selectedDateObj = scheduledAt ? parseISO(scheduledAt) : undefined;
  const timeString = scheduledAt ? format(parseISO(scheduledAt), "HH:mm") : "";

  // ── Init ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    if (connections.length === 0) loadConnections();

    if (prefill)
      dispatch({ type: "SET_CONTENT", payload: prefill.content ?? "" });
    if (post) {
      dispatch({ type: "SET_CONTENT", payload: post.content ?? "" });
      dispatch({
        type: "SET_SELECTEDCONNECTIONID",
        payload: post.socialConnectionId ?? "",
      });
      if (post.scheduledAt) {
        dispatch({
          type: "SET_SCHEDULEDAT",
          payload: new Date(post.scheduledAt).toISOString().slice(0, 16),
        });
      }
    }

    dispatch({ type: "SET_STATUS", payload: "idle" });
    dispatch({ type: "SET_ERRORMSG", payload: "" });
  }, [isOpen, post, prefill, connections.length, loadConnections]);

  // ── Validation ──────────────────────────────────────────────────────────────
  function validate(): string | null {
    if (!selectedConnectionId)
      return t("toast_warn", {
        defaultValue: "Selecciona una red social para publicar.",
      });
    if (!content.trim())
      return t("toast_warn", {
        defaultValue: "El contenido de la publicación no puede estar vacío.",
      });
    if (!scheduledAt)
      return t("toast_warn", {
        defaultValue: "Especifica la fecha y hora de programación.",
      });

    const selected = new Date(scheduledAt);
    const minTime = getMinDateTime();
    if (isBefore(selected, minTime))
      return t("err_date_min", {
        defaultValue:
          "La fecha de publicación debe ser al menos 5 minutos a futuro.",
      });

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
    dispatch({
      type: "SET_SCHEDULEDAT",
      payload: format(newDate, "yyyy-MM-dd'T'HH:mm"),
    });
    dispatch({ type: "SET_ERRORMSG", payload: "" });
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const timeVal = e.target.value;
    if (!timeVal) return;
    const [hours, minutes] = timeVal.split(":").map(Number);
    let newDate = scheduledAt ? parseISO(scheduledAt) : new Date();
    newDate = setHours(newDate, hours);
    newDate = setMinutes(newDate, minutes);
    dispatch({
      type: "SET_SCHEDULEDAT",
      payload: format(newDate, "yyyy-MM-dd'T'HH:mm"),
    });
    dispatch({ type: "SET_ERRORMSG", payload: "" });
  };

  async function handleSchedule() {
    const validationError = validate();
    if (validationError) {
      dispatch({ type: "SET_ERRORMSG", payload: validationError });
      return;
    }

    dispatch({ type: "SET_STATUS", payload: "loading" });
    dispatch({ type: "SET_ERRORMSG", payload: "" });

    try {
      await schedulePost({
        socialConnectionId: selectedConnectionId,
        content: content.trim(),
        mediaUrls: prefill?.mediaUrls ?? post?.mediaUrls ?? [],
        scheduledAt: new Date(scheduledAt).toISOString(),
        generatedByAi: prefill?.generatedByAi ?? post?.generatedByAi ?? false,
      });

      dispatch({ type: "SET_STATUS", payload: "success" });
      setTimeout(() => {
        onScheduled?.();
        onClose();
        dispatch({ type: "SET_STATUS", payload: "idle" });
      }, 1200);
    } catch (err: any) {
      dispatch({ type: "SET_STATUS", payload: "error" });
      dispatch({
        type: "SET_ERRORMSG",
        payload:
          err?.message ??
          t("toast_error", {
            defaultValue: "Error al programar la publicación.",
          }),
      });
    }
  }

  const selectedConnection = connections.find(
    (c) => c.id === selectedConnectionId
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-0 rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh] font-sans transition-colors">
        {/* ── HEADER ─────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between p-6 bg-gray-50/60 dark:bg-[#050505] border-b border-gray-100 dark:border-gray-800 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center shrink-0 shadow-2xs text-emerald-600 dark:text-emerald-400">
              <Calendar className="w-6 h-6" strokeWidth={2} />
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Motor de Distribución
              </p>
              <DialogTitle className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white tracking-tight leading-none">
                {t("title")}
              </DialogTitle>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-white dark:bg-[#111] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0 shadow-2xs text-gray-500 cursor-pointer"
          >
            <X className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>

        {/* ── BODY ───────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-white dark:bg-[#0a0a0a] custom-scrollbar">
          {/* 1. Selector de Canal / Conexión */}
          <div className="bg-gray-50/60 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center shadow-2xs">
                1
              </span>
              <label className="text-xs font-bold text-gray-900 dark:text-white">
                {t("platform_title")}
              </label>
            </div>

            {connections.length === 0 ? (
              <div className="border border-amber-200 bg-amber-50/60 dark:bg-amber-950/20 dark:border-amber-900/40 p-4 rounded-xl text-center space-y-1">
                <p className="text-xs font-bold text-amber-900 dark:text-amber-400">
                  {t("no_accounts_title")}
                </p>
                <p className="text-[11px] font-medium text-amber-700 dark:text-amber-300">
                  {t("no_accounts_desc")}
                </p>
              </div>
            ) : (
              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    dispatch({
                      type: "SET_SHOWCONNECTIONDROPDOWN",
                      payload: !showConnectionDropdown,
                    })
                  }
                  className="w-full h-11 px-4 flex items-center justify-between border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] rounded-xl text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-2xs cursor-pointer"
                >
                  {selectedConnection ? (
                    <span className="flex items-center gap-2.5">
                      <span className="text-base leading-none">
                        {PLATFORM_ICONS[selectedConnection.platform] ?? "🌐"}
                      </span>
                      <span className="font-bold">
                        {selectedConnection.platformUserName}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md border border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40">
                        {selectedConnection.platform}
                      </span>
                    </span>
                  ) : (
                    <span className="text-gray-400 font-normal">
                      {t("platform_placeholder")}
                    </span>
                  )}
                  <ChevronDown
                    className={cn(
                      "w-4 h-4 text-gray-400 transition-transform duration-200",
                      showConnectionDropdown && "rotate-180"
                    )}
                    strokeWidth={2}
                  />
                </button>

                {showConnectionDropdown && (
                  <div className="absolute z-50 top-full left-0 w-full mt-1.5 bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl overflow-hidden divide-y divide-gray-100 dark:divide-gray-800">
                    {connections.map((conn) => (
                      <button
                        key={conn.id}
                        type="button"
                        onClick={() => {
                          dispatch({
                            type: "SET_SELECTEDCONNECTIONID",
                            payload: conn.id,
                          });
                          dispatch({
                            type: "SET_SHOWCONNECTIONDROPDOWN",
                            payload: false,
                          });
                        }}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors text-xs font-semibold cursor-pointer",
                          selectedConnectionId === conn.id
                            ? "bg-emerald-50/80 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-400"
                            : "hover:bg-gray-50 dark:hover:bg-[#111] text-gray-900 dark:text-white"
                        )}
                      >
                        <span className="text-base leading-none">
                          {PLATFORM_ICONS[conn.platform] ?? "🌐"}
                        </span>
                        <div className="flex-1 min-w-0 flex items-center justify-between">
                          <span className="truncate font-bold">
                            {conn.platformUserName}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-[#111] text-gray-600 dark:text-gray-300">
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
          <div className="bg-gray-50/60 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center shadow-2xs">
                  2
                </span>
                <label className="text-xs font-bold text-gray-900 dark:text-white">
                  Cuerpo de la publicación
                </label>
              </div>
              <span className="text-[11px] font-mono font-bold text-gray-400">
                {content.length} / 2200
              </span>
            </div>

            <textarea
              value={content}
              onChange={(e) =>
                dispatch({ type: "SET_CONTENT", payload: e.target.value })
              }
              rows={4}
              placeholder="Escriba el contenido del mensaje..."
              className="w-full p-3.5 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-2xs resize-none placeholder:text-gray-400 leading-relaxed"
            />

            {/* Adjuntos multimedia */}
            {(prefill?.mediaUrls?.length || post?.mediaUrls?.length) && (
              <div className="pt-2">
                <p className="text-[11px] font-bold text-gray-500 mb-2">
                  Archivos adjuntos (
                  {prefill?.mediaUrls?.length ?? post?.mediaUrls?.length})
                </p>
                <div className="flex gap-2 flex-wrap">
                  {(prefill?.mediaUrls ?? post?.mediaUrls ?? []).map(
                    (url, i) => (
                      <div
                        key={i}
                        className="w-14 h-14 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] overflow-hidden shrink-0 shadow-2xs"
                      >
                        {prefill?.mediaType === "video" ? (
                          <div className="w-full h-full flex items-center justify-center text-xs bg-emerald-600 text-white font-bold">
                            ▶
                          </div>
                        ) : (
                          <SafeImage
                            src={url}
                            alt="Media Preview"
                            className="w-full h-full object-cover"
                            fallback={
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <ImageIcon
                                  className="w-4 h-4"
                                  strokeWidth={2}
                                />
                              </div>
                            }
                          />
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 3. Fecha y Hora */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Fecha */}
            <div className="bg-gray-50/60 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-2xs space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center shadow-2xs">
                  3
                </span>
                <label className="text-xs font-bold text-gray-900 dark:text-white">
                  Fecha de publicación
                </label>
              </div>
              <DatePicker
                value={selectedDateObj}
                onChange={handleDateSelect}
                disabled={(date) =>
                  isBefore(date, new Date().setHours(0, 0, 0, 0))
                }
                placeholder="Seleccionar fecha..."
              />
            </div>

            {/* Hora */}
            <div className="bg-gray-50/60 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-2xs space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center shadow-2xs">
                  4
                </span>
                <label className="text-xs font-bold text-gray-900 dark:text-white">
                  Hora de ejecución
                </label>
              </div>
              <div className="relative">
                <Clock
                  className="w-4 h-4 text-emerald-600 dark:text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  strokeWidth={2}
                />
                <input
                  type="time"
                  value={timeString}
                  onChange={handleTimeChange}
                  className="w-full h-11 pl-10 pr-4 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-mono font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-2xs [&::-webkit-calendar-picker-indicator]:dark:invert"
                />
              </div>
              <p className="text-[10px] font-semibold text-gray-400 flex items-center gap-1 pt-0.5">
                <Globe className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>
                  Zona: {Intl.DateTimeFormat().resolvedOptions().timeZone}
                </span>
              </p>
            </div>
          </div>

          {/* Bloque de Error */}
          {errorMsg && (
            <div className="p-4 rounded-2xl border border-red-200 bg-red-50/60 dark:bg-red-950/20 dark:border-red-900/40 flex items-start gap-3 shadow-2xs">
              <AlertCircle
                className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5"
                strokeWidth={2}
              />
              <p className="text-xs font-semibold text-red-700 dark:text-red-400 leading-relaxed">
                {errorMsg}
              </p>
            </div>
          )}
        </div>

        {/* ── FOOTER ─────────────────────────────────────────────────── */}
        <div className="p-5 bg-gray-50/60 dark:bg-[#050505] border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={status === "loading"}
            className="w-full sm:w-auto h-11 px-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#111] transition-all text-xs font-bold shadow-2xs disabled:opacity-50 cursor-pointer"
          >
            {t("cancel_btn")}
          </button>

          <button
            type="button"
            onClick={handleSchedule}
            disabled={
              status === "loading" ||
              status === "success" ||
              connections.length === 0
            }
            className="w-full sm:w-auto h-11 px-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 border-0 cursor-pointer disabled:opacity-50"
          >
            {status === "loading" && (
              <QhSpinner size="sm" className="text-white" />
            )}
            {status === "success" && (
              <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
            )}
            {status === "idle" && (
              <>
                <Send className="w-4 h-4" strokeWidth={2} />
                <span>{t("schedule_idle")}</span>
              </>
            )}
            {status === "loading" && <span>{t("schedule_loading")}</span>}
            {status === "success" && <span>{t("schedule_success")}</span>}
            {status === "error" && (
              <>
                <Send className="w-4 h-4" strokeWidth={2} />
                <span>Reintentar</span>
              </>
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}