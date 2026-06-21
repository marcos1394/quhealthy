"use client";

import React, { useState } from 'react';
import { CalendarIcon, Users, UserPlus, X, Save } from 'lucide-react';
import { format, parse } from 'date-fns';
import { enUS, es } from 'date-fns/locale';
import { useLocale, useTranslations } from 'next-intl';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { usePatientDirectory } from '@/hooks/usePatientDirectory';
import { PatientRegistrationPayload } from '@/types/patient';
import { QhSpinner } from '@/components/ui/QhSpinner';

interface NewPatientModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (payload: PatientRegistrationPayload) => void;
}

export function NewPatientModal({ isOpen, onClose, onSuccess }: NewPatientModalProps) {
    const { createPatient, isSubmitting } = usePatientDirectory();
    const locale = useLocale();
    const t = useTranslations('DashboardPatients');
    const dateLocale = locale === 'es' ? es : enUS;
    const [calendarOpen, setCalendarOpen] = useState(false);
    const [formData, setFormData] = useState<PatientRegistrationPayload>({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        birthDate: '',
        gender: undefined
    });
    
    const selectedBirthDate = formData.birthDate
        ? parse(formData.birthDate, 'yyyy-MM-dd', new Date())
        : undefined;
        
    const displayBirthDate = selectedBirthDate
        ? format(selectedBirthDate, locale === 'es' ? "d 'de' MMMM 'de' yyyy" : 'MMMM d, yyyy', { locale: dateLocale })
        : '';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload: PatientRegistrationPayload = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email?.trim() || undefined,
            phone: formData.phone?.trim() || undefined,
            birthDate: formData.birthDate || undefined,
            gender: formData.gender
        };
        const success = await createPatient(payload);
        if (success) {
            onSuccess?.(payload);
            onClose();
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                birthDate: '',
                gender: undefined
            });
            setCalendarOpen(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && !isSubmitting && onClose()}>
            <DialogContent className="sm:max-w-3xl bg-white dark:bg-[#0a0a0a] border border-black dark:border-white text-black dark:text-white p-0 rounded-none shadow-2xl overflow-hidden flex flex-col transition-colors">
                
                {/* HEADER ARQUITECTÓNICO */}
                <div className="flex items-start md:items-center justify-between p-6 md:p-8 bg-white dark:bg-[#0a0a0a] border-b border-black/20 dark:border-white/20 shrink-0">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] text-black dark:text-white flex items-center justify-center shrink-0">
                            <UserPlus className="w-6 h-6" strokeWidth={1.5} />
                        </div>
                        <div>
                            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">
                                Módulo de Directorio
                            </p>
                            <DialogTitle className="text-xl md:text-2xl font-semibold uppercase tracking-tight text-black dark:text-white leading-none">
                                {t('new_patient_modal_title', { defaultValue: 'ALTA DE PACIENTE' })}
                            </DialogTitle>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-2">
                                {t('new_patient_modal_description', { defaultValue: 'INGRESE LOS DATOS BASE PARA APERTURAR UN NUEVO EXPEDIENTE.' })}
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="w-12 h-12 flex items-center justify-center border border-transparent hover:border-black/20 dark:hover:border-white/20 hover:bg-gray-50 dark:hover:bg-[#050505] transition-colors shrink-0 disabled:opacity-50"
                    >
                        <X className="w-5 h-5 text-gray-500 hover:text-black dark:hover:text-white transition-colors" strokeWidth={1.5} />
                    </button>
                </div>

                {/* CUERPO DEL FORMULARIO (GRID BLUEPRINT) */}
                <form onSubmit={handleSubmit} className="flex flex-col bg-gray-50 dark:bg-[#050505] overflow-y-auto custom-scrollbar max-h-[70vh]">
                    
                    {/* Fila 1: Nombres */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-b border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0a]">
                        <div className="p-6 md:p-8 border-b md:border-b-0 md:border-r border-black/10 dark:border-white/10 flex flex-col justify-center">
                            <label className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-3 flex items-center gap-2">
                                <span className="w-3 h-3 flex items-center justify-center border border-black/20 dark:border-white/20">1</span>
                                {t('first_name_label', { defaultValue: 'NOMBRE(S)' })} *
                            </label>
                            <Input 
                                required 
                                value={formData.firstName} 
                                onChange={e => setFormData({...formData, firstName: e.target.value})} 
                                className="h-12 px-4 bg-gray-50 dark:bg-[#050505] border border-black/20 dark:border-white/20 text-xs font-semibold text-black dark:text-white uppercase focus-visible:ring-0 focus-visible:border-black dark:focus-visible:border-white transition-colors rounded-none placeholder:text-gray-400 dark:placeholder:text-gray-600"
                                disabled={isSubmitting}
                            />
                        </div>
                        <div className="p-6 md:p-8 flex flex-col justify-center">
                            <label className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-3 flex items-center gap-2">
                                <span className="w-3 h-3 flex items-center justify-center border border-black/20 dark:border-white/20">2</span>
                                {t('last_name_label', { defaultValue: 'APELLIDO(S)' })} *
                            </label>
                            <Input 
                                required 
                                value={formData.lastName} 
                                onChange={e => setFormData({...formData, lastName: e.target.value})} 
                                className="h-12 px-4 bg-gray-50 dark:bg-[#050505] border border-black/20 dark:border-white/20 text-xs font-semibold text-black dark:text-white uppercase focus-visible:ring-0 focus-visible:border-black dark:focus-visible:border-white transition-colors rounded-none placeholder:text-gray-400 dark:placeholder:text-gray-600"
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>

                    {/* Fila 2: Contacto */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-b border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0a]">
                        <div className="p-6 md:p-8 border-b md:border-b-0 md:border-r border-black/10 dark:border-white/10 flex flex-col justify-center">
                            <label className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-3 flex items-center gap-2">
                                <span className="w-3 h-3 flex items-center justify-center border border-black/20 dark:border-white/20">3</span>
                                {t('email_label', { defaultValue: 'CORREO ELECTRÓNICO' })}
                            </label>
                            <Input 
                                type="email" 
                                value={formData.email} 
                                onChange={e => setFormData({...formData, email: e.target.value})} 
                                className="h-12 px-4 bg-gray-50 dark:bg-[#050505] border border-black/20 dark:border-white/20 text-xs font-semibold text-black dark:text-white uppercase focus-visible:ring-0 focus-visible:border-black dark:focus-visible:border-white transition-colors rounded-none placeholder:text-gray-400 dark:placeholder:text-gray-600"
                                disabled={isSubmitting}
                            />
                        </div>
                        <div className="p-6 md:p-8 flex flex-col justify-center">
                            <label className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-3 flex items-center gap-2">
                                <span className="w-3 h-3 flex items-center justify-center border border-black/20 dark:border-white/20">4</span>
                                {t('phone_label', { defaultValue: 'NÚMERO TELEFÓNICO' })}
                            </label>
                            <Input 
                                type="tel"
                                value={formData.phone} 
                                onChange={e => setFormData({...formData, phone: e.target.value})} 
                                className="h-12 px-4 bg-gray-50 dark:bg-[#050505] border border-black/20 dark:border-white/20 text-xs font-semibold text-black dark:text-white uppercase focus-visible:ring-0 focus-visible:border-black dark:focus-visible:border-white transition-colors rounded-none placeholder:text-gray-400 dark:placeholder:text-gray-600"
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>

                    {/* Fila 3: Demografía */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-b border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0a]">
                        <div className="p-6 md:p-8 border-b md:border-b-0 md:border-r border-black/10 dark:border-white/10 flex flex-col justify-center">
                            <label className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-3 flex items-center gap-2">
                                <span className="w-3 h-3 flex items-center justify-center border border-black/20 dark:border-white/20">5</span>
                                {t('birth_date_label', { defaultValue: 'FECHA DE NACIMIENTO' })}
                            </label>
                            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                                <PopoverTrigger asChild>
                                    <button
                                        type="button"
                                        disabled={isSubmitting}
                                        className={cn(
                                            "w-full h-12 px-4 flex items-center justify-start text-left rounded-none border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] hover:bg-gray-100 dark:hover:bg-[#111] transition-colors text-xs uppercase font-semibold disabled:opacity-50",
                                            !displayBirthDate ? "text-gray-400 dark:text-gray-600" : "text-black dark:text-white"
                                        )}
                                    >
                                        <CalendarIcon className="mr-3 h-4 w-4 shrink-0" strokeWidth={1.5} />
                                        {displayBirthDate || t('birth_date_placeholder', { defaultValue: 'SELECCIONAR FECHA' })}
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent
                                    className="w-auto p-0 bg-white dark:bg-[#0a0a0a] border border-black dark:border-white rounded-none shadow-2xl"
                                    align="start"
                                >
                                    <Calendar
                                        mode="single"
                                        selected={selectedBirthDate}
                                        onSelect={(date) => {
                                            setFormData({
                                                ...formData,
                                                birthDate: date ? format(date, 'yyyy-MM-dd') : ''
                                            });
                                            setCalendarOpen(false);
                                        }}
                                        disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                                        defaultMonth={selectedBirthDate || new Date(2000, 0)}
                                        captionLayout="dropdown-buttons"
                                        fromYear={1920}
                                        toYear={new Date().getFullYear()}
                                        locale={dateLocale}
                                        className="rounded-none bg-white dark:bg-[#0a0a0a] text-black dark:text-white p-3 font-sans"
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="p-6 md:p-8 flex flex-col justify-center">
                            <label className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-3 flex items-center gap-2">
                                <span className="w-3 h-3 flex items-center justify-center border border-black/20 dark:border-white/20">6</span>
                                {t('gender_label', { defaultValue: 'GÉNERO' })}
                            </label>
                            <div className="relative">
                                <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 z-10 pointer-events-none" strokeWidth={1.5} />
                                <Select
                                    value={formData.gender}
                                    onValueChange={(value: 'MALE' | 'FEMALE' | 'OTHER') => setFormData({...formData, gender: value})}
                                    disabled={isSubmitting}
                                >
                                    <SelectTrigger className="pl-11 h-12 rounded-none border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] text-black dark:text-white focus:ring-0 focus:border-black dark:focus:border-white text-xs font-semibold uppercase disabled:opacity-50">
                                        <SelectValue placeholder={t('gender_placeholder', { defaultValue: 'SELECCIONAR' })} />
                                    </SelectTrigger>
                                    <SelectContent className="z-[100] bg-white dark:bg-[#0a0a0a] text-black dark:text-white border border-black dark:border-white rounded-none shadow-2xl">
                                        <SelectItem className="text-[9px] font-bold uppercase tracking-widest focus:bg-black focus:text-white dark:focus:bg-white dark:focus:text-black cursor-pointer rounded-none" value="MALE">{t('gender_male', { defaultValue: 'MASCULINO' })}</SelectItem>
                                        <SelectItem className="text-[9px] font-bold uppercase tracking-widest focus:bg-black focus:text-white dark:focus:bg-white dark:focus:text-black cursor-pointer rounded-none" value="FEMALE">{t('gender_female', { defaultValue: 'FEMENINO' })}</SelectItem>
                                        <SelectItem className="text-[9px] font-bold uppercase tracking-widest focus:bg-black focus:text-white dark:focus:bg-white dark:focus:text-black cursor-pointer rounded-none" value="OTHER">{t('gender_other', { defaultValue: 'OTRO' })}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* FOOTER DE COMANDOS ESTRICTO */}
                    <div className="p-6 md:p-8 bg-white dark:bg-[#0a0a0a] flex flex-col sm:flex-row justify-end gap-4 shrink-0 mt-auto">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="w-full sm:w-auto h-14 px-8 border border-black/20 dark:border-white/20 bg-transparent text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors text-[10px] font-bold uppercase tracking-widest rounded-none disabled:opacity-50"
                        >
                            {t('cancel_button', { defaultValue: 'ANULAR' })}
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !formData.firstName || !formData.lastName}
                            className="w-full sm:w-auto h-14 px-10 bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-3 border-0 rounded-none disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <><QhSpinner size="sm" className="text-current" /> PROCESANDO...</>
                            ) : (
                                <><Save className="w-4 h-4" strokeWidth={1.5} /> {t('save_patient', { defaultValue: 'CONFIRMAR REGISTRO' })}</>
                            )}
                        </button>
                    </div>

                </form>
            </DialogContent>
        </Dialog>
    );
}