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
    <div className="flex flex-col bg-gray-50 dark:bg-[#050505] min-h-screen transition-colors duration-500 font-sans">
      {/* --- CABECERA ARQUITECTÓNICA --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between p-6 md:p-8 border-b border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] gap-6 shrink-0">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] flex items-center justify-center shrink-0">
            <Server
              className="w-6 h-6 text-black dark:text-white"
              strokeWidth={1.5}
            />
          </div>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">
              {t("title", { defaultValue: "GESTOR DE CATÁLOGO" })}
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <h2 className="text-xl md:text-2xl font-semibold uppercase tracking-tight text-black dark:text-white leading-none">
                SERVICIOS Y PRODUCTOS
              </h2>

              <div className="flex items-center gap-2 mt-2 sm:mt-0">
                {services.length > 0 && (
                  <span className="border border-black/10 dark:border-white/10 bg-gray-50 dark:bg-[#050505] px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3" strokeWidth={1.5} />
                    {services.length}{" "}
                    {services.length === 1
                      ? t("service_single", { defaultValue: "REGISTRO" })
                      : t("service_plural", { defaultValue: "REGISTROS" })}
                  </span>
                )}

                {typeof currentUsage === "number" &&
                  typeof maxLimit === "number" && (
                    <span
                      className={cn(
                        "border px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest flex items-center gap-1.5",
                        canAdd
                          ? "border-black/20 dark:border-white/20 bg-black text-white dark:bg-white dark:text-black"
                          : "border-red-500/30 bg-red-50 text-red-700 dark:bg-red-900/10 dark:text-red-400",
                      )}
                    >
                      CONSUMO: {currentUsage} /{" "}
                      {maxLimit === null ? "∞" : maxLimit}
                    </span>
                  )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto border border-black/20 dark:border-white/20">
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            disabled={!canAdd}
            className="flex-1 md:flex-none h-12 px-6 border-r border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 rounded-none disabled:opacity-50"
          >
            <Tag className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span className="hidden sm:inline">
              {t("templates", { defaultValue: "PLANTILLAS BASE" })}
            </span>
          </button>

          <button
            onClick={onAdd}
            disabled={!canAdd}
            className="flex-1 md:flex-none h-12 px-6 bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 border-0 rounded-none disabled:opacity-50"
          >
            <Plus className="w-4 h-4" strokeWidth={1.5} />
            {!canAdd
              ? t("limit_reached_btn", { defaultValue: "LÍMITE AGOTADO" })
              : t("new_service", { defaultValue: "AÑADIR REGISTRO" })}
          </button>
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-6">
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
              <div className="p-4 border-l-4 border-l-red-500 border border-black/10 dark:border-white/10 bg-red-50 dark:bg-red-900/10 mb-6 flex flex-col">
                <p className="text-[10px] font-bold uppercase tracking-widest text-red-700 dark:text-red-400 flex items-center gap-2 mb-1">
                  <Info className="w-4 h-4" strokeWidth={1.5} />{" "}
                  {t("limit_alert_title", {
                    defaultValue: "ALERTA DE CAPACIDAD MÁXIMA",
                  })}
                </p>
                <p className="text-[9px] font-bold uppercase tracking-widest text-red-600 dark:text-red-500 leading-relaxed">
                  {t("limit_alert_desc", {
                    defaultValue:
                      "ELIMINE O ARCHIVE REGISTROS OBSOLETOS PARA LIBERAR ESPACIO EN LA BASE DE DATOS.",
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
              <div className="p-4 border-l-4 border-l-amber-500 border border-black/10 dark:border-white/10 bg-amber-50 dark:bg-amber-900/10 mb-6 flex flex-col">
                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400 flex items-center gap-2 mb-1">
                  <AlertCircle className="w-4 h-4" strokeWidth={1.5} />{" "}
                  {t("unsaved_changes", {
                    defaultValue: "MODIFICACIONES PENDIENTES",
                  })}
                </p>
                <p className="text-[9px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-500 leading-relaxed">
                  {t("unsaved_desc", {
                    defaultValue:
                      "EXISTEN REGISTROS EN ESTADO BORRADOR. CONFIRME LOS DATOS ANTES DE SALIR.",
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
            className="flex flex-col items-center justify-center py-24 text-center border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a]"
          >
            <div className="w-16 h-16 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] flex items-center justify-center mb-6">
              <Server className="w-6 h-6 text-gray-400" strokeWidth={1.5} />
            </div>
            <p className="text-sm font-semibold uppercase tracking-tight text-black dark:text-white mb-2">
              {t("empty_title", {
                defaultValue: "CATÁLOGO DE SERVICIOS VACÍO",
              })}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-8 max-w-sm leading-relaxed">
              {t("empty_desc", {
                defaultValue:
                  "INICIE LA CONFIGURACIÓN DE LOS PROCEDIMIENTOS CLÍNICOS Y SERVICIOS.",
              })}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm px-6">
              <button
                onClick={() => setShowTemplates(true)}
                disabled={!canAdd}
                className="flex-1 h-12 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 rounded-none disabled:opacity-50"
              >
                <Tag className="w-3.5 h-3.5" strokeWidth={1.5} />{" "}
                {t("templates", { defaultValue: "USAR PLANTILLAS" })}
              </button>
              <button
                onClick={onAdd}
                disabled={!canAdd}
                className="flex-1 h-12 bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 border-0 rounded-none disabled:opacity-50"
              >
                <Plus className="w-4 h-4" strokeWidth={1.5} />
                {!canAdd
                  ? t("limit_reached_btn")
                  : t("create_first", { defaultValue: "CREAR REGISTRO" })}
              </button>
            </div>
          </motion.div>
        )}

        {/* --- CONSEJO FINAL (OPTIMIZACIÓN) --- */}
        {services.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-6 border border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0a] mt-12 flex flex-col md:flex-row gap-6"
          >
            <div className="md:w-1/3 flex flex-col gap-2 border-b md:border-b-0 md:border-r border-black/10 dark:border-white/10 pb-4 md:pb-0 pr-0 md:pr-6">
              <p className="text-[9px] font-bold uppercase tracking-widest text-black dark:text-white flex items-center gap-2">
                <TrendingUp
                  className="w-4 h-4 text-gray-500"
                  strokeWidth={1.5}
                />
                {t("tip_title", { defaultValue: "OPTIMIZACIÓN DE CATÁLOGO" })}
              </p>
              <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 leading-relaxed">
                RECOMENDACIONES PARA MEJORAR LA TASA DE CONVERSIÓN EN
                PLATAFORMA.
              </p>
            </div>
            <ul className="md:w-2/3 flex flex-col gap-3 justify-center">
              <li className="flex items-start gap-3">
                <Check
                  className="w-3.5 h-3.5 shrink-0 text-black dark:text-white mt-0.5"
                  strokeWidth={2}
                />
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600 dark:text-gray-400 leading-relaxed">
                  INTEGRE IMÁGENES TÉCNICAS DESCRIPTIVAS PARA AUMENTAR LA
                  RETENCIÓN (+40%).
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Check
                  className="w-3.5 h-3.5 shrink-0 text-black dark:text-white mt-0.5"
                  strokeWidth={2}
                />
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600 dark:text-gray-400 leading-relaxed">
                  AJUSTE LOS TIEMPOS OPERATIVOS PARA EVITAR SOLAPAMIENTOS EN LA
                  AGENDA.
                </span>
              </li>
            </ul>
          </motion.div>
        )}
      </div>
    </div>
  );
}
