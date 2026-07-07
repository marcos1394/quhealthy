"use client"
/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/no-event-handler */;

import React, { KeyboardEvent, useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { X, FileHeart } from 'lucide-react';
import { BloodType, PatientHealthProfile } from '@/types/healthProfile';
import { cn } from '@/lib/utils';
import { QhSpinner } from '@/components/ui/QhSpinner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface EditHealthProfileModalProps {
 isOpen: boolean;
 onClose: () => void;
 initialData: PatientHealthProfile | null;
 onSave: (data: Partial<PatientHealthProfile>) => Promise<boolean>;
 isSubmitting?: boolean;
}

const BLOOD_TYPE_OPTIONS: Array<{ value: BloodType; label: string }> = [
  { value: 'A_POSITIVE', label: 'A+' },
  { value: 'A_NEGATIVE', label: 'A-' },
  { value: 'B_POSITIVE', label: 'B+' },
  { value: 'B_NEGATIVE', label: 'B-' },
  { value: 'AB_POSITIVE', label: 'AB+' },
  { value: 'AB_NEGATIVE', label: 'AB-' },
  { value: 'O_POSITIVE', label: 'O+' },
  { value: 'O_NEGATIVE', label: 'O-' },
  { value: 'UNKNOWN', label: 'DESCONOCIDO' }
];

