// Ubicación: src/app/[locale]/(platform)/provider/settings/security/password/page.tsx
"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Lock, CheckCircle2, AlertTriangle, Save, Loader2, KeyRound } from "lucide-react";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";

// ShadCN UI
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";

// 🚀 FIX FC-001: Importamos el servicio real
import { securityService } from "@/services/security.service";

export default function PasswordUpdatePage() {
    // Si no tienes este archivo de traducciones, puedes usar strings fijos por ahora.
    const t = useTranslations('SettingsPassword'); 

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // 🚀 Mantenemos tu lógica de "Medidor de Fuerza", pero ahora evalúa el string real
    const calculateStrength = (password: string) => {
        if (!password) return { score: 0, label: 'Ninguna', color: "bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700" };
        
        let score = 0;
        if (password.length >= 8) score++;
        if (password.length >= 12) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;

        if (score >= 4) return { score, label: t('security.strong') || 'Fuerte', color: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20" };
        if (score >= 2) return { score, label: t('security.medium') || 'Media', color: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20" };
        return { score, label: t('security.weak') || 'Débil', color: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20" };
    };

    const strength = calculateStrength(formData.newPassword);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault(); // Evitamos recarga de la página

        if (formData.newPassword !== formData.confirmPassword) {
            toast.error(t('error_mismatch') || 'Las contraseñas no coinciden', { icon: <AlertTriangle className="text-rose-500" />});
            return;
        }

        if (strength.score < 2) {
            toast.warn('La contraseña es muy débil. Añade números o símbolos.');
            return;
        }

        setLoading(true);
        try {
            // 🚀 Llamada real al backend
            await securityService.changePassword({
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword
            });
            
            toast.success(t('toast_success') || 'Contraseña actualizada con éxito', {
                icon: <CheckCircle2 className="text-emerald-500" />
            });
            setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });

        } catch (error: any) {
            // Manejo Graceful Degradation (Por si el endpoint no está listo)
            if (error.response?.status === 404) {
                toast.info('Feature en desarrollo (Backend pendiente)');
            } else {
                toast.error(error.response?.data?.message || 'Error al actualizar contraseña');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 font-sans selection:bg-medical-500/30">
            <div className="max-w-2xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-center space-x-4 mb-4">
                    <div className="p-3 bg-medical-50 dark:bg-medical-500/10 rounded-xl border border-medical-100 dark:border-medical-500/20 shadow-sm">
                        <KeyRound className="w-8 h-8 text-medical-600 dark:text-medical-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{t('title') || 'Cambio de Contraseña'}</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">{t('subtitle') || 'Protege tu cuenta actualizando tus credenciales.'}</p>
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <form onSubmit={handleSave}>
                        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
                            <CardHeader className="pb-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-slate-900 dark:text-white text-lg">Tus Credenciales</CardTitle>
                                        <CardDescription className="text-slate-500 dark:text-slate-400 mt-1">
                                            Ingresa tu contraseña actual y la nueva que deseas utilizar.
                                        </CardDescription>
                                    </div>
                                    <Badge variant="outline" className={`${strength.color} px-3 py-1 text-xs uppercase tracking-wider font-semibold border`}>
                                        {strength.label}
                                    </Badge>
                                </div>
                            </CardHeader>

                            <Separator className="bg-slate-100 dark:bg-slate-800" />

                            <CardContent className="space-y-6 pt-6">

                                {/* Password Form Fields */}
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-slate-700 dark:text-slate-300 font-semibold">Contraseña Actual</Label>
                                        <Input
                                            type="password"
                                            required
                                            value={formData.currentPassword}
                                            onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                                            className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-medical-500 h-11"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="text-slate-700 dark:text-slate-300 font-semibold">Nueva Contraseña</Label>
                                        <Input
                                            type="password"
                                            required
                                            value={formData.newPassword}
                                            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                            className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-medical-500 h-11"
                                        />
                                        
                                        {/* Barra de progreso visual */}
                                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-2">
                                            <div
                                                className={`h-full transition-all duration-500 ${strength.score < 2 ? "bg-rose-500" : strength.score < 4 ? "bg-amber-500" : "bg-emerald-500"}`}
                                                style={{ width: `${(strength.score / 5) * 100}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="text-slate-700 dark:text-slate-300 font-semibold">Confirmar Contraseña</Label>
                                        <Input
                                            type="password"
                                            required
                                            value={formData.confirmPassword}
                                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                            className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-medical-500 h-11"
                                        />
                                    </div>
                                </div>

                                {/* Advertencia */}
                                {formData.newPassword && formData.newPassword !== formData.confirmPassword && (
                                    <Alert className="bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 text-amber-800 dark:text-amber-300 mt-4 rounded-xl">
                                        <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                        <AlertDescription className="font-medium mt-1">
                                            Las contraseñas no coinciden.
                                        </AlertDescription>
                                    </Alert>
                                )}

                            </CardContent>

                            <CardFooter className="border-t border-slate-100 dark:border-slate-800 pt-6 flex justify-end">
                                <Button
                                    type="submit"
                                    disabled={loading || !formData.currentPassword || !formData.newPassword || formData.newPassword !== formData.confirmPassword}
                                    className="bg-medical-600 hover:bg-medical-700 text-white min-w-[140px] h-11"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" /> Actualizar
                                        </>
                                    )}
                                </Button>
                            </CardFooter>
                        </Card>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}