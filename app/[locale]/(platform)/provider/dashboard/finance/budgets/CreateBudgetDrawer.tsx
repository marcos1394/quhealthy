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
            <SheetContent position="right" size="lg" className="p-0 border-l border-black dark:border-white bg-gray-50 dark:bg-[#050505] flex flex-col h-full rounded-none">
                <SheetHeader className="p-6 border-b border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] shrink-0 text-left">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 border border-black/20 dark:border-white/20 flex items-center justify-center shrink-0">
                                <FileText className="w-5 h-5 text-black dark:text-white" strokeWidth={1.5} />
                            </div>
                            <div>
                                <SheetTitle className="text-xl font-bold uppercase tracking-tight text-black dark:text-white mb-1">
                                    NUEVO PRESUPUESTO
                                </SheetTitle>
                                <SheetDescription className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                                    PLANEACIÓN FINANCIERA
                                </SheetDescription>
                            </div>
                        </div>
                        <SheetClose className="w-10 h-10 border border-transparent hover:border-black/20 dark:hover:border-white/20 flex items-center justify-center transition-colors">
                            <X className="w-5 h-5 text-black dark:text-white" strokeWidth={1.5} />
                        </SheetClose>
                    </div>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    {isLoadingData ? (
                        <div className="flex flex-col items-center justify-center h-40 gap-4">
                            <QhSpinner size="md" />
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Cargando...</p>
                        </div>
                    ) : (
                        <form id="create-budget-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            
                            <div className="space-y-2">
                                <label className="text-[9px] font-bold uppercase tracking-widest text-gray-500">Nombre del Presupuesto *</label>
                                <input 
                                    {...register("name", { required: true })}
                                    className="w-full h-12 px-4 bg-white dark:bg-[#0a0a0a] border border-black/20 dark:border-white/20 text-[10px] font-bold uppercase tracking-widest text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                                    placeholder="Ej. Presupuesto Operativo Q3"
                                />
                                {errors.name && <span className="text-xs text-red-500 font-bold uppercase">REQUERIDO</span>}
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-[9px] font-bold uppercase tracking-widest text-gray-500">Periodo Fiscal *</label>
                                <select 
                                    {...register("periodId", { required: true })}
                                    className="w-full h-12 px-4 bg-white dark:bg-[#0a0a0a] border border-black/20 dark:border-white/20 text-[10px] font-bold uppercase tracking-widest text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                                >
                                    <option value="">SELECCIONAR PERIODO...</option>
                                    {periods.map(p => (
                                        <option key={p.id} value={p.id}>{p.year} - {p.status}</option>
                                    ))}
                                </select>
                                {errors.periodId && <span className="text-xs text-red-500 font-bold uppercase">REQUERIDO</span>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[9px] font-bold uppercase tracking-widest text-gray-500">Centro de Costos</label>
                                <select 
                                    {...register("costCenterId")}
                                    className="w-full h-12 px-4 bg-white dark:bg-[#0a0a0a] border border-black/20 dark:border-white/20 text-[10px] font-bold uppercase tracking-widest text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                                >
                                    <option value="">OPCIONAL - GENERAL</option>
                                    {costCenters.map(cc => (
                                        <option key={cc.id} value={cc.id}>{cc.code} - {cc.name}</option>
                                    ))}
                                </select>
                            </div>
                        </form>
                    )}
                </div>

                <div className="p-6 border-t border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] shrink-0">
                    <button 
                        type="submit"
                        form="create-budget-form"
                        disabled={isSubmitting || isLoadingData}
                        className="w-full h-12 bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-3 border-0 rounded-none disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <><QhSpinner size="sm" className="text-current" /> CREANDO...</>
                        ) : (
                            <><Save className="w-4 h-4" strokeWidth={1.5} /> CONFIRMAR</>
                        )}
                    </button>
                </div>
            </SheetContent>
        </Sheet>
    );
};
