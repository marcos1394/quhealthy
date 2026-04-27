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
  Info
} from "lucide-react";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";

// ShadCN UI
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Subcomponentes refactorizados
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
  // 🚀 Nuevas props de negocio para límites de plan
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
  canAdd = true, // Default true por seguridad
  currentUsage,
  maxLimit
}: ServicesManagerProps) {
  const t = useTranslations('Marketplace.services'); 
  const [showTemplates, setShowTemplates] = useState(false);

  const hasUnsavedChanges = services.some(s => s.isNew || s.hasUnsavedChanges);

  // Manejador para aplicar una plantilla rápida
  const handleApplyTemplate = (template: { name: string; duration: number; price: number; type: ServiceDeliveryType }) => {
    // 🛡️ Validación de negocio: Bloquear si no tiene espacio en su plan
    if (!canAdd) {
      toast.warning(t('limit_reached_msg', { defaultValue: 'Has alcanzado el límite de tu plan.' }));
      return;
    }

    onAdd();
    // Como React actualiza el estado asíncronamente, usamos un pequeño delay 
    setTimeout(() => {
      // Asumiendo que onAdd pone el nuevo servicio al principio del array (índice 0):
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
              <Zap className="w-7 h-7 text-medical-600 dark:text-medical-400" />
            </motion.div>
            {t('title', { defaultValue: 'Tus Servicios' })}
          </CardTitle>
          <CardDescription className="text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-3 text-base">
            {t('description', { defaultValue: 'Gestiona los servicios médicos que ofreces.' })}
            
            {/* 🚀 Indicador de ítems activos */}
            {services.length > 0 && (
              <Badge className="bg-medical-50 dark:bg-medical-500/10 text-medical-700 dark:text-medical-400 border-medical-200 dark:border-medical-500/20 shadow-sm font-medium">
                <Sparkles className="w-3 h-3 mr-1" />
                {services.length} {services.length === 1 ? t('service_single', { defaultValue: 'Servicio' }) : t('service_plural', { defaultValue: 'Servicios' })}
              </Badge>
            )}

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

        <div className="flex items-center gap-3">
          <Button 
            variant="outline"
            onClick={() => setShowTemplates(!showTemplates)}
            disabled={!canAdd} // 🚀 Deshabilita abrir plantillas si no hay espacio
            className={cn(
              "h-11 rounded-xl transition-colors",
              !canAdd 
                ? "bg-slate-100 text-slate-400 border-slate-200 dark:bg-slate-800 dark:text-slate-500 dark:border-slate-700 cursor-not-allowed" 
                : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            )}
          >
            <Tag className="w-4 h-4 mr-2" />
            {t('templates', { defaultValue: 'Plantillas' })}
          </Button>
          
          {/* 🚀 Botón protegido por regla de negocio */}
          <Button 
            onClick={onAdd} 
            disabled={!canAdd}
            className={cn(
              "shadow-md transition-all rounded-xl h-11 font-bold",
              canAdd 
                ? "bg-medical-600 hover:bg-medical-700 text-white hover:shadow-lg" 
                : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 cursor-not-allowed border border-slate-200 dark:border-slate-700"
            )}
          >
            <Plus className="w-4 h-4 mr-2" /> 
            {!canAdd ? t('limit_reached_btn', { defaultValue: 'Límite Lleno' }) : t('new_service', { defaultValue: 'Nuevo Servicio' })}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-8 pt-8 p-6 md:p-8 bg-slate-50/30 dark:bg-slate-900/50">
        
        {/* --- PANEL DE PLANTILLAS --- */}
        <AnimatePresence>
          {showTemplates && canAdd && (
            <ServiceTemplates 
              onApply={handleApplyTemplate} 
              onClose={() => setShowTemplates(false)} 
            />
          )}
        </AnimatePresence>

        {/* --- ALERTA DE LÍMITE (Feedback UX) --- */}
        <AnimatePresence>
          {!canAdd && (
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
                  {t('limit_alert_desc', { defaultValue: 'Archiva o elimina servicios antiguos para liberar espacio, o actualiza tu plan en la sección de facturación.' })}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- ALERTA DE CAMBIOS SIN GUARDAR --- */}
        <AnimatePresence>
          {hasUnsavedChanges && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-3xl p-5 flex items-center gap-4 shadow-sm"
            >
              <div className="p-2 bg-amber-100 dark:bg-amber-500/20 rounded-xl">
                <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-amber-800 dark:text-amber-300 font-bold mb-1">
                  {t('unsaved_changes', { defaultValue: 'Tienes cambios sin guardar' })}
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300/80">
                  {t('unsaved_desc', { defaultValue: 'Asegúrate de guardar tus servicios antes de salir o se perderán los datos nuevos.' })}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- LISTA DE SERVICIOS --- */}
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

        {/* --- ESTADO VACÍO --- */}
        {services.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900/30"
          >
            <div className="p-6 bg-medical-50 dark:bg-medical-500/10 rounded-3xl mb-6 border border-medical-100 dark:border-medical-500/20 shadow-sm">
              <Zap className="w-12 h-12 text-medical-500 dark:text-medical-400" />
            </div>
            <p className="text-xl font-black text-slate-900 dark:text-white mb-2">
              {t('empty_title', { defaultValue: 'Comienza a armar tu catálogo' })}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 max-w-md text-center leading-relaxed">
              {t('empty_desc', { defaultValue: 'Agrega los servicios médicos que ofreces para que tus pacientes puedan agendar.' })}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                variant="outline" 
                onClick={() => setShowTemplates(true)}
                disabled={!canAdd}
                className="border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 h-12 rounded-xl disabled:opacity-50"
              >
                <Tag className="w-4 h-4 mr-2" /> Ver {t('templates', { defaultValue: 'Plantillas' })}
              </Button>
              <Button 
                onClick={onAdd}
                disabled={!canAdd}
                className="bg-medical-600 hover:bg-medical-700 shadow-lg shadow-medical-500/20 h-12 font-bold rounded-xl text-white disabled:bg-slate-200 disabled:text-slate-400 dark:disabled:bg-slate-800 dark:disabled:text-slate-500 disabled:shadow-none"
              >
                <Plus className="w-4 h-4 mr-2" /> 
                {!canAdd ? t('limit_reached_btn') : t('create_first', { defaultValue: 'Crear mi primer servicio' })}
              </Button>
            </div>
          </motion.div>
        )}

        {/* --- CONSEJO FINAL (TIPS) --- */}
        {services.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-3xl p-6 flex items-start gap-4 shadow-sm"
          >
            <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 rounded-xl">
              <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            </div>
            <div className="text-sm text-emerald-700 dark:text-emerald-300/80">
              <p className="font-bold text-emerald-600 dark:text-emerald-400 mb-1.5 text-base">
                {t('tip_title', { defaultValue: 'Tip de oro' })}
              </p>
              <p className="leading-relaxed">
                {t('tip_desc', { defaultValue: 'Sube una foto atractiva para cada servicio. Los pacientes reservan un 40% más cuando ven una imagen clara de lo que ofreces.' })}
              </p>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}