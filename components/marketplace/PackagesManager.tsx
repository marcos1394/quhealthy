"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Plus, Tag, TrendingUp, Sparkles, Info } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
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
  maxLimit?: number;
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
      toast.warning(t('limit_reached_msg', { defaultValue: 'Capacidad de inventario alcanzada.' }));
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
    <div className="flex flex-col bg-white dark:bg-[#0a0a0a]">
      
      {/* --- CABECERA (HEADER) --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 dark:border-gray-800 p-6 md:p-8 bg-gray-50 dark:bg-[#050505] gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 border border-black dark:border-white flex items-center justify-center bg-white dark:bg-black shrink-0">
            <Package className="w-5 h-5 text-black dark:text-white" strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-black dark:text-white mb-2">
              {t('title', { defaultValue: 'Gestor de Paquetes' })}
            </h2>
            <div className="flex flex-wrap items-center gap-3">
              {packages.length > 0 && (
                <span className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-black px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" strokeWidth={2} />
                  {packages.length} Registros Activos
                </span>
              )}

              {typeof currentUsage === 'number' && typeof maxLimit === 'number' && (
                <span className={cn(
                  "border px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1",
                  canAdd 
                    ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black" 
                    : "border-red-500 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                )}>
                  Consumo: {currentUsage} / {maxLimit}
                </span>
              )}
            </div>
          </div>
        </div>

        <Button 
          onClick={() => handleOpenDialog()} 
          disabled={!canAdd}
          className="w-full sm:w-auto rounded-none bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 text-[10px] font-bold uppercase tracking-widest transition-colors h-10 px-6 disabled:opacity-50 disabled:cursor-not-allowed border-0"
        >
          <Plus className="w-4 h-4 mr-2" strokeWidth={2} /> 
          {!canAdd ? t('limit_reached_btn', { defaultValue: 'Límite Agotado' }) : t('create_package', { defaultValue: 'Nuevo Paquete' })}
        </Button>
      </div>
      
      <div className="p-6 md:p-8 space-y-8 bg-gray-50/50 dark:bg-[#050505]/50">
        
        {/* --- ALERTA DE LÍMITE (Margin Note) --- */}
        <AnimatePresence>
          {!canAdd && packages.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="border-l-2 border-red-500 pl-4 py-2 bg-red-50 dark:bg-red-900/10 mb-8">
                <p className="text-[10px] font-bold uppercase tracking-widest text-red-600 dark:text-red-400 flex items-center gap-2 mb-1">
                  <Info className="w-3.5 h-3.5" /> {t('limit_alert_title', { defaultValue: 'Capacidad Máxima Alcanzada' })}
                </p>
                <p className="text-xs text-red-700 dark:text-red-300 font-light">
                  {t('limit_alert_desc', { defaultValue: 'Archiva o elimina registros para liberar espacio en el catálogo.' })}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- ESTADO VACÍO (Blueprint Empty State) --- */}
        {packages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 border border-dashed border-gray-400 dark:border-gray-600 bg-white dark:bg-[#0a0a0a]"
          >
            <div className="w-16 h-16 border border-gray-300 dark:border-gray-700 flex items-center justify-center bg-gray-50 dark:bg-[#050505] mb-6">
              <Tag className="w-6 h-6 text-gray-400" strokeWidth={1.5} />
            </div>
            <p className="text-sm font-bold uppercase tracking-widest text-black dark:text-white mb-2">
              {t('empty_title', { defaultValue: 'Sin Paquetes Activos' })}
            </p>
            <p className="text-xs text-gray-500 font-light mb-8 max-w-sm text-center leading-relaxed">
              {t('empty_desc', { defaultValue: 'Crea combinaciones de servicios para ofrecer descuentos y promociones en bloque.' })}
            </p>
            <Button 
              onClick={() => handleOpenDialog()}
              disabled={!canAdd}
              className="rounded-none bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 text-[10px] font-bold uppercase tracking-widest transition-colors h-12 px-8 disabled:opacity-50 border-0"
            >
              <Plus className="w-4 h-4 mr-2" strokeWidth={2} />
              {!canAdd ? t('limit_reached_btn') : t('create_first', { defaultValue: 'Crear Registro Inicial' })}
            </Button>
          </motion.div>
        ) : (
          /* --- GRID DE TARJETAS --- */
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

        {/* --- CONSEJO FINAL (TIPS) - (Margin Note) --- */}
        {packages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-l-2 border-black dark:border-white pl-6 py-4 bg-gray-50 dark:bg-[#050505] mt-12"
          >
            <p className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4" strokeWidth={1.5} /> {t('tip_title', { defaultValue: 'Estrategia de Ventas' })}
            </p>
            <p className="text-xs text-gray-500 font-light leading-relaxed">
              {t('tip_desc', { defaultValue: 'Asegúrate de que el precio del paquete sea significativamente menor a la suma de los servicios individuales para incentivar la transacción en bloque.' })}
            </p>
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