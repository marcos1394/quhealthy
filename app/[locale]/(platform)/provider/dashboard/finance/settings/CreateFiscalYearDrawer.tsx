"use client"
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Save, Calendar, Info } from 'lucide-react';
import { toast } from 'react-toastify';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { QhSpinner } from '@/components/ui/QhSpinner';
import { financeService } from '@/services/finance.service';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
            <SheetContent position="right" size="lg" className="p-0 border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] flex flex-col h-full shadow-2xl">
                <SheetHeader className="p-6 md:p-8 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shrink-0 text-left">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center shrink-0">
                                <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <SheetTitle className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                                    Nuevo Año Fiscal
                                </SheetTitle>
                                <SheetDescription className="text-sm font-medium text-gray-500">
                                    Alineado a calendario SAT
                                </SheetDescription>
                            </div>
                        </div>
                    </div>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
                    <form id="create-fiscal-year-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 rounded-2xl mb-6">
                            <p className="text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300 flex items-center gap-2">
                                <Info className="w-4 h-4" /> Nota Legal SAT
                            </p>
                            <p className="text-sm text-blue-600 dark:text-blue-400 mt-2 font-medium">
                                Para cumplir con las regulaciones de la autoridad fiscal en México, el sistema configurará automáticamente la vigencia del ejercicio fiscal del 1 de enero al 31 de diciembre del año seleccionado.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Año (YYYY) *</Label>
                            <Input 
                                type="number"
                                {...register("year", { required: true, min: 2000, max: 2100 })}
                                className="w-full h-12 px-4 rounded-xl border-gray-200 dark:border-gray-800 shadow-sm font-mono text-base bg-white dark:bg-[#111]"
                                placeholder="Ej. 2027"
                            />
                            {errors.year && <span className="text-xs text-red-500 font-bold">AÑO INVÁLIDO</span>}
                        </div>
                        
                    </form>
                </div>

                <div className="p-6 md:p-8 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/20 shrink-0">
                    <button 
                        type="submit"
                        form="create-fiscal-year-form"
                        disabled={isSubmitting}
                        className="w-full h-12 bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-sm font-bold flex items-center justify-center gap-2 rounded-xl shadow-sm disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <><QhSpinner size="sm" className="mr-2" /> Creando...</>
                        ) : (
                            <><Save className="w-4 h-4" /> Confirmar Año</>
                        )}
                    </button>
                </div>
            </SheetContent>
        </Sheet>
    );
};
