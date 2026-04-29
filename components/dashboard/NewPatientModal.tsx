import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePatientDirectory } from '@/hooks/usePatientDirectory';
import { PatientRegistrationPayload } from '@/types/patient';

interface NewPatientModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (payload: PatientRegistrationPayload) => void;
}

export function NewPatientModal({ isOpen, onClose, onSuccess }: NewPatientModalProps) {
    const { createPatient, isSubmitting } = usePatientDirectory();
    const t = useTranslations('DashboardPatients');
    const [formData, setFormData] = useState<PatientRegistrationPayload>({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        birthDate: '',
        gender: undefined
    });

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
                            <Input
                                type="date"
                                value={formData.birthDate || ''}
                                onChange={e => setFormData({...formData, birthDate: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">{t('gender_label')}</label>
                            <Select
                                value={formData.gender}
                                onValueChange={(value: 'MALE' | 'FEMALE' | 'OTHER') => setFormData({...formData, gender: value})}
                            >
                                <SelectTrigger className="border-slate-200 dark:border-slate-700">
                                    <SelectValue placeholder={t('gender_placeholder')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="MALE">{t('gender_male')}</SelectItem>
                                    <SelectItem value="FEMALE">{t('gender_female')}</SelectItem>
                                    <SelectItem value="OTHER">{t('gender_other')}</SelectItem>
                                </SelectContent>
                            </Select>
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
