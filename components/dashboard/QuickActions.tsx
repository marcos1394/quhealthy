"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Users, Calendar, Settings, FileText, X } from "lucide-react";
import { cn } from "@/lib/utils";

export const QuickActions = () => {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);

    // Textos adaptados al formato técnico de terminal
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
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 15 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="mb-4 w-64 bg-white dark:bg-[#0a0a0a] border border-black dark:border-white shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff] rounded-none overflow-hidden"
                    >
                        {/* Cabecera del Panel */}
                        <div className="p-4 bg-gray-50 dark:bg-[#050505] border-b border-black dark:border-white flex justify-between items-center">
                            <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">COMANDOS RÁPIDOS</h4>
                            <button 
                                onClick={() => setIsOpen(false)} 
                                className="text-gray-400 hover:text-black dark:hover:text-white transition-colors border-b border-transparent hover:border-black dark:hover:border-white pb-0.5"
                            >
                                <X className="w-4 h-4" strokeWidth={2} />
                            </button>
                        </div>
                        
                        {/* Lista de Acciones */}
                        <div className="flex flex-col divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-[#0a0a0a]">
                            {actions.map((action, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        setIsOpen(false);
                                        router.push(action.href);
                                    }}
                                    className="w-full flex items-center gap-4 p-4 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors group text-left rounded-none border-0"
                                >
                                    <div className="w-8 h-8 border border-black dark:border-white flex items-center justify-center bg-gray-50 dark:bg-[#050505] group-hover:bg-transparent group-hover:border-white dark:group-hover:border-black transition-colors shrink-0">
                                        <action.icon className="w-4 h-4 text-black dark:text-white group-hover:text-white dark:group-hover:text-black" strokeWidth={1.5} />
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white group-hover:text-white dark:group-hover:text-black transition-colors">
                                        {action.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Disparador Físico */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "w-14 h-14 flex items-center justify-center transition-all duration-200 rounded-none",
                    "border border-black dark:border-white bg-black text-white dark:bg-white dark:text-black",
                    "shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff]",
                    "hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#000] dark:hover:shadow-[2px_2px_0_0_#fff]"
                )}
                aria-label="Toggle quick actions"
            >
                <motion.div
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                >
                    <Plus className="w-6 h-6" strokeWidth={2} />
                </motion.div>
            </button>
        </div>
    );
};