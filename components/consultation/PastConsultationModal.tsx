import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, ClipboardList, Stethoscope, BriefcaseMedical, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
        setError('No se pudieron cargar las notas clínicas. Es posible que esta consulta no haya sido completada.');
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

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-medical-50/50 dark:bg-medical-900/10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-medical-100 dark:bg-medical-900/30 text-medical-600 dark:text-medical-400 rounded-lg">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">Expediente de Consulta Previa</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{patientName} • {new Date(consultationDate).toLocaleDateString()}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-48 space-y-4">
                <QhSpinner size="lg" />
                <p className="text-sm text-slate-500 font-medium">Recuperando expediente clínico...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-48 space-y-4 text-center">
                <FileText className="w-12 h-12 text-slate-300 dark:text-slate-700" />
                <p className="text-slate-500 dark:text-slate-400">{error}</p>
              </div>
            ) : notes ? (
              <div className="space-y-6">
                
                {/* SOAP: Subjetivo */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 mb-2 text-slate-700 dark:text-slate-300">
                    <ClipboardList className="w-4 h-4 text-blue-500" />
                    <h4 className="font-bold text-sm uppercase tracking-wider">Subjetivo</h4>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                    {notes.subjective || <span className="italic text-slate-400">Sin registro</span>}
                  </p>
                </div>

                {/* SOAP: Objetivo */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 mb-2 text-slate-700 dark:text-slate-300">
                    <Stethoscope className="w-4 h-4 text-teal-500" />
                    <h4 className="font-bold text-sm uppercase tracking-wider">Objetivo</h4>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                    {notes.objective || <span className="italic text-slate-400">Sin registro</span>}
                  </p>
                </div>

                {/* SOAP: Análisis */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 mb-2 text-slate-700 dark:text-slate-300">
                    <BriefcaseMedical className="w-4 h-4 text-indigo-500" />
                    <h4 className="font-bold text-sm uppercase tracking-wider">Análisis / Diagnóstico</h4>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                    {notes.assessment || <span className="italic text-slate-400">Sin registro</span>}
                  </p>
                </div>

                {/* SOAP: Plan */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 mb-2 text-slate-700 dark:text-slate-300">
                    <FileText className="w-4 h-4 text-medical-500" />
                    <h4 className="font-bold text-sm uppercase tracking-wider">Plan y Tratamiento</h4>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                    {notes.plan || <span className="italic text-slate-400">Sin registro</span>}
                  </p>
                </div>

              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 space-y-4 text-center">
                <FileText className="w-12 h-12 text-slate-300 dark:text-slate-700" />
                <p className="text-slate-500 dark:text-slate-400">Expediente vacío.</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 shrink-0 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
            {notes ? (
              <Button onClick={handleDownloadPrescription} variant="secondary" className="flex items-center gap-2">
                <FileDown className="w-4 h-4" />
                Ver Receta Médica
              </Button>
            ) : <div />}
            <Button onClick={onClose} variant="outline" className="px-6">Cerrar Expediente</Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
