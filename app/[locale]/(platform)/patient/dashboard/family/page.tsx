"use client"
/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/no-gray-on-colored-background */
/* eslint-disable react-doctor/prefer-module-scope-pure-function */
/* eslint-disable react-doctor/no-giant-component */;

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, UserPlus, Baby, User, Trash2, CalendarIcon, Plus, X,
    Loader2, HeartPulse, Syringe, HeartHandshake, FolderHeart,
    Sparkles, RefreshCw
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
        if (rel === 'CHILD') return <Baby className="h-5 w-5 text-black dark:text-white" strokeWidth={1.5} />;
        return <User className="h-5 w-5 text-black dark:text-white" strokeWidth={1.5} />;
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
            <div className="flex flex-col justify-center items-center min-h-[60vh] bg-white dark:bg-[#0a0a0a]">
                <QhSpinner size="lg" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-4 animate-pulse">
                    Sincronizando expedientes...
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-[#0a0a0a] font-sans text-black dark:text-white selection:bg-gray-200 dark:selection:bg-white/20 transition-colors duration-300">
            <div className="max-w-6xl mx-auto px-6 py-12 md:py-16 space-y-12">
                
                {/* --- HEADER --- */}
                <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 border-b border-gray-200 dark:border-gray-800 pb-8">
                        <div className="flex items-start gap-6">
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center border border-black dark:border-white bg-gray-50 dark:bg-[#050505]">
                                <Users className="h-6 w-6 text-black dark:text-white" strokeWidth={1.5} />
                            </div>
                            <div className="max-w-2xl">
                                <div className="mb-3 inline-flex items-center gap-2 bg-black text-white dark:bg-white dark:text-black px-2 py-1 text-[9px] font-bold uppercase tracking-widest">
                                    <Sparkles className="h-3 w-3" strokeWidth={2} />
                                    Expedientes Compartidos
                                </div>
                                <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-white uppercase mb-2">
                                    {t('title') || 'Núcleo Familiar'}
                               </h1>
                                <p className="text-xs font-light leading-relaxed text-gray-500">
                                    {t('subtitle') || 'Administre perfiles médicos, esquemas de vacunación y seguimientos geriátricos de sus dependientes.'}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 shrink-0">
                            <Button
                                onClick={() => refetch()}
                                disabled={isLoading}
                                variant="outline"
                                className="rounded-none border border-black dark:border-white h-12 px-6 text-[10px] font-bold uppercase tracking-widest hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors disabled:opacity-50"
                            >
                                <RefreshCw className="h-4 w-4 mr-2" strokeWidth={2} />
                                Sincronizar
                            </Button>
                            {!showAddForm && (
                                <Button
                                    onClick={() => setShowAddForm(true)}
                                    className="rounded-none bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 h-12 px-6 text-[10px] font-bold uppercase tracking-widest transition-colors border-0"
                                >
                                    <UserPlus className="mr-3 h-4 w-4" strokeWidth={2} />
                                    {t('btn_add_member') || 'Añadir Familiar'}
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* --- ESTADÍSTICAS (BLUEPRINT GRID) --- */}
                    {family.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 border-t border-l border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505]">
                            <div className="border-b border-r border-gray-200 dark:border-gray-800 p-6 flex flex-col justify-between hover:bg-white dark:hover:bg-[#0a0a0a] transition-colors">
                                <div className="flex items-center justify-between gap-3 mb-6">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Total Miembros</p>
                                    <Users className="h-4 w-4 text-black dark:text-white" strokeWidth={1.5} />
                                </div>
                                <p className="text-3xl font-semibold tracking-tight">{family.length}</p>
                            </div>
                            <div className="border-b border-r border-gray-200 dark:border-gray-800 p-6 flex flex-col justify-between hover:bg-white dark:hover:bg-[#0a0a0a] transition-colors">
                                <div className="flex items-center justify-between gap-3 mb-6">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Esquemas Infantiles</p>
                                    <Syringe className="h-4 w-4 text-black dark:text-white" strokeWidth={1.5} />
                                </div>
                                <p className="text-3xl font-semibold tracking-tight">{childCount}</p>
                            </div>
                            <div className="border-b border-r border-gray-200 dark:border-gray-800 p-6 flex flex-col justify-between hover:bg-white dark:hover:bg-[#0a0a0a] transition-colors">
                                <div className="flex items-center justify-between gap-3 mb-6">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Cuidados Senior</p>
                                    <HeartHandshake className="h-4 w-4 text-black dark:text-white" strokeWidth={1.5} />
                                </div>
                                <p className="text-3xl font-semibold tracking-tight">{elderCount}</p>
                            </div>
                        </div>
                    )}
                </motion.div>

                {/* --- FORMULARIO DE REGISTRO --- */}
                <AnimatePresence>
                    {showAddForm && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] mb-8">
                                <div className="flex items-start justify-between gap-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] p-6 md:p-8">
                                    <div>
                                        <h2 className="text-sm font-bold uppercase tracking-widest text-black dark:text-white mb-2">
                                            {t('form_title') || 'Creación de Expediente'}
                                        </h2>
                                        <p className="text-xs font-light text-gray-500">
                                            Defina los parámetros básicos de identidad para el nuevo dependiente.
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setShowAddForm(false)}
                                        className="flex h-10 w-10 shrink-0 items-center justify-center border border-gray-300 dark:border-gray-700 bg-white dark:bg-black text-gray-500 hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white transition-colors"
                                    >
                                        <X className="h-4 w-4" strokeWidth={1.5} />
                                    </button>
                                </div>

                                <form onSubmit={handleAddSubmit} className="p-6 md:p-8 space-y-8">
                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 block">
                                                {t('label_first_name') || 'Nombre(s)'}
                                            </label>
                                            <Input
                                                required
                                                value={formData.firstName}
                                                onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                                                className="h-12 rounded-none border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] text-sm focus-visible:ring-0 focus-visible:border-black dark:focus-visible:border-white transition-colors"
                                                placeholder="Ej. María"
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 block">
                                                {t('label_last_name') || 'Apellidos'}
                                            </label>
                                            <Input
                                                required
                                                value={formData.lastName}
                                                onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                                                className="h-12 rounded-none border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] text-sm focus-visible:ring-0 focus-visible:border-black dark:focus-visible:border-white transition-colors"
                                                placeholder="Ej. Pérez"
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 block">
                                                {t('label_dob') || 'Fecha de nacimiento'}
                                            </label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        className={cn(
                                                            "h-12 w-full justify-start rounded-none border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] text-sm font-normal focus:ring-0 hover:border-black dark:hover:border-white transition-colors",
                                                            !formData.dateOfBirth && "text-gray-400"
                                                        )}
                                                    >
                                                        <CalendarIcon className="mr-3 h-4 w-4" strokeWidth={1.5} />
                                                        {formData.dateOfBirth ? (
                                                            <span className="text-black dark:text-white font-semibold">
                                                                {format(new Date(`${formData.dateOfBirth}T12:00:00`), "dd MMM yyyy", { locale: es })}
                                                            </span>
                                                        ) : (
                                                            <span>Seleccionar fecha</span>
                                                        )}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="z-[100] w-auto rounded-none border border-black dark:border-white p-0 bg-white dark:bg-[#0a0a0a]" align="start">
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
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 block">
                                                {t('label_relationship') || 'Parentesco'}
                                            </label>
                                            <Select
                                                value={formData.relationship}
                                                onValueChange={(val) => setFormData({ ...formData, relationship: val })}
                                                required
                                            >
                                                <SelectTrigger className="h-12 w-full rounded-none border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] text-sm focus:ring-0 focus:border-black dark:focus:border-white transition-colors">
                                                    <SelectValue placeholder="Seleccione vínculo" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-none border border-black dark:border-white bg-white dark:bg-[#0a0a0a]">
                                                    <SelectItem value="CHILD" className="text-xs uppercase tracking-widest">{t('rel_child') || 'Hijo/a'}</SelectItem>
                                                    <SelectItem value="PARENT" className="text-xs uppercase tracking-widest">{t('rel_parent') || 'Padre/Madre'}</SelectItem>
                                                    <SelectItem value="SPOUSE" className="text-xs uppercase tracking-widest">{t('rel_spouse') || 'Cónyuge'}</SelectItem>
                                                    <SelectItem value="SIBLING" className="text-xs uppercase tracking-widest">{t('rel_sibling') || 'Hermano/a'}</SelectItem>
                                                    <SelectItem value="OTHER" className="text-xs uppercase tracking-widest">{t('rel_other') || 'Otro'}</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="flex flex-col-reverse gap-4 border-t border-gray-200 dark:border-gray-800 pt-6 sm:flex-row sm:justify-end">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setShowAddForm(false)}
                                            className="h-12 rounded-none border border-gray-300 dark:border-gray-700 hover:border-black dark:hover:border-white text-[10px] font-bold uppercase tracking-widest px-8 transition-colors"
                                        >
                                            {t('btn_cancel') || 'Cancelar'}
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={isSubmitting || !formData.firstName || !formData.lastName || !formData.dateOfBirth}
                                            className="h-12 rounded-none bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 text-[10px] font-bold uppercase tracking-widest px-8 transition-colors border-0 disabled:opacity-50"
                                        >
                                            {isSubmitting ? <Loader2 className="mr-3 h-4 w-4 animate-spin" /> : <Plus className="mr-3 h-4 w-4" strokeWidth={2} />}
                                            {t('btn_save') || 'Guardar Registro'}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* --- LISTA DE FAMILIARES --- */}
                {!showAddForm && family.length > 0 && (
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {family.map((member) => {
                            const age = calculateAge(member.dateOfBirth);

                            return (
                                <div
                                    key={member.id}
                                    className="group relative flex flex-col border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] hover:border-black dark:hover:border-white transition-colors"
                                >
                                    <DependentVaccineAlert memberId={member.id} />

                                    <div className="p-6 md:p-8 flex items-start justify-between gap-4 border-b border-gray-200 dark:border-gray-800">
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-black dark:border-white bg-gray-50 dark:bg-[#050505]">
                                                {getRelationshipIcon(member.relationship)}
                                            </div>
                                            <div>
                                                <span className="mb-1 inline-flex border border-gray-300 dark:border-gray-700 bg-white dark:bg-black px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-gray-500">
                                                    {getTranslatedRelationship(member.relationship)}
                                                </span>
                                                <h3 className="truncate text-lg font-bold tracking-tight text-black dark:text-white">
                                                    {member.firstName} {member.lastName}
                                                </h3>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => removeMember(member.id)}
                                            className="flex h-10 w-10 shrink-0 items-center justify-center border border-transparent text-gray-400 hover:border-red-500 hover:bg-red-50 hover:text-red-500 transition-colors"
                                            title="Eliminar Expediente"
                                        >
                                            <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                                        </button>
                                    </div>

                                    {/* Grid Blueprint Interno */}
                                    <div className="grid grid-cols-2 gap-0 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505]">
                                        <div className="border-r border-gray-200 dark:border-gray-800 p-4">
                                            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-1">Edad</p>
                                            <p className="font-semibold text-black dark:text-white tracking-tight">{age} Años</p>
                                        </div>
                                        <div className="p-4">
                                            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-1">Nacimiento</p>
                                            <p className="truncate text-sm font-semibold text-black dark:text-white tracking-tight">{member.dateOfBirth}</p>
                                        </div>
                                    </div>

                                    {/* Acciones */}
                                    <div className="p-6 md:p-8 flex flex-col gap-3 bg-gray-50/50 dark:bg-[#050505]/50 flex-1 justify-end">
                                        {age < 12 && (
                                            <Link 
                                                href={`/patient/dashboard/family/${member.id}/vaccinations`} 
                                                className="flex h-10 w-full items-center justify-start px-4 border border-black dark:border-white bg-white dark:bg-black text-[9px] font-bold uppercase tracking-widest text-black dark:text-white transition-colors hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
                                            >
                                                <Syringe className="h-3.5 w-3.5 mr-3" strokeWidth={1.5} />
                                                Esquema de Vacunación
                                            </Link>
                                        )}
                                        {age >= 65 && (
                                            <Link 
                                                href={`/patient/dashboard/family/${member.id}/eldercare`} 
                                                className="flex h-10 w-full items-center justify-start px-4 border border-black dark:border-white bg-white dark:bg-black text-[9px] font-bold uppercase tracking-widest text-black dark:text-white transition-colors hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
                                            >
                                                <HeartHandshake className="h-3.5 w-3.5 mr-3" strokeWidth={1.5} />
                                                Cuidados Geriátricos
                                            </Link>
                                        )}

                                        <Link 
                                            href="/patient/dashboard/vault" 
                                            className="flex h-10 w-full items-center justify-start px-4 border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0a0a0a] text-[9px] font-bold uppercase tracking-widest text-gray-600 dark:text-gray-300 transition-colors hover:border-black hover:text-black dark:hover:border-white dark:hover:text-white"
                                        >
                                            <FolderHeart className="h-3.5 w-3.5 mr-3" strokeWidth={1.5} />
                                            Bóveda Documental
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* --- ESTADO VACÍO (EMPTY STATE) --- */}
                {!showAddForm && family.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center py-24 border border-dashed border-gray-400 dark:border-gray-600 bg-gray-50 dark:bg-[#050505] p-8 text-center"
                    >
                        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center border border-gray-300 dark:border-gray-700 bg-white dark:bg-black">
                            <HeartPulse className="h-6 w-6 text-gray-400" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-sm font-bold uppercase tracking-widest text-black dark:text-white mb-2">
                            {t('empty_title') || 'Núcleo Familiar Vacío'}
                        </h3>
                        <p className="mx-auto mb-8 max-w-md text-xs font-light text-gray-500 leading-relaxed">
                            {t('empty_desc') || 'Integre a sus dependientes para gestionar valoraciones, recordatorios clínicos y vacunación de forma centralizada.'}
                        </p>
                        <Button
                            onClick={() => setShowAddForm(true)}
                            className="rounded-none bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 h-12 px-8 text-[10px] font-bold uppercase tracking-widest transition-colors border-0"
                        >
                            <UserPlus className="mr-3 h-4 w-4" strokeWidth={2} />
                            {t('btn_add_first') || 'Vincular Dependiente'}
                        </Button>
                    </motion.div>
                )}
            </div>
        </div>
    );
}