import React, { useState } from "react";
import { X, Activity, Save, CheckCircle2, Clock } from "lucide-react";
import { EmergencyQueueItem, emergencyService } from "@/services/emergency.service";
import { toast } from "react-toastify";
import { useSessionStore } from "@/stores/SessionStore";

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
  onUpdate
}) => {
  const { session } = useSessionStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clinicalNotes, setClinicalNotes] = useState({
    subjective: "",
    objective: "",
    assessment: "",
    plan: ""
  });
  const [destination, setDestination] = useState("ALTA");

  if (!isOpen) return null;

  const handleAddNote = async () => {
    if (!session?.id) return;
    setIsSubmitting(true);
    try {
      await emergencyService.addHourlyNote(emergency.appointmentId, {
        providerId: session.id,
        clinicalNotes
      });
      toast.success("Nota de evolución horaria guardada.");
      setClinicalNotes({ subjective: "", objective: "", assessment: "", plan: "" });
      onUpdate();
    } catch (err) {
      toast.error("Error al guardar la nota.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      await emergencyService.completeEmergency(emergency.appointmentId, destination);
      toast.success("Urgencia finalizada y PDF generado con éxito.");
      onUpdate();
      onClose();
    } catch (err) {
      toast.error("Error al finalizar la urgencia.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="bg-gray-900 text-white p-6 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 text-red-400 mb-2">
              <Activity className="w-5 h-5" />
              <span className="font-bold uppercase tracking-wider text-sm">Consola de Urgencias</span>
            </div>
            <h2 className="text-2xl font-bold">{emergency.patientName}</h2>
            <p className="text-gray-400 text-sm mt-1">{emergency.reasonForEmergency}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-gray-50">
          
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              Nueva Nota de Evolución
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">S - Subjetivo</label>
                <textarea 
                  className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  rows={2}
                  value={clinicalNotes.subjective}
                  onChange={(e) => setClinicalNotes({...clinicalNotes, subjective: e.target.value})}
                  placeholder="Síntomas reportados por el paciente..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">O - Objetivo</label>
                <textarea 
                  className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  rows={2}
                  value={clinicalNotes.objective}
                  onChange={(e) => setClinicalNotes({...clinicalNotes, objective: e.target.value})}
                  placeholder="Signos físicos, laboratorios..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">A - Análisis</label>
                  <textarea 
                    className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    rows={2}
                    value={clinicalNotes.assessment}
                    onChange={(e) => setClinicalNotes({...clinicalNotes, assessment: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">P - Plan</label>
                  <textarea 
                    className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    rows={2}
                    value={clinicalNotes.plan}
                    onChange={(e) => setClinicalNotes({...clinicalNotes, plan: e.target.value})}
                  />
                </div>
              </div>
              <button 
                onClick={handleAddNote}
                disabled={isSubmitting}
                className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-bold transition-all"
              >
                <Save className="w-5 h-5" />
                Guardar Evolución por Hora
              </button>
            </div>
          </div>

          <div className="bg-red-50 p-5 rounded-xl border border-red-100">
            <h3 className="font-bold text-red-800 mb-2">Finalizar Evento de Urgencia</h3>
            <p className="text-sm text-red-600 mb-4">
              Al finalizar, se cerrará el reloj de atención y se generará el PDF inalterable requerido por la NOM-004.
            </p>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-xs font-bold text-red-700 uppercase mb-1">Destino del Paciente</label>
                <select 
                  className="w-full border border-red-200 rounded-lg p-3 text-sm outline-none"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                >
                  <option value="ALTA">Alta Médica</option>
                  <option value="HOSPITALIZACIÓN">Ingreso a Hospitalización</option>
                  <option value="TRASLADO">Traslado a otra unidad</option>
                  <option value="DEFUNCION">Defunción</option>
                </select>
              </div>
              <button 
                onClick={handleComplete}
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold transition-all"
              >
                <CheckCircle2 className="w-5 h-5" />
                Alta / Cierre
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
