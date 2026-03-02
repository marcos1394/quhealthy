"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import { User, Calendar, Phone, MapPin, Users } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
        <div className="space-y-8">
            {/* Section Header */}
            <div className="pb-6 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-xl">
                        <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-xl font-medium text-slate-900 dark:text-white tracking-tight">
                        {t('section_personal', { defaultValue: 'Datos Personales' })}
                    </h3>
                </div>
                <p className="text-slate-500 dark:text-slate-400 font-light text-sm ml-12">
                    {t('section_personal_desc', { defaultValue: 'Información básica para identificarte y poder contactarte.' })}
                </p>
            </div>

            {/* Fields */}
            <div className="space-y-6">

                {/* Full Name */}
                <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-slate-700 dark:text-slate-300 font-medium">
                        {t('label_name', { defaultValue: 'Nombre Completo' })}
                    </Label>
                    <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <Input
                            id="fullName"
                            name="fullName"
                            value={form.fullName}
                            onChange={handleInputChange}
                            placeholder="Ej. Juan Pérez"
                            className="pl-11 h-14 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-medical-500 focus:ring-medical-500/20 rounded-xl transition-all"
                        />
                    </div>
                </div>

                {/* Birth Date & Gender */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="birthDate" className="text-slate-700 dark:text-slate-300 font-medium">
                            {t('label_birth', { defaultValue: 'Fecha de Nacimiento' })}
                        </Label>
                        <div className="relative">
                            <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <Input
                                id="birthDate"
                                type="date"
                                name="birthDate"
                                value={form.birthDate}
                                onChange={handleInputChange}
                                className="pl-11 h-14 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-medical-500 focus:ring-medical-500/20 rounded-xl transition-all w-full"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="gender" className="text-slate-700 dark:text-slate-300 font-medium">
                            {t('label_gender', { defaultValue: 'Género' })}
                        </Label>
                        <div className="relative">
                            <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 z-10 pointer-events-none" />
                            <Select value={form.gender} onValueChange={(val) => handleSelectChange('gender', val)}>
                                <SelectTrigger className="pl-11 h-14 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:ring-medical-500/20 focus:border-medical-500 rounded-xl transition-all">
                                    <SelectValue placeholder="—" />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl">
                                    <SelectItem value="male">{t('gender_male', { defaultValue: 'Masculino' })}</SelectItem>
                                    <SelectItem value="female">{t('gender_female', { defaultValue: 'Femenino' })}</SelectItem>
                                    <SelectItem value="other">{t('gender_other', { defaultValue: 'Otro' })}</SelectItem>
                                    <SelectItem value="none">{t('gender_none', { defaultValue: 'Prefiero no decirlo' })}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Phone & Address */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="phoneNumber" className="text-slate-700 dark:text-slate-300 font-medium">
                            {t('label_phone', { defaultValue: 'Teléfono' })}
                        </Label>
                        <div className="relative">
                            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <Input
                                id="phoneNumber"
                                type="tel"
                                name="phoneNumber"
                                value={form.phoneNumber}
                                onChange={handleInputChange}
                                placeholder="+52..."
                                className="pl-11 h-14 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-medical-500 focus:ring-medical-500/20 rounded-xl transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="address" className="text-slate-700 dark:text-slate-300 font-medium">
                            {t('label_address', { defaultValue: 'Dirección' })}
                        </Label>
                        <div className="relative">
                            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <Input
                                id="address"
                                name="address"
                                value={form.address}
                                onChange={handleInputChange}
                                placeholder="Ciudad, Estado"
                                className="pl-11 h-14 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-medical-500 focus:ring-medical-500/20 rounded-xl transition-all"
                            />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}