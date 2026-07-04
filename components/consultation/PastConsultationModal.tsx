"use client"
/* eslint-disable react-doctor/rerender-state-only-in-handlers */
/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/rendering-hydration-no-flicker */
/* eslint-disable react-doctor/no-initialize-state */;
/* eslint-disable react-doctor/prefer-useReducer */

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, ClipboardList, Stethoscope, BriefcaseMedical, FileDown } from 'lucide-react';
import { ehrService } from '@/services/ehr.service';
import { appointmentService } from '@/services/appointment.service';
import { ClinicalNotesDto } from '@/types/ehr';
import { QhSpinner } from '@/components/ui/QhSpinner';
import { toast } from 'react-toastify';

interface PastConsultationModalProps {
 isOpen: boolean;
 onClose: () => void;
 appointmentId: number | null;
 patientName: string;
 consultationDate: string;
}

export const PastConsultationModal = ({ isOpen, onClose, appointmentId, patientName, consultationDate }: PastConsultationModalProps) => {
 const [notes, setNotes] = useState<ClinicalNotesDto | null>(null);
 const [isLoading, setIsLoading] = useState(false);
 const [error, setError] = useState<string | null>(null);

 const [mounted, setMounted] = useState(false);
 useEffect(() => { setMounted(true); }, []);

 const [prevProps, setPrevProps] = useState({ isOpen, appointmentId });
 if (isOpen !== prevProps.isOpen || appointmentId !== prevProps.appointmentId) {
 setPrevProps({ isOpen, appointmentId });
 if (!isOpen || !appointmentId) {
 setNotes(null);
 setError(null);
 }
 }

 useEffect(() => {
 if (!isOpen || !appointmentId) {
 return;
 }

 const fetchNotes = async () => {
 setIsLoading(true);
 setError(null);
 try {
 const data = await ehrService.getClinicalNotes(appointmentId);
 setNotes(data);
 } catch (err) {
 console.error('Error fetching clinical notes', err);
 setError('NO SE PUDIERON CARGAR LAS NOTAS CLÍNICAS. ES POSIBLE QUE ESTA CONSULTA NO HAYA SIDO COMPLETADA.');
 } finally {
 setIsLoading(false);
 }
 };

 fetchNotes();
 }, [isOpen, appointmentId]);

 const handleDownloadPrescription = async () => {
 if (!appointmentId) return;
 try {
 const blob = await appointmentService.downloadPrescriptionPdf(appointmentId);
 const url = window.URL.createObjectURL(blob);
 window.open(url, '_blank');
 } catch (err) {
 console.error('Error downloading prescription', err);
 toast.error('No se pudo encontrar o generar la receta de esta consulta.');
 }
 };

 if (!isOpen) return null;
 if (!mounted) return null;

 return createPortal(
 <AnimatePresence>
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-black/60 backdrop-blur-sm">
 <motion.div 
 initial={{ opacity: 0, scale: 0.98 }}
 animate={{ opacity: 1, scale: 1 }}
 exit={{ opacity: 0, scale: 0.98 }}
 transition={{ duration: 0.2, ease: "easeOut" }}
 // Estilo de contenedor principal: Bordes estrictos, sin redondeo, sin sombras.
 className="bg-white dark:bg-[#0a0a0a] border border-black dark:border-white w-full max-w-5xl flex flex-col max-h-[90vh] min-h-[60vh] rounded-none overflow-hidden"
 >
 {/* Header Arquitectónico */}
 <div className="flex items-start md:items-center justify-between p-6 md:p-8 border-b border-black dark:border-white bg-white dark:bg-[#0a0a0a] shrink-0">
 <div className="flex items-center gap-5">
 <div className="w-14 h-14 border border-black dark:border-white bg-gray-50 dark:bg-[#050505] flex items-center justify-center shrink-0">
 <FileText className="w-6 h-6 text-black dark:text-white" strokeWidth={1.5} />
 </div>
 <div>
 <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">
 Archivo Clínico
 </p>
 <h3 className="text-xl md:text-3xl font-semibold tracking-tight text-black dark:text-white uppercase leading-none mb-2">
 Expediente de Consulta
 </h3>
 <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
 <span>{patientName}</span>
 <span className="text-gray-300 dark:text-gray-700">|</span>
 <span>{new Date(consultationDate).toLocaleDateString()}</span>
 </div>
 </div>
 </div>
 <button 
 onClick={onClose} 
 className="w-12 h-12 flex items-center justify-center border border-transparent hover:border-black dark:hover:border-white text-gray-400 hover:text-black dark:hover:text-white transition-colors shrink-0 bg-gray-50 dark:bg-[#050505] hover:bg-black hover:dark:bg-white hover:dark:text-black"
 >
 <X className="w-5 h-5" strokeWidth={1.5} />
 </button>
 </div>

 {/* Body Principal */}
 <div className="overflow-y-auto flex-1 custom-scrollbar bg-gray-50 dark:bg-[#050505] p-6 md:p-8">
 {isLoading ? (
 <div className="flex flex-col items-center justify-center h-full min-h-[300px] space-y-6">
 <QhSpinner size="lg" />
 <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 animate-pulse">
 RECUPERANDO TELEMETRÍA CLÍNICA...
 </p>
 </div>
 ) : error ? (
 <div className="flex flex-col items-center justify-center h-full min-h-[300px] space-y-6 text-center">
 <div className="w-16 h-16 border border-black/30 dark:border-white/30 flex items-center justify-center mb-2 bg-white dark:bg-[#0a0a0a]">
 <FileText className="w-6 h-6 text-gray-400 dark:text-gray-500" strokeWidth={1.5} />
 </div>
 <p className="text-[10px] font-bold uppercase tracking-widest text-red-500 max-w-sm">{error}</p>
 </div>
 ) : notes ? (
 <div className="w-full">
 <h4 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white mb-6 border-b border-gray-200 dark:border-gray-800 pb-2">
 Estructura de Valoración (SOAP)
 </h4>
 
 {/* Grid Blueprint para el SOAP */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-t border-l border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505]">
 
 {/* SOAP: Subjetivo */}
 <div className="border-b border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-6 md:p-8 flex flex-col min-h-[200px]">
 <div className="flex items-center gap-4 mb-6">
 <div className="w-10 h-10 border border-black/20 dark:border-white/20 flex items-center justify-center shrink-0 bg-gray-50 dark:bg-[#050505]">
 <ClipboardList className="w-4 h-4 text-black dark:text-white" strokeWidth={1.5} />
 </div>
 <h4 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
 1. Subjetivo
 </h4>
 </div>
 <p className="text-xs font-light leading-relaxed text-gray-600 dark:text-gray-300 whitespace-pre-wrap flex-1">
 {notes.subjective || <span className="text-gray-400 font-bold uppercase tracking-widest text-[9px]">SIN REGISTRO</span>}
 </p>
 </div>

 {/* SOAP: Objetivo */}
 <div className="border-b border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-6 md:p-8 flex flex-col min-h-[200px]">
 <div className="flex items-center gap-4 mb-6">
 <div className="w-10 h-10 border border-black/20 dark:border-white/20 flex items-center justify-center shrink-0 bg-gray-50 dark:bg-[#050505]">
 <Stethoscope className="w-4 h-4 text-black dark:text-white" strokeWidth={1.5} />
 </div>
 <h4 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
 2. Objetivo
 </h4>
 </div>
 <p className="text-xs font-light leading-relaxed text-gray-600 dark:text-gray-300 whitespace-pre-wrap flex-1">
 {notes.objective || <span className="text-gray-400 font-bold uppercase tracking-widest text-[9px]">SIN REGISTRO</span>}
 </p>
 </div>

 {/* SOAP: Análisis */}
 <div className="border-b border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-6 md:p-8 flex flex-col min-h-[200px]">
 <div className="flex items-center gap-4 mb-6">
 <div className="w-10 h-10 border border-black/20 dark:border-white/20 flex items-center justify-center shrink-0 bg-gray-50 dark:bg-[#050505]">
 <BriefcaseMedical className="w-4 h-4 text-black dark:text-white" strokeWidth={1.5} />
 </div>
 <h4 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
 3. Análisis / Diagnóstico
 </h4>
 </div>
 <p className="text-xs font-light leading-relaxed text-gray-600 dark:text-gray-300 whitespace-pre-wrap flex-1">
 {notes.assessment || <span className="text-gray-400 font-bold uppercase tracking-widest text-[9px]">SIN REGISTRO</span>}
 </p>
 </div>

 {/* SOAP: Plan */}
 <div className="border-b border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-6 md:p-8 flex flex-col min-h-[200px]">
 <div className="flex items-center gap-4 mb-6">
 <div className="w-10 h-10 border border-black/20 dark:border-white/20 flex items-center justify-center shrink-0 bg-gray-50 dark:bg-[#050505]">
 <FileText className="w-4 h-4 text-black dark:text-white" strokeWidth={1.5} />
 </div>
 <h4 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
 4. Plan y Tratamiento
 </h4>
 </div>
 <p className="text-xs font-light leading-relaxed text-gray-600 dark:text-gray-300 whitespace-pre-wrap flex-1">
 {notes.plan || <span className="text-gray-400 font-bold uppercase tracking-widest text-[9px]">SIN REGISTRO</span>}
 </p>
 </div>

 </div>
 </div>
 ) : (
 <div className="flex flex-col items-center justify-center h-full min-h-[300px] space-y-6 text-center">
 <div className="w-16 h-16 border border-black/30 dark:border-white/30 flex items-center justify-center mb-2 bg-white dark:bg-[#0a0a0a]">
 <FileText className="w-6 h-6 text-gray-300 dark:text-gray-700" strokeWidth={1.5} />
 </div>
 <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">EXPEDIENTE VACÍO.</p>
 </div>
 )}
 </div>

 {/* Footer de Acciones Estricto */}
 <div className="p-6 md:p-8 border-t border-black dark:border-white bg-white dark:bg-[#0a0a0a] shrink-0 flex flex-col sm:flex-row justify-between items-center gap-4">
 {notes ? (
 <button 
 onClick={handleDownloadPrescription} 
 className="w-full sm:w-auto h-14 flex items-center justify-center gap-3 bg-black text-white dark:bg-white dark:text-black px-8 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors rounded-none border-0"
 >
 VER RECETA MÉDICA <FileDown className="w-4 h-4" strokeWidth={1.5} />
 </button>
 ) : <div className="hidden sm:block" />}
 
 <button 
 onClick={onClose} 
 className="w-full sm:w-auto h-14 bg-transparent border border-black dark:border-white px-8 text-[10px] font-bold uppercase tracking-widest text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors rounded-none"
 >
 CERRAR EXPEDIENTE
 </button>
 </div>
 </motion.div>
 </div>
 </AnimatePresence>,
 document.body
 );
};