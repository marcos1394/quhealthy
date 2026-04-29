"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { CalendarPlus, Check, ChevronsUpDown, Loader2, PlusCircle, UserPlus } from 'lucide-react';
import { toast } from 'react-toastify';
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
import { PatientClient, PatientRegistrationPayload } from '@/types/patient';
import { UI_Service } from '@/types/catalog';
import { NewPatientModal } from '@/components/dashboard/NewPatientModal';

interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

const modalityOptions = {
  in_person: ['IN_PERSON'],
  video_call: ['ONLINE'],
  hybrid: ['IN_PERSON', 'ONLINE']
} as const;

export function NewAppointmentModal({ isOpen, onClose, onCreated }: NewAppointmentModalProps) {
  const { user } = useSessionStore();
  const { services, fetchInventory, isLoading: isLoadingCatalog } = useCatalog();
  const { searchPatients } = usePatientDirectory();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [patientPickerOpen, setPatientPickerOpen] = useState(false);
  const [isNewPatientModalOpen, setIsNewPatientModalOpen] = useState(false);
  const [patientQuery, setPatientQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PatientClient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientClient | null>(null);
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

      await appointmentService.createAppointment(payload);
      toast.success('Cita creada exitosamente.');
      onCreated?.();
      handleClose();
    } catch (error) {
      handleApiError(error, 'No se pudo crear la cita.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePatientCreated = async (payload: PatientRegistrationPayload) => {
    const query = payload.email || `${payload.firstName} ${payload.lastName}`;
    const results = await searchPatients(query);
    const normalizedName = `${payload.firstName} ${payload.lastName}`.toLowerCase();
    const createdPatient = results.find((patient) =>
      patient.consumer.email?.toLowerCase() === payload.email?.toLowerCase() ||
      patient.consumer.name.toLowerCase() === normalizedName
    );

    if (createdPatient) {
      setSelectedPatient(createdPatient);
      setPatientQuery(createdPatient.consumer.name);
    }
  };

  const supportedTypes = selectedService
    ? modalityOptions[selectedService.serviceDeliveryType] || ['IN_PERSON']
    : ['IN_PERSON'];

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="sm:max-w-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarPlus className="w-5 h-5 text-medical-600" />
              Nueva cita
            </DialogTitle>
            <DialogDescription>
              Selecciona un paciente del directorio o créalo al momento para vincular la cita.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5 mt-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase">Paciente *</label>
              <div className="flex gap-2">
                <Popover open={patientPickerOpen} onOpenChange={setPatientPickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between rounded-xl border-slate-200 dark:border-slate-700"
                    >
                      <span className="truncate text-left">
                        {selectedPatient ? selectedPatient.consumer.name : 'Buscar paciente en el directorio'}
                      </span>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[420px] p-0 border-slate-200 dark:border-slate-800">
                    <Command>
                      <CommandInput
                        placeholder="Escribe nombre, correo o teléfono..."
                        value={patientQuery}
                        onValueChange={setPatientQuery}
                      />
                      <CommandList>
                        {isSearching ? (
                          <div className="flex items-center gap-2 px-3 py-4 text-sm text-slate-500">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Buscando pacientes...
                          </div>
                        ) : null}
                        {!isSearching && patientQuery.trim().length < 2 ? (
                          <div className="px-3 py-4 text-sm text-slate-500">
                            Escribe al menos 2 caracteres para buscar.
                          </div>
                        ) : null}
                        <CommandEmpty>No encontramos pacientes con ese criterio.</CommandEmpty>
                        <CommandGroup>
                          {searchResults.map((patient) => (
                            <CommandItem
                              key={patient.id}
                              value={`${patient.consumer.name} ${patient.consumer.email || ''} ${patient.consumer.phone || ''}`}
                              onSelect={() => {
                                setSelectedPatient(patient);
                                setPatientQuery(patient.consumer.name);
                                setPatientPickerOpen(false);
                              }}
                              className="flex items-center justify-between gap-3"
                            >
                              <div className="min-w-0">
                                <p className="font-medium text-slate-900 dark:text-white truncate">
                                  {patient.consumer.name}
                                </p>
                                <p className="text-xs text-slate-500 truncate">
                                  {patient.consumer.email || patient.consumer.phone || `Expediente #${patient.id}`}
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
                  Nuevo
                </Button>
              </div>
              {selectedPatient ? (
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 px-4 py-3">
                  <p className="font-medium text-slate-900 dark:text-white">{selectedPatient.consumer.name}</p>
                  <p className="text-sm text-slate-500">
                    {selectedPatient.consumer.email || 'Sin correo'} {selectedPatient.consumer.phone ? `• ${selectedPatient.consumer.phone}` : ''}
                  </p>
                </div>
              ) : null}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase">Servicio *</label>
                <Select
                  value={formData.serviceId}
                  onValueChange={(value) => setFormData({ ...formData, serviceId: value })}
                >
                  <SelectTrigger className="rounded-xl border-slate-200 dark:border-slate-700">
                    <SelectValue placeholder={isLoadingCatalog ? 'Cargando servicios...' : 'Selecciona un servicio'} />
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
                <label className="text-xs font-semibold text-slate-500 uppercase">Modalidad *</label>
                <Select
                  value={formData.appointmentType}
                  onValueChange={(value) => setFormData({ ...formData, appointmentType: value })}
                  disabled={!selectedService || supportedTypes.length === 1}
                >
                  <SelectTrigger className="rounded-xl border-slate-200 dark:border-slate-700">
                    <SelectValue placeholder="Selecciona modalidad" />
                  </SelectTrigger>
                  <SelectContent>
                    {supportedTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type === 'ONLINE' ? 'Videollamada' : 'Presencial'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase">Fecha *</label>
                <Input
                  type="date"
                  required
                  value={formData.appointmentDate}
                  onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase">Hora *</label>
                <Input
                  type="time"
                  required
                  value={formData.appointmentTime}
                  onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase">Notas</label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Motivo de consulta, observaciones o síntomas iniciales"
                className="min-h-[110px] rounded-xl border-slate-200 dark:border-slate-700"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={handleClose} className="rounded-xl">
                Cancelar
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
                Crear cita
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
