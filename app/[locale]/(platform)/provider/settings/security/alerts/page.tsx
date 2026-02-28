"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Mail, Smartphone, Save, Loader2, Info } from "lucide-react";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";

// ShadCN UI
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function LoginAlertsPage() {
    const t = useTranslations('SettingsAlerts');

    const [enabled, setEnabled] = useState(true);
    const [emailEnabled, setEmailEnabled] = useState(true);
    const [smsEnabled, setSmsEnabled] = useState(false);
    const [notificationTime, setNotificationTime] = useState("always");
    const [loading, setLoading] = useState(false);

    const handleSaveSettings = async () => {
        setLoading(true);

        // Simulación API
        // await axios.put('/api/settings/notifications', { ... });

        setTimeout(() => {
            setLoading(false);
            toast.success(t('toast_success'));
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 font-sans selection:bg-medical-500/30">
            <div className="max-w-2xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-center space-x-4 mb-4">
                    <div className="p-3 bg-medical-50 dark:bg-medical-500/10 rounded-xl border border-medical-100 dark:border-medical-500/20 shadow-sm">
                        <Bell className="w-8 h-8 text-medical-600 dark:text-medical-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{t('title')}</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">{t('subtitle')}</p>
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <CardTitle className="text-slate-900 dark:text-white text-lg">{t('status.title')}</CardTitle>
                                    <CardDescription className="text-slate-500 dark:text-slate-400">
                                        {t('status.desc')}
                                    </CardDescription>
                                </div>
                                <Switch
                                    checked={enabled}
                                    onCheckedChange={setEnabled}
                                    className="data-[state=checked]:bg-medical-600"
                                />
                            </div>
                        </CardHeader>

                        <Separator className="bg-slate-100 dark:bg-slate-800" />

                        <AnimatePresence>
                            {enabled && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden"
                                >
                                    <CardContent className="space-y-6 pt-6">

                                        {/* Canales */}
                                        <div className="space-y-4">
                                            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-200 uppercase tracking-wider">{t('channels.title')}</h3>

                                            <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 shadow-sm">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-100 dark:border-slate-800">
                                                        <Mail className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{t('channels.email')}</p>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400">{t('channels.email_desc')}</p>
                                                    </div>
                                                </div>
                                                <Switch checked={emailEnabled} onCheckedChange={setEmailEnabled} className="data-[state=checked]:bg-medical-600" />
                                            </div>

                                            <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 shadow-sm">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-100 dark:border-slate-800">
                                                        <Smartphone className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{t('channels.sms')}</p>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400">{t('channels.sms_desc')}</p>
                                                    </div>
                                                </div>
                                                <Switch checked={smsEnabled} onCheckedChange={setSmsEnabled} className="data-[state=checked]:bg-medical-600" />
                                            </div>
                                        </div>

                                        {/* Frecuencia / Horario */}
                                        <div className="space-y-3">
                                            <Label className="text-slate-700 dark:text-slate-300 font-semibold">{t('frequency.title')}</Label>
                                            <Select value={notificationTime} onValueChange={setNotificationTime}>
                                                <SelectTrigger className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:ring-medical-500 focus:border-medical-500 h-11">
                                                    <SelectValue placeholder={t('frequency.placeholder')} />
                                                </SelectTrigger>
                                                <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                                                    <SelectItem value="always">{t('frequency.always')}</SelectItem>
                                                    <SelectItem value="suspicious">{t('frequency.suspicious')}</SelectItem>
                                                    <SelectItem value="new_device">{t('frequency.new_device')}</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 p-4 rounded-xl flex gap-3">
                                            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                                            <p className="text-sm text-blue-800 dark:text-blue-200/90 leading-relaxed font-medium">
                                                {t('info')}
                                            </p>
                                        </div>

                                    </CardContent>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <CardFooter className="border-t border-slate-100 dark:border-slate-800 pt-6 flex justify-end">
                            <Button
                                onClick={handleSaveSettings}
                                disabled={loading}
                                className="bg-medical-600 hover:bg-medical-700 text-white min-w-[140px] h-11"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('saving')}
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" /> {t('save')}
                                    </>
                                )}
                            </Button>
                        </CardFooter>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}