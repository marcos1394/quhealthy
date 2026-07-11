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
        priority: 'NORMAL',
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
                priority: 'NORMAL',
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
                    "fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm z-40 transition-opacity duration-500",
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={onClose}
            />

            <div 
                className={cn(
                    "fixed top-0 right-0 h-full w-full md:w-[600px] bg-white dark:bg-[#0a0a0a] border-l border-black/20 dark:border-white/20 z-50 transform transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-y-auto flex flex-col",
                    isOpen ? "translate-x-0" : "translate-x-full"
                )}
            >
                <div className="sticky top-0 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-black/10 dark:border-white/10 p-6 flex justify-between items-center z-10">
                    <div>
                        <h2 className="text-xl font-bold uppercase tracking-tight text-black dark:text-white flex items-center gap-3">
                            <Wrench className="w-5 h-5" strokeWidth={1.5} />
                            NUEVA ORDEN DE TRABAJO
                        </h2>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-1">Generar ticket de mantenimiento</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="w-10 h-10 border border-black/20 dark:border-white/20 flex items-center justify-center hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
                    >
                        <X className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                </div>

                <div className="p-6 flex-1">
                    <form id="workOrderForm" onSubmit={handleSubmit} className="space-y-8">
                        
                        <div className="space-y-6">
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white border-b border-black/10 dark:border-white/10 pb-2">Información Principal</h3>
                            
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-600 dark:text-gray-400">Tipo de Orden</label>
                                    <Select 
                                        value={formData.type}
                                        onValueChange={(val) => setFormData({...formData, type: val as WorkOrderType})}
                                    >
                                        <SelectTrigger className="w-full h-12 px-4 bg-transparent border border-black/20 dark:border-white/20 text-[10px] font-bold uppercase tracking-widest text-black dark:text-white rounded-none">
                                            <SelectValue placeholder="TIPO..." />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-none">
                                            <SelectItem value="CORRECTIVE">Correctiva (Reparación)</SelectItem>
                                            <SelectItem value="PREVENTIVE">Preventiva (Programada)</SelectItem>
                                            <SelectItem value="CALIBRATION">Calibración</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-600 dark:text-gray-400">Prioridad</label>
                                    <Select 
                                        value={formData.priority}
                                        onValueChange={(val) => setFormData({...formData, priority: val as WorkOrderPriority})}
                                    >
                                        <SelectTrigger className="w-full h-12 px-4 bg-transparent border border-black/20 dark:border-white/20 text-[10px] font-bold uppercase tracking-widest text-black dark:text-white rounded-none">
                                            <SelectValue placeholder="PRIORIDAD..." />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-none">
                                            <SelectItem value="LOW">Baja</SelectItem>
                                            <SelectItem value="NORMAL">Normal</SelectItem>
                                            <SelectItem value="HIGH">Alta</SelectItem>
                                            <SelectItem value="CRITICAL">Crítica</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {formData.type === 'CORRECTIVE' && (
                                <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                        <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                                        Falla Reportada / Diagnóstico Inicial
                                    </label>
                                    <textarea 
                                        className="w-full p-4 border border-black/20 dark:border-white/20 bg-transparent text-sm focus:border-black dark:focus:border-white focus:outline-none transition-colors rounded-none min-h-[120px] resize-none"
                                        value={formData.diagnostic}
                                        onChange={(e) => setFormData({...formData, diagnostic: e.target.value})}
                                        placeholder="Describa el problema que presenta el equipo..."
                                        required={formData.type === 'CORRECTIVE'}
                                    />
                                </div>
                            )}

                            {formData.type === 'PREVENTIVE' && (
                                <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                        <Calendar className="w-3.5 h-3.5" />
                                        Fecha Programada
                                    </label>
                                    <DatePicker
                                        value={formData.scheduledDate ? new Date(formData.scheduledDate) : undefined}
                                        onChange={(date) => setFormData({...formData, scheduledDate: date ? format(date, 'yyyy-MM-dd') : ''})}
                                        className="w-full h-12 px-4 bg-transparent border-black/20 dark:border-white/20 text-[10px] font-bold uppercase tracking-widest rounded-none"
                                    />
                                </div>
                            )}
                        </div>
                    </form>
                </div>

                <div className="sticky bottom-0 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl border-t border-black/10 dark:border-white/10 p-6 flex gap-4">
                    <button 
                        type="button"
                        onClick={onClose}
                        className="flex-1 h-14 border border-black/20 dark:border-white/20 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-[#111] transition-colors"
                        disabled={isSubmitting}
                    >
                        CANCELAR
                    </button>
                    <button 
                        type="submit"
                        form="workOrderForm"
                        className="flex-1 h-14 bg-black text-white dark:bg-white dark:text-black text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? <QhSpinner size="sm" /> : "GENERAR ORDEN"}
                    </button>
                </div>
            </div>
        </>
    );
}
