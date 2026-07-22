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
  <div className="min-h-screen bg-gray-50 dark:bg-[#050505] font-sans selection:bg-emerald-100 dark:selection:bg-emerald-900/30 transition-colors duration-300 pb-32">
  <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-12 space-y-10">

  {/* --- HEADER --- */}
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white dark:bg-[#0a0a0a] p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
  <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6">
  <div 
  className="relative group cursor-pointer w-24 h-24 rounded-full border-4 border-emerald-50 dark:border-emerald-900/20 bg-gray-100 dark:bg-gray-900 flex items-center justify-center shrink-0 overflow-hidden shadow-sm"
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
  <Loader2 className="w-8 h-8 animate-spin text-emerald-600 dark:text-emerald-400" />
  ) : profile?.profilePictureUrl ? (
  <img src={profile.profilePictureUrl} alt="Profile" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
  ) : (
  <User className="w-10 h-10 text-gray-400 group-hover:scale-105 transition-transform duration-300" strokeWidth={1.5} />
  )}
  
  {!isUploadingPicture && (
  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm">
  <span className="text-xs font-bold text-white text-center px-2">Actualizar foto</span>
  </div>
  )}
  </div>
  <div className="mt-2">
  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
  Identidad y Perfil Base
  </h1>
  <p className="text-sm font-medium text-gray-500">
  Mantenimiento de información biométrica y demográfica.
  </p>
  </div>
  </div>
  </div>

 {/* --- FORMULARIOS --- */}
 <Form {...form}>
 <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">

  {/* Sección 1: Datos Personales */}
  <div className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-sm overflow-hidden">
  <div className="bg-gray-50/50 dark:bg-[#050505] p-6 border-b border-gray-100 dark:border-gray-800 flex items-center gap-4">
  <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center shrink-0">
  <User className="w-5 h-5 text-teal-600 dark:text-teal-400" />
  </div>
  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
  Identidad Civil
  </h2>
  </div>
  
  <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
  <FormField control={form.control} name="fullName" render={({ field }: { field: ControllerRenderProps<PatientProfileValues, 'fullName'> }) => (
  <FormItem>
  <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">
  Nombre Completo
  </FormLabel>
  <FormControl>
  <Input {...field} className="h-12 rounded-xl bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-sm focus-visible:ring-emerald-500 focus-visible:border-emerald-500 transition-colors shadow-sm" />
  </FormControl>
  <FormMessage className="text-xs font-medium text-red-500" />
  </FormItem>
  )} />

  <FormField control={form.control} name="email" render={({ field }: { field: ControllerRenderProps<PatientProfileValues, 'email'> }) => (
  <FormItem>
  <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">
  Correo Electrónico
  </FormLabel>
  <FormControl>
  <div className="relative">
  <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
  <Input type="email" {...field} className="h-12 pl-11 rounded-xl bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-sm focus-visible:ring-emerald-500 focus-visible:border-emerald-500 transition-colors shadow-sm" />
  </div>
  </FormControl>
  <FormMessage className="text-xs font-medium text-red-500" />
  </FormItem>
  )} />

  <FormField control={form.control} name="phone" render={({ field }: { field: ControllerRenderProps<PatientProfileValues, 'phone'> }) => (
  <FormItem className="md:col-span-2">
  <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">
  Terminal Móvil (Contacto Primario)
  </FormLabel>
  <FormControl>
  <div className="relative">
  <Phone className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
  <Input {...field} className="h-12 pl-11 rounded-xl bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-sm focus-visible:ring-emerald-500 focus-visible:border-emerald-500 transition-colors shadow-sm" />
  </div>
  </FormControl>
  <FormMessage className="text-xs font-medium text-red-500" />
  </FormItem>
  )} />
  </div>
  </div>

  {/* Sección 2: Perfil Médico Básico */}
  <div className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-sm overflow-hidden">
  <div className="bg-gray-50/50 dark:bg-[#050505] p-6 border-b border-gray-100 dark:border-gray-800 flex items-center gap-4">
  <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center shrink-0">
  <HeartPulse className="w-5 h-5 text-rose-500" />
  </div>
  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
  Perfil Clínico Base
  </h2>
  </div>
  
  <div className="p-8 space-y-8">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
  <FormField control={form.control} name="bloodType" render={({ field }: { field: ControllerRenderProps<PatientProfileValues, 'bloodType'> }) => (
  <FormItem>
  <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">
  Tipificación Sanguínea
  </FormLabel>
  <Select onValueChange={field.onChange} value={field.value}>
  <FormControl>
  <SelectTrigger className="h-12 rounded-xl bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-sm focus:ring-emerald-500 focus:border-emerald-500 transition-colors shadow-sm">
  <SelectValue placeholder="Seleccionar Parámetro" />
  </SelectTrigger>
  </FormControl>
  <SelectContent className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]">
  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "INDETERMINADO"].map(bt => (
  <SelectItem key={bt} value={bt} className="text-sm font-medium focus:bg-gray-100 dark:focus:bg-gray-900 cursor-pointer">
  {bt}
  </SelectItem>
  ))}
  </SelectContent>
  </Select>
  <FormMessage className="text-xs font-medium text-red-500" />
  </FormItem>
  )} />

  <FormField control={form.control} name="biologicalSex" render={({ field }: { field: ControllerRenderProps<PatientProfileValues, 'biologicalSex'> }) => (
  <FormItem>
  <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">
  Sexo Biológico
  </FormLabel>
  <Select onValueChange={field.onChange} value={field.value}>
  <FormControl>
  <SelectTrigger className="h-12 rounded-xl bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-sm focus:ring-emerald-500 focus:border-emerald-500 transition-colors shadow-sm">
  <SelectValue placeholder="Seleccionar Parámetro" />
  </SelectTrigger>
  </FormControl>
  <SelectContent className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]">
  {["MALE", "FEMALE"].map(sex => (
  <SelectItem key={sex} value={sex} className="text-sm font-medium focus:bg-gray-100 dark:focus:bg-gray-900 cursor-pointer">
  {sex === "MALE" ? "MASCULINO" : "FEMENINO"}
  </SelectItem>
  ))}
  </SelectContent>
  </Select>
  <FormMessage className="text-xs font-medium text-red-500" />
  </FormItem>
  )} />
  </div>

  <FormField control={form.control} name="allergies" render={({ field }: { field: ControllerRenderProps<PatientProfileValues, 'allergies'> }) => (
  <FormItem>
  <FormLabel className="text-sm font-bold text-amber-600 dark:text-amber-500 flex items-center gap-2">
  Hipersensibilidades / Alergias <AlertTriangle className="w-4 h-4" />
  </FormLabel>
  <FormControl>
  <Textarea {...field} placeholder="Ej. Penicilina (Dejar en blanco si es negativo)" className="min-h-[120px] resize-none rounded-xl bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-sm focus-visible:ring-amber-500 focus-visible:border-amber-500 transition-colors shadow-sm" />
  </FormControl>
  <FormMessage className="text-xs font-medium text-red-500" />
  </FormItem>
  )} />

  <FormField control={form.control} name="currentMedications" render={({ field }: { field: ControllerRenderProps<PatientProfileValues, 'currentMedications'> }) => (
  <FormItem>
  <FormLabel className="text-sm font-semibold text-gray-700 dark:text-gray-300">
  Medicación Consolidada
  </FormLabel>
  <FormControl>
  <Textarea {...field} placeholder="Reporte de sustancias activas en uso..." className="min-h-[120px] resize-none rounded-xl bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-sm focus-visible:ring-emerald-500 focus-visible:border-emerald-500 transition-colors shadow-sm" />
  </FormControl>
  <FormMessage className="text-xs font-medium text-red-500" />
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
  className="fixed bottom-6 left-0 right-0 z-50 px-4 md:px-0"
  >
  <div className="max-w-4xl mx-auto bg-white dark:bg-[#0a0a0a] rounded-3xl shadow-xl border border-gray-200 dark:border-gray-800 p-4 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
  <div className="flex items-center gap-4">
  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
  <AlertTriangle className="w-6 h-6" />
  </div>
  <div>
  <p className="text-sm font-bold text-gray-900 dark:text-white">
  Modificaciones sin Sincronizar
  </p>
  <p className="text-xs font-medium text-gray-500">
  Confirma los cambios para actualizar tu expediente.
  </p>
  </div>
  </div>
  
  <div className="flex items-center gap-3 w-full sm:w-auto">
  <Button
  type="button"
  variant="outline"
  disabled={isSaving}
  className="rounded-xl border-gray-200 dark:border-gray-800 hover:bg-gray-100 h-12 px-6 text-sm font-semibold transition-colors flex-1 sm:flex-none shadow-sm"
  onClick={() => form.reset()}
  >
  <RotateCcw className="w-4 h-4 mr-2" /> Revertir
  </Button>
  
  <Button
  type="submit"
  disabled={isSaving}
  className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 h-12 px-8 text-sm font-bold transition-colors border-0 flex-1 sm:flex-none shadow-sm disabled:opacity-50"
  >
  {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
  {isSaving ? "Guardando..." : "Confirmar Cambios"}
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
  <div>
    <PatientBackgroundPanel consumerId={user.id} />
  </div>
 )}

 {/* --- SECCIÓN DE FICHAS CLÍNICAS (PLANTILLAS) --- */}
 {user?.id && (
  <div className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-sm overflow-hidden">
  <div className="bg-gray-50/50 dark:bg-[#050505] p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
  <div className="flex items-center gap-4">
  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
  <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
  </div>
  <div>
  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Fichas y Evaluaciones Clínicas</h2>
  <p className="text-xs font-medium text-gray-500 mt-1">
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