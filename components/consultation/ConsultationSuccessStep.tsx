import React, { useState } from 'react';
import { useTranslations } from "next-intl";
import { Printer, MessageCircle, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { appointmentService } from '@/services/appointment.service';
import { toast } from 'react-toastify';

interface ConsultationSuccessStepProps {
  appointmentId: number;
  patientPhone?: string; // Teléfono del paciente para WhatsApp (opcional)
  onClose: () => void; // Función para cerrar el modal y volver al dashboard
}

export const ConsultationSuccessStep: React.FC<ConsultationSuccessStepProps> = ({ 
  appointmentId, 
  patientPhone,
  onClose 
}) => {
  const t = useTranslations('EHR');
  const [isPrinting, setIsPrinting] = useState(false);

  // 🖨️ Función para Imprimir / Ver PDF
  const handlePrintPdf = async () => {
    try {
      setIsPrinting(true);
      const pdfBlob = await appointmentService.downloadPrescriptionPdf(appointmentId);
      
      // Creamos una URL temporal en la memoria del navegador
      const fileURL = URL.createObjectURL(pdfBlob);
      
      // Abrimos el PDF en una pestaña nueva
      window.open(fileURL, '_blank');
      
      // Limpiamos la URL de la memoria después de unos segundos
      setTimeout(() => URL.revokeObjectURL(fileURL), 10000);
    } catch (error) {
      console.error("Error al descargar PDF:", error);
      toast.error(t('error_download_pdf') || "Error al descargar el PDF de la receta.");
    } finally {
      setIsPrinting(false);
    }
  };

  // 💬 Función para Compartir por WhatsApp
  const handleWhatsAppShare = () => {
    // 🚀 URL real del portal de pacientes de QuHealthy donde podrán ver y comprar la receta
    const patientPortalUrl = `https://app.quhealthy.com/paciente/recetas/${appointmentId}`;
    
    const message = t('wa_prescription_msg', { patientPortalUrl });
    
    const encodedMessage = encodeURIComponent(message);
    
    // Si tenemos el teléfono, abre el chat directo. Si no, abre la app para seleccionar el contacto.
    const waUrl = patientPhone 
      ? `https://wa.me/${patientPhone}?text=${encodedMessage}`
      : `https://wa.me/?text=${encodedMessage}`;
      
    window.open(waUrl, '_blank');
  };

  return (
    <div className="h-full flex flex-col items-center justify-center animate-in zoom-in-95 fade-in duration-300 max-w-lg mx-auto py-12 text-center bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 mt-10">
      
      <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-6 shadow-inner ring-4 ring-emerald-50 dark:ring-emerald-900/10">
        <CheckCircle className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
      </div>
      
      <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
        {t('consultation_finished')}
      </h2>
      <p className="text-slate-500 dark:text-slate-400 mb-8 text-base px-4">
        {t('consultation_finished_desc')}
      </p>

      <div className="flex flex-col gap-4 w-full">
        {/* Botón de WhatsApp */}
        <Button 
          onClick={handleWhatsAppShare} 
          className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white h-14 text-base font-semibold rounded-xl shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
        >
          <MessageCircle className="w-5 h-5 mr-2" /> {t('send_by_whatsapp')}
        </Button>

        {/* Botón de Imprimir PDF */}
        <Button 
          onClick={handlePrintPdf} 
          disabled={isPrinting}
          variant="outline" 
          className="w-full h-14 text-base font-medium border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
        >
          {isPrinting ? (
            <Loader2 className="w-5 h-5 mr-2 animate-spin text-emerald-600 dark:text-emerald-500" />
          ) : (
            <Printer className="w-5 h-5 mr-2 text-slate-600 dark:text-slate-400" />
          )}
          {isPrinting ? t('generating_pdf') : t('print_prescription_pdf')}
        </Button>

        {/* Botón Cerrar */}
        <Button 
          variant="ghost" 
          onClick={onClose}
          className="w-full h-12 mt-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
        >
          {t('back_to_home')}
        </Button>
      </div>
    </div>
  );
};
