"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSessionStore } from "@/stores/SessionStore";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Bell,
  Loader2,
  CheckCheck,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
  Calendar,
  CreditCard,
  Star,
  Shield,
  ShoppingBag,
  ExternalLink,
  MessageSquare,
} from "lucide-react";
import axiosInstance from "@/lib/axios";
import { formatDistanceToNow } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export interface AppNotification {
  id: number;
  title: string;
  message?: string;
  body?: string;
  type?: "INFO" | "SUCCESS" | "WARNING" | "ERROR";
  isRead?: boolean;
  read?: boolean;
  actionLink?: string | null;
  link?: string | null;
  metadata?: Record<string, any>;
  createdAt: string;
}

interface UnreadCountResponse {
  unreadCount?: number;
  count?: number;
}

export const NotificationBell = ({
  isCollapsed = false,
  className,
}: {
  isCollapsed?: boolean;
  className?: string;
}) => {
  const t = useTranslations("NotificationBell");
  const locale = useLocale();
  const router = useRouter();
  const dateLocale = locale === "en" ? enUS : es;

  const { user } = useSessionStore();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"ALL" | "UNREAD">("ALL");
  const [isOpen, setIsOpen] = useState(false);

  // ── 1. CARGA INICIAL Y POLLING DE RESPALDO DE UNREAD COUNT ────────────────
  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;
    try {
      const res = await axiosInstance.get<UnreadCountResponse>("/api/notifications/unread-count");
      const count =
        typeof res.data?.unreadCount === "number"
          ? res.data.unreadCount
          : typeof res.data?.count === "number"
          ? res.data.count
          : 0;
      setUnreadCount(count);
    } catch {
      // Fallback silencioso
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      setNotifications([]);
      return;
    }

    // Consulta inmediata al montar
    fetchUnreadCount();

    // Polling de respaldo cada 45 segundos
    const pollInterval = setInterval(() => {
      fetchUnreadCount();
    }, 45000);

    // 🔥 Suscripción a Firestore signals en tiempo real (si está configurado)
    let unsubscribeFirestore: (() => void) | null = null;
    try {
      const roleStr = user.role ? user.role.replace("ROLE_", "") : "CONSUMER";
      const documentId = `${roleStr}_${user.id}`;
      const signalRef = doc(db, "notificationSignals", documentId);

      unsubscribeFirestore = onSnapshot(
        signalRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            if (typeof data.unreadCount === "number") {
              setUnreadCount(data.unreadCount);
            }
          }
        },
        () => {
          // Si Firestore está deshabilitado en el cliente, el polling de respaldo se encarga
        }
      );
    } catch {
      // Silent catch
    }

    return () => {
      clearInterval(pollInterval);
      if (unsubscribeFirestore) unsubscribeFirestore();
    };
  }, [user, fetchUnreadCount]);

  // ── 2. CARGAR HISTORIAL AL ABRIR EL POPOVER ───────────────────────────────
  const fetchNotifications = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const res = await axiosInstance.get("/api/notifications/history?size=25");
      const items: AppNotification[] = res.data?.content || res.data || [];
      setNotifications(items);
    } catch {
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = async (open: boolean) => {
    setIsOpen(open);
    if (open && user) {
      await fetchNotifications();
      await fetchUnreadCount();
    }
  };

  // ── 3. MARCAR TODAS COMO LEÍDAS ──────────────────────────────────────────
  const markAllAsRead = async () => {
    try {
      setUnreadCount(0);
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true, read: true }))
      );
      await axiosInstance.put("/api/notifications/read-all");
    } catch {
      // Reintentar sincronizar conteo
      fetchUnreadCount();
    }
  };

  // ── 4. MARCAR UNA COMO LEÍDA Y NAVEGAR ────────────────────────────────────
  const handleNotificationClick = async (n: AppNotification) => {
    const isAlreadyRead = n.isRead || n.read;

    // Actualización optimista
    if (!isAlreadyRead) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === n.id ? { ...item, isRead: true, read: true } : item
        )
      );

      try {
        await axiosInstance.put(`/api/notifications/${n.id}/read`);
      } catch {
        // Fallback silencioso
      }
    }

    // Redirección si incluye link
    const targetLink = n.actionLink || n.link;
    if (targetLink) {
      setIsOpen(false);
      router.push(targetLink as any);
    }
  };

  // ── 5. HELPER DE ICONOS Y COLORES POR TIPO / TEMA ────────────────────────
  const getNotificationVisuals = (n: AppNotification) => {
    const type = n.type || "INFO";
    const titleLower = (n.title || "").toLowerCase();
    const linkLower = (n.actionLink || n.link || "").toLowerCase();

    if (titleLower.includes("cita") || titleLower.includes("appointment") || linkLower.includes("appointment")) {
      return {
        icon: Calendar,
        iconColor: "text-emerald-600 dark:text-emerald-400",
        bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
        borderColor: "border-emerald-100 dark:border-emerald-900/30",
      };
    }
    if (titleLower.includes("pago") || titleLower.includes("plan") || titleLower.includes("suscripción") || titleLower.includes("venta")) {
      return {
        icon: CreditCard,
        iconColor: "text-blue-600 dark:text-blue-400",
        bgColor: "bg-blue-50 dark:bg-blue-950/30",
        borderColor: "border-blue-100 dark:border-blue-900/30",
      };
    }
    if (titleLower.includes("mensaje") || titleLower.includes("crm")) {
      return {
        icon: MessageSquare,
        iconColor: "text-purple-600 dark:text-purple-400",
        bgColor: "bg-purple-50 dark:bg-purple-950/30",
        borderColor: "border-purple-100 dark:border-purple-900/30",
      };
    }
    if (titleLower.includes("reseña") || titleLower.includes("califica")) {
      return {
        icon: Star,
        iconColor: "text-amber-500",
        bgColor: "bg-amber-50 dark:bg-amber-950/30",
        borderColor: "border-amber-100 dark:border-amber-900/30",
      };
    }
    if (titleLower.includes("seguridad") || titleLower.includes("login") || titleLower.includes("verific")) {
      return {
        icon: Shield,
        iconColor: "text-indigo-600 dark:text-indigo-400",
        bgColor: "bg-indigo-50 dark:bg-indigo-950/30",
        borderColor: "border-indigo-100 dark:border-indigo-900/30",
      };
    }
    if (titleLower.includes("envío") || titleLower.includes("pedido") || titleLower.includes("compra")) {
      return {
        icon: ShoppingBag,
        iconColor: "text-teal-600 dark:text-teal-400",
        bgColor: "bg-teal-50 dark:bg-teal-950/30",
        borderColor: "border-teal-100 dark:border-teal-900/30",
      };
    }

    switch (type) {
      case "SUCCESS":
        return {
          icon: CheckCircle2,
          iconColor: "text-emerald-600 dark:text-emerald-400",
          bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
          borderColor: "border-emerald-100 dark:border-emerald-900/30",
        };
      case "WARNING":
        return {
          icon: AlertTriangle,
          iconColor: "text-amber-600 dark:text-amber-400",
          bgColor: "bg-amber-50 dark:bg-amber-950/30",
          borderColor: "border-amber-100 dark:border-amber-900/30",
        };
      case "ERROR":
        return {
          icon: AlertCircle,
          iconColor: "text-rose-600 dark:text-rose-400",
          bgColor: "bg-rose-50 dark:bg-rose-950/30",
          borderColor: "border-rose-100 dark:border-rose-900/30",
        };
      default:
        return {
          icon: Info,
          iconColor: "text-gray-600 dark:text-gray-400",
          bgColor: "bg-gray-50 dark:bg-[#151515]",
          borderColor: "border-gray-100 dark:border-gray-800",
        };
    }
  };

  // Filtrar según pestaña
  const displayedNotifications = useMemo(() => {
    if (activeTab === "UNREAD") {
      return notifications.filter((n) => !n.isRead && !n.read);
    }
    return notifications;
  }, [notifications, activeTab]);

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "relative text-gray-600 dark:text-gray-400 hover:bg-gray-100/80 dark:hover:bg-[#141414] hover:text-gray-900 dark:hover:text-white rounded-2xl h-9 w-9 shrink-0 transition-all cursor-pointer p-0 flex items-center justify-center",
            isCollapsed && "mx-auto",
            className
          )}
          title={t("title")}
          aria-label={t("title")}
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500 items-center justify-center text-[9px] text-white font-mono font-black border-2 border-white dark:border-[#0a0a0a]">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-85 sm:w-96 p-0 bg-white dark:bg-[#0a0a0a] border-gray-100 dark:border-gray-800 shadow-2xl rounded-3xl overflow-hidden font-sans select-none z-[110]"
      >
        {/* ── HEADER ─────────────────────────────────────────────────── */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-gray-900 dark:text-white tracking-tight">
                {t("title")}
              </h3>
              {unreadCount > 0 ? (
                <span className="px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30 text-[10px] font-mono font-black">
                  {unreadCount}
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 text-[10px] font-bold">
                  {t("badge_all_read")}
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>{t("mark_all_read")}</span>
              </button>
            )}
          </div>

          {/* Filtros de Pestaña */}
          <div className="flex items-center p-0.5 rounded-xl bg-gray-100 dark:bg-[#141414] border border-gray-200/60 dark:border-gray-800 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab("ALL")}
              className={cn(
                "flex-1 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer",
                activeTab === "ALL"
                  ? "bg-white dark:bg-[#202020] text-gray-900 dark:text-white shadow-2xs"
                  : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              {t("tab_all")} ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("UNREAD")}
              className={cn(
                "flex-1 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer",
                activeTab === "UNREAD"
                  ? "bg-white dark:bg-[#202020] text-gray-900 dark:text-white shadow-2xs"
                  : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              {t("tab_unread")} ({unreadCount})
            </button>
          </div>
        </div>

        {/* ── LISTA DE NOTIFICACIONES ─────────────────────────────────── */}
        <div className="max-h-[380px] overflow-y-auto custom-scrollbar divide-y divide-gray-50 dark:divide-gray-800/60">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-8 text-center space-y-2">
              <Loader2 className="animate-spin text-emerald-600 w-6 h-6" />
              <p className="text-xs text-gray-400 font-medium">{t("loading")}</p>
            </div>
          ) : displayedNotifications.length > 0 ? (
            displayedNotifications.map((n) => {
              const visuals = getNotificationVisuals(n);
              const IconComp = visuals.icon;
              const isUnread = !n.isRead && !n.read;
              const hasLink = !!(n.actionLink || n.link);
              const messageText = n.message || n.body || "";

              let formattedDate = t("now");
              try {
                if (n.createdAt) {
                  formattedDate = formatDistanceToNow(new Date(n.createdAt), {
                    addSuffix: true,
                    locale: dateLocale,
                  });
                }
              } catch {
                formattedDate = t("now");
              }

              return (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={cn(
                    "p-3.5 flex gap-3 transition-colors cursor-pointer group relative",
                    isUnread
                      ? "bg-emerald-50/40 dark:bg-emerald-950/15 hover:bg-emerald-50/70 dark:hover:bg-emerald-950/25"
                      : "hover:bg-gray-50 dark:hover:bg-[#111]"
                  )}
                >
                  {/* Icono de Notificación */}
                  <div
                    className={cn(
                      "w-9 h-9 rounded-2xl border flex items-center justify-center shrink-0 shadow-2xs mt-0.5",
                      visuals.bgColor,
                      visuals.borderColor
                    )}
                  >
                    <IconComp className={cn("w-4 h-4", visuals.iconColor)} strokeWidth={2} />
                  </div>

                  {/* Contenido */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-start justify-between gap-1.5">
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white leading-snug line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {n.title || t("title")}
                      </h4>

                      {/* Dot No Leído */}
                      {isUnread && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-1" />
                      )}
                    </div>

                    {messageText && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-snug line-clamp-2">
                        {messageText}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-0.5">
                      <span className="text-[10px] text-gray-400 font-medium">
                        {formattedDate}
                      </span>

                      {hasLink && (
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span>{t("open_link")}</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            /* ESTADO VACÍO */
            <div className="py-10 px-6 text-center space-y-3">
              <div className="w-14 h-14 rounded-3xl bg-gray-50 dark:bg-[#111] border border-gray-100 dark:border-gray-800 flex items-center justify-center text-gray-300 dark:text-gray-700 mx-auto shadow-inner">
                <Bell className="w-6 h-6 stroke-1" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                  {activeTab === "UNREAD" ? t("unread_empty_title") : t("empty_title")}
                </h4>
                <p className="text-[11px] text-gray-400 max-w-xs mx-auto leading-relaxed">
                  {activeTab === "UNREAD" ? t("unread_empty_desc") : t("empty_desc")}
                </p>
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};