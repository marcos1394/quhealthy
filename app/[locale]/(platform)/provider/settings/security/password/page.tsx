"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Lock, CheckCircle2, AlertTriangle, Save, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";

// ShadCN UI
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function PasswordRulesPage() {
    const t = useTranslations('SettingsPassword');

    const [minLength, setMinLength] = useState(12);
    const [requireSpecial, setRequireSpecial] = useState(true);
    const [requireUppercase, setRequireUppercase] = useState(true);
    const [requireNumbers, setRequireNumbers] = useState(true);
    const [loading, setLoading] = useState(false);

    // Calcular nivel de seguridad visualmente
    const calculateStrength = () => {
        let score = 0;
        if (minLength >= 10) score++;
        if (minLength >= 12) score++;
        if (requireSpecial) score++;
        if (requireUppercase) score++;
        if (requireNumbers) score++;

        if (score >= 4) return { label: t('security.strong'), color: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20" };
        if (score >= 2) return { label: t('security.medium'), color: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20" };
        return { label: t('security.weak'), color: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20" };
    };

    const strength = calculateStrength();

    const handleSave = async () => {
        setLoading(true);

        // Simular llamada API
        // await axios.put('/api/settings/security/password-policy', { ... });

        setTimeout(() => {
            setLoading(false);
            toast.success(t('toast_success'), {
                icon: <CheckCircle2 className="text-emerald-500" />
            });
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 font-sans selection:bg-medical-500/30">
            <div className="max-w-2xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-center space-x-4 mb-4">
                    <div className="p-3 bg-medical-50 dark:bg-medical-500/10 rounded-xl border border-medical-100 dark:border-medical-500/20 shadow-sm">
                        <Lock className="w-8 h-8 text-medical-600 dark:text-medical-400" />
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
                    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
                        <CardHeader className="pb-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-slate-900 dark:text-white text-lg">{t('card_title')}</CardTitle>
                                    <CardDescription className="text-slate-500 dark:text-slate-400 mt-1">
                                        {t('card_desc')}
                                    </CardDescription>
                                </div>
                                <Badge variant="outline" className={`${strength.color} px-3 py-1 text-xs uppercase tracking-wider font-semibold border`}>
                                    {strength.label}
                                </Badge>
                            </div>
                        </CardHeader>

                        <Separator className="bg-slate-100 dark:bg-slate-800" />

                        <CardContent className="space-y-6 pt-6">

                            {/* Longitud Mínima */}
                            <div className="space-y-3">
                                <Label className="text-slate-700 dark:text-slate-300 font-semibold">{t('min_length.title')}</Label>
                                <div className="flex items-center gap-4">
                                    <Input
                                        type="number"
                                        min={6}
                                        max={32}
                                        value={minLength}
                                        onChange={(e) => setMinLength(Number(e.target.value))}
                                        className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white w-24 text-center text-lg font-bold focus-visible:ring-medical-500 focus-visible:border-medical-500"
                                    />
                                    <div className="flex-1">
                                        <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700/50">
                                            <div
                                                className={`h-full transition-all duration-500 ${minLength < 8 ? "bg-rose-500" : minLength < 12 ? "bg-amber-500" : "bg-emerald-500"
                                                    }`}
                                                style={{ width: `${Math.min((minLength / 16) * 100, 100)}%` }}
                                            />
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{t('min_length.recommendation')}</p>
                                    </div>
                                </div>
                            </div>

                            <Separator className="bg-slate-100 dark:bg-slate-800" />

                            {/* Switches de Complejidad */}
                            <div className="space-y-5">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label className="text-base font-semibold text-slate-900 dark:text-slate-200">{t('uppercase.title')}</Label>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">{t('uppercase.desc')}</p>
                                    </div>
                                    <Switch
                                        checked={requireUppercase}
                                        onCheckedChange={setRequireUppercase}
                                        className="data-[state=checked]:bg-medical-600"
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label className="text-base font-semibold text-slate-900 dark:text-slate-200">{t('numbers.title')}</Label>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">{t('numbers.desc')}</p>
                                    </div>
                                    <Switch
                                        checked={requireNumbers}
                                        onCheckedChange={setRequireNumbers}
                                        className="data-[state=checked]:bg-medical-600"
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label className="text-base font-semibold text-slate-900 dark:text-slate-200">{t('special.title')}</Label>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">{t('special.desc')}</p>
                                    </div>
                                    <Switch
                                        checked={requireSpecial}
                                        onCheckedChange={setRequireSpecial}
                                        className="data-[state=checked]:bg-medical-600"
                                    />
                                </div>
                            </div>

                            {/* Advertencia */}
                            {(!requireSpecial || !requireNumbers || minLength < 8) && (
                                <Alert className="bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 text-amber-800 dark:text-amber-300 mt-4 rounded-xl">
                                    <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                    <AlertDescription className="font-medium mt-1">
                                        {t('warning')}
                                    </AlertDescription>
                                </Alert>
                            )}

                        </CardContent>

                        <CardFooter className="border-t border-slate-100 dark:border-slate-800 pt-6 flex justify-end">
                            <Button
                                onClick={handleSave}
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