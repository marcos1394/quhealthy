"use client";

import React, { useState, useEffect } from "react";
import {
    Settings,
    Save,
    Bell,
    Moon,
    Globe,
    Loader2,
    CheckCircle2,
    Mail,
    MessageSquare,
    Gift,
    Palette
} from "lucide-react";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";

// ShadCN UI
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue
} from "@/components/ui/select";
import { motion } from "framer-motion";
import { QhSpinner } from '@/components/ui/QhSpinner';
import { handleApiError } from '@/lib/handleApiError';

interface AppPreferences {
    language: string;
    timeZone: string;
    email_alerts: boolean;
    sms_alerts: boolean;
    marketing: boolean;
    theme: string;
}

export default function PreferencesPage() {
    const t = useTranslations('SettingsPreferences');

    const [preferences, setPreferences] = useState<AppPreferences>({
        language: "es",
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        email_alerts: true,
        sms_alerts: false,
        marketing: false,
        theme: "system",
    });

    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        // Simulación de carga desde API
        const timer = setTimeout(() => {
            setLoading(false);
        }, 600);
        return () => clearTimeout(timer);
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Simulación de guardado a API
            await new Promise(resolve => setTimeout(resolve, 800));
            toast.success(t('toast_save'), {
                icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            });
        } catch (err) {
            handleApiError(err);
        } finally {
            setIsSaving(false);
        }
    };

    const updatePref = (key: keyof AppPreferences, value: any) => {
        setPreferences(prev => ({ ...prev, [key]: value }));
    };

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center min-h-[60vh] gap-4">
                <QhSpinner size="lg" />
                <p className="text-slate-500 font-medium">Cargando...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 font-sans selection:bg-medical-500/30">

            <div className="max-w-4xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-medical-50 dark:bg-medical-500/10 rounded-xl border border-medical-100 dark:border-medical-500/20 shadow-sm">
                            <Settings className="w-8 h-8 text-medical-600 dark:text-medical-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{t('title')}</h1>
                            <p className="text-slate-500 dark:text-slate-400 mt-1">{t('subtitle')}</p>
                        </div>
                    </div>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-medical-600 hover:bg-medical-700 text-white shadow-sm min-w-[140px] h-11"
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        {t('general.save')}
                    </Button>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="general" className="space-y-6">
                    <TabsList className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 w-full justify-start overflow-x-auto rounded-xl h-auto gap-1 shadow-sm">
                        <TabsTrigger value="general" className="data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900 dark:data-[state=active]:bg-slate-800 dark:data-[state=active]:text-white text-slate-500 py-2.5 px-4 rounded-lg transition-all font-medium">
                            <Globe className="w-4 h-4 mr-2" /> {t('tabs.general')}
                        </TabsTrigger>
                        <TabsTrigger value="notifications" className="data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900 dark:data-[state=active]:bg-slate-800 dark:data-[state=active]:text-white text-slate-500 py-2.5 px-4 rounded-lg transition-all font-medium">
                            <Bell className="w-4 h-4 mr-2" /> {t('tabs.notifications')}
                        </TabsTrigger>
                        <TabsTrigger value="appearance" className="data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900 dark:data-[state=active]:bg-slate-800 dark:data-[state=active]:text-white text-slate-500 py-2.5 px-4 rounded-lg transition-all font-medium">
                            <Moon className="w-4 h-4 mr-2" /> {t('tabs.appearance')}
                        </TabsTrigger>
                    </TabsList>

                    <div className="min-h-[400px]">

                        {/* GENERAL TAB */}
                        <TabsContent value="general" className="mt-0 focus-visible:outline-none">
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                                <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
                                    <CardHeader>
                                        <CardTitle className="text-slate-900 dark:text-white text-lg">{t('general.title')}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">

                                        <div className="space-y-3">
                                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                {t('general.language')}
                                            </label>
                                            <Select
                                                value={preferences.language}
                                                onValueChange={(val) => updatePref('language', val)}
                                            >
                                                <SelectTrigger className="w-full md:w-[400px] h-12 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                                                    <SelectItem value="es">🇪🇸 Español</SelectItem>
                                                    <SelectItem value="en">🇺🇸 English</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-3 border-t border-slate-100 dark:border-slate-800 pt-6">
                                            <div>
                                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                    {t('general.timezone')}
                                                </label>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                    {t('general.timezone_desc')}
                                                </p>
                                            </div>
                                            <Select
                                                value={preferences.timeZone}
                                                onValueChange={(val) => updatePref('timeZone', val)}
                                            >
                                                <SelectTrigger className="w-full md:w-[400px] h-12 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 max-h-60">
                                                    <SelectItem value="America/Mexico_City">America/Mexico_City</SelectItem>
                                                    <SelectItem value="America/New_York">America/New_York</SelectItem>
                                                    <SelectItem value="America/Los_Angeles">America/Los_Angeles</SelectItem>
                                                    <SelectItem value="America/Bogota">America/Bogota</SelectItem>
                                                    <SelectItem value="Europe/Madrid">Europe/Madrid</SelectItem>
                                                    <SelectItem value={preferences.timeZone}>{preferences.timeZone}</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                    </CardContent>
                                </Card>
                            </motion.div>
                        </TabsContent>

                        {/* NOTIFICATIONS TAB */}
                        <TabsContent value="notifications" className="mt-0 focus-visible:outline-none">
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                                <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
                                    <CardHeader>
                                        <CardTitle className="text-slate-900 dark:text-white text-lg">{t('notifications.title')}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-1">

                                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-100 dark:border-slate-800/50 hover:border-slate-200 dark:hover:border-slate-800 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 shrink-0 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                                    <Mail className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-900 dark:text-white">{t('notifications.email_alerts')}</p>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400">{t('notifications.email_alerts_desc')}</p>
                                                </div>
                                            </div>
                                            <Switch
                                                checked={preferences.email_alerts}
                                                onCheckedChange={(val) => updatePref('email_alerts', val)}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-100 dark:border-slate-800/50 hover:border-slate-200 dark:hover:border-slate-800 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 shrink-0 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                                    <MessageSquare className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-900 dark:text-white">{t('notifications.sms_alerts')}</p>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400">{t('notifications.sms_alerts_desc')}</p>
                                                </div>
                                            </div>
                                            <Switch
                                                checked={preferences.sms_alerts}
                                                onCheckedChange={(val) => updatePref('sms_alerts', val)}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-100 dark:border-slate-800/50 hover:border-slate-200 dark:hover:border-slate-800 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 shrink-0 rounded-full bg-medical-50 dark:bg-medical-500/10 flex items-center justify-center text-medical-600 dark:text-medical-400">
                                                    <Gift className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-900 dark:text-white">{t('notifications.marketing')}</p>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400">{t('notifications.marketing_desc')}</p>
                                                </div>
                                            </div>
                                            <Switch
                                                checked={preferences.marketing}
                                                onCheckedChange={(val) => updatePref('marketing', val)}
                                            />
                                        </div>

                                    </CardContent>
                                </Card>
                            </motion.div>
                        </TabsContent>

                        {/* APPEARANCE TAB */}
                        <TabsContent value="appearance" className="mt-0 focus-visible:outline-none">
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                                <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
                                    <CardHeader>
                                        <CardTitle className="text-slate-900 dark:text-white text-lg">{t('appearance.title')}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">

                                        <div className="space-y-3">
                                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                {t('appearance.theme')}
                                            </label>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                {[
                                                    { id: "light", label: t('appearance.light'), icon: Moon },
                                                    { id: "dark", label: t('appearance.dark'), icon: Moon },
                                                    { id: "system", label: t('appearance.system'), icon: Settings }
                                                ].map((themeOpt) => {
                                                    const isSelected = preferences.theme === themeOpt.id;
                                                    return (
                                                        <button
                                                            key={themeOpt.id}
                                                            onClick={() => updatePref('theme', themeOpt.id)}
                                                            className={`relative flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all ${isSelected
                                                                    ? "bg-medical-50 border-medical-500 text-medical-700 dark:bg-medical-500/10 dark:text-medical-400 dark:border-medical-500"
                                                                    : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:bg-slate-900"
                                                                }`}
                                                        >
                                                            {isSelected && (
                                                                <div className="absolute top-3 right-3 bg-medical-500 rounded-full p-0.5">
                                                                    <CheckCircle2 className="w-4 h-4 text-white" />
                                                                </div>
                                                            )}
                                                            <themeOpt.icon className={`w-8 h-8 mb-3 ${isSelected ? "text-medical-500" : "text-slate-400"}`} />
                                                            <span className="font-semibold">{themeOpt.label}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                    </CardContent>
                                </Card>
                            </motion.div>
                        </TabsContent>

                    </div>
                </Tabs>

            </div>
        </div>
    );
}