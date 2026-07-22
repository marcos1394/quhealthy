"use client";
/* eslint-disable react-doctor/no-event-handler */
/* eslint-disable react-doctor/prefer-module-scope-pure-function */
/* eslint-disable react-doctor/no-giant-component */

import React, { useEffect, useMemo, useState } from "react";
import {
  CalendarPlus,
  Check,
  ChevronsUpDown,
  Loader2,
  PlusCircle,
  UserPlus,
  Search,
} from "lucide-react";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DatePicker } from "@/components/ui/date-picker";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useCatalog } from "@/hooks/useCatalog";
import { usePatientDirectory } from "@/hooks/usePatientDirectory";
import { appointmentService } from "@/services/appointment.service";
import { useSessionStore } from "@/stores/SessionStore";
import { handleApiError } from "@/lib/handleApiError";
import { cn } from "@/lib/utils";
import {
  PatientClient,
  PatientDirectorySearchResult,
  PatientRegistrationPayload,
} from "@/types/patient";
import { UI_Service } from "@/types/catalog";
import { NewPatientModal } from "@/components/dashboard/NewPatientModal";
import { QhSpinner } from "@/components/ui/QhSpinner";

// CÁMBIALO POR ESTO:
interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
  onSuccess?: () => void;
  initialDate?: Date | null;
  locationId: number; // 🚀 FASE 2.3: Requerido para agendar en la sede correcta
}

const modalityOptions = {
  in_person: ["IN_PERSON"],
  video_call: ["ONLINE"],
  hybrid: ["IN_PERSON", "ONLINE"],
} as const;

