"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
    Shield,
    Globe,
    Trash2,
    Plus,
    AlertCircle,
    Loader2,
    Smartphone
} from "lucide-react";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";

// ShadCN UI
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Tipos
interface Connection {
    id: string;
    provider: "google" | "facebook" | "instagram" | "apple" | "linkedin";
    email: string;
    connectedAt: string;
    status: "active" | "expired";
}

// Datos Mock (Fallback)
const mockConnections: Connection[] = [
    {
        id: "conn-1",
        provider: "google",
        email: "dr.marcos@gmail.com",
        connectedAt: "10 Ene, 2025",
        status: "active"
    }
];

export default function ConnectionsPage() {
    const t = useTranslations('SettingsConnections');
    const [connections, setConnections] = useState<Connection[]>(mockConnections);
    const [connecting, setConnecting] = useState<string | null>(null);

    const handleConnect = (provider: string) => {
        setConnecting(provider);
        setTimeout(() => {
            setConnecting(null);
            toast.info("Redirigiendo al proveedor de identidad...");
        }, 1500);
    };

    const handleDisconnect = (id: string) => {
        setConnections(prev => prev.filter(c => c.id !== id));
        toast.success("Cuenta desconectada exitosamente");
    };

    const getProviderIcon = (provider: string) => {
        switch (provider) {
            case "google": return <span className="font-bold text-slate-700 dark:text-white">G</span>;
            case "facebook": return <span className="font-bold text-blue-600">f</span>;
            case "instagram": return <span className="font-bold text-pink-500">ig</span>;
            case "linkedin": return <span className="font-bold text-blue-500">in</span>;
            case "apple": return <span className="font-bold text-slate-900 dark:text-white">A</span>;
            default: return <Globe className="w-5 h-5 text-slate-400" />;
        }
    };

    const providersList: ("google" | "facebook" | "instagram" | "linkedin" | "apple")[] = ["google", "facebook", "instagram", "linkedin", "apple"];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 font-sans selection:bg-medical-500/30">
            <div className="max-w-4xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-center space-x-4 mb-8">
                    <div className="p-3 bg-medical-50 dark:bg-medical-500/10 rounded-xl border border-medical-100 dark:border-medical-500/20 shadow-sm">
                        <Shield className="w-8 h-8 text-medical-600 dark:text-medical-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{t('title')}</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">{t('subtitle')}</p>
                    </div>
                </div>

                <div className="grid gap-6">

                    {/* Cuentas Activas */}
                    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-slate-900 dark:text-white text-lg">{t('social.title')}</CardTitle>
                            <CardDescription className="text-slate-500 dark:text-slate-400">{t('social.desc')}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {connections.length > 0 ? (
                                connections.map((conn) => (
                                    <motion.div
                                        key={conn.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl group hover:border-slate-300 dark:hover:border-slate-700 transition-all gap-4"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 shrink-0 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-sm">
                                                {getProviderIcon(conn.provider)}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-semibold text-slate-900 dark:text-white capitalize">{t(`social.${conn.provider}`)}</h4>
                                                    {conn.status === 'active' ? (
                                                        <Badge className="bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 text-[10px] h-5 px-1.5 font-medium">Activo</Badge>
                                                    ) : (
                                                        <Badge className="bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20 text-[10px] h-5 px-1.5 font-medium flex gap-1">
                                                            <AlertCircle className="w-3 h-3" /> Reconectar
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">{conn.email}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 self-end sm:self-auto">
                                            <span className="text-xs text-slate-400 dark:text-slate-500 hidden md:block">Conectado el {conn.connectedAt}</span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDisconnect(conn.id)}
                                                className="text-slate-500 hover:text-red-600 hover:bg-red-50 dark:text-slate-400 dark:hover:text-red-400 dark:hover:bg-red-900/20"
                                            >
                                                <Trash2 className="w-4 h-4 mr-1.5 md:mr-0" />
                                                <span className="md:hidden">{t('social.disconnect')}</span>
                                            </Button>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-slate-500 dark:text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/50">
                                    {t('social.desc')}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Añadir Nuevas Conexiones */}
                    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-slate-900 dark:text-white text-lg">Añadir otra cuenta</CardTitle>
                            <CardDescription className="text-slate-500 dark:text-slate-400">Vincula servicios adicionales para facilitar tu acceso.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {providersList.map((provider) => {
                                    const isConnected = connections.some(c => c.provider === provider);
                                    if (isConnected) return null;

                                    return (
                                        <Button
                                            key={provider}
                                            variant="outline"
                                            className="h-auto py-4 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 justify-start gap-3 transition-colors"
                                            onClick={() => handleConnect(provider)}
                                            disabled={!!connecting}
                                        >
                                            {connecting === provider ? (
                                                <Loader2 className="w-5 h-5 animate-spin text-medical-500" />
                                            ) : (
                                                <div className="h-8 w-8 shrink-0 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-sm">
                                                    <Plus className="w-4 h-4 text-slate-400" />
                                                </div>
                                            )}
                                            <div className="text-left overflow-hidden">
                                                <p className="font-semibold text-sm truncate">{t(`social.${provider}`)}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-500 truncate" title={t(`social.${provider}_desc`)}>{t(`social.${provider}_desc`)}</p>
                                            </div>
                                        </Button>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Dispositivos Conectados */}
                    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-slate-900 dark:text-white text-lg">{t('devices.title')}</CardTitle>
                            <CardDescription className="text-slate-500 dark:text-slate-400">{t('devices.desc')}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-medical-50 dark:bg-medical-900/10 border border-medical-100 dark:border-medical-500/20 rounded-xl gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 shrink-0 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center border border-medical-200 dark:border-medical-500/30 shadow-sm text-medical-600 dark:text-medical-400">
                                        <Smartphone className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-semibold text-slate-900 dark:text-white">MacBook Pro - Chrome</h4>
                                            <Badge className="bg-medical-100 text-medical-700 border-medical-200 dark:bg-medical-500/20 dark:text-medical-300 dark:border-medical-500/30 text-[10px] h-5 px-1.5 font-medium">{t('devices.current')}</Badge>
                                        </div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Ciudad de México, MX • Activo ahora</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-2">
                                <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-900/30 dark:hover:bg-red-900/20">
                                    {t('devices.revoke_all')}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                </div>
            </div>
        </div>
    );
}