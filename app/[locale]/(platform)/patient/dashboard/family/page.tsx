"use client";

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, UserPlus, Baby, User, Trash2, Calendar, Plus, X,
    Loader2, CalendarIcon, HeartPulse, Syringe, HeartHandshake, FolderHeart,
    Sparkles, ShieldCheck, RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarUI } from "@/components/ui/calendar";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFamily } from '@/hooks/useFamily';
import { DependentRequest } from '@/types/dependent';
import { QhSpinner } from '@/components/ui/QhSpinner';
import { DependentVaccineAlert } from '@/components/family/DependentVaccineAlert';

export default function PatientFamilyDashboard() {
    const t = useTranslations('PatientFamilyDashboard');
    const { family, isLoading, isSubmitting, addMember, removeMember, refetch } = useFamily();
    const [showAddForm, setShowAddForm] = useState(false);

    const [formData, setFormData] = useState<DependentRequest>({
        firstName: '', lastName: '', dateOfBirth: '', gender: 'OTHER', relationship: 'CHILD', medicalNotes: ''
    });

    const resetForm = () => {
        setFormData({ firstName: '', lastName: '', dateOfBirth: '', gender: 'OTHER', relationship: 'CHILD', medicalNotes: '' });
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
        if (rel === 'CHILD') return <Baby className="h-7 w-7 text-medical-600 dark:text-medical-300" />;
        return <User className="h-7 w-7 text-medical-600 dark:text-medical-300" />;
    };

    const getTranslatedRelationship = (rel: string) => {
        switch (rel) {
            case 'CHILD': return t('rel_child') || 'Hijo/a';
            case 'PARENT': return t('rel_parent') || 'Padre/Madre';
            case 'SPOUSE': return t('rel_spouse') || 'Cónyuge';
            case 'SIBLING': return t('rel_sibling') || 'Hermano/a';
            default: return t('rel_other') || 'Otro';
        }
    };

    const childCount = family.filter(member => calculateAge(member.dateOfBirth) < 12).length;
    const elderCount = family.filter(member => calculateAge(member.dateOfBirth) >= 65).length;

    if (isLoading) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4">
                <QhSpinner size="lg" />
                <p className="font-medium text-slate-500 dark:text-slate-400 animate-pulse">Cargando familia...</p>
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-6xl space-y-8 p-4 sm:p-6 lg:p-8">
            <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                    <div className="flex items-start gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                            <Users className="h-7 w-7 text-slate-800 dark:text-slate-100" />
                        </div>
                        <div className="max-w-2xl">
                            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-medical-100 bg-medical-50 px-3 py-1 text-xs font-semibold text-medical-700 dark:border-medical-500/20 dark:bg-medical-500/10 dark:text-medical-300">
                                <Sparkles className="h-3.5 w-3.5" />
                                Perfiles familiares protegidos
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
                                {t('title') || 'Familia'}
                            </h1>
                            <p className="mt-2 text-base leading-7 text-slate-500 dark:text-slate-400">
                                {t('subtitle') || 'Administra perfiles médicos, vacunas y necesidades especiales de tus seres queridos.'}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                        <button
                            onClick={() => refetch()}
                            disabled={isLoading}
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:border-medical-200 hover:bg-medical-50 hover:text-medical-700 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-medical-500/30 dark:hover:bg-medical-500/10 dark:hover:text-medical-300"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Actualizar
                        </button>
                        {!showAddForm && (
                            <Button
                                onClick={() => setShowAddForm(true)}
                                className="h-11 rounded-xl bg-slate-950 px-5 text-white shadow-lg shadow-slate-950/10 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
                            >
                                <UserPlus className="mr-2 h-4 w-4" />
                                {t('btn_add_member') || 'Añadir familiar'}
                            </Button>
                        )}
                    </div>
                </div>

                {family.length > 0 && (
                    <div className="grid gap-3 sm:grid-cols-3">
                        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                            <div className="flex items-center justify-between gap-3">
                                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Familiares</p>
                                <Users className="h-5 w-5 text-medical-500" />
                            </div>
                            <p className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">{family.length}</p>
                        </div>
                        <div className="rounded-2xl border border-sky-100 bg-sky-50 p-4 shadow-sm dark:border-sky-500/20 dark:bg-sky-500/10">
                            <div className="flex items-center justify-between gap-3">
                                <p className="text-sm font-semibold text-sky-700 dark:text-sky-300">Cartilla infantil</p>
                                <Syringe className="h-5 w-5 text-sky-600 dark:text-sky-300" />
                            </div>
                            <p className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">{childCount}</p>
                        </div>
                        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 shadow-sm dark:border-emerald-500/20 dark:bg-emerald-500/10">
                            <div className="flex items-center justify-between gap-3">
                                <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Cuidados senior</p>
                                <HeartHandshake className="h-5 w-5 text-emerald-600 dark:text-emerald-300" />
                            </div>
                            <p className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">{elderCount}</p>
                        </div>
                    </div>
                )}
            </motion.div>

            <AnimatePresence>
                {showAddForm && (
                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -18 }}
                        className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20"
                    >
                        <div className="flex items-start justify-between gap-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-medical-50/70 p-6 dark:border-slate-800 dark:from-slate-900 dark:via-slate-900 dark:to-medical-500/10">
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
                                    {t('form_title') || 'Nuevo familiar'}
                                </h2>
                                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                                    Completa los datos básicos para habilitar seguimiento familiar.
                                </p>
                            </div>
                            <button
                                onClick={() => setShowAddForm(false)}
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm ring-1 ring-slate-200 transition-colors hover:text-slate-900 dark:bg-slate-950 dark:ring-slate-800 dark:hover:text-white"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleAddSubmit} className="space-y-6 p-5 sm:p-6">
                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="ml-1 text-sm font-bold text-slate-700 dark:text-slate-300">
                                        {t('label_first_name') || 'Nombre(s)'}
                                    </label>
                                    <Input
                                        required
                                        value={formData.firstName}
                                        onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                                        className="h-14 rounded-2xl border-slate-200 bg-white text-base focus-visible:ring-medical-500 dark:border-slate-800 dark:bg-slate-950"
                                        placeholder="Ej. María"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="ml-1 text-sm font-bold text-slate-700 dark:text-slate-300">
                                        {t('label_last_name') || 'Apellidos'}
                                    </label>
                                    <Input
                                        required
                                        value={formData.lastName}
                                        onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                                        className="h-14 rounded-2xl border-slate-200 bg-white text-base focus-visible:ring-medical-500 dark:border-slate-800 dark:bg-slate-950"
                                        placeholder="Ej. Pérez"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="ml-1 text-sm font-bold text-slate-700 dark:text-slate-300">
                                        {t('label_dob') || 'Fecha de nacimiento'}
                                    </label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    "h-14 w-full justify-start rounded-2xl border-slate-200 bg-white text-left text-base font-normal dark:border-slate-800 dark:bg-slate-950",
                                                    !formData.dateOfBirth && "text-slate-400 dark:text-slate-500"
                                                )}
                                            >
                                                <CalendarIcon className="mr-3 h-5 w-5 text-medical-500" />
                                                {formData.dateOfBirth ? (
                                                    <span className="font-medium text-slate-900 dark:text-white">
                                                        {format(new Date(`${formData.dateOfBirth}T12:00:00`), "PPP", { locale: es })}
                                                    </span>
                                                ) : (
                                                    <span>Selecciona una fecha</span>
                                                )}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="z-[100] w-auto overflow-hidden rounded-2xl border-slate-200 p-0 shadow-2xl dark:border-slate-800" align="start">
                                            <CalendarUI
                                                mode="single"
                                                selected={formData.dateOfBirth ? new Date(`${formData.dateOfBirth}T12:00:00`) : undefined}
                                                onSelect={(date) => setFormData({ ...formData, dateOfBirth: date ? format(date, "yyyy-MM-dd") : "" })}
                                                disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                                                initialFocus
                                                captionLayout="dropdown"
                                                fromYear={1900}
                                                toYear={new Date().getFullYear()}
                                                locale={es}
                                                className="bg-white p-4 dark:bg-slate-950"
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                <div className="space-y-2">
                                    <label className="ml-1 text-sm font-bold text-slate-700 dark:text-slate-300">
                                        {t('label_relationship') || 'Parentesco'}
                                    </label>
                                    <Select
                                        value={formData.relationship}
                                        onValueChange={(val) => setFormData({ ...formData, relationship: val })}
                                        required
                                    >
                                        <SelectTrigger className="h-14 w-full rounded-2xl border-slate-200 bg-white text-base focus:ring-medical-500 dark:border-slate-800 dark:bg-slate-950">
                                            <SelectValue placeholder="Selecciona parentesco" />
                                        </SelectTrigger>
                                        <SelectContent className="overflow-hidden rounded-2xl border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
                                            <SelectItem value="CHILD">{t('rel_child') || 'Hijo/a'}</SelectItem>
                                            <SelectItem value="PARENT">{t('rel_parent') || 'Padre/Madre'}</SelectItem>
                                            <SelectItem value="SPOUSE">{t('rel_spouse') || 'Cónyuge'}</SelectItem>
                                            <SelectItem value="SIBLING">{t('rel_sibling') || 'Hermano/a'}</SelectItem>
                                            <SelectItem value="OTHER">{t('rel_other') || 'Otro'}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 dark:border-slate-800 sm:flex-row sm:justify-end">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowAddForm(false)}
                                    className="h-12 rounded-2xl"
                                >
                                    {t('btn_cancel') || 'Cancelar'}
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting || !formData.firstName || !formData.lastName || !formData.dateOfBirth}
                                    className="h-12 rounded-2xl bg-slate-950 px-8 text-white shadow-lg shadow-slate-950/10 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
                                >
                                    {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Plus className="mr-2 h-5 w-5" />}
                                    {t('btn_save') || 'Guardar familiar'}
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {!showAddForm && family.length > 0 && (
                <motion.div
                    initial="hidden"
                    animate="show"
                    variants={{
                        hidden: { opacity: 0 },
                        show: { opacity: 1, transition: { staggerChildren: 0.08 } }
                    }}
                    className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
                >
                    {family.map((member) => {
                        const age = calculateAge(member.dateOfBirth);

                        return (
                            <motion.div
                                key={member.id}
                                variants={{
                                    hidden: { opacity: 0, y: 18 },
                                    show: { opacity: 1, y: 0 }
                                }}
                                className="group relative overflow-hidden rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-200/70 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 dark:hover:shadow-black/20"
                            >
                                <DependentVaccineAlert memberId={member.id} />

                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-medical-100 bg-medical-50 dark:border-medical-500/20 dark:bg-medical-500/10">
                                            {getRelationshipIcon(member.relationship)}
                                        </div>
                                        <div className="min-w-0">
                                            <span className="mb-1 inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold uppercase text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                                {getTranslatedRelationship(member.relationship)}
                                            </span>
                                            <h3 className="truncate text-xl font-bold text-slate-950 dark:text-white">
                                                {member.firstName} {member.lastName}
                                            </h3>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => removeMember(member.id)}
                                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 opacity-100 transition-all hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-rose-500/30 dark:hover:bg-rose-500/10 dark:hover:text-rose-300 sm:opacity-0 sm:group-hover:opacity-100"
                                        title="Eliminar"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>

                                <div className="mt-5 grid grid-cols-2 gap-3">
                                    <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-950/60">
                                        <p className="text-[11px] font-bold uppercase text-slate-400">Edad</p>
                                        <p className="mt-1 font-bold text-slate-950 dark:text-white">{age} años</p>
                                    </div>
                                    <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-950/60">
                                        <p className="text-[11px] font-bold uppercase text-slate-400">Nacimiento</p>
                                        <p className="mt-1 truncate text-sm font-semibold text-slate-700 dark:text-slate-200">{member.dateOfBirth}</p>
                                    </div>
                                </div>

                                <div className="mt-5 space-y-2.5">
                                    {age < 12 && (
                                        <Link href={`/patient/dashboard/family/${member.id}/vaccinations`} className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-sky-100 bg-sky-50 text-sm font-bold text-sky-700 transition-colors hover:bg-sky-100 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-300 dark:hover:bg-sky-500/20">
                                            <Syringe className="h-4 w-4" />
                                            Cartilla de vacunación
                                        </Link>
                                    )}
                                    {age >= 65 && (
                                        <Link href={`/patient/dashboard/family/${member.id}/eldercare`} className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 text-sm font-bold text-emerald-700 transition-colors hover:bg-emerald-100 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:hover:bg-emerald-500/20">
                                            <HeartHandshake className="h-4 w-4" />
                                            Cuidados geriátricos
                                        </Link>
                                    )}

                                    <Link href="/patient/dashboard/vault" className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition-colors hover:border-medical-200 hover:bg-medical-50 hover:text-medical-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:border-medical-500/30 dark:hover:bg-medical-500/10">
                                        <FolderHeart className="h-4 w-4 text-medical-500" />
                                        Bóveda médica
                                    </Link>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            )}

            {!showAddForm && family.length === 0 && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="overflow-hidden rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20 sm:p-12"
                >
                    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-medical-50 text-medical-500 dark:bg-medical-500/10 dark:text-medical-300">
                        <HeartPulse className="h-8 w-8" />
                    </div>
                    <h3 className="mb-2 text-xl font-bold text-slate-950 dark:text-white">
                        {t('empty_title') || 'Tu familia en un solo lugar'}
                    </h3>
                    <p className="mx-auto mb-6 max-w-md text-slate-500 dark:text-slate-400">
                        {t('empty_desc') || 'Agrega a tus hijos, padres o pareja para gestionar sus citas y seguimientos médicos fácilmente.'}
                    </p>
                    <Button
                        onClick={() => setShowAddForm(true)}
                        className="h-12 rounded-2xl bg-slate-950 px-6 text-white shadow-lg shadow-slate-950/10 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
                    >
                        <UserPlus className="mr-2 h-5 w-5" />
                        {t('btn_add_first') || 'Registrar primer familiar'}
                    </Button>
                </motion.div>
            )}
        </div>
    );
}
