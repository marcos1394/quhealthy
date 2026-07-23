"use client"
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Save, Building2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Controller } from 'react-hook-form';
import { QhSpinner } from '@/components/ui/QhSpinner';
import { accountingService, CostCenterRequestDTO } from '@/services/accounting.service';
import { CostCenterDTO } from '@/types/accounting';
import { locationService } from '@/services/location.service';
import { ProviderLocation } from '@/types/providerLocation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CreateCostCenterForm {
    name: string;
    code: string;
    locationId: string;
}

export const CreateCostCenterDrawer = ({
    open,
    onOpenChange,
    onSuccess,
    parentId,
    parentName,
    editNode
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    parentId?: string | null;
    parentName?: string;
    editNode?: CostCenterDTO | null;
}) => {
    const { register, handleSubmit, reset, control, setValue, formState: { errors } } = useForm<CreateCostCenterForm>();
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

            if (editNode) {
                setValue('name', editNode.name);
                setValue('code', editNode.code);
                if (editNode.associatedAreaId) {
                    setValue('locationId', editNode.associatedAreaId.toString());
                }
            } else {
                reset();
            }
        }
    }, [open, editNode, setValue, reset]);

    const onSubmit = async (data: CreateCostCenterForm) => {
        setIsSubmitting(true);
        try {
            const payload: CostCenterRequestDTO = {
                name: data.name,
                code: data.code,
                locationId: Number(data.locationId)
            };

            if (parentId && !editNode) {
                payload.parentId = parentId;
            }
            
            if (editNode) {
                await accountingService.updateCostCenter(editNode.id, payload);
                toast.success("Centro de Costo actualizado correctamente", { theme: "colored" });
            } else {
                await accountingService.createCostCenter(payload);
                toast.success("Centro de Costo creado correctamente", { theme: "colored" });
            }
            
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
            <SheetContent position="right" size="lg" className="p-0 border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] flex flex-col h-full shadow-2xl">
                <SheetHeader className="p-6 md:p-8 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shrink-0 text-left">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                                <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <SheetTitle className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                                    {editNode ? 'Editar Centro de Costo' : parentId ? 'Nuevo Sub-Centro de Costo' : 'Nuevo Centro de Costo'}
                                </SheetTitle>
                                <SheetDescription className="text-sm font-medium text-gray-500">
                                    {editNode ? `Modificando: ${editNode.name}` : parentId ? `Dependiente de: ${parentName}` : 'Vinculado a sucursal'}
                                </SheetDescription>
                            </div>
                        </div>
                    </div>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
                    {isLoadingLocations ? (
                        <div className="flex flex-col items-center justify-center h-40 gap-4">
                            <QhSpinner size="md" className="text-emerald-600" />
                            <p className="text-sm font-semibold text-gray-500 animate-pulse">Cargando ubicaciones...</p>
                        </div>
                    ) : (
                        <form id="create-cost-center-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Ubicación Física (Sucursal) *</Label>
                                <Controller
                                    name="locationId"
                                    control={control}
                                    rules={{ required: true }}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger className="w-full h-12 px-4 rounded-xl border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-[#111] font-semibold text-gray-900 dark:text-white">
                                                <SelectValue placeholder="Seleccionar sucursal..." />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl border-gray-200 dark:border-gray-800">
                                                {locations.map(loc => (
                                                    <SelectItem key={loc.id} value={loc.id.toString()} className="rounded-lg">
                                                        {loc.name} {loc.isMain ? '(Matriz)' : ''}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.locationId && <span className="text-xs text-red-500 font-bold">REQUERIDO</span>}
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Nombre del Centro de Costo *</Label>
                                <Input 
                                    {...register("name", { required: true })}
                                    className="w-full h-12 px-4 rounded-xl border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-[#111]"
                                    placeholder="Ej. Clínica Centro - Gastos Generales"
                                />
                                {errors.name && <span className="text-xs text-red-500 font-bold">REQUERIDO</span>}
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Código Contable Interno *</Label>
                                <Input 
                                    {...register("code", { required: true })}
                                    className="w-full h-12 px-4 rounded-xl border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-[#111] uppercase font-mono"
                                    placeholder="Ej. CC-001"
                                />
                                {errors.code && <span className="text-xs text-red-500 font-bold">REQUERIDO</span>}
                            </div>
                            
                        </form>
                    )}
                </div>

                <div className="p-6 md:p-8 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/20 shrink-0">
                    <button 
                        type="submit"
                        form="create-cost-center-form"
                        disabled={isSubmitting || isLoadingLocations}
                        className="w-full h-12 bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-sm font-bold flex items-center justify-center gap-2 rounded-xl shadow-sm disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <><QhSpinner size="sm" className="mr-2" /> Guardando...</>
                        ) : (
                            <><Save className="w-4 h-4" /> Guardar Centro de Costo</>
                        )}
                    </button>
                </div>
            </SheetContent>
        </Sheet>
    );
};
