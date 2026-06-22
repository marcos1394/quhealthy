"use client"
/* eslint-disable react-doctor/button-has-type */;

import React from "react";
import { motion } from "framer-motion";
import { Edit2, Trash2, Sparkles, CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { UI_Package } from "@/types/catalog"; 
import { UI_Service } from "@/types/catalog";
import { cn } from "@/lib/utils";

interface PackageItemCardProps {
  pkg: UI_Package;
  availableServices: UI_Service[];
  onEdit: (pkg: UI_Package) => void;
  onDelete: (id: number) => void;
}

export function PackageItemCard({ pkg, availableServices, onEdit, onDelete }: PackageItemCardProps) {
  const t = useTranslations('Marketplace.packages');

  // Helpers de cálculo
  const realVal = pkg.serviceIds.reduce((sum, id) => {
    const s = availableServices.find(srv => srv.id === id);
    return sum + (s ? s.price : 0);
  }, 0);
  
  const savingsAmt = Math.max(0, realVal - pkg.price);
  const savingsPerc = realVal > 0 ? Math.round((savingsAmt / realVal) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="flex flex-col bg-white dark:bg-[#0a0a0a] border border-black/20 dark:border-white/20 rounded-none transition-colors hover:border-black dark:hover:border-white"
    >
      {/* --- CABECERA (DATOS Y COMANDOS) --- */}
      <div className="p-6 border-b border-black/10 dark:border-white/10 flex flex-col gap-4">
        <div className="flex justify-between items-start gap-4">
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold uppercase tracking-tight text-black dark:text-white leading-none">
              {pkg.name}
            </h3>
            {savingsAmt > 0 && (
              <span className="border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest flex items-center gap-1.5 w-fit">
                <Sparkles className="w-3 h-3" strokeWidth={1.5} />
                {savingsPerc}% AHORRO
              </span>
            )}
          </div>

          {/* Controles de Acción */}
          <div className="flex border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] shrink-0">
            <button 
              onClick={() => onEdit(pkg)} 
              className="w-10 h-10 flex items-center justify-center border-r border-black/20 dark:border-white/20 text-gray-500 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
              title={t('edit_btn', { defaultValue: 'EDITAR PAQUETE' })}
            >
              <Edit2 className="w-4 h-4" strokeWidth={1.5} />
            </button>
            <button 
              onClick={() => {
                if (confirm(t('delete_confirm', { defaultValue: '¿ANULAR REGISTRO DE PAQUETE?' }))) {
                  onDelete(pkg.id);
                }
              }}
              className="w-10 h-10 flex items-center justify-center text-red-500 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/10 transition-colors"
              title={t('delete_btn', { defaultValue: 'ELIMINAR PAQUETE' })}
            >
              <Trash2 className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 line-clamp-2 leading-relaxed">
          {pkg.description || "PAQUETE PERSONALIZADO DE SERVICIOS CLÍNICOS."}
        </p>
      </div>

      {/* --- INVENTARIO DE SERVICIOS (CHIPS TÉCNICOS) --- */}
      <div className="p-6 flex-1 flex flex-col bg-white dark:bg-[#0a0a0a]">
        <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-3 block">
          CONTENIDO DEL ENSAMBLE
        </span>
        <div className="flex flex-wrap gap-2 content-start">
          {pkg.serviceIds.map(id => {
            const s = availableServices.find(service => service.id === id);
            return s ? (
              <span 
                key={id} 
                className="text-[9px] font-bold uppercase tracking-widest text-black dark:text-white bg-gray-50 dark:bg-[#050505] border border-black/10 dark:border-white/10 px-2.5 py-1.5 flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-gray-400" strokeWidth={1.5} />
                {s.name}
              </span>
            ) : null;
          })}
        </div>
      </div>

      {/* --- TOTALES (FOOTER DE PRECIOS) --- */}
      <div className="p-6 bg-gray-50 dark:bg-[#050505] border-t border-black/10 dark:border-white/10 flex items-end justify-between shrink-0">
        <div className="flex flex-col">
          {savingsAmt > 0 && (
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] text-gray-400 line-through font-mono font-bold tracking-widest">
                ${realVal}
              </span>
              <span className="text-[8px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                BENEFICIO: ${savingsAmt}
              </span>
            </div>
          )}
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-mono font-semibold tracking-tight text-black dark:text-white leading-none">
              ${pkg.price}
            </span>
            <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500">
              MXN
            </span>
          </div>
        </div>

        <span className="text-[9px] font-bold uppercase tracking-widest border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] px-2 py-1 text-gray-600 dark:text-gray-400">
          {pkg.serviceIds.length} {pkg.serviceIds.length === 1 ? 'ITEM' : 'ITEMS'}
        </span>
      </div>
      
    </motion.div>
  );
}