"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { Loader2, Save, ChevronLeft, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

// Tipos y Hook (Backend)
import { ConsumerProfile } from "@/types/consumerProfile";
import { useConsumerProfile } from "@/hooks/useConsumerProfile";

// Componentes Modulares Rediseñados
import { ProfileSidebar, SECTIONS } from "@/components/profile/ProfileSidebar";
import { ProfilePersonalSection } from "@/components/profile/ProfilePersonalSection";
import { ProfileMedicalSection } from "@/components/profile/ProfileMedicalSection";
import { ProfilePreferencesSection } from "@/components/profile/ProfilePreferencesSection";

export default function PatientProfilePage() {
    const t = useTranslations('PatientProfile');

    // Hook conectado al Onboarding Service
    const { profile: dbProfile, isLoading, isSaving, fetchProfile, updateProfile } = useConsumerProfile();

    const [form, setForm] = useState<ConsumerProfile>(dbProfile);
    const [currentSection, setCurrentSection] = useState(0);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    useEffect(() => {
        setForm(dbProfile);
    }, [dbProfile]);

    // --- HANDLERS ---

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setForm(prev => ({ ...prev, [name]: value }));
    };

    /**
     * 🚀 SOLUCIÓN AL ERROR 500:
     * Convierte el string del TagInput en un Array de strings para el backend
     */
    const handleTagChange = (field: keyof ConsumerProfile, valueString: string) => {
        setForm(prev => ({
            ...prev,
            [field]: valueString
                ? valueString.split(',').map(t => t.trim()).filter(Boolean)
                : []
        }));
    };

    const toggleArrayItem = (field: keyof ConsumerProfile, value: string) => {
        setForm(prev => {
            const current = (prev[field] as string[]) || [];
            const updated = current.includes(value)
                ? current.filter(item => item !== value)
                : [...current, value];
            return { ...prev, [field]: updated };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validación básica antes de enviar
        if (!form.fullName) {
            toast.warn(t('error_name_required', { defaultValue: 'El nombre es obligatorio' }));
            setCurrentSection(0);
            return;
        }

        const success = await updateProfile(form);
        if (success) {
            toast.success(t('toast_saved'));
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 transition-colors">
                <Loader2 className="w-10 h-10 text-medical-500 animate-spin" />
                <p className="text-slate-500 dark:text-slate-400 font-light">
                    {t('loading', { defaultValue: 'Sincronizando tu expediente...' })}
                </p>
            </div>
        );
    }

    const isLastSection = currentSection === SECTIONS.length - 1;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-5xl mx-auto space-y-8 py-6 px-4"
        >
            {/* 🏥 Sidebar / Header de Progreso */}
            <ProfileSidebar currentSection={currentSection} setCurrentSection={setCurrentSection} />

            {/* Contenedor Principal del Formulario */}
            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 md:p-12 shadow-sm transition-all duration-300">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentSection}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                        >
                            {/* Sección 0: Datos de Identidad y Localización */}
                            {currentSection === 0 && (
                                <ProfilePersonalSection
                                    form={form}
                                    handleInputChange={handleInputChange}
                                    handleSelectChange={handleSelectChange}
                                />
                            )}

                            {/* Sección 1: Datos Médicos con TagInput (Estructurado para IA) */}
                            {currentSection === 1 && (
                                <ProfileMedicalSection
                                    form={form}
                                    handleTagChange={handleTagChange}
                                />
                            )}

                            {/* Sección 2: Preferencias de Salud y Modalidad */}
                            {currentSection === 2 && (
                                <ProfilePreferencesSection
                                    form={form}
                                    toggleArrayItem={toggleArrayItem}
                                    handleSelectChange={handleSelectChange}
                                />
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Acciones de Navegación inferior */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 px-2">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
                        disabled={currentSection === 0 || isSaving}
                        className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-all h-14 px-8 rounded-2xl font-medium"
                    >
                        <ChevronLeft className="w-5 h-5 mr-2" /> {t('btn_prev')}
                    </Button>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        {!isLastSection ? (
                            <Button
                                type="button"
                                onClick={() => setCurrentSection(currentSection + 1)}
                                className="w-full md:w-auto bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white h-14 px-10 rounded-2xl font-bold transition-all shadow-lg shadow-slate-200 dark:shadow-none"
                            >
                                {t('btn_next')} <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                        ) : (
                            <Button
                                type="submit"
                                disabled={isSaving}
                                className="w-full md:w-auto bg-medical-600 hover:bg-medical-700 text-white h-14 px-12 rounded-2xl font-bold transition-all shadow-lg shadow-medical-500/25 min-w-[200px]"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        {t('btn_saving')}
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5 mr-2" />
                                        {t('btn_save')}
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                </div>
            </form>
        </motion.div>
    );
}