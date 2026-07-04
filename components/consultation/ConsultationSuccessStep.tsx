"use client"
/* eslint-disable react-doctor/button-has-type */;

import React, { useState } from 'react';
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Printer, MessageCircle, CheckCircle, Loader2 } from "lucide-react";
import { appointmentService } from '@/services/appointment.service';
import { toast } from 'react-toastify';

interface ConsultationSuccessStepProps {
 appointmentId: number;
 patientPhone?: string;
 doctorName?: string;
 clinicName?: string;
 onClose: () => void;
}

export const ConsultationSuccessStep: React.FC<ConsultationSuccessStepProps> = ({ 
 appointmentId, 
 patientPhone,
 doctorName = "ESPECIALISTA ASIGNADO",
 clinicName = "QUHEALTHY",
 onClose 
}) => {
 const t = useTranslations('EHR');
 const params = useParams();
 const currentLocale = (params?.locale as string) || 'es';
 const [isPrinting, setIsPrinting] = useState(false);

 const handlePrintPdf = async () => {
 try {
 setIsPrinting(true);
 const pdfBlob = await appointmentService.downloadPrescriptionPdf(appointmentId);
 
 const fileURL = URL.createObjectURL(pdfBlob);
 window.open(fileURL, '_blank');
 
 setTimeout(() => URL.revokeObjectURL(fileURL), 10000);
 } catch (error) {
 console.error("Error al descargar PDF:", error);
 toast.error(t('error_download_pdf') || "ERROR: NO FUE POSIBLE EXTRAER EL DOCUMENTO OFICIAL.");
 } finally {
 setIsPrinting(false);
 }
 };

 const handleWhatsAppShare = () => {
 const now = new Date();
 const dateFormatted = now.toLocaleDateString(currentLocale === 'es' ? 'es-MX' : 'en-US', {
 day: '2-digit',
 month: 'long',
 year: 'numeric'
 });
 const timeFormatted = now.toLocaleTimeString(currentLocale === 'es' ? 'es-MX' : 'en-US', {
 hour: '2-digit',
 minute: '2-digit'
 });

 const patientPortalUrl = `https://www.quhealthy.org/${currentLocale}/patient/prescription/${appointmentId}`;
 
 const message = `¡Hola! Soy el ${doctorName} de ${clinicName}. 🏥\n\n` +
 `📄 Aquí tienes el enlace a tu receta médica digital de nuestra consulta de hoy:\n\n` +
 `🗓️ Fecha: ${dateFormatted}\n` +
 `⏰ Hora: ${timeFormatted}\n\n` +
 `🔗 Enlace: ${patientPortalUrl}\n\n` +
 `🔐 Por tu seguridad, para abrir el archivo se te solicitarán los *últimos 4 dígitos de tu teléfono celular* registrado.\n\n` +
 `Si te receté productos, podrás adquirirlos directamente en el enlace anterior.\n\n` +
 `¡Que te mejores pronto! ✨`;
 
 const encodedMessage = encodeURIComponent(message);
 const cleanPhone = patientPhone ? patientPhone.replace(/\D/g, '') : '';
 
 const waUrl = cleanPhone 
 ? `https://wa.me/${cleanPhone}?text=${encodedMessage}`
 : `https://wa.me/?text=${encodedMessage}`;
 
 window.open(waUrl, '_blank');
 };

 return (
 <div className="h-full flex flex-col items-center justify-center animate-in fade-in duration-300 py-12 px-4 transition-colors">
 
 {/* CONTENEDOR TÉCNICO PRINCIPAL */}
 <div className="max-w-md w-full bg-white dark:bg-[#0a0a0a] border border-black dark:border-white flex flex-col rounded-none overflow-hidden">
 
 {/* CABECERA Y MENSAJE DE ÉXITO */}
 <div className="p-10 md:p-14 flex flex-col items-center text-center bg-white dark:bg-[#0a0a0a]">
 
 <div className="w-20 h-20 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] flex items-center justify-center mb-8 shrink-0">
 <CheckCircle className="w-8 h-8 text-black dark:text-white" strokeWidth={1.5} />
 </div>
 
 <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">
 Protocolo Finalizado
 </p>
 <h2 className="text-2xl md:text-3xl font-semibold uppercase tracking-tight text-black dark:text-white mb-4 leading-none">
 {t('consultation_finished', { defaultValue: 'EXPEDIENTE CERRADO' })}
 </h2>
 <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 max-w-xs mx-auto leading-relaxed">
 {t('consultation_finished_desc', { defaultValue: 'LA AUDITORÍA CLÍNICA HA CONCLUIDO EXITOSAMENTE. SE HA GENERADO LA DOCUMENTACIÓN DE RESPALDO.' })}
 </p>

 </div>

 {/* PANEL DE ACCIONES (GRID DE BLOQUES) */}
 <div className="flex flex-col border-t border-black dark:border-white bg-gray-50 dark:bg-[#050505]">
 
 {/* BLOQUE WHATSAPP */}
 <button 
 onClick={handleWhatsAppShare} 
 className="w-full h-16 flex items-center justify-center gap-3 bg-[#25D366] text-black hover:bg-black hover:text-[#25D366] transition-colors px-6 text-[10px] font-bold uppercase tracking-widest border-b border-black dark:border-white rounded-none"
 >
 <MessageCircle className="w-4 h-4" strokeWidth={1.5} /> 
 {t('send_by_whatsapp', { defaultValue: 'NOTIFICAR POR WHATSAPP' })}
 </button>

 {/* BLOQUE IMPRIMIR PDF */}
 <button 
 onClick={handlePrintPdf} 
 disabled={isPrinting}
 className="w-full h-16 flex items-center justify-center gap-3 bg-white dark:bg-[#0a0a0a] text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors px-6 text-[10px] font-bold uppercase tracking-widest border-b border-black dark:border-white rounded-none disabled:opacity-50"
 >
 {isPrinting ? (
 <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.5} />
 ) : (
 <Printer className="w-4 h-4" strokeWidth={1.5} />
 )}
 {isPrinting ? t('generating_pdf', { defaultValue: 'EXTRAYENDO DOCUMENTO...' }) : t('print_prescription_pdf', { defaultValue: 'EXTRAER RECETA EN PDF' })}
 </button>

 {/* BLOQUE RETORNAR AL INICIO */}
 <button 
 onClick={onClose}
 className="w-full h-16 flex items-center justify-center gap-3 bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors px-6 text-[10px] font-bold uppercase tracking-widest rounded-none border-0"
 >
 {t('back_to_home', { defaultValue: 'FINALIZAR Y RETORNAR AL PANEL' })}
 </button>

 </div>
 </div>
 </div>
 );
};