"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useState } from "react";
import { X, Activity, Save, CheckCircle2, Clock, FileText } from "lucide-react";
import { toast } from "react-toastify";

import {
  EmergencyQueueItem,
  emergencyService,
} from "@/services/emergency.service";
import { useSessionStore } from "@/stores/SessionStore";
import { QhSpinner } from "@/components/ui/QhSpinner";

interface EmergencyConsoleProps {
  isOpen: boolean;
  onClose: () => void;
  emergency: EmergencyQueueItem;
  onUpdate: () => void;
}

export const EmergencyConsole: React.FC<EmergencyConsoleProps> = ({
  isOpen,
  onClose,
  emergency,
  onUpdate,
}) => {
  const { user } = useSessionStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [clinicalNotes, setClinicalNotes] = useState({
    subjective: "",
    objective: "",
    assessment: "",
    plan: "",
  });
  const [destination, setDestination] = useState("ALTA");

  if (!isOpen) return null;

  const handleAddNote = async () => {
    if (!user?.id) return;
    setIsSubmitting(true);
    try {
      await emergencyService.addHourlyNote(emergency.appointmentId, {
        providerId: user.id,
        clinicalNotes,
      });
      toast.success("Nota de evolución horaria registrada.");
      setClinicalNotes({
        subjective: "",
        objective: "",
        assessment: "",
        plan: "",
      });
      onUpdate();
    } catch (err) {
      toast.error("Error al guardar la nota.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      await emergencyService.completeEmergency(
        emergency.appointmentId,
        destination
      );
      toast.success("Urgencia finalizada y expediente PDF generado (NOM-004).");
      onUpdate();
      onClose();
    } catch (err) {
      toast.error("Error al finalizar la urgencia.");
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-2xl bg-white dark:bg-[#0a0a0a] border-l border-gray-100 dark:border-gray-800 h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
        
        {/* --- HEADER CONSOLA --- */}
        <div className="flex items-center justify-between p-6 bg-white dark:bg-[#0a0a0a] border-b border-gray-100 dark:border-gray-800 shrink-0">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/30 flex items-center justify-center shrink-0">
              <Activity className="w-5 h-5 text-red-600 dark:text-red-400" strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-500 mb-0.5">Consola Médica de Atención</p>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white truncate leading-none">
                {emergency.patientName}
              </h2>
              {emergency.reasonForEmergency && (
                <p className="text-xs font-medium text-gray-400 dark:text-gray-500 truncate mt-1">
                  {emergency.reasonForEmergency}
                </p>
              )}
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

        {/* --- BODY --- */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50 dark:bg-[#050505] custom-scrollbar">
          
          {/* Card: Nota de Evolución Horaria (SOAP) */}
          <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-5 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                  Nueva Nota de Evolución (SOAP)
                </h3>
              </div>
              <span className="text-[11px] font-mono text-gray-400 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Horario
              </span>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                  S • Subjetivo
                </label>
                <textarea
                  className="w-full bg-white dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-xl p-3 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 placeholder:text-gray-400 placeholder:font-normal"
                  rows={2}
                  value={clinicalNotes.subjective}
                  onChange={(e) =>
                    setClinicalNotes({
                      ...clinicalNotes,
                      subjective: e.target.value,
                    })
                  }
                  placeholder="Sintomatología expresada por el paciente..."
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                  O • Objetivo
                </label>
                <textarea
                  className="w-full bg-white dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-xl p-3 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 placeholder:text-gray-400 placeholder:font-normal"
                  rows={2}
                  value={clinicalNotes.objective}
                  onChange={(e) =>
                    setClinicalNotes({
                      ...clinicalNotes,
                      objective: e.target.value,
                    })
                  }
                  placeholder="Exploración física, constantes vitales, laboratorios..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                    A • Análisis / Diagnóstico
                  </label>
                  <textarea
                    className="w-full bg-white dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-xl p-3 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 placeholder:text-gray-400 placeholder:font-normal"
                    rows={2}
                    value={clinicalNotes.assessment}
                    onChange={(e) =>
                      setClinicalNotes({
                        ...clinicalNotes,
                        assessment: e.target.value,
                      })
                    }
                    placeholder="Interpretación del cuadro..."
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                    P • Plan de Manejo
                  </label>
                  <textarea
                    className="w-full bg-white dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-xl p-3 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 placeholder:text-gray-400 placeholder:font-normal"
                    rows={2}
                    value={clinicalNotes.plan}
                    onChange={(e) =>
                      setClinicalNotes({
                        ...clinicalNotes,
                        plan: e.target.value,
                      })
                    }
                    placeholder="Indicaciones, fármacos..."
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddNote}
                disabled={isSubmitting}
                className="w-full h-11 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <><QhSpinner size="sm" className="text-current" /> Guardando...</>
                ) : (
                  <><Save className="w-4 h-4" strokeWidth={2} /> Registración de Evolución Horaria</>
                )}
              </button>
            </div>
          </div>

          {/* Card: Cierre de Urgencia */}
          <div className="bg-red-50/50 dark:bg-red-950/10 border border-red-100 dark:border-red-900/30 p-5 rounded-2xl space-y-4">
            <div>
              <h3 className="text-sm font-bold text-red-900 dark:text-red-400 mb-1">
                Finalizar Evento de Urgencia
              </h3>
              <p className="text-xs font-medium text-red-600 dark:text-red-300 leading-relaxed">
                Al concluir el evento, se cerrará el cronómetro de atención activa y se firmará el expediente digital inalterable bajo la norma NOM-004.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
              <div className="flex-1 min-w-0">
                <label className="block text-[11px] font-bold text-red-800 dark:text-red-400 uppercase tracking-wider mb-1">
                  Destino / Egreso Paciente
                </label>
                <select
                  className="w-full h-11 px-3 bg-white dark:bg-[#0a0a0a] border border-red-200 dark:border-red-900/40 rounded-xl text-xs font-bold text-gray-900 dark:text-white focus:outline-none"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                >
                  <option value="ALTA">Alta Médica</option>
                  <option value="HOSPITALIZACIÓN">Ingreso a Hospitalización</option>
                  <option value="TRASLADO">Traslado a Otra Unidad</option>
                  <option value="DEFUNCION">Defunción</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleComplete}
                disabled={isCompleting}
                className="h-11 px-6 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition-colors shadow-sm flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
              >
                {isCompleting ? (
                  <><QhSpinner size="sm" className="text-current" /> Procesando...</>
                ) : (
                  <><CheckCircle2 className="w-4 h-4" strokeWidth={2} /> Alta / Cierre</>
                )}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};