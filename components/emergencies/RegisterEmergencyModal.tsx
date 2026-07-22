import React, { useState } from "react";
import { X, UserPlus } from "lucide-react";
import { emergencyService } from "@/services/emergency.service";
import { useSessionStore } from "@/stores/SessionStore";
import { toast } from "react-toastify";

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

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !patientId) return;

    setIsSubmitting(true);
    try {
      // Registrar cita de emergencia
      const appt = await emergencyService.registerEmergencyWalkIn(
        user.id,
        Number(patientId),
      );

      // Detonar triage inmediatamente (inicia el reloj de triage)
      await emergencyService.startTriage(appt.id);

      onSuccess();
    } catch (err) {
      toast.error("Error al registrar paciente en urgencias");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-red-500" />
            Ingresar a Urgencias (Walk-in)
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              ID del Directorio de Pacientes
            </label>
            <input
              type="number"
              required
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Ej: 1045"
            />
            <p className="text-xs text-gray-500 mt-1">
              En una implementación completa, aquí habría un buscador de
              pacientes.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-all"
          >
            {isSubmitting ? "Registrando..." : "Registrar e Iniciar Triage"}
          </button>
        </form>
      </div>
    </div>
  );
};
