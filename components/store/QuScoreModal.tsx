"use client"
/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/prefer-module-scope-pure-function */

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldCheck, Star, UserCheck, Activity, FileText, ArrowRight, Zap } from "lucide-react";
import { ProviderScoreResponse } from "@/types/providerScore";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface QuScoreModalProps {
 isOpen: boolean;
 onClose: () => void;
 scoreData: ProviderScoreResponse | null;
}

export const QuScoreModal: React.FC<QuScoreModalProps> = ({ isOpen, onClose, scoreData }) => {
 const router = useRouter();

 // 1. BLOQUEO DE SCROLL
 useEffect(() => {
 if (isOpen) {
 document.body.style.overflow = 'hidden';
 } else {
 document.body.style.overflow = 'unset';
 }
 return () => {
 document.body.style.overflow = 'unset';
 };
 }, [isOpen]);

 if (!scoreData) return null;

 const getPillarIcon = (key: string, name: string) => {
 const identifier = `${key} ${name}`.toUpperCase();
 if (identifier.includes('P1') || identifier.includes('SEGURIDAD') || identifier.includes('SECURITY')) return <ShieldCheck className="w-4 h-4" strokeWidth={1.5} />;
 if (identifier.includes('P2') || identifier.includes('FAVORITO') || identifier.includes('REPUTACIÓN')) return <Star className="w-4 h-4" strokeWidth={1.5} />;
 if (identifier.includes('P3') || identifier.includes('PRESENCIA') || identifier.includes('DIGITAL')) return <Activity className="w-4 h-4" strokeWidth={1.5} />;
 if (identifier.includes('P4') || identifier.includes('PACIENTE') || identifier.includes('USUARIO')) return <UserCheck className="w-4 h-4" strokeWidth={1.5} />;
 if (identifier.includes('P5') || identifier.includes('TRANSPARENCIA') || identifier.includes('INFORMACIÓN')) return <FileText className="w-4 h-4" strokeWidth={1.5} />;
 return <Zap className="w-4 h-4" strokeWidth={1.5} />;
 };

 const getStatusFill = (status: string) => {
    switch(status) {
      case 'OPTIMAL': return 'bg-teal-500 dark:bg-teal-400';
      case 'IMPROVABLE': return 'bg-yellow-400 dark:bg-yellow-500';
      case 'LOW': return 'bg-red-400 dark:bg-red-500';
      default: return 'bg-gray-300';
    }
  };

 return (
 <AnimatePresence>
 {isOpen && (
 <motion.div 
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 transition={{ duration: 0.2 }}
 className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6 md:p-10"
 >
 {/* OVERLAY TÉCNICO */}
 <div
 onClick={onClose}
 className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
 />

        {/* MODAL BLUEPRINT */}
        <motion.div
          initial={{ scale: 0.95, y: 10, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, y: 10, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-[90vw] sm:max-w-xl bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-2xl flex flex-col max-h-[70vh] sm:max-h-[75vh] z-10 overflow-hidden"
        >
          {/* HEADER */}
          <div className="relative border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white p-5 sm:p-6 md:p-8 flex items-end justify-between flex-shrink-0">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <X className="w-5 h-5" strokeWidth={2} />
            </button>
            
            <div className="pr-4">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-1">
                Desglose QuScore
              </h2>
              <p className="text-xs font-medium text-gray-500">
                Auditoría de Transparencia Algorítmica
              </p>
            </div>
            
            <div className="text-4xl sm:text-5xl font-black tracking-tight leading-none text-teal-600 dark:text-teal-400 pl-4 sm:pl-6 shrink-0">
              {scoreData.score}
            </div>
          </div>

 {/* BODY */}
 <div className="p-5 sm:p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1 min-h-0 bg-white dark:bg-[#0a0a0a]">
          {scoreData.isNewProvider && (
            <div className="p-4 mb-6 sm:mb-8 rounded-2xl border border-yellow-200 bg-yellow-50 dark:border-yellow-900/50 dark:bg-yellow-900/20">
              <p className="text-xs font-semibold text-yellow-800 dark:text-yellow-500 leading-relaxed text-center">
                Aviso: El especialista aún no cumple el límite transaccional para un cálculo algorítmico completo.
              </p>
            </div>
          )}

          <div className="space-y-6 sm:space-y-8">
            {Object.entries(scoreData.breakdown).map(([key, pillar]) => (
              <div key={key} className="flex flex-col gap-3 group cursor-default">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                      {getPillarIcon(key, pillar.name)}
                    </div>
                    <div className="pt-0.5">
                      <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-1">
                        {pillar.name}
                      </h4>
                      <p className="text-xs text-gray-500 max-w-[180px] sm:max-w-[240px] leading-relaxed">
                        {pillar.tooltip}
                      </p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-gray-900 dark:text-white tabular-nums tracking-tight">
                    {pillar.percentage}%
                  </span>
                </div>
                
                <div className="h-2.5 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${pillar.percentage}%` }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                    className={cn("h-full rounded-full", getStatusFill(pillar.status))}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 sm:mt-10 pt-6 sm:pt-8 border-t border-gray-100 dark:border-gray-800">
            <button 
              onClick={() => {
                onClose();
                router.push('/es/como-funciona-el-quscore');
              }}
              className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-900 text-sm font-semibold text-gray-900 dark:text-white transition-all"
            >
              Consultar Metodología Pública <ArrowRight className="w-4 h-4 text-gray-400" strokeWidth={2} />
            </button>
          </div>
 </div>

 </motion.div>
 </motion.div>
 )}
 </AnimatePresence>
 );
};