"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Plus } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import useSWR from "swr";
import { financeService } from "@/services/finance.service";
import { toast } from "react-toastify";

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
        return <div className="p-8 text-center">Cargando presupuesto...</div>;
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
            // Filter only new items that haven't been saved yet
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
                toast.success("Presupuesto actualizado correctamente.");
                mutate(); // Refresh data from backend
            } else {
                toast.info("No hay partidas nuevas para guardar.");
            }
        } catch (error) {
            toast.error("Hubo un error al guardar las partidas.");
            console.error(error);
        } finally {
            setIsSaving(false);
        }
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
                            {isEditing ? currentBudget.name : 'Nuevo Presupuesto'}
                        </h2>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                            Constructor de Presupuesto (Grid)
                        </p>
                    </div>
                </div>
                <Button 
                    onClick={handleSaveChanges}
                    disabled={isSaving}
                    className="rounded-none h-10 px-6 bg-black text-white dark:bg-white dark:text-black border-0 text-[9px] font-bold uppercase tracking-widest disabled:opacity-50"
                >
                    <Save className="w-4 h-4 mr-2" /> {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Ingresos */}
                <div className="border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a]">
                    <div className="p-4 border-b border-black/20 dark:border-white/20 bg-green-50 dark:bg-green-900/10 flex justify-between items-center">
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-green-700 dark:text-green-400">
                            Ingresos Proyectados
                        </h3>
                        <span className="text-sm font-semibold">${currentBudget.totalProjectedIncome?.toLocaleString()}</span>
                    </div>
                    <div className="p-4 space-y-4">
                        {localItems.filter((i: any) => i.type === 'INCOME').map((item: any) => (
                            <div key={item.id} className="flex gap-4">
                                <select 
                                    className="w-1/3 bg-transparent border border-black/20 dark:border-white/20 p-2 text-xs focus:outline-none focus:border-black dark:focus:border-white"
                                    value={item.category}
                                    onChange={(e) => handleItemChange(item.id, 'category', e.target.value)}
                                >
                                    {INCOME_CATEGORIES.map(cat => (
                                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                                    ))}
                                </select>
                                <input 
                                    className="flex-1 bg-transparent border border-black/20 dark:border-white/20 p-2 text-sm focus:outline-none focus:border-black dark:focus:border-white" 
                                    value={item.description || ''}
                                    onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                                    placeholder="Nota o Descripción (Opcional)"
                                />
                                <input 
                                    className="w-28 bg-transparent border border-black/20 dark:border-white/20 p-2 text-sm focus:outline-none focus:border-black dark:focus:border-white text-right" 
                                    type="number"
                                    value={item.projectedAmount || item.amount || ''}
                                    onChange={(e) => handleItemChange(item.id, 'projectedAmount', e.target.value)}
                                    placeholder="0"
                                />
                            </div>
                        ))}
                        <Button 
                            onClick={() => handleAddItem('INCOME')}
                            variant="outline" 
                            className="w-full rounded-none border-dashed border-black/20 dark:border-white/20 text-[9px] font-bold uppercase tracking-widest h-10"
                        >
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
                        <span className="text-sm font-semibold">${currentBudget.totalProjectedExpense?.toLocaleString()}</span>
                    </div>
                    <div className="p-4 space-y-4">
                        {localItems.filter((i: any) => i.type === 'EXPENSE').map((item: any) => (
                            <div key={item.id} className="flex gap-4">
                                <select 
                                    className="w-1/3 bg-transparent border border-black/20 dark:border-white/20 p-2 text-xs focus:outline-none focus:border-black dark:focus:border-white"
                                    value={item.category}
                                    onChange={(e) => handleItemChange(item.id, 'category', e.target.value)}
                                >
                                    {EXPENSE_CATEGORIES.map(cat => (
                                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                                    ))}
                                </select>
                                <input 
                                    className="flex-1 bg-transparent border border-black/20 dark:border-white/20 p-2 text-sm focus:outline-none focus:border-black dark:focus:border-white" 
                                    value={item.description || ''}
                                    onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                                    placeholder="Nota o Descripción (Opcional)"
                                />
                                <input 
                                    className="w-28 bg-transparent border border-black/20 dark:border-white/20 p-2 text-sm focus:outline-none focus:border-black dark:focus:border-white text-right" 
                                    type="number"
                                    value={item.projectedAmount || item.amount || ''}
                                    onChange={(e) => handleItemChange(item.id, 'projectedAmount', e.target.value)}
                                    placeholder="0"
                                />
                            </div>
                        ))}
                        <Button 
                            onClick={() => handleAddItem('EXPENSE')}
                            variant="outline" 
                            className="w-full rounded-none border-dashed border-black/20 dark:border-white/20 text-[9px] font-bold uppercase tracking-widest h-10"
                        >
                            <Plus className="w-3 h-3 mr-2" /> Añadir Gasto
                        </Button>
                    </div>
                </div>
            </div>
            
            <div className="border-t border-black/20 dark:border-white/20 pt-6 text-right">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Utilidad Proyectada</p>
                <h2 className="text-3xl font-semibold tracking-tight text-blue-600 dark:text-blue-400">
                    ${((currentBudget.totalProjectedIncome || 0) - (currentBudget.totalProjectedExpense || 0)).toLocaleString()}
                </h2>
            </div>
        </div>
    );
}
