"use client";
/* eslint-disable react-doctor/button-has-type */

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  Plus,
  AlertCircle,
  TrendingUp,
  Sparkles,
  Tag,
  Info,
  Check,
  Server,
} from "lucide-react";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

// Subcomponentes
import { ServiceItemCard } from "./ServiceItemCard";
import { ServiceTemplates } from "./ServiceTemplates";

// Tipos
import { UI_Service, ServiceDeliveryType } from "@/types/catalog";

interface ServicesManagerProps {
  services: UI_Service[];
  onAdd: () => void;
  onUpdate: (id: number, updates: Partial<UI_Service>) => void;
  onDelete: (id: number) => void;
  onSave: (service: UI_Service) => void;
  onDuplicate?: (service: UI_Service) => void;
  onImageUpload?: (id: number, file: File) => void;
  canAdd?: boolean;
  currentUsage?: number;
  maxLimit?: number | null;
}

export function ServicesManager({
  services,
  onAdd,
  onUpdate,
  onDelete,
  onSave,
  onDuplicate,
  onImageUpload,
  canAdd = true,
  currentUsage,
  maxLimit,
}: ServicesManagerProps) {
  const t = useTranslations("Marketplace.services");
  const [showTemplates, setShowTemplates] = useState(false);

  const hasUnsavedChanges = services.some(
    (s) => s.isNew || s.hasUnsavedChanges,
  );

  // Manejador para aplicar una plantilla rápida
  const handleApplyTemplate = (template: {
    name: string;
    duration: number;
    price: number;
    type: ServiceDeliveryType;
  }) => {
    if (!canAdd) {
      toast.warning(
        t("limit_reached_msg", { defaultValue: "CAPACIDAD MÁXIMA ALCANZADA." }),
        { theme: "colored" },
      );
      return;
    }

    onAdd();
    setTimeout(() => {
      const newService = services[0];
      if (newService) {
        onUpdate(newService.id, {
          name: template.name,
          duration: template.duration,
          price: template.price,
          serviceDeliveryType: template.type,
          hasUnsavedChanges: true,
        });
      }
    }, 50);
    setShowTemplates(false);
    toast.success(
      t("template_applied", {
        name: template.name,
        defaultValue: `PLANTILLA ${template.name.toUpperCase()} APLICADA.`,
      }),
      { theme: "colored" },
    );
  };

  return (
    <div className="flex flex-col min-h-screen transition-colors duration-500 font-sans p-6 md:p-8">
      {/* --- CABECERA --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between p-6 md:p-8 border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] rounded-3xl shadow-sm gap-6 shrink-0 mb-6">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0">
            <Server
              className="w-6 h-6 text-emerald-600 dark:text-emerald-400"
              strokeWidth={2}
            />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
              {t("title", { defaultValue: "Gestor de Catálogo" })}
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white leading-none">
                Servicios y Productos
              </h2>

              <div className="flex items-center gap-2 mt-2 sm:mt-0">
                {services.length > 0 && (
                  <span className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full text-xs font-semibold text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-500" strokeWidth={2} />
                    {services.length}{" "}
                    {services.length === 1
                      ? t("service_single", { defaultValue: "Registro" })
                      : t("service_plural", { defaultValue: "Registros" })}
                  </span>
                )}

                {typeof currentUsage === "number" &&
                  typeof maxLimit === "number" && (
                    <span
                      className={cn(
                        "px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5",
                        canAdd
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                      )}
                    >
                      Consumo: {currentUsage} /{" "}
                      {maxLimit === null ? "∞" : maxLimit}
                    </span>
                  )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            disabled={!canAdd}
            className="flex-1 md:flex-none h-12 px-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#111] transition-colors text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
          >
            <Tag className="w-4 h-4 text-gray-500" strokeWidth={2} />
            <span className="hidden sm:inline">
              {t("templates", { defaultValue: "Plantillas" })}
            </span>
          </button>

          <button
            onClick={onAdd}
            disabled={!canAdd}
            className="flex-1 md:flex-none h-12 px-6 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-sm font-bold flex items-center justify-center gap-2 border-0 disabled:opacity-50 shadow-sm"
          >
            <Plus className="w-4 h-4" strokeWidth={2} />
            {!canAdd
              ? t("limit_reached_btn", { defaultValue: "Límite Agotado" })
              : t("new_service", { defaultValue: "Añadir Registro" })}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* --- PANEL DE PLANTILLAS --- */}
        <AnimatePresence>
          {showTemplates && canAdd && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="overflow-hidden"
            >
              <ServiceTemplates
                onApply={handleApplyTemplate}
                onClose={() => setShowTemplates(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- ALERTA DE LÍMITE --- */}
        <AnimatePresence>
          {!canAdd && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 rounded-2xl border border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-900/30 mb-6 flex flex-col">
                <p className="text-sm font-bold text-red-700 dark:text-red-400 flex items-center gap-2 mb-1">
                  <Info className="w-5 h-5" strokeWidth={2} />{" "}
                  {t("limit_alert_title", {
                    defaultValue: "Alerta de Capacidad Máxima",
                  })}
                </p>
                <p className="text-xs font-semibold text-red-600 dark:text-red-500 leading-relaxed ml-7">
                  {t("limit_alert_desc", {
                    defaultValue:
                      "Elimine o archive registros obsoletos para liberar espacio en la base de datos.",
                  })}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- ALERTA DE CAMBIOS SIN GUARDAR --- */}
        <AnimatePresence>
          {hasUnsavedChanges && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-900/30 mb-6 flex flex-col">
                <p className="text-sm font-bold text-amber-700 dark:text-amber-400 flex items-center gap-2 mb-1">
                  <AlertCircle className="w-5 h-5" strokeWidth={2} />{" "}
                  {t("unsaved_changes", {
                    defaultValue: "Modificaciones Pendientes",
                  })}
                </p>
                <p className="text-xs font-semibold text-amber-600 dark:text-amber-500 leading-relaxed ml-7">
                  {t("unsaved_desc", {
                    defaultValue:
                      "Existen registros en estado borrador. Confirme los datos antes de salir.",
                  })}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- LISTA DE SERVICIOS --- */}
        <div className="flex flex-col gap-6">
          <AnimatePresence mode="popLayout">
            {services.map((service, index) => (
              <ServiceItemCard
                key={service.id}
                service={service as any}
                index={index}
                onUpdate={onUpdate}
                onSave={onSave}
                onDelete={onDelete}
                onDuplicate={onDuplicate}
                onImageUpload={onImageUpload}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* --- ESTADO VACÍO (EMPTY STATE) --- */}
        {services.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-24 text-center rounded-3xl border border-gray-100 dark:border-gray-800 border-dashed bg-white dark:bg-[#0a0a0a] shadow-sm"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mb-6">
              <Server className="w-8 h-8 text-emerald-500" strokeWidth={2} />
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {t("empty_title", {
                defaultValue: "Catálogo de Servicios Vacío",
              })}
            </p>
            <p className="text-sm font-medium text-gray-500 mb-8 max-w-sm leading-relaxed">
              {t("empty_desc", {
                defaultValue:
                  "Inicie la configuración de los procedimientos clínicos y servicios.",
              })}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm px-6">
              <button
                onClick={() => setShowTemplates(true)}
                disabled={!canAdd}
                className="flex-1 h-12 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#111] transition-colors text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
              >
                <Tag className="w-4 h-4" strokeWidth={2} />{" "}
                {t("templates", { defaultValue: "Usar Plantillas" })}
              </button>
              <button
                onClick={onAdd}
                disabled={!canAdd}
                className="flex-1 h-12 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-sm font-bold flex items-center justify-center gap-2 border-0 disabled:opacity-50 shadow-sm"
              >
                <Plus className="w-4 h-4" strokeWidth={2} />
                {!canAdd
                  ? t("limit_reached_btn")
                  : t("create_first", { defaultValue: "Crear Registro" })}
              </button>
            </div>
          </motion.div>
        )}

        {/* --- CONSEJO FINAL (OPTIMIZACIÓN) --- */}
        {services.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-6 md:p-8 rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] mt-8 flex flex-col md:flex-row gap-8 shadow-sm"
          >
            <div className="md:w-1/3 flex flex-col gap-2 border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-800 pb-6 md:pb-0 pr-0 md:pr-8">
              <p className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <TrendingUp
                  className="w-5 h-5 text-emerald-500"
                  strokeWidth={2}
                />
                {t("tip_title", { defaultValue: "Optimización de Catálogo" })}
              </p>
              <p className="text-xs font-medium text-gray-500 leading-relaxed">
                Recomendaciones para mejorar la tasa de conversión en la
                plataforma.
              </p>
            </div>
            <ul className="md:w-2/3 flex flex-col gap-4 justify-center">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Check
                    className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400"
                    strokeWidth={2.5}
                  />
                </div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400 leading-relaxed">
                  Integre imágenes técnicas descriptivas para aumentar la
                  retención (+40%).
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Check
                    className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400"
                    strokeWidth={2.5}
                  />
                </div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400 leading-relaxed">
                  Ajuste los tiempos operativos para evitar solapamientos en la
                  agenda.
                </span>
              </li>
            </ul>
          </motion.div>
        )}
      </div>
    </div>
  );
}
