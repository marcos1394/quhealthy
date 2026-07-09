"use client";

import React, { useEffect, useState } from "react";
import { AlertCircle, TrendingUp, TrendingDown, DollarSign, Activity } from "lucide-react";
import { SummaryCard } from "@/components/dashboard/SummaryCard";
import { Button } from "@/components/ui/button";
import { budgetService, BudgetSummaryDTO } from "@/services/budget.service";
import { toast } from "react-toastify";
import { QhSpinner } from "@/components/ui/QhSpinner";
import Link from "next/link";

export default function FinanceDashboardPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [summary, setSummary] = useState<BudgetSummaryDTO | null>(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // First get all budgets to find the active one
                const budgets = await budgetService.listBudgets();
                
                // Assuming we want to show the active or first budget summary
                const activeBudget = budgets.find(b => b.status === 'ACTIVE' || b.status === 'APPROVED') || budgets[0];
                
                if (activeBudget) {
                    const data = await budgetService.getBudgetSummary(activeBudget.id);
                    setSummary(data);
                }
            } catch (error) {
                toast.error("Error al cargar resumen financiero", { theme: "colored" });
            } finally {
                setIsLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                <QhSpinner size="lg" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                    Calculando analíticas financieras...
                </p>
            </div>
        );
    }

    if (!summary) {
        return (
            <div className="space-y-8 animate-in fade-in duration-500">
                <div className="p-8 text-center border border-dashed border-black/20 dark:border-white/20">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4">NO HAY DATOS FINANCIEROS DISPONIBLES</p>
                    <Link href="/provider/dashboard/finance/budgets">
                        <Button className="rounded-none bg-black text-white dark:bg-white dark:text-black">
                            CREAR PRIMER PRESUPUESTO
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="mb-4">
                <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-500">
                    Mostrando Resumen: <span className="text-black dark:text-white">{summary.name}</span>
                </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-black/20 dark:border-white/20 p-6 bg-white dark:bg-[#0a0a0a]">
                    <div className="flex items-center gap-3 mb-6">
                        <DollarSign className="w-5 h-5 text-green-600" />
                        <h3 className="text-[10px] font-bold uppercase tracking-widest">Metas de Ingreso</h3>
                    </div>
                    <div className="space-y-2">
                        <p className="text-3xl font-semibold tracking-tight">
                            ${(summary.totalActualIncome || 0).toLocaleString()} <span className="text-sm text-gray-500 font-normal">/ ${(summary.totalProjectedIncome || 0).toLocaleString()}</span>
                        </p>
                        <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 mt-4">
                            <div 
                                className="bg-green-600 h-2 transition-all duration-1000"
                                style={{ width: `${Math.min(summary.incomeCompletionPercentage || 0, 100)}%` }}
                            />
                        </div>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 text-right mt-1">
                            {summary.incomeCompletionPercentage || 0}% Alcanzado
                        </p>
                    </div>
                </div>

                <div className="border border-black/20 dark:border-white/20 p-6 bg-white dark:bg-[#0a0a0a]">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <Activity className="w-5 h-5 text-orange-500" />
                            <h3 className="text-[10px] font-bold uppercase tracking-widest">Embudo de Gastos</h3>
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                            Total Autorizado: ${(summary.totalProjectedExpense || 0).toLocaleString()}
                        </p>
                    </div>
                    
                    <div className="space-y-4">
                        {/* Autorizado */}
                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="font-semibold">Presupuesto Autorizado</span>
                                <span className="font-mono">100%</span>
                            </div>
                            <div className="w-full bg-blue-100 h-2">
                                <div className="bg-blue-600 h-2 w-full" />
                            </div>
                        </div>

                        {/* Comprometido */}
                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="font-semibold text-amber-600">Comprometido</span>
                                <span className="font-mono">
                                    ${(summary.totalCommittedExpense || 0).toLocaleString()} 
                                    ({Math.round(((summary.totalCommittedExpense || 0) / (summary.totalProjectedExpense || 1)) * 100)}%)
                                </span>
                            </div>
                            <div className="w-full bg-gray-100 dark:bg-gray-800 h-2">
                                <div 
                                    className="bg-amber-500 h-2 transition-all duration-1000"
                                    style={{ width: `${Math.min(((summary.totalCommittedExpense || 0) / (summary.totalProjectedExpense || 1)) * 100, 100)}%` }}
                                />
                            </div>
                        </div>

                        {/* Ejecutado */}
                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="font-semibold text-orange-600">Ejecutado (Real)</span>
                                <span className="font-mono">
                                    ${(summary.totalActualExpense || 0).toLocaleString()} 
                                    ({Math.round(((summary.totalActualExpense || 0) / (summary.totalProjectedExpense || 1)) * 100)}%)
                                </span>
                            </div>
                            <div className="w-full bg-gray-100 dark:bg-gray-800 h-2">
                                <div 
                                    className="bg-orange-600 h-2 transition-all duration-1000"
                                    style={{ width: `${Math.min(summary.expenseConsumptionPercentage || 0, 100)}%` }}
                                />
                            </div>
                        </div>

                        {/* Disponible */}
                        <div className="pt-2 border-t border-black/10 dark:border-white/10 mt-4">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-green-600">Disponible para Comprometer</span>
                                <span className="text-lg font-bold font-mono text-green-600">
                                    ${((summary.totalProjectedExpense || 0) - (summary.totalCommittedExpense || 0) - (summary.totalActualExpense || 0)).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {summary.alerts && summary.alerts.length > 0 && (
                <div className="border border-red-500/30 bg-red-50 dark:bg-red-900/10 p-6">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-red-600 dark:text-red-400 mb-4 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" /> Alertas Activas
                    </h3>
                    <div className="space-y-3">
                        {summary.alerts.map((alert, idx) => (
                            <div key={idx} className="flex items-start gap-3 bg-white dark:bg-black p-4 border border-red-200 dark:border-red-900/50">
                                <div className={`w-2 h-2 mt-1.5 rounded-full ${alert.type === 'DANGER' ? 'bg-red-500 animate-pulse' : 'bg-orange-500'}`} />
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
                                        [{alert.category}]
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        {alert.message}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
        </div>
    );
}
