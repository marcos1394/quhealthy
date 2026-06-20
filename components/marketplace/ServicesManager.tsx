"use client";

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
  Check
} from "lucide-react";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
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
  maxLimit?: number;
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
  maxLimit
}: ServicesManagerProps) {
  const t = useTranslations('Marketplace.services'); 
  const [showTemplates, setShowTemplates] = useState(false);

  const hasUnsavedChanges = services.some(s => s.isNew || s.hasUnsavedChanges);

  // Manejador para aplicar una plantilla rápida
  const handleApplyTemplate = (template: { name: string; duration: number; price: number; type: ServiceDeliveryType }) => {
    if (!canAdd) {
      toast.warning(t('limit_reached_msg', { defaultValue: 'Has alcanzado el límite de tu plan.' }));
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
          hasUnsavedChanges: true
        });
      }
    }, 50);
    setShowTemplates(false);
    toast.success(t('template_applied', { name: template.name, defaultValue: `Plantilla ${template.name} aplicada` }));
  };

  return (
    <div className="flex flex-col bg-white dark:bg-[#0a0a0a]">
      
      {/* --- CABECERA (HEADER) --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-200 dark:border-gray-800 p-6 md:p-8 bg-gray-50 dark:bg-[#050505] gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 border border-black dark:border-white flex items-center justify-center bg-white dark:bg-black shrink-0">
            <Zap className="w-5 h-5 text-black dark:text-white" strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-black dark:text-white mb-2">
              {t('title', { defaultValue: 'Gestor de Servicios' })}
            </h2>
            <div className="flex flex-wrap items-center gap-3">
              {services.length > 0 && (
                <span className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-black px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {services.length} {services.length === 1 ? t('service_single', { defaultValue: 'Registro' }) : t('service_plural', { defaultValue: 'Registros' })}
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

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Button 
            variant="outline"
            onClick={() => setShowTemplates(!showTemplates)}
            disabled={!canAdd} 
            className="w-full sm:w-auto rounded-none border border-black dark:border-white text-[10px] font-bold uppercase tracking-widest hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors h-10 px-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Tag className="w-3.5 h-3.5 mr-2" strokeWidth={2} />
            {t('templates', { defaultValue: 'Plantillas Base' })}
          </Button>
          
          <Button 
            onClick={onAdd} 
            disabled={!canAdd}
            className="w-full sm:w-auto rounded-none bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 text-[10px] font-bold uppercase tracking-widest transition-colors h-10 px-6 disabled:opacity-50 disabled:cursor-not-allowed border-0"
          >
            <Plus className="w-4 h-4 mr-2" strokeWidth={2} /> 
            {!canAdd ? t('limit_reached_btn', { defaultValue: 'Límite Agotado' }) : t('new_service', { defaultValue: 'Nuevo Servicio' })}
          </Button>
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-8 bg-gray-50/50 dark:bg-[#050505]/50">
        
        {/* --- PANEL DE PLANTILLAS --- */}
        <AnimatePresence>
          {showTemplates && canAdd && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] mb-8">
                <ServiceTemplates 
                  onApply={handleApplyTemplate} 
                  onClose={() => setShowTemplates(false)} 
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- ALERTA DE LÍMITE (Margin Note) --- */}
        <AnimatePresence>
          {!canAdd && (
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

        {/* --- ALERTA DE CAMBIOS SIN GUARDAR (Margin Note) --- */}
        <AnimatePresence>
          {hasUnsavedChanges && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="border-l-2 border-amber-500 pl-4 py-2 bg-amber-50 dark:bg-amber-900/10 mb-8">
                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400 flex items-center gap-2 mb-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {t('unsaved_changes', { defaultValue: 'Modificaciones Pendientes' })}
                </p>
                <p className="text-xs text-amber-800 dark:text-amber-300 font-light">
                  {t('unsaved_desc', { defaultValue: 'Asegúrate de guardar el progreso en los servicios marcados antes de salir.' })}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- LISTA DE SERVICIOS --- */}
        <div className="space-y-6">
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

        {/* --- ESTADO VACÍO (Blueprint Empty State) --- */}
        {services.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 border border-dashed border-gray-400 dark:border-gray-600 bg-white dark:bg-[#0a0a0a]"
          >
            <div className="w-16 h-16 border border-gray-300 dark:border-gray-700 flex items-center justify-center bg-gray-50 dark:bg-[#050505] mb-6">
              <Zap className="w-6 h-6 text-gray-400" strokeWidth={1.5} />
            </div>
            <p className="text-sm font-bold uppercase tracking-widest text-black dark:text-white mb-2">
              {t('empty_title', { defaultValue: 'Catálogo Vacío' })}
            </p>
            <p className="text-xs text-gray-500 font-light mb-8 max-w-sm text-center leading-relaxed">
              {t('empty_desc', { defaultValue: 'Comienza a agregar los procedimientos, consultas y servicios que ofreces.' })}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                variant="outline" 
                onClick={() => setShowTemplates(true)}
                disabled={!canAdd}
                className="rounded-none border border-gray-300 dark:border-gray-700 text-[10px] font-bold uppercase tracking-widest hover:border-black dark:hover:border-white hover:bg-gray-50 dark:hover:bg-[#050505] transition-colors h-12 px-8 disabled:opacity-50"
              >
                <Tag className="w-3.5 h-3.5 mr-2" /> Explorar {t('templates', { defaultValue: 'Plantillas' })}
              </Button>
              <Button 
                onClick={onAdd}
                disabled={!canAdd}
                className="rounded-none bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 text-[10px] font-bold uppercase tracking-widest transition-colors h-12 px-8 disabled:opacity-50 border-0"
              >
                <Plus className="w-4 h-4 mr-2" strokeWidth={2} /> 
                {!canAdd ? t('limit_reached_btn') : t('create_first', { defaultValue: 'Crear Registro Inicial' })}
              </Button>
            </div>
          </motion.div>
        )}

        {/* --- CONSEJO FINAL (TIPS) - (Margin Note) --- */}
        {services.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-l-2 border-black dark:border-white pl-6 py-4 bg-gray-50 dark:bg-[#050505] mt-12"
          >
            <p className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4" strokeWidth={1.5} /> {t('tip_title', { defaultValue: 'Optimización de Conversión' })}
            </p>
            <ul className="space-y-2 text-xs text-gray-500 font-light">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 shrink-0 text-black dark:text-white" strokeWidth={2} />
                <span>Integra imágenes descriptivas para cada servicio (+40% conversión).</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 shrink-0 text-black dark:text-white" strokeWidth={2} />
                <span>Detalla los tiempos de ejecución reales para evitar solapamientos.</span>
              </li>
            </ul>
          </motion.div>
        )}

      </div>
    </div>
  );
}