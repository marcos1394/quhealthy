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

  useEffect(() => {
    if (!isOpen || !appointmentId) {
      setNotes(null);
      setError(null);
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

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-black/50 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="bg-white dark:bg-[#0a0a0a] border border-black dark:border-white shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff] w-full max-w-3xl flex flex-col max-h-[90vh] rounded-none overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-start md:items-center justify-between p-6 border-b border-black dark:border-white bg-gray-50 dark:bg-[#050505] shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 border border-black dark:border-white bg-black text-white dark:bg-white dark:text-black flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-serif tracking-tight text-black dark:text-white uppercase mb-1">
                  Expediente de Consulta
                </h3>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  {patientName} <span className="mx-2">|</span> {new Date(consultationDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-black dark:hover:text-white transition-colors border border-transparent hover:border-black dark:hover:border-white p-2 shrink-0"
            >
              <X className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 md:p-8 overflow-y-auto flex-1 custom-scrollbar">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-48 space-y-6">
                <QhSpinner size="lg" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 animate-pulse">
                  RECUPERANDO EXPEDIENTE CLÍNICO...
                </p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-48 space-y-6 text-center">
                <FileText className="w-12 h-12 text-gray-300 dark:text-gray-700" strokeWidth={1.5} />
                <p className="text-[10px] font-bold uppercase tracking-widest text-red-500 max-w-sm">{error}</p>
              </div>
            ) : notes ? (
              <div className="space-y-8">
                
                {/* SOAP: Subjetivo */}
                <div className="bg-white dark:bg-[#0a0a0a] border border-black dark:border-white shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] p-6">
                  <div className="flex items-center gap-3 mb-4 pb-4 border-b border-black dark:border-white">
                    <ClipboardList className="w-4 h-4 text-black dark:text-white" strokeWidth={1.5} />
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
                      Subjetivo
                    </h4>
                  </div>
                  <p className="text-xs font-light leading-relaxed text-black dark:text-white whitespace-pre-wrap">
                    {notes.subjective || <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">SIN REGISTRO</span>}
                  </p>
                </div>

                {/* SOAP: Objetivo */}
                <div className="bg-white dark:bg-[#0a0a0a] border border-black dark:border-white shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] p-6">
                  <div className="flex items-center gap-3 mb-4 pb-4 border-b border-black dark:border-white">
                    <Stethoscope className="w-4 h-4 text-black dark:text-white" strokeWidth={1.5} />
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
                      Objetivo
                    </h4>
                  </div>
                  <p className="text-xs font-light leading-relaxed text-black dark:text-white whitespace-pre-wrap">
                    {notes.objective || <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">SIN REGISTRO</span>}
                  </p>
                </div>

                {/* SOAP: Análisis */}
                <div className="bg-white dark:bg-[#0a0a0a] border border-black dark:border-white shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] p-6">
                  <div className="flex items-center gap-3 mb-4 pb-4 border-b border-black dark:border-white">
                    <BriefcaseMedical className="w-4 h-4 text-black dark:text-white" strokeWidth={1.5} />
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
                      Análisis / Diagnóstico
                    </h4>
                  </div>
                  <p className="text-xs font-light leading-relaxed text-black dark:text-white whitespace-pre-wrap">
                    {notes.assessment || <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">SIN REGISTRO</span>}
                  </p>
                </div>

                {/* SOAP: Plan */}
                <div className="bg-white dark:bg-[#0a0a0a] border border-black dark:border-white shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] p-6">
                  <div className="flex items-center gap-3 mb-4 pb-4 border-b border-black dark:border-white">
                    <FileText className="w-4 h-4 text-black dark:text-white" strokeWidth={1.5} />
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
                      Plan y Tratamiento
                    </h4>
                  </div>
                  <p className="text-xs font-light leading-relaxed text-black dark:text-white whitespace-pre-wrap">
                    {notes.plan || <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">SIN REGISTRO</span>}
                  </p>
                </div>

              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 space-y-6 text-center">
                <FileText className="w-12 h-12 text-gray-300 dark:text-gray-700" strokeWidth={1.5} />
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">EXPEDIENTE VACÍO.</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-black dark:border-white bg-gray-50 dark:bg-[#050505] shrink-0 flex flex-col sm:flex-row justify-between items-center gap-4">
            {notes ? (
              <button 
                onClick={handleDownloadPrescription} 
                className="w-full sm:w-auto flex items-center justify-center gap-3 bg-black text-white dark:bg-white dark:text-black px-6 py-4 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
              >
                <FileDown className="w-4 h-4" strokeWidth={1.5} />
                VER RECETA MÉDICA
              </button>
            ) : <div className="hidden sm:block" />}
            
            <button 
              onClick={onClose} 
              className="w-full sm:w-auto bg-transparent border border-black dark:border-white px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
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
