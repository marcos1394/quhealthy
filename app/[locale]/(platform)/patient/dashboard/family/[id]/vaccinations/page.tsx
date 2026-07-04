"use client"
/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/no-giant-component */;

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
 Syringe, ChevronLeft, ChevronDown, Check, Circle, Clock, ShieldCheck, 
 FileCheck2, Loader2, ScanFace, Camera, FileUp, Sparkles, AlertCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFamily } from '@/hooks/useFamily';
import { QhSpinner } from '@/components/ui/QhSpinner';
import { toast } from 'react-toastify';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import apiClient from '@/lib/axios';
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import {
 DropdownMenu,
 DropdownMenuContent,
 DropdownMenuItem,
 DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
 Dialog,
 DialogContent,
 DialogHeader,
 DialogTitle,
 DialogDescription,
 DialogFooter,
} from "@/components/ui/dialog";
import {
 Accordion,
 AccordionContent,
 AccordionItem,
 AccordionTrigger,
} from "@/components/ui/accordion";

import { vaccinationService } from '@/services/vaccination.service';
import { VaccinationStatusDto } from '@/types/vaccination';

// --- MAPEO DE IA A CATÁLOGO ---
// Gemini devuelve keys como 'bcg', 'hepb_1', etc.
// Mapeamos a la enfermedad (diseasePrevented) y el número de dosis exacto.
const AI_VACCINE_MAP: Record<string, { disease: string, dose: number }> = {
 'bcg': { disease: 'Tuberculosis', dose: 1 },
 'hepb_1': { disease: 'Hepatitis B', dose: 1 },
 'hepb_2': { disease: 'Hepatitis B', dose: 2 },
 'hepb_3': { disease: 'Hepatitis B', dose: 3 },
 'penta_1': { disease: 'Pentavalente Acelular', dose: 1 },
 'penta_2': { disease: 'Pentavalente Acelular', dose: 2 },
 'penta_3': { disease: 'Pentavalente Acelular', dose: 3 },
 'penta_4': { disease: 'Pentavalente Acelular', dose: 4 }, // Refuerzo
 'rota_1': { disease: 'Rotavirus', dose: 1 },
 'rota_2': { disease: 'Rotavirus', dose: 2 },
 'rota_3': { disease: 'Rotavirus', dose: 3 },
 'neumo_1': { disease: 'Neumococo', dose: 1 }, // Neumococo conjugada
 'neumo_2': { disease: 'Neumococo', dose: 2 },
 'neumo_ref': { disease: 'Neumococo', dose: 3 }, // Refuerzo
 'srp_1': { disease: 'Sarampión, Rubéola, Parotiditis', dose: 1 },
 'srp_ref': { disease: 'Sarampión, Rubéola, Parotiditis', dose: 2 }, // Refuerzo
 'dpt_ref': { disease: 'DPT', dose: 1 }, // DPT Refuerzo
 'influenza_1': { disease: 'Influenza', dose: 1 },
 'influenza_2': { disease: 'Influenza', dose: 2 },
 'influenza_anual': { disease: 'Influenza', dose: 3 }, // Representa el anual
};

// Helper for mapping age to labels
function getAgeLabel(months: number) {
 if (months === 0) return 'Al Nacer';
 if (months === 2) return '2 Meses';
 if (months === 4) return '4 Meses';
 if (months === 6) return '6 Meses';
 if (months === 7) return '7 Meses';
 if (months === 12) return '12 Meses (1 Año)';
 if (months === 18) return '18 Meses (1.5 Años)';
 if (months === 24) return '24 Meses (2 Años)';
 if (months === 36) return '36 Meses (3 Años)';
 if (months === 48) return '48 Meses (4 Años)';
 if (months === 59) return '59 Meses (5 Años)';
 if (months === 72) return '72 Meses (6 Años)';
 if (months === 132) return '11 Años o 5º de primaria';
 return `${months} Meses`;
}

