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
 case 'OPTIMAL': return 'bg-black dark:bg-white';
 case 'IMPROVABLE': return 'bg-gray-400 dark:bg-gray-500';
 case 'LOW': return 'bg-gray-200 dark:bg-gray-800';
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
 initial={{ scale: 0.95, y: 10 }}
 animate={{ scale: 1, y: 0 }}
 exit={{ scale: 0.95, y: 10 }}
 transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
 // Redujimos drásticamente la altura máxima a 70vh/75vh para evitar colisiones con el Navbar
 className="relative w-full max-w-[90vw] sm:max-w-xl bg-white dark:bg-[#0a0a0a] rounded-none border border-black dark:border-white shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff] flex flex-col max-h-[70vh] sm:max-h-[75vh] z-10"
 >
 {/* HEADER */}
 <div className="relative border-b border-black dark:border-white bg-black text-white dark:bg-white dark:text-black p-5 sm:p-6 md:p-8 flex items-end justify-between flex-shrink-0">
 <button
 onClick={onClose}
 className="absolute top-4 right-4 w-8 h-8 border border-gray-600 dark:border-gray-300 flex items-center justify-center hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white transition-colors"
 >
 <X className="w-4 h-4" strokeWidth={1.5} />
 </button>
 
 <div className="pr-4">
 <h2 className="text-lg sm:text-xl font-bold uppercase tracking-tight mb-1">
 Desglose QuScore
 </h2>
 <p className="text-[9px] font-bold uppercase tracking-widest opacity-70">
 Auditoría de Transparencia Algorítmica
 </p>
 </div>
 
 <div className="text-4xl sm:text-5xl font-black tracking-tighter leading-none border-l border-gray-700 dark:border-gray-300 pl-4 sm:pl-6 shrink-0">
 {scoreData.score}
 </div>
 </div>

 {/* BODY */}
 <div className="p-5 sm:p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1 min-h-0 bg-white dark:bg-[#0a0a0a]">
 
 {scoreData.isNewProvider && (
 <div className="p-4 mb-6 sm:mb-8 border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#050505]">
 <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 leading-relaxed text-center">
 AVISO: VOLUMEN DE DATOS INSUFICIENTE. EL ESPECIALISTA AÚN NO CUMPLE EL LÍMITE TRANSACCIONAL PARA UN CÁLCULO ALGORÍTMICO COMPLETO.
 </p>
 </div>
 )}

 <div className="space-y-5 sm:space-y-6">
 {Object.entries(scoreData.breakdown).map(([key, pillar]) => (
 <div key={key} className="flex flex-col gap-2.5 sm:gap-3 group cursor-default">
 <div className="flex items-start justify-between gap-4">
 <div className="flex items-start gap-3 sm:gap-4">
 <div className="w-10 h-10 border border-black dark:border-white bg-gray-50 dark:bg-[#050505] flex items-center justify-center shrink-0 transition-colors duration-300 group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black">
 {getPillarIcon(key, pillar.name)}
 </div>
 <div className="pt-0.5">
 <h4 className="font-bold text-[10px] uppercase tracking-widest text-black dark:text-white mb-1">
 {pillar.name}
 </h4>
 <p className="text-[9px] uppercase tracking-widest text-gray-500 max-w-[180px] sm:max-w-[240px] leading-relaxed transition-colors duration-300 group-hover:text-black dark:group-hover:text-gray-300">
 {pillar.tooltip}
 </p>
 </div>
 </div>
 <span className="text-base sm:text-lg font-bold text-black dark:text-white tabular-nums tracking-tight">
 {pillar.percentage}%
 </span>
 </div>
 
 <div className="h-3 w-full border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#050505]">
 <motion.div 
 initial={{ width: 0 }}
 animate={{ width: `${pillar.percentage}%` }}
 transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
 className={cn("h-full", getStatusFill(pillar.status))}
 />
 </div>
 </div>
 ))}
 </div>

 <div className="mt-8 sm:mt-10 pt-6 sm:pt-8 border-t border-gray-200 dark:border-gray-800">
 <button 
 onClick={() => {
 onClose();
 router.push('/es/como-funciona-el-quscore');
 }}
 className="w-full h-12 flex items-center justify-center gap-3 border border-black dark:border-white bg-transparent hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-[10px] font-bold uppercase tracking-widest transition-colors"
 >
 Consultar Metodología Pública <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
 </button>
 </div>
 </div>

 </motion.div>
 </motion.div>
 )}
 </AnimatePresence>
 );
};