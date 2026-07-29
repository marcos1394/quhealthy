"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/no-event-handler */
/* eslint-disable react-doctor/no-giant-component */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useMemo, useState } from "react";
import {
  CalendarPlus,
  Check,
  ChevronsUpDown,
  PlusCircle,
  UserPlus,
  Search,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";
import { format } from "date-fns";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DatePicker } from "@/components/ui/date-picker";
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

interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
  onSuccess?: () => void;
  initialDate?: Date | null;
  locationId: number;
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
  const { services, fetchInventory, isLoading: isLoadingCatalog } = useCatalog();
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
    }
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
    [formData.serviceId, services]
  );

  useEffect(() => {
    if (!selectedService) return;

    const supportedTypes = (modalityOptions[
      selectedService.serviceDeliveryType
    ] || ["IN_PERSON"]) as readonly string[];
    setFormData((current) => ({
      ...current,
      appointmentType: supportedTypes.includes(current.appointmentType as any)
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
    try {
      const payload = {
        providerId: user.id,
        patientDirectoryId: selectedPatient.id,
        serviceId: selectedService.id,
        startTime: `${formData.appointmentDate}T${formData.appointmentTime}:00`,
        appointmentType: formData.appointmentType,
        paymentMethod: formData.paymentMethod,
        consumerSymptoms: formData.notes || undefined,
        locationId: locationId,
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
        getPatientDisplayName(patient).toLowerCase() === normalizedName
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
    [clients, user?.id]
  );

  const displayedPatients =
    patientQuery.trim().length < 2 ? defaultPatients : searchResults;

  const getPatientDisplayName = (
    patient: PatientDirectorySearchResult | PatientClient
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
    patient: PatientDirectorySearchResult | PatientClient
  ) => ("email" in patient ? patient.email : patient.consumer?.email) || "";

  const getPatientDisplayPhone = (
    patient: PatientDirectorySearchResult | PatientClient
  ) => ("phone" in patient ? patient.phone : patient.consumer?.phone) || "";

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="sm:max-w-3xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-0 rounded-3xl overflow-hidden max-h-[90vh] flex flex-col shadow-2xl font-sans transition-colors [&>button]:hidden">
          {/* ── HEADER ─────────────────────────────────────────────────── */}
          <div className="p-6 sm:p-8 bg-gray-50/60 dark:bg-[#050505] border-b border-gray-100 dark:border-gray-800 shrink-0">
            <DialogHeader className="space-y-3 text-left">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center shrink-0 shadow-2xs text-emerald-600 dark:text-emerald-400">
                    <CalendarPlus className="w-6 h-6" strokeWidth={2} />
                  </div>
                  <div className="space-y-0.5">
                    <DialogTitle className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white tracking-tight leading-none">
                      {t("new_appointment_modal.title")}
                    </DialogTitle>
                    <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                      {t("new_appointment_modal.description")}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="w-9 h-9 rounded-xl flex items-center justify-center bg-white dark:bg-[#111] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 cursor-pointer shadow-2xs shrink-0 disabled:opacity-50"
                >
                  <X className="w-4 h-4" strokeWidth={2} />
                </button>
              </div>
            </DialogHeader>
          </div>

          {/* ── CUERPO DEL FORMULARIO ─────────────────────────────────── */}
          <form
            onSubmit={handleSubmit}
            className="flex-1 overflow-y-auto custom-scrollbar bg-white dark:bg-[#0a0a0a] flex flex-col p-6 sm:p-8 space-y-6"
          >
            {/* Selección de Paciente */}
            <div className="bg-gray-50/60 dark:bg-[#050505] rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-2xs space-y-3">
              <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                {t("new_appointment_modal.patient_label")}{" "}
                <span className="text-red-500">*</span>
              </label>

              <div className="flex flex-col sm:flex-row gap-3">
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
                      className="w-full flex-1 flex items-center justify-between h-11 px-4 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-[#111] transition-all text-xs font-bold shadow-2xs cursor-pointer"
                    >
                      <span className="truncate text-left">
                        {selectedPatient
                          ? getPatientDisplayName(selectedPatient)
                          : t("new_appointment_modal.patient_placeholder")}
                      </span>
                      <ChevronsUpDown
                        className="ml-2 h-4 w-4 shrink-0 text-gray-400"
                        strokeWidth={2}
                      />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="z-[9999] w-[var(--radix-popover-trigger-width)] min-w-[320px] p-0 bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl overflow-hidden font-sans"
                    align="start"
                    sideOffset={8}
                  >
                    <Command
                      shouldFilter={false}
                      className="bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white"
                    >
                      <div className="relative">
                        <Search
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                          strokeWidth={2}
                        />
                        <CommandInput
                          placeholder={t(
                            "new_appointment_modal.patient_search_placeholder"
                          )}
                          value={patientQuery}
                          onValueChange={setPatientQuery}
                          className="border-none focus:ring-0 text-xs font-semibold h-11 bg-transparent border-b border-gray-100 dark:border-gray-800 pl-10"
                        />
                      </div>
                      <CommandList className="max-h-[260px] custom-scrollbar">
                        {isSearching ? (
                          <div className="flex items-center gap-2.5 px-4 py-3 text-xs font-semibold text-gray-400">
                            <QhSpinner size="sm" className="text-emerald-600 dark:text-emerald-400" />
                            <span>{t("new_appointment_modal.searching_patients")}</span>
                          </div>
                        ) : null}
                        {!isSearching &&
                        displayedPatients.length === 0 &&
                        patientQuery.trim().length < 2 ? (
                          <div className="px-4 py-3 text-xs font-medium text-gray-400 bg-gray-50/50 dark:bg-[#050505]">
                            {t("new_appointment_modal.no_patients_available")}
                          </div>
                        ) : null}
                        <CommandEmpty className="py-4 text-center text-xs font-medium text-gray-400">
                          {t("new_appointment_modal.no_patients_found")}
                        </CommandEmpty>
                        <CommandGroup className="p-2">
                          {displayedPatients.map((patient: any) => (
                            <CommandItem
                              key={patient.id}
                              value={String(patient.id)}
                              onSelect={() => handleSelectPatient(patient)}
                              disabled={false}
                              style={{ pointerEvents: "auto", opacity: 1 }}
                              className="flex items-center justify-between gap-4 px-3 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#111] rounded-xl transition-colors group mb-1 last:mb-0"
                            >
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                                  {getPatientDisplayName(patient)}
                                </p>
                                <p className="text-[11px] font-medium text-gray-400 truncate pt-0.5">
                                  {getPatientDisplayEmail(patient) ||
                                    getPatientDisplayPhone(patient) ||
                                    t(
                                      "new_appointment_modal.patient_record_id",
                                      { id: patient.id }
                                    )}
                                </p>
                              </div>
                              <Check
                                strokeWidth={2.5}
                                className={cn(
                                  "h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400",
                                  selectedPatient?.id === patient.id
                                    ? "opacity-100"
                                    : "opacity-0"
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
                  className="shrink-0 h-11 px-5 flex items-center justify-center bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:hover:bg-emerald-900/50 dark:text-emerald-400 rounded-xl transition-all text-xs font-bold border border-emerald-200 dark:border-emerald-900/40 shadow-2xs cursor-pointer"
                >
                  <UserPlus className="w-4 h-4 mr-1.5" strokeWidth={2} />
                  <span>{t("new_appointment_modal.new_patient_button")}</span>
                </button>
              </div>

              {selectedPatient && (
                <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/60 dark:bg-emerald-950/20 p-3.5 shadow-2xs">
                  <p className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2.5} />
                    <span>{getPatientDisplayName(selectedPatient)}</span>
                  </p>
                  <p className="text-[11px] font-medium text-emerald-600/80 dark:text-emerald-400/80 pt-0.5 pl-6 font-mono">
                    {getPatientDisplayEmail(selectedPatient) ||
                      t("new_appointment_modal.no_email")}{" "}
                    {getPatientDisplayPhone(selectedPatient)
                      ? `| ${getPatientDisplayPhone(selectedPatient)}`
                      : ""}
                  </p>
                </div>
              )}
            </div>

            {/* Servicio y Modalidad */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                  {t("new_appointment_modal.service_label")}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.serviceId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, serviceId: value })
                  }
                >
                  <SelectTrigger className="h-11 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] text-gray-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-emerald-500/20 shadow-2xs cursor-pointer">
                    <SelectValue
                      placeholder={
                        isLoadingCatalog
                          ? t("new_appointment_modal.loading_services")
                          : t("new_appointment_modal.service_placeholder")
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="z-[80] bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl font-sans">
                    {services.map((service: UI_Service) => (
                      <SelectItem
                        key={service.id}
                        value={String(service.id)}
                        className="text-xs font-semibold focus:bg-gray-50 dark:focus:bg-[#111] cursor-pointer rounded-xl"
                      >
                        {service.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                  {t("new_appointment_modal.modality_label")}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.appointmentType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, appointmentType: value })
                  }
                  disabled={!selectedService || supportedTypes.length === 1}
                >
                  <SelectTrigger className="h-11 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] text-gray-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-emerald-500/20 shadow-2xs cursor-pointer disabled:opacity-50">
                    <SelectValue
                      placeholder={t(
                        "new_appointment_modal.modality_placeholder"
                      )}
                    />
                  </SelectTrigger>
                  <SelectContent className="z-[80] bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl font-sans">
                    {supportedTypes.map((type) => (
                      <SelectItem
                        key={type}
                        value={type}
                        className="text-xs font-semibold focus:bg-gray-50 dark:focus:bg-[#111] cursor-pointer rounded-xl"
                      >
                        {type === "ONLINE"
                          ? t("card.online")
                          : t("card.in_person")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Fecha y Hora */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                  {t("new_appointment_modal.date_label")}{" "}
                  <span className="text-red-500">*</span>
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
                  className="bg-gray-50/50 dark:bg-[#050505] h-11 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-bold shadow-2xs"
                  popoverClassName="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                  {t("new_appointment_modal.time_label")}{" "}
                  <span className="text-red-500">*</span>
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
                  className="bg-gray-50/50 dark:bg-[#050505] h-11 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-mono font-bold text-gray-900 dark:text-white focus-visible:ring-2 focus-visible:ring-emerald-500/20 shadow-2xs w-full [&::-webkit-calendar-picker-indicator]:dark:invert"
                />
              </div>
            </div>

            {/* Método de Pago y Notas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                  {t("new_appointment_modal.payment_method_label")}
                </label>
                <Select
                  value={formData.paymentMethod}
                  onValueChange={(value) =>
                    setFormData({ ...formData, paymentMethod: value })
                  }
                >
                  <SelectTrigger className="h-11 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] text-gray-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-emerald-500/20 shadow-2xs cursor-pointer">
                    <SelectValue
                      placeholder={t(
                        "new_appointment_modal.payment_method_placeholder"
                      )}
                    />
                  </SelectTrigger>
                  <SelectContent className="z-[80] bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl font-sans">
                    <SelectItem value="CASH" className="text-xs font-semibold cursor-pointer">
                      {t("new_appointment_modal.payment_cash")}
                    </SelectItem>
                    <SelectItem value="CREDIT_CARD" className="text-xs font-semibold cursor-pointer">
                      {t("new_appointment_modal.payment_credit_card")}
                    </SelectItem>
                    <SelectItem value="DEBIT_CARD" className="text-xs font-semibold cursor-pointer">
                      {t("new_appointment_modal.payment_debit_card")}
                    </SelectItem>
                    <SelectItem value="INSURANCE" className="text-xs font-semibold cursor-pointer">
                      {t("new_appointment_modal.payment_insurance")}
                    </SelectItem>
                    <SelectItem value="PACKAGE_BALANCE" className="text-xs font-semibold cursor-pointer">
                      {t("new_appointment_modal.payment_package_balance")}
                    </SelectItem>
                    <SelectItem value="BANK_TRANSFER" className="text-xs font-semibold cursor-pointer">
                      {t("new_appointment_modal.payment_bank_transfer")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                  {t("new_appointment_modal.notes_label")}
                </label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder={t("new_appointment_modal.notes_placeholder")}
                  className="h-11 min-h-[44px] bg-gray-50/50 dark:bg-[#050505] rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-medium text-gray-900 dark:text-white focus-visible:ring-2 focus-visible:ring-emerald-500/20 resize-none transition-colors shadow-2xs leading-relaxed"
                />
              </div>
            </div>
          </form>

          {/* ── FOOTER DE COMANDOS ────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 p-5 bg-gray-50/60 dark:bg-[#050505] border-t border-gray-100 dark:border-gray-800 shrink-0">
            <button
              type="button"
              onClick={handleClose}
              className="w-full sm:w-auto h-11 px-6 border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 text-xs font-bold hover:bg-gray-50 dark:hover:bg-[#111] transition-all rounded-xl shadow-2xs cursor-pointer"
            >
              {t("new_appointment_modal.cancel")}
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={
                isSubmitting ||
                !selectedPatient ||
                !formData.serviceId ||
                !formData.appointmentDate ||
                !formData.appointmentTime
              }
              className="w-full sm:w-auto h-11 px-8 bg-emerald-600 text-white border-0 text-xs font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 rounded-xl shadow-xs cursor-pointer disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <QhSpinner size="sm" className="text-white" />
              ) : (
                <PlusCircle className="w-4 h-4" strokeWidth={2} />
              )}
              <span>
                {isSubmitting
                  ? t("new_appointment_modal.creating")
                  : t("new_appointment_modal.submit")}
              </span>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL NUEVO PACIENTE ENCAPSULADO */}
      <NewPatientModal
        isOpen={isNewPatientModalOpen}
        onClose={() => setIsNewPatientModalOpen(false)}
        onSuccess={handlePatientCreated}
      />
    </>
  );
}