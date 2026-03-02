"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { Loader2, Save, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

// Tipos y Hook (Backend)
import { ConsumerProfile } from "@/types/consumerProfile";
import { useConsumerProfile } from "@/hooks/useConsumerProfile";

// Componentes Modulares
import { ProfileSidebar, SECTIONS } from "@/components/profile/ProfileSidebar";
import { ProfilePersonalSection } from "@/components/profile/ProfilePersonalSection";
import { ProfileMedicalSection } from "@/components/profile/ProfileMedicalSection";
import { ProfilePreferencesSection } from "@/components/profile/ProfilePreferencesSection";

export default function PatientProfilePage() {
    const t = useTranslations('PatientProfile');

    const { profile: dbProfile, isLoading, isSaving, fetchProfile, updateProfile } = useConsumerProfile();

    const [form, setForm] = useState<ConsumerProfile>(dbProfile);
    const [currentSection, setCurrentSection] = useState(0);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    useEffect(() => {
        setForm(dbProfile);
    }, [dbProfile]);

    // Handlers
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = await updateProfile(form);
        if (success) {
            toast.success(t('toast_saved'));
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-10 h-10 text-medical-500 animate-spin" />
                <p className="text-slate-500 dark:text-slate-400 font-light">
                    {t('loading', { defaultValue: 'Cargando tu información...' })}
                </p>
            </div>
        );
    }

    const isLastSection = currentSection === SECTIONS.length - 1;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto space-y-8 py-2"
        >
            {/* Header with avatar, progress, and tabs */}
            <ProfileSidebar currentSection={currentSection} setCurrentSection={setCurrentSection} />

            {/* Form Content */}
            <form onSubmit={handleSubmit}>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-10 shadow-sm transition-colors">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentSection}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
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
                </div>

                {/* Footer Actions */}
                <div className="flex justify-between items-center pt-8">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
                        disabled={currentSection === 0}
                        className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white transition-colors h-12 px-6 rounded-xl"
                    >
                        <ChevronLeft className="w-4 h-4 mr-2" /> {t('btn_prev')}
                    </Button>

                    <div className="flex items-center gap-3">
                        {!isLastSection ? (
                            <Button
                                type="button"
                                onClick={() => setCurrentSection(Math.min(SECTIONS.length - 1, currentSection + 1))}
                                className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white h-12 px-8 rounded-xl font-semibold transition-all shadow-none"
                            >
                                {t('btn_next')} <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        ) : (
                            <Button
                                type="submit"
                                disabled={isSaving}
                                className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white h-12 px-8 rounded-xl font-semibold transition-all shadow-none min-w-[160px]"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        {t('btn_saving')}
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
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