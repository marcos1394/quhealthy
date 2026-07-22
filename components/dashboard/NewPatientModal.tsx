"use client";
/* eslint-disable react-doctor/button-has-type */

import React, { useState } from "react";
import { CalendarIcon, Users, UserPlus, X, Save } from "lucide-react";
import { format, parse } from "date-fns";
import { enUS, es } from "date-fns/locale";
import { useLocale, useTranslations } from "next-intl";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreatableSelect } from "@/components/ui/creatable-select";
import { cn } from "@/lib/utils";
import { usePatientDirectory } from "@/hooks/usePatientDirectory";
import { PatientRegistrationPayload } from "@/types/patient";
import { QhSpinner } from "@/components/ui/QhSpinner";

interface NewPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (payload: PatientRegistrationPayload) => void;
}

export function NewPatientModal({
  isOpen,
  onClose,
  onSuccess,
}: NewPatientModalProps) {
  const { createPatient, isSubmitting } = usePatientDirectory();
  const locale = useLocale();
  const t = useTranslations("DashboardPatients");
  const dateLocale = locale === "es" ? es : enUS;
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [formData, setFormData] = useState<
    PatientRegistrationPayload & { preferredNotificationMethod?: string }
  >({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    birthDate: "",
    gender: "MALE",
    preferredNotificationMethod: "NONE",
  });

  const selectedBirthDate = formData.birthDate
    ? parse(formData.birthDate, "yyyy-MM-dd", new Date())
    : undefined;

  const displayBirthDate = selectedBirthDate
    ? format(
        selectedBirthDate,
        locale === "es" ? "d 'de' MMMM 'de' yyyy" : "MMMM d, yyyy",
        { locale: dateLocale },
      )
    : "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: PatientRegistrationPayload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email?.trim() || undefined,
      phone: formData.phone?.trim() || undefined,
      birthDate: formData.birthDate,
      gender: formData.gender,
      preferredNotificationMethod: formData.preferredNotificationMethod,
      // --- NOM-024 ---
      curp: formData.curp,
      ethnicGroup: formData.ethnicGroup,
      healthInsurance: formData.healthInsurance,
      emergencyContactName: formData.emergencyContactName,
      emergencyContactPhone: formData.emergencyContactPhone,
      address: formData.address,
    };
    const success = await createPatient(payload);
    if (success) {
      onSuccess?.(payload);
      onClose();
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        birthDate: "",
        gender: "MALE",
        preferredNotificationMethod: "NONE",
        curp: "",
        ethnicGroup: "",
        healthInsurance: "",
        emergencyContactName: "",
        emergencyContactPhone: "",
        address: "",
      });
      setCalendarOpen(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && !isSubmitting && onClose()}
    >
      <DialogContent className="sm:max-w-3xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 text-black dark:text-white p-0 rounded-3xl shadow-2xl overflow-hidden flex flex-col transition-colors [&>button]:hidden">
        {/* HEADER */}
        <div className="flex items-start md:items-center justify-between p-6 md:p-8 bg-white dark:bg-[#0a0a0a] border-b border-gray-100 dark:border-gray-800 shrink-0">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-sm border border-emerald-100 dark:border-emerald-800/50">
              <UserPlus className="w-6 h-6" strokeWidth={2} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500 mb-1">
                Módulo de Directorio
              </p>
              <DialogTitle className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white leading-none">
                {t("new_patient_modal_title", {
                  defaultValue: "Alta de Paciente",
                })}
              </DialogTitle>
              <p className="text-sm font-medium text-gray-500 mt-2">
                {t("new_patient_modal_description", {
                  defaultValue:
                    "Ingrese los datos base para aperturar un nuevo expediente.",
                })}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-[#111] transition-colors shrink-0 disabled:opacity-50"
          >
            <X
              className="w-5 h-5 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
              strokeWidth={2}
            />
          </button>
        </div>

        {/* CUERPO DEL FORMULARIO */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col bg-white dark:bg-[#0a0a0a] overflow-y-auto custom-scrollbar max-h-[70vh]"
        >
          <div className="p-6 md:p-8 space-y-8">
            {/* Fila 1: Nombres */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col justify-center">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <span className="w-5 h-5 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-[10px] font-bold text-gray-500">
                    1
                  </span>
                  {t("first_name_label", { defaultValue: "Nombre(s)" })} *
                </label>
                <Input
                  required
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  className="h-12 px-4 bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-sm font-medium focus-visible:ring-emerald-500 transition-colors rounded-xl placeholder:text-gray-400"
                  disabled={isSubmitting}
                />
              </div>
              <div className="flex flex-col justify-center">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <span className="w-5 h-5 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-[10px] font-bold text-gray-500">
                    2
                  </span>
                  {t("last_name_label", { defaultValue: "Apellido(s)" })} *
                </label>
                <Input
                  required
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  className="h-12 px-4 bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-sm font-medium focus-visible:ring-emerald-500 transition-colors rounded-xl placeholder:text-gray-400"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Fila 2: Contacto */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col justify-center">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <span className="w-5 h-5 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-[10px] font-bold text-gray-500">
                    3
                  </span>
                  {t("email_label", { defaultValue: "Correo Electrónico" })}{" "}
                  <span className="text-gray-400 text-xs font-normal ml-1">
                    (Opcional)
                  </span>
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="h-12 px-4 bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-sm font-medium focus-visible:ring-emerald-500 transition-colors rounded-xl placeholder:text-gray-400"
                  disabled={isSubmitting}
                />
              </div>
              <div className="flex flex-col justify-center">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <span className="w-5 h-5 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-[10px] font-bold text-gray-500">
                    4
                  </span>
                  {t("phone_label", { defaultValue: "Número Telefónico" })}{" "}
                  <span className="text-gray-400 text-xs font-normal ml-1">
                    (Opcional)
                  </span>
                </label>
                <div className="relative w-full">
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="h-12 px-4 w-full bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-sm font-medium focus-visible:ring-emerald-500 transition-colors rounded-xl placeholder:text-gray-400"
                    disabled={isSubmitting}
                  />
                  {(formData.phone?.replace(/\D/g, "").length ?? 0) >= 10 && (
                    <div className="absolute -top-6 right-0 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 animate-in fade-in zoom-in duration-300">
                      <svg
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-3.5 h-3.5"
                      >
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                      </svg>
                      WhatsApp Detectado
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Fila 3: Demografía */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col justify-center">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <span className="w-5 h-5 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-[10px] font-bold text-gray-500">
                    5
                  </span>
                  {t("birth_date_label", { defaultValue: "Fecha de Nacimiento" })}
                </label>
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      disabled={isSubmitting}
                      className={cn(
                        "w-full h-12 px-4 flex items-center justify-start text-left rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] hover:bg-gray-100 dark:hover:bg-[#111] transition-colors text-sm font-medium disabled:opacity-50",
                        !displayBirthDate
                          ? "text-gray-400 dark:text-gray-600"
                          : "text-gray-900 dark:text-white",
                      )}
                    >
                      <CalendarIcon
                        className="mr-3 h-4 w-4 shrink-0 text-gray-400"
                        strokeWidth={2}
                      />
                      {displayBirthDate ||
                        t("birth_date_placeholder", {
                          defaultValue: "Seleccionar fecha",
                        })}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-0 bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl"
                    align="start"
                  >
                    <Calendar
                      mode="single"
                      selected={selectedBirthDate}
                      onSelect={(date) => {
                        setFormData({
                          ...formData,
                          birthDate: date ? format(date, "yyyy-MM-dd") : "",
                        });
                        setCalendarOpen(false);
                      }}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      defaultMonth={selectedBirthDate || new Date(2000, 0)}
                      captionLayout="dropdown-buttons"
                      fromYear={1920}
                      toYear={new Date().getFullYear()}
                      locale={dateLocale}
                      className="rounded-2xl bg-white dark:bg-[#0a0a0a] text-black dark:text-white p-3 font-sans"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex flex-col justify-center">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <span className="w-5 h-5 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-[10px] font-bold text-gray-500">
                    6
                  </span>
                  {t("gender_label", { defaultValue: "Género" })}
                </label>
                <div className="relative">
                  <Users
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10 pointer-events-none"
                    strokeWidth={2}
                  />
                  <Select
                    value={formData.gender}
                    onValueChange={(value: "MALE" | "FEMALE" | "OTHER") =>
                      setFormData({ ...formData, gender: value })
                    }
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="pl-11 h-12 rounded-xl border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] text-gray-900 dark:text-white focus:ring-emerald-500 text-sm font-medium disabled:opacity-50">
                      <SelectValue
                        placeholder={t("gender_placeholder", {
                          defaultValue: "Seleccionar",
                        })}
                      />
                    </SelectTrigger>
                    <SelectContent className="z-[100] bg-white dark:bg-[#0a0a0a] text-black dark:text-white border border-gray-100 dark:border-gray-800 rounded-xl shadow-xl">
                      <SelectItem
                        className="text-sm font-medium focus:bg-gray-50 dark:focus:bg-[#111] cursor-pointer rounded-lg py-2"
                        value="MALE"
                      >
                        {t("gender_male", { defaultValue: "Masculino" })}
                      </SelectItem>
                      <SelectItem
                        className="text-sm font-medium focus:bg-gray-50 dark:focus:bg-[#111] cursor-pointer rounded-lg py-2"
                        value="FEMALE"
                      >
                        {t("gender_female", { defaultValue: "Femenino" })}
                      </SelectItem>
                      <SelectItem
                        className="text-sm font-medium focus:bg-gray-50 dark:focus:bg-[#111] cursor-pointer rounded-lg py-2"
                        value="OTHER"
                      >
                        {t("gender_other", { defaultValue: "Otro" })}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Fila 4: NOM-024 (Datos Requeridos) */}
            <div className="pt-8 mt-2 border-t border-gray-100 dark:border-gray-800">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <span className="w-5 h-5 flex items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                  7
                </span>
                Datos Complementarios (NOM-024)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                    CURP
                  </label>
                  <Input
                    value={formData.curp || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        curp: e.target.value.toUpperCase(),
                      })
                    }
                    maxLength={18}
                    placeholder="18 Caracteres"
                    className="h-12 px-4 bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-sm font-medium focus-visible:ring-emerald-500 rounded-xl uppercase"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                    Derechohabiencia
                  </label>
                  <Select
                    value={formData.healthInsurance}
                    onValueChange={(val) =>
                      setFormData({ ...formData, healthInsurance: val })
                    }
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="h-12 rounded-xl border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] text-sm font-medium focus:ring-emerald-500">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-[#0a0a0a] border-gray-100 dark:border-gray-800 rounded-xl shadow-xl">
                      <SelectItem className="text-sm font-medium focus:bg-gray-50 rounded-lg" value="IMSS">IMSS</SelectItem>
                      <SelectItem className="text-sm font-medium focus:bg-gray-50 rounded-lg" value="ISSSTE">ISSSTE</SelectItem>
                      <SelectItem className="text-sm font-medium focus:bg-gray-50 rounded-lg" value="INSABI">INSABI / SSA</SelectItem>
                      <SelectItem className="text-sm font-medium focus:bg-gray-50 rounded-lg" value="PEMEX">PEMEX / SEDENA / SEMAR</SelectItem>
                      <SelectItem className="text-sm font-medium focus:bg-gray-50 rounded-lg" value="SEGURO_PRIVADO">Seguro Médico Privado</SelectItem>
                      <SelectItem className="text-sm font-medium focus:bg-gray-50 rounded-lg" value="NINGUNA">Ninguna</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mb-6">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                  Domicilio Completo
                </label>
                <textarea
                  value={formData.address || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder="Calle, número, colonia, código postal, ciudad, estado"
                  className="w-full min-h-[80px] p-4 bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-xl resize-none"
                  disabled={isSubmitting}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                    Grupo Étnico
                  </label>
                  <CreatableSelect
                    options={[
                      { label: "Ninguno", value: "Ninguno" },
                      { label: "Náhuatl", value: "Náhuatl" },
                      { label: "Maya", value: "Maya" },
                      { label: "Zapoteco", value: "Zapoteco" },
                      { label: "Mixteco", value: "Mixteco" },
                      { label: "Otomí", value: "Otomí" },
                      { label: "Totonaca", value: "Totonaca" },
                      { label: "Tsotsil", value: "Tsotsil" },
                      { label: "Tzeltal", value: "Tzeltal" },
                      { label: "Mazahua", value: "Mazahua" },
                      { label: "Huasteco", value: "Huasteco" },
                    ]}
                    value={formData.ethnicGroup || ""}
                    onChange={(val) =>
                      setFormData({ ...formData, ethnicGroup: val })
                    }
                    placeholder="Seleccionar o crear"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <h5 className="text-sm font-bold text-gray-900 dark:text-white mb-4">
                Contacto de Emergencia
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                    Nombre Completo
                  </label>
                  <Input
                    value={formData.emergencyContactName || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        emergencyContactName: e.target.value,
                      })
                    }
                    className="h-12 px-4 bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-sm font-medium focus-visible:ring-emerald-500 rounded-xl"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                    Teléfono
                  </label>
                  <Input
                    type="tel"
                    value={formData.emergencyContactPhone || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        emergencyContactPhone: e.target.value,
                      })
                    }
                    className="h-12 px-4 bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-sm font-medium focus-visible:ring-emerald-500 rounded-xl"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Preferencias de Notificación */}
          {(formData.email || formData.phone) && (
            <div className="p-6 md:p-8 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505]/50 animate-in slide-in-from-top-4 duration-300">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 block">
                Enviar Notificación de Bienvenida al Paciente por:
              </label>
              <div className="flex flex-wrap gap-4">
                <button
                  type="button"
                  disabled={!formData.email}
                  onClick={() =>
                    setFormData({
                      ...formData,
                      preferredNotificationMethod: "EMAIL",
                    })
                  }
                  className={`px-5 py-2.5 text-sm font-semibold rounded-xl border transition-colors ${
                    formData.preferredNotificationMethod === "EMAIL"
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                      : "bg-white text-gray-700 border-gray-200 dark:bg-[#0a0a0a] dark:text-gray-300 dark:border-gray-800 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  }`}
                >
                  Correo Electrónico
                </button>
                <button
                  type="button"
                  disabled={
                    !formData.phone ||
                    (formData.phone?.replace(/\D/g, "").length ?? 0) < 10
                  }
                  onClick={() =>
                    setFormData({
                      ...formData,
                      preferredNotificationMethod: "WHATSAPP",
                    })
                  }
                  className={`px-5 py-2.5 text-sm font-semibold rounded-xl border transition-colors flex items-center gap-2 ${
                    formData.preferredNotificationMethod === "WHATSAPP"
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                      : "bg-white text-gray-700 border-gray-200 dark:bg-[#0a0a0a] dark:text-gray-300 dark:border-gray-800 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  }`}
                >
                  WhatsApp
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      preferredNotificationMethod: "NONE",
                    })
                  }
                  className={`px-5 py-2.5 text-sm font-semibold rounded-xl border transition-colors ${
                    formData.preferredNotificationMethod === "NONE"
                      ? "bg-gray-200 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-white dark:border-gray-700"
                      : "bg-white text-gray-700 border-gray-200 dark:bg-[#0a0a0a] dark:text-gray-300 dark:border-gray-800 hover:bg-gray-50"
                  }`}
                >
                  No Enviar
                </button>
              </div>
            </div>
          )}

          {/* FOOTER DE COMANDOS */}
          <div className="p-6 md:p-8 bg-white dark:bg-[#0a0a0a] flex flex-col sm:flex-row justify-end gap-4 shrink-0 mt-auto border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto h-12 px-8 border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#111] transition-colors text-sm font-semibold rounded-xl shadow-sm disabled:opacity-50"
            >
              {t("cancel_button", { defaultValue: "Cancelar" })}
            </button>
            <button
              type="submit"
              disabled={
                isSubmitting || !formData.firstName || !formData.lastName
              }
              className="w-full sm:w-auto h-12 px-8 bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-sm font-semibold flex items-center justify-center gap-2 border-0 rounded-xl shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <QhSpinner size="sm" className="text-white" /> Procesando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" strokeWidth={2} />{" "}
                  {t("save_patient", { defaultValue: "Confirmar Registro" })}
                </>
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
