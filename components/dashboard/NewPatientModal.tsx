"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useState } from "react";
import { CalendarIcon, Users, UserPlus, X, Save, Shield } from "lucide-react";
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
  const t = useTranslations("DashboardPatients.NewPatientModal");
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
    curp: "",
    ethnicGroup: "",
    healthInsurance: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    address: "",
  });

  const selectedBirthDate = formData.birthDate
    ? parse(formData.birthDate, "yyyy-MM-dd", new Date())
    : undefined;

  const displayBirthDate = selectedBirthDate
    ? format(
        selectedBirthDate,
        locale === "es" ? "d 'de' MMMM 'de' yyyy" : "MMMM d, yyyy",
        { locale: dateLocale }
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
      <DialogContent className="sm:max-w-2xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-0 rounded-3xl shadow-2xl overflow-hidden flex flex-col font-sans transition-colors [&>button]:hidden">
        {/* ── HEADER ─────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between p-6 sm:p-8 bg-gray-50/60 dark:bg-[#050505] border-b border-gray-100 dark:border-gray-800 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center shrink-0 shadow-2xs text-emerald-600 dark:text-emerald-400">
              <UserPlus className="w-6 h-6" strokeWidth={2} />
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                {t("module_label")}
              </p>
              <DialogTitle className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white tracking-tight leading-none">
                {t("title")}
              </DialogTitle>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-white dark:bg-[#111] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 cursor-pointer shadow-2xs shrink-0 disabled:opacity-50"
          >
            <X className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>

        {/* ── CUERPO DEL FORMULARIO ─────────────────────────────────── */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 bg-white dark:bg-[#0a0a0a] overflow-y-auto custom-scrollbar"
        >
          <div className="p-6 sm:p-8 space-y-6">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
              {t("description")}
            </p>

            {/* Nombres y Apellidos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                  {t("first_name")} *
                </label>
                <Input
                  required
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  className="h-11 px-4 bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-emerald-500/20 shadow-2xs"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                  {t("last_name")} *
                </label>
                <Input
                  required
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  className="h-11 px-4 bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-emerald-500/20 shadow-2xs"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Contacto Principal */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                  {t("email")}{" "}
                  <span className="text-gray-400 font-normal">
                    {t("optional_tag")}
                  </span>
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="h-11 px-4 bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-emerald-500/20 shadow-2xs"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-1.5 relative">
                <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                  {t("phone")}{" "}
                  <span className="text-gray-400 font-normal">
                    {t("optional_tag")}
                  </span>
                </label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="h-11 px-4 bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-xs font-bold font-mono text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-emerald-500/20 shadow-2xs"
                  disabled={isSubmitting}
                />
                {(formData.phone?.replace(/\D/g, "").length ?? 0) >= 10 && (
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 absolute right-1 -top-5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    {t("whatsapp_detected")}
                  </span>
                )}
              </div>
            </div>

            {/* Demografía Base */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                  {t("birth_date")}
                </label>
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      disabled={isSubmitting}
                      className={cn(
                        "w-full h-11 px-4 flex items-center justify-start text-left rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] text-xs font-bold transition-all shadow-2xs cursor-pointer disabled:opacity-50",
                        !displayBirthDate
                          ? "text-gray-400"
                          : "text-gray-900 dark:text-white"
                      )}
                    >
                      <CalendarIcon
                        className="mr-2.5 h-4 w-4 shrink-0 text-gray-400"
                        strokeWidth={2}
                      />
                      <span>
                        {displayBirthDate || t("birth_date_placeholder")}
                      </span>
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
                      className="rounded-2xl bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white p-3 font-sans"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                  {t("gender")}
                </label>
                <div className="relative">
                  <Users
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10 pointer-events-none"
                    strokeWidth={2}
                  />
                  <Select
                    value={formData.gender}
                    onValueChange={(value: "MALE" | "FEMALE" | "OTHER") =>
                      setFormData({ ...formData, gender: value })
                    }
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="pl-10 h-11 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] text-gray-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-emerald-500/20 shadow-2xs cursor-pointer">
                      <SelectValue placeholder={t("gender_placeholder")} />
                    </SelectTrigger>
                    <SelectContent className="z-[100] bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl font-sans">
                      <SelectItem className="text-xs font-semibold cursor-pointer" value="MALE">
                        {t("gender_male")}
                      </SelectItem>
                      <SelectItem className="text-xs font-semibold cursor-pointer" value="FEMALE">
                        {t("gender_female")}
                      </SelectItem>
                      <SelectItem className="text-xs font-semibold cursor-pointer" value="OTHER">
                        {t("gender_other")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Datos Complementarios NOM-024 */}
            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-4">
              <h4 className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                <span>{t("nom024_title")}</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                    {t("curp")}
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
                    placeholder={t("curp_placeholder")}
                    className="h-11 px-4 bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-xs font-bold font-mono text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-emerald-500/20 shadow-2xs uppercase"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                    {t("health_insurance")}
                  </label>
                  <Select
                    value={formData.healthInsurance}
                    onValueChange={(val) =>
                      setFormData({ ...formData, healthInsurance: val })
                    }
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="h-11 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] text-xs font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 shadow-2xs cursor-pointer">
                      <SelectValue placeholder={t("health_insurance_placeholder")} />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl font-sans">
                      <SelectItem className="text-xs font-semibold cursor-pointer" value="IMSS">IMSS</SelectItem>
                      <SelectItem className="text-xs font-semibold cursor-pointer" value="ISSSTE">ISSSTE</SelectItem>
                      <SelectItem className="text-xs font-semibold cursor-pointer" value="INSABI">INSABI / SSA</SelectItem>
                      <SelectItem className="text-xs font-semibold cursor-pointer" value="PEMEX">PEMEX / SEDENA / SEMAR</SelectItem>
                      <SelectItem className="text-xs font-semibold cursor-pointer" value="SEGURO_PRIVADO">Seguro Médico Privado</SelectItem>
                      <SelectItem className="text-xs font-semibold cursor-pointer" value="NINGUNA">Ninguna</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                  {t("address")}
                </label>
                <textarea
                  value={formData.address || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder={t("address_placeholder")}
                  className="w-full min-h-[75px] p-3.5 bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 rounded-xl resize-none shadow-2xs leading-relaxed"
                  disabled={isSubmitting}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                    {t("ethnic_group")}
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
                    placeholder={t("ethnic_group_placeholder")}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Contacto de Emergencia */}
              <div className="pt-2 space-y-3">
                <h5 className="text-xs font-bold text-gray-900 dark:text-white">
                  {t("emergency_contact_title")}
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                      {t("emergency_contact_name")}
                    </label>
                    <Input
                      value={formData.emergencyContactName || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          emergencyContactName: e.target.value,
                        })
                      }
                      className="h-11 px-4 bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-emerald-500/20 shadow-2xs"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                      {t("emergency_contact_phone")}
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
                      className="h-11 px-4 bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-xs font-bold font-mono text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-emerald-500/20 shadow-2xs"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Preferencias de Notificación */}
          {(formData.email || formData.phone) && (
            <div className="p-6 bg-gray-50/60 dark:bg-[#050505] border-t border-gray-100 dark:border-gray-800 space-y-3">
              <label className="block text-xs font-bold text-gray-800 dark:text-gray-200">
                {t("notification_title")}
              </label>
              <div className="flex flex-wrap gap-2.5">
                <button
                  type="button"
                  disabled={!formData.email}
                  onClick={() =>
                    setFormData({
                      ...formData,
                      preferredNotificationMethod: "EMAIL",
                    })
                  }
                  className={cn(
                    "px-4 h-10 text-xs font-bold rounded-xl border transition-all cursor-pointer shadow-2xs",
                    formData.preferredNotificationMethod === "EMAIL"
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  {t("notify_email")}
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
                  className={cn(
                    "px-4 h-10 text-xs font-bold rounded-xl border transition-all cursor-pointer shadow-2xs",
                    formData.preferredNotificationMethod === "WHATSAPP"
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  {t("notify_whatsapp")}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      preferredNotificationMethod: "NONE",
                    })
                  }
                  className={cn(
                    "px-4 h-10 text-xs font-bold rounded-xl border transition-all cursor-pointer shadow-2xs",
                    formData.preferredNotificationMethod === "NONE"
                      ? "bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700"
                      : "bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:bg-gray-50"
                  )}
                >
                  {t("notify_none")}
                </button>
              </div>
            </div>
          )}

          {/* ── FOOTER DE COMANDOS ────────────────────────────────────── */}
          <div className="p-5 bg-gray-50/60 dark:bg-[#050505] border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row justify-end gap-3 shrink-0 mt-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto h-11 px-6 border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#111] transition-all text-xs font-bold rounded-xl disabled:opacity-50 shadow-2xs cursor-pointer"
            >
              {t("btn_cancel")}
            </button>
            <button
              type="submit"
              disabled={
                isSubmitting || !formData.firstName || !formData.lastName
              }
              className="w-full sm:w-auto h-11 px-8 bg-emerald-600 hover:bg-emerald-700 text-white transition-all text-xs font-bold flex items-center justify-center gap-2 rounded-xl disabled:opacity-50 shadow-xs border-0 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <QhSpinner size="sm" className="text-white" />
                  <span>{t("btn_submitting")}</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" strokeWidth={2} />
                  <span>{t("btn_submit")}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}