"use client";

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { User, Calendar as CalendarIcon, Phone, MapPin, Users } from 'lucide-react';
import { format, parse, isValid } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import { useLocale } from 'next-intl';

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { ConsumerProfile } from '@/types/consumerProfile';

interface Props {
    form: ConsumerProfile;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSelectChange: (name: string, value: string) => void;
}

export function ProfilePersonalSection({ form, handleInputChange, handleSelectChange }: Props) {
    const t = useTranslations('PatientProfile');
    const locale = useLocale();
    const dateLocale = locale === 'es' ? es : enUS;

    const [calendarOpen, setCalendarOpen] = useState(false);

    // Parse birthDate string (YYYY-MM-DD) to Date object for the Calendar
    const selectedDate = form.birthDate
        ? parse(form.birthDate, 'yyyy-MM-dd', new Date())
        : undefined;

    const handleDateSelect = (date: Date | undefined) => {
        if (date && isValid(date)) {
            // Create a synthetic event to maintain compatibility with handleInputChange
            const syntheticEvent = {
                target: {
                    name: 'birthDate',
                    value: format(date, 'yyyy-MM-dd'),
                },
            } as React.ChangeEvent<HTMLInputElement>;
            handleInputChange(syntheticEvent);
            setCalendarOpen(false);
        }
    };

    const displayDate = selectedDate && isValid(selectedDate)
        ? format(selectedDate, 'PPP', { locale: dateLocale })
        : null;

    return (
        <div className="space-y-8">
            {/* Section Header */}
            <div className="pb-6 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-xl">
                        <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-xl font-medium text-slate-900 dark:text-white tracking-tight">
                        {t('section_personal')}
                    </h3>
                </div>
                <p className="text-slate-500 dark:text-slate-400 font-light text-sm ml-12">
                    {t('section_personal_desc')}
                </p>
            </div>

            {/* Fields */}
            <div className="space-y-6">

                {/* Full Name */}
                <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-slate-700 dark:text-slate-300 font-medium">
                        {t('label_name')}
                    </Label>
                    <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <Input
                            id="fullName"
                            name="fullName"
                            value={form.fullName}
                            onChange={handleInputChange}
                            placeholder={t('placeholder_name', { defaultValue: 'Ej. Juan Pérez López' })}
                            className="pl-11 h-14 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-medical-500 focus:ring-medical-500/20 rounded-xl transition-all"
                        />
                    </div>
                </div>

                {/* Birth Date (Popover Calendar) & Biological Sex */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Elegant Date Picker */}
                    <div className="space-y-2">
                        <Label className="text-slate-700 dark:text-slate-300 font-medium">
                            {t('label_birth')}
                        </Label>
                        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className={cn(
                                        "w-full h-14 justify-start text-left font-normal rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all",
                                        !displayDate && "text-slate-400"
                                    )}
                                >
                                    <CalendarIcon className="mr-3 h-5 w-5 text-slate-400" />
                                    {displayDate || t('placeholder_birth', { defaultValue: 'Selecciona tu fecha de nacimiento' })}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent
                                className="w-auto p-0 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl shadow-xl"
                                align="start"
                            >
                                <Calendar
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={handleDateSelect}
                                    disabled={(date) =>
                                        date > new Date() || date < new Date("1900-01-01")
                                    }
                                    defaultMonth={selectedDate || new Date(2000, 0)}
                                    captionLayout="dropdown-buttons"
                                    fromYear={1920}
                                    toYear={new Date().getFullYear()}
                                    locale={dateLocale}
                                    className="rounded-xl"
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Biological Sex */}
                    <div className="space-y-2">
                        <Label htmlFor="gender" className="text-slate-700 dark:text-slate-300 font-medium">
                            {t('label_gender')}
                        </Label>
                        <div className="relative">
                            <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 z-10 pointer-events-none" />
                            <Select value={form.gender} onValueChange={(val) => handleSelectChange('gender', val)}>
                                <SelectTrigger className="pl-11 h-14 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:ring-medical-500/20 focus:border-medical-500 rounded-xl transition-all">
                                    <SelectValue placeholder="—" />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl">
                                    <SelectItem value="male">{t('gender_male')}</SelectItem>
                                    <SelectItem value="female">{t('gender_female')}</SelectItem>
                                    <SelectItem value="other">{t('gender_other')}</SelectItem>
                                    <SelectItem value="none">{t('gender_none')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Location & Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Location (City / Postal Code) */}
                    <div className="space-y-2">
                        <Label htmlFor="address" className="text-slate-700 dark:text-slate-300 font-medium">
                            {t('label_address')}
                        </Label>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-light">
                            {t('help_address', { defaultValue: 'Solo ciudad o código postal, para conectarte con especialistas cercanos.' })}
                        </p>
                        <div className="relative">
                            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <Input
                                id="address"
                                name="address"
                                value={form.address}
                                onChange={handleInputChange}
                                placeholder={t('placeholder_address', { defaultValue: 'Ej. Ciudad de México, CDMX' })}
                                className="pl-11 h-14 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-medical-500 focus:ring-medical-500/20 rounded-xl transition-all"
                            />
                        </div>
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                        <Label htmlFor="phoneNumber" className="text-slate-700 dark:text-slate-300 font-medium">
                            {t('label_phone')}
                        </Label>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-light">
                            {t('help_phone', { defaultValue: 'Para recordatorios de citas vía WhatsApp.' })}
                        </p>
                        <div className="relative">
                            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <Input
                                id="phoneNumber"
                                type="tel"
                                name="phoneNumber"
                                value={form.phoneNumber}
                                onChange={handleInputChange}
                                placeholder="+52 55 1234 5678"
                                className="pl-11 h-14 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-medical-500 focus:ring-medical-500/20 rounded-xl transition-all"
                            />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}