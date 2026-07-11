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
                            <ShieldAlert className="w-5 h-5" strokeWidth={1.5} />
                            NUEVA GARANTÍA
                        </h2>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-1">Registrar cobertura del equipo</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="w-10 h-10 border border-black/20 dark:border-white/20 flex items-center justify-center hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
                    >
                        <X className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                </div>

                <div className="p-6 flex-1">
                    <form id="warrantyForm" onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-6">
                            
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-600 dark:text-gray-400">Proveedor / Empresa</label>
                                <input 
                                    className="w-full h-12 px-4 border border-black/20 dark:border-white/20 bg-transparent text-sm focus:border-black dark:focus:border-white focus:outline-none transition-colors rounded-none"
                                    value={formData.providerName}
                                    onChange={(e) => setFormData({...formData, providerName: e.target.value})}
                                    placeholder="Ej. Medtronic S.A."
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                        <Calendar className="w-3.5 h-3.5" />
                                        Fecha de Inicio
                                    </label>
                                    <DatePicker
                                        value={formData.startDate ? new Date(formData.startDate) : undefined}
                                        onChange={(date) => setFormData({...formData, startDate: date ? format(date, 'yyyy-MM-dd') : ''})}
                                        className="w-full h-12 px-4 bg-transparent border-black/20 dark:border-white/20 text-[10px] font-bold uppercase tracking-widest rounded-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                        <Calendar className="w-3.5 h-3.5" />
                                        Fecha de Expiración
                                    </label>
                                    <DatePicker
                                        value={formData.expirationDate ? new Date(formData.expirationDate) : undefined}
                                        onChange={(date) => setFormData({...formData, expirationDate: date ? format(date, 'yyyy-MM-dd') : ''})}
                                        className="w-full h-12 px-4 bg-transparent border-black/20 dark:border-white/20 text-[10px] font-bold uppercase tracking-widest rounded-none"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-600 dark:text-gray-400">Detalles de Cobertura</label>
                                <textarea 
                                    className="w-full p-4 border border-black/20 dark:border-white/20 bg-transparent text-sm focus:border-black dark:focus:border-white focus:outline-none transition-colors rounded-none min-h-[100px] resize-none"
                                    value={formData.coverageDetails}
                                    onChange={(e) => setFormData({...formData, coverageDetails: e.target.value})}
                                    placeholder="Partes incluidas, exclusiones, etc."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-600 dark:text-gray-400">Información de Contacto</label>
                                <input 
                                    className="w-full h-12 px-4 border border-black/20 dark:border-white/20 bg-transparent text-sm focus:border-black dark:focus:border-white focus:outline-none transition-colors rounded-none"
                                    value={formData.contactInfo}
                                    onChange={(e) => setFormData({...formData, contactInfo: e.target.value})}
                                    placeholder="Teléfono o Email de soporte"
                                />
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
                        form="warrantyForm"
                        className="flex-1 h-14 bg-black text-white dark:bg-white dark:text-black text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? <QhSpinner size="sm" /> : "REGISTRAR"}
                    </button>
                </div>
            </div>
        </>
    );
}
