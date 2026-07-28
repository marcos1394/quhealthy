"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/no-gray-on-colored-background */
/* eslint-disable react-doctor/prefer-module-scope-pure-function */

import React, { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  UserPlus,
  Baby,
  User,
  Trash2,
  CalendarIcon,
  Plus,
  X,
  Loader2,
  HeartPulse,
  Syringe,
  HeartHandshake,
  FolderHeart,
  Sparkles,
  RefreshCw,
  Activity,
} from "lucide-react";
import Link from "next/link";
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
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFamily } from "@/hooks/useFamily";
import { DependentRequest } from "@/types/dependent";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { DependentVaccineAlert } from "@/components/family/DependentVaccineAlert";

export default function PatientFamilyDashboard() {
  const t = useTranslations("PatientFamilyDashboard");
  const locale = useLocale();
  const dateLocale = locale === "en" ? enUS : es;

  const { family, isLoading, isSubmitting, addMember, removeMember, refetch } =
    useFamily();
  const [showAddForm, setShowAddForm] = useState(false);

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
      setShowAddForm(false);
      resetForm();
    });
  };

  const calculateAge = (dob: string) => {
    if (!dob) return 0;
    const diffMs = Date.now() - new Date(dob).getTime();
    const ageDt = new Date(diffMs);
    return Math.abs(ageDt.getUTCFullYear() - 1970);
  };

  const getRelationshipIcon = (rel: string) => {
    if (rel === "CHILD")
      return <Baby className="h-5 w-5 text-indigo-600 dark:text-indigo-400" strokeWidth={2} />;
    return <User className="h-5 w-5 text-indigo-600 dark:text-indigo-400" strokeWidth={2} />;
  };

  const getTranslatedRelationship = (rel: string) => {
    switch (rel) {
      case "CHILD":
        return t("rel_child");
      case "PARENT":
        return t("rel_parent");
      case "SPOUSE":
        return t("rel_spouse");
      case "SIBLING":
        return t("rel_sibling");
      default:
        return t("rel_other");
    }
  };

  const childCount = family.filter(
    (member) => calculateAge(member.dateOfBirth) < 12
  ).length;
  const elderCount = family.filter(
    (member) => calculateAge(member.dateOfBirth) >= 65
  ).length;

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] bg-gray-50/50 dark:bg-[#050505]">
        <QhSpinner size="lg" />
        <p className="text-xs font-semibold tracking-wide text-gray-500 dark:text-gray-400 mt-4 animate-pulse">
          {t("loading")}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] font-sans text-gray-900 dark:text-white selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500 pb-24">
      <div className="max-w-6xl mx-auto px-6 py-10 sm:py-12 space-y-10">
        
        {/* ── HEADER ────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 border-b border-gray-100 dark:border-gray-800 pb-8">
            <div className="flex items-start gap-5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-indigo-600 dark:text-indigo-400 shadow-sm">
                <Users className="h-7 w-7" strokeWidth={2} />
              </div>
              <div className="max-w-2xl">
                <div className="mb-2.5 inline-flex items-center gap-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/40 text-indigo-700 dark:text-indigo-400 px-3 py-1 text-xs font-bold shadow-sm">
                  <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
                  <span>{t("care_network_badge")}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-1.5">
                  {t("title")}
                </h1>
                <p className="text-xs sm:text-sm font-medium leading-relaxed text-gray-500 dark:text-gray-400">
                  {t("subtitle")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Button
                onClick={() => refetch()}
                disabled={isLoading}
                variant="outline"
                className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] h-11 px-5 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#111] transition-all shadow-sm disabled:opacity-50 flex items-center gap-2"
              >
                <RefreshCw
                  className={cn("h-4 w-4 text-emerald-600 dark:text-emerald-400", isLoading && "animate-spin")}
                  strokeWidth={2}
                />
                <span>{t("btn_sync")}</span>
              </Button>
              
              {!showAddForm && (
                <Button
                  onClick={() => setShowAddForm(true)}
                  className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 h-11 px-5 text-xs font-bold transition-all shadow-sm border-0 flex items-center gap-2"
                >
                  <UserPlus className="h-4 w-4" strokeWidth={2} />
                  <span>{t("btn_add_member")}</span>
                </Button>
              )}
            </div>
          </div>

          {/* ── ESTADÍSTICAS (SOFT HEALTH GRID) ─────────────────────────── */}
          {family.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-6 flex flex-col justify-between rounded-3xl shadow-sm transition-all">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400">
                    {t("stat_total_members")}
                  </p>
                  <div className="h-9 w-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <Users className="h-4.5 w-4.5" strokeWidth={2} />
                  </div>
                </div>
                <p className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white font-mono">
                  {family.length}
                </p>
              </div>

              <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-6 flex flex-col justify-between rounded-3xl shadow-sm transition-all">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400">
                    {t("stat_children_vaccines")}
                  </p>
                  <div className="h-9 w-9 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <Syringe className="h-4.5 w-4.5" strokeWidth={2} />
                  </div>
                </div>
                <p className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white font-mono">
                  {childCount}
                </p>
              </div>

              <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-6 flex flex-col justify-between rounded-3xl shadow-sm transition-all">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400">
                    {t("stat_elderly")}
                  </p>
                  <div className="h-9 w-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <HeartHandshake className="h-4.5 w-4.5" strokeWidth={2} />
                  </div>
                </div>
                <p className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white font-mono">
                  {elderCount}
                </p>
              </div>
            </div>
          )}
        </motion.div>

        {/* ── FORMULARIO DE REGISTRO ────────────────────────────────────── */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] mb-8 rounded-3xl shadow-sm">
                <div className="flex items-start justify-between gap-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#111]/30 p-6 md:p-8 rounded-t-3xl">
                  <div>
                    <h2 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white mb-1">
                      {t("form_title")}
                    </h2>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      {t("form_subtitle")}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddForm(false)}
                    aria-label={t("btn_cancel")}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all shadow-sm"
                  >
                    <X className="h-4 w-4" strokeWidth={2} />
                  </button>
                </div>

                <form onSubmit={handleAddSubmit} className="p-6 md:p-8 space-y-6">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block">
                        {t("label_first_name")}
                      </label>
                      <Input
                        required
                        value={formData.firstName}
                        onChange={(e) =>
                          setFormData({ ...formData, firstName: e.target.value })
                        }
                        className="h-11 rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-xs font-medium focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 transition-all shadow-sm"
                        placeholder="Ej. María"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block">
                        {t("label_last_name")}
                      </label>
                      <Input
                        required
                        value={formData.lastName}
                        onChange={(e) =>
                          setFormData({ ...formData, lastName: e.target.value })
                        }
                        className="h-11 rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-xs font-medium focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 transition-all shadow-sm"
                        placeholder="Ej. Pérez"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block">
                        {t("label_dob")}
                      </label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "h-11 w-full justify-start rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-xs font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm",
                              !formData.dateOfBirth && "text-gray-400"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" strokeWidth={2} />
                            {formData.dateOfBirth ? (
                              <span className="text-gray-900 dark:text-white font-medium">
                                {format(
                                  new Date(`${formData.dateOfBirth}T12:00:00`),
                                  "dd MMM yyyy",
                                  { locale: dateLocale }
                                )}
                              </span>
                            ) : (
                              <span>{t("select_date")}</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="z-[100] w-auto rounded-2xl border border-gray-100 dark:border-gray-800 p-0 bg-white dark:bg-[#0a0a0a] shadow-xl"
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
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                            captionLayout="dropdown"
                            fromYear={1900}
                            toYear={new Date().getFullYear()}
                            locale={dateLocale}
                            className="p-3"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 dark:text-gray-400 block">
                        {t("label_relationship")}
                      </label>
                      <Select
                        value={formData.relationship}
                        onValueChange={(val) =>
                          setFormData({ ...formData, relationship: val })
                        }
                        required
                      >
                        <SelectTrigger className="h-11 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-xs font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm">
                          <SelectValue placeholder={t("select_relationship_placeholder")} />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-lg">
                          <SelectItem value="CHILD" className="text-xs font-medium">
                            {t("rel_child")}
                          </SelectItem>
                          <SelectItem value="PARENT" className="text-xs font-medium">
                            {t("rel_parent")}
                          </SelectItem>
                          <SelectItem value="SPOUSE" className="text-xs font-medium">
                            {t("rel_spouse")}
                          </SelectItem>
                          <SelectItem value="SIBLING" className="text-xs font-medium">
                            {t("rel_sibling")}
                          </SelectItem>
                          <SelectItem value="OTHER" className="text-xs font-medium">
                            {t("rel_other")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 border-t border-gray-100 dark:border-gray-800 pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAddForm(false)}
                      className="h-11 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#111] text-xs font-bold px-6 transition-all shadow-sm"
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
                      className="h-11 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-xs font-bold px-6 transition-all shadow-sm border-0 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Plus className="h-4 w-4" strokeWidth={2.5} />
                      )}
                      <span>{t("btn_save")}</span>
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── LISTA DE FAMILIARES ────────────────────────────────────────── */}
        {!showAddForm && family.length > 0 && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {family.map((member) => {
              const age = calculateAge(member.dateOfBirth);

              return (
                <div
                  key={member.id}
                  className="group flex flex-col border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] transition-all rounded-3xl shadow-sm hover:shadow-md hover:border-emerald-500/30 dark:hover:border-emerald-500/30 overflow-hidden"
                >
                  {age < 12 && <DependentVaccineAlert memberId={member.id} />}

                  <div className="p-6 flex items-start justify-between gap-4 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 shadow-sm">
                        {getRelationshipIcon(member.relationship)}
                      </div>
                      <div>
                        <span className="mb-1 inline-flex rounded-full bg-gray-100 dark:bg-gray-800 px-3 py-1 text-[11px] font-bold text-gray-600 dark:text-gray-300">
                          {getTranslatedRelationship(member.relationship)}
                        </span>
                        <h3 className="truncate text-base font-bold tracking-tight text-gray-900 dark:text-white">
                          {member.firstName} {member.lastName}
                        </h3>
                      </div>
                    </div>

                    <button
                      onClick={() => removeMember(member.id)}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-transparent text-gray-400 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 dark:hover:border-rose-900/40 dark:hover:bg-rose-950/30 transition-all shadow-sm z-20"
                      title={t("delete_record_tooltip")}
                      aria-label={t("delete_record_tooltip")}
                    >
                      <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                    </button>
                  </div>

                  {/* Grid Info Interno */}
                  <div className="grid grid-cols-2 gap-0 bg-gray-50/50 dark:bg-[#111]/30 border-b border-gray-100 dark:border-gray-800">
                    <div className="border-r border-gray-100 dark:border-gray-800 p-4">
                      <p className="text-[11px] font-bold text-gray-400 mb-0.5">
                        {t("age_years")}
                      </p>
                      <p className="font-bold text-xs text-gray-900 dark:text-white font-mono">
                        {age}
                      </p>
                    </div>
                    <div className="p-4">
                      <p className="text-[11px] font-bold text-gray-400 mb-0.5">
                        {t("dob_prefix")}
                      </p>
                      <p className="truncate text-xs font-bold text-gray-900 dark:text-white font-mono">
                        {member.dateOfBirth}
                      </p>
                    </div>
                  </div>

                  {/* Botones de Acción Modulares */}
                  <div className="p-6 flex flex-col gap-2.5 bg-white dark:bg-[#0a0a0a] flex-1 justify-end">
                    {age <= 5 && (
                      <Link
                        href={`/patient/dashboard/family/${member.id}/growth`}
                        className="flex h-10 w-full items-center justify-start px-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-xs font-bold text-gray-700 dark:text-gray-300 transition-all hover:border-emerald-500 hover:text-emerald-600 dark:hover:border-emerald-500 dark:hover:text-emerald-400 shadow-sm"
                      >
                        <Activity className="h-4 w-4 mr-2.5 text-emerald-500" strokeWidth={2} />
                        <span>{t("action_pediatric_growth")}</span>
                      </Link>
                    )}
                    
                    {age < 12 && (
                      <Link
                        href={`/patient/dashboard/family/${member.id}/vaccinations`}
                        className="flex h-10 w-full items-center justify-start px-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-xs font-bold text-gray-700 dark:text-gray-300 transition-all hover:border-emerald-500 hover:text-emerald-600 dark:hover:border-emerald-500 dark:hover:text-emerald-400 shadow-sm"
                      >
                        <Syringe className="h-4 w-4 mr-2.5 text-emerald-500" strokeWidth={2} />
                        <span>{t("action_vaccination_schedule")}</span>
                      </Link>
                    )}
                    
                    {age >= 65 && (
                      <Link
                        href={`/patient/dashboard/family/${member.id}/eldercare`}
                        className="flex h-10 w-full items-center justify-start px-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-xs font-bold text-gray-700 dark:text-gray-300 transition-all hover:border-emerald-500 hover:text-emerald-600 dark:hover:border-emerald-500 dark:hover:text-emerald-400 shadow-sm"
                      >
                        <HeartHandshake className="h-4 w-4 mr-2.5 text-emerald-500" strokeWidth={2} />
                        <span>{t("action_geriatric_care")}</span>
                      </Link>
                    )}

                    <Link
                      href="/patient/dashboard/vault"
                      className="flex h-10 w-full items-center justify-start px-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-xs font-bold text-gray-600 dark:text-gray-400 transition-all hover:border-gray-400 hover:text-gray-900 dark:hover:border-gray-600 dark:hover:text-white shadow-sm"
                    >
                      <FolderHeart className="h-4 w-4 mr-2.5 text-indigo-500" strokeWidth={2} />
                      <span>{t("action_document_vault")}</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── ESTADO VACÍO (EMPTY STATE) ────────────────────────────────── */}
        {!showAddForm && family.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-8 text-center rounded-3xl shadow-sm"
          >
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 shadow-sm">
              <HeartPulse className="h-8 w-8" strokeWidth={2} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {t("empty_title")}
            </h3>
            <p className="mx-auto mb-8 max-w-md text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
              {t("empty_desc")}
            </p>
            <Button
              onClick={() => setShowAddForm(true)}
              className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 h-12 px-8 text-xs font-bold transition-all shadow-sm border-0 flex items-center justify-center gap-2"
            >
              <UserPlus className="h-4 w-4" strokeWidth={2} />
              <span>{t("btn_add_first")}</span>
            </Button>
          </motion.div>
        )}

      </div>
    </div>
  );
}