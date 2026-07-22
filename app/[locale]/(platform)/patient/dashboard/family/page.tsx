"use client"
/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/no-gray-on-colored-background */
/* eslint-disable react-doctor/prefer-module-scope-pure-function */
/* eslint-disable react-doctor/no-giant-component */;

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import {
 Users, UserPlus, Baby, User, Trash2, CalendarIcon, Plus, X,
 Loader2, HeartPulse, Syringe, HeartHandshake, FolderHeart,
 Sparkles, RefreshCw, Activity
} from 'lucide-react';
import Link from 'next/link';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarUI } from "@/components/ui/calendar";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFamily } from '@/hooks/useFamily';
import { DependentRequest } from '@/types/dependent';
import { QhSpinner } from '@/components/ui/QhSpinner';
import { DependentVaccineAlert } from '@/components/family/DependentVaccineAlert';

export default function PatientFamilyDashboard() {
 const t = useTranslations('PatientFamilyDashboard');
 const { family, isLoading, isSubmitting, addMember, removeMember, refetch } = useFamily();
 const [showAddForm, setShowAddForm] = useState(false);

 const [formData, setFormData] = useState<DependentRequest>({
 firstName: '', lastName: '', dateOfBirth: '', gender: 'OTHER', relationship: 'CHILD', medicalNotes: ''
 });

 const resetForm = () => {
 setFormData({ firstName: '', lastName: '', dateOfBirth: '', gender: 'OTHER', relationship: 'CHILD', medicalNotes: '' });
 };

 const handleAddSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 await addMember(formData, () => {
 setShowAddForm(false);
 resetForm();
 });
 };

 const calculateAge = (dob: string) => {
 if (!dob) return 0;
 const diffMs = Date.now() - new Date(dob).getTime();
 const ageDt = new Date(diffMs);
 return Math.abs(ageDt.getUTCFullYear() - 1970);
 };

 const getRelationshipIcon = (rel: string) => {
 if (rel === 'CHILD') return <Baby className="h-5 w-5 text-black dark:text-white" strokeWidth={1.5} />;
 return <User className="h-5 w-5 text-black dark:text-white" strokeWidth={1.5} />;
 };

 const getTranslatedRelationship = (rel: string) => {
 switch (rel) {
 case 'CHILD': return t('rel_child') || 'Hijo/a';
 case 'PARENT': return t('rel_parent') || 'Padre/Madre';
 case 'SPOUSE': return t('rel_spouse') || 'Cónyuge';
 case 'SIBLING': return t('rel_sibling') || 'Hermano/a';
 default: return t('rel_other') || 'Otro';
 }
 };

 const childCount = family.filter(member => calculateAge(member.dateOfBirth) < 12).length;
 const elderCount = family.filter(member => calculateAge(member.dateOfBirth) >= 65).length;

 if (isLoading) {
 return (
 <div className="flex flex-col justify-center items-center min-h-[60vh] bg-white dark:bg-[#0a0a0a]">
 <QhSpinner size="lg" />
 <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-4 animate-pulse">
 Cargando perfiles familiares...
 </p>
 </div>
 );
 }

 return (
 <div className="min-h-screen bg-white dark:bg-[#0a0a0a] font-sans text-black dark:text-white selection:bg-gray-200 dark:selection:bg-white/20 transition-colors duration-300">
 <div className="max-w-6xl mx-auto px-6 py-12 md:py-16 space-y-12">
 
 {/* --- HEADER --- */}
 <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
  <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 border-b border-gray-100 dark:border-gray-800 pb-8">
  <div className="flex items-start gap-6">
  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 border border-indigo-100 dark:border-indigo-800/50 shadow-sm">
  <Users className="h-8 w-8" strokeWidth={1.5} />
  </div>
  <div className="max-w-2xl">
  <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 px-3 py-1 text-xs font-bold">
  <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
  Tu Red de Cuidado
  </div>
  <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">
  {t('title') || 'Mi Familia'}
  </h1>
  <p className="text-sm font-medium leading-relaxed text-gray-500">
  {t('subtitle') || 'Gestiona la salud, vacunas y cuidados de tus seres queridos en un solo lugar'}
  </p>
  </div>
  </div>

  <div className="flex flex-col sm:flex-row gap-4 shrink-0">
  <Button
  onClick={() => refetch()}
  disabled={isLoading}
  variant="outline"
  className="rounded-xl border-gray-200 dark:border-gray-700 h-12 px-6 text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-900 transition-all shadow-sm disabled:opacity-50"
  >
  <RefreshCw className="h-4 w-4 mr-2" strokeWidth={2} />
  Sincronizar
  </Button>
  {!showAddForm && (
  <Button
  onClick={() => setShowAddForm(true)}
  className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white h-12 px-6 text-sm font-bold transition-all shadow-sm border-0"
  >
  <UserPlus className="mr-3 h-4 w-4" strokeWidth={2} />
  {t('btn_add_member') || 'Añadir Familiar'}
  </Button>
  )}
  </div>
 </div>

 {/* --- ESTADÍSTICAS (SOFT HEALTH GRID) --- */}
  {family.length > 0 && (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
  <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-6 flex flex-col justify-between rounded-3xl shadow-sm transition-all hover:shadow-md">
  <div className="flex items-center justify-between gap-3 mb-6">
  <p className="text-xs font-bold text-gray-500">Total Miembros</p>
  <div className="h-10 w-10 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 flex items-center justify-center border border-indigo-100 dark:border-indigo-800/50">
  <Users className="h-5 w-5" strokeWidth={2} />
  </div>
  </div>
  <p className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">{family.length}</p>
  </div>
  <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-6 flex flex-col justify-between rounded-3xl shadow-sm transition-all hover:shadow-md">
  <div className="flex items-center justify-between gap-3 mb-6">
  <p className="text-xs font-bold text-gray-500">Niños (Vacunas)</p>
  <div className="h-10 w-10 rounded-2xl bg-amber-50 dark:bg-amber-900/20 text-amber-500 flex items-center justify-center border border-amber-100 dark:border-amber-800/50">
  <Syringe className="h-5 w-5" strokeWidth={2} />
  </div>
  </div>
  <p className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">{childCount}</p>
  </div>
  <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-6 flex flex-col justify-between rounded-3xl shadow-sm transition-all hover:shadow-md">
  <div className="flex items-center justify-between gap-3 mb-6">
  <p className="text-xs font-bold text-gray-500">Adultos Mayores</p>
  <div className="h-10 w-10 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 flex items-center justify-center border border-emerald-100 dark:border-emerald-800/50">
  <HeartHandshake className="h-5 w-5" strokeWidth={2} />
  </div>
  </div>
  <p className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">{elderCount}</p>
  </div>
  </div>
  )}
 </motion.div>

 {/* --- FORMULARIO DE REGISTRO --- */}
 <AnimatePresence>
 {showAddForm && (
 <motion.div
 initial={{ opacity: 0, height: 0 }}
 animate={{ opacity: 1, height: 'auto' }}
 exit={{ opacity: 0, height: 0 }}
 className="overflow-hidden"
 >
  <div className="border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] mb-8 rounded-3xl shadow-sm">
  <div className="flex items-start justify-between gap-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/10 p-6 md:p-8 rounded-t-3xl">
  <div>
  <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">
  {t('form_title') || 'Agregar Familiar'}
  </h2>
  <p className="text-sm font-medium text-gray-500">
  Ingresa los datos de tu ser querido para llevar su control de salud.
  </p>
  </div>
  <button
  onClick={() => setShowAddForm(false)}
  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all shadow-sm"
  >
  <X className="h-4 w-4" strokeWidth={2} />
  </button>
  </div>

 <form onSubmit={handleAddSubmit} className="p-6 md:p-8 space-y-8">
 <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
  <div className="space-y-3">
  <label className="text-xs font-bold text-gray-500 block">
  {t('label_first_name') || 'Nombre(s)'}
  </label>
  <Input
  required
  value={formData.firstName}
  onChange={e => setFormData({ ...formData, firstName: e.target.value })}
  className="h-12 rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-sm focus-visible:ring-2 focus-visible:ring-emerald-600/20 focus-visible:border-emerald-600 transition-all shadow-sm"
  placeholder="Ej. María"
  />
  </div>

  <div className="space-y-3">
  <label className="text-xs font-bold text-gray-500 block">
  {t('label_last_name') || 'Apellidos'}
  </label>
  <Input
  required
  value={formData.lastName}
  onChange={e => setFormData({ ...formData, lastName: e.target.value })}
  className="h-12 rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-sm focus-visible:ring-2 focus-visible:ring-emerald-600/20 focus-visible:border-emerald-600 transition-all shadow-sm"
  placeholder="Ej. Pérez"
  />
  </div>

  <div className="space-y-3">
  <label className="text-xs font-bold text-gray-500 block">
  {t('label_dob') || 'Fecha de nacimiento'}
  </label>
  <Popover>
  <PopoverTrigger asChild>
  <Button
  variant="outline"
  className={cn(
  "h-12 w-full justify-start rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-sm font-normal focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all shadow-sm",
  !formData.dateOfBirth && "text-gray-400"
  )}
  >
  <CalendarIcon className="mr-3 h-4 w-4" strokeWidth={2} />
  {formData.dateOfBirth ? (
  <span className="text-gray-900 dark:text-white font-medium">
  {format(new Date(`${formData.dateOfBirth}T12:00:00`), "dd MMM yyyy", { locale: es })}
  </span>
  ) : (
  <span>Seleccionar fecha</span>
  )}
  </Button>
  </PopoverTrigger>
  <PopoverContent className="z-[100] w-auto rounded-xl border border-gray-200 dark:border-gray-800 p-0 bg-white dark:bg-[#0a0a0a] shadow-xl" align="start">
  <CalendarUI
  mode="single"
  selected={formData.dateOfBirth ? new Date(`${formData.dateOfBirth}T12:00:00`) : undefined}
  onSelect={(date) => setFormData({ ...formData, dateOfBirth: date ? format(date, "yyyy-MM-dd") : "" })}
  disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
  initialFocus
  captionLayout="dropdown"
  fromYear={1900}
  toYear={new Date().getFullYear()}
  locale={es}
  className="p-3"
  />
  </PopoverContent>
  </Popover>
  </div>

  <div className="space-y-3">
  <label className="text-xs font-bold text-gray-500 block">
  {t('label_relationship') || 'Parentesco'}
  </label>
  <Select
  value={formData.relationship}
  onValueChange={(val) => setFormData({ ...formData, relationship: val })}
  required
  >
  <SelectTrigger className="h-12 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-sm focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all shadow-sm">
  <SelectValue placeholder="Seleccione vínculo" />
  </SelectTrigger>
  <SelectContent className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-lg">
  <SelectItem value="CHILD" className="text-sm font-medium">{t('rel_child') || 'Hijo/a'}</SelectItem>
  <SelectItem value="PARENT" className="text-sm font-medium">{t('rel_parent') || 'Padre/Madre'}</SelectItem>
  <SelectItem value="SPOUSE" className="text-sm font-medium">{t('rel_spouse') || 'Cónyuge'}</SelectItem>
  <SelectItem value="SIBLING" className="text-sm font-medium">{t('rel_sibling') || 'Hermano/a'}</SelectItem>
  <SelectItem value="OTHER" className="text-sm font-medium">{t('rel_other') || 'Otro'}</SelectItem>
  </SelectContent>
  </Select>
  </div>
 </div>

  <div className="flex flex-col-reverse gap-4 border-t border-gray-100 dark:border-gray-800 pt-6 sm:flex-row sm:justify-end">
  <Button
  type="button"
  variant="outline"
  onClick={() => setShowAddForm(false)}
  className="h-12 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:bg-gray-50 text-sm font-bold px-8 transition-all shadow-sm"
  >
  {t('btn_cancel') || 'Cancelar'}
  </Button>
  <Button
  type="submit"
  disabled={isSubmitting || !formData.firstName || !formData.lastName || !formData.dateOfBirth}
  className="h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold px-8 transition-all shadow-sm border-0 disabled:opacity-50"
  >
  {isSubmitting ? <Loader2 className="mr-3 h-4 w-4 animate-spin" /> : <Plus className="mr-3 h-4 w-4" strokeWidth={2} />}
  {t('btn_save') || 'Guardar Registro'}
  </Button>
  </div>
  </form>
 </div>
 </motion.div>
 )}
 </AnimatePresence>

 {/* --- LISTA DE FAMILIARES --- */}
 {!showAddForm && family.length > 0 && (
 <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
 {family.map((member) => {
 const age = calculateAge(member.dateOfBirth);

 return (
  <div
  key={member.id}
  className="group flex flex-col border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] transition-all rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-emerald-500/30 dark:hover:border-emerald-500/30"
  >
  {age < 12 && <DependentVaccineAlert memberId={member.id} />}

  <div className="p-6 md:p-8 flex items-start justify-between gap-4 border-b border-gray-100 dark:border-gray-800">
  <div className="flex items-center gap-4">
  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50 shadow-sm transition-colors duration-300">
  <div className="text-indigo-500">
  {getRelationshipIcon(member.relationship)}
  </div>
  </div>
  <div>
  <span className="mb-1 inline-flex rounded-full bg-gray-100 dark:bg-gray-800 px-3 py-1 text-xs font-bold text-gray-600 dark:text-gray-300 transition-colors duration-300">
  {getTranslatedRelationship(member.relationship)}
  </span>
  <h3 className="truncate text-lg font-bold tracking-tight text-gray-900 dark:text-white transition-colors duration-300">
  {member.firstName} {member.lastName}
  </h3>
  </div>
  </div>

  <button
  onClick={() => removeMember(member.id)}
  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-transparent text-gray-400 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-500 dark:hover:border-rose-900/50 dark:hover:bg-rose-900/20 transition-all shadow-sm z-20"
  title="Eliminar Expediente"
  >
  <Trash2 className="h-4 w-4" strokeWidth={1.5} />
  </button>
  </div>

   {/* Grid Info Interno */}
  <div className="grid grid-cols-2 gap-0 bg-gray-50/50 dark:bg-[#0a0a0a]/50">
  <div className="border-r border-gray-100 dark:border-gray-800 p-4">
  <p className="text-xs font-bold text-gray-500 mb-1">Edad</p>
  <p className="font-semibold text-gray-900 dark:text-white tracking-tight">{age} Años</p>
  </div>
  <div className="p-4">
  <p className="text-xs font-bold text-gray-500 mb-1">Nacimiento</p>
  <p className="truncate text-sm font-semibold text-gray-900 dark:text-white tracking-tight">{member.dateOfBirth}</p>
  </div>
  </div>

  {/* Acciones */}
  <div className="p-6 md:p-8 flex flex-col gap-3 bg-gray-50/80 dark:bg-gray-900/10 flex-1 justify-end rounded-b-3xl">
  {age <= 5 && (
  <Link 
  href={`/patient/dashboard/family/${member.id}/growth`} 
  className="flex h-10 w-full items-center justify-start px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm font-bold text-gray-700 dark:text-gray-300 transition-all hover:border-emerald-600 hover:text-emerald-600 dark:hover:border-emerald-600 dark:hover:text-emerald-600 shadow-sm"
  >
  <Activity className="h-4 w-4 mr-3" strokeWidth={2} />
  Crecimiento Pediátrico
  </Link>
  )}
  {age < 12 && (
  <Link 
  href={`/patient/dashboard/family/${member.id}/vaccinations`} 
  className="flex h-10 w-full items-center justify-start px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm font-bold text-gray-700 dark:text-gray-300 transition-all hover:border-emerald-600 hover:text-emerald-600 dark:hover:border-emerald-600 dark:hover:text-emerald-600 shadow-sm"
  >
  <Syringe className="h-4 w-4 mr-3" strokeWidth={2} />
  Esquema de Vacunación
  </Link>
  )}
  {age >= 65 && (
  <Link 
  href={`/patient/dashboard/family/${member.id}/eldercare`} 
  className="flex h-10 w-full items-center justify-start px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm font-bold text-gray-700 dark:text-gray-300 transition-all hover:border-emerald-600 hover:text-emerald-600 dark:hover:border-emerald-600 dark:hover:text-emerald-600 shadow-sm"
  >
  <HeartHandshake className="h-4 w-4 mr-3" strokeWidth={2} />
  Cuidados Geriátricos
  </Link>
  )}

  <Link 
  href="/patient/dashboard/vault" 
  className="flex h-10 w-full items-center justify-start px-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm font-bold text-gray-600 dark:text-gray-400 transition-all hover:border-gray-400 hover:text-gray-900 dark:hover:border-gray-600 dark:hover:text-white shadow-sm"
  >
  <FolderHeart className="h-4 w-4 mr-3" strokeWidth={2} />
  Bóveda Documental
  </Link>
  </div>
  </div>
 );
 })}
 </div>
 )}

 {/* --- ESTADO VACÍO (EMPTY STATE) --- */}
 {!showAddForm && family.length === 0 && (
 <motion.div
 initial={{ opacity: 0, scale: 0.98 }}
 animate={{ opacity: 1, scale: 1 }}
 className="flex flex-col items-center justify-center py-24 border border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/10 p-8 text-center rounded-3xl"
 >
 <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
 <HeartPulse className="h-8 w-8 text-gray-400" strokeWidth={1.5} />
 </div>
 <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">
 {t('empty_title') || 'Aún no tienes familiares agregados'}
 </h3>
 <p className="mx-auto mb-8 max-w-md text-sm font-medium text-gray-500 leading-relaxed">
 {t('empty_desc') || 'Agrega a tus seres queridos para llevar su control de vacunas, consultas y cuidados.'}
 </p>
 <Button
 onClick={() => setShowAddForm(true)}
 className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white h-12 px-8 text-sm font-bold transition-all shadow-sm border-0"
 >
 <UserPlus className="mr-3 h-4 w-4" strokeWidth={2} />
 {t('btn_add_first') || 'Agregar Familiar'}
 </Button>
 </motion.div>
 )}
 </div>
 </div>
 );
}