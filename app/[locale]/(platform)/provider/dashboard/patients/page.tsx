"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { Loader2, Users, UserPlus, ArrowRight, Search, FileText, Calendar, Activity, Phone, Mail, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useTranslations } from 'next-intl';

// ShadCN UI
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import { QhSpinner } from '@/components/ui/QhSpinner';
import { handleApiError } from '@/lib/handleApiError';

// Tipos
interface Client {
    id: number;
    totalAppointments: number;
    lastAppointmentDate: string;
    status: 'active' | 'inactive';
    consumer: {
        id: number;
        name: string;
        email: string;
        phone?: string;
        profileImageUrl: string | null;
    };
}

// Mock Data
const mockClients: Client[] = [
    {
        id: 1,
        totalAppointments: 5,
        lastAppointmentDate: new Date().toISOString(),
        status: 'active',
        consumer: { id: 101, name: "Ana López", email: "ana.lopez@email.com", profileImageUrl: null }
    },
    {
        id: 2,
        totalAppointments: 12,
        lastAppointmentDate: new Date(Date.now() - 86400000 * 5).toISOString(),
        status: 'active',
        consumer: { id: 102, name: "Carlos Ruiz", email: "carlos.r@email.com", profileImageUrl: "https://github.com/shadcn.png" }
    },
    {
        id: 3,
        totalAppointments: 1,
        lastAppointmentDate: new Date(Date.now() - 86400000 * 30).toISOString(),
        status: 'inactive',
        consumer: { id: 103, name: "Maria Garcia", email: "m.garcia@email.com", profileImageUrl: null }
    }
];

