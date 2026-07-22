"use client"
import React, { useState } from 'react';
import { X, ShieldAlert, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'react-toastify';
import { biomedicalService } from '@/services/biomedical.service';
import { WarrantyRequest } from '@/types/biomedical';
import { QhSpinner } from '@/components/ui/QhSpinner';
import { DatePicker } from '@/components/ui/date-picker';
import { format } from 'date-fns';

interface CreateWarrantyDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    equipmentId: string;
}

export function CreateWarrantyDrawer({ isOpen, onClose, onSuccess, equipmentId }: CreateWarrantyDrawerProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<WarrantyRequest>({
        providerName: '',
        startDate: '',
        expirationDate: '',
        coverageDetails: '',
        contactInfo: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.providerName || !formData.startDate || !formData.expirationDate) {
            toast.error("Complete los campos obligatorios.", { theme: "colored" });
            return;
        }

        setIsSubmitting(true);
        try {
            await biomedicalService.registerWarranty(equipmentId, formData);
            toast.success("Garantía registrada con éxito.", { theme: "colored" });
            onSuccess();
            onClose();
            setFormData({ providerName: '', startDate: '', expirationDate: '', coverageDetails: '', contactInfo: '' });
        } catch (error) {
            console.error(error);
            toast.error("Error al registrar la garantía.", { theme: "colored" });
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
                            <ShieldAlert className="w-6 h-6 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                Nueva Garantía
                            </h2>
                            <p className="text-sm font-medium text-gray-500 mt-0.5">Registrar cobertura del equipo</p>
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
                    <form id="warrantyForm" onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-6">
                            
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Proveedor / Empresa *</label>
                                <input 
                                    className="w-full h-12 px-4 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors placeholder:text-gray-400 placeholder:font-normal"
                                    value={formData.providerName}
                                    onChange={(e) => setFormData({...formData, providerName: e.target.value})}
                                    placeholder="Ej. Medtronic S.A."
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        Fecha de Inicio *
                                    </label>
                                    <DatePicker
                                        value={formData.startDate ? new Date(formData.startDate) : undefined}
                                        onChange={(date) => setFormData({...formData, startDate: date ? format(date, 'yyyy-MM-dd') : ''})}
                                        className="w-full h-12 px-4 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-sm font-semibold text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        Fecha de Expiración *
                                    </label>
                                    <DatePicker
                                        value={formData.expirationDate ? new Date(formData.expirationDate) : undefined}
                                        onChange={(date) => setFormData({...formData, expirationDate: date ? format(date, 'yyyy-MM-dd') : ''})}
                                        className="w-full h-12 px-4 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-sm font-semibold text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Detalles de Cobertura</label>
                                <textarea 
                                    className="w-full p-4 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors placeholder:text-gray-400 placeholder:font-normal min-h-[120px] resize-none"
                                    value={formData.coverageDetails}
                                    onChange={(e) => setFormData({...formData, coverageDetails: e.target.value})}
                                    placeholder="Partes incluidas, exclusiones, etc."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Información de Contacto</label>
                                <input 
                                    className="w-full h-12 px-4 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-colors placeholder:text-gray-400 placeholder:font-normal"
                                    value={formData.contactInfo}
                                    onChange={(e) => setFormData({...formData, contactInfo: e.target.value})}
                                    placeholder="Teléfono o Email de soporte"
                                />
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
                        form="warrantyForm"
                        className="flex-1 h-12 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-sm font-bold flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? <><QhSpinner size="sm" className="text-white" /> Registrando...</> : "Registrar"}
                    </button>
                </div>
            </div>
        </>
    );
}
