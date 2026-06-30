"use client"
/* eslint-disable react-doctor/prefer-module-scope-static-value */
/* eslint-disable react-doctor/no-gray-on-colored-background */
/* eslint-disable react-doctor/prefer-module-scope-pure-function */;

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

export function ProviderConnectionsSettings() {
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
        <div className="min-h-screen bg-transparent p-4 md:p-8 font-sans">
            <div className="max-w-4xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4 mb-8">
                    <div className="p-3 bg-black dark:bg-white rounded-none border border-black dark:border-white w-fit">
                        <Shield className="w-8 h-8 text-white dark:text-black" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tighter text-black dark:text-white">{t('title')}</h1>
                        <p className="text-[10px] uppercase font-bold tracking-widest text-gray-500 dark:text-gray-400 mt-1">{t('subtitle')}</p>
                    </div>
                </div>

                <div className="grid gap-6">

                    {/* Cuentas Activas */}
                    <Card className="bg-transparent rounded-none border-black/20 dark:border-white/20 shadow-none">
                        <CardHeader>
                            <CardTitle className="text-black dark:text-white text-lg font-bold uppercase tracking-tight">{t('social.title')}</CardTitle>
                            <CardDescription className="text-gray-600 dark:text-gray-400 text-xs uppercase tracking-widest">{t('social.desc')}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {connections.length > 0 ? (
                                connections.map((conn) => (
                                    <motion.div
                                        key={conn.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-transparent border border-black/20 dark:border-white/20 rounded-none group hover:border-black dark:hover:border-white transition-all gap-4"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 shrink-0 rounded-none bg-black/5 dark:bg-white/5 flex items-center justify-center border border-black/10 dark:border-white/10">
                                                {getProviderIcon(conn.provider)}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-bold text-black dark:text-white uppercase tracking-tight">{t(`social.${conn.provider}`)}</h4>
                                                    {conn.status === 'active' ? (
                                                        <Badge className="bg-black text-white dark:bg-white dark:text-black border-black dark:border-white rounded-none text-[9px] uppercase tracking-widest px-2 py-0.5">Activo</Badge>
                                                    ) : (
                                                        <Badge className="bg-red-500 text-white border-red-500 rounded-none text-[9px] uppercase tracking-widest px-2 py-0.5 flex gap-1">
                                                            <AlertCircle className="w-3 h-3" /> Reconectar
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-1">{conn.email}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 self-end sm:self-auto">
                                            <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400 dark:text-gray-500 hidden md:block">Conectado {conn.connectedAt}</span>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDisconnect(conn.id)}
                                                className="rounded-none border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4 mr-1.5 md:mr-0" />
                                                <span className="md:hidden text-[10px] uppercase tracking-widest">{t('social.disconnect')}</span>
                                            </Button>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-gray-500 text-xs font-bold uppercase tracking-widest border border-dashed border-black/20 dark:border-white/20 rounded-none bg-black/5 dark:bg-white/5">
                                    {t('social.desc')}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Añadir Nuevas Conexiones */}
                    <Card className="bg-transparent rounded-none border-black/20 dark:border-white/20 shadow-none">
                        <CardHeader>
                            <CardTitle className="text-black dark:text-white text-lg font-bold uppercase tracking-tight">Añadir otra cuenta</CardTitle>
                            <CardDescription className="text-gray-600 dark:text-gray-400 text-xs uppercase tracking-widest">Vincula servicios adicionales para facilitar tu acceso.</CardDescription>
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
                                            className="h-auto py-4 bg-transparent rounded-none border-black/20 dark:border-white/20 hover:border-black dark:hover:border-white hover:bg-black/5 dark:hover:bg-white/5 text-black dark:text-white justify-start gap-3 transition-colors"
                                            onClick={() => handleConnect(provider)}
                                            disabled={!!connecting}
                                        >
                                            {connecting === provider ? (
                                                <Loader2 className="w-5 h-5 animate-spin text-black dark:text-white" />
                                            ) : (
                                                <div className="h-8 w-8 shrink-0 rounded-none bg-black/5 dark:bg-white/5 flex items-center justify-center border border-black/10 dark:border-white/10">
                                                    <Plus className="w-4 h-4 text-black dark:text-white" />
                                                </div>
                                            )}
                                            <div className="text-left overflow-hidden">
                                                <p className="font-bold text-sm uppercase tracking-tight truncate">{t(`social.${provider}`)}</p>
                                                <p className="text-[9px] font-bold tracking-widest uppercase text-gray-500 dark:text-gray-400 truncate" title={t(`social.${provider}_desc`)}>{t(`social.${provider}_desc`)}</p>
                                            </div>
                                        </Button>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Dispositivos Conectados */}
                    <Card className="bg-transparent rounded-none border-black/20 dark:border-white/20 shadow-none">
                        <CardHeader>
                            <CardTitle className="text-black dark:text-white text-lg font-bold uppercase tracking-tight">{t('devices.title')}</CardTitle>
                            <CardDescription className="text-gray-600 dark:text-gray-400 text-xs uppercase tracking-widest">{t('devices.desc')}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-black/5 dark:bg-white/5 border border-black/20 dark:border-white/20 rounded-none gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 shrink-0 rounded-none bg-black dark:bg-white flex items-center justify-center border border-black dark:border-white text-white dark:text-black">
                                        <Smartphone className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-bold text-black dark:text-white uppercase tracking-tight">MacBook Pro - Chrome</h4>
                                            <Badge className="bg-black text-white dark:bg-white dark:text-black border-black dark:border-white rounded-none text-[9px] uppercase tracking-widest px-2 py-0.5">{t('devices.current')}</Badge>
                                        </div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mt-1">Ciudad de México, MX • Activo ahora</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-2">
                                <Button variant="outline" className="rounded-none border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-xs font-bold uppercase tracking-widest transition-colors">
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