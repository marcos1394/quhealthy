import React, { useState } from 'react';
import { CalendarIcon, Users } from 'lucide-react';
import { format, parse } from 'date-fns';
import { enUS, es } from 'date-fns/locale';
import { useLocale, useTranslations } from 'next-intl';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { usePatientDirectory } from '@/hooks/usePatientDirectory';
import { PatientRegistrationPayload } from '@/types/patient';

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
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                <DialogHeader>
                    <DialogTitle>{t('new_patient_modal_title')}</DialogTitle>
                    <DialogDescription>{t('new_patient_modal_description')}</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">{t('first_name_label')} *</label>
                            <Input required value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">{t('last_name_label')} *</label>
                            <Input required value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">{t('email_label')}</label>
                        <Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">{t('phone_label')}</label>
                        <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">{t('birth_date_label')}</label>
                            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className={cn(
                                            "w-full h-10 justify-start text-left font-normal rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800",
                                            !displayBirthDate && "text-slate-400 dark:text-slate-500"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4 text-slate-400" />
                                        {displayBirthDate || t('birth_date_placeholder')}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                    className="w-auto p-0 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl shadow-xl"
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
                                        className="rounded-xl"
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">{t('gender_label')}</label>
                            <div className="relative">
                                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10 pointer-events-none" />
                                <Select
                                    value={formData.gender}
                                    onValueChange={(value: 'MALE' | 'FEMALE' | 'OTHER') => setFormData({...formData, gender: value})}
                                >
                                    <SelectTrigger className="pl-10 h-10 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-medical-500/20 focus:border-medical-500">
                                        <SelectValue placeholder={t('gender_placeholder')} />
                                    </SelectTrigger>
                                    <SelectContent className="z-[80] bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-slate-200 dark:border-slate-800 rounded-xl shadow-xl">
                                        <SelectItem className="text-slate-900 dark:text-white focus:bg-slate-100 dark:focus:bg-slate-800 focus:text-slate-900 dark:focus:text-white" value="MALE">{t('gender_male')}</SelectItem>
                                        <SelectItem className="text-slate-900 dark:text-white focus:bg-slate-100 dark:focus:bg-slate-800 focus:text-slate-900 dark:focus:text-white" value="FEMALE">{t('gender_female')}</SelectItem>
                                        <SelectItem className="text-slate-900 dark:text-white focus:bg-slate-100 dark:focus:bg-slate-800 focus:text-slate-900 dark:focus:text-white" value="OTHER">{t('gender_other')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <Button type="submit" className="w-full mt-4" disabled={isSubmitting}>
                        {isSubmitting ? t('saving') : t('save_patient')}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
