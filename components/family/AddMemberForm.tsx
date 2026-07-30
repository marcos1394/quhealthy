"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Plus, X, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

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
import { Calendar as CalendarUI } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { cn } from "@/lib/utils";
import { useFamily } from "@/hooks/useFamily";
import { DependentRequest } from "@/types/dependent";

interface AddMemberFormProps {
  onCancel: () => void;
  onSuccess: () => void;
}

export function AddMemberForm({ onCancel, onSuccess }: AddMemberFormProps) {
  const t = useTranslations("PatientFamilyDashboard.AddMemberForm");
  const { addMember, isSubmitting } = useFamily();

  const [formData, setFormData] = useState<DependentRequest>({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "OTHER",
    relationship: "CHILD",
    medicalNotes: "",
  });

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      gender: "OTHER",
      relationship: "CHILD",
      medicalNotes: "",
    });
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addMember(formData, () => {
      resetForm();
      onSuccess();
    });
  };

  const minDate = useMemo(() => new Date("1900-01-01"), []);
  const maxDate = useMemo(() => new Date(), []);
  const currentYear = useMemo(() => new Date().getFullYear(), []);

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="overflow-hidden font-sans"
    >
      <div className="border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] mb-8 rounded-3xl shadow-2xs overflow-hidden transition-all">
        {/* ── HEADER DEL FORMULARIO ─────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-[#050505] p-6 md:p-8">
          <div className="space-y-1">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight">
              {t("form_title")}
            </h2>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
              {t("form_subtitle")}
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer shadow-2xs"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>

        {/* ── CUERPO DEL FORMULARIO ─────────────────────────────────── */}
        <form onSubmit={handleAddSubmit} className="p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* Nombre(s) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-800 dark:text-gray-200 block">
                {t("label_first_name")}
              </label>
              <Input
                required
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                className="h-11 rounded-xl border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] text-xs font-semibold text-gray-900 dark:text-white focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 transition-all shadow-2xs placeholder:text-gray-400 placeholder:font-normal"
                placeholder={t("placeholder_first_name")}
              />
            </div>

            {/* Apellidos */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-800 dark:text-gray-200 block">
                {t("label_last_name")}
              </label>
              <Input
                required
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                className="h-11 rounded-xl border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] text-xs font-semibold text-gray-900 dark:text-white focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 transition-all shadow-2xs placeholder:text-gray-400 placeholder:font-normal"
                placeholder={t("placeholder_last_name")}
              />
            </div>

            {/* Fecha de nacimiento */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-800 dark:text-gray-200 block">
                {t("label_dob")}
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "h-11 w-full justify-start rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] text-xs font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-2xs cursor-pointer",
                      !formData.dateOfBirth
                        ? "text-gray-400"
                        : "text-gray-900 dark:text-white font-semibold"
                    )}
                  >
                    <CalendarIcon className="mr-2.5 h-4 w-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                    {formData.dateOfBirth ? (
                      <span className="font-mono">
                        {format(
                          new Date(`${formData.dateOfBirth}T12:00:00`),
                          "dd MMM yyyy",
                          { locale: es }
                        )}
                      </span>
                    ) : (
                      <span>{t("select_date")}</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="z-[100] w-auto rounded-2xl border border-gray-100 dark:border-gray-800 p-2 bg-white dark:bg-[#0a0a0a] shadow-xl overflow-hidden font-sans"
                  align="start"
                >
                  <CalendarUI
                    mode="single"
                    selected={
                      formData.dateOfBirth
                        ? new Date(`${formData.dateOfBirth}T12:00:00`)
                        : undefined
                    }
                    onSelect={(date) =>
                      setFormData({
                        ...formData,
                        dateOfBirth: date ? format(date, "yyyy-MM-dd") : "",
                      })
                    }
                    disabled={(date) => date > maxDate || date < minDate}
                    initialFocus
                    captionLayout="dropdown"
                    fromYear={1900}
                    toYear={currentYear}
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Parentesco */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-800 dark:text-gray-200 block">
                {t("label_relationship")}
              </label>
              <Select
                value={formData.relationship}
                onValueChange={(val) =>
                  setFormData({ ...formData, relationship: val })
                }
                required
              >
                <SelectTrigger className="h-11 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] text-xs font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-2xs cursor-pointer">
                  <SelectValue placeholder={t("select_relationship_placeholder")} />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-xl p-1 font-sans">
                  <SelectItem value="CHILD" className="text-xs font-bold rounded-xl cursor-pointer">
                    {t("rel_child")}
                  </SelectItem>
                  <SelectItem value="PARENT" className="text-xs font-bold rounded-xl cursor-pointer">
                    {t("rel_parent")}
                  </SelectItem>
                  <SelectItem value="SPOUSE" className="text-xs font-bold rounded-xl cursor-pointer">
                    {t("rel_spouse")}
                  </SelectItem>
                  <SelectItem value="SIBLING" className="text-xs font-bold rounded-xl cursor-pointer">
                    {t("rel_sibling")}
                  </SelectItem>
                  <SelectItem value="OTHER" className="text-xs font-bold rounded-xl cursor-pointer">
                    {t("rel_other")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* ── BOTONES DE ACCIÓN ────────────────────────────────────── */}
          <div className="flex flex-col-reverse gap-3 border-t border-gray-100 dark:border-gray-800 pt-6 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="h-11 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#111] transition-all text-xs font-bold px-6 shadow-2xs cursor-pointer"
            >
              {t("btn_cancel")}
            </Button>
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                !formData.firstName ||
                !formData.lastName ||
                !formData.dateOfBirth
              }
              className="h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-8 transition-all shadow-xs border-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <QhSpinner size="sm" className="text-white" />
                  <span>{t("btn_saving")}</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" strokeWidth={2} />
                  <span>{t("btn_save")}</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}