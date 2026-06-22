"use client"
/* eslint-disable react-doctor/button-has-type */;

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
  onSave: (pkg: UI_Package) => void;
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
  maxLimit
}: PackagesManagerProps) {
  const t = useTranslations('Marketplace.packages');
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<UI_Package | null>(null);

  const handleOpenDialog = (pkg?: UI_Package) => {
    if (!pkg && !canAdd) {
      toast.warning(t('limit_reached_msg', { defaultValue: 'ALERTA DE CAPACIDAD: LÍMITE DE INVENTARIO ALCANZADO.' }), { theme: "colored" });
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
        serviceIds: [],
        isNew: true
      });
    }
    setIsDialogOpen(true);
  };

  const handleSaveWrapper = (pkg: UI_Package) => {
    onSave(pkg);
    setIsDialogOpen(false);
  };

  return (
    <div className="flex flex-col bg-gray-50 dark:bg-[#050505] min-h-screen transition-colors duration-500 font-sans">
      
      {/* --- CABECERA ARQUITECTÓNICA --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between p-6 md:p-8 border-b border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] gap-6 shrink-0">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] flex items-center justify-center shrink-0">
            <Package className="w-6 h-6 text-black dark:text-white" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">
              {t('title', { defaultValue: 'GESTOR DE ENSAMBLES' })}
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <h2 className="text-xl md:text-2xl font-semibold uppercase tracking-tight text-black dark:text-white leading-none">
                PAQUETES PROMOCIONALES
              </h2>
              
              <div className="flex items-center gap-2 mt-2 sm:mt-0">
                {packages.length > 0 && (
                  <span className="border border-black/10 dark:border-white/10 bg-gray-50 dark:bg-[#050505] px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3" strokeWidth={1.5} />
                    {packages.length} REGISTROS ACTIVOS
                  </span>
                )}

                {typeof currentUsage === 'number' && typeof maxLimit === 'number' && (
                  <span className={cn(
                    "border px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest flex items-center gap-1.5",
                    canAdd 
                      ? "border-black/20 dark:border-white/20 bg-black text-white dark:bg-white dark:text-black" 
                      : "border-red-500/30 bg-red-50 text-red-700 dark:bg-red-900/10 dark:text-red-400"
                  )}>
                    CONSUMO: {currentUsage} / {maxLimit === null ? '∞' : maxLimit}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <button 
          onClick={() => handleOpenDialog()} 
          disabled={!canAdd}
          className="w-full md:w-auto h-12 px-6 bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 border-0 rounded-none disabled:opacity-50"
        >
          <Plus className="w-4 h-4" strokeWidth={1.5} /> 
          {!canAdd ? t('limit_reached_btn', { defaultValue: 'LÍMITE AGOTADO' }) : t('create_package', { defaultValue: 'NUEVO ENSAMBLE' })}
        </button>
      </div>
      
      <div className="p-6 md:p-8 space-y-6">
        
        {/* --- ALERTA DE LÍMITE (SISTEMA) --- */}
        <AnimatePresence>
          {!canAdd && packages.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 border-l-4 border-l-red-500 border border-black/10 dark:border-white/10 bg-red-50 dark:bg-red-900/10 mb-6 flex flex-col">
                <p className="text-[10px] font-bold uppercase tracking-widest text-red-700 dark:text-red-400 flex items-center gap-2 mb-1">
                  <Info className="w-4 h-4" strokeWidth={1.5} /> {t('limit_alert_title', { defaultValue: 'ALERTA DE CAPACIDAD MÁXIMA' })}
                </p>
                <p className="text-[9px] font-bold uppercase tracking-widest text-red-600 dark:text-red-500 leading-relaxed">
                  {t('limit_alert_desc', { defaultValue: 'ELIMINE O ARCHIVE REGISTROS OBSOLETOS PARA LIBERAR ESPACIO EN LA BASE DE DATOS.' })}
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
            className="flex flex-col items-center justify-center py-24 text-center border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a]"
          >
            <div className="w-16 h-16 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] flex items-center justify-center mb-6">
              <Tag className="w-6 h-6 text-gray-400" strokeWidth={1.5} />
            </div>
            <p className="text-sm font-semibold uppercase tracking-tight text-black dark:text-white mb-2">
              {t('empty_title', { defaultValue: 'CERO PAQUETES ACTIVOS' })}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-8 max-w-xs leading-relaxed">
              {t('empty_desc', { defaultValue: 'ESTRUCTURE COMBINACIONES DE SERVICIOS PARA OFRECER CONDICIONES COMERCIALES EN BLOQUE.' })}
            </p>
            <button 
              onClick={() => handleOpenDialog()}
              disabled={!canAdd}
              className="h-12 px-8 bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 border-0 rounded-none disabled:opacity-50"
            >
              <Plus className="w-4 h-4" strokeWidth={1.5} />
              {!canAdd ? t('limit_reached_btn') : t('create_first', { defaultValue: 'INICIAR CONFIGURACIÓN' })}
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
            className="p-6 border border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0a] mt-12 flex flex-col md:flex-row gap-6"
          >
            <div className="md:w-1/3 flex flex-col gap-2 border-b md:border-b-0 md:border-r border-black/10 dark:border-white/10 pb-4 md:pb-0 pr-0 md:pr-6">
              <p className="text-[9px] font-bold uppercase tracking-widest text-black dark:text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-gray-500" strokeWidth={1.5} /> 
                {t('tip_title', { defaultValue: 'ESTRATEGIA COMERCIAL' })}
              </p>
            </div>
            <div className="md:w-2/3 flex flex-col justify-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 dark:text-gray-400 leading-relaxed">
                {t('tip_desc', { defaultValue: 'SE SUGIERE ESTABLECER UN PRECIO DE PAQUETE INFERIOR A LA SUMATORIA DE LOS SERVICIOS INDIVIDUALES PARA INCENTIVAR LA ADQUISICIÓN EN BLOQUE.' })}
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