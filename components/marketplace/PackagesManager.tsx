"use client";
/* eslint-disable react-doctor/button-has-type */

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Plus, Tag, TrendingUp, Sparkles, Info } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";

import { cn } from "@/lib/utils";

// Subcomponentes
import { PackageItemCard } from "./PackageItemCard";
import { PackageEditorDialog } from "./PackageEditorDialog";

import { UI_Package, UI_Service } from "@/types/catalog";

interface PackagesManagerProps {
  packages: UI_Package[];
  availableServices: UI_Service[];
  onAdd?: () => void;
  onSave: (pkg: UI_Package) => Promise<boolean> | void | boolean;
  onDelete: (id: number) => void;
  onImageUpload?: (id: number, file: File) => void;
  canAdd?: boolean;
  currentUsage?: number;
  maxLimit?: number | null;
}

export function PackagesManager({
  packages,
  availableServices,
  onAdd,
  onSave,
  onDelete,
  onImageUpload,
  canAdd = true,
  currentUsage,
  maxLimit,
}: PackagesManagerProps) {
  const t = useTranslations("Marketplace.packages");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<UI_Package | null>(null);

  const handleOpenDialog = (pkg?: UI_Package) => {
    if (!pkg && !canAdd) {
      toast.warning(
        t("limit_reached_msg", {
          defaultValue: "ALERTA DE CAPACIDAD: LÍMITE DE INVENTARIO ALCANZADO.",
        }),
        { theme: "colored" },
      );
      return;
    }

    if (pkg) {
      setEditingPackage(pkg);
    } else {
      if (onAdd) onAdd();

      setEditingPackage({
        id: -Date.now(),
        name: "",
        description: "",
        category: "",
        price: 0,
        packageItems: [],
        isNew: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSaveWrapper = async (pkg: UI_Package) => {
    const success = await onSave(pkg);
    if (success !== false) {
      setIsDialogOpen(false);
    }
  };

  return (
   <div className="flex flex-col min-h-screen transition-colors duration-500 font-sans p-6 md:p-8">
 {/* --- CABECERA --- */}
 <div className="flex flex-col md:flex-row md:items-center justify-between p-6 md:p-8 border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] rounded-3xl shadow-sm gap-6 shrink-0 mb-6">
 <div className="flex items-center gap-5">
 <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0">
 <Package
 className="w-6 h-6 text-emerald-600 dark:text-emerald-400"
 strokeWidth={2}
 />
 </div>
 <div>
 <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
 {t("title", { defaultValue: "Gestor de Ensambles" })}
 </p>
 <div className="flex flex-col sm:flex-row sm:items-center gap-3">
 <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white leading-none">
 Paquetes Promocionales
 </h2>

 <div className="flex items-center gap-2 mt-2 sm:mt-0">
 {packages.length > 0 && (
 <span className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full text-xs font-semibold text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
 <Sparkles className="w-3.5 h-3.5 text-emerald-500" strokeWidth={2} />
 {packages.length} Registros Activos
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

 <button
 onClick={() => handleOpenDialog()}
 disabled={!canAdd}
 className="w-full md:w-auto h-12 px-6 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-sm font-bold flex items-center justify-center gap-2 border-0 disabled:opacity-50 shadow-sm"
 >
 <Plus className="w-4 h-4" strokeWidth={2} />
 {!canAdd
 ? t("limit_reached_btn", { defaultValue: "Límite Agotado" })
 : t("create_package", { defaultValue: "Nuevo Ensamble" })}
 </button>
 </div>

      <div className="space-y-6">
 {/* --- ALERTA DE LÍMITE (SISTEMA) --- */}
 <AnimatePresence>
 {!canAdd && packages.length > 0 && (
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

 {/* --- ESTADO VACÍO (EMPTY STATE) --- */}
 {packages.length === 0 ? (
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 className="flex flex-col items-center justify-center py-24 text-center rounded-3xl border border-gray-100 dark:border-gray-800 border-dashed bg-white dark:bg-[#0a0a0a] shadow-sm"
 >
 <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mb-6">
 <Tag className="w-8 h-8 text-emerald-500" strokeWidth={2} />
 </div>
 <p className="text-xl font-bold text-gray-900 dark:text-white mb-2">
 {t("empty_title", { defaultValue: "Cero Paquetes Activos" })}
 </p>
 <p className="text-sm font-medium text-gray-500 mb-8 max-w-xs leading-relaxed">
 {t("empty_desc", {
 defaultValue:
 "Estructure combinaciones de servicios para ofrecer condiciones comerciales en bloque.",
 })}
 </p>
 <button
 onClick={() => handleOpenDialog()}
 disabled={!canAdd}
 className="h-12 px-8 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-sm font-bold flex items-center justify-center gap-2 border-0 disabled:opacity-50 shadow-sm"
 >
 <Plus className="w-4 h-4" strokeWidth={2} />
 {!canAdd
 ? t("limit_reached_btn")
 : t("create_first", { defaultValue: "Iniciar Configuración" })}
 </button>
 </motion.div>
 ) : (
 /* --- GRID DE TARJETAS (MATRIZ) --- */
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 <AnimatePresence>
 {packages.map((pkg) => (
 <PackageItemCard
 key={pkg.id}
 pkg={pkg}
 availableServices={availableServices}
 onEdit={handleOpenDialog}
 onDelete={onDelete}
 />
 ))}
 </AnimatePresence>
 </div>
 )}

 {/* --- CONSEJO FINAL (OPTIMIZACIÓN COMERCIAL) --- */}
 {packages.length > 0 && (
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
 {t("tip_title", { defaultValue: "Estrategia Comercial" })}
 </p>
 </div>
 <div className="md:w-2/3 flex flex-col justify-center">
 <p className="text-sm font-medium text-gray-600 dark:text-gray-400 leading-relaxed">
 {t("tip_desc", {
 defaultValue:
 "Se sugiere establecer un precio de paquete inferior a la sumatoria de los servicios individuales para incentivar la adquisición en bloque.",
 })}
 </p>
 </div>
 </motion.div>
 )}

        {/* --- MODAL EDITOR --- */}
        <PackageEditorDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          initialData={editingPackage}
          availableServices={availableServices}
          onSave={handleSaveWrapper}
          onImageUpload={onImageUpload}
        />
      </div>
    </div>
  );
}
