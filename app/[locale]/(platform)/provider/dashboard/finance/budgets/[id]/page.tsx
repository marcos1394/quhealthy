"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Plus } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import useSWR from "swr";
import { financeService } from "@/services/finance.service";
import { toast } from "react-toastify";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const INCOME_CATEGORIES = [
    { value: 'CONSULTATIONS', label: 'Consultas Médicas' },
    { value: 'SURGERIES_AND_PROCEDURES', label: 'Cirugías y Procedimientos' },
    { value: 'LABORATORY', label: 'Laboratorio y Diagnóstico' },
    { value: 'PHARMACY', label: 'Venta de Farmacia' },
    { value: 'HOSPITALIZATION', label: 'Hospitalización' },
    { value: 'IMAGING', label: 'Imagenología / Rayos X' },
    { value: 'OTHER_INCOME', label: 'Otros Ingresos' },
];

const EXPENSE_CATEGORIES = [
    { value: 'PAYROLL_MEDICAL', label: 'Nómina Médica' },
    { value: 'PAYROLL_ADMIN', label: 'Nómina Administrativa' },
    { value: 'MEDICAL_SUPPLIES', label: 'Insumos Médicos / Quirúrgicos' },
    { value: 'PHARMACEUTICALS', label: 'Compra de Medicamentos' },
    { value: 'EQUIPMENT_MAINTENANCE', label: 'Mantenimiento de Equipo Médico' },
    { value: 'RENT', label: 'Renta / Arrendamientos' },
    { value: 'UTILITIES', label: 'Servicios Básicos (Agua, Luz)' },
    { value: 'MARKETING', label: 'Publicidad y RR.PP.' },
    { value: 'INSURANCE_AND_MALPRACTICE', label: 'Seguros y Responsabilidad Civil' },
    { value: 'TAXES', label: 'Impuestos' },
    { value: 'OTHER_EXPENSE', label: 'Otros Gastos Operativos' },
];