export default function ProviderPatientsPage() {
    const t = useTranslations("DashboardPatients");
    const [clients, setClients] = useState<Client[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPatient, setSelectedPatient] = useState<Client | null>(null);

    const fetchClients = useCallback(async () => {
        setIsLoading(true);
        try {
            // Simulación
            await new Promise(r => setTimeout(r, 600));
            setClients(mockClients);

            // Producción:
            // const { data } = await axios.get('/api/provider/clients', { withCredentials: true });
            // setClients(data);
        } catch (error) {
            console.error(error);
            return;
        } finally {
            setIsLoading(false);
        }
    }, [t]);

    useEffect(() => {
        fetchClients();
    }, [fetchClients]);

    // Filtrado local
    const filteredClients = clients.filter(c =>
        c.consumer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.consumer.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="flex flex-col justify-center items-center h-[80vh] bg-slate-50 dark:bg-slate-950 transition-colors">
                <QhSpinner size="md" />
                <p className="text-slate-500 dark:text-slate-400 font-light">{t("loading")}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 transition-colors">

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-7xl mx-auto">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-medical-50 dark:bg-medical-500/10 rounded-2xl border border-medical-200 dark:border-medical-500/20">
                            <Users className="w-7 h-7 text-medical-600 dark:text-medical-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                                {t("title")}
                            </h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-light">
                                {clients.length > 0
                                    ? t("subtitle_populated", { count: clients.length })
                                    : t("subtitle_empty")}
                            </p>
                        </div>
                    </div>
                    <Button className="bg-medical-600 hover:bg-medical-700 text-white rounded-xl shadow-sm transition-all focus:ring-2 focus:ring-medical-500/20">
                        <UserPlus className="w-4 h-4 mr-2" />
                        {t("new_patient")}
                    </Button>
                </div>

                {/* Filtros y Búsqueda */}
                <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
                    <div className="relative flex-1 max-w-sm border-slate-200 dark:border-slate-700 focus-within:border-medical-500 transition-colors rounded-xl overflow-hidden border">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder={t("search_placeholder")}
                            className="pl-9 bg-slate-50 dark:bg-slate-800 border-0 focus-visible:ring-0 text-slate-900 dark:text-white h-10 shadow-none transition-colors"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {/* Aquí podrías añadir más filtros (Select) si fuera necesario */}
                </div>

                {/* Tabla de Pacientes */}
                {filteredClients.length > 0 ? (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm transition-colors">
                        <Table>
                            <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                                <TableRow className="border-slate-200 dark:border-slate-800 hover:bg-transparent">
                                    <TableHead className="text-slate-500 dark:text-slate-400 font-medium text-[11px] uppercase tracking-wider pl-5">{t("col_patient")}</TableHead>
                                    <TableHead className="text-slate-500 dark:text-slate-400 font-medium text-[11px] uppercase tracking-wider text-center">{t("col_status")}</TableHead>
                                    <TableHead className="text-slate-500 dark:text-slate-400 font-medium text-[11px] uppercase tracking-wider text-center">{t("col_appointments")}</TableHead>
                                    <TableHead className="text-slate-500 dark:text-slate-400 font-medium text-[11px] uppercase tracking-wider">{t("col_last_visit")}</TableHead>
                                    <TableHead className="text-right text-slate-500 dark:text-slate-400 font-medium text-[11px] uppercase tracking-wider pr-5">{t("col_actions")}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredClients.map((client) => {
                                    const { id, consumer, totalAppointments, lastAppointmentDate, status } = client;
                                    return (
                                        <TableRow key={id} onClick={() => setSelectedPatient(client)} className="border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-pointer group">

                                            <TableCell className="pl-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-10 w-10 border border-slate-200 dark:border-slate-700">
                                                        <AvatarImage src={consumer.profileImageUrl || ''} />
                                                        <AvatarFallback className="bg-gradient-to-br from-medical-500 to-emerald-500 text-white font-medium">
                                                            {consumer.name.charAt(0).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="font-semibold text-sm text-slate-900 dark:text-white group-hover:text-medical-600 dark:group-hover:text-medical-400 transition-colors truncate">
                                                            {consumer.name}
                                                        </span>
                                                        <span className="text-xs text-slate-500 dark:text-slate-400 truncate font-light">
                                                            {consumer.email}
                                                        </span>
                                                    </div>
                                                </div>
                                            </TableCell>

                                            <TableCell className="text-center">
                                                <Badge variant="outline" className={`font-medium text-xs ${status === 'active'
                                                    ? 'border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10'
                                                    : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800'
                                                    }`}>
                                                    {status === 'active' ? t("status_active") || "Active" : t("status_inactive") || "Inactive"}
                                                </Badge>
                                            </TableCell>

                                            <TableCell className="text-center text-slate-900 dark:text-white font-semibold">
                                                {totalAppointments}
                                            </TableCell>

                                            <TableCell className="text-slate-600 dark:text-slate-300 text-sm font-medium">
                                                {format(new Date(lastAppointmentDate), "d MMM, yyyy", { locale: es })}
                                            </TableCell>

                                            <TableCell className="text-right pr-5">
                                                <Button variant="ghost" size="sm"
                                                    className="text-slate-400 hover:text-medical-600 dark:hover:text-medical-400 hover:bg-medical-50 dark:hover:bg-medical-500/10 transition-all rounded-lg text-xs">
                                                    {t("view_profile")} <ArrowRight className="w-3.5 h-3.5 ml-1.5 transition-transform group-hover:translate-x-0.5" />
                                                </Button>
                                            </TableCell>

                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
                        <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl inline-block mb-4">
                            <FileText className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">{t("empty_title")}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto font-light">
                            {searchTerm ? t("empty_search", { term: searchTerm }) : t("empty_list")}
                        </p>
                        {searchTerm && (
                            <Button variant="link" onClick={() => setSearchTerm('')} className="mt-2 text-medical-600 dark:text-medical-400 hover:text-medical-700">
                                {t("clear_search")}
                            </Button>
                        )}
                    </div>
                )}

            </motion.div>

            {/* Patient Details Sheet */}
            <Sheet open={!!selectedPatient} onOpenChange={(open) => !open && setSelectedPatient(null)}>
                <SheetContent className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 sm:max-w-md w-[400px] overflow-y-auto">
                    {selectedPatient && (
                        <>
                            <SheetHeader className="pb-6 border-b border-slate-100 dark:border-slate-800">
                                <SheetTitle className="text-left text-slate-900 dark:text-white">Patient Profile</SheetTitle>
                                <SheetDescription className="text-left font-light text-slate-500">
                                    Manage patient details and records securely.
                                </SheetDescription>
                            </SheetHeader>
                            <div className="py-6 space-y-8">
                                <div className="flex flex-col items-center text-center">
                                    <Avatar className="w-24 h-24 border-[3px] border-slate-100 dark:border-slate-800 mb-4 shadow-sm">
                                        <AvatarImage src={selectedPatient.consumer.profileImageUrl || ''} />
                                        <AvatarFallback className="bg-gradient-to-br from-medical-500 to-emerald-500 text-white text-2xl font-semibold">
                                            {selectedPatient.consumer.name.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{selectedPatient.consumer.name}</h2>
                                    <Badge variant="outline" className={`mt-2 ${selectedPatient.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'}`}>
                                        {selectedPatient.status === 'active' ? (t("status_active") || 'Active') : (t("status_inactive") || 'Inactive')}
                                    </Badge>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">Contact Info</h3>
                                    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800 space-y-3">
                                        <div className="flex items-center gap-3">
                                            <Mail className="w-4 h-4 text-slate-400" />
                                            <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">{selectedPatient.consumer.email}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Phone className="w-4 h-4 text-slate-400" />
                                            <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">{selectedPatient.consumer.phone || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <MapPin className="w-4 h-4 text-slate-400" />
                                            <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">No address on file</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">History</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl p-4">
                                            <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400 mb-2" />
                                            <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{selectedPatient.totalAppointments}</p>
                                            <p className="text-[10px] text-blue-600/80 dark:text-blue-400/80 uppercase tracking-wider font-semibold">Total Visits</p>
                                        </div>
                                        <div className="bg-medical-50 dark:bg-medical-500/10 border border-medical-200 dark:border-medical-500/20 rounded-xl p-4">
                                            <Calendar className="w-5 h-5 text-medical-600 dark:text-medical-400 mb-2" />
                                            <p className="text-base font-bold text-medical-700 dark:text-medical-400 leading-tight">
                                                {format(new Date(selectedPatient.lastAppointmentDate), "MMM d", { locale: es })}
                                            </p>
                                            <p className="text-[10px] text-medical-600/80 dark:text-medical-400/80 uppercase tracking-wider font-semibold mt-0.5">Last Visit</p>
                                        </div>
                                    </div>
                                </div>

                                <Button className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 rounded-xl font-semibold shadow-sm text-sm py-5">
                                    View Full Medical Record
                                </Button>
                            </div>
                        </>
                    )}
                </SheetContent>
            </Sheet>

        </div>
    );
}