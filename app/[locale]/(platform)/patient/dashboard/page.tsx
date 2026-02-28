"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Loader2, Calendar, Clock, User, ArrowRight, Search } from 'lucide-react';
import { formatInTimeZone } from 'date-fns-tz';
import { es } from 'date-fns/locale';

// ShadCN UI
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

// Store
import { useSessionStore } from '@/stores/SessionStore';

// Tipos
interface Appointment {
    id: number;
    status: 'pending' | 'confirmed' | 'completed' | 'canceled';
    startTime: string;
    provider: {
        name: string;
        image?: string;
        specialty?: string
    };
    service: { name: string };
    location?: string;
}

// Mock Data
const mockAppointments: Appointment[] = [
    {
        id: 1,
        status: 'confirmed',
        startTime: new Date(Date.now() + 86400000).toISOString(),
        provider: { name: "Dr. Roberto Casas", specialty: "Dentista" },
        service: { name: "Limpieza Dental Profunda" },
        location: "Av. Reforma 222, CDMX"
    }
];

export default function ConsumerDashboardPage() {
    const { user } = useSessionStore();
    const router = useRouter();
    const t = useTranslations('PatientDashboard');
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setTimeout(() => {
            setAppointments(mockAppointments);
            setIsLoading(false);
        }, 800);
    }, []);

    const nextAppointment = useMemo(() => {
        const upcoming = appointments
            .filter(appt => new Date(appt.startTime) > new Date() && appt.status === 'confirmed')
            .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
        return upcoming.length > 0 ? upcoming[0] : null;
    }, [appointments]);

    if (isLoading) {
        return (
            <div className="flex flex-col justify-center items-center h-[60vh] gap-4 bg-slate-50 dark:bg-slate-950">
                <Loader2 className="w-12 h-12 animate-spin text-medical-500" />
                <p className="text-slate-500 dark:text-slate-400 font-medium">{t('loading')}</p>
            </div>
        );
    }

    const firstName = user?.firstName || t('fallback_name');

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans selection:bg-medical-500/30">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
            >

                {/* Header */}
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                        {t('greeting', { name: firstName })}
                    </h1>
                    <p className="text-base md:text-lg text-slate-500 dark:text-slate-400 mt-2">
                        {t('subtitle')}
                    </p>
                </div>

                {/* Tarjeta de Próxima Cita (Destacada) */}
                {nextAppointment ? (
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-medical-700 to-medical-900 dark:from-medical-800 dark:to-medical-950 p-8 shadow-xl border border-medical-500/30">
                        {/* Decoración de fondo */}
                        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-medical-500/20 rounded-full blur-3xl pointer-events-none"></div>

                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div className="space-y-4">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-medical-100 text-xs font-semibold uppercase tracking-wider">
                                    <Calendar className="w-3 h-3" /> {t('next_badge')}
                                </div>

                                <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight">
                                    {nextAppointment.service.name}
                                </h2>

                                <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 text-medical-100">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10 border-2 border-white/30">
                                            <AvatarFallback className="bg-white/10 text-white font-bold">
                                                {nextAppointment.provider.name.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-semibold text-white">{nextAppointment.provider.name}</p>
                                            <p className="text-xs text-medical-200">{nextAppointment.provider.specialty}</p>
                                        </div>
                                    </div>

                                    <div className="h-10 w-[1px] bg-white/20 hidden sm:block"></div>

                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-medical-200" />
                                            <span className="font-medium">
                                                {formatInTimeZone(new Date(nextAppointment.startTime), 'UTC', "EEEE d 'de' MMMM", { locale: es })}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-medical-200" />
                                            <span>
                                                {formatInTimeZone(new Date(nextAppointment.startTime), 'UTC', "h:mm a", { locale: es })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="w-full md:w-auto">
                                <Button
                                    onClick={() => router.push(`/patient/appointments/${nextAppointment.id}`)}
                                    className="w-full md:w-auto bg-white text-medical-900 hover:bg-medical-50 font-bold py-6 px-8 rounded-xl shadow-lg transition-all hover:scale-105"
                                >
                                    {t('btn_details')}
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <Card className="bg-white dark:bg-slate-900 border-dashed border-2 border-slate-200 dark:border-slate-700 shadow-sm">
                        <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                            <div className="p-4 bg-medical-50 dark:bg-medical-500/10 rounded-full">
                                <Search className="w-8 h-8 text-medical-600 dark:text-medical-400" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t('empty_title')}</h3>
                            <p className="text-slate-500 dark:text-slate-400 max-w-sm">
                                {t('empty_desc')}
                            </p>
                            <Button
                                onClick={() => router.push('/search')}
                                className="bg-medical-600 hover:bg-medical-700 text-white mt-4"
                            >
                                {t('btn_search')}
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Grid de Accesos Rápidos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Card
                        className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-medical-400 dark:hover:border-medical-500/50 transition-all cursor-pointer group shadow-sm"
                        onClick={() => router.push('/patient/dashboard/appointments')}
                    >
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">{t('card_history')}</CardTitle>
                            <Clock className="w-5 h-5 text-slate-400 group-hover:text-medical-500 transition-colors" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{t('card_history_desc')}</p>
                            <div className="text-xs font-semibold text-medical-600 dark:text-medical-400 flex items-center">
                                {t('card_history_link')} <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card
                        className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-medical-400 dark:hover:border-medical-500/50 transition-all cursor-pointer group shadow-sm"
                        onClick={() => router.push('/patient/profile')}
                    >
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">{t('card_profile')}</CardTitle>
                            <User className="w-5 h-5 text-slate-400 group-hover:text-medical-500 transition-colors" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{t('card_profile_desc')}</p>
                            <div className="text-xs font-semibold text-medical-600 dark:text-medical-400 flex items-center">
                                {t('card_profile_link')} <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

            </motion.div>
        </div>
    );
}