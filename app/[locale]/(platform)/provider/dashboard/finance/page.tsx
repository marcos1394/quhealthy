"use client";

import React, { useEffect, useState } from "react";
import { AlertCircle, TrendingUp, TrendingDown, DollarSign, Activity } from "lucide-react";
import { SummaryCard } from "@/components/dashboard/SummaryCard";
import { Button } from "@/components/ui/button";

export default function FinanceDashboardPage() {
    const [isLoading, setIsLoading] = useState(false);
    
    // Mock data temporal mientras conectamos a GET /api/analytics/budgets/{id}/summary
    const summary = {
        totalProjectedIncome: 500000,
        totalActualIncome: 120000,
        incomeCompletionPercentage: 24.0,
        totalProjectedExpense: 350000,
        totalActualExpense: 90000,
        expenseConsumptionPercentage: 25.7,
        alerts: [
            { category: "Marketing", type: "WARNING", message: "La partida Marketing ha consumido el 92% de su presupuesto." },
            { category: "Insumos Médicos", type: "DANGER", message: "La partida Insumos Médicos ha excedido su presupuesto en 105%." }
        ]
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-black/20 dark:border-white/20 p-6 bg-white dark:bg-[#0a0a0a]">
                    <div className="flex items-center gap-3 mb-6">
                        <DollarSign className="w-5 h-5 text-green-600" />
                        <h3 className="text-[10px] font-bold uppercase tracking-widest">Metas de Ingreso</h3>
                    </div>
                    <div className="space-y-2">
                        <p className="text-3xl font-semibold tracking-tight">
                            ${summary.totalActualIncome.toLocaleString()} <span className="text-sm text-gray-500 font-normal">/ ${summary.totalProjectedIncome.toLocaleString()}</span>
                        </p>
                        <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 mt-4">
                            <div 
                                className="bg-green-600 h-2 transition-all duration-1000"
                                style={{ width: `${Math.min(summary.incomeCompletionPercentage, 100)}%` }}
                            />
                        </div>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 text-right mt-1">
                            {summary.incomeCompletionPercentage}% Alcanzado
                        </p>
                    </div>
                </div>

                <div className="border border-black/20 dark:border-white/20 p-6 bg-white dark:bg-[#0a0a0a]">
                    <div className="flex items-center gap-3 mb-6">
                        <Activity className="w-5 h-5 text-orange-500" />
                        <h3 className="text-[10px] font-bold uppercase tracking-widest">Consumo de Presupuesto (Gastos)</h3>
                    </div>
                    <div className="space-y-2">
                        <p className="text-3xl font-semibold tracking-tight">
                            ${summary.totalActualExpense.toLocaleString()} <span className="text-sm text-gray-500 font-normal">/ ${summary.totalProjectedExpense.toLocaleString()}</span>
                        </p>
                        <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 mt-4 flex">
                            <div 
                                className="bg-orange-500 h-2 transition-all duration-1000"
                                style={{ width: `${Math.min(summary.expenseConsumptionPercentage, 100)}%` }}
                            />
                        </div>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 text-right mt-1">
                            {summary.expenseConsumptionPercentage}% Consumido
                        </p>
                    </div>
                </div>
            </div>

            {summary.alerts.length > 0 && (
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
