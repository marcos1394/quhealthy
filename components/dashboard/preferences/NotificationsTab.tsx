"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  BellRing,
  Smartphone,
  Mail,
  Bell,
  MessageSquare,
  Info,
  Check,
  Volume2,
  VolumeX,
  Sparkles,
  Zap,
  Calendar,
  Star,
  FileText,
  Gift,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";

import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { PreferenceCard } from "./PreferenceCard";

export type UserRole = "provider" | "consumer";

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  [key: string]: boolean;
}

interface NotificationsTabProps {
  preferences: { notifications: NotificationPreferences };
  setPreferences: React.Dispatch<React.SetStateAction<any>>;
  editMode: boolean;
  role: UserRole;
}

export const NotificationsTab: React.FC<NotificationsTabProps> = ({
  preferences,
  setPreferences,
  editMode,
  role,
}) => {
  const t = useTranslations("DashboardSettings.notifications");
  const [recentlyToggled, setRecentlyToggled] = useState<string | null>(null);

  const channelsConfig = [
    {
      id: "email",
      label: t("channel_email_label"),
      icon: Mail,
      description: t("channel_email_desc"),
      example: t("channel_email_example"),
    },
    {
      id: "push",
      label: t("channel_push_label"),
      icon: Bell,
      description: t("channel_push_desc"),
      example: t("channel_push_example"),
    },
    {
      id: "sms",
      label: t("channel_sms_label"),
      icon: MessageSquare,
      description: t("channel_sms_desc"),
      example: t("channel_sms_example"),
    },
  ];

  const notificationTypesConfig = {
    provider: [
      {
        id: "new_appointment",
        label: t("type_new_appointment_label"),
        icon: Calendar,
        description: t("type_new_appointment_desc"),
        priority: "high",
        frequency: t("type_new_appointment_freq"),
      },
      {
        id: "cancellations",
        label: t("type_cancellations_label"),
        icon: AlertCircle,
        description: t("type_cancellations_desc"),
        priority: "high",
        frequency: t("type_cancellations_freq"),
      },
      {
        id: "reviews",
        label: t("type_reviews_label"),
        icon: Star,
        description: t("type_reviews_desc"),
        priority: "medium",
        frequency: t("type_reviews_freq"),
      },
    ],
    consumer: [
      {
        id: "reminders",
        label: t("type_reminders_label"),
        icon: Calendar,
        description: t("type_reminders_desc"),
        priority: "high",
        frequency: t("type_reminders_freq"),
      },
      {
        id: "promotions",
        label: t("type_promotions_label"),
        icon: Gift,
        description: t("type_promotions_desc"),
        priority: "low",
        frequency: t("type_promotions_freq"),
      },
      {
        id: "documents",
        label: t("type_documents_label"),
        icon: FileText,
        description: t("type_documents_desc"),
        priority: "high",
        frequency: t("type_documents_freq"),
      },
    ],
  };

  const handleToggle = (key: string, value: boolean) => {
    setPreferences((prev: any) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value,
      },
    }));

    setRecentlyToggled(key);
    setTimeout(() => setRecentlyToggled(null), 2000);
  };

  const getActiveChannelsCount = () => {
    return channelsConfig.filter((c) => preferences.notifications[c.id]).length;
  };

  const getActiveNotificationsCount = () => {
    return notificationTypesConfig[role].filter(
      (n) => preferences.notifications[n.id] ?? true
    ).length;
  };

  const getPriorityBadge = (priority: string) => {
    const configs: Record<string, { text: string; className: string }> = {
      high: {
        text: t("priority_high"),
        className:
          "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 border-red-200 dark:border-red-900/40",
      },
      medium: {
        text: t("priority_medium"),
        className:
          "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border-amber-200 dark:border-amber-900/40",
      },
      low: {
        text: t("priority_low"),
        className:
          "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700",
      },
    };

    const config = configs[priority] || configs.low;

    return (
      <span
        className={cn(
          "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border shadow-2xs",
          config.className
        )}
      >
        {config.text}
      </span>
    );
  };

  const activeChannels = getActiveChannelsCount();
  const activeNotifications = getActiveNotificationsCount();
  const allChannelsOff = activeChannels === 0;

  return (
    <div className="space-y-6 font-sans transition-colors">
      {/* ── RESUMEN DE ESTADO ────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-3xl p-5 shadow-2xs"
      >
        <div className="flex items-start gap-4">
          <div className="p-2.5 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-emerald-100 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 shrink-0 shadow-2xs">
            {activeChannels > 0 ? (
              <Volume2 className="w-5 h-5" strokeWidth={2} />
            ) : (
              <VolumeX className="w-5 h-5 text-gray-400" strokeWidth={2} />
            )}
          </div>
          <div className="space-y-1.5 flex-1 min-w-0">
            <p className="text-xs font-bold text-gray-900 dark:text-white">
              {t("status_title")}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white dark:bg-[#0a0a0a] text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 shadow-2xs">
                {t("channels_active_summary", {
                  active: activeChannels,
                  total: channelsConfig.length,
                })}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 shadow-2xs">
                {t("types_active_summary", {
                  active: activeNotifications,
                  total: notificationTypesConfig[role].length,
                })}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── ALERTA SI TODOS LOS CANALES ESTÁN APAGADOS ───────────────── */}
      <AnimatePresence>
        {allChannelsOff && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl p-4 flex items-start gap-3 shadow-2xs"
          >
            <AlertCircle
              className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5"
              strokeWidth={2}
            />
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-amber-900 dark:text-amber-300">
                {t("all_channels_off_title")}
              </p>
              <p className="text-xs font-medium text-amber-700 dark:text-amber-400/80 leading-relaxed">
                {t("all_channels_off_desc")}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── SECCIÓN 1: CANALES DE CONTACTO ───────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <PreferenceCard
          icon={Smartphone}
          title={t("channels_title")}
          description={t("channels_desc")}
        >
          <div className="space-y-3 pt-1">
            {channelsConfig.map((channel, index) => {
              const isActive = preferences.notifications[channel.id];
              const Icon = channel.icon;

              return (
                <motion.div
                  key={channel.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className={cn(
                    "relative flex items-start justify-between p-4 rounded-2xl border transition-all duration-200 shadow-2xs select-none",
                    isActive
                      ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40"
                      : "bg-gray-50/60 dark:bg-[#050505] border-gray-100 dark:border-gray-800",
                    recentlyToggled === channel.id
                      ? "ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-[#0a0a0a]"
                      : ""
                  )}
                >
                  {isActive && (
                    <div className="absolute top-2.5 right-2.5 bg-emerald-600 text-white rounded-full p-0.5 shadow-2xs">
                      <Check className="w-3 h-3" strokeWidth={2.5} />
                    </div>
                  )}

                  <div className="flex items-start gap-3.5 flex-1 min-w-0 pr-4">
                    <div
                      className={cn(
                        "p-2.5 rounded-xl border shrink-0 shadow-2xs",
                        isActive
                          ? "bg-white dark:bg-[#0a0a0a] border-emerald-200 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400"
                          : "bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-gray-800 text-gray-400"
                      )}
                    >
                      <Icon className="w-5 h-5" strokeWidth={2} />
                    </div>

                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                          {channel.label}
                        </p>
                        {isActive && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 shadow-2xs">
                            {t("active_badge")}
                          </span>
                        )}
                      </div>

                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                        {channel.description}
                      </p>

                      <p className="text-[11px] font-mono font-semibold text-gray-400 flex items-center gap-1 pt-0.5">
                        <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        <span>{channel.example}</span>
                      </p>
                    </div>
                  </div>

                  <Switch
                    checked={isActive}
                    onCheckedChange={(val) => handleToggle(channel.id, val)}
                    disabled={!editMode}
                    className={cn(!editMode ? "opacity-50 cursor-not-allowed" : "")}
                  />
                </motion.div>
              );
            })}
          </div>
        </PreferenceCard>
      </motion.div>

      {/* ── SECCIÓN 2: TIPOS DE ALERTA ───────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <PreferenceCard
          icon={BellRing}
          title={t("types_title")}
          description={t("types_desc")}
        >
          <div className="space-y-3 pt-1">
            {notificationTypesConfig[role].map((item, index) => {
              const isActive = preferences.notifications[item.id] ?? true;
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className={cn(
                    "relative flex items-start justify-between p-4 rounded-2xl border transition-all duration-200 shadow-2xs select-none",
                    isActive
                      ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40"
                      : "bg-gray-50/60 dark:bg-[#050505] border-gray-100 dark:border-gray-800",
                    recentlyToggled === item.id
                      ? "ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-[#0a0a0a]"
                      : ""
                  )}
                >
                  {isActive && (
                    <div className="absolute top-2.5 right-2.5 bg-emerald-600 text-white rounded-full p-0.5 shadow-2xs">
                      <Check className="w-3 h-3" strokeWidth={2.5} />
                    </div>
                  )}

                  <div className="flex items-start gap-3.5 flex-1 min-w-0 pr-4">
                    <div
                      className={cn(
                        "p-2.5 rounded-xl border shrink-0 shadow-2xs",
                        isActive
                          ? "bg-white dark:bg-[#0a0a0a] border-emerald-200 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400"
                          : "bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-gray-800 text-gray-400"
                      )}
                    >
                      <Icon className="w-5 h-5" strokeWidth={2} />
                    </div>

                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                          {item.label}
                        </p>
                        {getPriorityBadge(item.priority)}
                        {isActive && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 shadow-2xs">
                            {t("active_badge")}
                          </span>
                        )}
                      </div>

                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                        {item.description}
                      </p>

                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-400 font-mono">
                        <Zap className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        <span>{t("frequency_label")}:</span>
                        <span className="text-gray-700 dark:text-gray-300">
                          {item.frequency}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Switch
                    checked={isActive}
                    onCheckedChange={(val) => handleToggle(item.id, val)}
                    disabled={!editMode}
                    className={cn(!editMode ? "opacity-50 cursor-not-allowed" : "")}
                  />
                </motion.div>
              );
            })}
          </div>
        </PreferenceCard>
      </motion.div>

      {/* ── BANNER DE PRIVACIDAD ─────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl p-4 flex items-start gap-3 shadow-2xs"
      >
        <ShieldCheck
          className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5"
          strokeWidth={2}
        />
        <div className="space-y-0.5">
          <p className="text-xs font-bold text-gray-900 dark:text-white">
            {t("privacy_title")}
          </p>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
            {t("privacy_desc")}
          </p>
        </div>
      </motion.div>

      {/* ── BANNER MODO SOLO LECTURA ────────────────────────────────────── */}
      {!editMode && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl p-4 flex items-start gap-3 shadow-2xs"
        >
          <Info
            className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5"
            strokeWidth={2}
          />
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-amber-900 dark:text-amber-300">
              {t("readonly_title")}
            </p>
            <p className="text-xs font-medium text-amber-700 dark:text-amber-400/80 leading-relaxed">
              {t("readonly_desc")}
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};