"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useState } from "react";
import { UserPlus, X, Search } from "lucide-react";
import { toast } from "react-toastify";

import { emergencyService } from "@/services/emergency.service";
import { useSessionStore } from "@/stores/SessionStore";
import { QhSpinner } from "@/components/ui/QhSpinner";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface RegisterEmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const RegisterEmergencyModal: React.FC<RegisterEmergencyModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useSessionStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [patientId, setPatientId] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !patientId) return;

    setIsSubmitting(true);
    try {
      // Registrar cita de emergencia
      const appt = await emergencyService.registerEmergencyWalkIn(
        user.id,
        Number(patientId)
      );

      // Detonar triage inmediatamente (inicia el reloj de triage)
      await emergencyService.startTriage(appt.id);

      setPatientId("");
      onSuccess();
    } catch (err) {
      toast.error("Error al registrar paciente en urgencias");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-0 rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        
        {/* --- HEADER --- */}
        <div className="flex items-center justify-between p-6 bg-white dark:bg-[#0a0a0a] border-b border-gray-100 dark:border-gray-800 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center shrink-0 border border-red-100 dark:border-red-900/30">
              <UserPlus className="w-5 h-5 text-red-600 dark:text-red-400" strokeWidth={2} />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-0.5">Admisión Directa • Walk-In</p>
              <DialogTitle className="text-lg font-bold text-gray-900 dark:text-white leading-none">
                Ingresar a Urgencias
              </DialogTitle>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-gray-50 dark:bg-[#111] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0"
          >
            <X className="w-4 h-4 text-gray-500" strokeWidth={2} />
          </button>
        </div>

        {/* --- BODY & FORM --- */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-y-auto">
          <div className="p-6 space-y-5 bg-white dark:bg-[#0a0a0a]">
            
            <DialogDescription className="text-xs font-medium text-gray-500 leading-relaxed bg-gray-50 dark:bg-[#111] p-3.5 rounded-xl border border-gray-100 dark:border-gray-800">
              Ingrese el identificador del paciente para dar de alta su ingreso en sala de espera e iniciar el cronómetro de Triage inmediatamente.
            </DialogDescription>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                ID del Directorio de Pacientes
              </label>
              <div className="relative">
                <input
                  type="number"
                  required
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  placeholder="Ej. 1045"
                  className="w-full h-12 px-4 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20 placeholder:text-gray-400 placeholder:font-normal font-mono rounded-xl shadow-sm"
                />
              </div>
              <p className="text-[11px] font-medium text-gray-400 dark:text-gray-500 flex items-center gap-1.5 pt-1">
                <Search className="w-3.5 h-3.5" strokeWidth={2} />
                <span>Búsqueda directa por expediente o clave única de paciente.</span>
              </p>
            </div>

          </div>

          {/* --- FOOTER --- */}
          <div className="p-5 bg-white dark:bg-[#0a0a0a] border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row justify-end gap-3 shrink-0 mt-auto">
            <button 
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto h-11 px-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#111] transition-colors text-xs font-bold shadow-sm"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              disabled={isSubmitting || !patientId}
              className="w-full sm:w-auto h-11 px-8 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors text-xs font-bold flex items-center justify-center gap-2 border-0 shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? (
                <><QhSpinner size="sm" className="text-current" /> Registrando...</>
              ) : (
                <><UserPlus className="w-4 h-4" strokeWidth={2} /> Registrar e Iniciar Triage</>
              )}
            </button>
          </div>
        </form>

      </DialogContent>
    </Dialog>
  );
};