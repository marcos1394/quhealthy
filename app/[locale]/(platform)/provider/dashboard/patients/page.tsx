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
 <QhSpinner size="lg" className="text-black dark:text-white" />
 <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 animate-pulse mt-6">
 {t("loading", { defaultValue: 'SINCRONIZANDO DIRECTORIO...' })}
 </p>
 </div>
 );
 }

 return (
 <div className="min-h-screen bg-gray-50 dark:bg-[#050505] p-4 md:p-8 transition-colors duration-500 font-sans selection:bg-gray-200 dark:selection:bg-white/20">
 <div className="space-y-8 max-w-7xl mx-auto">
 
 {/* --- HEADER ARQUITECTÓNICO --- */}
 <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-black/20 dark:border-white/20">
 <div className="flex items-start gap-5">
 <div className="w-16 h-16 border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] flex items-center justify-center shrink-0">
 <Users className="w-6 h-6 text-black dark:text-white" strokeWidth={1.5} />
 </div>
 <div>
 <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">
 Base de Datos
 </p>
 <h1 className="text-2xl md:text-3xl font-semibold uppercase tracking-tight text-black dark:text-white mb-2 leading-none">
 {t("title", { defaultValue: 'DIRECTORIO DE PACIENTES' })}
 </h1>
 <div className="flex flex-wrap items-center gap-3">
 <span className="border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-black dark:text-white">
 {clients.length} {t("total_patients", { defaultValue: 'REGISTRADOS' })}
 </span>
 <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
 {t("subtitle_populated", { defaultValue: 'CONTROL Y GESTIÓN DE EXPEDIENTES.' })}
 </p>
 </div>
 </div>
 </div>
 <button
 onClick={() => setIsNewPatientModalOpen(true)}
 className="w-full md:w-auto h-12 px-6 bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-colors rounded-none border-0"
 >
 <UserPlus className="w-4 h-4" strokeWidth={1.5} />
 {t("new_patient", { defaultValue: 'NUEVO REGISTRO' })}
 </button>
 </div>

 {/* --- FILTROS Y BÚSQUEDA --- */}
 <div className="flex flex-col md:flex-row gap-0 border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a]">
 <div className="flex-1 relative border-b md:border-b-0 md:border-r border-black/20 dark:border-white/20">
 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={1.5} />
 <input
 placeholder={t("search_placeholder", { defaultValue: 'BUSCAR POR NOMBRE O CORREO...' })}
 className="w-full h-12 pl-12 pr-4 bg-transparent border-0 text-[10px] font-bold uppercase tracking-widest text-black dark:text-white focus:ring-0 focus:outline-none placeholder:text-gray-400"
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 />
 </div>
 <button className="h-12 px-8 flex items-center justify-center gap-2 bg-transparent hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors text-[9px] font-bold uppercase tracking-widest text-black dark:text-white shrink-0">
 <Filter className="w-3.5 h-3.5" strokeWidth={1.5} />
 {t("more_filters", { defaultValue: 'FILTROS' })}
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
 className="bg-white dark:bg-[#0a0a0a] border border-black/20 dark:border-white/20 flex flex-col transition-colors rounded-none overflow-hidden"
 >
 <Table>
 <TableHeader className="bg-gray-50 dark:bg-[#050505]">
 <TableRow className="border-b border-black/10 dark:border-white/10 hover:bg-transparent">
 <TableHead className="h-14 pl-6 text-gray-500 font-bold text-[9px] uppercase tracking-widest whitespace-nowrap">{t("col_patient", { defaultValue: 'PACIENTE' })}</TableHead>
 <TableHead className="h-14 text-center text-gray-500 font-bold text-[9px] uppercase tracking-widest whitespace-nowrap">{t("col_status", { defaultValue: 'ESTADO' })}</TableHead>
 <TableHead className="h-14 text-center text-gray-500 font-bold text-[9px] uppercase tracking-widest whitespace-nowrap">{t("col_appointments", { defaultValue: 'CITAS' })}</TableHead>
 <TableHead className="h-14 text-gray-500 font-bold text-[9px] uppercase tracking-widest whitespace-nowrap">{t("col_last_visit", { defaultValue: 'ÚLTIMA VISITA' })}</TableHead>
 <TableHead className="h-14 text-right pr-6 text-gray-500 font-bold text-[9px] uppercase tracking-widest whitespace-nowrap">{t("col_actions", { defaultValue: 'ACCIÓN' })}</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody className="divide-y divide-black/10 dark:divide-white/10">
 {filteredClients.map((client) => (
 <TableRow 
 key={client.id} 
 onClick={() => setSelectedPatient(client)}
 className="hover:bg-black hover:border-black dark:hover:bg-white dark:hover:border-white transition-all duration-300 cursor-pointer group hover:-translate-y-1 hover:shadow-[8px_8px_0_0_rgba(0,0,0,0.1)] dark:hover:shadow-[8px_8px_0_0_rgba(255,255,255,0.1)] relative hover:z-10"
 >
 <TableCell className="pl-6 py-5">
 <div className="flex items-center gap-4">
 {/* Avatar Cuadrado Técnico */}
 <div className="w-10 h-10 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] flex items-center justify-center overflow-hidden shrink-0">
 {client.consumer.profileImageUrl ? (
 <img src={client.consumer.profileImageUrl} alt="avatar" className="w-full h-full object-cover" />
 ) : (
 <span className="text-xs font-bold text-black dark:text-white uppercase">
 {client.consumer.name.charAt(0)}
 </span>
 )}
 </div>
 <div className="flex flex-col min-w-0">
 <span className="font-semibold text-sm text-black dark:text-white uppercase tracking-widest truncate group-hover:text-white dark:group-hover:text-black transition-colors">
 {client.consumer.name}
 </span>
 <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest truncate mt-1 group-hover:text-gray-300 dark:group-hover:text-gray-600 transition-colors">
 {client.consumer.email}
 </span>
 </div>
 </div>
 </TableCell>
 <TableCell className="text-center py-5">
 <span className={cn(
 "inline-flex items-center gap-1.5 px-2 py-1 text-[9px] font-bold uppercase tracking-widest border rounded-none whitespace-nowrap",
 client.status === 'active' 
 ? 'border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/10 dark:text-emerald-400'
 : 'border-gray-500/30 bg-gray-50 text-gray-600 dark:bg-[#111] dark:text-gray-400'
 )}>
 <span className={cn("w-1.5 h-1.5", client.status === 'active' ? "bg-emerald-500" : "bg-gray-500")} />
 {client.status === 'active' ? t("status_active", { defaultValue: 'ACTIVO' }) : t("status_inactive", { defaultValue: 'INACTIVO' })}
 </span>
 </TableCell>
 <TableCell className="text-center py-5">
 <span className="inline-flex items-center justify-center w-8 h-8 border border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0a] text-black dark:text-white font-bold text-xs group-hover:bg-transparent group-hover:text-white dark:group-hover:bg-transparent dark:group-hover:text-black group-hover:border-white/30 dark:group-hover:border-black/30 transition-colors">
 {client.totalAppointments}
 </span>
 </TableCell>
 <TableCell className="py-5">
 <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-black dark:text-white group-hover:text-white dark:group-hover:text-black transition-colors">
 <Calendar className="w-3.5 h-3.5 text-gray-400 group-hover:text-white dark:group-hover:text-black transition-colors" strokeWidth={1.5} />
 {format(new Date(client.lastAppointmentDate), "PP", { locale: es })}
 </div>
 </TableCell>
 <TableCell className="text-right pr-6 py-5">
 <DropdownMenu>
 <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
 <button className="w-8 h-8 flex items-center justify-center border border-transparent hover:border-black/20 dark:hover:border-white/20 bg-transparent hover:bg-white dark:hover:bg-[#0a0a0a] transition-colors ml-auto">
 <MoreHorizontal className="h-4 w-4 text-gray-500 group-hover:text-white dark:group-hover:text-black hover:text-white dark:hover:text-black transition-colors" strokeWidth={1.5} />
 </button>
 </DropdownMenuTrigger>
 <DropdownMenuContent align="end" className="bg-white dark:bg-[#0a0a0a] border border-black dark:border-white rounded-none shadow-2xl">
 <DropdownMenuItem
 onClick={(e) => {
 e.stopPropagation();
 router.push(`/provider/dashboard/patients/${client.id}`);
 }}
 className="text-[9px] font-bold uppercase tracking-widest focus:bg-black focus:text-white dark:focus:bg-white dark:focus:text-black cursor-pointer rounded-none"
 >
 <Activity className="w-3.5 h-3.5 mr-2" strokeWidth={1.5} /> {t("view_full_record", { defaultValue: 'VER EXPEDIENTE' })}
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
 className="text-[9px] font-bold uppercase tracking-widest focus:bg-black focus:text-white dark:focus:bg-white dark:focus:text-black cursor-pointer rounded-none"
 >
 <Edit className="w-3.5 h-3.5 mr-2" strokeWidth={1.5} /> {t("edit_contact", { defaultValue: 'EDITAR PERFIL' })}
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
 className="flex flex-col items-center justify-center py-24 text-center border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a]"
 >
 <div className="w-16 h-16 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] flex items-center justify-center mb-6">
 <Users className="w-6 h-6 text-gray-400" strokeWidth={1.5} />
 </div>
 <h3 className="text-sm font-semibold text-black dark:text-white uppercase tracking-tight mb-2">
 {t("empty_title", { defaultValue: 'DIRECTORIO VACÍO' })}
 </h3>
 <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 max-w-xs mx-auto leading-relaxed">
 {searchTerm ? t("empty_search", { defaultValue: 'NO SE ENCONTRARON PACIENTES.' }) : t("empty_list", { defaultValue: 'AÚN NO HAY PACIENTES REGISTRADOS EN EL SISTEMA.' })}
 </p>
 </motion.div>
 )}
 </AnimatePresence>
 </div>

 {/* --- PATIENT DRAWER (FICHA TÉCNICA) --- */}
 <Sheet open={!!selectedPatient} onOpenChange={(open) => !open && setSelectedPatient(null)}>
 <SheetContent className="bg-white dark:bg-[#0a0a0a] border-l border-black dark:border-white sm:max-w-md w-full p-0 shadow-2xl flex flex-col rounded-none transition-colors">
 {selectedPatient && (
 <div className="h-full flex flex-col">
 
 {/* Header Drawer */}
 <div className="p-6 md:p-8 border-b border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] shrink-0">
 <SheetTitle className="text-sm font-semibold uppercase tracking-widest text-black dark:text-white mb-1">
 {t('sheet_title', { defaultValue: 'FICHA DE IDENTIFICACIÓN' })}
 </SheetTitle>
 <SheetDescription className="text-[9px] font-bold uppercase tracking-widest text-gray-500">
 {t('sheet_desc', { defaultValue: 'RESUMEN DEL PACIENTE' })}
 </SheetDescription>
 </div>

 {/* Contenido Drawer */}
 <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col bg-white dark:bg-[#0a0a0a]">
 
 {/* Info Principal */}
 <div className="p-6 md:p-8 flex flex-col items-center text-center border-b border-black/10 dark:border-white/10">
 <div className="w-24 h-24 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] flex items-center justify-center mb-6 overflow-hidden">
 {selectedPatient.consumer.profileImageUrl ? (
 <img src={selectedPatient.consumer.profileImageUrl} alt="avatar" className="w-full h-full object-cover" />
 ) : (
 <span className="text-3xl font-semibold uppercase text-black dark:text-white">
 {selectedPatient.consumer.name.charAt(0)}
 </span>
 )}
 </div>
 <h2 className="text-xl font-semibold uppercase tracking-tight text-black dark:text-white mb-2">
 {selectedPatient.consumer.name}
 </h2>
 <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 border border-black/10 dark:border-white/10 bg-gray-50 dark:bg-[#050505] px-2 py-1">
 {t('patient_id', { defaultValue: 'ID REF' })}: #{selectedPatient.consumer.id}
 </p>
 </div>

 {/* Contacto */}
 <div className="border-b border-black/10 dark:border-white/10">
 <div className="px-6 md:px-8 py-4 bg-gray-50 dark:bg-[#050505] border-b border-black/10 dark:border-white/10">
 <h3 className="text-[9px] font-bold uppercase tracking-widest text-gray-500">
 {t('contact_info', { defaultValue: 'INFORMACIÓN DE CONTACTO' })}
 </h3>
 </div>
 <div className="grid grid-cols-1 gap-0">
 <div className="flex items-center gap-4 p-6 border-b border-black/10 dark:border-white/10">
 <Mail className="w-4 h-4 text-gray-400" strokeWidth={1.5} />
 <span className="text-xs font-semibold uppercase tracking-widest text-black dark:text-white truncate">
 {selectedPatient.consumer.email}
 </span>
 </div>
 <div className="flex items-center gap-4 p-6">
 <Phone className="w-4 h-4 text-gray-400" strokeWidth={1.5} />
 <span className="text-xs font-semibold uppercase tracking-widest text-black dark:text-white">
 {selectedPatient.consumer.phone || 'NO REGISTRADO'}
 </span>
 </div>
 </div>
 </div>

 {/* Actividad */}
 <div>
 <div className="px-6 md:px-8 py-4 bg-gray-50 dark:bg-[#050505] border-b border-black/10 dark:border-white/10">
 <h3 className="text-[9px] font-bold uppercase tracking-widest text-gray-500">
 {t('activity_summary', { defaultValue: 'RESUMEN OPERATIVO' })}
 </h3>
 </div>
 <div className="grid grid-cols-2 gap-0 border-b border-black/10 dark:border-white/10">
 <div className="p-6 border-r border-black/10 dark:border-white/10 flex flex-col items-start justify-center">
 <Activity className="w-4 h-4 text-gray-400 mb-3" strokeWidth={1.5} />
 <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-1">
 {t('total_visits', { defaultValue: 'VISITAS TOTALES' })}
 </p>
 <p className="text-2xl font-semibold tracking-tight text-black dark:text-white">
 {selectedPatient.totalAppointments}
 </p>
 </div>
 <div className="p-6 flex flex-col items-start justify-center">
 <Calendar className="w-4 h-4 text-gray-400 mb-3" strokeWidth={1.5} />
 <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-1">
 {t('last_visit', { defaultValue: 'ÚLTIMA VISITA' })}
 </p>
 <p className="text-sm font-semibold uppercase tracking-widest text-black dark:text-white mt-1">
 {format(new Date(selectedPatient.lastAppointmentDate), "d MMM yyyy", { locale: es })}
 </p>
 </div>
 </div>
 </div>
 </div>

 {/* Footer Drawer */}
 <div className="p-6 md:p-8 bg-white dark:bg-[#0a0a0a] border-t border-black/20 dark:border-white/20 shrink-0">
 <button
 onClick={() => router.push(`/provider/dashboard/patients/${selectedPatient.id}`)}
 className="w-full h-14 bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 flex items-center justify-center gap-3 text-[10px] font-bold uppercase tracking-widest transition-colors rounded-none border-0"
 >
 {t('view_medical_record', { defaultValue: 'ACCEDER AL EXPEDIENTE' })}
 <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
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