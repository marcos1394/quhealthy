"use client"
/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/no-event-handler */;

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { usePatientDirectory } from '@/hooks/usePatientDirectory';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreatableSelect } from '@/components/ui/creatable-select';
import { PatientDirectoryProfile } from '@/types/medicalHistory';
import { UserCog, Mail, Phone, X, Save, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { QhSpinner } from '@/components/ui/QhSpinner';

interface EditPatientModalProps {
 isOpen: boolean;
 onClose: () => void;
 patient: PatientDirectoryProfile | null;
 onUpdated?: () => void;
}

export function EditPatientModal({ isOpen, onClose, patient, onUpdated }: EditPatientModalProps) {
 const { updatePatient, isSubmitting } = usePatientDirectory();
 const t = useTranslations('DashboardPatientDetail');
 const [formData, setFormData] = useState({ 
 email: '', phone: '',
 curp: '', ethnicGroup: '', healthInsurance: '',
 emergencyContactName: '', emergencyContactPhone: '', address: ''
 });

 useEffect(() => {
 if (patient) {
 setFormData({
 email: patient.email || '',
 phone: patient.phone || '',
 curp: patient.curp || '',
 ethnicGroup: patient.ethnicGroup || '',
 healthInsurance: patient.healthInsurance || '',
 emergencyContactName: patient.emergencyContactName || '',
 emergencyContactPhone: patient.emergencyContactPhone || '',
 address: patient.address || ''
 });
 }
 }, [patient]);

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!patient) return;

 const success = await updatePatient(patient.id, {
 email: formData.email || undefined,
 phone: formData.phone || undefined,
 curp: formData.curp || undefined,
 ethnicGroup: formData.ethnicGroup || undefined,
 healthInsurance: formData.healthInsurance || undefined,
 emergencyContactName: formData.emergencyContactName || undefined,
 emergencyContactPhone: formData.emergencyContactPhone || undefined,
 address: formData.address || undefined
 });

 if (success) {
 onUpdated?.();
 onClose();
 }
 };

 return (
 <Dialog open={isOpen} onOpenChange={(open) => !open && !isSubmitting && onClose()}>
 <DialogContent className="sm:max-w-xl bg-white dark:bg-[#0a0a0a] border border-black dark:border-white text-black dark:text-white p-0 rounded-none shadow-2xl overflow-hidden flex flex-col transition-colors [&>button]:hidden">
 
 {/* HEADER ARQUITECTÓNICO */}
 <div className="flex items-start md:items-center justify-between p-6 md:p-8 bg-white dark:bg-[#0a0a0a] border-b border-black/20 dark:border-white/20 shrink-0">
 <div className="flex items-center gap-5">
 <div className="w-14 h-14 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] text-black dark:text-white flex items-center justify-center shrink-0">
 <UserCog className="w-6 h-6" strokeWidth={1.5} />
 </div>
 <div>
 <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">
 Módulo de Directorio
 </p>
 <DialogTitle className="text-xl md:text-2xl font-semibold uppercase tracking-tight text-black dark:text-white leading-none">
 {t('edit_modal_title', { defaultValue: 'EDITAR PERFIL' })}
 </DialogTitle>
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

 {/* CUERPO DEL FORMULARIO (GRID BLUEPRINT) */}
 <form onSubmit={handleSubmit} className="flex flex-col bg-gray-50 dark:bg-[#050505] overflow-y-auto custom-scrollbar">
 
 <div className="p-6 md:p-8 border-b border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0a]">
 <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 leading-relaxed mb-6">
 {t('edit_modal_description', { defaultValue: 'ACTUALICE LA INFORMACIÓN DE CONTACTO DEL PACIENTE PARA RECIBIR NOTIFICACIONES Y ALERTAS DEL SISTEMA.' })}
 </p>
 
 <div className="space-y-6">
 <div className="space-y-3">
 <label className="text-[9px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
 <Mail className="w-3.5 h-3.5" strokeWidth={1.5} />
 {t('email_label', { defaultValue: 'CORREO ELECTRÓNICO' })}
 </label>
 <Input
 type="email"
 value={formData.email}
 onChange={(e) => setFormData({ ...formData, email: e.target.value })}
 placeholder="CORREO@EJEMPLO.COM"
 className="h-14 px-4 bg-gray-50 dark:bg-[#050505] border border-black/20 dark:border-white/20 text-xs font-semibold text-black dark:text-white focus-visible:ring-0 focus-visible:border-black dark:focus-visible:border-white transition-colors rounded-none placeholder:text-gray-400 dark:placeholder:text-gray-600"
 disabled={isSubmitting}
 />
 </div>

 <div className="space-y-3">
 <label className="text-[9px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
 <Phone className="w-3.5 h-3.5" strokeWidth={1.5} />
 {t('phone_label', { defaultValue: 'NÚMERO TELEFÓNICO' })}
 </label>
 <Input
 type="tel"
 value={formData.phone}
 onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
 placeholder="+52 000 000 0000"
 className="h-14 px-4 bg-gray-50 dark:bg-[#050505] border border-black/20 dark:border-white/20 text-xs font-semibold text-black dark:text-white focus-visible:ring-0 focus-visible:border-black dark:focus-visible:border-white transition-colors rounded-none placeholder:text-gray-400 dark:placeholder:text-gray-600"
 disabled={isSubmitting}
 />
 </div>
 </div>
 </div>

 {/* NOM-024 (Datos Requeridos) */}
 <div className="p-6 md:p-8 border-b border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0a]">
 <h4 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white mb-4 border-b border-black/10 dark:border-white/10 pb-2 flex items-center gap-2">
 Datos Complementarios (NOM-024)
 </h4>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
 <div>
 <label className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-2 block">CURP</label>
 <Input 
 value={formData.curp || ''} 
 onChange={e => setFormData({...formData, curp: e.target.value.toUpperCase()})} 
 maxLength={18}
 placeholder="18 Caracteres"
 className="h-12 px-4 bg-gray-50 dark:bg-[#050505] border border-black/20 dark:border-white/20 text-xs font-semibold uppercase focus-visible:ring-0 focus-visible:border-black rounded-none"
 disabled={isSubmitting}
 />
 </div>
 <div>
 <label className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-2 block">Derechohabiencia</label>
 <Select value={formData.healthInsurance} onValueChange={(val) => setFormData({...formData, healthInsurance: val})} disabled={isSubmitting}>
 <SelectTrigger className="h-12 rounded-none border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] text-xs font-semibold uppercase focus:ring-0 focus:border-black">
 <SelectValue placeholder="SELECCIONAR" />
 </SelectTrigger>
 <SelectContent className="bg-white dark:bg-[#0a0a0a] rounded-none">
 <SelectItem className="text-[9px] font-bold uppercase tracking-widest rounded-none" value="IMSS">IMSS</SelectItem>
 <SelectItem className="text-[9px] font-bold uppercase tracking-widest rounded-none" value="ISSSTE">ISSSTE</SelectItem>
 <SelectItem className="text-[9px] font-bold uppercase tracking-widest rounded-none" value="INSABI">INSABI / SSA</SelectItem>
 <SelectItem className="text-[9px] font-bold uppercase tracking-widest rounded-none" value="PEMEX">PEMEX / SEDENA / SEMAR</SelectItem>
 <SelectItem className="text-[9px] font-bold uppercase tracking-widest rounded-none" value="SEGURO_PRIVADO">Seguro Médico Privado</SelectItem>
 <SelectItem className="text-[9px] font-bold uppercase tracking-widest rounded-none" value="NINGUNA">Ninguna</SelectItem>
 </SelectContent>
 </Select>
 </div>
 </div>

 <div className="mb-6">
 <label className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-2 block">Domicilio Completo</label>
 <textarea
 value={formData.address || ''} 
 onChange={e => setFormData({...formData, address: e.target.value})}
 placeholder="Calle, número, colonia, código postal, ciudad, estado"
 className="w-full min-h-[60px] p-4 bg-gray-50 dark:bg-[#050505] border border-black/20 dark:border-white/20 text-xs font-semibold uppercase focus:outline-none focus:border-black dark:focus:border-white resize-none"
 disabled={isSubmitting}
 />
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
 <div>
 <label className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-2 block">Grupo Étnico</label>
 <CreatableSelect
 options={[
 { label: 'Ninguno', value: 'Ninguno' },
 { label: 'Náhuatl', value: 'Náhuatl' },
 { label: 'Maya', value: 'Maya' },
 { label: 'Zapoteco', value: 'Zapoteco' },
 { label: 'Mixteco', value: 'Mixteco' },
 { label: 'Otomí', value: 'Otomí' },
 { label: 'Totonaca', value: 'Totonaca' },
 { label: 'Tsotsil', value: 'Tsotsil' },
 { label: 'Tzeltal', value: 'Tzeltal' },
 { label: 'Mazahua', value: 'Mazahua' },
 { label: 'Huasteco', value: 'Huasteco' }
 ]}
 value={formData.ethnicGroup || ''}
 onChange={(val) => setFormData({...formData, ethnicGroup: val})}
 placeholder="SELECCIONAR O CREAR"
 disabled={isSubmitting}
 />
 </div>
 </div>

 <h5 className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-4 mt-6">Contacto de Emergencia</h5>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div>
 <label className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-2 block">Nombre Completo</label>
 <Input 
 value={formData.emergencyContactName || ''} 
 onChange={e => setFormData({...formData, emergencyContactName: e.target.value})}
 className="h-12 px-4 bg-gray-50 dark:bg-[#050505] border border-black/20 dark:border-white/20 text-xs font-semibold uppercase focus-visible:ring-0 focus-visible:border-black rounded-none"
 disabled={isSubmitting}
 />
 </div>
 <div>
 <label className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-2 block">Teléfono</label>
 <Input 
 type="tel"
 value={formData.emergencyContactPhone || ''} 
 onChange={e => setFormData({...formData, emergencyContactPhone: e.target.value})}
 className="h-12 px-4 bg-gray-50 dark:bg-[#050505] border border-black/20 dark:border-white/20 text-xs font-semibold uppercase focus-visible:ring-0 focus-visible:border-black rounded-none"
 disabled={isSubmitting}
 />
 </div>
 </div>
 </div>

 {/* FOOTER DE COMANDOS ESTRICTO */}
 <div className="p-6 md:p-8 bg-white dark:bg-[#0a0a0a] flex flex-col sm:flex-row justify-end gap-4 shrink-0 border-t border-black/20 dark:border-white/20">
 <button
 type="button"
 onClick={onClose}
 disabled={isSubmitting}
 className="w-full sm:w-auto h-14 px-8 border border-black/20 dark:border-white/20 bg-transparent text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors text-[10px] font-bold uppercase tracking-widest rounded-none disabled:opacity-50"
 >
 {t('cancel', { defaultValue: 'ANULAR' })}
 </button>
 <button
 type="submit"
 disabled={isSubmitting || (!formData.email && !formData.phone)}
 className="w-full sm:w-auto h-14 px-10 bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-3 border-0 rounded-none disabled:opacity-50"
 >
 {isSubmitting ? (
 <><QhSpinner size="sm" className="text-current" /> PROCESANDO...</>
 ) : (
 <><Save className="w-4 h-4" strokeWidth={1.5} /> {t('save_changes', { defaultValue: 'GUARDAR CAMBIOS' })}</>
 )}
 </button>
 </div>
 </form>

 </DialogContent>
 </Dialog>
 );
}