"use client"
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Save, X, Calendar } from 'lucide-react';
import { toast } from 'react-toastify';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose } from '@/components/ui/sheet';
import { QhSpinner } from '@/components/ui/QhSpinner';
import { financeService } from '@/services/finance.service';

interface CreateFiscalYearForm {
    year: number;
}

export const CreateFiscalYearDrawer = ({
    open,
    onOpenChange,
    onSuccess
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}) => {
    const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateFiscalYearForm>({
        defaultValues: {
            year: new Date().getFullYear()
        }
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const onSubmit = async (data: CreateFiscalYearForm) => {
        setIsSubmitting(true);
        try {
            await financeService.createBudgetPeriod(Number(data.year));
            toast.success(`Año Fiscal ${data.year} creado correctamente`, { theme: "colored" });
            reset();
            onSuccess();
            onOpenChange(false);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Error al crear el año fiscal", { theme: "colored" });
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
                                <Calendar className="w-5 h-5 text-black dark:text-white" strokeWidth={1.5} />
                            </div>
                            <div>
                                <SheetTitle className="text-xl font-bold uppercase tracking-tight text-black dark:text-white mb-1">
                                    NUEVO AÑO FISCAL
                                </SheetTitle>
                                <SheetDescription className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                                    ALINEADO A CALENDARIO SAT
                                </SheetDescription>
                            </div>
                        </div>
                        <SheetClose className="w-10 h-10 border border-transparent hover:border-black/20 dark:hover:border-white/20 flex items-center justify-center transition-colors">
                            <X className="w-5 h-5 text-black dark:text-white" strokeWidth={1.5} />
                        </SheetClose>
                    </div>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <form id="create-fiscal-year-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-500/20 mb-6">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-blue-800 dark:text-blue-300">Nota Legal SAT</p>
                            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                Para cumplir con las regulaciones de la autoridad fiscal en México, el sistema configurará automáticamente la vigencia del ejercicio fiscal del 1 de enero al 31 de diciembre del año seleccionado.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[9px] font-bold uppercase tracking-widest text-gray-500">Año (YYYY) *</label>
                            <input 
                                type="number"
                                {...register("year", { required: true, min: 2000, max: 2100 })}
                                className="w-full h-12 px-4 bg-white dark:bg-[#0a0a0a] border border-black/20 dark:border-white/20 text-[10px] font-bold uppercase tracking-widest text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                                placeholder="Ej. 2027"
                            />
                            {errors.year && <span className="text-xs text-red-500 font-bold uppercase">AÑO INVÁLIDO</span>}
                        </div>
                        
                    </form>
                </div>

                <div className="p-6 border-t border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] shrink-0">
                    <button 
                        type="submit"
                        form="create-fiscal-year-form"
                        disabled={isSubmitting}
                        className="w-full h-12 bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-3 border-0 rounded-none disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <><QhSpinner size="sm" className="text-current" /> CREANDO...</>
                        ) : (
                            <><Save className="w-4 h-4" strokeWidth={1.5} /> CONFIRMAR AÑO</>
                        )}
                    </button>
                </div>
            </SheetContent>
        </Sheet>
    );
};
