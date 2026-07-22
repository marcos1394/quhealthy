"use client"
import React, { useState } from 'react';
import { X, Wrench, Calendar, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'react-toastify';
import { biomedicalService } from '@/services/biomedical.service';
import { WorkOrderRequest, WorkOrderType, WorkOrderPriority } from '@/types/biomedical';
import { QhSpinner } from '@/components/ui/QhSpinner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { format } from 'date-fns';

interface CreateWorkOrderDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    equipmentId: string;
}

export function CreateWorkOrderDrawer({ isOpen, onClose, onSuccess, equipmentId }: CreateWorkOrderDrawerProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<WorkOrderRequest>({
        type: 'CORRECTIVE',
        priority: 'MEDIUM',
        diagnostic: '',
        scheduledDate: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            // Validate
            if (formData.type === 'CORRECTIVE' && !formData.diagnostic) {
                toast.error("El diagnóstico es requerido para órdenes correctivas.", { theme: "colored" });
                setIsSubmitting(false);
                return;
            }
            if (formData.type === 'PREVENTIVE' && !formData.scheduledDate) {
                toast.error("La fecha programada es requerida para mantenimientos preventivos.", { theme: "colored" });
                setIsSubmitting(false);
                return;
            }

            const payload: any = {
                type: formData.type,
                priority: formData.priority,
            };
            if (formData.diagnostic) payload.diagnostic = formData.diagnostic;
            if (formData.scheduledDate) payload.scheduledDate = new Date(formData.scheduledDate).toISOString();

            await biomedicalService.createWorkOrder(equipmentId, payload);
            toast.success("Orden de trabajo creada con éxito.", { theme: "colored" });
            onSuccess();
            onClose();
            
            // Reset form
            setFormData({
                type: 'CORRECTIVE',
                priority: 'MEDIUM',
                diagnostic: '',
                scheduledDate: ''
            });
        } catch (error) {
            console.error(error);
            toast.error("Error al crear la orden de trabajo.", { theme: "colored" });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <div 
                className={cn(
                    "fixed inset-0 bg-gray-900/40 dark:bg-black/80 backdrop-blur-sm z-40 transition-opacity duration-500",
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={onClose}
            />

            <div 
                className={cn(
                    "fixed top-0 right-0 h-full w-full md:w-[600px] bg-white dark:bg-[#0a0a0a] border-l border-gray-200 dark:border-gray-800 z-50 transform transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-y-auto flex flex-col shadow-2xl md:rounded-l-3xl",
                    isOpen ? "translate-x-0" : "translate-x-full"
                )}
            >
                <div className="sticky top-0 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 p-8 flex justify-between items-center z-10 md:rounded-tl-3xl">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center shrink-0">
                            <Wrench className="w-6 h-6 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                Nueva Orden de Trabajo
                            </h2>
                            <p className="text-sm font-medium text-gray-500 mt-0.5">Generar ticket de mantenimiento</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-800 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:hover:bg-gray-900 dark:hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" strokeWidth={2} />
                    </button>
                </div>

                <div className="p-8 flex-1">
                    <form id="workOrderForm" onSubmit={handleSubmit} className="space-y-8">
                        
                        <div className="space-y-6">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3">Información Principal</h3>
                            
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Tipo de Orden</label>
                                    <Select 
                                        value={formData.type}
                                        onValueChange={(val) => setFormData({...formData, type: val as WorkOrderType})}
                                    >
                                        <SelectTrigger className="w-full h-12 px-4 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-sm font-semibold text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-emerald-500/20 transition-colors">
                                            <SelectValue placeholder={<span className="text-gray-400 font-normal">Tipo...</span>} />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border border-gray-200 dark:border-gray-800 shadow-lg">
                                            <SelectItem value="CORRECTIVE">Correctiva (Reparación)</SelectItem>
                                            <SelectItem value="PREVENTIVE">Preventiva (Programada)</SelectItem>
                                            <SelectItem value="CALIBRATION">Calibración</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Prioridad</label>
                                    <Select 
                                        value={formData.priority}
                                        onValueChange={(val) => setFormData({...formData, priority: val as WorkOrderPriority})}
                                    >
                                        <SelectTrigger className="w-full h-12 px-4 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-sm font-semibold text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-emerald-500/20 transition-colors">
                                            <SelectValue placeholder={<span className="text-gray-400 font-normal">Prioridad...</span>} />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border border-gray-200 dark:border-gray-800 shadow-lg">
                                            <SelectItem value="LOW">Baja</SelectItem>
                                            <SelectItem value="MEDIUM">Media</SelectItem>
                                            <SelectItem value="HIGH">Alta</SelectItem>
                                            <SelectItem value="CRITICAL">Crítica</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {formData.type === 'CORRECTIVE' && (
                                <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2">
                                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4 text-red-500" />
                                        Falla Reportada / Diagnóstico Inicial *
                                    </label>
                                    <textarea 
                                        className="w-full p-4 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors placeholder:text-gray-400 placeholder:font-normal min-h-[120px] resize-none"
                                        value={formData.diagnostic}
                                        onChange={(e) => setFormData({...formData, diagnostic: e.target.value})}
                                        placeholder="Describa el problema que presenta el equipo..."
                                        required={formData.type === 'CORRECTIVE'}
                                    />
                                </div>
                            )}

                            {formData.type === 'PREVENTIVE' && (
                                <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2">
                                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        Fecha Programada *
                                    </label>
                                    <DatePicker
                                        value={formData.scheduledDate ? new Date(formData.scheduledDate) : undefined}
                                        onChange={(date) => setFormData({...formData, scheduledDate: date ? format(date, 'yyyy-MM-dd') : ''})}
                                        className="w-full h-12 px-4 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-sm font-semibold text-gray-900 dark:text-white"
                                    />
                                </div>
                            )}
                        </div>
                    </form>
                </div>

                <div className="sticky bottom-0 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl border-t border-gray-100 dark:border-gray-800 p-8 flex gap-4 md:rounded-bl-3xl">
                    <button 
                        type="button"
                        onClick={onClose}
                        className="flex-1 h-12 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors shadow-sm"
                        disabled={isSubmitting}
                    >
                        Cancelar
                    </button>
                    <button 
                        type="submit"
                        form="workOrderForm"
                        className="flex-1 h-12 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-sm font-bold flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? <><QhSpinner size="sm" className="text-white" /> Generando...</> : "Generar Orden"}
                    </button>
                </div>
            </div>
        </>
    );
}
