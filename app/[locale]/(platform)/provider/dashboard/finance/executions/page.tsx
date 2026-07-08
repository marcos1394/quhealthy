"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Download, FileText, CheckCircle } from "lucide-react";
import { budgetService, BudgetExecutionLogDTO } from "@/services/budget.service";
import { toast } from "react-toastify";
import { QhSpinner } from "@/components/ui/QhSpinner";

export default function ExecutionsPage() {
    const [executions, setExecutions] = useState<BudgetExecutionLogDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchExecutions = async () => {
            try {
                // Obtenemos los presupuestos para buscar el activo
                const budgets = await budgetService.listBudgets();
                const activeBudget = budgets.find(b => b.status === 'ACTIVE' || b.status === 'APPROVED') || budgets[0];
                
                if (activeBudget) {
                    const data = await budgetService.getExecutionHistory(activeBudget.id);
                    setExecutions(data);
                }
            } catch (error) {
                toast.error("Error al cargar el historial de ejecución", { theme: "colored" });
            } finally {
                setIsLoading(false);
            }
        };
        fetchExecutions();
    }, []);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                <QhSpinner size="lg" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                    Cargando movimientos...
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold uppercase tracking-tight">Ejecución y Facturación</h2>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                        Historial de movimientos reales y CFDI
                    </p>
                </div>
                <Button 
                    onClick={() => toast.info("Módulo de registro manual de movimientos en desarrollo", { theme: "colored" })}
                    className="rounded-none h-10 px-6 bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 border-0 text-[9px] font-bold uppercase tracking-widest transition-colors"
                >
                    <Plus className="w-4 h-4 mr-2" /> Registrar Movimiento
                </Button>
            </div>

            <div className="border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 dark:bg-[#050505] text-[9px] font-bold uppercase tracking-widest text-gray-500 border-b border-black/20 dark:border-white/20">
                        <tr>
                            <th className="px-6 py-4">Fecha</th>
                            <th className="px-6 py-4">Tipo</th>
                            <th className="px-6 py-4">Categoría</th>
                            <th className="px-6 py-4">Descripción</th>
                            <th className="px-6 py-4 text-right">Monto</th>
                            <th className="px-6 py-4 text-center">Factura (CFDI)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {executions.length > 0 ? (
                            executions.map((exec) => (
                                <tr key={exec.id} className="border-b border-black/10 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-[#050505]/50 transition-colors">
                                    <td className="px-6 py-4">
                                        {exec.createdAt ? new Date(exec.createdAt).toLocaleDateString() : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-[9px] font-bold uppercase tracking-widest border ${exec.budgetLineItem?.type === 'INCOME' ? 'border-green-500/30 text-green-600 bg-green-50 dark:bg-green-900/10' : 'border-orange-500/30 text-orange-600 bg-orange-50 dark:bg-orange-900/10'}`}>
                                            {exec.budgetLineItem?.type === 'INCOME' ? 'Ingreso' : 'Gasto'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-semibold">{exec.budgetLineItem?.category || 'Sin categoría'}</td>
                                    <td className="px-6 py-4 text-gray-500">{exec.description}</td>
                                    <td className="px-6 py-4 text-right font-mono">${(exec.amount || 0).toLocaleString()}</td>
                                    <td className="px-6 py-4 text-center">
                                        {exec.cfdiUuid ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <CheckCircle className="w-4 h-4 text-green-600" />
                                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-black/5 dark:hover:bg-white/5 rounded-none" title={`CFDI: ${exec.cfdiUuid}`}>
                                                    <Download className="w-4 h-4 text-gray-500 hover:text-black dark:hover:text-white" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <Button variant="outline" className="h-8 px-4 text-[9px] font-bold uppercase tracking-widest rounded-none border-black/20 dark:border-white/20">
                                                <FileText className="w-3 h-3 mr-2" /> Generar CFDI
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-gray-500 text-[10px] font-bold uppercase tracking-widest border-t border-black/20 dark:border-white/20">
                                    No hay movimientos registrados
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
