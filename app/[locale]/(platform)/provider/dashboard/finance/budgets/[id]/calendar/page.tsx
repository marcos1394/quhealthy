"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CalendarDays, Save, ArrowLeft, RefreshCw } from "lucide-react";
import { budgetService, BudgetLineItemDTO, BudgetMonthlyDistributionDTO } from "@/services/budget.service";

const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

export default function BudgetCalendarPage() {
    const params = useParams();
    const router = useRouter();
    const budgetId = Number(params.id);

    const [lineItems, setLineItems] = useState<BudgetLineItemDTO[]>([]);
    const [distributions, setDistributions] = useState<Record<number, BudgetMonthlyDistributionDTO[]>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        loadData();
    }, [budgetId]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const items = await budgetService.getBudgetLineItems(budgetId);
            setLineItems(items);

            const distMap: Record<number, BudgetMonthlyDistributionDTO[]> = {};
            for (const item of items) {
                const dists = await budgetService.getMonthlyDistribution(item.id);
                if (dists.length === 0) {
                    distMap[item.id] = Array.from({ length: 12 }, (_, i) => ({
                        month: i + 1,
                        projectedAmount: 0,
                        actualAmount: 0,
                        committedAmount: 0
                    }));
                } else {
                    distMap[item.id] = dists;
                }
            }
            setDistributions(distMap);
        } catch (error) {
            toast.error("Error al cargar la calendarización mensual", { theme: "colored" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleAmountChange = (lineItemId: number, monthIndex: number, value: string) => {
        const numValue = parseFloat(value) || 0;
        setDistributions(prev => {
            const updatedItemDists = [...prev[lineItemId]];
            updatedItemDists[monthIndex] = {
                ...updatedItemDists[monthIndex],
                projectedAmount: numValue
            };
            return { ...prev, [lineItemId]: updatedItemDists };
        });
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            for (const item of lineItems) {
                await budgetService.saveMonthlyDistribution(item.id, distributions[item.id]);
            }
            toast.success("Calendarización guardada correctamente", { theme: "colored" });
        } catch {
            toast.error("Error al guardar la calendarización", { theme: "colored" });
        } finally {
            setIsSaving(false);
        }
    };

    const autoDistribute = (lineItemId: number, totalAmount: number) => {
        const monthlyAmount = totalAmount / 12;
        setDistributions(prev => {
            const updated = prev[lineItemId].map(d => ({ ...d, projectedAmount: monthlyAmount }));
            return { ...prev, [lineItemId]: updated };
        });
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                <QhSpinner size="lg" className="text-emerald-600" />
                <p className="text-sm font-semibold text-gray-500 animate-pulse">Cargando distribución mensual...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-6 gap-4">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => router.back()}
                        className="w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-[#111] transition-colors shadow-sm"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Calendarización Mensual</h2>
                        <p className="text-sm font-medium text-gray-500 mt-1">
                            Distribución del presupuesto por mes para el Presupuesto #{budgetId}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button 
                        onClick={handleSave} 
                        disabled={isSaving}
                        className="rounded-xl h-11 px-6 bg-emerald-600 text-white hover:bg-emerald-700 border-0 text-sm font-bold shadow-sm"
                    >
                        {isSaving ? <QhSpinner size="sm" className="mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                        Guardar Cambios
                    </Button>
                    <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 flex items-center justify-center shadow-sm">
                        <CalendarDays className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800">
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-64">Partida</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right w-32">Total Anual</th>
                                {MONTHS.map(m => (
                                    <th key={m} className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right w-28">
                                        {m}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {lineItems.map((item) => {
                                const totalAnual = distributions[item.id]?.reduce((sum, d) => sum + (d.projectedAmount || 0), 0) || 0;
                                const isBalanced = Math.abs(totalAnual - item.projectedAmount) < 0.01;

                                return (
                                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-colors group">
                                        <td className="p-4">
                                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{item.name}</p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm ${
                                                    item.type === 'INCOME' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                                                }`}>
                                                    {item.type === 'INCOME' ? 'Ingreso' : 'Gasto'}
                                                </span>
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    className="h-6 px-2 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                                                    onClick={() => autoDistribute(item.id, item.projectedAmount)}
                                                >
                                                    <RefreshCw className="w-3 h-3 mr-1" />
                                                    Distribuir
                                                </Button>
                                            </div>
                                        </td>
                                        <td className="p-4 text-right align-top">
                                            <p className={`text-sm font-bold font-mono ${!isBalanced ? 'text-amber-600 dark:text-amber-400' : 'text-gray-900 dark:text-white'}`}>
                                                ${totalAnual.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </p>
                                            <p className="text-xs text-gray-500 font-mono mt-1 font-medium">
                                                / ${item.projectedAmount.toLocaleString()}
                                            </p>
                                        </td>
                                        {distributions[item.id]?.map((d, idx) => (
                                            <td key={idx} className="p-3 align-top">
                                                <Input
                                                    type="number"
                                                    value={d.projectedAmount || ''}
                                                    onChange={(e) => handleAmountChange(item.id, idx, e.target.value)}
                                                    className="h-10 text-sm font-mono font-medium text-right rounded-xl border-gray-200 dark:border-gray-800 shadow-sm focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 transition-all bg-white dark:bg-[#0a0a0a]"
                                                    placeholder="0.00"
                                                />
                                            </td>
                                        ))}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {lineItems.length === 0 && (
                        <div className="p-12 text-center text-sm font-semibold text-gray-500">
                            No hay partidas configuradas para este presupuesto
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
