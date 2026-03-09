"use client";

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, UserPlus, Baby, User, Trash2, Calendar, Plus, X,
    Loader2, CalendarIcon, HeartPulse, Activity
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarUI } from "@/components/ui/calendar";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFamily } from '@/hooks/useFamily';
import { DependentRequest } from '@/types/dependent';
import { QhSpinner } from '@/components/ui/QhSpinner';

export default function PatientFamilyDashboard() {
    const t = useTranslations('PatientFamilyDashboard');
    const { family, isLoading, isSubmitting, addMember, removeMember } = useFamily();
    const [showAddForm, setShowAddForm] = useState(false);

    // Estado del formulario
    const [formData, setFormData] = useState<DependentRequest>({
        firstName: '', lastName: '', dateOfBirth: '', gender: 'OTHER', relationship: 'CHILD', medicalNotes: ''
    });

    const handleAddSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await addMember(formData, () => {
            setShowAddForm(false);
            setFormData({ firstName: '', lastName: '', dateOfBirth: '', gender: 'OTHER', relationship: 'CHILD', medicalNotes: '' });
        });
    };

    // Helper para calcular edad
    const calculateAge = (dob: string) => {
        if (!dob) return 0;
        const diffMs = Date.now() - new Date(dob).getTime();
        const ageDt = new Date(diffMs);
        return Math.abs(ageDt.getUTCFullYear() - 1970);
    };

    // Helper de iconos
    const getRelationshipIcon = (rel: string) => {
        if (rel === 'CHILD') return <Baby className="w-8 h-8 text-medical-500 drop-shadow-sm" />;
        return <User className="w-8 h-8 text-medical-500 drop-shadow-sm" />;
    };

    // Helper para traducir el parentesco de forma segura
    const getTranslatedRelationship = (rel: string) => {
        switch (rel) {
            case 'CHILD': return t('rel_child') || 'Hijo/a';
            case 'PARENT': return t('rel_parent') || 'Padre/Madre';
            case 'SPOUSE': return t('rel_spouse') || 'Cónyuge';
            case 'SIBLING': return t('rel_sibling') || 'Hermano/a';
            default: return t('rel_other') || 'Otro';
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col justify-center items-center min-h-[60vh] space-y-4">
                <QhSpinner size="lg" />
                <p className="text-slate-500 dark:text-slate-400 font-medium animate-pulse">Cargando familia...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-[#09090b] font-sans pb-32 text-slate-900 dark:text-white selection:bg-medical-500/30">
            {/* Cinematic Background Elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-medical-500/5 dark:bg-medical-500/10 blur-[120px]" />
                <div className="absolute top-[40%] -left-[10%] w-[40%] h-[40%] rounded-full bg-blue-500/5 dark:bg-blue-500/10 blur-[100px]" />
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-12 relative z-10 space-y-10">

                {/* Hero Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 p-8 rounded-[2rem] shadow-sm">
                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <div className="absolute inset-0 bg-medical-500 blur-xl opacity-20 dark:opacity-40 rounded-full" />
                            <div className="relative p-4 bg-gradient-to-br from-medical-500 to-medical-600 rounded-2xl shadow-xl shadow-medical-500/30 text-white transform hover:scale-105 transition-transform duration-300">
                                <Users className="w-8 h-8 md:w-10 md:h-10" />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-2">
                                {t('title') || 'Familia'}
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 text-lg max-w-md leading-relaxed">
                                {t('subtitle') || 'Administra los perfiles médicos de tus seres queridos.'}
                            </p>
                        </div>
                    </div>

                    {!showAddForm && (
                        <Button
                            onClick={() => setShowAddForm(true)}
                            className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 rounded-full shadow-lg hover:shadow-xl transition-all h-14 px-8 font-bold text-base md:w-auto w-full group"
                        >
                            <UserPlus className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                            {t('btn_add_member') || 'Añadir Familiar'}
                        </Button>
                    )}
                </div>

                {/* Formulario para Añadir (Glassmorphism) */}
                <AnimatePresence>
                    {showAddForm && (
                        <motion.div
                            initial={{ opacity: 0, y: 20, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                            exit={{ opacity: 0, y: -20, height: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 md:p-10 shadow-2xl">
                                <button
                                    onClick={() => setShowAddForm(false)}
                                    className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 p-3 rounded-full transition-all"
                                >
                                    <X className="w-5 h-5" />
                                </button>

                                <div className="mb-8">
                                    <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 inline-block">
                                        {t('form_title') || 'Nuevo Familiar'}
                                    </h3>
                                    <p className="text-slate-500 dark:text-slate-400 mt-2">Completa los datos para tener a tu familiar registrado.</p>
                                </div>

                                <form onSubmit={handleAddSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                        {/* Nombres */}
                                        <div className="space-y-2 group">
                                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1 group-focus-within:text-medical-500 transition-colors">
                                                {t('label_first_name') || 'Nombre(s)'}
                                            </label>
                                            <Input
                                                required
                                                value={formData.firstName}
                                                onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                                                className="h-14 rounded-2xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-medical-500 text-base"
                                                placeholder="Ej. María"
                                            />
                                        </div>

                                        {/* Apellidos */}
                                        <div className="space-y-2 group">
                                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1 group-focus-within:text-medical-500 transition-colors">
                                                {t('label_last_name') || 'Apellidos'}
                                            </label>
                                            <Input
                                                required
                                                value={formData.lastName}
                                                onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                                                className="h-14 rounded-2xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-medical-500 text-base"
                                                placeholder="Ej. Pérez"
                                            />
                                        </div>

                                        {/* Fecha de Nacimiento con Calendario Mejorado */}
                                        <div className="space-y-2 group">
                                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1 group-focus-within:text-medical-500 transition-colors">
                                                {t('label_dob') || 'Fecha de nacimiento'}
                                            </label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-full h-14 justify-start text-left font-normal rounded-2xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors text-base",
                                                            !formData.dateOfBirth && "text-slate-400 dark:text-slate-500"
                                                        )}
                                                    >
                                                        <CalendarIcon className="mr-3 h-5 w-5 text-medical-500" />
                                                        {formData.dateOfBirth ? (
                                                            <span className="text-slate-900 dark:text-white font-medium">
                                                                {format(new Date(`${formData.dateOfBirth}T12:00:00`), "PPP", { locale: es })}
                                                            </span>
                                                        ) : (
                                                            <span>Selecciona una fecha</span>
                                                        )}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0 z-[100] border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl overflow-hidden" align="start">
                                                    <CalendarUI
                                                        mode="single"
                                                        selected={formData.dateOfBirth ? new Date(`${formData.dateOfBirth}T12:00:00`) : undefined}
                                                        onSelect={(date) => setFormData({ ...formData, dateOfBirth: date ? format(date, "yyyy-MM-dd") : "" })}
                                                        disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                                                        initialFocus
                                                        captionLayout="dropdown"
                                                        fromYear={1900}
                                                        toYear={new Date().getFullYear()}
                                                        className="bg-white dark:bg-slate-950 p-4"
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>

                                        {/* Relación */}
                                        <div className="space-y-2 group">
                                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1 group-focus-within:text-medical-500 transition-colors">
                                                {t('label_relationship') || 'Parentesco'}
                                            </label>
                                            <div className="relative">
                                                <select
                                                    required
                                                    value={formData.relationship}
                                                    onChange={e => setFormData({ ...formData, relationship: e.target.value })}
                                                    className="w-full h-14 px-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-base text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-medical-500 appearance-none cursor-pointer"
                                                >
                                                    <option value="CHILD">{t('rel_child') || 'Hijo/a'}</option>
                                                    <option value="PARENT">{t('rel_parent') || 'Padre/Madre'}</option>
                                                    <option value="SPOUSE">{t('rel_spouse') || 'Cónyuge'}</option>
                                                    <option value="SIBLING">{t('rel_sibling') || 'Hermano/a'}</option>
                                                    <option value="OTHER">{t('rel_other') || 'Otro'}</option>
                                                </select>
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                    ▼
                                                </div>
                                            </div>
                                        </div>

                                    </div>

                                    <div className="pt-8 flex flex-col-reverse sm:flex-row justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={() => setShowAddForm(false)}
                                            className="h-14 rounded-full px-8 text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold"
                                        >
                                            {t('btn_cancel') || 'Cancelar'}
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={isSubmitting || !formData.firstName || !formData.lastName || !formData.dateOfBirth}
                                            className="h-14 rounded-full bg-medical-500 hover:bg-medical-600 text-white font-bold px-10 shadow-lg shadow-medical-500/20 transition-all disabled:opacity-50"
                                        >
                                            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Plus className="w-5 h-5 mr-2" />}
                                            {t('btn_save') || 'Guardar Familiar'}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Grid de Familiares (Premium Cards) */}
                {!showAddForm && family.length > 0 && (
                    <motion.div
                        initial="hidden"
                        animate="show"
                        variants={{
                            hidden: { opacity: 0 },
                            show: { opacity: 1, transition: { staggerChildren: 0.1 } }
                        }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {family.map((member) => (
                            <motion.div
                                key={member.id}
                                variants={{
                                    hidden: { opacity: 0, y: 20 },
                                    show: { opacity: 1, y: 0 }
                                }}
                                className="group relative bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 hover:border-medical-200 dark:hover:border-medical-800 rounded-[2rem] p-6 shadow-sm hover:shadow-2xl hover:shadow-medical-500/5 transition-all duration-500 overflow-hidden"
                            >
                                {/* Efecto Hover Radial */}
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                                    style={{ background: `radial-gradient(circle at top right, rgba(14, 165, 233, 0.05), transparent 50%)` }}
                                />

                                <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                                    <button
                                        onClick={() => removeMember(member.id)}
                                        className="text-rose-400 hover:text-white bg-white dark:bg-slate-800 hover:bg-rose-500 p-2.5 rounded-full shadow-md transition-all border border-slate-100 dark:border-slate-700"
                                        title="Eliminar"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="relative z-10 flex flex-col items-center text-center mt-2">
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-medical-50 to-blue-50 dark:from-medical-500/10 dark:to-blue-500/10 flex items-center justify-center border-2 border-white dark:border-slate-800 shadow-md mb-4 relative group-hover:scale-110 transition-transform duration-500">
                                        <div className="absolute inset-x-0 -bottom-2 flex justify-center">
                                            <span className="bg-medical-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm uppercase tracking-wider">
                                                {getTranslatedRelationship(member.relationship)}
                                            </span>
                                        </div>
                                        {getRelationshipIcon(member.relationship)}
                                    </div>

                                    <h3 className="font-bold text-xl text-slate-900 dark:text-white leading-tight mb-1">
                                        {member.firstName} {member.lastName}
                                    </h3>

                                    <div className="flex items-center gap-2 mt-4 text-sm font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/50 px-4 py-1.5 rounded-full">
                                        <Calendar className="w-4 h-4 text-medical-500" />
                                        {calculateAge(member.dateOfBirth)} años
                                        <span className="opacity-50 mx-1">•</span>
                                        <span className="text-xs">{member.dateOfBirth}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                {/* Estado Vacío */}
                {!showAddForm && family.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-24 bg-white/40 dark:bg-white/5 backdrop-blur-xl rounded-[3rem] border border-slate-200/50 dark:border-white/10 relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-medical-500/5 pointer-events-none" />

                        <div className="relative z-10">
                            <div className="w-24 h-24 mx-auto bg-medical-50 dark:bg-medical-500/10 rounded-full flex items-center justify-center mb-6 shadow-inner">
                                <HeartPulse className="w-12 h-12 text-medical-400 dark:text-medical-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                                {t('empty_title') || 'Tu familia en un solo lugar'}
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 text-base max-w-sm mx-auto mb-8 leading-relaxed">
                                {t('empty_desc') || 'Agrega a tus hijos, padres o pareja para gestionar sus citas y seguimientos médicos fácilmente.'}
                            </p>
                            <Button
                                onClick={() => setShowAddForm(true)}
                                className="rounded-full bg-medical-500 hover:bg-medical-600 text-white font-bold h-14 px-8 shadow-lg shadow-medical-500/20 hover:scale-105 transition-all text-base"
                            >
                                <UserPlus className="w-5 h-5 mr-3" /> {t('btn_add_first') || 'Registrar primer familiar'}
                            </Button>
                        </div>
                    </motion.div>
                )}

            </div>
        </div>
    );
}