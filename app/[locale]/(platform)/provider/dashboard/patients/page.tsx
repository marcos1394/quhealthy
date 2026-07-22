"use client"
/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/no-giant-component */;

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

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { QhSpinner } from '@/components/ui/QhSpinner';
import { cn } from '@/lib/utils';
import { NewPatientModal } from '@/components/dashboard/NewPatientModal';
import { EditPatientModal } from '@/components/dashboard/EditPatientModal';

import { usePatientDirectory } from '@/hooks/usePatientDirectory';
import { PatientClient } from '@/types/patient';
import { PatientDirectoryProfile } from '@/types/medicalHistory';

export default function ProviderPatientsPage() {
 const t = useTranslations("DashboardPatients");
 const router = useRouter();
 
 const { clients, isLoading, fetchClients } = usePatientDirectory();
 
 const [searchTerm, setSearchTerm] = useState('');
 const [selectedPatient, setSelectedPatient] = useState<PatientClient | null>(null);
 const [isNewPatientModalOpen, setIsNewPatientModalOpen] = useState(false);
 const [patientToEdit, setPatientToEdit] = useState<PatientDirectoryProfile | null>(null);

 useEffect(() => {
 fetchClients();
 }, [fetchClients]);

 const filteredClients = clients.filter(c =>
 c.consumer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
 c.consumer.email.toLowerCase().includes(searchTerm.toLowerCase())
 );

 if (isLoading) {
 return (
 <div className="flex flex-col justify-center items-center h-[70vh] bg-gray-50 dark:bg-[#050505]">
 <QhSpinner size="lg" className="text-emerald-600 dark:text-emerald-400" />
 <p className="text-sm font-semibold text-gray-500 animate-pulse mt-6">
 {t("loading", { defaultValue: 'Sincronizando directorio...' })}
 </p>
 </div>
 );
 }

 return (
 <div className="min-h-screen bg-gray-50 dark:bg-[#050505] p-4 md:p-8 transition-colors duration-500 font-sans selection:bg-gray-200 dark:selection:bg-white/20">
 <div className="space-y-8 max-w-7xl mx-auto">
 
 {/* --- HEADER --- */}
 <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-gray-100 dark:border-gray-800">
 <div className="flex items-start gap-5">
 <div className="w-16 h-16 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] flex items-center justify-center shrink-0 shadow-sm">
 <Users className="w-7 h-7 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
 </div>
 <div>
 <p className="text-sm font-semibold text-gray-500 mb-1">
 Base de Datos
 </p>
 <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2 leading-none">
 {t("title", { defaultValue: 'Directorio de Pacientes' })}
 </h1>
 <div className="flex flex-wrap items-center gap-3">
 <span className="rounded-xl bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800">
 {clients.length} {t("total_patients", { defaultValue: 'Registrados' })}
 </span>
 <p className="text-sm font-medium text-gray-500">
 {t("subtitle_populated", { defaultValue: 'Control y gestión de expedientes.' })}
 </p>
 </div>
 </div>
 </div>
 <button
 onClick={() => setIsNewPatientModalOpen(true)}
 className="w-full md:w-auto h-12 px-6 bg-emerald-600 text-white hover:bg-emerald-700 flex items-center justify-center gap-2 text-sm font-semibold transition-colors rounded-xl shadow-sm border-0"
 >
 <UserPlus className="w-4 h-4" strokeWidth={2} />
 {t("new_patient", { defaultValue: 'Nuevo Registro' })}
 </button>
 </div>

 {/* --- FILTROS Y BÚSQUEDA --- */}
 <div className="flex flex-col md:flex-row gap-4">
 <div className="flex-1 relative rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] focus-within:ring-2 focus-within:ring-emerald-500 overflow-hidden shadow-sm">
 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={2} />
 <input
 placeholder={t("search_placeholder", { defaultValue: 'Buscar por nombre o correo...' })}
 className="w-full h-12 pl-11 pr-4 bg-transparent border-0 text-sm font-medium text-gray-900 dark:text-white focus:ring-0 focus:outline-none placeholder:text-gray-400"
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 />
 </div>
 <button className="h-12 px-8 flex items-center justify-center gap-2 bg-white dark:bg-[#0a0a0a] hover:bg-gray-50 dark:hover:bg-[#111] border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm transition-colors text-sm font-semibold text-gray-700 dark:text-gray-300 shrink-0">
 <Filter className="w-4 h-4" strokeWidth={2} />
 {t("more_filters", { defaultValue: 'Filtros' })}
 </button>
 </div>

 {/* --- TABLA DE DIRECTORIO --- */}
 <AnimatePresence mode="wait">
 {filteredClients.length > 0 ? (
 <motion.div 
 key="list"
 initial={{ opacity: 0 }} 
 animate={{ opacity: 1 }} 
 exit={{ opacity: 0 }}
 className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 flex flex-col transition-colors rounded-3xl shadow-sm overflow-hidden"
 >
 <Table>
 <TableHeader className="bg-gray-50/50 dark:bg-[#050505]/50">
 <TableRow className="border-b border-gray-100 dark:border-gray-800 hover:bg-transparent">
 <TableHead className="h-14 pl-6 text-gray-500 font-semibold text-xs whitespace-nowrap">{t("col_patient", { defaultValue: 'Paciente' })}</TableHead>
 <TableHead className="h-14 text-center text-gray-500 font-semibold text-xs whitespace-nowrap">{t("col_status", { defaultValue: 'Estado' })}</TableHead>
 <TableHead className="h-14 text-center text-gray-500 font-semibold text-xs whitespace-nowrap">NOM-024</TableHead>
 <TableHead className="h-14 text-center text-gray-500 font-semibold text-xs whitespace-nowrap">{t("col_appointments", { defaultValue: 'Citas' })}</TableHead>
 <TableHead className="h-14 text-gray-500 font-semibold text-xs whitespace-nowrap">{t("col_last_visit", { defaultValue: 'Última Visita' })}</TableHead>
 <TableHead className="h-14 text-right pr-6 text-gray-500 font-semibold text-xs whitespace-nowrap">{t("col_actions", { defaultValue: 'Acción' })}</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody className="divide-y divide-gray-50 dark:divide-gray-800/50">
 {filteredClients.map((client) => (
 <TableRow 
 key={client.id} 
 onClick={() => setSelectedPatient(client)}
 className="hover:bg-gray-50 dark:hover:bg-[#0a0a0a] border-b-gray-100 dark:border-b-gray-800 transition-colors duration-200 cursor-pointer group"
 >
 <TableCell className="pl-6 py-5">
 <div className="flex items-center gap-4">
 {/* Avatar */}
 <div className="w-12 h-12 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
 {client.consumer.profileImageUrl ? (
 <img src={client.consumer.profileImageUrl} alt="avatar" className="w-full h-full object-cover" />
 ) : (
 <span className="text-lg font-bold text-gray-700 dark:text-gray-300">
 {client.consumer.name.charAt(0)}
 </span>
 )}
 </div>
 <div className="flex flex-col min-w-0">
 <span className="font-bold text-sm text-gray-900 dark:text-white truncate">
 {client.consumer.name}
 </span>
 <span className="text-xs text-gray-500 truncate mt-0.5">
 {client.consumer.email}
 </span>
 </div>
 </div>
 </TableCell>
 <TableCell className="text-center py-5">
 <span className={cn(
 "inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold border rounded-lg whitespace-nowrap",
 client.status === 'active' 
 ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-400'
 : 'border-gray-200 bg-gray-50 text-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400'
 )}>
 <span className={cn("w-1.5 h-1.5 rounded-full", client.status === 'active' ? "bg-emerald-500" : "bg-gray-500")} />
 {client.status === 'active' ? t("status_active", { defaultValue: 'Activo' }) : t("status_inactive", { defaultValue: 'Inactivo' })}
 </span>
 </TableCell>
 <TableCell className="text-center py-5">
 <div className="flex flex-col items-center justify-center gap-1.5">
 <div className="w-16 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
 <div 
 className={cn(
 "h-full rounded-full transition-all duration-500",
 (client.consumer.nom024CompliancePercentage || 0) >= 100 ? "bg-emerald-500" :
 (client.consumer.nom024CompliancePercentage || 0) >= 50 ? "bg-yellow-500" : "bg-red-500"
 )}
 style={{ width: `${client.consumer.nom024CompliancePercentage || 0}%` }}
 />
 </div>
 <span className="text-xs font-medium text-gray-500">
 {Math.round(client.consumer.nom024CompliancePercentage || 0)}%
 </span>
 </div>
 </TableCell>
 <TableCell className="text-center py-5">
 <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-50 dark:bg-[#111] text-gray-700 dark:text-gray-300 font-semibold text-sm">
 {client.totalAppointments}
 </span>
 </TableCell>
 <TableCell className="py-5">
 <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
 <Calendar className="w-4 h-4 text-gray-400" strokeWidth={2} />
 {format(new Date(client.lastAppointmentDate), "PP", { locale: es })}
 </div>
 </TableCell>
 <TableCell className="text-right pr-6 py-5">
 <DropdownMenu>
 <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
 <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-[#111] transition-colors ml-auto">
 <MoreHorizontal className="h-4 w-4 text-gray-500" strokeWidth={2} />
 </button>
 </DropdownMenuTrigger>
 <DropdownMenuContent align="end" className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl w-48 p-1">
 <DropdownMenuItem
 onClick={(e) => {
 e.stopPropagation();
 router.push(`/provider/dashboard/patients/${client.id}`);
 }}
 className="text-sm font-medium focus:bg-gray-50 dark:focus:bg-[#111] cursor-pointer rounded-xl py-2.5"
 >
 <Activity className="w-4 h-4 mr-2" strokeWidth={2} /> {t("view_full_record", { defaultValue: 'Ver Expediente' })}
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
 className="text-sm font-medium focus:bg-gray-50 dark:focus:bg-[#111] cursor-pointer rounded-xl py-2.5"
 >
 <Edit className="w-4 h-4 mr-2" strokeWidth={2} /> {t("edit_contact", { defaultValue: 'Editar Perfil' })}
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
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 className="flex flex-col items-center justify-center py-24 text-center border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] rounded-3xl shadow-sm"
 >
 <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-[#050505] flex items-center justify-center mb-6">
 <Users className="w-6 h-6 text-emerald-600" strokeWidth={2} />
 </div>
 <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
 {t("empty_title", { defaultValue: 'Directorio Vacío' })}
 </h3>
 <p className="text-sm text-gray-500 max-w-xs mx-auto leading-relaxed">
 {searchTerm ? t("empty_search", { defaultValue: 'No se encontraron pacientes.' }) : t("empty_list", { defaultValue: 'Aún no hay pacientes registrados en el sistema.' })}
 </p>
 </motion.div>
 )}
 </AnimatePresence>
 </div>

 {/* --- PATIENT DRAWER (FICHA TÉCNICA) --- */}
 <Sheet open={!!selectedPatient} onOpenChange={(open) => !open && setSelectedPatient(null)}>
 <SheetContent className="bg-white dark:bg-[#0a0a0a] border-l border-gray-100 dark:border-gray-800 sm:max-w-md w-full p-0 shadow-2xl flex flex-col transition-colors">
 {selectedPatient && (
 <div className="h-full flex flex-col">
 
 {/* Header Drawer */}
 <div className="p-6 md:p-8 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shrink-0">
 <SheetTitle className="text-lg font-bold text-gray-900 dark:text-white mb-1">
 {t('sheet_title', { defaultValue: 'Ficha de Identificación' })}
 </SheetTitle>
 <SheetDescription className="text-sm text-gray-500">
 {t('sheet_desc', { defaultValue: 'Resumen del paciente' })}
 </SheetDescription>
 </div>

 {/* Contenido Drawer */}
 <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col bg-gray-50/50 dark:bg-[#050505]/50">
 
 {/* Info Principal */}
 <div className="p-6 md:p-8 flex flex-col items-center text-center">
 <div className="w-24 h-24 rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] flex items-center justify-center mb-6 overflow-hidden shadow-sm">
 {selectedPatient.consumer.profileImageUrl ? (
 <img src={selectedPatient.consumer.profileImageUrl} alt="avatar" className="w-full h-full object-cover" />
 ) : (
 <span className="text-3xl font-bold text-gray-700 dark:text-gray-300">
 {selectedPatient.consumer.name.charAt(0)}
 </span>
 )}
 </div>
 <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
 {selectedPatient.consumer.name}
 </h2>
 <p className="text-xs font-semibold text-gray-500 bg-gray-100 dark:bg-gray-800 rounded-xl px-3 py-1.5">
 {t('patient_id', { defaultValue: 'ID REF' })}: #{selectedPatient.consumer.id}
 </p>
 </div>

 {/* Contacto */}
 <div className="mx-6 md:mx-8 bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm mb-6">
 <div className="px-6 py-4 bg-gray-50/50 dark:bg-[#050505]/50 border-b border-gray-100 dark:border-gray-800">
 <h3 className="text-xs font-semibold text-gray-500">
 {t('contact_info', { defaultValue: 'Información de Contacto' })}
 </h3>
 </div>
 <div className="flex flex-col">
 <div className="flex items-center gap-4 p-5 border-b border-gray-50 dark:border-gray-800/50">
 <Mail className="w-4 h-4 text-emerald-600" strokeWidth={2} />
 <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
 {selectedPatient.consumer.email}
 </span>
 </div>
 <div className="flex items-center gap-4 p-5">
 <Phone className="w-4 h-4 text-emerald-600" strokeWidth={2} />
 <span className="text-sm font-medium text-gray-900 dark:text-white">
 {selectedPatient.consumer.phone || 'No registrado'}
 </span>
 </div>
 </div>
 </div>

 {/* Actividad */}
 <div className="mx-6 md:mx-8 bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm mb-8">
 <div className="px-6 py-4 bg-gray-50/50 dark:bg-[#050505]/50 border-b border-gray-100 dark:border-gray-800">
 <h3 className="text-xs font-semibold text-gray-500">
 {t('activity_summary', { defaultValue: 'Resumen Operativo' })}
 </h3>
 </div>
 <div className="grid grid-cols-2 divide-x divide-gray-50 dark:divide-gray-800/50">
 <div className="p-5 flex flex-col items-start justify-center">
 <Activity className="w-4 h-4 text-emerald-600 mb-2" strokeWidth={2} />
 <p className="text-xs font-medium text-gray-500 mb-1">
 {t('total_visits', { defaultValue: 'Visitas' })}
 </p>
 <p className="text-xl font-bold text-gray-900 dark:text-white">
 {selectedPatient.totalAppointments}
 </p>
 </div>
 <div className="p-5 flex flex-col items-start justify-center">
 <Calendar className="w-4 h-4 text-emerald-600 mb-2" strokeWidth={2} />
 <p className="text-xs font-medium text-gray-500 mb-1">
 {t('last_visit', { defaultValue: 'Última' })}
 </p>
 <p className="text-sm font-bold text-gray-900 dark:text-white">
 {format(new Date(selectedPatient.lastAppointmentDate), "d MMM yy", { locale: es })}
 </p>
 </div>
 </div>
 </div>
 </div>

 {/* Footer Drawer */}
 <div className="p-6 md:p-8 bg-white dark:bg-[#0a0a0a] border-t border-gray-100 dark:border-gray-800 shrink-0">
 <button
 onClick={() => router.push(`/provider/dashboard/patients/${selectedPatient.id}`)}
 className="w-full h-12 bg-emerald-600 text-white hover:bg-emerald-700 flex items-center justify-center gap-3 text-sm font-semibold transition-colors rounded-xl shadow-sm border-0"
 >
 {t('view_medical_record', { defaultValue: 'Acceder al Expediente' })}
 <ArrowRight className="w-4 h-4" strokeWidth={2} />
 </button>
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