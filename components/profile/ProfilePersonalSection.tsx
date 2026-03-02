"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import { User, Calendar, Phone, MapPin, Users } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ConsumerProfile } from '@/types/consumerProfile';

interface Props {
    form: ConsumerProfile;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSelectChange: (name: string, value: string) => void;
}

export function ProfilePersonalSection({ form, handleInputChange, handleSelectChange }: Props) {
    const t = useTranslations('PatientProfile');

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Cabecera de la sección */}
            <div className="border-b border-slate-100 dark:border-slate-800 pb-5">
                <h3 className="text-2xl font-semibold text-slate-900 dark:text-white flex items-center gap-3">
                    <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-lg">
                        <User className="w-6 h-6 text-blue-500" />
                    </div>
                    {t('section_personal', { defaultValue: 'Datos Personales' })}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mt-2 font-light text-sm">
                    {t('section_personal_desc', { defaultValue: 'Información básica para identificarte y poder contactarte.' })}
                </p>
            </div>

            <div className="space-y-6">
                
                {/* 1. Nombre Completo */}
                <div className="p-5 rounded-2xl bg-slate-50/50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800/50 transition-colors focus-within:bg-slate-50 dark:focus-within:bg-slate-800/40">
                    <div className="flex items-start gap-3.5">
                        <User className="w-5 h-5 text-blue-500 mt-0.5" />
                        <div className="flex-1">
                            <label className="text-sm font-semibold text-slate-900 dark:text-slate-200 block mb-3">
                                {t('label_name', { defaultValue: 'Nombre Completo' })}
                            </label>
                            <Input 
                                name="fullName" 
                                value={form.fullName} 
                                onChange={handleInputChange} 
                                placeholder="Ej. Juan Pérez" 
                                className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus-visible:ring-blue-500 focus-visible:border-blue-500 transition-all shadow-sm rounded-xl h-11" 
                            />
                        </div>
                    </div>
                </div>

                {/* Fila 2: Fecha de Nacimiento y Género */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Fecha de nacimiento */}
                    <div className="p-5 rounded-2xl bg-slate-50/50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800/50 transition-colors focus-within:bg-slate-50 dark:focus-within:bg-slate-800/40">
                        <div className="flex items-start gap-3.5">
                            <Calendar className="w-5 h-5 text-emerald-500 mt-0.5" />
                            <div className="flex-1">
                                <label className="text-sm font-semibold text-slate-900 dark:text-slate-200 block mb-3">
                                    {t('label_birth', { defaultValue: 'Fecha de Nacimiento' })}
                                </label>
                                <Input 
                                    type="date" 
                                    name="birthDate" 
                                    value={form.birthDate} 
                                    onChange={handleInputChange} 
                                    className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 transition-all shadow-sm rounded-xl h-11 block w-full" 
                                />
                            </div>
                        </div>
                    </div>

                    {/* Género */}
                    <div className="p-5 rounded-2xl bg-slate-50/50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800/50 transition-colors focus-within:bg-slate-50 dark:focus-within:bg-slate-800/40">
                        <div className="flex items-start gap-3.5">
                            <Users className="w-5 h-5 text-indigo-500 mt-0.5" />
                            <div className="flex-1">
                                <label className="text-sm font-semibold text-slate-900 dark:text-slate-200 block mb-3">
                                    {t('label_gender', { defaultValue: 'Género' })}
                                </label>
                                <Select value={form.gender} onValueChange={(val) => handleSelectChange('gender', val)}>
                                    <SelectTrigger className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-indigo-500 h-11 rounded-xl shadow-sm transition-all">
                                        <SelectValue placeholder="—" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-slate-800 rounded-xl">
                                        <SelectItem value="male">{t('gender_male', { defaultValue: 'Masculino' })}</SelectItem>
                                        <SelectItem value="female">{t('gender_female', { defaultValue: 'Femenino' })}</SelectItem>
                                        <SelectItem value="other">{t('gender_other', { defaultValue: 'Otro' })}</SelectItem>
                                        <SelectItem value="none">{t('gender_none', { defaultValue: 'Prefiero no decirlo' })}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Fila 3: Teléfono y Dirección */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Teléfono */}
                    <div className="p-5 rounded-2xl bg-slate-50/50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800/50 transition-colors focus-within:bg-slate-50 dark:focus-within:bg-slate-800/40">
                        <div className="flex items-start gap-3.5">
                            <Phone className="w-5 h-5 text-medical-500 mt-0.5" />
                            <div className="flex-1">
                                <label className="text-sm font-semibold text-slate-900 dark:text-slate-200 block mb-3">
                                    {t('label_phone', { defaultValue: 'Teléfono' })}
                                </label>
                                <Input 
                                    type="tel" 
                                    name="phoneNumber" 
                                    value={form.phoneNumber} 
                                    onChange={handleInputChange} 
                                    placeholder="+52..." 
                                    className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus-visible:ring-medical-500 focus-visible:border-medical-500 transition-all shadow-sm rounded-xl h-11" 
                                />
                            </div>
                        </div>
                    </div>

                    {/* Dirección */}
                    <div className="p-5 rounded-2xl bg-slate-50/50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800/50 transition-colors focus-within:bg-slate-50 dark:focus-within:bg-slate-800/40">
                        <div className="flex items-start gap-3.5">
                            <MapPin className="w-5 h-5 text-amber-500 mt-0.5" />
                            <div className="flex-1">
                                <label className="text-sm font-semibold text-slate-900 dark:text-slate-200 block mb-3">
                                    {t('label_address', { defaultValue: 'Dirección' })}
                                </label>
                                <Input 
                                    name="address" 
                                    value={form.address} 
                                    onChange={handleInputChange} 
                                    placeholder="Ciudad, Estado" 
                                    className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus-visible:ring-amber-500 focus-visible:border-amber-500 transition-all shadow-sm rounded-xl h-11" 
                                />
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}