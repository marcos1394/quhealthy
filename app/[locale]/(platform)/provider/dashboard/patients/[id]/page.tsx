"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import {
    Loader2, Calendar, ArrowLeft, Mail, Phone, MapPin,
    FileText, Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useTranslations } from 'next-intl';

// ShadCN UI
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QhSpinner } from '@/components/ui/QhSpinner';
import { handleApiError } from '@/lib/handleApiError';

// Tipos
interface ClientDetails {
    client: {
        id: number;
        name: string;
        email: string;
        phone?: string;
        address?: string;
        profileImageUrl: string | null;
        createdAt: string;
        notes?: string;
    };
    history: {
        id: number;
        status: 'pending' | 'confirmed' | 'completed' | 'canceled_by_provider' | 'canceled_by_consumer';
        startTime: string;
        privateNotes: string | null;
        service: { name: string };
    }[];
}

// Mock Data
const mockClientData: ClientDetails = {
    client: {
        id: 101,
        name: "Ana López",
        email: "ana.lopez@email.com",
        phone: "+52 55 1234 5678",
        address: "CDMX, México",
        profileImageUrl: null,
        createdAt: "2023-01-15T10:00:00Z",
        notes: "Paciente alérgico a la penicilina."
    },
    history: [
        {
            id: 1,
            status: 'completed',
            startTime: new Date(Date.now() - 86400000 * 2).toISOString(),
            service: { name: "Consulta General" },
            privateNotes: "Paciente reportó mejoría en los síntomas."
        },
        {
            id: 2,
            status: 'canceled_by_consumer',
            startTime: new Date(Date.now() - 86400000 * 10).toISOString(),
            service: { name: "Limpieza Dental" },
            privateNotes: null
        },
        {
            id: 3,
            status: 'confirmed',
            startTime: new Date(Date.now() + 86400000).toISOString(),
            service: { name: "Seguimiento" },
            privateNotes: null
        }
    ]
};

