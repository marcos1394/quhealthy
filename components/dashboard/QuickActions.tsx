"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Users, Calendar, Settings, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

export const QuickActions = () => {
  const router = useRouter();
  const t = useTranslations("DashboardQuickActions");
  const [isOpen, setIsOpen] = useState(false);

  // Mapeo de comandos rápidos con i18n
  const actions = [
    {
      icon: Calendar,
      label: t("schedule_appointment"),
      href: "/provider/dashboard/appointments?action=new",
    },
    {
      icon: Users,
      label: t("new_patient"),
      href: "/provider/dashboard/patients?action=new",
    },
    {
      icon: FileText,
      label: t("upload_document"),
      href: "/provider/dashboard/documents?action=upload",
    },
    {
      icon: Settings,
      label: t("settings"),
      href: "/provider/store",
    },
  ];

  return (
    <div className="fixed bottom-20 sm:bottom-24 lg:bottom-28 right-5 sm:right-8 lg:right-10 z-50 flex flex-col items-end font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="mb-3 w-64 sm:w-72 bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 flex flex-col rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Lista de Acciones Rápidas */}
            <div className="flex flex-col bg-white dark:bg-[#0a0a0a] p-1.5 space-y-1">
              {actions.map((action, idx) => {
                const Icon = action.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      router.push(action.href);
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-[#050505] transition-all group text-left bg-white dark:bg-[#0a0a0a] cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-xl bg-gray-50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 flex items-center justify-center shrink-0 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/30 group-hover:border-emerald-200 dark:group-hover:border-emerald-900/40 text-gray-600 dark:text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors shadow-2xs">
                      <Icon className="w-4 h-4" strokeWidth={2} />
                    </div>
                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white truncate">
                      {action.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botón Disparador Flotante (FAB) */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-13 h-13 sm:w-14 sm:h-14 flex items-center justify-center transition-all duration-200 rounded-full shadow-md cursor-pointer border-0",
          isOpen
            ? "bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 shadow-xl"
            : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 hover:scale-105"
        )}
        aria-label="Acciones rápidas"
      >
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.18, ease: "easeInOut" }}
        >
          <Plus className="w-6 h-6" strokeWidth={2} />
        </motion.div>
      </button>
    </div>
  );
};