"use client"
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Save, X, Activity } from 'lucide-react';
import { toast } from 'react-toastify';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Controller } from 'react-hook-form';
import { format } from 'date-fns';
import { QhSpinner } from '@/components/ui/QhSpinner';
import { biomedicalService } from '@/services/biomedical.service';

import { useSessionStore } from '@/stores/SessionStore';

interface RegisterEquipmentForm {
    name: string;
    category: string;
    manufacturer: string;
    model: string;
    serialNumber: string;
    internalCode: string;
    acquisitionDate: string;
    operationalDate: string;
    lifespanYears: number;
    riskLevel: string;
    supplierId: string;
}

export const RegisterEquipmentDrawer = ({
    open,
    onOpenChange,
    onSuccess
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}) => {
    const { register, handleSubmit, reset, control, formState: { errors } } = useForm<RegisterEquipmentForm>();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { user } = useSessionStore();

    const onSubmit = async (data: RegisterEquipmentForm) => {
        setIsSubmitting(true);
        try {
            if (!user?.id) throw new Error("Provider ID is missing");
            const payload = {
                ...data,
                lifespanYears: Number(data.lifespanYears),
                supplierId: data.supplierId ? Number(data.supplierId) : undefined,
                status: 'AVAILABLE' // Default status for new equipment
            };
            
            await biomedicalService.createEquipment(user.id.toString(), payload);
            toast.success("Equipo registrado correctamente", { theme: "colored" });
            reset();
            onSuccess();
            onOpenChange(false);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Error al registrar el equipo", { theme: "colored" });
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
                                <Activity className="w-5 h-5 text-black dark:text-white" strokeWidth={1.5} />
                            </div>
                            <div>
                                <SheetTitle className="text-xl font-bold uppercase tracking-tight text-black dark:text-white mb-1">
                                    NUEVO EQUIPO BIOMÉDICO
                                </SheetTitle>
                                <SheetDescription className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                                    REGISTRO EN EL INVENTARIO CLÍNICO
                                </SheetDescription>
                            </div>
                        </div>
                        <SheetClose className="w-10 h-10 border border-transparent hover:border-black/20 dark:hover:border-white/20 flex items-center justify-center transition-colors">
                            <X className="w-5 h-5 text-black dark:text-white" strokeWidth={1.5} />
                        </SheetClose>
                    </div>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <form id="register-equipment-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[9px] font-bold uppercase tracking-widest text-gray-500">Nombre del Equipo *</label>
                                <input 
                                    {...register("name", { required: true })}
                                    className="w-full h-12 px-4 bg-white dark:bg-[#0a0a0a] border border-black/20 dark:border-white/20 text-[10px] font-bold uppercase tracking-widest text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                                    placeholder="Ej. Monitor de Signos Vitales"
                                />
                                {errors.name && <span className="text-xs text-red-500 font-bold uppercase">REQUERIDO</span>}
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-[9px] font-bold uppercase tracking-widest text-gray-500">Categoría *</label>
                                <Controller
                                    name="category"
                                    control={control}
                                    rules={{ required: true }}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value || ""}>
                                            <SelectTrigger className="w-full h-12 px-4 bg-white dark:bg-[#0a0a0a] border border-black/20 dark:border-white/20 text-[10px] font-bold uppercase tracking-widest text-black dark:text-white rounded-none">
                                                <SelectValue placeholder="SELECCIONAR..." />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-none">
                                                <SelectItem value="MONITOREO">MONITOREO</SelectItem>
                                                <SelectItem value="SOPORTE_VIDA">SOPORTE DE VIDA</SelectItem>
                                                <SelectItem value="IMAGENOLOGIA">IMAGENOLOGÍA</SelectItem>
                                                <SelectItem value="LABORATORIO">LABORATORIO</SelectItem>
                                                <SelectItem value="TERAPIA">TERAPIA</SelectItem>
                                                <SelectItem value="OTROS">OTROS</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.category && <span className="text-xs text-red-500 font-bold uppercase">REQUERIDO</span>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[9px] font-bold uppercase tracking-widest text-gray-500">Fabricante *</label>
                                <input 
                                    {...register("manufacturer", { required: true })}
                                    className="w-full h-12 px-4 bg-white dark:bg-[#0a0a0a] border border-black/20 dark:border-white/20 text-[10px] font-bold uppercase tracking-widest text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                                    placeholder="Ej. Philips"
                                />
                                {errors.manufacturer && <span className="text-xs text-red-500 font-bold uppercase">REQUERIDO</span>}
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-[9px] font-bold uppercase tracking-widest text-gray-500">Modelo *</label>
                                <input 
                                    {...register("model", { required: true })}
                                    className="w-full h-12 px-4 bg-white dark:bg-[#0a0a0a] border border-black/20 dark:border-white/20 text-[10px] font-bold uppercase tracking-widest text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                                    placeholder="Ej. IntelliVue MX400"
                                />
                                {errors.model && <span className="text-xs text-red-500 font-bold uppercase">REQUERIDO</span>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[9px] font-bold uppercase tracking-widest text-gray-500">Número de Serie *</label>
                                <input 
                                    {...register("serialNumber", { required: true })}
                                    className="w-full h-12 px-4 bg-white dark:bg-[#0a0a0a] border border-black/20 dark:border-white/20 text-[10px] font-bold uppercase tracking-widest text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                                    placeholder="SN ÚNICO"
                                />
                                {errors.serialNumber && <span className="text-xs text-red-500 font-bold uppercase">REQUERIDO</span>}
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-[9px] font-bold uppercase tracking-widest text-gray-500">Código Interno</label>
                                <input 
                                    {...register("internalCode")}
                                    className="w-full h-12 px-4 bg-white dark:bg-[#0a0a0a] border border-black/20 dark:border-white/20 text-[10px] font-bold uppercase tracking-widest text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                                    placeholder="OPCIONAL"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[9px] font-bold uppercase tracking-widest text-gray-500">Fecha de Adquisición</label>
                                <Controller
                                    name="acquisitionDate"
                                    control={control}
                                    render={({ field }) => (
                                        <DatePicker
                                            value={field.value ? new Date(field.value) : undefined}
                                            onChange={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                                            className="w-full h-12 px-4 bg-white dark:bg-[#0a0a0a] border-black/20 dark:border-white/20 text-[10px] font-bold uppercase tracking-widest"
                                        />
                                    )}
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-[9px] font-bold uppercase tracking-widest text-gray-500">Fecha de Operación</label>
                                <Controller
                                    name="operationalDate"
                                    control={control}
                                    render={({ field }) => (
                                        <DatePicker
                                            value={field.value ? new Date(field.value) : undefined}
                                            onChange={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                                            className="w-full h-12 px-4 bg-white dark:bg-[#0a0a0a] border-black/20 dark:border-white/20 text-[10px] font-bold uppercase tracking-widest"
                                        />
                                    )}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[9px] font-bold uppercase tracking-widest text-gray-500">Vida Útil (Años)</label>
                                <input 
                                    type="number"
                                    {...register("lifespanYears")}
                                    className="w-full h-12 px-4 bg-white dark:bg-[#0a0a0a] border border-black/20 dark:border-white/20 text-[10px] font-bold uppercase tracking-widest text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                                    placeholder="Ej. 10"
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-[9px] font-bold uppercase tracking-widest text-gray-500">Nivel de Riesgo *</label>
                                <Controller
                                    name="riskLevel"
                                    control={control}
                                    rules={{ required: true }}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value || ""}>
                                            <SelectTrigger className="w-full h-12 px-4 bg-white dark:bg-[#0a0a0a] border border-black/20 dark:border-white/20 text-[10px] font-bold uppercase tracking-widest text-black dark:text-white rounded-none">
                                                <SelectValue placeholder="SELECCIONAR..." />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-none">
                                                <SelectItem value="LOW">BAJO (CLASE I)</SelectItem>
                                                <SelectItem value="MEDIUM">MEDIO (CLASE II)</SelectItem>
                                                <SelectItem value="HIGH">ALTO (CLASE III)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.riskLevel && <span className="text-xs text-red-500 font-bold uppercase">REQUERIDO</span>}
                            </div>
                        </div>

                    </form>
                </div>

                <div className="p-6 border-t border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] shrink-0">
                    <button 
                        type="submit"
                        form="register-equipment-form"
                        disabled={isSubmitting}
                        className="w-full h-12 bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-3 border-0 rounded-none disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <><QhSpinner size="sm" className="text-current" /> REGISTRANDO...</>
                        ) : (
                            <><Save className="w-4 h-4" strokeWidth={1.5} /> CONFIRMAR REGISTRO</>
                        )}
                    </button>
                </div>
            </SheetContent>
        </Sheet>
    );
};
