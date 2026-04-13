"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { X, Calendar, Clock, CheckCircle2, AlertCircle, Loader2, ChevronDown } from "lucide-react";
import { useSocial } from "@/hooks/useSocial";
import type { SocialConnectionDTO, ScheduledPostDTO } from "@/types/social";

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

function getMinDateTime(): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() + 6); // mínimo 5 min adelante + 1 buffer
  return d.toISOString().slice(0, 16);
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
  const { connections, schedulePost, loadConnections } = useSocial();

  // ── Form state ──────────────────────────────────────────────────────────────
  const [selectedConnectionId, setSelectedConnectionId] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [scheduledAt, setScheduledAt] = useState<string>("");
  const [status, setStatus] = useState<ScheduleStatus>("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [showConnectionDropdown, setShowConnectionDropdown] = useState(false);

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
    const now = new Date();
    if (selected <= now) return t("err_date_past");

    const diffMinutes = (selected.getTime() - now.getTime()) / 60000;
    if (diffMinutes < 5) return t("err_date_min");

    return null;
  }

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
        // ✅ Alineado exactamente con SchedulePostRequest.java
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              {t("title")}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {t("subtitle")}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">

          {/* 1. Selector de cuenta social (conexión) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              {t("platform_title")}
            </label>

            {connections.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-600 p-4 text-center">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  {t("no_accounts_title")}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  {t("no_accounts_desc")}
                </p>
              </div>
            ) : (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowConnectionDropdown((v) => !v)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-left hover:border-medical-400 dark:hover:border-medical-500 transition-colors"
                >
                  {selectedConnection ? (
                    <span className="flex items-center gap-2 text-sm text-slate-800 dark:text-white">
                      <span className="text-lg">
                        {PLATFORM_ICONS[selectedConnection.platform] ?? "🌐"}
                      </span>
                      <span className="font-medium">{selectedConnection.platformUserName}</span>
                      <span className="text-xs text-slate-400 dark:text-slate-500">
                        · {selectedConnection.platform}
                      </span>
                    </span>
                  ) : (
                    <span className="text-sm text-slate-400 dark:text-slate-500">
                      {t("platform_placeholder")}
                    </span>
                  )}
                  <ChevronDown
                    size={16}
                    className={`text-slate-400 transition-transform ${showConnectionDropdown ? "rotate-180" : ""}`}
                  />
                </button>

                {showConnectionDropdown && (
                  <div className="absolute z-10 mt-1 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg overflow-hidden">
                    {connections.map((conn) => (
                      <button
                        key={conn.id}
                        type="button"
                        onClick={() => {
                          setSelectedConnectionId(conn.id);
                          setShowConnectionDropdown(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${
                          selectedConnectionId === conn.id
                            ? "bg-medical-50 dark:bg-medical-900/20"
                            : ""
                        }`}
                      >
                        <span className="text-xl">
                          {PLATFORM_ICONS[conn.platform] ?? "🌐"}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 dark:text-white truncate">
                            {conn.platformUserName}
                          </p>
                          <p className="text-xs text-slate-400">{conn.platform}</p>
                        </div>
                        {selectedConnectionId === conn.id && (
                          <CheckCircle2 size={16} className="text-medical-600 shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 2. Contenido editable */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Contenido
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              placeholder="Escribe o edita el contenido de tu publicación..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-white placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-medical-500 focus:border-transparent transition"
            />
            <p className="text-xs text-slate-400 mt-1 text-right">
              {content.length} caracteres
            </p>
          </div>

          {/* 3. Fecha y hora */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              <span className="flex items-center gap-1.5">
                <Calendar size={14} />
                {t("datetime_title")}
              </span>
            </label>
            <input
              type="datetime-local"
              value={scheduledAt}
              min={getMinDateTime()}
              onChange={(e) => {
                setScheduledAt(e.target.value);
                setErrorMsg("");
              }}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-medical-500 focus:border-transparent transition"
            />
            {scheduledAt && (
              <p className="text-xs text-teal-600 dark:text-teal-400 mt-1.5 flex items-center gap-1">
                <Clock size={12} />
                {formatDatePreview(scheduledAt)}
              </p>
            )}
            <p className="text-xs text-slate-400 mt-1">
              {t("timezone_info")} {Intl.DateTimeFormat().resolvedOptions().timeZone}
            </p>
          </div>

          {/* Resumen del post (si hay media prefill) */}
          {(prefill?.mediaUrls?.length || post?.mediaUrls?.length) && (
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-3">
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                {t("summary_title")}
              </p>
              <div className="flex gap-2 flex-wrap">
                {(prefill?.mediaUrls ?? post?.mediaUrls ?? []).map((url, i) => (
                  <div
                    key={i}
                    className="w-16 h-16 rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-700 shrink-0"
                  >
                    {prefill?.mediaType === "video" ? (
                      <div className="w-full h-full flex items-center justify-center text-2xl">▶️</div>
                    ) : (
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error message */}
          {errorMsg && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <AlertCircle size={16} className="text-red-500 shrink-0" />
              <p className="text-sm text-red-600 dark:text-red-400">{errorMsg}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            onClick={onClose}
            disabled={status === "loading"}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            {t("cancel_btn")}
          </button>

          <button
            onClick={handleSchedule}
            disabled={status === "loading" || status === "success" || connections.length === 0}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-medical-600 hover:bg-medical-700 text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === "loading" && <Loader2 size={16} className="animate-spin" />}
            {status === "success" && <CheckCircle2 size={16} />}
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