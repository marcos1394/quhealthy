"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Users, Calendar, Settings, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

export const QuickActions = () => {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);

    // 🔥 Textos en "Sentence case" para lectura rápida, manteniendo peso bold
    const actions = [
        { icon: Calendar, label: "Agendar Consulta", href: "/provider/dashboard/appointments?action=new" },
        { icon: Users, label: "Nuevo Paciente", href: "/provider/dashboard/patients?action=new" },
        { icon: FileText, label: "Subir Documento", href: "/provider/dashboard/documents?action=upload" },
        { icon: Settings, label: "Configuración", href: "/provider/store" },
    ];

    return (
        <div className="fixed bottom-6 lg:bottom-10 right-6 lg:right-10 z-50 flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                        transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                        // 🔥 Sombra reducida a 6px para no aplastar el contenido, eliminado el Header
                        className="mb-3 w-72 bg-white dark:bg-[#0a0a0a] border-2 border-black dark:border-white shadow-[6px_6px_0_0_#000] dark:shadow-[6px_6px_0_0_#fff] rounded-none overflow-hidden"
                    >
                        {/* 🔥 Eliminamos la cabecera. El botón principal ya cierra el menú */}
                        
                        {/* Lista de Acciones */}
                        <div className="flex flex-col divide-y divide-black dark:divide-white bg-white dark:bg-[#0a0a0a]">
                            {actions.map((action, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        setIsOpen(false);
                                        router.push(action.href);
                                    }}
                                    // 🔥 Hover simplificado: Inversión total de colores (Binario)
                                    className="w-full flex items-center gap-4 p-4 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors group text-left rounded-none border-0"
                                >
                                    {/* 🔥 Caja de icono que se invierte sola con el grupo */}
                                    <div className="w-9 h-9 border border-current flex items-center justify-center shrink-0 transition-colors">
                                        <action.icon className="w-4 h-4" strokeWidth={2} />
                                    </div>
                                    {/* 🔥 Tipografía mejorada: xs (12px) y tracking-wider. Legibilidad instantánea */}
                                    <span className="text-xs font-black uppercase tracking-wider">
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
                    "border-2 border-black dark:border-white bg-black text-white dark:bg-white dark:text-black",
                    // 🔥 El botón se "hunde" cuando el menú está activo
                    isOpen 
                      ? "shadow-none translate-x-[4px] translate-y-[4px]" 
                      : "shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_#000] dark:hover:shadow-[2px_2px_0_0_#fff]"
                )}
                aria-label="Toggle quick actions"
            >
                <motion.div
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.15, ease: "easeInOut" }}
                >
                    <Plus className="w-6 h-6" strokeWidth={2.5} />
                </motion.div>
            </button>
        </div>
    );
};