"use client";

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
        <div className="fixed bottom-6 lg:bottom-10 right-6 lg:right-10 z-50 flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="mb-0 w-72 bg-white dark:bg-[#0a0a0a] border border-black dark:border-white flex flex-col rounded-none overflow-hidden"
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
                                    className="w-full flex items-center gap-4 p-4 border-b border-black dark:border-white last:border-0 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors group text-left rounded-none bg-white dark:bg-[#0a0a0a]"
                                >
                                    <div className="w-10 h-10 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] flex items-center justify-center shrink-0 group-hover:bg-transparent group-hover:border-white/50 dark:group-hover:border-black/50 transition-colors">
                                        <action.icon className="w-4 h-4" strokeWidth={1.5} />
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest">
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
                    "w-14 h-14 flex items-center justify-center transition-colors duration-200 rounded-none border border-black dark:border-white border-t-0",
                    // Cambio de estado binario sin traslaciones ni sombras
                    isOpen 
                      ? "bg-white text-black dark:bg-[#0a0a0a] dark:text-white hover:bg-gray-50 dark:hover:bg-[#050505]" 
                      : "bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 border-t"
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