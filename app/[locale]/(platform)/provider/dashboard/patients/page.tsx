"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Users, UserPlus, ArrowRight, Search, FileText, 
    Calendar, Activity, Phone, Mail, Filter, MoreHorizontal, Edit
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

// Infra & UI
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { QhSpinner } from '@/components/ui/QhSpinner';
import { cn } from '@/lib/utils';
import { NewPatientModal } from '@/components/dashboard/NewPatientModal';
import { EditPatientModal } from '@/components/dashboard/EditPatientModal';

// 🚀 Nuestra nueva arquitectura importada
import { usePatientDirectory } from '@/hooks/usePatientDirectory';
import { PatientClient } from '@/types/patient';
import { PatientDirectoryProfile } from '@/types/medicalHistory';

export default function ProviderPatientsPage() {
    const t = useTranslations("DashboardPatients");
    const router = useRouter();
    
    // 🚀 Usamos el Custom Hook
    const { clients, isLoading, fetchClients } = usePatientDirectory();
    
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPatient, setSelectedPatient] = useState<PatientClient | null>(null);
    const [isNewPatientModalOpen, setIsNewPatientModalOpen] = useState(false);
    const [patientToEdit, setPatientToEdit] = useState<PatientDirectoryProfile | null>(null);

    // Cargar pacientes al montar
    useEffect(() => {
        fetchClients();
    }, [fetchClients]);

    const filteredClients = clients.filter(c =>
        c.consumer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.consumer.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="flex flex-col justify-center items-center h-[70vh] bg-slate-50 dark:bg-slate-950">
                <QhSpinner size="lg" />
                <p className="text-slate-500 dark:text-slate-400 font-medium animate-pulse mt-4">{t("loading")}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 p-4 md:p-8 transition-colors duration-500">
            <motion.div 
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="space-y-8 max-w-7xl mx-auto"
            >
                {/* --- HEADER --- */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm ring-1 ring-slate-200/50 dark:ring-white/5">
                            <Users className="w-8 h-8 text-medical-600 dark:text-medical-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                                {t("title")}
                            </h1>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary" className="bg-medical-50 dark:bg-medical-500/10 text-medical-700 dark:text-medical-400 border-none font-medium">
                                    {clients.length} {t("total_patients")}
                                </Badge>
                                <span className="text-slate-400 dark:text-slate-600">•</span>
                                <p className="text-sm text-slate-500 dark:text-slate-400 font-light">
                                    {t("subtitle_populated")}
                                </p>
                            </div>
                        </div>
                    </div>
                    <Button
                        onClick={() => setIsNewPatientModalOpen(true)}
                        className="bg-medical-600 hover:bg-medical-700 text-white shadow-lg shadow-medical-500/20 rounded-xl h-11 px-6 transition-all active:scale-95"
                    >
                        <UserPlus className="w-4 h-4 mr-2" />
                        {t("new_patient")}
                    </Button>
                </div>

                {/* --- FILTROS --- */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-white/60 dark:bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="md:col-span-8 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder={t("search_placeholder")}
                            className="pl-11 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-medical-500 h-11 rounded-xl"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="md:col-span-4 flex justify-end">
                        <Button variant="outline" className="w-full md:w-auto h-11 rounded-xl border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
                            <Filter className="w-4 h-4 mr-2" />
                            {t("more_filters")}
                        </Button>
                    </div>
                </div>

                {/* --- CONTENIDO --- */}
                <AnimatePresence mode="wait">
                    {filteredClients.length > 0 ? (
                        <motion.div 
                            key="list"
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xl shadow-slate-200/20 dark:shadow-none"
                        >
                            <Table>
                                <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50">
                                    <TableRow className="border-slate-200 dark:border-slate-800">
                                        <TableHead className="py-5 pl-8 text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase tracking-widest">{t("col_patient")}</TableHead>
                                        <TableHead className="text-center text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase tracking-widest">{t("col_status")}</TableHead>
                                        <TableHead className="text-center text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase tracking-widest">{t("col_appointments")}</TableHead>
                                        <TableHead className="text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase tracking-widest">{t("col_last_visit")}</TableHead>
                                        <TableHead className="text-right pr-8 text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase tracking-widest">{t("col_actions")}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredClients.map((client) => (
                                        <TableRow 
                                            key={client.id} 
                                            onClick={() => setSelectedPatient(client)}
                                            className="border-slate-100 dark:border-slate-800 hover:bg-slate-50/80 dark:hover:bg-slate-800/80 transition-all cursor-pointer group"
                                        >
                                            <TableCell className="pl-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <Avatar className="h-11 w-11 ring-2 ring-white dark:ring-slate-800 shadow-sm transition-transform group-hover:scale-105">
                                                        <AvatarImage src={client.consumer.profileImageUrl || ''} />
                                                        <AvatarFallback className="bg-gradient-to-tr from-medical-600 to-emerald-400 text-white text-sm font-bold">
                                                            {client.consumer.name.charAt(0)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-slate-900 dark:text-white transition-colors group-hover:text-medical-600">
                                                            {client.consumer.name}
                                                        </span>
                                                        <span className="text-xs text-slate-400 font-light lowercase tracking-tight">
                                                            {client.consumer.email}
                                                        </span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge className={cn(
                                                    "px-3 py-1 rounded-full text-[10px] font-bold border-none shadow-sm",
                                                    client.status === 'active' 
                                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                                                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                                                )}>
                                                    {client.status === 'active' ? t("status_active") : t("status_inactive")}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-xs border border-slate-100 dark:border-slate-700">
                                                    {client.totalAppointments}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-slate-600 dark:text-slate-400 text-xs font-medium">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                    {format(new Date(client.lastAppointmentDate), "PP", { locale: es })}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right pr-8">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                        <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl shadow-xl">
                                                        <DropdownMenuItem
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                router.push(`/provider/dashboard/patients/${client.id}`);
                                                            }}
                                                            className="text-xs focus:bg-medical-50 dark:focus:bg-medical-500/10 cursor-pointer"
                                                        >
                                                            <Activity className="w-3.5 h-3.5 mr-2" /> {t("view_full_record")}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                const nameParts = client.consumer.name.trim().split(/\s+/);
                                                                setPatientToEdit({
                                                                    id: client.id,
                                                                    consumerId: client.consumer.id,
                                                                    firstName: nameParts[0] || '',
                                                                    lastName: nameParts.slice(1).join(' '),
                                                                    email: client.consumer.email || null,
                                                                    phone: client.consumer.phone || null,
                                                                    birthDate: null,
                                                                    gender: null,
                                                                    isPlatformUser: client.consumer.id !== null,
                                                                    createdAt: client.lastAppointmentDate
                                                                });
                                                            }}
                                                            className="text-xs focus:bg-medical-50 dark:focus:bg-medical-500/10 cursor-pointer"
                                                        >
                                                            <Edit className="w-3.5 h-3.5 mr-2" /> {t("edit_contact")}
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="empty"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-32 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700"
                        >
                            <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-full inline-block mb-4">
                                <Users className="w-12 h-12 text-slate-300 dark:text-slate-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{t("empty_title")}</h3>
                            <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-xs mx-auto font-light leading-relaxed">
                                {searchTerm ? t("empty_search") : t("empty_list")}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* --- PATIENT DRAWER --- */}
            <Sheet open={!!selectedPatient} onOpenChange={(open) => !open && setSelectedPatient(null)}>
                <SheetContent className="bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-slate-200 dark:border-slate-800 sm:max-w-md w-full p-0">
                    {selectedPatient && (
                        <div className="h-full flex flex-col">
                            <div className="p-8 pb-6 border-b border-slate-100 dark:border-slate-800">
                                <SheetHeader className="text-left">
                                    <SheetTitle className="text-2xl font-bold text-slate-900 dark:text-white">{t('sheet_title')}</SheetTitle>
                                    <SheetDescription className="font-light text-slate-500">
                                        {t('sheet_desc')}
                                    </SheetDescription>
                                </SheetHeader>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                                <div className="flex flex-col items-center text-center">
                                    <div className="relative group">
                                        <Avatar className="w-28 h-28 border-[4px] border-white dark:border-slate-800 shadow-2xl transition-transform group-hover:scale-105">
                                            <AvatarImage src={selectedPatient.consumer.profileImageUrl || ''} />
                                            <AvatarFallback className="bg-gradient-to-br from-medical-600 to-emerald-500 text-white text-3xl font-bold">
                                                {selectedPatient.consumer.name.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 border-4 border-white dark:border-slate-950 rounded-full" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-6 tracking-tight">{selectedPatient.consumer.name}</h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{t('patient_id')}: #{selectedPatient.consumer.id}</p>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">{t('contact_info')}</h3>
                                    <div className="grid grid-cols-1 gap-3">
                                        <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                            <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                                                <Mail className="w-4 h-4 text-medical-600" />
                                            </div>
                                            <span className="text-sm text-slate-600 dark:text-slate-300 font-semibold truncate">{selectedPatient.consumer.email}</span>
                                        </div>
                                        <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                            <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                                                <Phone className="w-4 h-4 text-medical-600" />
                                            </div>
                                            <span className="text-sm text-slate-600 dark:text-slate-300 font-semibold">{selectedPatient.consumer.phone || '—'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">{t('activity_summary')}</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-slate-900 dark:bg-white p-5 rounded-3xl shadow-xl shadow-slate-900/10">
                                            <Activity className="w-5 h-5 text-medical-400 dark:text-medical-600 mb-3" />
                                            <p className="text-3xl font-bold text-white dark:text-slate-900">{selectedPatient.totalAppointments}</p>
                                            <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold mt-1">{t('total_visits')}</p>
                                        </div>
                                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm">
                                            <Calendar className="w-5 h-5 text-medical-600 mb-3" />
                                            <p className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                                                {format(new Date(selectedPatient.lastAppointmentDate), "d MMM", { locale: es })}
                                            </p>
                                            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">{t('last_visit')}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
                                <Button
                                    onClick={() => router.push(`/provider/dashboard/patients/${selectedPatient.id}`)}
                                    className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 h-14 rounded-2xl font-bold text-base hover:scale-[1.02] transition-transform active:scale-95 shadow-xl shadow-slate-900/10"
                                >
                                    {t('view_medical_record')}
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </Button>
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>

            <NewPatientModal
                isOpen={isNewPatientModalOpen}
                onClose={() => setIsNewPatientModalOpen(false)}
                onSuccess={async () => {
                    await fetchClients();
                }}
            />

            <EditPatientModal
                isOpen={!!patientToEdit}
                patient={patientToEdit}
                onClose={() => setPatientToEdit(null)}
                onUpdated={async () => {
                    await fetchClients();
                    setPatientToEdit(null);
                }}
            />
        </div>
    );
}
