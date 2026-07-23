"use client"
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Save, X, FileText } from 'lucide-react';
import { toast } from 'react-toastify';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose } from '@/components/ui/sheet';
import { QhSpinner } from '@/components/ui/QhSpinner';
import { budgetService, BudgetRequestDTO } from '@/services/budget.service';
import { financeService, BudgetPeriodDTO } from '@/services/finance.service';
import { accountingService } from '@/services/accounting.service';
import { CostCenterDTO } from '@/types/accounting';

interface CreateBudgetForm {
    name: string;
    periodId: string;
    costCenterId: string;
}

export const CreateBudgetDrawer = ({
    open,
    onOpenChange,
    onSuccess
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}) => {
    const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateBudgetForm>();
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Select data
    const [periods, setPeriods] = useState<BudgetPeriodDTO[]>([]);
    const [costCenters, setCostCenters] = useState<CostCenterDTO[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(false);

    useEffect(() => {
        if (open) {
            const loadData = async () => {
                setIsLoadingData(true);
                try {
                    const [periodsData, costCentersData] = await Promise.all([
                        financeService.listBudgetPeriods(),
                        accountingService.listCostCenters()
                    ]);
                    setPeriods(periodsData);
                    setCostCenters(costCentersData);
                } catch (error) {
                    toast.error("Error al cargar catálogos", { theme: "colored" });
                } finally {
                    setIsLoadingData(false);
                }
            };
            loadData();
        }
    }, [open]);

    const onSubmit = async (data: CreateBudgetForm) => {
        setIsSubmitting(true);
        try {
            const payload: BudgetRequestDTO = {
                name: data.name,
                periodId: Number(data.periodId),
                costCenterId: data.costCenterId ? Number(data.costCenterId) : null,
            };
            
            await budgetService.createBudget(payload);
            toast.success("Presupuesto creado correctamente", { theme: "colored" });
            reset();
            onSuccess();
            onOpenChange(false);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Error al crear el presupuesto", { theme: "colored" });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent position="right" size="lg" className="p-0 border-l border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] flex flex-col h-full sm:rounded-l-3xl shadow-2xl">
                <SheetHeader className="p-8 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shrink-0 text-left rounded-tl-3xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 flex items-center justify-center shrink-0 shadow-sm">
                                <FileText className="w-6 h-6 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                            </div>
                            <div>
                                <SheetTitle className="text-2xl font-bold text-gray-900 dark:text-white leading-none">
                                    Nuevo Presupuesto
                                </SheetTitle>
                                <SheetDescription className="text-sm font-medium text-gray-500 mt-1">
                                    Planeación financiera
                                </SheetDescription>
                            </div>
                        </div>
                        <SheetClose className="w-10 h-10 rounded-full border border-gray-200 hover:border-gray-300 dark:border-gray-800 dark:hover:border-gray-700 bg-white dark:bg-[#0a0a0a] hover:bg-gray-50 dark:hover:bg-[#111] flex items-center justify-center transition-colors shadow-sm">
                            <X className="w-5 h-5 text-gray-500" strokeWidth={2} />
                        </SheetClose>
                    </div>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    {isLoadingData ? (
                        <div className="flex flex-col items-center justify-center h-40 gap-4">
                            <QhSpinner size="md" className="text-emerald-600" />
                            <p className="text-sm font-medium text-gray-500">Cargando...</p>
                        </div>
                    ) : (
                        <form id="create-budget-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Nombre del Presupuesto *</label>
                                <input 
                                    {...register("name", { required: true })}
                                    className="w-full h-12 px-4 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
                                    placeholder="Ej. Presupuesto Operativo Q3"
                                />
                                {errors.name && <span className="text-xs text-red-500 font-semibold">Este campo es requerido</span>}
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Periodo Fiscal *</label>
                                <select 
                                    {...register("periodId", { required: true })}
                                    className="w-full h-12 px-4 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
                                >
                                    <option value="">Seleccionar periodo...</option>
                                    {periods.map(p => (
                                        <option key={p.id} value={p.id}>{p.year} - {p.status}</option>
                                    ))}
                                </select>
                                {errors.periodId && <span className="text-xs text-red-500 font-semibold">Este campo es requerido</span>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Centro de Costos (Opcional)</label>
                                <select 
                                    {...register("costCenterId")}
                                    className="w-full h-12 px-4 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
                                >
                                    <option value="">General</option>
                                    {costCenters.map(cc => (
                                        <option key={cc.id} value={cc.id}>{cc.code} - {cc.name}</option>
                                    ))}
                                </select>
                            </div>
                        </form>
                    )}
                </div>

                <div className="p-8 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shrink-0 rounded-bl-3xl">
                    <button 
                        type="submit"
                        form="create-budget-form"
                        disabled={isSubmitting || isLoadingData}
                        className="w-full h-12 bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-sm font-bold flex items-center justify-center gap-2 border-0 rounded-xl shadow-sm disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <><QhSpinner size="sm" className="text-current" /> Creando...</>
                        ) : (
                            <><Save className="w-5 h-5" strokeWidth={2} /> Confirmar</>
                        )}
                    </button>
                </div>
            </SheetContent>
        </Sheet>
    );
};
