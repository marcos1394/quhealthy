"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Plus, Tag, TrendingUp, Sparkles, Info } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Subcomponentes refactorizados
import { PackageItemCard } from "./PackageItemCard";
import { PackageEditorDialog } from "./PackageEditorDialog";

import { UI_Package, UI_Service } from "@/types/catalog";

interface PackagesManagerProps {
  packages: UI_Package[];
  availableServices: UI_Service[];
  onAdd?: () => void; // Recibimos onAdd para estandarización, aunque se use el dialog interno
  onSave: (pkg: UI_Package) => void;
  onDelete: (id: number) => void;
  onImageUpload?: (id: number, file: File) => void;
  // 🚀 Nuevas props de negocio para límites de plan
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
  canAdd = true, // Default a true por seguridad
  currentUsage,
  maxLimit
}: PackagesManagerProps) {
  const t = useTranslations('Marketplace.packages');
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<UI_Package | null>(null);

  const handleOpenDialog = (pkg?: UI_Package) => {
    // 🛡️ Validación de Negocio: Si está creando uno nuevo y no tiene límite, bloqueamos
    if (!pkg && !canAdd) {
      toast.warning(t('limit_reached_msg', { defaultValue: 'Has alcanzado el límite de tu plan.' }));
      return;
    }

    if (pkg) {
      setEditingPackage(pkg);
    } else {
      // Si onAdd está definido (opcional), lo llamamos para sincronización en el padre
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
    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xl rounded-3xl overflow-hidden">
      
      {/* --- CABECERA (HEADER) --- */}
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-6 bg-white dark:bg-slate-900 gap-4">
        <div className="space-y-3">
          <CardTitle className="flex items-center gap-4 text-slate-900 dark:text-white text-2xl">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="p-3 bg-medical-100 dark:bg-medical-500/20 rounded-2xl border border-medical-200 dark:border-medical-500/30"
            >
              <Package className="w-7 h-7 text-medical-600 dark:text-medical-400" />
            </motion.div>
            {t('title', { defaultValue: 'Paquetes Especiales' })}
          </CardTitle>
          <CardDescription className="text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-3 text-base">
            {t('description', { defaultValue: 'Agrupa servicios y ofrece promociones.' })}
            
            {/* Badge Promocional */}
            <Badge className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20 shadow-sm font-medium">
              <TrendingUp className="w-3 h-3 mr-1" />
              {t('conversion_badge', { defaultValue: '+30% ventas' })}
            </Badge>

            {/* 🚀 Indicador de Límite de Plan (Contrato de Consumo) */}
            {typeof currentUsage === 'number' && typeof maxLimit === 'number' && (
              <Badge variant="outline" className={cn(
                "font-medium shadow-sm",
                canAdd 
                  ? "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20" 
                  : "bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20"
              )}>
                {currentUsage} / {maxLimit} {t('usage_limit', { defaultValue: 'usados' })}
              </Badge>
            )}
          </CardDescription>
        </div>

        {/* 🚀 Botón protegido por regla de negocio */}
        <Button 
          onClick={() => handleOpenDialog()} 
          disabled={!canAdd}
          className={cn(
            "shadow-md transition-all rounded-xl h-11 font-bold",
            canAdd 
              ? "bg-medical-600 hover:bg-medical-700 text-white hover:shadow-lg" 
              : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 cursor-not-allowed border border-slate-200 dark:border-slate-700"
          )}
        >
          <Plus className="w-4 h-4 mr-2" /> 
          {!canAdd ? t('limit_reached_btn', { defaultValue: 'Límite Lleno' }) : t('create_package', { defaultValue: 'Crear Paquete' })}
        </Button>
      </CardHeader>
      
      <CardContent className="space-y-8 pt-8 p-6 md:p-8 bg-slate-50/30 dark:bg-slate-900/50">
        
        {/* --- ALERTA DE LÍMITE (Feedback UX) --- */}
        <AnimatePresence>
          {!canAdd && packages.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-3xl p-5 flex items-center gap-4 shadow-sm"
            >
              <div className="p-2 bg-red-100 dark:bg-red-500/20 rounded-xl">
                <Info className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-red-800 dark:text-red-300 font-bold mb-1">
                  {t('limit_alert_title', { defaultValue: 'Has llenado tu capacidad' })}
                </p>
                <p className="text-xs text-red-700 dark:text-red-300/80">
                  {t('limit_alert_desc', { defaultValue: 'Archiva o elimina paquetes antiguos para liberar espacio, o actualiza tu plan.' })}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- ESTADO VACÍO --- */}
        {packages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900/30"
          >
            <div className="p-6 bg-medical-50 dark:bg-medical-500/10 rounded-3xl mb-6 border border-medical-100 dark:border-medical-500/20 shadow-sm">
              <Tag className="w-12 h-12 text-medical-500 dark:text-medical-400" />
            </div>
            <p className="text-xl font-black text-slate-900 dark:text-white mb-2">{t('empty_title', { defaultValue: 'No tienes paquetes' })}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 max-w-md text-center">
              {t('empty_desc', { defaultValue: 'Crea combinaciones de servicios para ofrecer descuentos.' })}
            </p>
            <Button 
              onClick={() => handleOpenDialog()}
              disabled={!canAdd}
              className="bg-medical-600 hover:bg-medical-700 text-white rounded-xl h-12 font-bold px-8 shadow-lg shadow-medical-500/20 disabled:bg-slate-200 disabled:text-slate-400 dark:disabled:bg-slate-800 dark:disabled:text-slate-500 disabled:shadow-none"
            >
              <Plus className="w-4 h-4 mr-2" />
              {!canAdd ? t('limit_reached_btn') : t('create_first', { defaultValue: 'Crear mi primer paquete' })}
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

        {/* --- CONSEJO FINAL (TIPS) --- */}
        {packages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 rounded-3xl p-6 flex items-start gap-4 shadow-sm"
          >
            <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-xl">
              <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            </div>
            <div className="text-sm text-blue-700 dark:text-blue-300/80">
              <p className="font-bold text-blue-600 dark:text-blue-400 mb-1.5 text-base">
                {t('tip_title', { defaultValue: 'Tip para vender más' })}
              </p>
              <p className="leading-relaxed">
                {t('tip_desc', { defaultValue: 'Asegúrate de que el precio del paquete sea menor a la suma de los servicios individuales para incentivar la compra.' })}
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

      </CardContent>
    </Card>
  );
}