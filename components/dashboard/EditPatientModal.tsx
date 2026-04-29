"use client";

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePatientDirectory } from '@/hooks/usePatientDirectory';
import { PatientDirectoryProfile } from '@/types/medicalHistory';

interface EditPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientDirectoryProfile | null;
  onUpdated?: () => void;
}

export function EditPatientModal({ isOpen, onClose, patient, onUpdated }: EditPatientModalProps) {
  const { updatePatient, isSubmitting } = usePatientDirectory();
  const t = useTranslations('DashboardPatientDetail');
  const [formData, setFormData] = useState({ email: '', phone: '' });

  useEffect(() => {
    if (patient) {
      setFormData({
        email: patient.email || '',
        phone: patient.phone || ''
      });
    }
  }, [patient]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient) return;

    const success = await updatePatient(patient.id, {
      email: formData.email || undefined,
      phone: formData.phone || undefined
    });

    if (success) {
      onUpdated?.();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <DialogHeader>
          <DialogTitle>{t('edit_modal_title')}</DialogTitle>
          <DialogDescription>
            {t('edit_modal_description')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">{t('email_label')}</label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">{t('phone_label')}</label>
            <Input
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <Button type="submit" className="w-full mt-4" disabled={isSubmitting}>
            {isSubmitting ? t('saving') : t('save_changes')}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
