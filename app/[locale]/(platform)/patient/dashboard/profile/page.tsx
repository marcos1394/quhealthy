"use client"
/* eslint-disable react-doctor/click-events-have-key-events */
/* eslint-disable react-doctor/zod-v4-prefer-top-level-string-formats */
/* eslint-disable react-doctor/no-giant-component */;

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { useForm, ControllerRenderProps } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import {
 User, Mail, Phone, Save, HeartPulse, AlertTriangle, Loader2, RotateCcw, Activity
} from 'lucide-react';

import { useSessionStore } from '@/stores/SessionStore';
import { useConsumerProfile } from '@/hooks/useConsumerProfile';
import { consumerProfileService } from '@/services/consumerProfile.service';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { handleApiError } from '@/lib/handleApiError';
import { cn } from '@/lib/utils';

import { ClinicalFormsHistory } from "@/components/consultation/ClinicalFormsHistory";
import { PatientBackgroundPanel } from "@/components/consultation/PatientBackgroundPanel";

// Esquema de Validación
const patientProfileSchema = z.object({
 fullName: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
 email: z.string().email("Correo electrónico inválido"),
 phone: z.string().min(10, "El teléfono debe tener al menos 10 dígitos"),
 bloodType: z.string().optional(),
 biologicalSex: z.string().optional(),
 allergies: z.string().optional(),
 currentMedications: z.string().optional(),
 emergencyContactName: z.string().min(3, "Nombre requerido").optional().or(z.literal('')),
 emergencyContactPhone: z.string().optional().or(z.literal('')),
});

type PatientProfileValues = z.infer<typeof patientProfileSchema>;

