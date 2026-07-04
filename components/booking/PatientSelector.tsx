"use client"
/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/click-events-have-key-events */;

import React, { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { User, Users, Baby, Loader2, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { useFamily } from '@/hooks/useFamily';
import { useBookingStore } from '@/hooks/useBookingStore';
import { cn } from '@/lib/utils';
import { useSessionStore } from '@/stores/SessionStore';

export function PatientSelector() {
 const t = useTranslations('PatientCheckout');
 const router = useRouter();
 const { user } = useSessionStore();
 const { family, isLoading } = useFamily();
 const { dependentId, setDependentId, providerColor } = useBookingStore();

 // Por defecto, seleccionar al titular (null) si no hay nada
 useEffect(() => {
 if (dependentId === undefined) {
 setDependentId(null);
 }
 }, [dependentId, setDependentId]);

 if (isLoading) {
 return (
 <div className="flex items-center justify-center p-8 bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800">
 <Loader2 className="w-5 h-5 animate-spin text-black dark:text-white" strokeWidth={1.5} />
 </div>
 );
 }

 const safeColor = providerColor || '#000000';

 return (
 <div className="space-y-8" style={{ '--provider-color': safeColor } as React.CSSProperties}>
 <div className="border-b border-gray-200 dark:border-gray-800 pb-4">
 <h3 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white flex items-center mb-1">
 <Users className="w-4 h-4 mr-3" strokeWidth={1.5} />
 Asignación de Paciente
 </h3>
 <p className="text-[9px] uppercase tracking-widest text-gray-500 font-light">
 Seleccione el expediente correspondiente para la atención clínica.
 </p>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 {/* 1. Tarjeta del Titular (Yo) */}
 <div
 onClick={() => setDependentId(null)}
 className={cn(
 "cursor-pointer p-5 border flex items-center gap-4 group transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
 dependentId === null
 ? "text-white"
 : "border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] hover:[border-color:var(--provider-color)]"
 )}
 style={dependentId === null ? { backgroundColor: safeColor, borderColor: safeColor } : {}}
 >
 <div className={cn(
 "w-10 h-10 flex items-center justify-center border shrink-0 transition-colors",
 dependentId === null 
 ? "border-white/50 bg-white/10 text-white" 
 : "border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] text-gray-500 group-hover:[color:var(--provider-color)]"
 )}>
 <User className="w-4 h-4" strokeWidth={1.5} />
 </div>
 <div className="min-w-0">
 <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5">Titular</p>
 <p className={cn(
 "text-xs uppercase font-light truncate",
 dependentId === null ? "text-white/80" : "text-gray-500"
 )}>
 {user?.firstName} {user?.lastName}
 </p>
 </div>
 </div>

 {/* 2. Tarjetas de Familiares */}
 {family.map(member => (
 <div
 key={member.id}
 onClick={() => setDependentId(member.id)}
 className={cn(
 "cursor-pointer p-5 border flex items-center gap-4 group transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
 dependentId === member.id
 ? "text-white"
 : "border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] hover:[border-color:var(--provider-color)]"
 )}
 style={dependentId === member.id ? { backgroundColor: safeColor, borderColor: safeColor } : {}}
 >
 <div className={cn(
 "w-10 h-10 flex items-center justify-center border shrink-0 transition-colors",
 dependentId === member.id 
 ? "border-white/50 bg-white/10 text-white" 
 : "border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] text-gray-500 group-hover:[color:var(--provider-color)]"
 )}>
 {member.relationship === 'CHILD' ? <Baby className="w-4 h-4" strokeWidth={1.5} /> : <User className="w-4 h-4" strokeWidth={1.5} />}
 </div>
 <div className="min-w-0">
 <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5 truncate">
 {member.firstName} {member.lastName}
 </p>
 <p className={cn(
 "text-[9px] uppercase tracking-widest",
 dependentId === member.id ? "text-white/80" : "text-gray-500"
 )}>
 Vínculo: {member.relationship}
 </p>
 </div>
 </div>
 ))}
 </div>

 {/* 3. Botón para añadir a alguien más */}
 <button
 onClick={() => router.push('/patient/dashboard/family')}
 className="w-full sm:w-auto h-12 px-6 flex items-center justify-center border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0a0a0a] text-[10px] font-bold uppercase tracking-widest transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:[border-color:var(--provider-color)] hover:[background-color:var(--provider-color)] hover:text-white"
 >
 <Plus className="w-3.5 h-3.5 mr-2" strokeWidth={2} /> Incorporar Dependiente
 </button>
 </div>
 );
}