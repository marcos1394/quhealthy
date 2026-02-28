/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import {
    User, Calendar, Phone, MapPin, HeartPulse,
    Activity, Clock, AlertCircle, Pill, Target, Sparkles, Loader2,
    ChevronRight, ChevronLeft, Save
} from "lucide-react";

// ShadCN UI
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Types
interface PatientProfileForm {
    fullName: string;
    birthDate: string;
    gender: string;
    phoneNumber: string;
    address: string;
    medicalHistory: string;
    allergies: string;
    currentMedications: string;
    healthGoals: string[];
    servicePreferences: string[];
    preferredSchedule: string;
    interestInActivities: Record<string, number>;
}

const GOALS_OPTIONS = ["Bajar de peso", "Mejorar piel", "Reducir estrés", "Aumentar energía", "Rehabilitación física"];
const SERVICES_OPTIONS = ["Masajes", "Faciales", "Nutrición", "Dermatología", "Odontología"];

const fadeIn = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.3 }
};

export default function PatientProfilePage() {
    const t = useTranslations('PatientProfile');

    const SECTIONS = [
        { id: 0, title: t('section_personal'), icon: User, description: t('section_personal_desc') },
        { id: 1, title: t('section_medical'), icon: HeartPulse, description: t('section_medical_desc') },
        { id: 2, title: t('section_preferences'), icon: Sparkles, description: t('section_preferences_desc') },
    ];

    const [form, setForm] = useState<PatientProfileForm>({
        fullName: "", birthDate: "", gender: "", phoneNumber: "", address: "",
        medicalHistory: "", allergies: "", currentMedications: "",
        healthGoals: [], servicePreferences: [], preferredSchedule: "",
        interestInActivities: { ejercicio: 5, dieta: 5, skincare: 5 },
    });

    const [currentSection, setCurrentSection] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setForm((prev) => ({ ...prev, [name]: value }));
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
        setForm((prev) => ({
            ...prev,
            interestInActivities: {
                ...prev.interestInActivities,
                [activity]: value[0],
            },
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            toast.success(t('toast_saved'));
        } catch (error) {
            console.error(error);
            toast.error(t('toast_error'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 font-sans selection:bg-medical-500/30 flex items-center justify-center">

            <Card className="w-full max-w-5xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[600px]">

                {/* Sidebar */}
                <div className="w-full md:w-1/3 bg-slate-50 dark:bg-slate-800/50 p-6 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2.5 bg-medical-50 dark:bg-medical-500/10 rounded-xl border border-medical-100 dark:border-medical-500/20">
                                <User className="w-6 h-6 text-medical-600 dark:text-medical-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t('title')}</h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{t('subtitle')}</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            {SECTIONS.map((section) => (
                                <button
                                    key={section.id}
                                    onClick={() => setCurrentSection(section.id)}
                                    className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all text-left group ${currentSection === section.id
                                            ? "bg-medical-50 dark:bg-medical-500/10 border border-medical-200 dark:border-medical-500/30"
                                            : "hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent"
                                        }`}
                                >
                                    <div className={`p-2 rounded-lg ${currentSection === section.id ? "bg-medical-500 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-white"
                                        }`}>
                                        <section.icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className={`font-medium ${currentSection === section.id ? "text-medical-600 dark:text-medical-400" : "text-slate-700 dark:text-slate-300"}`}>
                                            {section.title}
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 hidden md:block">{section.description}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Progress */}
                    <div className="mt-8 hidden md:block">
                        <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
                            <span>Progreso</span>
                            <span>{Math.round(((currentSection + 1) / SECTIONS.length) * 100)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-medical-500 transition-all duration-500 ease-out"
                                style={{ width: `${((currentSection + 1) / SECTIONS.length) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Form Content */}
                <div className="flex-1 p-6 md:p-10 relative overflow-hidden">
                    <form onSubmit={handleSubmit} className="h-full flex flex-col justify-between">

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentSection}
                                variants={fadeIn}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                className="flex-1 space-y-6 overflow-y-auto pr-2"
                            >
                                {/* Personal */}
                                {currentSection === 0 && (
                                    <div className="space-y-5">
                                        <h3 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                            <User className="w-5 h-5 text-medical-500" /> {t('section_personal')}
                                        </h3>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('label_name')}</label>
                                                <Input name="fullName" value={form.fullName} onChange={handleInputChange} placeholder="Ej. Juan Pérez" className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700" />
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('label_birth')}</label>
                                                    <Input type="date" name="birthDate" value={form.birthDate} onChange={handleInputChange} className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('label_gender')}</label>
                                                    <Select value={form.gender} onValueChange={(val) => handleSelectChange('gender', val)}>
                                                        <SelectTrigger className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"><SelectValue placeholder="—" /></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="male">{t('gender_male')}</SelectItem>
                                                            <SelectItem value="female">{t('gender_female')}</SelectItem>
                                                            <SelectItem value="other">{t('gender_other')}</SelectItem>
                                                            <SelectItem value="none">{t('gender_none')}</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('label_phone')}</label>
                                                    <Input type="tel" name="phoneNumber" value={form.phoneNumber} onChange={handleInputChange} placeholder="+52..." className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('label_address')}</label>
                                                    <Input name="address" value={form.address} onChange={handleInputChange} placeholder="Ciudad, Estado" className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Medical */}
                                {currentSection === 1 && (
                                    <div className="space-y-5">
                                        <h3 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                            <HeartPulse className="w-5 h-5 text-rose-500" /> {t('section_medical')}
                                        </h3>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('label_medical_history')}</label>
                                                <Textarea name="medicalHistory" value={form.medicalHistory} onChange={handleInputChange} placeholder="Diabetes, Hipertensión..." className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 min-h-[100px]" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2"><AlertCircle className="w-4 h-4 text-amber-500" /> {t('label_allergies')}</label>
                                                <Textarea name="allergies" value={form.allergies} onChange={handleInputChange} placeholder="Penicilina, Nueces..." className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2"><Pill className="w-4 h-4 text-blue-500" /> {t('label_medications')}</label>
                                                <Textarea name="currentMedications" value={form.currentMedications} onChange={handleInputChange} placeholder="Nombre, dosis..." className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700" />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Preferences */}
                                {currentSection === 2 && (
                                    <div className="space-y-6">
                                        <h3 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                            <Sparkles className="w-5 h-5 text-amber-500" /> {t('section_preferences')}
                                        </h3>
                                        <div className="space-y-3">
                                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2"><Target className="w-4 h-4" /> {t('label_health_goals')}</label>
                                            <div className="flex flex-wrap gap-2">
                                                {GOALS_OPTIONS.map(goal => (
                                                    <Badge
                                                        key={goal}
                                                        variant="outline"
                                                        className={`cursor-pointer px-3 py-1.5 transition-all ${form.healthGoals.includes(goal)
                                                                ? 'bg-medical-50 dark:bg-medical-500/20 text-medical-700 dark:text-medical-300 border-medical-200 dark:border-medical-500/50'
                                                                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                                                            }`}
                                                        onClick={() => toggleArrayItem('healthGoals', goal)}
                                                    >
                                                        {goal}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2"><Clock className="w-4 h-4" /> {t('label_schedule')}</label>
                                            <Select value={form.preferredSchedule} onValueChange={(val) => handleSelectChange('preferredSchedule', val)}>
                                                <SelectTrigger className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"><SelectValue placeholder="—" /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="morning">Mañana (8am - 12pm)</SelectItem>
                                                    <SelectItem value="afternoon">Tarde (12pm - 5pm)</SelectItem>
                                                    <SelectItem value="evening">Noche (5pm - 9pm)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2"><Activity className="w-4 h-4" /> Nivel de Interés (1-10)</label>
                                            {Object.entries(form.interestInActivities).map(([activity, value]) => (
                                                <div key={activity} className="space-y-2">
                                                    <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                                                        <span className="capitalize">{activity}</span>
                                                        <span className="text-slate-900 dark:text-white font-bold">{value}</span>
                                                    </div>
                                                    <Slider
                                                        defaultValue={[value]}
                                                        max={10}
                                                        step={1}
                                                        onValueChange={(val) => handleInterestChange(activity, val)}
                                                        className="py-2"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>

                        {/* Footer */}
                        <div className="pt-6 mt-6 border-t border-slate-200 dark:border-slate-800 flex justify-between">
                            <Button
                                variant="ghost"
                                onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
                                disabled={currentSection === 0}
                                className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
                            >
                                <ChevronLeft className="w-4 h-4 mr-2" /> {t('btn_prev')}
                            </Button>

                            {currentSection < SECTIONS.length - 1 ? (
                                <Button
                                    onClick={() => setCurrentSection(Math.min(SECTIONS.length - 1, currentSection + 1))}
                                    className="bg-medical-600 hover:bg-medical-700 text-white"
                                >
                                    {t('btn_next')} <ChevronRight className="w-4 h-4 ml-2" />
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[140px]"
                                >
                                    {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                    {isSubmitting ? t('btn_saving') : t('btn_save')}
                                </Button>
                            )}
                        </div>
                    </form>
                </div>
            </Card>
        </div>
    );
}