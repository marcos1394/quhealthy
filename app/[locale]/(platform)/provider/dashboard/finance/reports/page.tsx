"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileDown, FileText, Filter, Calendar as CalendarIcon, DownloadCloud } from "lucide-react";
import { toast } from "react-toastify";
import { QhSpinner } from "@/components/ui/QhSpinner";

export default function FinanceReportsPage() {
    const [isExporting, setIsExporting] = useState<string | null>(null);

    const handleExport = async (type: string) => {
        setIsExporting(type);
        try {
            // TODO: Integrar con endpoint de reporte en backend
            await new Promise(r => setTimeout(r, 1500)); 
            toast.success(`Reporte de ${type} exportado exitosamente`, { theme: "colored" });
        } catch {
            toast.error("Error al exportar reporte", { theme: "colored" });
        } finally {
            setIsExporting(null);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-12">
            <div className="flex items-center justify-between pb-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Reportes Financieros</h2>
                    <p className="text-sm font-medium text-gray-500 mt-1">
                        Análisis, auditoría y exportación de datos (PDF/Excel)
                    </p>
                </div>
                <div className="w-12 h-12 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-sm flex items-center justify-center">
                    <DownloadCloud className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* Estado de Resultados */}
                <div className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow group flex flex-col">
                    <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 group-hover:scale-110 transition-transform">
                            <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Estado de Resultados</h3>
                            <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mt-0.5">Ingresos vs Gastos</p>
                        </div>
                    </div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 flex-grow mb-6">
                        Resumen financiero mensual o anual comparando ingresos reales contra gastos ejecutados.
                    </p>
                    <Button 
                        variant="outline"
                        className="w-full rounded-xl h-11 text-sm font-bold border-gray-200 shadow-sm hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 dark:hover:bg-emerald-900/20 dark:hover:border-emerald-800/50 transition-colors gap-2"
                        onClick={() => handleExport("Estado de Resultados")}
                        disabled={isExporting !== null}
                    >
                        {isExporting === "Estado de Resultados" ? (
                            <QhSpinner size="sm" className="w-4 h-4 text-emerald-600" />
                        ) : (
                            <FileDown className="w-4 h-4" />
                        )}
                        {isExporting === "Estado de Resultados" ? "Exportando..." : "Descargar Reporte"}
                    </Button>
                </div>

                {/* Variación Presupuestal */}
                <div className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow group flex flex-col">
                    <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-purple-50 dark:bg-purple-900/20 group-hover:scale-110 transition-transform">
                            <Filter className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Variación Presupuestal</h3>
                            <p className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider mt-0.5">Proyectado vs Real</p>
                        </div>
                    </div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 flex-grow mb-6">
                        Análisis detallado por partida de la desviación entre el presupuesto planificado y el gasto real + compromisos.
                    </p>
                    <Button 
                        variant="outline"
                        className="w-full rounded-xl h-11 text-sm font-bold border-gray-200 shadow-sm hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 dark:hover:bg-emerald-900/20 dark:hover:border-emerald-800/50 transition-colors gap-2"
                        onClick={() => handleExport("Variación Presupuestal")}
                        disabled={isExporting !== null}
                    >
                        {isExporting === "Variación Presupuestal" ? (
                            <QhSpinner size="sm" className="w-4 h-4 text-emerald-600" />
                        ) : (
                            <FileDown className="w-4 h-4" />
                        )}
                        {isExporting === "Variación Presupuestal" ? "Exportando..." : "Descargar Reporte"}
                    </Button>
                </div>

                {/* Ejecución Mensual */}
                <div className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow group flex flex-col">
                    <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-emerald-50 dark:bg-emerald-900/20 group-hover:scale-110 transition-transform">
                            <CalendarIcon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Flujo de Caja</h3>
                            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mt-0.5">Ejecución mes a mes</p>
                        </div>
                    </div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 flex-grow mb-6">
                        Histórico de ejecución mes a mes, contrastado contra la distribución mensual planificada.
                    </p>
                    <Button 
                        variant="outline"
                        className="w-full rounded-xl h-11 text-sm font-bold border-gray-200 shadow-sm hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 dark:hover:bg-emerald-900/20 dark:hover:border-emerald-800/50 transition-colors gap-2"
                        onClick={() => handleExport("Flujo de Caja")}
                        disabled={isExporting !== null}
                    >
                        {isExporting === "Flujo de Caja" ? (
                            <QhSpinner size="sm" className="w-4 h-4 text-emerald-600" />
                        ) : (
                            <FileDown className="w-4 h-4" />
                        )}
                        {isExporting === "Flujo de Caja" ? "Exportando..." : "Descargar Reporte"}
                    </Button>
                </div>

            </div>
        </div>
    );
}
