"use client";

import React from "react";
import { motion } from "framer-motion";
import { Video, MapPin, Info, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

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
      className="flex flex-col border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] rounded-none overflow-hidden"
    >
      {/* Cabecera del Panel */}
      <div className="flex items-start md:items-center justify-between p-6 border-b border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0a] shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] flex items-center justify-center shrink-0">
            <Info className="w-4 h-4 text-black dark:text-white" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-tight text-black dark:text-white leading-none mb-1">
              {t('quick_templates', { defaultValue: 'PLANTILLAS BASE' })}
            </p>
            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500">
              {t('quick_templates_desc', { defaultValue: 'CARGUE UNA CONFIGURACIÓN PREESTABLECIDA PARA ACELERAR EL REGISTRO.' })}
            </p>
          </div>
        </div>
        {/* Botón de Cerrar */}
        <button 
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-[#111] transition-colors shrink-0 border border-transparent hover:border-black/20 dark:hover:border-white/20"
        >
          <X className="w-4 h-4 text-gray-500" strokeWidth={1.5} />
        </button>
      </div>
      
      {/* Grid de Plantillas (Matriz de Comandos) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 bg-white dark:bg-[#0a0a0a] border-b border-black/10 dark:border-white/10">
        {serviceTemplates.map((template, index) => (
          <button
            key={index}
            onClick={() => onApply(template)}
            className="flex flex-col text-left border-r border-b lg:border-b-0 border-black/10 dark:border-white/10 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors group p-0 rounded-none last:border-r-0 sm:nth-child(even):border-r-0 lg:nth-child(even):border-r"
          >
            <div className="p-5 flex-1 w-full">
              <div className="flex items-center justify-between mb-4">
                <div className="w-8 h-8 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] flex items-center justify-center group-hover:border-white/30 dark:group-hover:border-black/30 group-hover:bg-transparent transition-colors">
                  {template.type === 'video_call' ? (
                    <Video className="w-3.5 h-3.5" strokeWidth={1.5} />
                  ) : (
                    <MapPin className="w-3.5 h-3.5" strokeWidth={1.5} />
                  )}
                </div>
                <span className="text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 border border-black/10 dark:border-white/10 group-hover:border-white/30 dark:group-hover:border-black/30 transition-colors">
                  {template.type === 'video_call' ? 'REMOTO' : 'LOCAL'}
                </span>
              </div>
              <p className="text-xs font-semibold uppercase tracking-widest leading-tight mb-2">
                {template.name}
              </p>
            </div>
            
            <div className="w-full p-4 border-t border-black/10 dark:border-white/10 flex items-center justify-between bg-gray-50 dark:bg-[#050505] group-hover:bg-transparent group-hover:border-white/30 dark:group-hover:border-black/30 transition-colors">
              <span className="text-[10px] font-mono font-bold tracking-widest">
                ${template.price}
              </span>
              <span className="text-[9px] font-bold uppercase tracking-widest opacity-70">
                {template.duration} MIN
              </span>
            </div>
          </button>
        ))}
      </div>
    </motion.div>
  );
}