"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Settings } from "lucide-react";

export default function SettingsPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-4">
                <div>
                    <h2 className="text-lg font-semibold uppercase tracking-tight">Configuración Financiera</h2>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                        Años fiscales, centros de costo y áreas
                    </p>
                </div>
                <div className="w-10 h-10 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] flex items-center justify-center">
                    <Settings className="w-4 h-4 text-gray-500" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Años Fiscales */}
                <div className="border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a]">
                    <div className="p-4 border-b border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] flex justify-between items-center">
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-700 dark:text-gray-300">
                            Años Fiscales (Periodos)
                        </h3>
                        <Button variant="ghost" size="sm" className="h-6 px-2 text-[9px] uppercase tracking-widest rounded-none">
                            <Plus className="w-3 h-3 mr-1" /> Nuevo
                        </Button>
                    </div>
                    <div className="p-4 space-y-3">
                        <div className="flex justify-between items-center p-3 border border-black/10 dark:border-white/10">
                            <div>
                                <p className="font-semibold text-sm">Año Fiscal 2026</p>
                                <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Ene 1 - Dic 31</p>
                            </div>
                            <span className="px-2 py-1 text-[9px] font-bold uppercase tracking-widest border border-green-500/30 text-green-600 bg-green-50 dark:bg-green-900/10">
                                Activo
                            </span>
                        </div>
                    </div>
                </div>

                {/* Centros de Costo */}
                <div className="border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a]">
                    <div className="p-4 border-b border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] flex justify-between items-center">
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-700 dark:text-gray-300">
                            Centros de Costo (Clínicas)
                        </h3>
                        <Button variant="ghost" size="sm" className="h-6 px-2 text-[9px] uppercase tracking-widest rounded-none">
                            <Plus className="w-3 h-3 mr-1" /> Nuevo
                        </Button>
                    </div>
                    <div className="p-4 space-y-3">
                        <div className="flex justify-between items-center p-3 border border-black/10 dark:border-white/10">
                            <div>
                                <p className="font-semibold text-sm">Clínica Norte</p>
                                <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">CC-001</p>
                            </div>
                        </div>
                        <div className="flex justify-between items-center p-3 border border-black/10 dark:border-white/10">
                            <div>
                                <p className="font-semibold text-sm">Laboratorio Central</p>
                                <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">CC-002</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