export function EditHealthProfileModal({
 isOpen,
 onClose,
 initialData,
 onSave,
 isSubmitting: externalSubmitting = false
}: EditHealthProfileModalProps) {
  const [localSubmitting, setLocalSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<PatientHealthProfile>>({
    bloodType: null,
    heightCm: null,
    weightKg: null,
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        bloodType: initialData?.bloodType ?? null,
        heightCm: initialData?.heightCm ?? null,
        weightKg: initialData?.weightKg ?? null,
      });
    }
  }, [isOpen, initialData]);

 const isSubmitting = localSubmitting || externalSubmitting;

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setLocalSubmitting(true);
 const success = await onSave(formData);
 setLocalSubmitting(false);
 if (success) onClose();
 };

 return (
 <Dialog open={isOpen} onOpenChange={(open) => !open && !isSubmitting && onClose()}>
 <DialogContent className="sm:max-w-4xl bg-white dark:bg-[#0a0a0a] border border-black dark:border-white p-0 rounded-none overflow-hidden max-h-[90vh] flex flex-col shadow-2xl transition-colors [&>button]:hidden">
 
 {/* HEADER ARQUITECTÓNICO */}
 <div className="flex items-start justify-between p-6 md:p-8 bg-white dark:bg-[#0a0a0a] border-b border-black/20 dark:border-white/20 shrink-0">
 <div className="flex items-center gap-5">
 <div className="w-14 h-14 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] flex items-center justify-center shrink-0">
 <FileHeart className="w-6 h-6 text-black dark:text-white" strokeWidth={1.5} />
 </div>
 <div>
 <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">
 Expediente Clínico
 </p>
 <DialogTitle className="text-xl md:text-2xl font-semibold uppercase tracking-tight text-black dark:text-white leading-none">
 EDITAR ANTECEDENTES MÉDICOS
 </DialogTitle>
 <DialogDescription className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-2">
 ACTUALICE LA FICHA CLÍNICA BASE DE ESTE PACIENTE EN EL DIRECTORIO.
 </DialogDescription>
 </div>
 </div>
 <button 
 onClick={onClose} 
 disabled={isSubmitting}
 className="w-12 h-12 flex items-center justify-center border border-transparent hover:border-black/20 dark:hover:border-white/20 hover:bg-gray-50 dark:hover:bg-[#050505] transition-colors shrink-0 disabled:opacity-50"
 >
 <X className="w-5 h-5 text-gray-500 hover:text-black dark:hover:text-white transition-colors" strokeWidth={1.5} />
 </button>
 </div>

 {/* BODY (GRID BLUEPRINT) */}
 <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar flex flex-col bg-gray-50 dark:bg-[#050505]">
 
 {/* Fila 1: Datos Físicos Básicos */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-b border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0a]">
 
 <div className="p-6 border-b md:border-b-0 md:border-r border-black/10 dark:border-white/10 flex flex-col">
 <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2 mb-3">
 <span className="w-3 h-3 flex items-center justify-center border border-black/20 dark:border-white/20">1</span>
 TIPO DE SANGRE
 </label>
 <Select
 value={formData.bloodType || 'none'}
 onValueChange={(val) => setFormData({ ...formData, bloodType: (val === 'none' ? null : val) as BloodType | null })}
 >
 <SelectTrigger className="w-full h-12 px-4 bg-gray-50 dark:bg-[#050505] border border-black/20 dark:border-white/20 text-xs font-semibold text-black dark:text-white uppercase tracking-widest rounded-none focus:ring-0 focus:border-black dark:focus:border-white transition-colors">
 <SelectValue placeholder="NO REGISTRADO..." />
 </SelectTrigger>
 <SelectContent className="rounded-none border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a]">
 <SelectItem value="none" className="text-xs font-semibold uppercase tracking-widest rounded-none focus:bg-gray-50 dark:focus:bg-[#111]">
 NO REGISTRADO...
 </SelectItem>
 {BLOOD_TYPE_OPTIONS.map((opt) => (
 <SelectItem key={opt.value} value={opt.value} className="text-xs font-semibold uppercase tracking-widest rounded-none focus:bg-gray-50 dark:focus:bg-[#111]">
 {opt.label}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>

 <div className="p-6 border-b md:border-b-0 md:border-r border-black/10 dark:border-white/10 flex flex-col">
 <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2 mb-3">
 <span className="w-3 h-3 flex items-center justify-center border border-black/20 dark:border-white/20">2</span>
 ESTATURA (CM)
 </label>
 <Input
 type="number"
 placeholder="EJ: 175"
 value={formData.heightCm ?? ''}
 onChange={(e) => setFormData({ ...formData, heightCm: e.target.value ? parseInt(e.target.value, 10) : null })}
 className="w-full h-12 px-4 bg-gray-50 dark:bg-[#050505] border border-black/20 dark:border-white/20 text-xs font-semibold text-black dark:text-white uppercase tracking-widest focus-visible:ring-0 focus-visible:border-black dark:focus-visible:border-white transition-colors rounded-none placeholder:text-gray-400 dark:placeholder:text-gray-600"
 />
 </div>

 <div className="p-6 flex flex-col">
 <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2 mb-3">
 <span className="w-3 h-3 flex items-center justify-center border border-black/20 dark:border-white/20">3</span>
 PESO (KG)
 </label>
 <Input
 type="number"
 step="0.1"
 placeholder="EJ: 70.5"
 value={formData.weightKg ?? ''}
 onChange={(e) => setFormData({ ...formData, weightKg: e.target.value ? parseFloat(e.target.value) : null })}
 className="w-full h-12 px-4 bg-gray-50 dark:bg-[#050505] border border-black/20 dark:border-white/20 text-xs font-semibold text-black dark:text-white uppercase tracking-widest focus-visible:ring-0 focus-visible:border-black dark:focus-visible:border-white transition-colors rounded-none placeholder:text-gray-400 dark:placeholder:text-gray-600"
 />
 </div>

 </div>

 {/* FOOTER DE COMANDOS ESTRICTO */}
 <div className="p-6 md:p-8 bg-white dark:bg-[#0a0a0a] border-t border-black/20 dark:border-white/20 flex flex-col sm:flex-row justify-end gap-4 shrink-0 mt-auto">
 <button 
 type="button" 
 onClick={onClose} 
 disabled={isSubmitting}
 className="w-full sm:w-auto h-14 px-8 border border-black/20 dark:border-white/20 bg-transparent text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors text-[10px] font-bold uppercase tracking-widest rounded-none disabled:opacity-50"
 >
 ANULAR CAMBIOS
 </button>
 <button 
 onClick={handleSubmit} 
 disabled={isSubmitting} 
 className="w-full sm:w-auto h-14 px-10 bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 border-0 transition-colors text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-3 rounded-none disabled:opacity-50"
 >
 {isSubmitting ? (
 <><QhSpinner size="sm" className="text-current" /> GUARDANDO EN REGISTRO...</>
 ) : (
 <>CONFIRMAR ACTUALIZACIÓN</>
 )}
 </button>
 </div>
 </form>
 </DialogContent>
 </Dialog>
 );
}