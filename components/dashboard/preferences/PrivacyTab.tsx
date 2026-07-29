"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Lock,
  Eye,
  EyeOff,
  Clock,
  Users,
  UserCheck,
  Globe,
  Info,
  Check,
  Sparkles,
  Zap,
  ShieldCheck,
} from "lucide-react";

import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { PreferenceCard } from "./PreferenceCard";

interface PrivacyTabProps {
  preferences: any;
  setPreferences: React.Dispatch<React.SetStateAction<any>>;
  editMode: boolean;
}

export const PrivacyTab: React.FC<PrivacyTabProps> = ({
  preferences,
  setPreferences,
  editMode,
}) => {
  const t = useTranslations("DashboardSettings.privacy");
  const [recentlyChanged, setRecentlyChanged] = useState<string | null>(null);

  const updatePrivacy = (key: string, value: any) => {
    setPreferences((prev: any) => ({
      ...prev,
      privacy: { ...prev.privacy, [key]: value },
    }));

    setRecentlyChanged(key);
    setTimeout(() => setRecentlyChanged(null), 2000);
  };

  const getPrivacyLevel = () => {
    const settings = preferences.privacy;
    let score = 0;

    if (!settings.showOnlineStatus) score++;
    if (!settings.showLastSeen) score++;
    if (settings.showProfile === "none" || settings.showProfile === "contacts")
      score++;
    if (
      settings.allowMessages === "contacts" ||
      settings.allowMessages === "none"
    )
      score++;

    if (score >= 3)
      return {
        level: "high",
        label: t("level_high"),
        desc: t("level_high_desc"),
        colorClass:
          "bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-400",
        iconBg: "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400",
      };
    if (score >= 2)
      return {
        level: "medium",
        label: t("level_medium"),
        desc: t("level_medium_desc"),
        colorClass:
          "bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40 text-amber-700 dark:text-amber-400",
        iconBg: "bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400",
      };
    return {
      level: "low",
      label: t("level_low"),
      desc: t("level_low_desc"),
      colorClass:
        "bg-red-50/60 dark:bg-red-950/20 border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-400",
      iconBg: "bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400",
    };
  };

  const privacyLevel = getPrivacyLevel();

  const getPrivacyIconConfig = (level: string) => {
    switch (level) {
      case "all":
        return {
          icon: Globe,
          color: "text-blue-500",
          label: t("profile_all"),
        };
      case "contacts":
        return {
          icon: UserCheck,
          color: "text-emerald-600 dark:text-emerald-400",
          label: t("profile_contacts"),
        };
      case "none":
        return {
          icon: Lock,
          color: "text-red-500",
          label: t("profile_none"),
        };
      default:
        return {
          icon: Globe,
          color: "text-gray-400",
          label: t("profile_all"),
        };
    }
  };

  return (
    <div className="space-y-6 font-sans transition-colors">
      {/* ── RESUMEN DE NIVEL DE PRIVACIDAD ────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "border rounded-3xl p-5 transition-all duration-300 shadow-2xs",
          privacyLevel.colorClass
        )}
      >
        <div className="flex items-start gap-4">
          <div className={cn("p-2.5 rounded-2xl shrink-0 shadow-2xs", privacyLevel.iconBg)}>
            <Shield className="w-5 h-5" strokeWidth={2} />
          </div>
          <div className="space-y-0.5 flex-1 min-w-0">
            <p className="text-xs font-bold text-gray-900 dark:text-white">
              {t("level_title")}: {privacyLevel.label}
            </p>
            <p className="text-xs font-medium leading-relaxed opacity-90">
              {privacyLevel.desc}
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── SECCIÓN 1: VISIBILIDAD DE ACTIVIDAD ───────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <PreferenceCard
          icon={Eye}
          title={t("visibility_title")}
          description={t("visibility_desc")}
        >
          <div className="space-y-3 pt-1">
            {/* Estado en Línea */}
            <div
              className={cn(
                "relative p-4 rounded-2xl border transition-all duration-200 shadow-2xs select-none",
                preferences.privacy.showOnlineStatus
                  ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40"
                  : "bg-gray-50/60 dark:bg-[#050505] border-gray-100 dark:border-gray-800",
                recentlyChanged === "showOnlineStatus"
                  ? "ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-[#0a0a0a]"
                  : ""
              )}
            >
              {preferences.privacy.showOnlineStatus && (
                <div className="absolute top-2.5 right-2.5 bg-emerald-600 text-white rounded-full p-0.5 shadow-2xs">
                  <Check className="w-3 h-3" strokeWidth={2.5} />
                </div>
              )}

              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5 flex-1 min-w-0 pr-2">
                  <div
                    className={cn(
                      "p-2.5 rounded-xl border shrink-0 shadow-2xs",
                      preferences.privacy.showOnlineStatus
                        ? "bg-white dark:bg-[#0a0a0a] border-emerald-200 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400"
                        : "bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-gray-800 text-gray-400"
                    )}
                  >
                    <Eye className="w-5 h-5" strokeWidth={2} />
                  </div>

                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                        {t("online_status_title")}
                      </p>
                      <span
                        className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border shadow-2xs",
                          preferences.privacy.showOnlineStatus
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/40"
                            : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700"
                        )}
                      >
                        {preferences.privacy.showOnlineStatus
                          ? t("online_status_visible")
                          : t("online_status_hidden")}
                      </span>
                    </div>

                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                      {t("online_status_desc")}
                    </p>

                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-400 pt-0.5">
                      <Info className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>
                        {preferences.privacy.showOnlineStatus
                          ? t("online_status_active_info")
                          : t("online_status_inactive_info")}
                      </span>
                    </div>
                  </div>
                </div>

                <Switch
                  checked={preferences.privacy.showOnlineStatus}
                  onCheckedChange={(val) => updatePrivacy("showOnlineStatus", val)}
                  disabled={!editMode}
                  className={cn(!editMode ? "opacity-50 cursor-not-allowed" : "")}
                />
              </div>
            </div>

            {/* Última Conexión */}
            <div
              className={cn(
                "relative p-4 rounded-2xl border transition-all duration-200 shadow-2xs select-none",
                preferences.privacy.showLastSeen
                  ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40"
                  : "bg-gray-50/60 dark:bg-[#050505] border-gray-100 dark:border-gray-800",
                recentlyChanged === "showLastSeen"
                  ? "ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-[#0a0a0a]"
                  : ""
              )}
            >
              {preferences.privacy.showLastSeen && (
                <div className="absolute top-2.5 right-2.5 bg-emerald-600 text-white rounded-full p-0.5 shadow-2xs">
                  <Check className="w-3 h-3" strokeWidth={2.5} />
                </div>
              )}

              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5 flex-1 min-w-0 pr-2">
                  <div
                    className={cn(
                      "p-2.5 rounded-xl border shrink-0 shadow-2xs",
                      preferences.privacy.showLastSeen
                        ? "bg-white dark:bg-[#0a0a0a] border-emerald-200 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400"
                        : "bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-gray-800 text-gray-400"
                    )}
                  >
                    <Clock className="w-5 h-5" strokeWidth={2} />
                  </div>

                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                        {t("last_seen_title")}
                      </p>
                      <span
                        className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border shadow-2xs",
                          preferences.privacy.showLastSeen
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/40"
                            : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700"
                        )}
                      >
                        {preferences.privacy.showLastSeen
                          ? t("online_status_visible")
                          : t("online_status_hidden")}
                      </span>
                    </div>

                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                      {t("last_seen_desc")}
                    </p>

                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-400 pt-0.5">
                      <Info className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>
                        {preferences.privacy.showLastSeen
                          ? t("last_seen_active_info")
                          : t("last_seen_inactive_info")}
                      </span>
                    </div>
                  </div>
                </div>

                <Switch
                  checked={preferences.privacy.showLastSeen}
                  onCheckedChange={(val) => updatePrivacy("showLastSeen", val)}
                  disabled={!editMode}
                  className={cn(!editMode ? "opacity-50 cursor-not-allowed" : "")}
                />
              </div>
            </div>
          </div>
        </PreferenceCard>
      </motion.div>

      {/* ── SECCIÓN 2: PERMISOS DE CONTACTO Y PERFIL ──────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <PreferenceCard
          icon={Users}
          title={t("permissions_title")}
          description={t("permissions_desc")}
        >
          <div className="space-y-5 pt-1">
            {/* Visibilidad del Perfil */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200">
                  {t("profile_visibility_question")}
                </h4>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 shadow-2xs">
                  {getPrivacyIconConfig(preferences.privacy.showProfile).label}
                </span>
              </div>

              <Select
                value={preferences.privacy.showProfile}
                onValueChange={(val) => updatePrivacy("showProfile", val)}
                disabled={!editMode}
              >
                <SelectTrigger
                  className={cn(
                    "bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white h-11 rounded-xl text-xs font-semibold focus:ring-emerald-500/20 shadow-2xs transition-all",
                    !editMode ? "opacity-50 cursor-not-allowed" : "hover:border-emerald-500/40"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    {React.createElement(
                      getPrivacyIconConfig(preferences.privacy.showProfile).icon,
                      {
                        className: `w-4 h-4 ${
                          getPrivacyIconConfig(preferences.privacy.showProfile).color
                        }`,
                        strokeWidth: 2,
                      }
                    )}
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 text-gray-900 dark:text-white rounded-2xl shadow-xl font-sans">
                  <SelectItem value="all" className="text-xs font-semibold cursor-pointer">
                    <div className="flex items-center gap-3 py-1">
                      <Globe className="w-4 h-4 text-blue-500" strokeWidth={2} />
                      <div className="flex flex-col text-left">
                        <span className="font-bold">{t("profile_all")}</span>
                        <span className="text-[11px] font-medium text-gray-400">
                          {t("profile_all_desc")}
                        </span>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="contacts" className="text-xs font-semibold cursor-pointer">
                    <div className="flex items-center gap-3 py-1">
                      <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                      <div className="flex flex-col text-left">
                        <span className="font-bold">{t("profile_contacts")}</span>
                        <span className="text-[11px] font-medium text-gray-400">
                          {t("profile_contacts_desc")}
                        </span>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="none" className="text-xs font-semibold cursor-pointer">
                    <div className="flex items-center gap-3 py-1">
                      <Lock className="w-4 h-4 text-red-500" strokeWidth={2} />
                      <div className="flex flex-col text-left">
                        <span className="font-bold">{t("profile_none")}</span>
                        <span className="text-[11px] font-medium text-gray-400">
                          {t("profile_none_desc")}
                        </span>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              <div className="bg-gray-50/60 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-2xl p-3.5 text-xs font-medium shadow-2xs">
                <div className="flex items-start gap-2.5">
                  <Sparkles
                    className={cn(
                      "w-4 h-4 shrink-0 mt-0.5",
                      getPrivacyIconConfig(preferences.privacy.showProfile).color
                    )}
                    strokeWidth={2}
                  />
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {preferences.privacy.showProfile === "all" && t("profile_all_impact")}
                    {preferences.privacy.showProfile === "contacts" && t("profile_contacts_impact")}
                    {preferences.privacy.showProfile === "none" && t("profile_none_impact")}
                  </p>
                </div>
              </div>
            </div>

            {/* Permiso de Mensajes */}
            <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200">
                  {t("messages_question")}
                </h4>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 shadow-2xs">
                  {getPrivacyIconConfig(preferences.privacy.allowMessages).label}
                </span>
              </div>

              <Select
                value={preferences.privacy.allowMessages}
                onValueChange={(val) => updatePrivacy("allowMessages", val)}
                disabled={!editMode}
              >
                <SelectTrigger
                  className={cn(
                    "bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white h-11 rounded-xl text-xs font-semibold focus:ring-emerald-500/20 shadow-2xs transition-all",
                    !editMode ? "opacity-50 cursor-not-allowed" : "hover:border-emerald-500/40"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    {React.createElement(
                      getPrivacyIconConfig(preferences.privacy.allowMessages).icon,
                      {
                        className: `w-4 h-4 ${
                          getPrivacyIconConfig(preferences.privacy.allowMessages).color
                        }`,
                        strokeWidth: 2,
                      }
                    )}
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 text-gray-900 dark:text-white rounded-2xl shadow-xl font-sans">
                  <SelectItem value="all" className="text-xs font-semibold cursor-pointer">
                    <div className="flex items-center gap-3 py-1">
                      <Globe className="w-4 h-4 text-blue-500" strokeWidth={2} />
                      <div className="flex flex-col text-left">
                        <span className="font-bold">{t("messages_all")}</span>
                        <span className="text-[11px] font-medium text-gray-400">
                          {t("messages_all_desc")}
                        </span>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="contacts" className="text-xs font-semibold cursor-pointer">
                    <div className="flex items-center gap-3 py-1">
                      <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                      <div className="flex flex-col text-left">
                        <span className="font-bold">{t("messages_contacts")}</span>
                        <span className="text-[11px] font-medium text-gray-400">
                          {t("messages_contacts_desc")}
                        </span>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="none" className="text-xs font-semibold cursor-pointer">
                    <div className="flex items-center gap-3 py-1">
                      <EyeOff className="w-4 h-4 text-red-500" strokeWidth={2} />
                      <div className="flex flex-col text-left">
                        <span className="font-bold">{t("messages_none")}</span>
                        <span className="text-[11px] font-medium text-gray-400">
                          {t("messages_none_desc")}
                        </span>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              <div className="bg-gray-50/60 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-2xl p-3.5 text-xs font-medium shadow-2xs">
                <div className="flex items-start gap-2.5">
                  <Zap
                    className={cn(
                      "w-4 h-4 shrink-0 mt-0.5",
                      getPrivacyIconConfig(preferences.privacy.allowMessages).color
                    )}
                    strokeWidth={2}
                  />
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {preferences.privacy.allowMessages === "all" && t("messages_all_impact")}
                    {preferences.privacy.allowMessages === "contacts" && t("messages_contacts_impact")}
                    {preferences.privacy.allowMessages === "none" && t("messages_none_impact")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </PreferenceCard>
      </motion.div>

      {/* ── BANNER DE SEGURIDAD GENERAL ────────────────────────────────── */}
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
            {t("security_title")}
          </p>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
            {t("security_desc")}
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