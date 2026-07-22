"use client"
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Save, X, Activity, Check, ChevronsUpDown } from 'lucide-react';
import { toast } from 'react-toastify';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DatePicker } from '@/components/ui/date-picker';
import { Controller } from 'react-hook-form';
import { format } from 'date-fns';
import { cn } from "@/lib/utils";
import { QhSpinner } from '@/components/ui/QhSpinner';
import { biomedicalService } from '@/services/biomedical.service';
import { accountingService } from '@/services/accounting.service';

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
    purchasePrice: number;
    supplierId: string;
    currentAreaId: string;
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
    
    const [categories, setCategories] = useState<any[]>([]);
    const [openCategoryPopover, setOpenCategoryPopover] = useState(false);
    const [categorySearch, setCategorySearch] = useState("");

    const [costCenters, setCostCenters] = useState<any[]>([]);

    useEffect(() => {
        if (open && user?.id) {
            biomedicalService.getCategories(user.id.toString())
                .then(setCategories)
                .catch(console.error);
                
            accountingService.listCostCenters()
                .then(setCostCenters)
                .catch(console.error);
        }
    }, [open, user?.id]);

    const onSubmit = async (data: RegisterEquipmentForm) => {
        setIsSubmitting(true);
        try {
            if (!user?.id) throw new Error("Provider ID is missing");
            const payload = {
                ...data,
                categoryName: data.category,
                usefulLifeYears: data.lifespanYears ? Number(data.lifespanYears) : undefined,
                purchasePrice: data.purchasePrice ? Number(data.purchasePrice) : undefined,
                riskLevel: data.riskLevel,
                supplierId: data.supplierId ? Number(data.supplierId) : undefined,
                currentAreaId: data.currentAreaId ? Number(data.currentAreaId) : undefined,
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
            <SheetContent position="right" size="lg" className="p-0 border-l border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] flex flex-col h-full rounded-l-3xl shadow-2xl">
                <SheetHeader className="p-8 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shrink-0 text-left rounded-tl-3xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center shrink-0">
                                <Activity className="w-6 h-6 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                            </div>
                            <div>
                                <SheetTitle className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                                    Nuevo Equipo Biomédico
                                </SheetTitle>
                                <SheetDescription className="text-sm font-medium text-gray-500">
                                    Registro en el inventario clínico
                                </SheetDescription>
                            </div>
                        </div>
                    </div>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <form id="register-equipment-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Nombre del Equipo *</label>
                                <input 
                                    {...register("name", { required: true })}
                                    className="w-full h-12 px-4 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors placeholder:text-gray-400 placeholder:font-normal"
                                    placeholder="Ej. Monitor de Signos Vitales"
                                />
                                {errors.name && <span className="text-xs text-red-500 font-bold">Requerido</span>}
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Categoría *</label>
                                <Controller
                                    name="category"
                                    control={control}
                                    rules={{ required: true }}
                                    render={({ field }) => (
                                        <Popover open={openCategoryPopover} onOpenChange={setOpenCategoryPopover} modal={true}>
                                            <PopoverTrigger asChild>
                                                <button
                                                    type="button"
                                                    role="combobox"
                                                    aria-expanded={openCategoryPopover}
                                                    className="w-full h-12 px-4 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-sm font-semibold text-gray-900 dark:text-white flex items-center justify-between transition-colors focus:ring-2 focus:ring-emerald-500/20"
                                                >
                                                    {field.value || <span className="text-gray-400 font-normal">Seleccionar...</span>}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-lg overflow-hidden">
                                                <Command className="bg-white dark:bg-[#0a0a0a]">
                                                    <CommandInput 
                                                        placeholder="Buscar o crear..." 
                                                        onValueChange={setCategorySearch}
                                                        className="text-sm font-medium"
                                                    />
                                                    <CommandList>
                                                        <CommandEmpty className="py-6 text-center text-sm">
                                                            <button
                                                                type="button"
                                                                className="w-full text-left px-4 py-2 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-[#111]"
                                                                onClick={() => {
                                                                    field.onChange(categorySearch);
                                                                    setOpenCategoryPopover(false);
                                                                }}
                                                            >
                                                                Crear nueva: <span className="text-emerald-600">{categorySearch}</span>
                                                            </button>
                                                        </CommandEmpty>
                                                        <CommandGroup>
                                                            {categories.map((cat) => (
                                                                <CommandItem
                                                                    key={cat.id}
                                                                    value={cat.name}
                                                                    disabled={false}
                                                                    onSelect={() => {
                                                                        field.onChange(cat.name);
                                                                        setOpenCategoryPopover(false);
                                                                    }}
                                                                    onMouseDown={(e) => {
                                                                        e.preventDefault();
                                                                        e.stopPropagation();
                                                                        field.onChange(cat.name);
                                                                        setOpenCategoryPopover(false);
                                                                    }}
                                                                    className="text-sm font-medium cursor-pointer hover:bg-gray-50 dark:hover:bg-[#111]"
                                                                >
                                                                    <Check
                                                                        className={cn(
                                                                            "mr-2 h-4 w-4 text-emerald-600",
                                                                            field.value === cat.name ? "opacity-100" : "opacity-0"
                                                                        )}
                                                                    />
                                                                    {cat.name}
                                                                </CommandItem>
                                                            ))}
                                                            {categorySearch && !categories.some(c => c.name.toLowerCase() === categorySearch.toLowerCase()) && (
                                                                <CommandItem
                                                                    value={categorySearch}
                                                                    onSelect={(currentValue) => {
                                                                        field.onChange(currentValue);
                                                                        setOpenCategoryPopover(false);
                                                                    }}
                                                                    className="text-sm font-semibold cursor-pointer text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/10"
                                                                >
                                                                    <Check className="mr-2 h-4 w-4 opacity-0" />
                                                                    Crear: {categorySearch}
                                                                </CommandItem>
                                                            )}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                    )}
                                />
                                {errors.category && <span className="text-xs text-red-500 font-bold">Requerido</span>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Fabricante *</label>
                                <input 
                                    {...register("manufacturer", { required: true })}
                                    className="w-full h-12 px-4 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors placeholder:text-gray-400 placeholder:font-normal"
                                    placeholder="Ej. Philips"
                                />
                                {errors.manufacturer && <span className="text-xs text-red-500 font-bold">Requerido</span>}
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Modelo *</label>
                                <input 
                                    {...register("model", { required: true })}
                                    className="w-full h-12 px-4 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors placeholder:text-gray-400 placeholder:font-normal"
                                    placeholder="Ej. IntelliVue MX400"
                                />
                                {errors.model && <span className="text-xs text-red-500 font-bold">Requerido</span>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Número de Serie *</label>
                                <input 
                                    {...register("serialNumber", { required: true })}
                                    className="w-full h-12 px-4 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors placeholder:text-gray-400 placeholder:font-normal"
                                    placeholder="SN Único"
                                />
                                {errors.serialNumber && <span className="text-xs text-red-500 font-bold">Requerido</span>}
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Código Interno</label>
                                <input 
                                    {...register("internalCode")}
                                    className="w-full h-12 px-4 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors placeholder:text-gray-400 placeholder:font-normal"
                                    placeholder="Opcional"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Fecha de Adquisición</label>
                                <Controller
                                    name="acquisitionDate"
                                    control={control}
                                    render={({ field }) => (
                                        <DatePicker
                                            value={field.value ? new Date(field.value) : undefined}
                                            onChange={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                                            className="w-full h-12 px-4 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-sm font-semibold text-gray-900 dark:text-white"
                                        />
                                    )}
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Fecha de Operación</label>
                                <Controller
                                    name="operationalDate"
                                    control={control}
                                    render={({ field }) => (
                                        <DatePicker
                                            value={field.value ? new Date(field.value) : undefined}
                                            onChange={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                                            className="w-full h-12 px-4 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-sm font-semibold text-gray-900 dark:text-white"
                                        />
                                    )}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Vida Útil (Años)</label>
                                <input 
                                    type="number"
                                    {...register("lifespanYears")}
                                    className="w-full h-12 px-4 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors placeholder:text-gray-400 placeholder:font-normal"
                                    placeholder="Ej. 10"
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Nivel de Riesgo *</label>
                                <Controller
                                    name="riskLevel"
                                    control={control}
                                    rules={{ required: true }}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value || ""}>
                                            <SelectTrigger className="w-full h-12 px-4 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-sm font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 transition-colors">
                                                <SelectValue placeholder={<span className="text-gray-400 font-normal">Seleccionar...</span>} />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl border border-gray-200 dark:border-gray-800 shadow-lg">
                                                <SelectItem value="LOW">Bajo (Clase I)</SelectItem>
                                                <SelectItem value="MEDIUM">Medio (Clase II)</SelectItem>
                                                <SelectItem value="HIGH">Alto (Clase III)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.riskLevel && <span className="text-xs text-red-500 font-bold">Requerido</span>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Centro de Costos / Ubicación (Opcional)</label>
                                <Controller
                                    name="currentAreaId"
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value || ""}>
                                            <SelectTrigger className="w-full h-12 px-4 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-sm font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 transition-colors">
                                                <SelectValue placeholder={<span className="text-gray-400 font-normal">Seleccionar ubicación...</span>} />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl border border-gray-200 dark:border-gray-800 shadow-lg">
                                                {costCenters.map(cc => (
                                                    <SelectItem key={cc.id} value={cc.id.toString()}>{cc.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Precio Proveedor (Opcional)</label>
                                <input 
                                    type="number"
                                    step="0.01"
                                    {...register("purchasePrice")}
                                    className="w-full h-12 px-4 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors placeholder:text-gray-400 placeholder:font-normal"
                                    placeholder="Ej. 15000.50"
                                />
                            </div>
                        </div>
                    </form>
                </div>

                <div className="p-8 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shrink-0 rounded-bl-3xl">
                    <button 
                        type="submit"
                        form="register-equipment-form"
                        disabled={isSubmitting}
                        className="w-full h-12 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-sm font-bold flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <><QhSpinner size="sm" className="text-white" /> Registrando...</>
                        ) : (
                            <><Save className="w-5 h-5" strokeWidth={2} /> Confirmar Registro</>
                        )}
                    </button>
                </div>
            </SheetContent>
        </Sheet>
    );
};
