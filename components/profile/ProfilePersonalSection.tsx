"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { User, Phone, MapPin, Users } from "lucide-react";
import { format, parse, isValid } from "date-fns";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { ConsumerProfile } from "@/types/consumerProfile";

interface Props {
  form: ConsumerProfile;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
}

export function ProfilePersonalSection({
  form,
  handleInputChange,
  handleSelectChange,
}: Props) {
  const t = useTranslations("PatientProfile");

  // Parse birthDate string (YYYY-MM-DD)
  const selectedDate = form.birthDate
    ? parse(form.birthDate, "yyyy-MM-dd", new Date())
    : undefined;

  const handleDateSelect = (date: Date | undefined) => {
    if (date && isValid(date)) {
      const syntheticEvent = {
        target: {
          name: "birthDate",
          value: format(date, "yyyy-MM-dd"),
        },
      } as React.ChangeEvent<HTMLInputElement>;
      handleInputChange(syntheticEvent);
    }
  };

  return (
    <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-2xs font-sans transition-colors select-none space-y-8">
      {/* ── CABECERA DE SECCIÓN ────────────────────────────────────────── */}
      <div className="pb-6 border-b border-gray-100 dark:border-gray-800 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/30 flex items-center justify-center text-sky-600 dark:text-sky-400 shrink-0 shadow-2xs">
          <User className="w-6 h-6" strokeWidth={2} />
        </div>

        <div className="space-y-0.5">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight">
            {t("section_personal")}
          </h3>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
            {t("section_personal_desc")}
          </p>
        </div>
      </div>

      {/* ── FORMULARIO PRINCIPAL DE DATOS PERSONALIZADOS ─────────────── */}
      <div className="space-y-5">
        {/* Nombre Completo */}
        <div className="space-y-1.5">
          <Label htmlFor="fullName" className="text-xs font-bold text-gray-800 dark:text-gray-200">
            {t("label_name")}
          </Label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" strokeWidth={2} />
            <Input
              id="fullName"
              name="fullName"
              value={form.fullName}
              onChange={handleInputChange}
              placeholder={t("placeholder_name")}
              className="pl-10 h-11 bg-gray-50/50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 rounded-xl transition-all shadow-2xs"
            />
          </div>
        </div>

        {/* Fecha de Nacimiento y Sexo Biológico */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* DatePicker */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-gray-800 dark:text-gray-200">
              {t("label_birth")}
            </Label>
            <DatePicker
              value={selectedDate}
              onChange={handleDateSelect}
              disabled={(date) =>
                date > new Date() || date < new Date("1900-01-01")
              }
              fromYear={1920}
              toYear={new Date().getFullYear()}
              placeholder={t("placeholder_birth")}
              className="h-11 rounded-xl border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] text-xs font-semibold text-gray-900 dark:text-white shadow-2xs"
              popoverClassName="rounded-2xl border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-xl"
            />
          </div>

          {/* Sexo Biológico */}
          <div className="space-y-1.5">
            <Label htmlFor="gender" className="text-xs font-bold text-gray-800 dark:text-gray-200">
              {t("label_gender")}
            </Label>
            <div className="relative">
              <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10 pointer-events-none" strokeWidth={2} />
              <Select
                value={form.gender}
                onValueChange={(val) => handleSelectChange("gender", val)}
              >
                <SelectTrigger className="pl-10 h-11 bg-gray-50/50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 rounded-xl transition-all shadow-2xs">
                  <SelectValue placeholder="—" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-[#0a0a0a] border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl font-sans text-xs">
                  <SelectItem value="male" className="rounded-xl font-medium">
                    {t("gender_male")}
                  </SelectItem>
                  <SelectItem value="female" className="rounded-xl font-medium">
                    {t("gender_female")}
                  </SelectItem>
                  <SelectItem value="other" className="rounded-xl font-medium">
                    {t("gender_other")}
                  </SelectItem>
                  <SelectItem value="none" className="rounded-xl font-medium">
                    {t("gender_none")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Ubicación y Teléfono */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          {/* Dirección/Ubicación */}
          <div className="space-y-1.5">
            <Label htmlFor="location" className="text-xs font-bold text-gray-800 dark:text-gray-200">
              {t("label_address")}
            </Label>
            <p className="text-[11px] font-medium text-gray-400 leading-relaxed">
              {t("help_address")}
            </p>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" strokeWidth={2} />
              <Input
                id="location"
                name="location"
                value={form.location}
                onChange={handleInputChange}
                placeholder={t("placeholder_address")}
                className="pl-10 h-11 bg-gray-50/50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 rounded-xl transition-all shadow-2xs"
              />
            </div>
          </div>

          {/* Teléfono */}
          <div className="space-y-1.5">
            <Label htmlFor="phoneNumber" className="text-xs font-bold text-gray-800 dark:text-gray-200">
              {t("label_phone")}
            </Label>
            <p className="text-[11px] font-medium text-gray-400 leading-relaxed">
              {t("help_phone")}
            </p>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" strokeWidth={2} />
              <Input
                id="phoneNumber"
                type="tel"
                name="phoneNumber"
                value={form.phoneNumber}
                onChange={handleInputChange}
                placeholder="+52 55 1234 5678"
                className="pl-10 h-11 bg-gray-50/50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 text-xs font-mono font-semibold text-gray-900 dark:text-white focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 rounded-xl transition-all shadow-2xs"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}