export default function VaccinationsPage() {
 const params = useParams();
 const router = useRouter();
 const t = useTranslations();
 const { family, isLoading } = useFamily();
 const [{ member, vaccinesData, isLoadingVaccines, simulatingAction, isScanning, isManualMarkModalOpen, selectedVaccineId, selectedDate }, dispatch] = React.useReducer(
 (state: any, action: any) => {
 switch (action.type) {
 case 'SET_MEMBER': return { ...state, member: typeof action.payload === 'function' ? action.payload(state.member) : action.payload };
 case 'SET_VACCINESDATA': return { ...state, vaccinesData: typeof action.payload === 'function' ? action.payload(state.vaccinesData) : action.payload };
 case 'SET_ISLOADINGVACCINES': return { ...state, isLoadingVaccines: typeof action.payload === 'function' ? action.payload(state.isLoadingVaccines) : action.payload };
 case 'SET_SIMULATINGACTION': return { ...state, simulatingAction: typeof action.payload === 'function' ? action.payload(state.simulatingAction) : action.payload };
 case 'SET_ISSCANNING': return { ...state, isScanning: typeof action.payload === 'function' ? action.payload(state.isScanning) : action.payload };
 case 'SET_ISMANUALMARKMODALOPEN': return { ...state, isManualMarkModalOpen: typeof action.payload === 'function' ? action.payload(state.isManualMarkModalOpen) : action.payload };
 case 'SET_SELECTEDVACCINEID': return { ...state, selectedVaccineId: typeof action.payload === 'function' ? action.payload(state.selectedVaccineId) : action.payload };
 case 'SET_SELECTEDDATE': return { ...state, selectedDate: typeof action.payload === 'function' ? action.payload(state.selectedDate) : action.payload };
 default: return state;
 }
 },
 {
 member: null, vaccinesData: [], isLoadingVaccines: true, simulatingAction: null, isScanning: false, isManualMarkModalOpen: false, selectedVaccineId: null, selectedDate: undefined
 }
 );

 const setMember = (val: any) => dispatch({ type: 'SET_MEMBER', payload: val });
 const setVaccinesData = (val: any) => dispatch({ type: 'SET_VACCINESDATA', payload: val });
 const setIsLoadingVaccines = (val: any) => dispatch({ type: 'SET_ISLOADINGVACCINES', payload: val });
 const setSimulatingAction = (val: any) => dispatch({ type: 'SET_SIMULATINGACTION', payload: val });
 const setIsScanning = (val: any) => dispatch({ type: 'SET_ISSCANNING', payload: val });
 const setIsManualMarkModalOpen = (val: any) => dispatch({ type: 'SET_ISMANUALMARKMODALOPEN', payload: val });
 const setSelectedVaccineId = (val: any) => dispatch({ type: 'SET_SELECTEDVACCINEID', payload: val });
 const setSelectedDate = (val: any) => dispatch({ type: 'SET_SELECTEDDATE', payload: val });


 const fileInputRef = useRef<HTMLInputElement>(null);

 // -- ESTADO Y REFERENCIAS PARA WEBRTC CAMERA --
 const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
 const videoRef = useRef<HTMLVideoElement>(null);
 const streamRef = useRef<MediaStream | null>(null);

 const openCameraModal = async () => {
 setIsCameraModalOpen(true);
 try {
 const stream = await navigator.mediaDevices.getUserMedia({ 
 video: { facingMode: 'environment' } 
 });
 if (videoRef.current) {
 videoRef.current.srcObject = stream;
 }
 streamRef.current = stream;
 } catch (err) {
 console.error("Error accessing camera:", err);
 toast.error("No se pudo acceder a la cámara. Revisa los permisos de tu navegador.");
 setIsCameraModalOpen(false);
 }
 };

 const stopCamera = () => {
 if (streamRef.current) {
 streamRef.current.getTracks().forEach(track => track.stop());
 streamRef.current = null;
 }
 };

 const capturePhotoAndProcess = () => {
 if (!videoRef.current) return;
 const canvas = document.createElement('canvas');
 canvas.width = videoRef.current.videoWidth;
 canvas.height = videoRef.current.videoHeight;
 const ctx = canvas.getContext('2d');
 if (!ctx) return;
 
 ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
 canvas.toBlob((blob) => {
 if (blob) {
 const file = new File([blob], 'captura-vacunas.jpg', { type: 'image/jpeg' });
 setIsCameraModalOpen(false);
 stopCamera();
 processFile(file);
 }
 }, 'image/jpeg', 0.9);
 };

 // Cerrar cámara si el modal se desmonta
 useEffect(() => {
 if (!isCameraModalOpen) {
 stopCamera();
 }
 }, [isCameraModalOpen]);

 const loadVaccines = useCallback(async (dependentId: number) => {
 setIsLoadingVaccines(true);
 try {
 const data = await vaccinationService.getVaccinations(dependentId);
 setVaccinesData(data);
 } catch (error) {
 console.error("Error fetching vaccines:", error);
 toast.error("Error al cargar el esquema de vacunación.");
 } finally {
 setIsLoadingVaccines(false);
 }
 }, []);

 useEffect(() => {
 if (!isLoading && family) {
 const found = family.find(f => f.id === Number(params.id));
 if (found) {
 setMember(found);
 loadVaccines(found.id);
 } else {
 toast.error("Familiar no encontrado");
 router.push('/patient/dashboard/family');
 }
 }
 }, [isLoading, family, params.id, router, loadVaccines]);

 const groupedVaccines = useMemo(() => {
 const groups: Record<number, { ageGroup: string, vaccines: VaccinationStatusDto[] }> = {};
 vaccinesData.forEach((vaccine: any) => {
 const month = vaccine.recommendedAgeMonths;
 if (!groups[month]) {
 groups[month] = { ageGroup: getAgeLabel(month), vaccines: [] };
 }
 groups[month].vaccines.push(vaccine);
 });
 return Object.values(groups).sort((a, b) => a.vaccines[0].recommendedAgeMonths - b.vaccines[0].recommendedAgeMonths);
 }, [vaccinesData]);

 const appliedCount = useMemo(() => vaccinesData.filter((vaccine: any) => vaccine.isApplied).length, [vaccinesData]);
 const delayedCount = useMemo(() => vaccinesData.filter((vaccine: any) => vaccine.isDelayed).length, [vaccinesData]);
 const progress = vaccinesData.length > 0 ? Math.round((appliedCount / vaccinesData.length) * 100) : 0;

 const handleToggleVaccine = (vaccine: VaccinationStatusDto) => {
 if (vaccine.isApplied) {
 toast.info("La vacuna ya fue aplicada. No se puede revocar desde esta vista.");
 } else {
 setSelectedVaccineId(vaccine.vaccineCatalogId);
 setSelectedDate(new Date()); 
 setIsManualMarkModalOpen(true);
 }
 };

 const confirmManualMark = async () => {
 if (!selectedVaccineId || !selectedDate || !member) return;
 
 const dateStr = format(selectedDate, 'yyyy-MM-dd');
 setSimulatingAction(selectedVaccineId);
 
 try {
 await vaccinationService.markVaccine(member.id, {
 vaccineCatalogId: selectedVaccineId,
 appliedDate: dateStr
 });
 toast.success("Registro sincronizado exitosamente. Comprobante guardado en la bóveda.");
 setIsManualMarkModalOpen(false);
 await loadVaccines(member.id);
 } catch (err) {
 console.error(err);
 toast.error("Fallo de sincronización al registrar la vacuna.");
 } finally {
 setSimulatingAction(null);
 setSelectedVaccineId(null);
 }
 };

 const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
 const file = event.target.files?.[0];
 if (!file) return;
 processFile(file);
 };

 const processFile = async (file: File) => {
 if (!member) return;

 const formData = new FormData();
 formData.append('file', file);

 setIsScanning(true);
 toast.info("Analizando documento mediante motor OCR/IA...");

 try {
 const response = await apiClient.post('/api/onboarding/consumer/vault/vaccinations/extract', formData, {
 headers: { 'Content-Type': 'multipart/form-data' }
 });
 
 let markedCount = 0;
 for (const item of response.data) {
 if (item.vaccineId && item.dateApplied) {
 const mappedInfo = AI_VACCINE_MAP[item.vaccineId.toLowerCase()];
 
 if (mappedInfo) {
 // Buscar exactamente en el catálogo del usuario usando diseasePrevented y doseNumber
 const catalogMatch = vaccinesData.find((v: any) => 
 v.diseasePrevented.toLowerCase().includes(mappedInfo.disease.toLowerCase()) &&
 v.doseNumber === mappedInfo.dose
 );
 
 // Si no lo encontró con diseasePrevented, intentar con el nombre
 const alternativeMatch = !catalogMatch && vaccinesData.find((v: any) => 
 v.name.toLowerCase().includes(mappedInfo.disease.toLowerCase()) &&
 v.doseNumber === mappedInfo.dose
 );

 const finalMatch = catalogMatch || alternativeMatch;

 if (finalMatch && !finalMatch.isApplied) {
 await vaccinationService.markVaccine(member.id, {
 vaccineCatalogId: finalMatch.vaccineCatalogId,
 appliedDate: item.dateApplied
 });
 markedCount++;
 }
 } else {
 console.warn(`ID de vacuna desconocido desde la IA: ${item.vaccineId}`);
 }
 }
 }
 
 if (markedCount > 0) {
 toast.success(`Extracción exitosa: ${markedCount} registros sincronizados.`);
 loadVaccines(member.id);
 } else {
 toast.warning("El análisis no detectó registros nuevos o válidos en el documento.");
 }
 
 } catch (error) {
 console.error("Error extrayendo vacunas:", error);
 toast.error("Fallo de análisis. Verifique la calidad de la imagen y vuelva a intentarlo.");
 } finally {
 setIsScanning(false);
 if (fileInputRef.current) fileInputRef.current.value = '';
 }
 };

 if (isLoading || !member || isLoadingVaccines) {
 return (
 <div className="flex flex-col justify-center items-center min-h-screen bg-white dark:bg-[#0a0a0a] transition-colors duration-300">
 <QhSpinner size="lg" />
 <p className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white mt-4 animate-pulse">
 Cargando cartilla...
 </p>
 </div>
 );
 }

 return (
 <div className="min-h-screen bg-white dark:bg-[#0a0a0a] font-sans text-black dark:text-white pb-32 selection:bg-gray-200 dark:selection:bg-white/20 transition-colors duration-300">
 <div className="max-w-6xl mx-auto px-6 py-12 md:py-16 space-y-12">
 
 {/* --- HEADER --- */}
 <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 border-b border-gray-200 dark:border-gray-800 pb-8">
 <div className="flex items-center gap-6">
 <button 
 onClick={() => router.back()} 
 className="w-14 h-14 border border-black dark:border-white flex items-center justify-center bg-gray-50 dark:bg-[#050505] hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors shrink-0"
 >
 <ChevronLeft className="w-6 h-6" strokeWidth={1.5} />
 </button>
 <div>
 <div className="mb-2 inline-flex items-center gap-2 border border-black dark:border-white bg-black text-white dark:bg-white dark:text-black px-2 py-1 text-[9px] font-bold uppercase tracking-widest">
 <Sparkles className="h-3 w-3" strokeWidth={2} />
 Registro de Salud
 </div>
 <h1 className="text-3xl font-semibold tracking-tight uppercase mb-1">
 Cartilla de Vacunación
 </h1>
 <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
 Monitoreo y registro para <span className="text-black dark:text-white">{member.firstName} {member.lastName}</span>
 </p>
 </div>
 </div>
 </div>

 {/* --- ESTADÍSTICAS (BLUEPRINT GRID) --- */}
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 border-t border-l border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505]">
 <div className="border-b border-r border-gray-200 dark:border-gray-800 p-6 flex flex-col justify-between hover:bg-white dark:hover:bg-[#0a0a0a] transition-colors">
 <div className="flex items-center justify-between gap-3 mb-6">
 <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Progreso</p>
 <ShieldCheck className="h-4 w-4 text-black dark:text-white" strokeWidth={1.5} />
 </div>
 <p className="text-3xl font-semibold tracking-tight">{progress}%</p>
 </div>
 <div className="border-b border-r border-gray-200 dark:border-gray-800 p-6 flex flex-col justify-between hover:bg-white dark:hover:bg-[#0a0a0a] transition-colors">
 <div className="flex items-center justify-between gap-3 mb-6">
 <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Dosis Aplicadas</p>
 <Check className="h-4 w-4 text-black dark:text-white" strokeWidth={1.5} />
 </div>
 <p className="text-3xl font-semibold tracking-tight">{appliedCount}</p>
 </div>
 <div className="border-b border-r border-gray-200 dark:border-gray-800 p-6 flex flex-col justify-between hover:bg-white dark:hover:bg-[#0a0a0a] transition-colors">
 <div className="flex items-center justify-between gap-3 mb-6">
 <p className="text-[10px] font-bold uppercase tracking-widest text-red-500">Pendientes o Atrasadas</p>
 <AlertCircle className="h-4 w-4 text-red-500" strokeWidth={1.5} />
 </div>
 <p className="text-3xl font-semibold tracking-tight text-red-500">{delayedCount}</p>
 </div>
 </div>

 {/* --- MÓDULO DE ESCANEO (BLOQUE ARQUITECTÓNICO) --- */}
 <div className="border border-black dark:border-white bg-white dark:bg-[#0a0a0a] p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
 <div className="flex items-start gap-4">
 <div className="w-12 h-12 border border-black dark:border-white flex items-center justify-center bg-black text-white dark:bg-white dark:text-black shrink-0">
 <ScanFace className="w-5 h-5" strokeWidth={1.5} />
 </div>
 <div>
 <h3 className="text-sm font-bold uppercase tracking-widest text-black dark:text-white mb-1">Escanear Cartilla Física</h3>
 <p className="text-[10px] uppercase tracking-widest text-gray-500 font-light">
 Toma una foto de tu cartilla física para registrar las vacunas automáticamente.
 </p>
 </div>
 </div>

 <div className="w-full shrink-0 md:w-auto">
 <input type="file" accept="image/*,application/pdf" hidden ref={fileInputRef} onChange={handleFileSelect} />

 <DropdownMenu>
 <DropdownMenuTrigger asChild>
 <Button
 disabled={isScanning}
 className="w-full md:w-auto h-12 rounded-none bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 text-[10px] font-bold uppercase tracking-widest transition-colors border-0 px-8"
 >
 {isScanning ? (
 <>
 <Loader2 className="w-4 h-4 mr-3 animate-spin" /> Procesando...
 </>
 ) : (
 <>
 <ScanFace className="w-4 h-4 mr-3" strokeWidth={1.5} /> Escanear Documento
 </>
 )}
 </Button>
 </DropdownMenuTrigger>
 <DropdownMenuContent align="end" className="z-50 w-64 rounded-none border border-black dark:border-white bg-white dark:bg-[#0a0a0a] p-0 shadow-none">
 <DropdownMenuItem 
 onSelect={(e) => {
 e.preventDefault();
 openCameraModal();
 }}
 className="rounded-none px-4 py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#050505] text-[10px] font-bold uppercase tracking-widest focus:bg-gray-50 dark:focus:bg-[#050505]"
 >
 <Camera className="mr-3 h-4 w-4" strokeWidth={1.5} /> Capturar Fotografía
 </DropdownMenuItem>
 <div className="h-px bg-gray-200 dark:bg-gray-800 w-full" />
 <DropdownMenuItem 
 onSelect={(e) => {
 e.preventDefault();
 fileInputRef.current?.click();
 }}
 className="rounded-none px-4 py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#050505] text-[10px] font-bold uppercase tracking-widest focus:bg-gray-50 dark:focus:bg-[#050505]"
 >
 <FileUp className="mr-3 h-4 w-4" strokeWidth={1.5} /> Subir Archivo Local
 </DropdownMenuItem>
 </DropdownMenuContent>
 </DropdownMenu>
 </div>
 </div>

 {/* --- ESQUEMA DE VACUNACIÓN (TABLAS) --- */}
 <Accordion type="multiple" className="space-y-8">
 {groupedVaccines.map((stage, idx) => (
 <AccordionItem
 value={stage.ageGroup}
 key={stage.ageGroup}
 className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] rounded-none data-[state=open]:border-black dark:data-[state=open]:border-white transition-colors"
 >
 {/* Cabecera del Grupo */}
 <AccordionTrigger className="bg-gray-50 dark:bg-[#050505] px-6 py-4 hover:no-underline hover:bg-gray-100 dark:hover:bg-[#111111] transition-colors border-b border-transparent data-[state=open]:border-gray-200 dark:data-[state=open]:border-gray-800 [&[data-state=open]>svg]:rotate-180">
 <div className="flex items-center gap-3">
 <Clock className="w-4 h-4 text-black dark:text-white" strokeWidth={1.5} />
 <h2 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
 A los: {stage.ageGroup}
 </h2>
 </div>
 <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 text-black dark:text-white" />
 </AccordionTrigger>

 {/* Filas de Vacunas */}
 <AccordionContent className="p-0">
 <div className="divide-y divide-gray-200 dark:divide-gray-800">
 {stage.vaccines.map(vaccine => {
 const isApplied = vaccine.isApplied;
 const isSimulating = simulatingAction === vaccine.vaccineCatalogId;

 return (
 <div key={vaccine.vaccineCatalogId} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:bg-gray-50 dark:hover:bg-[#050505] transition-colors group">
 
 <div className="flex items-start gap-4">
 {/* Checkbox Arquitectónico */}
 <button
 onClick={() => handleToggleVaccine(vaccine)}
 disabled={isSimulating}
 className={cn(
 "mt-0.5 w-6 h-6 border flex items-center justify-center shrink-0 transition-colors focus:outline-none",
 isApplied 
 ? "bg-black border-black text-white dark:bg-white dark:border-white dark:text-black" 
 : "border-gray-300 dark:border-gray-700 bg-transparent hover:border-black dark:hover:border-white"
 )}
 >
 {isSimulating ? (
 <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={2} />
 ) : isApplied ? (
 <Check className="w-4 h-4" strokeWidth={3} />
 ) : null}
 </button>
 
 <div>
 <h4 className={cn(
 "text-sm font-bold uppercase tracking-widest transition-colors mb-1",
 isApplied ? "text-gray-500" : "text-black dark:text-white"
 )}>
 {vaccine.name}
 </h4>
 <p className="text-[10px] text-gray-500 font-light uppercase tracking-widest">
 {vaccine.diseasePrevented} (Dosis {vaccine.doseNumber})
 </p>

 {isApplied && vaccine.appliedDate && (
 <div className="flex items-center gap-2 mt-3 text-[9px] font-bold uppercase tracking-widest text-black dark:text-white border border-gray-300 dark:border-gray-700 px-2 py-1 w-fit bg-gray-50 dark:bg-[#050505]">
 <FileCheck2 className="w-3 h-3" strokeWidth={1.5} />
 Aplicada: {vaccine.appliedDate}
 </div>
 )}
 </div>
 </div>

 {!isApplied && (
 <Button
 variant="outline"
 disabled={isSimulating}
 onClick={() => handleToggleVaccine(vaccine)}
 className="rounded-none border border-black dark:border-white h-8 px-4 text-[9px] font-bold uppercase tracking-widest hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
 >
 Registrar Dosis
 </Button>
 )}
 </div>
 );
 })}
 </div>
 </AccordionContent>
 </AccordionItem>
 ))}
 </Accordion>
 </div>

 {/* --- MODAL DE REGISTRO MANUAL --- */}
 <Dialog open={isManualMarkModalOpen} onOpenChange={setIsManualMarkModalOpen}>
 <DialogContent className="sm:max-w-md rounded-none bg-white dark:bg-[#0a0a0a] border border-black dark:border-white p-0 gap-0 shadow-2xl">
 <DialogHeader className="p-8 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505]">
 <DialogTitle className="text-sm font-bold uppercase tracking-widest text-black dark:text-white">
 Registrar Vacuna
 </DialogTitle>
 <DialogDescription className="text-[10px] uppercase tracking-widest text-gray-500 mt-2">
 ¿Cuándo se aplicó esta vacuna? Si no recuerdas el día exacto, selecciona un aproximado.
 </DialogDescription>
 </DialogHeader>
 
 <div className="p-8 space-y-4">
 <div className="space-y-3 flex flex-col">
 <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
 Fecha de Registro
 </label>
 <DatePicker
 value={selectedDate}
 onChange={setSelectedDate}
 disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
 placeholder="Seleccionar fecha"
 className="w-full h-12 text-xs font-mono rounded-none border-gray-300 dark:border-gray-700 bg-white dark:bg-black"
 popoverClassName="z-[60] bg-white dark:bg-[#0a0a0a] border-black dark:border-white rounded-none"
 />
 </div>
 </div>

 <DialogFooter className="p-8 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] flex flex-col sm:flex-row gap-4">
 <Button
 type="button"
 variant="outline"
 onClick={() => setIsManualMarkModalOpen(false)}
 className="rounded-none border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0a0a0a] hover:border-black dark:hover:border-white h-12 px-6 text-[10px] font-bold uppercase tracking-widest w-full sm:w-auto"
 >
 Cancelar
 </Button>
 <Button
 type="button"
 onClick={confirmManualMark}
 disabled={!selectedDate || simulatingAction !== null}
 className="rounded-none bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 h-12 px-6 text-[10px] font-bold uppercase tracking-widest w-full sm:w-auto border-0 disabled:opacity-50"
 >
 {simulatingAction !== null ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileCheck2 className="w-4 h-4 mr-2" strokeWidth={1.5} />}
 Guardar Registro
 </Button>
 </DialogFooter>
 </DialogContent>
 </Dialog>
 {/* --- MODAL PARA LA CAMARA WEBRTC --- */}
 <Dialog open={isCameraModalOpen} onOpenChange={(open) => {
 setIsCameraModalOpen(open);
 if (!open) stopCamera();
 }}>
 <DialogContent className="sm:max-w-md rounded-none bg-black border border-white p-0 gap-0 shadow-2xl overflow-hidden">
 <DialogHeader className="p-4 bg-black border-b border-gray-800">
 <DialogTitle className="text-white text-sm font-bold uppercase tracking-widest flex items-center">
 <Camera className="w-4 h-4 mr-2" />
 Capturar Cartilla
 </DialogTitle>
 </DialogHeader>
 
 <div className="relative w-full aspect-[3/4] bg-black flex items-center justify-center">
 <video 
 ref={videoRef} 
 autoPlay 
 playsInline
 className="w-full h-full object-cover"
 />
 {/* Guías visuales para la cartilla */}
 <div className="absolute inset-0 border-2 border-white/30 m-8 rounded-xl pointer-events-none flex flex-col justify-between p-4">
 <div className="w-full flex justify-between">
 <div className="w-4 h-4 border-t-2 border-l-2 border-white"></div>
 <div className="w-4 h-4 border-t-2 border-r-2 border-white"></div>
 </div>
 <div className="w-full flex justify-between">
 <div className="w-4 h-4 border-b-2 border-l-2 border-white"></div>
 <div className="w-4 h-4 border-b-2 border-r-2 border-white"></div>
 </div>
 </div>
 </div>

 <div className="p-4 bg-black flex justify-center border-t border-gray-800">
 <Button
 onClick={capturePhotoAndProcess}
 className="rounded-full w-16 h-16 bg-white hover:bg-gray-200 border-4 border-gray-300 dark:border-gray-800 p-0 flex items-center justify-center transition-transform hover:scale-105"
 >
 <span className="sr-only">Tomar Foto</span>
 <div className="w-14 h-14 rounded-full border-2 border-black"></div>
 </Button>
 </div>
 </DialogContent>
 </Dialog>

 </div>
 );
}