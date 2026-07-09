"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileDown, FileText, Filter, Calendar as CalendarIcon } from "lucide-react";
import { toast } from "react-toastify";
import { QhSpinner } from "@/components/ui/QhSpinner";

export default function FinanceReportsPage() {
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async (type: string) => {
        setIsExporting(true);
        try {
            // TODO: Integrar con endpoint de reporte en backend
            await new Promise(r => setTimeout(r, 1000)); 
            toast.success(`Reporte de ${type} exportado exitosamente`, { theme: "colored" });
        } catch {
            toast.error("Error al exportar reporte", { theme: "colored" });
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-4">
                <div>
                    <h2 className="text-lg font-semibold uppercase tracking-tight">Reportes Financieros</h2>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                        Análisis, auditoría y exportación de datos (PDF/Excel)
                    </p>
                </div>
                <div className="w-10 h-10 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] flex items-center justify-center">
                    <FileText className="w-4 h-4 text-gray-500" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* Estado de Resultados */}
                <div className="border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] p-5 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 flex items-center justify-center bg-black/5 dark:bg-white/5">
                            <FileText className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold">Estado de Resultados</h3>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Ingresos vs Gastos</p>
                        </div>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                        Resumen financiero mensual o anual comparando ingresos reales contra gastos ejecutados.
                    </p>
                    <div className="pt-2">
                        <Button 
                            variant="outline"
                            className="w-full rounded-none h-9 text-[10px] font-bold uppercase tracking-widest gap-2"
                            onClick={() => handleExport("Estado de Resultados")}
                            disabled={isExporting}
                        >
                            <FileDown className="w-3.5 h-3.5" />
                            Descargar Reporte
                        </Button>
                    </div>
                </div>

                {/* Variación Presupuestal */}
                <div className="border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] p-5 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 flex items-center justify-center bg-black/5 dark:bg-white/5">
                            <Filter className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold">Variación Presupuestal</h3>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Proyectado vs Real</p>
                        </div>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                        Análisis detallado por partida de la desviación entre el presupuesto planificado y el gasto real + compromisos.
                    </p>
                    <div className="pt-2">
                        <Button 
                            variant="outline"
                            className="w-full rounded-none h-9 text-[10px] font-bold uppercase tracking-widest gap-2"
                            onClick={() => handleExport("Variación Presupuestal")}
                            disabled={isExporting}
                        >
                            <FileDown className="w-3.5 h-3.5" />
                            Descargar Reporte
                        </Button>
                    </div>
                </div>

                {/* Ejecución Mensual */}
                <div className="border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] p-5 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 flex items-center justify-center bg-black/5 dark:bg-white/5">
                            <CalendarIcon className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold">Flujo de Caja / Calendarización</h3>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Ejecución mes a mes</p>
                        </div>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                        Histórico de ejecución mes a mes, contrastado contra la distribución mensual planificada.
                    </p>
                    <div className="pt-2">
                        <Button 
                            variant="outline"
                            className="w-full rounded-none h-9 text-[10px] font-bold uppercase tracking-widest gap-2"
                            onClick={() => handleExport("Flujo de Caja")}
                            disabled={isExporting}
                        >
                            <FileDown className="w-3.5 h-3.5" />
                            Descargar Reporte
                        </Button>
                    </div>
                </div>

            </div>
        </div>
    );
}
