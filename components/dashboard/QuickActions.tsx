"use client"
/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/prefer-module-scope-static-value */;

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Users, Calendar, Settings, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

export const QuickActions = () => {
 const router = useRouter();
 const [isOpen, setIsOpen] = useState(false);

 // Comandos de acción corta
 const actions = [
 { icon: Calendar, label: "AGENDAR CONSULTA", href: "/provider/dashboard/appointments?action=new" },
 { icon: Users, label: "NUEVO PACIENTE", href: "/provider/dashboard/patients?action=new" },
 { icon: FileText, label: "SUBIR DOCUMENTO", href: "/provider/dashboard/documents?action=upload" },
 { icon: Settings, label: "CONFIGURACIÓN", href: "/provider/store" },
 ];

 return (
 <div className="fixed bottom-24 lg:bottom-28 right-6 lg:right-10 z-50 flex flex-col items-end">
 <AnimatePresence>
 {isOpen && (
 <motion.div
 initial={{ opacity: 0, y: 10, scale: 0.98 }}
 animate={{ opacity: 1, y: 0, scale: 1 }}
 exit={{ opacity: 0, y: 10, scale: 0.98 }}
 transition={{ duration: 0.15, ease: "easeOut" }}
 className="mb-4 w-72 bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 flex flex-col rounded-3xl shadow-xl overflow-hidden"
 >
 {/* Lista de Acciones tipo Terminal */}
 <div className="flex flex-col bg-white dark:bg-[#0a0a0a]">
 {actions.map((action, idx) => (
 <button
 key={idx}
 onClick={() => {
 setIsOpen(false);
 router.push(action.href);
 }}
 className="w-full flex items-center gap-4 p-4 border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-[#050505] transition-colors group text-left bg-white dark:bg-[#0a0a0a]"
 >
 <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-[#050505] flex items-center justify-center shrink-0 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/30 transition-colors shadow-sm border border-gray-100 dark:border-gray-800">
 <action.icon className="w-5 h-5 text-gray-600 group-hover:text-emerald-600 dark:text-gray-400 dark:group-hover:text-emerald-400" strokeWidth={1.5} />
 </div>
 <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
 {action.label}
 </span>
 </button>
 ))}
 </div>
 </motion.div>
 )}
 </AnimatePresence>

 {/* Disparador Físico Estricto */}
 <button
 onClick={() => setIsOpen(!isOpen)}
 className={cn(
 "w-14 h-14 flex items-center justify-center transition-all duration-300 rounded-full shadow-lg",
 isOpen 
 ? "bg-white text-gray-700 dark:bg-[#0a0a0a] dark:text-gray-300 hover:bg-gray-50 border border-gray-200" 
 : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/30 hover:scale-105"
 )}
 aria-label="Toggle quick actions"
 >
 <motion.div
 animate={{ rotate: isOpen ? 45 : 0 }}
 transition={{ duration: 0.15, ease: "easeInOut" }}
 >
 <Plus className="w-6 h-6" strokeWidth={1.5} />
 </motion.div>
 </button>
 </div>
 );
};