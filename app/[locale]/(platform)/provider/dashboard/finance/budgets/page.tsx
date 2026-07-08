"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, ArrowRight, FileText } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function BudgetsPage() {
    const router = useRouter();

    // Mock data
    const budgets = [
        { id: 1, name: "Presupuesto Operativo 2027", status: "APPROVED", totalProjectedIncome: 500000, totalProjectedExpense: 350000 },
        { id: 2, name: "Presupuesto Q3 2026", status: "CLOSED", totalProjectedIncome: 120000, totalProjectedExpense: 90000 },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold uppercase tracking-tight">Presupuestos</h2>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                        Planeación financiera por periodo
                    </p>
                </div>
                <Button className="rounded-none h-10 px-6 bg-black text-white dark:bg-white dark:text-black border-0 text-[9px] font-bold uppercase tracking-widest">
                    <Plus className="w-4 h-4 mr-2" /> Nuevo Presupuesto
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {budgets.map((budget) => (
                    <div 
                        key={budget.id} 
                        className="border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] p-6 hover:border-black dark:hover:border-white transition-colors cursor-pointer group flex flex-col justify-between"
                        onClick={() => router.push(`/provider/dashboard/finance/budgets/${budget.id}`)}
                    >
                        <div>
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-10 h-10 border border-black/10 dark:border-white/10 bg-gray-50 dark:bg-[#050505] flex items-center justify-center">
                                    <FileText className="w-4 h-4" />
                                </div>
                                <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 border ${budget.status === 'APPROVED' ? 'border-green-500/30 text-green-600 bg-green-50 dark:bg-green-900/10' : 'border-gray-500/30 text-gray-500'}`}>
                                    {budget.status}
                                </span>
                            </div>
                            <h3 className="font-semibold text-sm uppercase tracking-widest mb-1">{budget.name}</h3>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-6">
                                Ingresos: ${budget.totalProjectedIncome.toLocaleString()} | Gastos: ${budget.totalProjectedExpense.toLocaleString()}
                            </p>
                        </div>
                        <div className="flex items-center justify-end text-[9px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-black dark:group-hover:text-white transition-colors">
                            VER DETALLE <ArrowRight className="w-3 h-3 ml-2" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
