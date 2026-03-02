"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { Loader2, ChevronRight, ChevronLeft, Save } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Tipos y Hook (Backend)
import { ConsumerProfile } from "@/types/consumerProfile";
import { useConsumerProfile } from "@/hooks/useConsumerProfile";

// Componentes Modulares
import { ProfileSidebar, SECTIONS } from "@/components/profile/ProfileSidebar";
import { ProfilePersonalSection } from "@/components/profile/ProfilePersonalSection";
import { ProfileMedicalSection } from "@/components/profile/ProfileMedicalSection";
import { ProfilePreferencesSection } from "@/components/profile/ProfilePreferencesSection";

const fadeIn = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.3 }
};

export default function PatientProfilePage() {
    const t = useTranslations('PatientProfile');
    
    // 🚀 Conexión real con el Backend
    const { profile: dbProfile, isLoading, isSaving, fetchProfile, updateProfile } = useConsumerProfile();

    // Estado local para manejar el formulario mientras el usuario escribe
    const [form, setForm] = useState<ConsumerProfile>(dbProfile);
    const [currentSection, setCurrentSection] = useState(0);

    // Cargar datos al montar la página
    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    // Sincronizar el formulario local cuando llegan los datos del backend
    useEffect(() => {
        setForm(dbProfile);
    }, [dbProfile]);

    // Handlers para actualizar el estado local
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const toggleArrayItem = (field: 'healthGoals' | 'servicePreferences', value: string) => {
        setForm(prev => {
            const current = prev[field];
            const updated = current.includes(value)
                ? current.filter(item => item !== value)
                : [...current, value];
            return { ...prev, [field]: updated };
        });
    };

    const handleInterestChange = (activity: string, value: number[]) => {
        setForm(prev => ({
            ...prev,
            interestInActivities: {
                ...prev.interestInActivities,
                [activity]: value[0],
            },
        }));
    };

    // Handler para guardar en el backend
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = await updateProfile(form);
        if (success) {
            toast.success(t('toast_saved'));
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center gap-4 transition-colors">
                <Loader2 className="w-10 h-10 text-medical-500 animate-spin" />
                <p className="text-slate-500 dark:text-slate-400">{t('loading', { defaultValue: 'Cargando tu información...' })}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 font-sans selection:bg-medical-500/30 flex items-center justify-center transition-colors">
            <Card className="w-full max-w-5xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[600px] transition-colors">
                
                {/* Menú Lateral */}
                <ProfileSidebar currentSection={currentSection} setCurrentSection={setCurrentSection} />

                {/* Contenido del Formulario */}
                <div className="flex-1 p-6 md:p-10 relative overflow-hidden">
                    <form onSubmit={handleSubmit} className="h-full flex flex-col justify-between">
                        
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentSection}
                                variants={fadeIn}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                className="flex-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar"
                            >
                                {currentSection === 0 && (
                                    <ProfilePersonalSection form={form} handleInputChange={handleInputChange} handleSelectChange={handleSelectChange} />
                                )}
                                {currentSection === 1 && (
                                    <ProfileMedicalSection form={form} handleInputChange={handleInputChange} />
                                )}
                                {currentSection === 2 && (
                                    <ProfilePreferencesSection form={form} toggleArrayItem={toggleArrayItem} handleSelectChange={handleSelectChange} handleInterestChange={handleInterestChange} />
                                )}
                            </motion.div>
                        </AnimatePresence>

                        {/* Pie de página con botones */}
                        <div className="pt-6 mt-6 border-t border-slate-200 dark:border-slate-800 flex justify-between">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
                                disabled={currentSection === 0}
                                className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4 mr-2" /> {t('btn_prev')}
                            </Button>

                            {currentSection < SECTIONS.length - 1 ? (
                                <Button
                                    type="button"
                                    onClick={() => setCurrentSection(Math.min(SECTIONS.length - 1, currentSection + 1))}
                                    className="bg-medical-600 hover:bg-medical-700 text-white transition-colors"
                                >
                                    {t('btn_next')} <ChevronRight className="w-4 h-4 ml-2" />
                                </Button>
                            ) : (
                                <Button
                                    type="submit"
                                    disabled={isSaving}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[140px] transition-colors"
                                >
                                    {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                    {isSaving ? t('btn_saving') : t('btn_save')}
                                </Button>
                            )}
                        </div>
                    </form>
                </div>
            </Card>
        </div>
    );
}