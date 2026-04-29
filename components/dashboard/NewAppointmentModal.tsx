"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { CalendarPlus, Check, ChevronsUpDown, Loader2, PlusCircle, UserPlus } from 'lucide-react';
import { toast } from 'react-toastify';
import { useTranslations } from 'next-intl';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { useCatalog } from '@/hooks/useCatalog';
import { usePatientDirectory } from '@/hooks/usePatientDirectory';
import { appointmentService } from '@/services/appointment.service';
import { useSessionStore } from '@/stores/SessionStore';
import { handleApiError } from '@/lib/handleApiError';
import { cn } from '@/lib/utils';
import { PatientClient, PatientDirectorySearchResult, PatientRegistrationPayload } from '@/types/patient';
import { UI_Service } from '@/types/catalog';
import { NewPatientModal } from '@/components/dashboard/NewPatientModal';

interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
  onSuccess?: () => void;
  initialDate?: Date | null;
}

const modalityOptions = {
  in_person: ['IN_PERSON'],
  video_call: ['ONLINE'],
  hybrid: ['IN_PERSON', 'ONLINE']
} as const;

export function NewAppointmentModal({ isOpen, onClose, onCreated, onSuccess, initialDate }: NewAppointmentModalProps) {
  const { user } = useSessionStore();
  const { services, fetchInventory, isLoading: isLoadingCatalog } = useCatalog();
  const { searchPatients } = usePatientDirectory();
  const t = useTranslations('DashboardAppointments');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [patientPickerOpen, setPatientPickerOpen] = useState(false);
  const [isNewPatientModalOpen, setIsNewPatientModalOpen] = useState(false);
  const [patientQuery, setPatientQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PatientDirectorySearchResult[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientDirectorySearchResult | null>(null);
  const [formData, setFormData] = useState({
    serviceId: '',
    appointmentDate: '',
    appointmentTime: '',
    appointmentType: 'IN_PERSON',
    notes: ''
  });

  useEffect(() => {
    if (isOpen) {
      fetchInventory();
    }
  }, [fetchInventory, isOpen]);

  useEffect(() => {
    if (!isOpen || !initialDate) return;
    const year = initialDate.getFullYear();
    const month = `${initialDate.getMonth() + 1}`.padStart(2, '0');
    const day = `${initialDate.getDate()}`.padStart(2, '0');
    const hours = `${initialDate.getHours()}`.padStart(2, '0');
    const minutes = `${initialDate.getMinutes()}`.padStart(2, '0');
    setFormData((current) => ({
      ...current,
      appointmentDate: `${year}-${month}-${day}`,
      appointmentTime: `${hours}:${minutes}`
    }));
  }, [initialDate, isOpen]);

  const selectedService = useMemo(
    () => services.find((service) => String(service.id) === formData.serviceId) || null,
    [formData.serviceId, services]
  );

  useEffect(() => {
    if (!selectedService) return;

    const supportedTypes = (modalityOptions[selectedService.serviceDeliveryType] || ['IN_PERSON']) as readonly string[];
    setFormData((current) => ({
      ...current,
      appointmentType: supportedTypes.includes(current.appointmentType)
        ? current.appointmentType
        : supportedTypes[0]
    }));
  }, [selectedService]);

  useEffect(() => {
    if (!isOpen) return;

    const query = patientQuery.trim();
    if (query.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      setIsSearching(true);
      const results = await searchPatients(query);
      setSearchResults(results);
      setIsSearching(false);
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [isOpen, patientQuery, searchPatients]);

  const resetState = () => {
    setPatientQuery('');
    setSearchResults([]);
    setSelectedPatient(null);
    setPatientPickerOpen(false);
    setFormData({
      serviceId: '',
      appointmentDate: '',
      appointmentTime: '',
      appointmentType: 'IN_PERSON',
      notes: ''
    });
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !selectedPatient || !selectedService) return;

    setIsSubmitting(true);
    try {
      const payload = {
        providerId: user.id,
        patientDirectoryId: selectedPatient.id,
        serviceId: selectedService.id,
        startTime: `${formData.appointmentDate}T${formData.appointmentTime}:00`,
        appointmentType: formData.appointmentType,
        paymentMethod: 'CASH',
        consumerSymptoms: formData.notes || undefined
      };

      await appointmentService.createProviderAppointment(payload);
      toast.success(t('toast_appointment_created'));
      onCreated?.();
      onSuccess?.();
      handleClose();
    } catch (error) {
      handleApiError(error, t('toast_appointment_failed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePatientCreated = async (payload: PatientRegistrationPayload) => {
    const query = payload.email || `${payload.firstName} ${payload.lastName}`;
    const results = await searchPatients(query);
    const normalizedName = `${payload.firstName} ${payload.lastName}`.toLowerCase();
    const createdPatient = results.find((patient) =>
      getPatientDisplayEmail(patient).toLowerCase() === payload.email?.toLowerCase() ||
      getPatientDisplayName(patient).toLowerCase() === normalizedName
    );

    if (createdPatient) {
      setSelectedPatient(createdPatient);
      setPatientQuery(getPatientDisplayName(createdPatient));
    }
  };

  const supportedTypes = selectedService
    ? modalityOptions[selectedService.serviceDeliveryType] || ['IN_PERSON']
    : ['IN_PERSON'];

  const getPatientDisplayName = (patient: PatientDirectorySearchResult | PatientClient) => {
    if ('firstName' in patient || 'lastName' in patient) {
      const firstName = 'firstName' in patient ? patient.firstName : '';
      const lastName = 'lastName' in patient ? patient.lastName : '';
      const fullName = `${firstName || ''} ${lastName || ''}`.trim();
      return fullName || t('new_appointment_modal.unknown_patient');
    }

    return patient.consumer?.name || t('new_appointment_modal.unknown_patient');
  };

  const getPatientDisplayEmail = (patient: PatientDirectorySearchResult | PatientClient) =>
    ('email' in patient ? patient.email : patient.consumer?.email) || '';

  const getPatientDisplayPhone = (patient: PatientDirectorySearchResult | PatientClient) =>
    ('phone' in patient ? patient.phone : patient.consumer?.phone) || '';

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="sm:max-w-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarPlus className="w-5 h-5 text-medical-600" />
              {t('new_appointment_modal.title')}
            </DialogTitle>
            <DialogDescription>
              {t('new_appointment_modal.description')}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5 mt-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">{t('new_appointment_modal.patient_label')} *</label>
              <div className="flex gap-2">
                <Popover open={patientPickerOpen} onOpenChange={setPatientPickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <span className="truncate text-left">
                        {selectedPatient ? getPatientDisplayName(selectedPatient) : t('new_appointment_modal.patient_placeholder')}
                      </span>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="z-[90] w-[var(--radix-popover-trigger-width)] min-w-[320px] p-0 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
                    align="start"
                    sideOffset={8}
                  >
                    <Command className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                      <CommandInput
                        placeholder={t('new_appointment_modal.patient_search_placeholder')}
                        value={patientQuery}
                        onValueChange={setPatientQuery}
                      />
                      <CommandList className="max-h-[280px]">
                        {isSearching ? (
                          <div className="flex items-center gap-2 px-3 py-4 text-sm text-slate-500 dark:text-slate-400">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            {t('new_appointment_modal.searching_patients')}
                          </div>
                        ) : null}
                        {!isSearching && patientQuery.trim().length < 2 ? (
                          <div className="px-3 py-4 text-sm text-slate-500 dark:text-slate-400">
                            {t('new_appointment_modal.min_search_length')}
                          </div>
                        ) : null}
                        <CommandEmpty>{t('new_appointment_modal.no_patients_found')}</CommandEmpty>
                        <CommandGroup className="p-2">
                          {searchResults.map((patient) => (
                            <CommandItem
                              key={patient.id}
                              value={`${getPatientDisplayName(patient)} ${getPatientDisplayEmail(patient)} ${getPatientDisplayPhone(patient)}`}
                              onSelect={() => {
                                setSelectedPatient(patient);
                                setPatientQuery(getPatientDisplayName(patient));
                                setPatientPickerOpen(false);
                              }}
                              className="flex items-center justify-between gap-3 rounded-xl px-3 py-3 text-slate-900 dark:text-white aria-selected:bg-slate-100 dark:aria-selected:bg-slate-800 aria-selected:text-slate-900 dark:aria-selected:text-white"
                            >
                              <div className="min-w-0">
                                <p className="font-medium text-slate-900 dark:text-white truncate">
                                  {getPatientDisplayName(patient)}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                  {getPatientDisplayEmail(patient) || getPatientDisplayPhone(patient) || t('new_appointment_modal.patient_record_id', { id: patient.id })}
                                </p>
                              </div>
                              <Check
                                className={cn(
                                  'h-4 w-4',
                                  selectedPatient?.id === patient.id ? 'opacity-100' : 'opacity-0'
                                )}
                              />
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsNewPatientModalOpen(true)}
                  className="rounded-xl border-slate-200 dark:border-slate-700"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  {t('new_appointment_modal.new_patient_button')}
                </Button>
              </div>
              {selectedPatient ? (
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 px-4 py-3">
                  <p className="font-medium text-slate-900 dark:text-white">{getPatientDisplayName(selectedPatient)}</p>
                  <p className="text-sm text-slate-500">
                    {getPatientDisplayEmail(selectedPatient) || t('new_appointment_modal.no_email')} {getPatientDisplayPhone(selectedPatient) ? `• ${getPatientDisplayPhone(selectedPatient)}` : ''}
                  </p>
                </div>
              ) : null}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">{t('new_appointment_modal.service_label')} *</label>
                <Select
                  value={formData.serviceId}
                  onValueChange={(value) => setFormData({ ...formData, serviceId: value })}
                >
                  <SelectTrigger className="rounded-xl border-slate-200 dark:border-slate-700">
                    <SelectValue placeholder={isLoadingCatalog ? t('new_appointment_modal.loading_services') : t('new_appointment_modal.service_placeholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service: UI_Service) => (
                      <SelectItem key={service.id} value={String(service.id)}>
                        {service.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">{t('new_appointment_modal.modality_label')} *</label>
                <Select
                  value={formData.appointmentType}
                  onValueChange={(value) => setFormData({ ...formData, appointmentType: value })}
                  disabled={!selectedService || supportedTypes.length === 1}
                >
                  <SelectTrigger className="rounded-xl border-slate-200 dark:border-slate-700">
                    <SelectValue placeholder={t('new_appointment_modal.modality_placeholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {supportedTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type === 'ONLINE' ? t('card.online') : t('card.in_person')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">{t('new_appointment_modal.date_label')} *</label>
                <Input
                  type="date"
                  required
                  value={formData.appointmentDate}
                  onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">{t('new_appointment_modal.time_label')} *</label>
                <Input
                  type="time"
                  required
                  value={formData.appointmentTime}
                  onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">{t('new_appointment_modal.notes_label')}</label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder={t('new_appointment_modal.notes_placeholder')}
                className="min-h-[110px] rounded-xl border-slate-200 dark:border-slate-700"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={handleClose} className="rounded-xl">
                {t('new_appointment_modal.cancel')}
              </Button>
              <Button
                type="submit"
                disabled={
                  isSubmitting ||
                  !selectedPatient ||
                  !formData.serviceId ||
                  !formData.appointmentDate ||
                  !formData.appointmentTime
                }
                className="rounded-xl bg-slate-900 text-white hover:bg-slate-800"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <PlusCircle className="w-4 h-4 mr-2" />}
                {isSubmitting ? t('new_appointment_modal.creating') : t('new_appointment_modal.create')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <NewPatientModal
        isOpen={isNewPatientModalOpen}
        onClose={() => setIsNewPatientModalOpen(false)}
        onSuccess={handlePatientCreated}
      />
    </>
  );
}