export function NewAppointmentModal({
  isOpen,
  onClose,
  onCreated,
  onSuccess,
  initialDate,
  locationId,
}: NewAppointmentModalProps) {
  const { user } = useSessionStore();
  const {
    services,
    fetchInventory,
    isLoading: isLoadingCatalog,
  } = useCatalog();
  const { clients, fetchClients, searchPatients } = usePatientDirectory();
  const t = useTranslations("DashboardAppointments");

  const [
    {
      isSubmitting,
      isSearching,
      patientPickerOpen,
      isNewPatientModalOpen,
      patientQuery,
      searchResults,
      selectedPatient,
    },
    dispatch,
  ] = React.useReducer(
    (state: any, action: any) => {
      switch (action.type) {
        case "SET_ISSUBMITTING":
          return {
            ...state,
            isSubmitting:
              typeof action.payload === "function"
                ? action.payload(state.isSubmitting)
                : action.payload,
          };
        case "SET_ISSEARCHING":
          return {
            ...state,
            isSearching:
              typeof action.payload === "function"
                ? action.payload(state.isSearching)
                : action.payload,
          };
        case "SET_PATIENTPICKEROPEN":
          return {
            ...state,
            patientPickerOpen:
              typeof action.payload === "function"
                ? action.payload(state.patientPickerOpen)
                : action.payload,
          };
        case "SET_ISNEWPATIENTMODALOPEN":
          return {
            ...state,
            isNewPatientModalOpen:
              typeof action.payload === "function"
                ? action.payload(state.isNewPatientModalOpen)
                : action.payload,
          };
        case "SET_PATIENTQUERY":
          return {
            ...state,
            patientQuery:
              typeof action.payload === "function"
                ? action.payload(state.patientQuery)
                : action.payload,
          };
        case "SET_SEARCHRESULTS":
          return {
            ...state,
            searchResults:
              typeof action.payload === "function"
                ? action.payload(state.searchResults)
                : action.payload,
          };
        case "SET_SELECTEDPATIENT":
          return {
            ...state,
            selectedPatient:
              typeof action.payload === "function"
                ? action.payload(state.selectedPatient)
                : action.payload,
          };
        default:
          return state;
      }
    },
    {
      isSubmitting: false,
      isSearching: false,
      patientPickerOpen: false,
      isNewPatientModalOpen: false,
      patientQuery: "",
      searchResults: [],
      selectedPatient: null,
    },
  );

  const setIsSubmitting = (val: any) =>
    dispatch({ type: "SET_ISSUBMITTING", payload: val });
  const setIsSearching = (val: any) =>
    dispatch({ type: "SET_ISSEARCHING", payload: val });
  const setPatientPickerOpen = (val: any) =>
    dispatch({ type: "SET_PATIENTPICKEROPEN", payload: val });
  const setIsNewPatientModalOpen = (val: any) =>
    dispatch({ type: "SET_ISNEWPATIENTMODALOPEN", payload: val });
  const setPatientQuery = (val: any) =>
    dispatch({ type: "SET_PATIENTQUERY", payload: val });
  const setSearchResults = (val: any) =>
    dispatch({ type: "SET_SEARCHRESULTS", payload: val });
  const setSelectedPatient = (val: any) =>
    dispatch({ type: "SET_SELECTEDPATIENT", payload: val });

  const [formData, setFormData] = useState({
    serviceId: "",
    appointmentDate: "",
    appointmentTime: "",
    appointmentType: "IN_PERSON",
    paymentMethod: "CASH",
    notes: "",
  });

  useEffect(() => {
    if (isOpen) {
      fetchInventory();
      fetchClients();
    }
  }, [fetchClients, fetchInventory, isOpen]);

  useEffect(() => {
    if (!isOpen || !initialDate) return;
    const year = initialDate.getFullYear();
    const month = `${initialDate.getMonth() + 1}`.padStart(2, "0");
    const day = `${initialDate.getDate()}`.padStart(2, "0");
    const hours = `${initialDate.getHours()}`.padStart(2, "0");
    const minutes = `${initialDate.getMinutes()}`.padStart(2, "0");
    setFormData((current) => ({
      ...current,
      appointmentDate: `${year}-${month}-${day}`,
      appointmentTime: `${hours}:${minutes}`,
    }));
  }, [initialDate, isOpen]);

  const selectedService = useMemo(
    () =>
      services.find((service) => String(service.id) === formData.serviceId) ||
      null,
    [formData.serviceId, services],
  );

  useEffect(() => {
    if (!selectedService) return;

    const supportedTypes = (modalityOptions[
      selectedService.serviceDeliveryType
    ] || ["IN_PERSON"]) as readonly string[];
    setFormData((current) => ({
      ...current,
      appointmentType: supportedTypes.includes(current.appointmentType)
        ? current.appointmentType
        : supportedTypes[0],
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
    setPatientQuery("");
    setSearchResults([]);
    setSelectedPatient(null);
    setPatientPickerOpen(false);
    setFormData({
      serviceId: "",
      appointmentDate: "",
      appointmentTime: "",
      appointmentType: "IN_PERSON",
      paymentMethod: "CASH",
      notes: "",
    });
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleSelectPatient = (patient: PatientDirectorySearchResult) => {
    setSelectedPatient(patient);
    setPatientQuery(getPatientDisplayName(patient));
    setPatientPickerOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !selectedPatient || !selectedService) return;

    setIsSubmitting(true);
    // CÁMBIALO POR ESTO:
    try {
      const payload = {
        providerId: user.id,
        patientDirectoryId: selectedPatient.id,
        serviceId: selectedService.id,
        startTime: `${formData.appointmentDate}T${formData.appointmentTime}:00`,
        appointmentType: formData.appointmentType,
        paymentMethod: formData.paymentMethod,
        consumerSymptoms: formData.notes || undefined,
        locationId: locationId, // 🚀 FASE 2.3: Inyectado en el payload para el Backend
      };

      await appointmentService.createProviderAppointment(payload);
      toast.success(t("toast_appointment_created"));
      onCreated?.();
      onSuccess?.();
      handleClose();
    } catch (error) {
      handleApiError(error, t("toast_appointment_failed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePatientCreated = async (payload: PatientRegistrationPayload) => {
    await fetchClients();
    const query = payload.email || `${payload.firstName} ${payload.lastName}`;
    const results = await searchPatients(query);
    const normalizedName =
      `${payload.firstName} ${payload.lastName}`.toLowerCase();
    const createdPatient = results.find(
      (patient) =>
        getPatientDisplayEmail(patient).toLowerCase() ===
          payload.email?.toLowerCase() ||
        getPatientDisplayName(patient).toLowerCase() === normalizedName,
    );

    if (createdPatient) {
      setSelectedPatient(createdPatient);
      setPatientQuery(getPatientDisplayName(createdPatient));
    }
  };

  const supportedTypes = selectedService
    ? modalityOptions[selectedService.serviceDeliveryType] || ["IN_PERSON"]
    : ["IN_PERSON"];

  const defaultPatients = useMemo<PatientDirectorySearchResult[]>(
    () =>
      clients.map((client) => ({
        id: client.id,
        providerId: user?.id || 0,
        consumerId: client.consumer.id ?? null,
        firstName: client.consumer.name,
        lastName: "",
        email: client.consumer.email || null,
        phone: client.consumer.phone || null,
        birthDate: null,
        gender: null,
        createdAt: "",
        platformUser: true,
      })),
    [clients, user?.id],
  );

  const displayedPatients =
    patientQuery.trim().length < 2 ? defaultPatients : searchResults;

  const getPatientDisplayName = (
    patient: PatientDirectorySearchResult | PatientClient,
  ) => {
    if ("firstName" in patient || "lastName" in patient) {
      const firstName = "firstName" in patient ? patient.firstName : "";
      const lastName = "lastName" in patient ? patient.lastName : "";
      const fullName = `${firstName || ""} ${lastName || ""}`.trim();
      return fullName || t("new_appointment_modal.unknown_patient");
    }

    return patient.consumer?.name || t("new_appointment_modal.unknown_patient");
  };

  const getPatientDisplayEmail = (
    patient: PatientDirectorySearchResult | PatientClient,
  ) => ("email" in patient ? patient.email : patient.consumer?.email) || "";

  const getPatientDisplayPhone = (
    patient: PatientDirectorySearchResult | PatientClient,
  ) => ("phone" in patient ? patient.phone : patient.consumer?.phone) || "";

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="sm:max-w-3xl bg-white dark:bg-[#0a0a0a] border border-black dark:border-white p-0 rounded-none overflow-hidden max-h-[90vh] flex flex-col">
          {/* HEADER ARQUITECTÓNICO */}
          <DialogHeader className="p-6 md:p-8 border-b border-black dark:border-white bg-white dark:bg-[#0a0a0a] shrink-0">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] flex items-center justify-center shrink-0">
                <CalendarPlus
                  className="w-5 h-5 text-black dark:text-white"
                  strokeWidth={1.5}
                />
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">
                  {t("new_appointment_modal.description")}
                </p>
                <DialogTitle className="text-xl md:text-2xl font-semibold uppercase tracking-tight text-black dark:text-white leading-none">
                  {t("new_appointment_modal.title")}
                </DialogTitle>
              </div>
            </div>
          </DialogHeader>

          {/* BODY: GRID BLUEPRINT */}
          <form
            onSubmit={handleSubmit}
            className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50 dark:bg-[#050505] flex flex-col"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-b border-black/10 dark:border-white/10">
              {/* Paciente */}
              <div className="col-span-1 md:col-span-2 border-b border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0a] p-6 md:p-8 flex flex-col">
                <label className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-3 flex items-center gap-2">
                  <span className="w-4 h-4 flex items-center justify-center border border-black/20 dark:border-white/20">
                    1
                  </span>
                  {t("new_appointment_modal.patient_label")} *
                </label>

                <div className="flex flex-col sm:flex-row gap-0 border border-black/20 dark:border-white/20">
                  <Popover
                    open={patientPickerOpen}
                    onOpenChange={setPatientPickerOpen}
                    modal={false}
                  >
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        role="combobox"
                        aria-expanded={patientPickerOpen}
                        aria-controls="patient-list"
                        className="w-full flex-1 flex items-center justify-between h-12 px-4 rounded-none bg-gray-50 dark:bg-[#050505] text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors text-xs font-semibold uppercase tracking-widest border-b sm:border-b-0 sm:border-r border-black/20 dark:border-white/20"
                      >
                        <span className="truncate text-left">
                          {selectedPatient
                            ? getPatientDisplayName(selectedPatient)
                            : t("new_appointment_modal.patient_placeholder")}
                        </span>
                        <ChevronsUpDown
                          className="ml-2 h-4 w-4 shrink-0 opacity-50"
                          strokeWidth={1.5}
                        />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="z-[9999] w-[var(--radix-popover-trigger-width)] min-w-[320px] p-0 bg-white dark:bg-[#0a0a0a] border border-black dark:border-white rounded-none shadow-xl overflow-hidden"
                      align="start"
                      sideOffset={0}
                    >
                      <Command
                        shouldFilter={false}
                        className="bg-white dark:bg-[#0a0a0a] text-black dark:text-white rounded-none"
                      >
                        <div className="relative">
                          <Search
                            className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                            strokeWidth={1.5}
                          />
                          <CommandInput
                            placeholder={t(
                              "new_appointment_modal.patient_search_placeholder",
                            )}
                            value={patientQuery}
                            onValueChange={setPatientQuery}
                            className="rounded-none border-none focus:ring-0 text-xs font-semibold uppercase tracking-widest h-12 bg-gray-50 dark:bg-[#050505] border-b border-black/20 dark:border-white/20 pl-11"
                          />
                        </div>
                        <CommandList className="max-h-[280px] rounded-none">
                          {isSearching ? (
                            <div className="flex items-center gap-3 px-4 py-4 text-[9px] uppercase tracking-widest font-bold text-gray-500">
                              <Loader2
                                className="w-4 h-4 animate-spin"
                                strokeWidth={1.5}
                              />
                              {t("new_appointment_modal.searching_patients")}
                            </div>
                          ) : null}
                          {!isSearching &&
                          displayedPatients.length === 0 &&
                          patientQuery.trim().length < 2 ? (
                            <div className="px-4 py-4 text-[9px] uppercase tracking-widest font-bold text-gray-500 bg-gray-50 dark:bg-[#050505]">
                              {t("new_appointment_modal.no_patients_available")}
                            </div>
                          ) : null}
                          <CommandEmpty className="py-4 text-center text-[9px] uppercase tracking-widest font-bold text-gray-500">
                            {t("new_appointment_modal.no_patients_found")}
                          </CommandEmpty>
                          <CommandGroup className="p-0">
                            {displayedPatients.map((patient: any) => (
                              <CommandItem
                                key={patient.id}
                                value={String(patient.id)}
                                onSelect={() => handleSelectPatient(patient)}
                                disabled={false}
                                style={{ pointerEvents: "auto", opacity: 1 }}
                                className="flex items-center justify-between gap-4 px-4 py-3 text-black dark:text-white cursor-pointer hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black border-b border-black/10 dark:border-white/10 last:border-0 rounded-none transition-colors group"
                              >
                                <div className="min-w-0">
                                  <p className="text-[10px] uppercase font-bold tracking-widest truncate group-hover:text-white dark:group-hover:text-black">
                                    {getPatientDisplayName(patient)}
                                  </p>
                                  <p className="text-[9px] uppercase tracking-widest text-gray-500 group-hover:text-gray-400 truncate mt-1">
                                    {getPatientDisplayEmail(patient) ||
                                      getPatientDisplayPhone(patient) ||
                                      t(
                                        "new_appointment_modal.patient_record_id",
                                        { id: patient.id },
                                      )}
                                  </p>
                                </div>
                                <Check
                                  strokeWidth={2}
                                  className={cn(
                                    "h-4 w-4 shrink-0",
                                    selectedPatient?.id === patient.id
                                      ? "opacity-100 group-hover:text-white dark:group-hover:text-black text-black dark:text-white"
                                      : "opacity-0",
                                  )}
                                />
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>

                  <button
                    type="button"
                    onClick={() => setIsNewPatientModalOpen(true)}
                    className="shrink-0 h-12 px-6 flex items-center justify-center bg-white dark:bg-[#0a0a0a] text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors text-[10px] uppercase font-bold tracking-widest"
                  >
                    <UserPlus className="w-4 h-4 mr-2" strokeWidth={1.5} />
                    {t("new_appointment_modal.new_patient_button")}
                  </button>
                </div>

                {selectedPatient && (
                  <div className="mt-4 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] p-4 text-[10px] uppercase font-bold tracking-widest text-black dark:text-white">
                    <p className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-emerald-500" />
                      {getPatientDisplayName(selectedPatient)}
                    </p>
                    <p className="text-gray-500 mt-2 pl-4">
                      {getPatientDisplayEmail(selectedPatient) ||
                        t("new_appointment_modal.no_email")}{" "}
                      {getPatientDisplayPhone(selectedPatient)
                        ? `| ${getPatientDisplayPhone(selectedPatient)}`
                        : ""}
                    </p>
                  </div>
                )}
              </div>

              {/* Servicio */}
              <div className="col-span-1 border-b border-r border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0a] p-6 flex flex-col">
                <label className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-3 flex items-center gap-2">
                  <span className="w-4 h-4 flex items-center justify-center border border-black/20 dark:border-white/20">
                    2
                  </span>
                  {t("new_appointment_modal.service_label")} *
                </label>
                <Select
                  value={formData.serviceId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, serviceId: value })
                  }
                >
                  <SelectTrigger className="h-12 rounded-none border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] text-black dark:text-white focus:ring-0 focus:border-black text-xs font-semibold tracking-widest uppercase transition-colors">
                    <SelectValue
                      placeholder={
                        isLoadingCatalog
                          ? t("new_appointment_modal.loading_services")
                          : t("new_appointment_modal.service_placeholder")
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="z-[80] bg-white dark:bg-[#0a0a0a] text-black dark:text-white border border-black dark:border-white rounded-none shadow-xl">
                    {services.map((service: UI_Service) => (
                      <SelectItem
                        key={service.id}
                        value={String(service.id)}
                        className="text-[10px] uppercase tracking-widest font-bold focus:bg-black focus:text-white dark:focus:bg-white dark:focus:text-black cursor-pointer rounded-none"
                      >
                        {service.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Modalidad */}
              <div className="col-span-1 border-b md:border-r-0 border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0a] p-6 flex flex-col">
                <label className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-3 flex items-center gap-2">
                  <span className="w-4 h-4 flex items-center justify-center border border-black/20 dark:border-white/20">
                    3
                  </span>
                  {t("new_appointment_modal.modality_label")} *
                </label>
                <Select
                  value={formData.appointmentType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, appointmentType: value })
                  }
                  disabled={!selectedService || supportedTypes.length === 1}
                >
                  <SelectTrigger className="h-12 rounded-none border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] text-black dark:text-white focus:ring-0 focus:border-black text-xs font-semibold tracking-widest uppercase transition-colors disabled:opacity-50">
                    <SelectValue
                      placeholder={t(
                        "new_appointment_modal.modality_placeholder",
                      )}
                    />
                  </SelectTrigger>
                  <SelectContent className="z-[80] bg-white dark:bg-[#0a0a0a] text-black dark:text-white border border-black dark:border-white rounded-none shadow-xl">
                    {supportedTypes.map((type) => (
                      <SelectItem
                        key={type}
                        value={type}
                        className="text-[10px] uppercase tracking-widest font-bold focus:bg-black focus:text-white dark:focus:bg-white dark:focus:text-black cursor-pointer rounded-none"
                      >
                        {type === "ONLINE"
                          ? t("card.online")
                          : t("card.in_person")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Fecha */}
              <div className="col-span-1 border-b border-r border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0a] p-6 flex flex-col">
                <label className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-3 flex items-center gap-2">
                  <span className="w-4 h-4 flex items-center justify-center border border-black/20 dark:border-white/20">
                    4
                  </span>
                  {t("new_appointment_modal.date_label")} *
                </label>
                <DatePicker
                  value={
                    formData.appointmentDate
                      ? new Date(formData.appointmentDate + "T12:00:00")
                      : undefined
                  }
                  onChange={(date) => {
                    if (date) {
                      setFormData({
                        ...formData,
                        appointmentDate: format(date, "yyyy-MM-dd"),
                      });
                    } else {
                      setFormData({ ...formData, appointmentDate: "" });
                    }
                  }}
                  disabled={(date) =>
                    date < new Date(new Date().setHours(0, 0, 0, 0))
                  }
                  placeholder="DD/MM/AAAA"
                  className="bg-gray-50 dark:bg-[#050505] h-12 rounded-none border-black/20 dark:border-white/20"
                  popoverClassName="rounded-none border-black dark:border-white bg-white dark:bg-[#0a0a0a]"
                />
              </div>

              {/* Hora */}
              <div className="col-span-1 border-b md:border-r-0 border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0a] p-6 flex flex-col">
                <label className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-3 flex items-center gap-2">
                  <span className="w-4 h-4 flex items-center justify-center border border-black/20 dark:border-white/20">
                    5
                  </span>
                  {t("new_appointment_modal.time_label")} *
                </label>
                <Input
                  type="time"
                  required
                  value={formData.appointmentTime}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      appointmentTime: e.target.value,
                    })
                  }
                  className="bg-gray-50 dark:bg-[#050505] h-12 rounded-none border border-black/20 dark:border-white/20 text-xs font-semibold tracking-widest focus-visible:ring-0 focus-visible:border-black dark:focus-visible:border-white uppercase transition-colors w-full"
                />
              </div>

              {/* Método de Pago */}
              <div className="col-span-1 md:col-span-2 border-b border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0a] p-6 flex flex-col">
                <label className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-3 flex items-center gap-2">
                  <span className="w-4 h-4 flex items-center justify-center border border-black/20 dark:border-white/20">
                    6
                  </span>
                  {t("new_appointment_modal.payment_method_label")}
                </label>
                <Select
                  value={formData.paymentMethod}
                  onValueChange={(value) =>
                    setFormData({ ...formData, paymentMethod: value })
                  }
                >
                  <SelectTrigger className="h-12 rounded-none border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] text-black dark:text-white focus:ring-0 focus:border-black text-xs font-semibold tracking-widest uppercase transition-colors">
                    <SelectValue
                      placeholder={t(
                        "new_appointment_modal.payment_method_placeholder",
                      )}
                    />
                  </SelectTrigger>
                  <SelectContent className="z-[80] bg-white dark:bg-[#0a0a0a] text-black dark:text-white border border-black dark:border-white rounded-none shadow-xl">
                    <SelectItem
                      value="CASH"
                      className="text-[10px] uppercase tracking-widest font-bold focus:bg-black focus:text-white dark:focus:bg-white dark:focus:text-black cursor-pointer rounded-none"
                    >
                      {t("new_appointment_modal.payment_cash")}
                    </SelectItem>
                    <SelectItem
                      value="CREDIT_CARD"
                      className="text-[10px] uppercase tracking-widest font-bold focus:bg-black focus:text-white dark:focus:bg-white dark:focus:text-black cursor-pointer rounded-none"
                    >
                      {t("new_appointment_modal.payment_credit_card")}
                    </SelectItem>
                    <SelectItem
                      value="DEBIT_CARD"
                      className="text-[10px] uppercase tracking-widest font-bold focus:bg-black focus:text-white dark:focus:bg-white dark:focus:text-black cursor-pointer rounded-none"
                    >
                      {t("new_appointment_modal.payment_debit_card")}
                    </SelectItem>
                    <SelectItem
                      value="INSURANCE"
                      className="text-[10px] uppercase tracking-widest font-bold focus:bg-black focus:text-white dark:focus:bg-white dark:focus:text-black cursor-pointer rounded-none"
                    >
                      {t("new_appointment_modal.payment_insurance")}
                    </SelectItem>
                    <SelectItem
                      value="PACKAGE_BALANCE"
                      className="text-[10px] uppercase tracking-widest font-bold focus:bg-black focus:text-white dark:focus:bg-white dark:focus:text-black cursor-pointer rounded-none"
                    >
                      {t("new_appointment_modal.payment_package_balance")}
                    </SelectItem>
                    <SelectItem
                      value="BANK_TRANSFER"
                      className="text-[10px] uppercase tracking-widest font-bold focus:bg-black focus:text-white dark:focus:bg-white dark:focus:text-black cursor-pointer rounded-none"
                    >
                      {t("new_appointment_modal.payment_bank_transfer")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Notas */}
              <div className="col-span-1 md:col-span-2 border-b border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0a] p-6 flex flex-col">
                <label className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-3 flex items-center gap-2">
                  <span className="w-4 h-4 flex items-center justify-center border border-black/20 dark:border-white/20">
                    7
                  </span>
                  {t("new_appointment_modal.notes_label")}
                </label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder={t("new_appointment_modal.notes_placeholder")}
                  className="min-h-[110px] bg-gray-50 dark:bg-[#050505] rounded-none border border-black/20 dark:border-white/20 text-xs font-semibold tracking-widest focus-visible:ring-0 focus-visible:border-black dark:focus-visible:border-white uppercase resize-none transition-colors"
                />
              </div>
            </div>

            {/* FOOTER DE COMANDOS */}
            <div className="flex flex-col sm:flex-row justify-end gap-4 p-6 md:p-8 bg-white dark:bg-[#0a0a0a] border-t border-black dark:border-white shrink-0 mt-auto">
              <button
                type="button"
                onClick={handleClose}
                className="w-full sm:w-auto h-14 px-10 border border-black dark:border-white bg-transparent text-black dark:text-white text-[10px] uppercase tracking-widest font-bold hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors rounded-none"
              >
                {t("new_appointment_modal.cancel")}
              </button>
              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  !selectedPatient ||
                  !formData.serviceId ||
                  !formData.appointmentDate ||
                  !formData.appointmentTime
                }
                className="w-full sm:w-auto h-14 px-10 bg-black text-white dark:bg-white dark:text-black border-0 text-[10px] uppercase tracking-widest font-bold hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors flex items-center justify-center gap-3 disabled:opacity-50 rounded-none"
              >
                {isSubmitting ? (
                  <QhSpinner size="sm" className="text-current" />
                ) : (
                  <PlusCircle className="w-4 h-4" strokeWidth={1.5} />
                )}
                {isSubmitting
                  ? t("new_appointment_modal.creating")
                  : t("new_appointment_modal.create")}
              </button>
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
