"use client";

import React, { useEffect, useState } from "react";
import { AlertCircle, DollarSign, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { budgetService, BudgetSummaryDTO } from "@/services/budget.service";
import { toast } from "react-toastify";
import { QhSpinner } from "@/components/ui/QhSpinner";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function FinanceDashboardPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [summary, setSummary] = useState<BudgetSummaryDTO | null>(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // First get all budgets to find the active one
                const budgets = await budgetService.listBudgets();
                
                // Assuming we want to show the active or first budget summary
                const activeBudget = budgets.find(b => b.status === 'ACTIVE') || budgets[0];
                
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
                <QhSpinner size="lg" className="text-emerald-600" />
                <p className="text-sm font-semibold text-gray-500 animate-pulse">
                    Calculando analíticas financieras...
                </p>
            </div>
        );
    }

    if (!summary) {
        return (
            <div className="space-y-8 animate-in fade-in duration-500">
                <div className="p-12 text-center border border-dashed border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0a0a0a] rounded-3xl shadow-sm">
                    <p className="text-sm font-semibold text-gray-500 mb-6">No hay datos financieros disponibles</p>
                    <Link href="/provider/dashboard/finance/budgets">
                        <Button className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 font-bold px-6 shadow-sm">
                            Crear primer presupuesto
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-16">
            <div className="mb-4 bg-white dark:bg-[#0a0a0a] rounded-2xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm inline-flex items-center gap-2">
                <h2 className="text-sm font-medium text-gray-500">
                    Mostrando Resumen: <span className="font-bold text-emerald-700 dark:text-emerald-400">{summary.name}</span>
                </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Ingresos */}
                <div className="border border-gray-200 dark:border-gray-800 p-8 bg-white dark:bg-[#0a0a0a] rounded-3xl shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-800/50">
                            <DollarSign className="w-6 h-6 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Metas de Ingreso</h3>
                    </div>
                    <div className="space-y-3">
                        <p className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
                            ${(summary.totalActualIncome || 0).toLocaleString()} 
                            <span className="text-lg text-gray-400 font-medium ml-2">/ ${(summary.totalProjectedIncome || 0).toLocaleString()}</span>
                        </p>
                        <div className="w-full bg-gray-100 dark:bg-gray-800 h-3 rounded-full overflow-hidden mt-6 shadow-inner">
                            <div 
                                className="bg-emerald-500 h-full rounded-full transition-all duration-1000"
                                style={{ width: `${Math.min(summary.incomeCompletionPercentage || 0, 100)}%` }}
                            />
                        </div>
                        <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 text-right mt-2">
                            {summary.incomeCompletionPercentage || 0}% Alcanzado
                        </p>
                    </div>
                </div>

                {/* Gastos */}
                <div className="border border-gray-200 dark:border-gray-800 p-8 bg-white dark:bg-[#0a0a0a] rounded-3xl shadow-sm transition-all hover:shadow-md flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center shrink-0 border border-orange-100 dark:border-orange-800/50">
                                <Activity className="w-6 h-6 text-orange-500" strokeWidth={2} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Embudo de Gastos</h3>
                        </div>
                        <p className="text-xs font-bold bg-gray-100 dark:bg-[#111] px-3 py-1.5 rounded-lg text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-800">
                            Total: ${(summary.totalProjectedExpense || 0).toLocaleString()}
                        </p>
                    </div>
                    
                    <div className="space-y-5 flex-1">
                        {/* Autorizado */}
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="font-semibold text-gray-700 dark:text-gray-300">Presupuesto Autorizado</span>
                                <span className="font-mono text-gray-500">100%</span>
                            </div>
                            <div className="w-full bg-blue-100 h-2.5 rounded-full overflow-hidden">
                                <div className="bg-blue-500 h-full w-full rounded-full" />
                            </div>
                        </div>

                        {/* Comprometido */}
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="font-semibold text-amber-600">Comprometido</span>
                                <span className="font-mono text-amber-600/80">
                                    ${(summary.totalCommittedExpense || 0).toLocaleString()} 
                                    <span className="ml-1 text-xs">({Math.round(((summary.totalCommittedExpense || 0) / (summary.totalProjectedExpense || 1)) * 100)}%)</span>
                                </span>
                            </div>
                            <div className="w-full bg-gray-100 dark:bg-gray-800 h-2.5 rounded-full overflow-hidden shadow-inner">
                                <div 
                                    className="bg-amber-500 h-full rounded-full transition-all duration-1000"
                                    style={{ width: `${Math.min(((summary.totalCommittedExpense || 0) / (summary.totalProjectedExpense || 1)) * 100, 100)}%` }}
                                />
                            </div>
                        </div>

                        {/* Ejecutado */}
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="font-semibold text-orange-600">Ejecutado (Real)</span>
                                <span className="font-mono text-orange-600/80">
                                    ${(summary.totalActualExpense || 0).toLocaleString()} 
                                    <span className="ml-1 text-xs">({Math.round(((summary.totalActualExpense || 0) / (summary.totalProjectedExpense || 1)) * 100)}%)</span>
                                </span>
                            </div>
                            <div className="w-full bg-gray-100 dark:bg-gray-800 h-2.5 rounded-full overflow-hidden shadow-inner">
                                <div 
                                    className="bg-orange-500 h-full rounded-full transition-all duration-1000"
                                    style={{ width: `${Math.min(summary.expenseConsumptionPercentage || 0, 100)}%` }}
                                />
                            </div>
                        </div>

                        {/* Disponible */}
                        <div className="pt-4 border-t border-gray-100 dark:border-gray-800 mt-auto">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-bold text-emerald-600">Disponible para Comprometer</span>
                                <span className="text-xl font-bold font-mono text-emerald-600">
                                    ${((summary.totalProjectedExpense || 0) - (summary.totalCommittedExpense || 0) - (summary.totalActualExpense || 0)).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {summary.alerts && summary.alerts.length > 0 && (
                <div className="border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/10 p-8 rounded-3xl shadow-sm">
                    <h3 className="text-lg font-bold text-red-700 dark:text-red-400 mb-6 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5" strokeWidth={2} /> Alertas Activas
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {summary.alerts.map((alert, idx) => (
                            <div key={idx} className="flex items-start gap-4 bg-white dark:bg-[#0a0a0a] p-5 border border-red-100 dark:border-red-900/30 rounded-2xl shadow-sm">
                                <div className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border",
                                    alert.type === 'DANGER' 
                                        ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/50 text-red-500" 
                                        : "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800/50 text-orange-500"
                                )}>
                                    <AlertCircle className={cn("w-5 h-5", alert.type === 'DANGER' && "animate-pulse")} strokeWidth={2} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-500 mb-1">
                                        {alert.category}
                                    </p>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white leading-snug">
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
