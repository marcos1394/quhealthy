"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, ArrowRight, FileText } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { budgetService, BudgetDTO } from "@/services/budget.service";
import { toast } from "react-toastify";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { CreateBudgetDrawer } from "./CreateBudgetDrawer";

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
                <QhSpinner size="lg" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                    Cargando presupuestos...
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold uppercase tracking-tight">Presupuestos</h2>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                        Planeación financiera por periodo
                    </p>
                </div>
                <Button 
                    onClick={() => setIsDrawerOpen(true)}
                    className="rounded-none h-10 px-6 bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 border-0 text-[9px] font-bold uppercase tracking-widest transition-colors"
                >
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
                                    {budget.status || 'DRAFT'}
                                </span>
                            </div>
                            <h3 className="font-semibold text-sm uppercase tracking-widest mb-1">{budget.name}</h3>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-6">
                                Ingresos: ${budget.totalProjectedIncome?.toLocaleString() || 0} | Gastos: ${budget.totalProjectedExpense?.toLocaleString() || 0}
                            </p>
                        </div>
                        <div className="flex items-center justify-end text-[9px] font-bold uppercase tracking-widest text-gray-400 group-hover:text-black dark:group-hover:text-white transition-colors">
                            VER DETALLE <ArrowRight className="w-3 h-3 ml-2" />
                        </div>
                    </div>
                ))}
                {budgets.length === 0 && (
                    <div className="col-span-full p-8 text-center border border-dashed border-black/20 dark:border-white/20">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">NO HAY PRESUPUESTOS REGISTRADOS</p>
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
