"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, ArrowRight, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { budgetService, BudgetDTO } from "@/services/budget.service";
import { toast } from "react-toastify";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { CreateBudgetDrawer } from "./CreateBudgetDrawer";
import { cn } from "@/lib/utils";

export default function BudgetsPage() {
    const router = useRouter();
    const [budgets, setBudgets] = useState<BudgetDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const fetchBudgets = async () => {
        setIsLoading(true);
        try {
            const data = await budgetService.listBudgets();
            setBudgets(data);
        } catch (error) {
            toast.error("Error al cargar presupuestos", { theme: "colored" });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBudgets();
    }, []);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                <QhSpinner size="lg" className="text-emerald-600" />
                <p className="text-sm font-semibold text-gray-500 animate-pulse">
                    Cargando presupuestos...
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-16">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0a0a0a] p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Presupuestos</h2>
                    <p className="text-sm font-medium text-gray-500 mt-1">
                        Planeación financiera por periodo
                    </p>
                </div>
                <Button 
                    onClick={() => setIsDrawerOpen(true)}
                    className="rounded-xl h-11 px-6 bg-emerald-600 text-white hover:bg-emerald-700 border-0 text-sm font-bold shadow-sm flex items-center shrink-0"
                >
                    <Plus className="w-5 h-5 mr-2" /> Nuevo Presupuesto
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {budgets.map((budget) => (
                    <div 
                        key={budget.id} 
                        className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-6 rounded-3xl shadow-sm hover:shadow-md hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all cursor-pointer group flex flex-col justify-between h-full"
                        onClick={() => router.push(`/provider/dashboard/finance/budgets/${budget.id}`)}
                    >
                        <div>
                            <div className="flex items-start justify-between mb-5">
                                <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 flex items-center justify-center shadow-sm group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/20 group-hover:border-emerald-100 dark:group-hover:border-emerald-800/50 transition-colors">
                                    <FileText className="w-5 h-5 text-gray-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
                                </div>
                                <span className={cn(
                                    "px-3 py-1 text-xs font-bold rounded-full shadow-sm border",
                                    budget.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700 border-emerald-200/50 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50' : 
                                    budget.status === 'SUPERSEDED' ? 'bg-amber-100 text-amber-700 border-amber-200/50 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50' :
                                    budget.status === 'CLOSED' ? 'bg-red-100 text-red-700 border-red-200/50 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50' :
                                    budget.status === 'ARCHIVED' ? 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-[#111] dark:text-gray-300 dark:border-gray-800' :
                                    'bg-blue-100 text-blue-700 border-blue-200/50 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/50'
                                )}>
                                    {budget.status === 'ACTIVE' ? 'Activo' : budget.status || 'Borrador'}
                                </span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                {budget.name} <span className="text-xs font-medium text-gray-400 ml-1">v{budget.version || 1}</span>
                            </h3>
                            <div className="space-y-1.5 mb-6">
                                <p className="text-sm font-medium text-gray-500 flex justify-between">
                                    <span>Ingresos:</span> <span className="font-semibold text-gray-700 dark:text-gray-300">${budget.totalProjectedIncome?.toLocaleString() || 0}</span>
                                </p>
                                <p className="text-sm font-medium text-gray-500 flex justify-between">
                                    <span>Gastos:</span> <span className="font-semibold text-gray-700 dark:text-gray-300">${budget.totalProjectedExpense?.toLocaleString() || 0}</span>
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center justify-end text-sm font-bold text-gray-400 group-hover:text-emerald-600 transition-colors mt-4">
                            Ver detalle <ArrowRight className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-1" />
                        </div>
                    </div>
                ))}
                {budgets.length === 0 && (
                    <div className="col-span-full p-12 text-center border border-dashed border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0a0a0a] rounded-3xl shadow-sm">
                        <p className="text-sm font-semibold text-gray-500">No hay presupuestos registrados</p>
                    </div>
                )}
            </div>

            <CreateBudgetDrawer 
                open={isDrawerOpen} 
                onOpenChange={setIsDrawerOpen} 
                onSuccess={fetchBudgets} 
            />
        </div>
    );
}
