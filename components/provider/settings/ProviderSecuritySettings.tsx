"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  Lock,
  Shield,
  Laptop,
  Activity,
  Bell,
  Smartphone,
  ChevronRight,
  UserX,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.25,
      ease: "easeOut",
    },
  },
};

export function ProviderSecuritySettings() {
  const t = useTranslations("SettingsSecurity");

  // Configuración de opciones de seguridad
  const securityOptions = useMemo(
    () => [
      {
        id: "2fa",
        title: t("options.2fa.title"),
        description: t("options.2fa.desc"),
        icon: Smartphone,
        link: "/provider/dashboard/settings/security/2fa",
        status: t("options.2fa.status"),
        iconBg: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30",
        hoverBorder: "hover:border-emerald-500/30",
        isDanger: false,
      },
      {
        id: "password",
        title: t("options.password.title"),
        description: t("options.password.desc"),
        icon: Lock,
        link: "/provider/dashboard/settings/security/password",
        iconBg: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30",
        hoverBorder: "hover:border-emerald-500/30",
        isDanger: false,
      },
      {
        id: "login-alerts",
        title: t("options.alerts.title"),
        description: t("options.alerts.desc"),
        icon: Bell,
        link: "/provider/dashboard/settings/security/alerts",
        iconBg: "bg-sky-50 dark:bg-sky-950/30 text-sky-600 dark:text-sky-400 border-sky-100 dark:border-sky-900/30",
        hoverBorder: "hover:border-sky-500/30",
        isDanger: false,
      },
      {
        id: "devices",
        title: t("options.devices.title"),
        description: t("options.devices.desc"),
        icon: Laptop,
        link: "/provider/dashboard/settings/security/devices",
        iconBg: "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/30",
        hoverBorder: "hover:border-indigo-500/30",
        isDanger: false,
      },
      {
        id: "activity",
        title: t("options.activity.title"),
        description: t("options.activity.desc"),
        icon: Activity,
        link: "/provider/dashboard/settings/security/activity",
        iconBg: "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30",
        hoverBorder: "hover:border-amber-500/30",
        isDanger: false,
      },
      {
        id: "delete-account",
        title: t("options.delete_account.title"),
        description: t("options.delete_account.desc"),
        icon: UserX,
        link: "/provider/dashboard/settings/security/delete-account",
        iconBg: "bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/30",
        hoverBorder: "hover:border-rose-500/30",
        isDanger: true,
      },
    ],
    [t]
  );

  return (
    <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-2xs font-sans transition-colors select-none space-y-8">
      {/* ── ENCABEZADO DE SECCIÓN ────────────────────────────────────── */}
      <div className="pb-6 border-b border-gray-100 dark:border-gray-800 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-2xs">
          <Shield className="w-6 h-6" strokeWidth={2} />
        </div>

        <div className="space-y-0.5">
          <h1 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight">
            {t("title")}
          </h1>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
            {t("subtitle")}
          </p>
        </div>
      </div>

      {/* ── PARRILLA DE OPCIONES DE SEGURIDAD ────────────────────────── */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
      >
        {securityOptions.map((option) => {
          const Icon = option.icon;

          return (
            <Link
              key={option.id}
              href={option.link}
              className="block group h-full"
            >
              <motion.div variants={itemVariants} className="h-full">
                <div
                  className={cn(
                    "h-full bg-gray-50/50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 transition-all duration-200 shadow-2xs flex flex-col justify-between space-y-4 cursor-pointer",
                    option.hoverBorder
                  )}
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-2xl border flex items-center justify-center shrink-0 shadow-2xs",
                          option.iconBg
                        )}
                      >
                        <Icon className="w-5 h-5" strokeWidth={2} />
                      </div>

                      {option.status && (
                        <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 rounded-full text-[10px] font-bold px-2.5 py-0.5 shadow-2xs">
                          {option.status}
                        </Badge>
                      )}
                    </div>

                    <h2
                      className={cn(
                        "text-xs sm:text-sm font-bold tracking-tight transition-colors",
                        option.isDanger
                          ? "text-rose-700 dark:text-rose-400 group-hover:text-rose-800 dark:group-hover:text-rose-300"
                          : "text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400"
                      )}
                    >
                      {option.title}
                    </h2>

                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-3">
                      {option.description}
                    </p>
                  </div>

                  <div className="flex items-center text-xs font-bold text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors pt-3 border-t border-gray-100 dark:border-gray-800/80">
                    <span>{t("configure")}</span>
                    <ChevronRight
                      className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1"
                      strokeWidth={2}
                    />
                  </div>
                </div>
              </motion.div>
            </Link>
          );
        })}
      </motion.div>
    </div>
  );
}