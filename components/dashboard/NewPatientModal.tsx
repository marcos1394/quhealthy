import React, { useState } from 'react';
import { CalendarIcon, Users } from 'lucide-react';
import { format, parse } from 'date-fns';
import { enUS, es } from 'date-fns/locale';
import { useLocale, useTranslations } from 'next-intl';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
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
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg bg-white dark:bg-[#0a0a0a] border border-black dark:border-white shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff] p-8 rounded-none">
                <DialogHeader className="mb-6 border-b border-black dark:border-white pb-6">
                    <DialogTitle className="font-serif italic text-2xl font-bold uppercase text-black dark:text-white">
                        {t('new_patient_modal_title')}
                    </DialogTitle>
                    <DialogDescription className="text-[10px] uppercase font-bold tracking-widest text-gray-500 mt-2">
                        {t('new_patient_modal_description')}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-bold tracking-widest text-black dark:text-white">{t('first_name_label')} *</label>
                            <Input 
                                required 
                                value={formData.firstName} 
                                onChange={e => setFormData({...formData, firstName: e.target.value})} 
                                className="bg-white dark:bg-[#0a0a0a] h-12 rounded-none border-black dark:border-white text-xs font-light focus-visible:ring-0 focus-visible:border-black uppercase"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-bold tracking-widest text-black dark:text-white">{t('last_name_label')} *</label>
                            <Input 
                                required 
                                value={formData.lastName} 
                                onChange={e => setFormData({...formData, lastName: e.target.value})} 
                                className="bg-white dark:bg-[#0a0a0a] h-12 rounded-none border-black dark:border-white text-xs font-light focus-visible:ring-0 focus-visible:border-black uppercase"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold tracking-widest text-black dark:text-white">{t('email_label')}</label>
                        <Input 
                            type="email" 
                            value={formData.email} 
                            onChange={e => setFormData({...formData, email: e.target.value})} 
                            className="bg-white dark:bg-[#0a0a0a] h-12 rounded-none border-black dark:border-white text-xs font-light focus-visible:ring-0 focus-visible:border-black uppercase"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold tracking-widest text-black dark:text-white">{t('phone_label')}</label>
                        <Input 
                            value={formData.phone} 
                            onChange={e => setFormData({...formData, phone: e.target.value})} 
                            className="bg-white dark:bg-[#0a0a0a] h-12 rounded-none border-black dark:border-white text-xs font-light focus-visible:ring-0 focus-visible:border-black uppercase"
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-bold tracking-widest text-black dark:text-white">{t('birth_date_label')}</label>
                            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                                <PopoverTrigger asChild>
                                    <button
                                        type="button"
                                        className={cn(
                                            "w-full h-12 px-4 flex items-center justify-start text-left font-normal rounded-none border border-black dark:border-white bg-white dark:bg-[#0a0a0a] hover:bg-gray-50 dark:hover:bg-[#111] transition-colors text-xs uppercase",
                                            !displayBirthDate ? "text-gray-400" : "text-black dark:text-white font-light"
                                        )}
                                    >
                                        <CalendarIcon className="mr-3 h-4 w-4 text-black dark:text-white" strokeWidth={1.5} />
                                        {displayBirthDate || t('birth_date_placeholder')}
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent
                                    className="w-auto p-0 bg-white dark:bg-[#0a0a0a] border border-black dark:border-white rounded-none shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff]"
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
                                        className="rounded-none bg-white dark:bg-[#0a0a0a] text-black dark:text-white p-3 font-serif"
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-bold tracking-widest text-black dark:text-white">{t('gender_label')}</label>
                            <div className="relative">
                                <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black dark:text-white z-10 pointer-events-none" strokeWidth={1.5} />
                                <Select
                                    value={formData.gender}
                                    onValueChange={(value: 'MALE' | 'FEMALE' | 'OTHER') => setFormData({...formData, gender: value})}
                                >
                                    <SelectTrigger className="pl-11 h-12 rounded-none border-black dark:border-white bg-white dark:bg-[#0a0a0a] text-black dark:text-white focus:ring-0 focus:border-black text-xs font-light uppercase">
                                        <SelectValue placeholder={t('gender_placeholder')} />
                                    </SelectTrigger>
                                    <SelectContent className="z-[100] bg-white dark:bg-[#0a0a0a] text-black dark:text-white border border-black dark:border-white rounded-none shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff]">
                                        <SelectItem className="text-[10px] font-bold uppercase tracking-widest focus:bg-black focus:text-white dark:focus:bg-white dark:focus:text-black cursor-pointer rounded-none" value="MALE">{t('gender_male')}</SelectItem>
                                        <SelectItem className="text-[10px] font-bold uppercase tracking-widest focus:bg-black focus:text-white dark:focus:bg-white dark:focus:text-black cursor-pointer rounded-none" value="FEMALE">{t('gender_female')}</SelectItem>
                                        <SelectItem className="text-[10px] font-bold uppercase tracking-widest focus:bg-black focus:text-white dark:focus:bg-white dark:focus:text-black cursor-pointer rounded-none" value="OTHER">{t('gender_other')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full h-14 bg-black text-white dark:bg-white dark:text-black flex items-center justify-center text-[10px] uppercase tracking-widest font-bold shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] mt-8 hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50 gap-3"
                    >
                        {isSubmitting ? <><QhSpinner size="sm" className="text-current"/> {t('saving')}</> : t('save_patient')}
                    </button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
