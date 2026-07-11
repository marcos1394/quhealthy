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
                            <Clock className="w-5 h-5" strokeWidth={1.5} />
                            PROGRAMAR MANTENIMIENTO
                        </h2>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-1">Configurar alertas automáticas</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="w-10 h-10 border border-black/20 dark:border-white/20 flex items-center justify-center hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
                    >
                        <X className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                </div>

                <div className="p-6 flex-1">
                    <form id="scheduleForm" onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-6">
                            
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-600 dark:text-gray-400">Periodicidad</label>
                                <Select 
                                    value={formData.periodicity}
                                    onValueChange={(val) => setFormData({...formData, periodicity: val as MaintenancePeriodicity})}
                                >
                                    <SelectTrigger className="w-full h-12 px-4 bg-transparent border border-black/20 dark:border-white/20 text-[10px] font-bold uppercase tracking-widest text-black dark:text-white rounded-none">
                                        <SelectValue placeholder="SELECCIONE UNA PERIODICIDAD..." />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-none">
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
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-600 dark:text-gray-400">Días Personalizados</label>
                                    <input 
                                        type="number"
                                        min="1"
                                        className="w-full h-12 px-4 border border-black/20 dark:border-white/20 bg-transparent text-sm focus:border-black dark:focus:border-white focus:outline-none transition-colors rounded-none"
                                        value={formData.customDays || ''}
                                        onChange={(e) => setFormData({...formData, customDays: parseInt(e.target.value)})}
                                        placeholder="Ej. 45"
                                        required={formData.periodicity === 'CUSTOM'}
                                    />
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                    <Calendar className="w-3.5 h-3.5" />
                                    Próximo Mantenimiento (Inicio)
                                </label>
                                <DatePicker
                                    value={formData.nextMaintenanceDate ? new Date(formData.nextMaintenanceDate) : undefined}
                                    onChange={(date) => setFormData({...formData, nextMaintenanceDate: date ? format(date, 'yyyy-MM-dd') : ''})}
                                    className="w-full h-12 px-4 bg-transparent border-black/20 dark:border-white/20 text-[10px] font-bold uppercase tracking-widest rounded-none"
                                />
                            </div>
                            
                            <div className="p-4 bg-gray-50 dark:bg-white/5 border border-black/10 dark:border-white/10 mt-6">
                                <p className="text-[10px] font-semibold text-gray-600 dark:text-gray-400 leading-relaxed uppercase tracking-widest">
                                    <strong className="text-black dark:text-white mr-1">Nota:</strong>
                                    El sistema generará una orden de trabajo preventiva de forma automática 7 días antes de la fecha programada.
                                </p>
                            </div>

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
                        form="scheduleForm"
                        className="flex-1 h-14 bg-black text-white dark:bg-white dark:text-black text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? <QhSpinner size="sm" /> : "GUARDAR PROGRAMACIÓN"}
                    </button>
                </div>
            </div>
        </>
    );
}
