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

            // Cargar distribución para cada partida
            const distMap: Record<number, BudgetMonthlyDistributionDTO[]> = {};
            for (const item of items) {
                const dists = await budgetService.getMonthlyDistribution(item.id);
                // Si no hay distribución, inicializamos en 0
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
            // Guardar partida por partida
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
                <QhSpinner size="lg" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Cargando distribución mensual...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-12">
            <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => router.back()}>
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                        <h2 className="text-lg font-semibold uppercase tracking-tight">Calendarización Mensual</h2>
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-8">
                        Distribución del presupuesto por mes para el Presupuesto #{budgetId}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button 
                        onClick={handleSave} 
                        disabled={isSaving}
                        className="rounded-none h-9 text-[10px] font-bold uppercase tracking-widest gap-2"
                    >
                        {isSaving ? <QhSpinner size="sm" /> : <Save className="w-3.5 h-3.5" />}
                        Guardar Cambios
                    </Button>
                    <div className="w-10 h-10 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] flex items-center justify-center">
                        <CalendarDays className="w-4 h-4 text-gray-500" />
                    </div>
                </div>
            </div>

            <div className="border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-[#050505] border-b border-black/20 dark:border-white/20">
                            <th className="p-3 text-[10px] font-bold uppercase tracking-widest text-gray-500 w-64">Partida</th>
                            <th className="p-3 text-[10px] font-bold uppercase tracking-widest text-gray-500 text-right w-32">Total Anual</th>
                            {MONTHS.map(m => (
                                <th key={m} className="p-3 text-[10px] font-bold uppercase tracking-widest text-gray-500 text-right w-24">
                                    {m}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {lineItems.map((item) => {
                            const totalAnual = distributions[item.id]?.reduce((sum, d) => sum + (d.projectedAmount || 0), 0) || 0;
                            const isBalanced = Math.abs(totalAnual - item.projectedAmount) < 0.01;

                            return (
                                <tr key={item.id} className="border-b border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors group">
                                    <td className="p-3">
                                        <p className="text-xs font-semibold uppercase tracking-widest">{item.name}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-widest ${
                                                item.type === 'INCOME' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                                {item.type}
                                            </span>
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="h-5 px-1.5 text-[8px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => autoDistribute(item.id, item.projectedAmount)}
                                            >
                                                <RefreshCw className="w-2.5 h-2.5 mr-1" />
                                                Distribuir
                                            </Button>
                                        </div>
                                    </td>
                                    <td className="p-3 text-right">
                                        <p className={`text-xs font-mono font-bold ${!isBalanced ? 'text-amber-600 dark:text-amber-400' : ''}`}>
                                            ${totalAnual.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </p>
                                        <p className="text-[9px] text-gray-500 font-mono mt-0.5">
                                            / ${item.projectedAmount.toLocaleString()}
                                        </p>
                                    </td>
                                    {distributions[item.id]?.map((d, idx) => (
                                        <td key={idx} className="p-2">
                                            <Input
                                                type="number"
                                                value={d.projectedAmount || ''}
                                                onChange={(e) => handleAmountChange(item.id, idx, e.target.value)}
                                                className="h-8 text-xs font-mono text-right rounded-none border-black/20 focus-visible:ring-0 focus-visible:border-black dark:border-white/20 dark:focus-visible:border-white"
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
                    <div className="p-8 text-center text-[10px] font-bold uppercase tracking-widest text-gray-500 border-t border-dashed border-black/10 dark:border-white/10">
                        No hay partidas configuradas para este presupuesto
                    </div>
                )}
            </div>
        </div>
    );
}
