"use client";

import React from "react";
import { motion } from "framer-motion";
import { Edit2, Trash2, Sparkles, CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { UI_Package } from "@/types/catalog"; // O ajusta la ruta a donde tengas la interfaz
import { UI_Service } from "@/types/catalog";
import {  } from "./PackagesManager";

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
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -6 }}
      className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-6 hover:border-medical-400 dark:hover:border-medical-500/50 hover:shadow-xl hover:shadow-medical-500/10 transition-all duration-300 group relative overflow-hidden"
    >
      {/* Resplandor sutil en hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-medical-50/50 to-transparent dark:from-medical-500/5 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative z-10 flex flex-col h-full">
        {/* Cabecera */}
        <div className="flex justify-between items-start mb-6 gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight">{pkg.name}</h3>
              {savingsAmt > 0 && (
                <Badge className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30 shadow-sm font-bold">
                  <Sparkles className="w-3 h-3 mr-1" />
                  {savingsPerc}% OFF
                </Badge>
              )}
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
              {pkg.description || "Paquete personalizado de servicios médicos."}
            </p>
          </div>

          {/* Acciones */}
          <div className="flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl p-1 shadow-sm border border-slate-100 dark:border-slate-800">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => onEdit(pkg)} 
              className="h-8 w-8 text-slate-400 hover:text-medical-600 dark:hover:text-medical-400 hover:bg-medical-50 dark:hover:bg-medical-900/20 rounded-lg"
            >
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => {
                if (confirm(t('delete_confirm', { defaultValue: '¿Eliminar este paquete?' }))) {
                  onDelete(pkg.id);
                }
              }}
              className="h-8 w-8 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Chips de Servicios */}
        <div className="flex flex-wrap gap-2 mb-6 flex-1 content-start">
          {pkg.serviceIds.map(id => {
            const s = availableServices.find(service => service.id === id);
            return s ? (
              <span 
                key={id} 
                className="text-[11px] bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 font-semibold"
              >
                <CheckCircle2 className="w-3 h-3 text-medical-500" />
                {s.name}
              </span>
            ) : null;
          })}
        </div>

        <Separator className="bg-slate-100 dark:bg-slate-800 mb-5" />

        {/* Precios */}
        <div className="flex items-end justify-between mt-auto">
          <div>
            {savingsAmt > 0 && (
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-slate-400 line-through font-semibold">${realVal}</span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
                  Ahorras ${savingsAmt}
                </span>
              </div>
            )}
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-medical-600 dark:text-medical-400">
                ${pkg.price}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">MXN</span>
            </div>
          </div>

          <Badge variant="outline" className="border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800">
            {pkg.serviceIds.length} {pkg.serviceIds.length === 1 ? 'Servicio' : 'Servicios'}
          </Badge>
        </div>
      </div>
    </motion.div>
  );
}