"use client";
/* eslint-disable react-doctor/no-event-handler */
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
          return { ...state, isSubmitting: typeof action.payload === "function" ? action.payload(state.isSubmitting) : action.payload };
        case "SET_ISSEARCHING":
          return { ...state, isSearching: typeof action.payload === "function" ? action.payload(state.isSearching) : action.payload };
        case "SET_PATIENTPICKEROPEN":
          return { ...state, patientPickerOpen: typeof action.payload === "function" ? action.payload(state.patientPickerOpen) : action.payload };
        case "SET_ISNEWPATIENTMODALOPEN":
          return { ...state, isNewPatientModalOpen: typeof action.payload === "function" ? action.payload(state.isNewPatientModalOpen) : action.payload };
        case "SET_PATIENTQUERY":
          return { ...state, patientQuery: typeof action.payload === "function" ? action.payload(state.patientQuery) : action.payload };
        case "SET_SEARCHRESULTS":
          return { ...state, searchResults: typeof action.payload === "function" ? action.payload(state.searchResults) : action.payload };
        case "SET_SELECTEDPATIENT":
          return { ...state, selectedPatient: typeof action.payload === "function" ? action.payload(state.selectedPatient) : action.payload };
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

  const setIsSubmitting = (val: any) => dispatch({ type: "SET_ISSUBMITTING", payload: val });
  const setIsSearching = (val: any) => dispatch({ type: "SET_ISSEARCHING", payload: val });
  const setPatientPickerOpen = (val: any) => dispatch({ type: "SET_PATIENTPICKEROPEN", payload: val });
  const setIsNewPatientModalOpen = (val: any) => dispatch({ type: "SET_ISNEWPATIENTMODALOPEN", payload: val });
  const setPatientQuery = (val: any) => dispatch({ type: "SET_PATIENTQUERY", payload: val });
  const setSearchResults = (val: any) => dispatch({ type: "SET_SEARCHRESULTS", payload: val });
  const setSelectedPatient = (val: any) => dispatch({ type: "SET_SELECTEDPATIENT", payload: val });

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
        <DialogContent className="sm:max-w-3xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-0 rounded-3xl overflow-hidden max-h-[90vh] flex flex-col shadow-2xl">
          {/* HEADER ARQUITECTÓNICO */}
          <DialogHeader className="p-6 md:p-8 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shrink-0">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0">
                <CalendarPlus
                  className="w-6 h-6 text-emerald-600 dark:text-emerald-400"
                  strokeWidth={2}
                />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-1">
                  {t("new_appointment_modal.description")}
                </p>
                <DialogTitle className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white leading-none">
                  {t("new_appointment_modal.title")}
                </DialogTitle>
              </div>
            </div>
          </DialogHeader>

          {/* BODY: GRID BLUEPRINT (Soft) */}
          <form
            onSubmit={handleSubmit}
            className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50/50 dark:bg-[#050505]/50 flex flex-col p-6 md:p-8 gap-6"
          >
            {/* Paciente */}
            <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl border border-gray-100 dark:border-gray-800 p-6 flex flex-col shadow-sm">
              <label className="text-xs font-semibold text-gray-500 mb-3 flex items-center gap-2">
                {t("new_appointment_modal.patient_label")} <span className="text-red-500">*</span>
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
                      className="w-full flex-1 flex items-center justify-between h-12 px-4 rounded-xl bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-[#111] transition-colors text-sm font-semibold"
                    >
                      <span className="truncate text-left">
                        {selectedPatient
                          ? getPatientDisplayName(selectedPatient)
                          : t("new_appointment_modal.patient_placeholder")}
                      </span>
                      <ChevronsUpDown
                        className="ml-2 h-4 w-4 shrink-0 opacity-50"
                        strokeWidth={2}
                      />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="z-[9999] w-[var(--radix-popover-trigger-width)] min-w-[320px] p-0 bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-xl shadow-xl overflow-hidden"
                    align="start"
                    sideOffset={8}
                  >
                    <Command
                      shouldFilter={false}
                      className="bg-white dark:bg-[#0a0a0a] text-black dark:text-white"
                    >
                      <div className="relative">
                        <Search
                          className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                          strokeWidth={2}
                        />
                        <CommandInput
                          placeholder={t(
                            "new_appointment_modal.patient_search_placeholder",
                          )}
                          value={patientQuery}
                          onValueChange={setPatientQuery}
                          className="border-none focus:ring-0 text-sm font-semibold h-12 bg-transparent border-b border-gray-100 dark:border-gray-800 pl-11"
                        />
                      </div>
                      <CommandList className="max-h-[280px]">
                        {isSearching ? (
                          <div className="flex items-center gap-3 px-4 py-4 text-xs font-semibold text-gray-500">
                            <Loader2
                              className="w-4 h-4 animate-spin"
                              strokeWidth={2}
                            />
                            {t("new_appointment_modal.searching_patients")}
                          </div>
                        ) : null}
                        {!isSearching &&
                        displayedPatients.length === 0 &&
                        patientQuery.trim().length < 2 ? (
                          <div className="px-4 py-4 text-xs font-semibold text-gray-500 bg-gray-50 dark:bg-[#050505]">
                            {t("new_appointment_modal.no_patients_available")}
                          </div>
                        ) : null}
                        <CommandEmpty className="py-4 text-center text-xs font-semibold text-gray-500">
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
                              className="flex items-center justify-between gap-4 px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors group mb-1 last:mb-0"
                            >
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                                  {getPatientDisplayName(patient)}
                                </p>
                                <p className="text-xs text-gray-500 truncate mt-0.5">
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
                                  "h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400",
                                  selectedPatient?.id === patient.id
                                    ? "opacity-100"
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
                  className="shrink-0 h-12 px-6 flex items-center justify-center bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 dark:text-emerald-400 rounded-xl transition-colors text-sm font-semibold border border-emerald-100 dark:border-emerald-800/50"
                >
                  <UserPlus className="w-4 h-4 mr-2" strokeWidth={2} />
                  {t("new_appointment_modal.new_patient_button")}
                </button>
              </div>

              {selectedPatient && (
                <div className="mt-4 rounded-xl border border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/50 dark:bg-emerald-900/10 p-4">
                  <p className="flex items-center gap-2 text-sm font-bold text-emerald-800 dark:text-emerald-400">
                    <Check className="w-4 h-4" strokeWidth={2} />
                    {getPatientDisplayName(selectedPatient)}
                  </p>
                  <p className="text-xs text-emerald-600/80 dark:text-emerald-500 font-medium mt-1 pl-6">
                    {getPatientDisplayEmail(selectedPatient) ||
                      t("new_appointment_modal.no_email")}{" "}
                    {getPatientDisplayPhone(selectedPatient)
                      ? `| ${getPatientDisplayPhone(selectedPatient)}`
                      : ""}
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Servicio */}
              <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl border border-gray-100 dark:border-gray-800 p-6 flex flex-col shadow-sm">
                <label className="text-xs font-semibold text-gray-500 mb-3 flex items-center gap-2">
                  {t("new_appointment_modal.service_label")} <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.serviceId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, serviceId: value })
                  }
                >
                  <SelectTrigger className="h-12 rounded-xl border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] text-gray-900 dark:text-white focus:ring-0 focus:border-emerald-500 text-sm font-semibold transition-colors">
                    <SelectValue
                      placeholder={
                        isLoadingCatalog
                          ? t("new_appointment_modal.loading_services")
                          : t("new_appointment_modal.service_placeholder")
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="z-[80] bg-white dark:bg-[#0a0a0a] text-black dark:text-white border-gray-100 dark:border-gray-800 rounded-xl shadow-xl">
                    {services.map((service: UI_Service) => (
                      <SelectItem
                        key={service.id}
                        value={String(service.id)}
                        className="text-sm font-semibold focus:bg-gray-100 dark:focus:bg-gray-800 cursor-pointer rounded-lg m-1"
                      >
                        {service.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Modalidad */}
              <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl border border-gray-100 dark:border-gray-800 p-6 flex flex-col shadow-sm">
                <label className="text-xs font-semibold text-gray-500 mb-3 flex items-center gap-2">
                  {t("new_appointment_modal.modality_label")} <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.appointmentType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, appointmentType: value })
                  }
                  disabled={!selectedService || supportedTypes.length === 1}
                >
                  <SelectTrigger className="h-12 rounded-xl border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] text-gray-900 dark:text-white focus:ring-0 focus:border-emerald-500 text-sm font-semibold transition-colors disabled:opacity-50">
                    <SelectValue
                      placeholder={t(
                        "new_appointment_modal.modality_placeholder",
                      )}
                    />
                  </SelectTrigger>
                  <SelectContent className="z-[80] bg-white dark:bg-[#0a0a0a] text-black dark:text-white border-gray-100 dark:border-gray-800 rounded-xl shadow-xl">
                    {supportedTypes.map((type) => (
                      <SelectItem
                        key={type}
                        value={type}
                        className="text-sm font-semibold focus:bg-gray-100 dark:focus:bg-gray-800 cursor-pointer rounded-lg m-1"
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
              <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl border border-gray-100 dark:border-gray-800 p-6 flex flex-col shadow-sm">
                <label className="text-xs font-semibold text-gray-500 mb-3 flex items-center gap-2">
                  {t("new_appointment_modal.date_label")} <span className="text-red-500">*</span>
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
                  className="bg-gray-50 dark:bg-[#050505] h-12 rounded-xl border-gray-200 dark:border-gray-800 text-sm font-semibold"
                  popoverClassName="rounded-xl border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]"
                />
              </div>

              {/* Hora */}
              <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl border border-gray-100 dark:border-gray-800 p-6 flex flex-col shadow-sm">
                <label className="text-xs font-semibold text-gray-500 mb-3 flex items-center gap-2">
                  {t("new_appointment_modal.time_label")} <span className="text-red-500">*</span>
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
                  className="bg-gray-50 dark:bg-[#050505] h-12 rounded-xl border border-gray-200 dark:border-gray-800 text-sm font-semibold focus-visible:ring-0 focus-visible:border-emerald-500 transition-colors w-full"
                />
              </div>
            </div>

            {/* Método de Pago y Notas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl border border-gray-100 dark:border-gray-800 p-6 flex flex-col shadow-sm">
                <label className="text-xs font-semibold text-gray-500 mb-3 flex items-center gap-2">
                  {t("new_appointment_modal.payment_method_label")}
                </label>
                <Select
                  value={formData.paymentMethod}
                  onValueChange={(value) =>
                    setFormData({ ...formData, paymentMethod: value })
                  }
                >
                  <SelectTrigger className="h-12 rounded-xl border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] text-gray-900 dark:text-white focus:ring-0 focus:border-emerald-500 text-sm font-semibold transition-colors">
                    <SelectValue
                      placeholder={t(
                        "new_appointment_modal.payment_method_placeholder",
                      )}
                    />
                  </SelectTrigger>
                  <SelectContent className="z-[80] bg-white dark:bg-[#0a0a0a] text-black dark:text-white border-gray-100 dark:border-gray-800 rounded-xl shadow-xl">
                    <SelectItem
                      value="CASH"
                      className="text-sm font-semibold focus:bg-gray-100 dark:focus:bg-gray-800 cursor-pointer rounded-lg m-1"
                    >
                      {t("new_appointment_modal.payment_cash")}
                    </SelectItem>
                    <SelectItem
                      value="CREDIT_CARD"
                      className="text-sm font-semibold focus:bg-gray-100 dark:focus:bg-gray-800 cursor-pointer rounded-lg m-1"
                    >
                      {t("new_appointment_modal.payment_credit_card")}
                    </SelectItem>
                    <SelectItem
                      value="DEBIT_CARD"
                      className="text-sm font-semibold focus:bg-gray-100 dark:focus:bg-gray-800 cursor-pointer rounded-lg m-1"
                    >
                      {t("new_appointment_modal.payment_debit_card")}
                    </SelectItem>
                    <SelectItem
                      value="INSURANCE"
                      className="text-sm font-semibold focus:bg-gray-100 dark:focus:bg-gray-800 cursor-pointer rounded-lg m-1"
                    >
                      {t("new_appointment_modal.payment_insurance")}
                    </SelectItem>
                    <SelectItem
                      value="PACKAGE_BALANCE"
                      className="text-sm font-semibold focus:bg-gray-100 dark:focus:bg-gray-800 cursor-pointer rounded-lg m-1"
                    >
                      {t("new_appointment_modal.payment_package_balance")}
                    </SelectItem>
                    <SelectItem
                      value="BANK_TRANSFER"
                      className="text-sm font-semibold focus:bg-gray-100 dark:focus:bg-gray-800 cursor-pointer rounded-lg m-1"
                    >
                      {t("new_appointment_modal.payment_bank_transfer")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl border border-gray-100 dark:border-gray-800 p-6 flex flex-col shadow-sm">
                <label className="text-xs font-semibold text-gray-500 mb-3 flex items-center gap-2">
                  {t("new_appointment_modal.notes_label")}
                </label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder={t("new_appointment_modal.notes_placeholder")}
                  className="h-12 bg-gray-50 dark:bg-[#050505] rounded-xl border border-gray-200 dark:border-gray-800 text-sm font-semibold focus-visible:ring-0 focus-visible:border-emerald-500 resize-none transition-colors"
                />
              </div>
            </div>
          </form>

          {/* FOOTER */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 p-6 md:p-8 bg-white dark:bg-[#0a0a0a] border-t border-gray-100 dark:border-gray-800 shrink-0">
            <button
              type="button"
              onClick={handleClose}
              className="w-full sm:w-auto h-12 px-8 border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 text-sm font-bold hover:bg-gray-50 dark:hover:bg-[#111] transition-colors rounded-xl shadow-sm"
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
              className="w-full sm:w-auto h-12 px-8 bg-emerald-600 text-white border-0 text-sm font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 rounded-xl shadow-sm"
            >
              {isSubmitting ? (
                <QhSpinner size="sm" className="text-current" />
              ) : (
                <PlusCircle className="w-4 h-4" strokeWidth={2} />
              )}
              {isSubmitting
                ? t("new_appointment_modal.creating")
                : t("new_appointment_modal.submit")}
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