export default function PatientDetailPage() {
    const params = useParams();
    const router = useRouter();
    const t = useTranslations("DashboardPatientDetail");

    // Manejo seguro del ID (puede venir como string o array)
    const clientId = Array.isArray(params.id) ? params.id[0] : params.id;

    const [clientData, setClientData] = useState<ClientDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchClientDetails = useCallback(async () => {
        if (!clientId) return;
        setIsLoading(true);
        try {
            // Simulación
            await new Promise(r => setTimeout(r, 600));
            setClientData(mockClientData);

            // Producción:
            // const { data } = await axios.get(`/api/provider/clients/${clientId}`, { withCredentials: true });
            // setClientData(data);
        } catch (error) {
            console.error(error);
            return;
        } finally {
            setIsLoading(false);
        }
    }, [clientId, t]);

    useEffect(() => {
        fetchClientDetails();
    }, [fetchClientDetails]);

    // Helpers de estado
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed':
                return <Badge variant="outline" className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20 font-medium">{t("status_completed")}</Badge>;
            case 'confirmed':
                return <Badge variant="outline" className="bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20 font-medium">{t("status_confirmed")}</Badge>;
            case 'pending':
                return <Badge variant="outline" className="bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20 font-medium">{t("status_pending")}</Badge>;
            default:
                return <Badge variant="outline" className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20 font-medium">{t("status_cancelled")}</Badge>;
        }
    };

    const getTimelineDotColor = (status: string) => {
        switch (status) {
            case 'completed': return 'border-emerald-500';
            case 'confirmed': return 'border-blue-500';
            case 'pending': return 'border-amber-500';
            default: return 'border-slate-300 dark:border-slate-600';
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col justify-center items-center h-[80vh] bg-slate-50 dark:bg-slate-950 transition-colors">
                <QhSpinner size="md" />
                <p className="text-slate-500 dark:text-slate-400 font-light">{t("loading")}</p>
            </div>
        );
    }

    if (!clientData) return null;

    const { client, history } = clientData;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 transition-colors">

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-5xl mx-auto">

                {/* Header / Botón Atrás */}
                <div>
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                        className="pl-2 pr-4 gap-2 mb-2"
                    >
                        <ArrowLeft className="w-4 h-4" /> {t("back_to_list")}
                    </Button>
                </div>

                {/* Perfil del Paciente */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* Columna Izquierda: Datos Personales */}
                    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm md:col-span-1 h-fit transition-colors rounded-2xl overflow-hidden">
                        <CardHeader className="flex flex-col items-center text-center pb-2 bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800">
                            <Avatar className="w-24 h-24 mb-4 border-4 border-white dark:border-slate-900 shadow-sm mt-4">
                                <AvatarImage src={client.profileImageUrl || ''} />
                                <AvatarFallback className="text-3xl bg-gradient-to-br from-medical-500 to-emerald-500 text-white font-bold">
                                    {client.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <CardTitle className="text-xl text-slate-900 dark:text-white tracking-tight">{client.name}</CardTitle>
                            <CardDescription className="text-slate-500 dark:text-slate-400 font-light">
                                {t("patient_since", { year: new Date(client.createdAt).getFullYear() })}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-6">
                            <div className="space-y-3 test-sm font-light">
                                <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                                    <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-md shrink-0 border border-slate-200 dark:border-slate-700">
                                        <Mail className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                                    </div>
                                    <span className="truncate">{client.email}</span>
                                </div>
                                {client.phone && (
                                    <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                                        <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-md shrink-0 border border-slate-200 dark:border-slate-700">
                                            <Phone className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                                        </div>
                                        <span>{client.phone}</span>
                                    </div>
                                )}
                                {client.address && (
                                    <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                                        <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-md shrink-0 border border-slate-200 dark:border-slate-700">
                                            <MapPin className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                                        </div>
                                        <span>{client.address}</span>
                                    </div>
                                )}
                            </div>

                            {client.notes && (
                                <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 rounded-xl shadow-sm">
                                    <p className="text-[10px] text-amber-600 dark:text-amber-500 font-bold mb-2 flex items-center gap-1.5 tracking-wider">
                                        <FileText className="w-3.5 h-3.5" /> {t("medical_notes")}
                                    </p>
                                    <p className="text-sm text-slate-700 dark:text-slate-300 italic font-medium leading-relaxed">{client.notes}</p>
                                </div>
                            )}

                            <Button variant="outline" className="w-full mt-6">
                                {t("edit_profile")}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Columna Derecha: Historial */}
                    <div className="md:col-span-2 space-y-6">
                        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm transition-colors rounded-2xl overflow-hidden">
                            <CardHeader className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800">
                                <CardTitle className="flex items-center gap-2.5 text-slate-900 dark:text-white tracking-tight">
                                    <div className="p-2 bg-medical-50 dark:bg-medical-500/10 rounded-lg border border-medical-200 dark:border-medical-500/20">
                                        <Calendar className="w-4 h-4 text-medical-600 dark:text-medical-400" />
                                    </div>
                                    {t("clinical_history")}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                {history.length > 0 ? (
                                    <div className="relative border-l-2 border-slate-100 dark:border-slate-800 ml-3 space-y-8 py-2">
                                        {history.map((appt) => (
                                            <div key={appt.id} className="relative pl-8">
                                                {/* Timeline Dot */}
                                                <div className={`absolute left-[-7px] top-1.5 w-3 h-3 rounded-full border-2 bg-white dark:bg-slate-900 ${getTimelineDotColor(appt.status)} shadow-sm z-10`} />

                                                <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:border-medical-200 dark:hover:border-medical-500/30 hover:shadow-sm transition-all group">
                                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                                                        <div>
                                                            <h4 className="font-semibold text-slate-900 dark:text-white text-lg group-hover:text-medical-600 dark:group-hover:text-medical-400 transition-colors">{appt.service.name}</h4>
                                                            <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1 font-light">
                                                                <Clock className="w-3.5 h-3.5" />
                                                                {format(new Date(appt.startTime), "EEEE d 'de' MMMM, yyyy", { locale: es })}
                                                            </p>
                                                        </div>
                                                        <div className="shrink-0">{getStatusBadge(appt.status)}</div>
                                                    </div>

                                                    {appt.privateNotes && (
                                                        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                                                            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-2">{t("private_notes")}</p>
                                                            <p className="text-sm text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 font-light leading-relaxed shadow-sm">
                                                                {appt.privateNotes}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl inline-block mb-3 border border-slate-200 dark:border-slate-700">
                                            <Calendar className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                                        </div>
                                        <p className="text-slate-500 dark:text-slate-400 font-light">{t("empty_history")}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                </div>

            </motion.div>
        </div>
    );
}