export default function PatientProfilePage() {
 const t = useTranslations('PatientProfile'); 
 const [isSaving, setIsSaving] = useState(false);
 const [isUploadingPicture, setIsUploadingPicture] = useState(false);
 const fileInputRef = React.useRef<HTMLInputElement>(null);

 // Hooks de Backend y Sesión
 const { user } = useSessionStore();
 const { profile, isLoading, fetchProfile, updateProfile } = useConsumerProfile();

 // Formulario
 const form = useForm<PatientProfileValues>({
 resolver: zodResolver(patientProfileSchema),
 defaultValues: {
 fullName: "",
 email: "",
 phone: "",
 bloodType: "",
 allergies: "",
 currentMedications: "",
 emergencyContactName: "",
 emergencyContactPhone: "",
 }
 });

 // Cargar Perfil
 React.useEffect(() => {
 fetchProfile();
 }, [fetchProfile]);

 // Rellenar formulario cuando el perfil carga
 React.useEffect(() => {
 if (!isLoading && profile) {
 form.reset({
 fullName: profile.fullName || (user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : ""),
 email: user?.email || "",
 phone: profile.phoneNumber || "",
 bloodType: profile.bloodType || "", 
 biologicalSex: profile.biologicalSex || "",
 allergies: profile.allergies?.map((a: any) => a?.name || a).join(', ') || "",
 currentMedications: profile.currentMedications?.join(', ') || "",
 emergencyContactName: profile.emergencyContactName || "",
 emergencyContactPhone: profile.emergencyContactPhone || "",
 });
 }
 }, [isLoading, profile, user, form]);

 // Detectar cambios sucios (dirty state)
 const isDirty = form.formState.isDirty;

 const onSubmit = async (data: PatientProfileValues) => {
 setIsSaving(true);
 try {
 const success = await updateProfile({
 ...profile,
 fullName: data.fullName,
 phoneNumber: data.phone,
 bloodType: data.bloodType || profile.bloodType || "",
 biologicalSex: data.biologicalSex || profile.biologicalSex || "",
 emergencyContactName: data.emergencyContactName || profile.emergencyContactName || "",
 emergencyContactPhone: data.emergencyContactPhone || profile.emergencyContactPhone || "",
 allergies: data.allergies ? data.allergies.split(',').flatMap(s => { const trimmed = s.trim(); return trimmed ? [{ name: trimmed }] : []; }) : [],
 currentMedications: data.currentMedications ? data.currentMedications.split(',').flatMap(s => { const trimmed = s.trim(); return trimmed ? [trimmed] : []; }) : [],
 });

 if (success) {
 toast.success("Expediente sincronizado con la base de datos central.");
 form.reset(data); // Resetea para limpiar isDirty
 }
 } catch (e) {
 handleApiError(e);
 } finally {
 setIsSaving(false);
 }
 };

 const handlePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
 const file = e.target.files?.[0];
 if (!file) return;

 setIsUploadingPicture(true);
 try {
 await consumerProfileService.uploadProfilePicture(file);
 toast.success("Foto de perfil actualizada.");
 await fetchProfile(); // Recargar el perfil para obtener la URL
 } catch (error) {
 handleApiError(error);
 } finally {
 setIsUploadingPicture(false);
 }
 };

 return (
 <div className="min-h-screen bg-white dark:bg-[#0a0a0a] font-sans selection:bg-gray-200 dark:selection:bg-white/20 transition-colors duration-300 pb-32">
 <div className="max-w-4xl mx-auto px-6 py-12 md:py-16 space-y-12">

 {/* --- HEADER --- */}
 <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-gray-200 dark:border-gray-800 pb-8">
 <div className="flex items-start gap-6">
 <div 
 className="relative group cursor-pointer w-20 h-20 border border-black dark:border-white bg-gray-50 dark:bg-[#050505] flex items-center justify-center shrink-0 overflow-hidden"
 onClick={() => fileInputRef.current?.click()}
 >
 <input 
 type="file" 
 className="hidden" 
 accept="image/*" 
 ref={fileInputRef} 
 onChange={handlePictureUpload}
 />
 {isUploadingPicture ? (
 <Loader2 className="w-6 h-6 animate-spin text-black dark:text-white" />
 ) : profile?.profilePictureUrl ? (
 <img src={profile.profilePictureUrl} alt="Profile" className="w-full h-full object-cover group-hover:opacity-50 transition-opacity duration-300" />
 ) : (
 <User className="w-8 h-8 text-black dark:text-white group-hover:opacity-0 transition-opacity duration-300" strokeWidth={1.5} />
 )}
 
 {!isUploadingPicture && (
 <div className="absolute inset-0 bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
 <span className="text-[9px] font-bold text-white uppercase tracking-widest text-center px-2">Cambiar Foto</span>
 </div>
 )}
 </div>
 <div>
 <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-white uppercase mb-2">
 Identidad y Perfil Base
 </h1>
 <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
 Mantenimiento de información biométrica y demográfica.
 </p>
 </div>
 </div>
 </div>

 {/* --- FORMULARIOS --- */}
 <Form {...form}>
 <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">

 {/* Sección 1: Datos Personales */}
 <div className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]">
 <div className="bg-gray-50 dark:bg-[#050505] p-6 border-b border-gray-200 dark:border-gray-800 flex items-center gap-4">
 <div className="w-8 h-8 border border-black dark:border-white flex items-center justify-center bg-white dark:bg-black shrink-0">
 <User className="w-4 h-4 text-black dark:text-white" strokeWidth={1.5} />
 </div>
 <h2 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
 Identidad Civil
 </h2>
 </div>
 
 <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
 <FormField control={form.control} name="fullName" render={({ field }: { field: ControllerRenderProps<PatientProfileValues, 'fullName'> }) => (
 <FormItem>
 <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
 Nombre Completo
 </FormLabel>
 <FormControl>
 <Input {...field} className="h-12 rounded-none bg-gray-50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 text-sm focus-visible:ring-0 focus-visible:border-black dark:focus-visible:border-white transition-colors" />
 </FormControl>
 <FormMessage className="text-[9px] font-bold uppercase tracking-widest text-red-500" />
 </FormItem>
 )} />

 <FormField control={form.control} name="email" render={({ field }: { field: ControllerRenderProps<PatientProfileValues, 'email'> }) => (
 <FormItem>
 <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
 Correo Electrónico
 </FormLabel>
 <FormControl>
 <div className="relative">
 <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" strokeWidth={1.5} />
 <Input type="email" {...field} className="h-12 pl-12 rounded-none bg-gray-50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 text-sm focus-visible:ring-0 focus-visible:border-black dark:focus-visible:border-white transition-colors" />
 </div>
 </FormControl>
 <FormMessage className="text-[9px] font-bold uppercase tracking-widest text-red-500" />
 </FormItem>
 )} />

 <FormField control={form.control} name="phone" render={({ field }: { field: ControllerRenderProps<PatientProfileValues, 'phone'> }) => (
 <FormItem className="md:col-span-2">
 <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
 Terminal Móvil (Contacto Primario)
 </FormLabel>
 <FormControl>
 <div className="relative">
 <Phone className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" strokeWidth={1.5} />
 <Input {...field} className="h-12 pl-12 rounded-none bg-gray-50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 text-sm focus-visible:ring-0 focus-visible:border-black dark:focus-visible:border-white transition-colors" />
 </div>
 </FormControl>
 <FormMessage className="text-[9px] font-bold uppercase tracking-widest text-red-500" />
 </FormItem>
 )} />
 </div>
 </div>

 {/* Sección 2: Perfil Médico Básico */}
 <div className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]">
 <div className="bg-gray-50 dark:bg-[#050505] p-6 border-b border-gray-200 dark:border-gray-800 flex items-center gap-4">
 <div className="w-8 h-8 border border-black dark:border-white flex items-center justify-center bg-white dark:bg-black shrink-0">
 <HeartPulse className="w-4 h-4 text-black dark:text-white" strokeWidth={1.5} />
 </div>
 <h2 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
 Perfil Clínico Base
 </h2>
 </div>
 
 <div className="p-8 space-y-8">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
 <FormField control={form.control} name="bloodType" render={({ field }: { field: ControllerRenderProps<PatientProfileValues, 'bloodType'> }) => (
 <FormItem>
 <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
 Tipificación Sanguínea
 </FormLabel>
 <Select onValueChange={field.onChange} value={field.value}>
 <FormControl>
 <SelectTrigger className="h-12 rounded-none bg-gray-50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 text-sm focus:ring-0 focus:border-black dark:focus:border-white transition-colors">
 <SelectValue placeholder="Seleccionar Parámetro" />
 </SelectTrigger>
 </FormControl>
 <SelectContent className="rounded-none border border-black dark:border-white bg-white dark:bg-[#0a0a0a]">
 {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "INDETERMINADO"].map(bt => (
 <SelectItem key={bt} value={bt} className="text-xs uppercase tracking-widest focus:bg-gray-100 dark:focus:bg-gray-900 cursor-pointer">
 {bt}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 <FormMessage className="text-[9px] font-bold uppercase tracking-widest text-red-500" />
 </FormItem>
 )} />

 <FormField control={form.control} name="biologicalSex" render={({ field }: { field: ControllerRenderProps<PatientProfileValues, 'biologicalSex'> }) => (
 <FormItem>
 <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
 Sexo Biológico
 </FormLabel>
 <Select onValueChange={field.onChange} value={field.value}>
 <FormControl>
 <SelectTrigger className="h-12 rounded-none bg-gray-50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 text-sm focus:ring-0 focus:border-black dark:focus:border-white transition-colors">
 <SelectValue placeholder="Seleccionar Parámetro" />
 </SelectTrigger>
 </FormControl>
 <SelectContent className="rounded-none border border-black dark:border-white bg-white dark:bg-[#0a0a0a]">
 {["MALE", "FEMALE"].map(sex => (
 <SelectItem key={sex} value={sex} className="text-xs uppercase tracking-widest focus:bg-gray-100 dark:focus:bg-gray-900 cursor-pointer">
 {sex === "MALE" ? "MASCULINO" : "FEMENINO"}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 <FormMessage className="text-[9px] font-bold uppercase tracking-widest text-red-500" />
 </FormItem>
 )} />
 </div>

 <FormField control={form.control} name="allergies" render={({ field }: { field: ControllerRenderProps<PatientProfileValues, 'allergies'> }) => (
 <FormItem>
 <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-500 flex items-center gap-2">
 Hipersensibilidades / Alergias <AlertTriangle className="w-3.5 h-3.5" strokeWidth={2} />
 </FormLabel>
 <FormControl>
 <Textarea {...field} placeholder="Ej. Penicilina (Dejar en blanco si es negativo)" className="min-h-[120px] resize-none rounded-none bg-gray-50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 text-sm focus-visible:ring-0 focus-visible:border-amber-500 transition-colors" />
 </FormControl>
 <FormMessage className="text-[9px] font-bold uppercase tracking-widest text-red-500" />
 </FormItem>
 )} />

 <FormField control={form.control} name="currentMedications" render={({ field }: { field: ControllerRenderProps<PatientProfileValues, 'currentMedications'> }) => (
 <FormItem>
 <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
 Medicación Consolidada
 </FormLabel>
 <FormControl>
 <Textarea {...field} placeholder="Reporte de sustancias activas en uso..." className="min-h-[120px] resize-none rounded-none bg-gray-50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 text-sm focus-visible:ring-0 focus-visible:border-black dark:focus-visible:border-white transition-colors" />
 </FormControl>
 <FormMessage className="text-[9px] font-bold uppercase tracking-widest text-red-500" />
 </FormItem>
 )} />
 </div>
 </div>

 {/* --- COMANDOS DE ACCIÓN (PANEL INFERIOR) --- */}
 <AnimatePresence>
 {isDirty && (
 <motion.div
 initial={{ opacity: 0, y: "100%" }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: "100%" }}
 transition={{ type: "spring", stiffness: 300, damping: 30 }}
 className="fixed bottom-0 left-0 w-full z-50 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
 >
 <div className="max-w-4xl mx-auto px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div className="flex items-center gap-4">
 <div className="w-10 h-10 border border-black dark:border-white bg-black text-white dark:bg-white dark:text-black flex items-center justify-center shrink-0">
 <AlertTriangle className="w-4 h-4" strokeWidth={2} />
 </div>
 <div>
 <p className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
 Modificaciones no Sincronizadas
 </p>
 <p className="text-[9px] font-light uppercase tracking-widest text-gray-500">
 Requiere confirmación para impactar la base de datos.
 </p>
 </div>
 </div>
 
 <div className="flex items-center gap-4 w-full sm:w-auto">
 <Button
 type="button"
 variant="outline"
 disabled={isSaving}
 className="rounded-none border border-black dark:border-white bg-transparent hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black h-12 px-6 text-[10px] font-bold uppercase tracking-widest transition-colors flex-1 sm:flex-none"
 onClick={() => form.reset()}
 >
 <RotateCcw className="w-3.5 h-3.5 mr-2" strokeWidth={1.5} /> Revertir
 </Button>
 
 <Button
 type="submit"
 disabled={isSaving}
 className="rounded-none bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 h-12 px-8 text-[10px] font-bold uppercase tracking-widest transition-colors border-0 flex-1 sm:flex-none disabled:opacity-50"
 >
 {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-3" strokeWidth={2} /> : <Save className="w-4 h-4 mr-3" strokeWidth={1.5} />}
 {isSaving ? "EJECUTANDO..." : "CONFIRMAR"}
 </Button>
 </div>
 </div>
 </motion.div>
 )}
 </AnimatePresence>

 </form>
 </Form>

 {/* --- SECCIÓN DE ANTECEDENTES NOM-004 --- */}
 {user?.id && (
 <div className="mt-12">
   <PatientBackgroundPanel consumerId={user.id} />
 </div>
 )}

 {/* --- SECCIÓN DE FICHAS CLÍNICAS (PLANTILLAS) --- */}
 {user?.id && (
 <div className="mt-12 border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] rounded-none">
 <div className="bg-gray-50 dark:bg-[#050505] p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
 <div className="flex items-center gap-4">
 <div className="w-8 h-8 border border-black dark:border-white flex items-center justify-center bg-white dark:bg-black">
 <Activity className="w-4 h-4 text-black dark:text-white" />
 </div>
 <div>
 <h2 className="text-sm font-bold uppercase tracking-widest text-black dark:text-white">Fichas y Evaluaciones Clínicas</h2>
 <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">
 Evaluaciones realizadas mediante plantillas dinámicas
 </p>
 </div>
 </div>
 </div>
 <div className="p-6">
 <ClinicalFormsHistory patientId={user.id} />
 </div>
 </div>
 )}

 </div>
 </div>
 );
}