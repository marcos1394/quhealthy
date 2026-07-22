"use client"
import React, { useState } from 'react';
import { X, Calendar, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'react-toastify';
import { biomedicalService } from '@/services/biomedical.service';
import { MaintenanceScheduleRequest, MaintenancePeriodicity } from '@/types/biomedical';
import { QhSpinner } from '@/components/ui/QhSpinner';
import { DatePicker } from '@/components/ui/date-picker';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CreateScheduleDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    equipmentId: string;
}

export function CreateScheduleDrawer({ isOpen, onClose, onSuccess, equipmentId }: CreateScheduleDrawerProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<MaintenanceScheduleRequest>({
        periodicity: 'ANNUALLY',
        nextMaintenanceDate: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.nextMaintenanceDate) {
            toast.error("La fecha inicial del próximo mantenimiento es requerida.", { theme: "colored" });
            return;
        }

        if (formData.periodicity === 'CUSTOM' && (!formData.customDays || formData.customDays <= 0)) {
            toast.error("Ingrese una cantidad válida de días personalizados.", { theme: "colored" });
            return;
        }

        setIsSubmitting(true);
        try {
            const payload: any = {
                periodicity: formData.periodicity,
                nextMaintenanceDate: formData.nextMaintenanceDate
            };
            if (formData.periodicity === 'CUSTOM') {
                payload.customDays = formData.customDays;
            }

            await biomedicalService.createSchedule(equipmentId, payload);
            toast.success("Programación configurada con éxito.", { theme: "colored" });
            onSuccess();
            onClose();
            setFormData({ periodicity: 'ANNUALLY', nextMaintenanceDate: '' });
        } catch (error) {
            console.error(error);
            toast.error("Error al configurar la programación.", { theme: "colored" });
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
                            <Clock className="w-6 h-6 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                Programar Mantenimiento
                            </h2>
                            <p className="text-sm font-medium text-gray-500 mt-0.5">Configurar alertas automáticas</p>
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
                    <form id="scheduleForm" onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-6">
                            
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Periodicidad</label>
                                <Select 
                                    value={formData.periodicity}
                                    onValueChange={(val) => setFormData({...formData, periodicity: val as MaintenancePeriodicity})}
                                >
                                    <SelectTrigger className="w-full h-12 px-4 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-sm font-semibold text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-emerald-500/20 transition-colors">
                                        <SelectValue placeholder={<span className="text-gray-400 font-normal">Seleccione una periodicidad...</span>} />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border border-gray-200 dark:border-gray-800 shadow-lg">
                                        <SelectItem value="WEEKLY">Semanal</SelectItem>
                                        <SelectItem value="MONTHLY">Mensual</SelectItem>
                                        <SelectItem value="QUARTERLY">Trimestral</SelectItem>
                                        <SelectItem value="SEMI_ANNUALLY">Semestral</SelectItem>
                                        <SelectItem value="ANNUALLY">Anual</SelectItem>
                                        <SelectItem value="CUSTOM">Personalizado (Días)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {formData.periodicity === 'CUSTOM' && (
                                <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2">
                                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Días Personalizados</label>
                                    <input 
                                        type="number"
                                        min="1"
                                        className="w-full h-12 px-4 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors placeholder:text-gray-400 placeholder:font-normal"
                                        value={formData.customDays || ''}
                                        onChange={(e) => setFormData({...formData, customDays: parseInt(e.target.value)})}
                                        placeholder="Ej. 45"
                                        required={formData.periodicity === 'CUSTOM'}
                                    />
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    Próximo Mantenimiento (Inicio)
                                </label>
                                <DatePicker
                                    value={formData.nextMaintenanceDate ? new Date(formData.nextMaintenanceDate) : undefined}
                                    onChange={(date) => setFormData({...formData, nextMaintenanceDate: date ? format(date, 'yyyy-MM-dd') : ''})}
                                    className="w-full h-12 px-4 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-sm font-semibold text-gray-900 dark:text-white"
                                />
                            </div>
                            
                            <div className="p-5 rounded-2xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 mt-6 flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0 mt-0.5">
                                    <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <p className="text-sm font-medium text-blue-800 dark:text-blue-300 leading-relaxed">
                                    <strong className="font-bold mr-1">Nota:</strong>
                                    El sistema generará una orden de trabajo preventiva de forma automática 7 días antes de la fecha programada.
                                </p>
                            </div>

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
                        form="scheduleForm"
                        className="flex-1 h-12 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-sm font-bold flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <><QhSpinner size="sm" className="text-white" /> Guardando...</>
                        ) : (
                            "Guardar Programación"
                        )}
                    </button>
                </div>
            </div>
        </>
    );
}
