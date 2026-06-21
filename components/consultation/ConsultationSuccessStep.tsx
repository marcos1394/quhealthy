"use client";

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
      <div className="max-w-lg w-full bg-white dark:bg-[#0a0a0a] border border-black dark:border-white shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff] flex flex-col items-center">
        
        <div className="p-10 md:p-14 w-full flex flex-col items-center text-center">
          
          <div className="w-24 h-24 border-2 border-black dark:border-white bg-black dark:bg-white text-white dark:text-black flex items-center justify-center mb-8 shrink-0">
            <CheckCircle className="w-10 h-10" strokeWidth={1.5} />
          </div>
          
          <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-tight text-black dark:text-white mb-4">
            {t('consultation_finished', { defaultValue: 'EXPEDIENTE CERRADO' })}
          </h2>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-10 max-w-xs mx-auto leading-relaxed">
            {t('consultation_finished_desc', { defaultValue: 'LA AUDITORÍA CLÍNICA HA CONCLUIDO EXITOSAMENTE. SE HA GENERADO LA DOCUMENTACIÓN DE RESPALDO.' })}
          </p>

          <div className="flex flex-col gap-5 w-full">
            
            {/* BOTÓN WHATSAPP (Neo-Brutalismo con color de marca externo) */}
            <button 
              onClick={handleWhatsAppShare} 
              className="w-full h-14 rounded-none flex items-center justify-center gap-3 bg-[#25D366] text-black border border-black hover:bg-black hover:text-[#25D366] transition-colors px-6 text-[10px] font-bold uppercase tracking-widest shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff]"
            >
              <MessageCircle className="w-4 h-4" strokeWidth={2} /> 
              {t('send_by_whatsapp', { defaultValue: 'NOTIFICAR POR WHATSAPP' })}
            </button>

            {/* BOTÓN IMPRIMIR PDF */}
            <button 
              onClick={handlePrintPdf} 
              disabled={isPrinting}
              className="w-full h-14 rounded-none flex items-center justify-center gap-3 bg-transparent border border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors px-6 text-[10px] font-bold uppercase tracking-widest disabled:opacity-50"
            >
              {isPrinting ? (
                <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
              ) : (
                <Printer className="w-4 h-4" strokeWidth={1.5} />
              )}
              {isPrinting ? t('generating_pdf', { defaultValue: 'EXTRAYENDO DOCUMENTO...' }) : t('print_prescription_pdf', { defaultValue: 'EXTRAER RECETA EN PDF' })}
            </button>
          </div>

        </div>

        {/* BOTÓN CERRAR (Footer) */}
        <div className="w-full border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] p-6">
          <button 
            onClick={onClose}
            className="w-full flex items-center justify-center bg-transparent text-gray-500 hover:text-black dark:hover:text-white transition-colors text-[10px] font-bold uppercase tracking-widest border-b border-transparent hover:border-black dark:hover:border-white mx-auto pb-0.5 w-fit"
          >
            {t('back_to_home', { defaultValue: 'FINALIZAR Y RETORNAR AL PANEL' })}
          </button>
        </div>

      </div>
    </div>
  );
};