export default function BudgetBuilderPage() {
    const router = useRouter();
    const params = useParams();
    const isEditing = params.id !== "new";

    const { data: budget, isLoading, mutate } = useSWR(
        isEditing ? ['budget', params.id] : null,
        () => financeService.getBudget(params.id as string)
    );

    const [localItems, setLocalItems] = useState<any[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (budget && budget.items) {
            setLocalItems(budget.items);
        }
    }, [budget]);

    if (isLoading) {
        return <div className="p-8 text-center text-gray-500 font-medium">Cargando presupuesto...</div>;
    }

    const currentBudget = budget || {
        name: "Nuevo Presupuesto",
        totalProjectedIncome: 0,
        totalProjectedExpense: 0,
        items: []
    };

    const handleAddItem = (type: 'INCOME' | 'EXPENSE') => {
        setLocalItems([...localItems, {
            id: `new-${Date.now()}`,
            type,
            category: type === 'INCOME' ? 'CONSULTATIONS' : 'OTHER_EXPENSE',
            description: '',
            projectedAmount: 0
        }]);
    };

    const handleItemChange = (id: string | number, field: string, value: any) => {
        setLocalItems(localItems.map(item => item.id === id ? { ...item, [field]: value } : item));
    };

    const handleSaveChanges = async () => {
        setIsSaving(true);
        try {
            const newItems = localItems.filter(item => typeof item.id === 'string' && item.id.startsWith('new-'));
            
            for (const item of newItems) {
                await financeService.addBudgetLineItem(params.id as string, {
                    type: item.type,
                    category: item.category,
                    description: item.description || 'N/A',
                    projectedAmount: Number(item.projectedAmount)
                });
            }

            if (newItems.length > 0) {
                toast.success("Presupuesto actualizado correctamente.", { theme: "colored" });
                mutate(); 
            } else {
                toast.info("No hay partidas nuevas para guardar.", { theme: "colored" });
            }
        } catch (error) {
            toast.error("Hubo un error al guardar las partidas.", { theme: "colored" });
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    const utility = (currentBudget.totalProjectedIncome || 0) - (currentBudget.totalProjectedExpense || 0);

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-16">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-6 gap-4">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => router.back()}
                        className="w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-[#111] transition-colors shadow-sm"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            {isEditing ? currentBudget.name : 'Nuevo Presupuesto'}
                        </h2>
                        <p className="text-sm font-medium text-gray-500">
                            Constructor de Presupuesto (Grid)
                        </p>
                    </div>
                </div>
                <div className="flex gap-3">
                    {isEditing && (
                        <Button 
                            onClick={() => router.push(`/provider/dashboard/finance/budgets/${params.id}/calendar`)}
                            variant="outline"
                            className="rounded-xl h-11 px-6 text-sm font-bold border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 shadow-sm"
                        >
                            Calendarizar
                        </Button>
                    )}
                    <Button 
                        onClick={handleSaveChanges}
                        disabled={isSaving}
                        className="rounded-xl h-11 px-6 bg-emerald-600 text-white hover:bg-emerald-700 border-0 text-sm font-bold shadow-sm disabled:opacity-50"
                    >
                        <Save className="w-4 h-4 mr-2" /> {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Ingresos */}
                <div className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] rounded-3xl overflow-hidden shadow-sm flex flex-col">
                    <div className="p-6 border-b border-emerald-100 dark:border-emerald-900/30 bg-emerald-50 dark:bg-emerald-900/10 flex justify-between items-center">
                        <h3 className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                            Ingresos Proyectados
                        </h3>
                        <span className="text-lg font-bold text-emerald-800 dark:text-emerald-300">
                            ${currentBudget.totalProjectedIncome?.toLocaleString()}
                        </span>
                    </div>
                    <div className="p-6 space-y-4 flex-1">
                        {localItems.filter((i: any) => i.type === 'INCOME').map((item: any) => (
                            <div key={item.id} className="flex gap-3 items-center">
                                <div className="w-1/3">
                                    <Select 
                                        value={item.category} 
                                        onValueChange={(value) => handleItemChange(item.id, 'category', value)}
                                    >
                                        <SelectTrigger className="w-full bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-gray-800 h-11 px-4 text-sm font-medium rounded-xl shadow-sm focus:ring-emerald-500/20 focus:border-emerald-500">
                                            <SelectValue placeholder="Categoría" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-lg">
                                            {INCOME_CATEGORIES.map(cat => (
                                                <SelectItem key={cat.value} value={cat.value} className="text-sm font-medium">{cat.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <input 
                                    className="flex-1 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 h-11 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 rounded-xl shadow-sm" 
                                    value={item.description || ''}
                                    onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                                    placeholder="Nota o Descripción (Opcional)"
                                />
                                <div className="relative w-32 shrink-0">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
                                    <input 
                                        className="w-full bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 h-11 pl-7 pr-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 rounded-xl shadow-sm text-right font-mono" 
                                        type="number"
                                        value={item.projectedAmount || item.amount || ''}
                                        onChange={(e) => handleItemChange(item.id, 'projectedAmount', e.target.value)}
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        ))}
                        <Button 
                            onClick={() => handleAddItem('INCOME')}
                            variant="outline" 
                            className="w-full rounded-xl border-dashed border-gray-300 dark:border-gray-700 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-900/20 dark:hover:text-emerald-400 hover:border-emerald-200 h-12 shadow-sm transition-colors mt-2"
                        >
                            <Plus className="w-4 h-4 mr-2" /> Añadir Ingreso
                        </Button>
                    </div>
                </div>

                {/* Gastos */}
                <div className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] rounded-3xl overflow-hidden shadow-sm flex flex-col">
                    <div className="p-6 border-b border-orange-100 dark:border-orange-900/30 bg-orange-50 dark:bg-orange-900/10 flex justify-between items-center">
                        <h3 className="text-sm font-bold text-orange-700 dark:text-orange-400">
                            Gastos Proyectados
                        </h3>
                        <span className="text-lg font-bold text-orange-800 dark:text-orange-300">
                            ${currentBudget.totalProjectedExpense?.toLocaleString()}
                        </span>
                    </div>
                    <div className="p-6 space-y-4 flex-1">
                        {localItems.filter((i: any) => i.type === 'EXPENSE').map((item: any) => (
                            <div key={item.id} className="flex gap-3 items-center">
                                <div className="w-1/3">
                                    <Select 
                                        value={item.category} 
                                        onValueChange={(value) => handleItemChange(item.id, 'category', value)}
                                    >
                                        <SelectTrigger className="w-full bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-gray-800 h-11 px-4 text-sm font-medium rounded-xl shadow-sm focus:ring-emerald-500/20 focus:border-emerald-500">
                                            <SelectValue placeholder="Categoría" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-lg">
                                            {EXPENSE_CATEGORIES.map(cat => (
                                                <SelectItem key={cat.value} value={cat.value} className="text-sm font-medium">{cat.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <input 
                                    className="flex-1 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 h-11 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 rounded-xl shadow-sm" 
                                    value={item.description || ''}
                                    onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                                    placeholder="Nota o Descripción (Opcional)"
                                />
                                <div className="relative w-32 shrink-0">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
                                    <input 
                                        className="w-full bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 h-11 pl-7 pr-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 rounded-xl shadow-sm text-right font-mono" 
                                        type="number"
                                        value={item.projectedAmount || item.amount || ''}
                                        onChange={(e) => handleItemChange(item.id, 'projectedAmount', e.target.value)}
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        ))}
                        <Button 
                            onClick={() => handleAddItem('EXPENSE')}
                            variant="outline" 
                            className="w-full rounded-xl border-dashed border-gray-300 dark:border-gray-700 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-orange-50 hover:text-orange-700 dark:hover:bg-orange-900/20 dark:hover:text-orange-400 hover:border-orange-200 h-12 shadow-sm transition-colors mt-2"
                        >
                            <Plus className="w-4 h-4 mr-2" /> Añadir Gasto
                        </Button>
                    </div>
                </div>
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-800 pt-8 flex justify-end">
                <div className="bg-white dark:bg-[#0a0a0a] p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm text-right inline-block">
                    <p className="text-sm font-semibold text-gray-500 mb-1">Utilidad Proyectada</p>
                    <h2 className={cn(
                        "text-4xl font-bold tracking-tight",
                        utility >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                    )}>
                        ${utility.toLocaleString()}
                    </h2>
                </div>
            </div>
        </div>
    );
}
