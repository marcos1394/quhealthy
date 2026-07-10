"use client"
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Save, X, Building2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Controller } from 'react-hook-form';
import { QhSpinner } from '@/components/ui/QhSpinner';
import { accountingService, CostCenterRequestDTO } from '@/services/accounting.service';
import { locationService } from '@/services/location.service';
import { ProviderLocation } from '@/types/providerLocation';

interface CreateCostCenterForm {
    name: string;
    code: string;
    locationId: string;
}

export const CreateCostCenterDrawer = ({
    open,
    onOpenChange,
    onSuccess
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}) => {
    const { register, handleSubmit, reset, control, formState: { errors } } = useForm<CreateCostCenterForm>();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [locations, setLocations] = useState<ProviderLocation[]>([]);
    const [isLoadingLocations, setIsLoadingLocations] = useState(false);

    useEffect(() => {
        if (open) {
            const fetchLocations = async () => {
                setIsLoadingLocations(true);
                try {
                    const data = await locationService.getMyLocations();
                    setLocations(data);
                } catch (error) {
                    toast.error("Error al cargar ubicaciones de negocio", { theme: "colored" });
                } finally {
                    setIsLoadingLocations(false);
                }
            };
            fetchLocations();
        }
    }, [open]);

    const onSubmit = async (data: CreateCostCenterForm) => {
        setIsSubmitting(true);
        try {
            const payload: CostCenterRequestDTO = {
                name: data.name,
                code: data.code,
                locationId: Number(data.locationId)
            };
            
            await accountingService.createCostCenter(payload);
            toast.success("Centro de Costo creado correctamente", { theme: "colored" });
            reset();
            onSuccess();
            onOpenChange(false);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Error al crear el centro de costo", { theme: "colored" });
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
                                <Building2 className="w-5 h-5 text-black dark:text-white" strokeWidth={1.5} />
                            </div>
                            <div>
                                <SheetTitle className="text-xl font-bold uppercase tracking-tight text-black dark:text-white mb-1">
                                    NUEVO CENTRO DE COSTO
                                </SheetTitle>
                                <SheetDescription className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                                    VINCULADO A SUCURSAL
                                </SheetDescription>
                            </div>
                        </div>
                    </div>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    {isLoadingLocations ? (
                        <div className="flex flex-col items-center justify-center h-40 gap-4">
                            <QhSpinner size="md" />
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Cargando ubicaciones...</p>
                        </div>
                    ) : (
                        <form id="create-cost-center-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            
                            <div className="space-y-2">
                                <label className="text-[9px] font-bold uppercase tracking-widest text-gray-500">Ubicación Física (Sucursal) *</label>
                                <Controller
                                    name="locationId"
                                    control={control}
                                    rules={{ required: true }}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger className="w-full h-12 px-4 bg-white dark:bg-[#0a0a0a] border border-black/20 dark:border-white/20 text-[10px] font-bold uppercase tracking-widest text-black dark:text-white rounded-none">
                                                <SelectValue placeholder="SELECCIONAR SUCURSAL..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {locations.map(loc => (
                                                    <SelectItem key={loc.id} value={loc.id.toString()}>
                                                        {loc.name} {loc.isMain ? '(MATRIZ)' : ''}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.locationId && <span className="text-xs text-red-500 font-bold uppercase">REQUERIDO</span>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[9px] font-bold uppercase tracking-widest text-gray-500">Nombre del Centro de Costo *</label>
                                <input 
                                    {...register("name", { required: true })}
                                    className="w-full h-12 px-4 bg-white dark:bg-[#0a0a0a] border border-black/20 dark:border-white/20 text-[10px] font-bold uppercase tracking-widest text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                                    placeholder="Ej. Clínica Centro - Gastos Generales"
                                />
                                {errors.name && <span className="text-xs text-red-500 font-bold uppercase">REQUERIDO</span>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[9px] font-bold uppercase tracking-widest text-gray-500">Código Contable Interno *</label>
                                <input 
                                    {...register("code", { required: true })}
                                    className="w-full h-12 px-4 bg-white dark:bg-[#0a0a0a] border border-black/20 dark:border-white/20 text-[10px] font-bold uppercase tracking-widest text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors uppercase"
                                    placeholder="Ej. CC-001"
                                />
                                {errors.code && <span className="text-xs text-red-500 font-bold uppercase">REQUERIDO</span>}
                            </div>
                            
                        </form>
                    )}
                </div>

                <div className="p-6 border-t border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] shrink-0">
                    <button 
                        type="submit"
                        form="create-cost-center-form"
                        disabled={isSubmitting || isLoadingLocations}
                        className="w-full h-12 bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-3 border-0 rounded-none disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <><QhSpinner size="sm" className="text-current" /> CREANDO...</>
                        ) : (
                            <><Save className="w-4 h-4" strokeWidth={1.5} /> CONFIRMAR REGISTRO</>
                        )}
                    </button>
                </div>
            </SheetContent>
        </Sheet>
    );
};
