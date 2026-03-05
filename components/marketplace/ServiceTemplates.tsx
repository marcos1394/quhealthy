"use client";

import React from "react";
import { motion } from "framer-motion";
import { Video, MapPin, Info, X } from "lucide-react";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { ServiceDeliveryType } from "@/types/catalog"; // Ajusta el path si es necesario

// Plantillas predefinidas (Puedes agregar más en el futuro)
const serviceTemplates = [
  { name: "Consulta General", duration: 30, price: 500, type: 'in_person' as ServiceDeliveryType },
  { name: "Consulta de Seguimiento", duration: 20, price: 350, type: 'video_call' as ServiceDeliveryType },
  { name: "Valoración Inicial", duration: 45, price: 700, type: 'in_person' as ServiceDeliveryType },
  { name: "Teleconsulta", duration: 25, price: 400, type: 'video_call' as ServiceDeliveryType }
];

interface ServiceTemplatesProps {
  onApply: (template: { name: string; duration: number; price: number; type: ServiceDeliveryType }) => void;
  onClose: () => void;
}

export function ServiceTemplates({ onApply, onClose }: ServiceTemplatesProps) {
  const t = useTranslations('Marketplace.services');

  return (
    <motion.div
      initial={{ opacity: 0, height: 0, marginBottom: 0 }}
      animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      className="bg-medical-50 dark:bg-medical-500/5 border border-medical-200 dark:border-medical-500/20 rounded-3xl p-6 md:p-8 overflow-hidden shadow-inner relative"
    >
      {/* Botón de Cerrar */}
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-medical-400 hover:text-medical-600 dark:hover:text-medical-300 hover:bg-medical-100 dark:hover:bg-medical-500/20 rounded-full transition-colors"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Cabecera del Panel */}
      <div className="flex items-start gap-4 mb-6 pr-8">
        <div className="p-2.5 bg-medical-100 dark:bg-medical-500/20 rounded-xl shadow-sm border border-medical-200 dark:border-medical-500/30">
          <Info className="w-6 h-6 text-medical-600 dark:text-medical-400 flex-shrink-0" />
        </div>
        <div>
          <p className="text-lg font-bold text-medical-900 dark:text-medical-100 mb-1 tracking-tight">
            {t('quick_templates', { defaultValue: 'Plantillas Rápidas' })}
          </p>
          <p className="text-sm text-medical-700 dark:text-medical-300/80 leading-relaxed">
            {t('quick_templates_desc', { defaultValue: 'Selecciona una plantilla para crear un servicio en segundos. Podrás editar los detalles después.' })}
          </p>
        </div>
      </div>
      
      {/* Grid de Plantillas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {serviceTemplates.map((template, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onApply(template)}
            className="flex flex-col items-start gap-4 p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-medical-400 dark:hover:border-medical-500 hover:shadow-lg hover:shadow-medical-500/10 transition-all text-left group"
          >
            <div className="flex items-center gap-3">
              {template.type === 'video_call' ? (
                <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl group-hover:bg-emerald-100 dark:group-hover:bg-emerald-500/20 transition-colors">
                  <Video className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
              ) : (
                <div className="p-2 bg-medical-50 dark:bg-medical-500/10 rounded-xl group-hover:bg-medical-100 dark:group-hover:bg-medical-500/20 transition-colors">
                  <MapPin className="w-4 h-4 text-medical-600 dark:text-medical-400" />
                </div>
              )}
              <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{template.name}</p>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 w-full mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
              <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold border-none">
                ${template.price}
              </Badge>
              <span>•</span>
              <span className="font-semibold">{template.duration} min</span>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}