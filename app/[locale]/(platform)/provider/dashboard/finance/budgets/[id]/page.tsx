"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Plus } from "lucide-react";
import { useRouter, useParams } from "next/navigation";

export default function BudgetBuilderPage() {
    const router = useRouter();
    const params = useParams();
    const isEditing = params.id !== "new";

    // Mock data
    const budget = {
        name: "Presupuesto Operativo 2027",
        totalIncome: 500000,
        totalExpense: 350000,
        items: [
            { id: 1, type: "INCOME", category: "Consultas", amount: 300000 },
            { id: 2, type: "INCOME", category: "Estudios", amount: 200000 },
            { id: 3, type: "EXPENSE", category: "Nómina", amount: 150000 },
            { id: 4, type: "EXPENSE", category: "Marketing", amount: 50000 },
            { id: 5, type: "EXPENSE", category: "Renta", amount: 150000 },
        ]
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-4">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => router.back()}
                        className="w-8 h-8 border border-black/20 dark:border-white/20 flex items-center justify-center hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                        <h2 className="text-lg font-semibold uppercase tracking-tight">
                            {isEditing ? budget.name : 'Nuevo Presupuesto'}
                        </h2>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                            Constructor de Presupuesto (Grid)
                        </p>
                    </div>
                </div>
                <Button className="rounded-none h-10 px-6 bg-black text-white dark:bg-white dark:text-black border-0 text-[9px] font-bold uppercase tracking-widest">
                    <Save className="w-4 h-4 mr-2" /> Guardar Cambios
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Ingresos */}
                <div className="border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a]">
                    <div className="p-4 border-b border-black/20 dark:border-white/20 bg-green-50 dark:bg-green-900/10 flex justify-between items-center">
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-green-700 dark:text-green-400">
                            Ingresos Proyectados
                        </h3>
                        <span className="text-sm font-semibold">${budget.totalIncome.toLocaleString()}</span>
                    </div>
                    <div className="p-4 space-y-4">
                        {budget.items.filter(i => i.type === 'INCOME').map(item => (
                            <div key={item.id} className="flex gap-4">
                                <input 
                                    className="flex-1 bg-transparent border border-black/20 dark:border-white/20 p-2 text-sm focus:outline-none focus:border-black dark:focus:border-white" 
                                    defaultValue={item.category}
                                />
                                <input 
                                    className="w-32 bg-transparent border border-black/20 dark:border-white/20 p-2 text-sm focus:outline-none focus:border-black dark:focus:border-white text-right" 
                                    type="number"
                                    defaultValue={item.amount}
                                />
                            </div>
                        ))}
                        <Button variant="outline" className="w-full rounded-none border-dashed border-black/20 dark:border-white/20 text-[9px] font-bold uppercase tracking-widest h-10">
                            <Plus className="w-3 h-3 mr-2" /> Añadir Ingreso
                        </Button>
                    </div>
                </div>

                {/* Gastos */}
                <div className="border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a]">
                    <div className="p-4 border-b border-black/20 dark:border-white/20 bg-orange-50 dark:bg-orange-900/10 flex justify-between items-center">
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-orange-700 dark:text-orange-400">
                            Gastos Proyectados
                        </h3>
                        <span className="text-sm font-semibold">${budget.totalExpense.toLocaleString()}</span>
                    </div>
                    <div className="p-4 space-y-4">
                        {budget.items.filter(i => i.type === 'EXPENSE').map(item => (
                            <div key={item.id} className="flex gap-4">
                                <input 
                                    className="flex-1 bg-transparent border border-black/20 dark:border-white/20 p-2 text-sm focus:outline-none focus:border-black dark:focus:border-white" 
                                    defaultValue={item.category}
                                />
                                <input 
                                    className="w-32 bg-transparent border border-black/20 dark:border-white/20 p-2 text-sm focus:outline-none focus:border-black dark:focus:border-white text-right" 
                                    type="number"
                                    defaultValue={item.amount}
                                />
                            </div>
                        ))}
                        <Button variant="outline" className="w-full rounded-none border-dashed border-black/20 dark:border-white/20 text-[9px] font-bold uppercase tracking-widest h-10">
                            <Plus className="w-3 h-3 mr-2" /> Añadir Gasto
                        </Button>
                    </div>
                </div>
            </div>
            
            <div className="border-t border-black/20 dark:border-white/20 pt-6 text-right">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Utilidad Proyectada</p>
                <h2 className="text-3xl font-semibold tracking-tight text-blue-600 dark:text-blue-400">
                    ${(budget.totalIncome - budget.totalExpense).toLocaleString()}
                </h2>
            </div>
        </div>
    );
}
