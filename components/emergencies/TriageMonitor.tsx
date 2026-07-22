import React, { useEffect, useState } from "react";
import { EmergencyQueueItem, TriageLevel } from "@/services/emergency.service";
import { Clock, User, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface TriageMonitorProps {
  queue: EmergencyQueueItem[];
  onPatientSelect: (emergency: EmergencyQueueItem) => void;
}

const getTriageColor = (level: TriageLevel) => {
  switch (level) {
    case TriageLevel.LEVEL_1_RESUSCITATION:
      return "bg-red-500 text-white border-red-700";
    case TriageLevel.LEVEL_2_EMERGENT:
      return "bg-orange-500 text-white border-orange-700";
    case TriageLevel.LEVEL_3_URGENT:
      return "bg-yellow-400 text-gray-900 border-yellow-600";
    case TriageLevel.LEVEL_4_LESS_URGENT:
      return "bg-green-500 text-white border-green-700";
    case TriageLevel.LEVEL_5_NON_URGENT:
      return "bg-blue-500 text-white border-blue-700";
    default:
      return "bg-gray-200 text-gray-700 border-gray-400";
  }
};

const getTriageLabel = (level: TriageLevel) => {
  switch (level) {
    case TriageLevel.LEVEL_1_RESUSCITATION:
      return "Nivel 1 - Inmediato";
    case TriageLevel.LEVEL_2_EMERGENT:
      return "Nivel 2 - Emergencia";
    case TriageLevel.LEVEL_3_URGENT:
      return "Nivel 3 - Urgencia";
    case TriageLevel.LEVEL_4_LESS_URGENT:
      return "Nivel 4 - Menos Urgente";
    case TriageLevel.LEVEL_5_NON_URGENT:
      return "Nivel 5 - No Urgente";
    default:
      return "Pendiente de Triage";
  }
};

export const TriageMonitor: React.FC<TriageMonitorProps> = ({
  queue,
  onPatientSelect,
}) => {
  const [now, setNow] = useState(new Date());

  // Reloj activo para actualizar tiempos de espera
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimeElapsed = (startedAt: string | null) => {
    if (!startedAt) return "00:00:00";
    const start = new Date(startedAt).getTime();
    const diff = Math.floor((now.getTime() - start) / 1000);
    if (diff < 0) return "00:00:00";
    const h = Math.floor(diff / 3600)
      .toString()
      .padStart(2, "0");
    const m = Math.floor((diff % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const s = Math.floor(diff % 60)
      .toString()
      .padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  return (
    <div className="flex-1 overflow-y-auto">
      {queue.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-gray-400">
          <Clock className="w-16 h-16 mb-4 opacity-50" />
          <p className="text-xl font-medium">
            No hay pacientes en la sala de urgencias
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {queue.map((item) => (
            <div
              key={item.appointmentId}
              onClick={() => onPatientSelect(item)}
              className={cn(
                "rounded-2xl border-2 p-5 cursor-pointer hover:shadow-xl transition-all hover:-translate-y-1 bg-white relative overflow-hidden",
                item.triageLevel
                  ? getTriageColor(item.triageLevel)
                  : "border-gray-200",
              )}
            >
              {/* Triage Badge Indicator */}
              <div className="absolute top-0 right-0 bg-black/10 px-3 py-1 rounded-bl-lg text-xs font-bold uppercase tracking-wide">
                {getTriageLabel(item.triageLevel)}
              </div>

              <div className="flex items-center gap-3 mb-4 mt-2">
                <div className="bg-white/20 p-2 rounded-full">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight truncate max-w-[200px]">
                    {item.patientName}
                  </h3>
                  <p className="text-xs opacity-80 uppercase tracking-wide">
                    {item.status === "WAITING_ROOM"
                      ? "En Espera"
                      : "En Atención"}
                  </p>
                </div>
              </div>

              <div className="space-y-2 mb-6">
                <div className="bg-black/10 rounded-lg p-3">
                  <p className="text-xs font-semibold opacity-70 uppercase mb-1">
                    Motivo
                  </p>
                  <p className="font-medium text-sm line-clamp-2">
                    {item.reasonForEmergency || "Pendiente de evaluación"}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-black/10 pt-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 opacity-70" />
                  <span className="font-mono font-bold tracking-widest">
                    {formatTimeElapsed(item.triageStartedAt || item.arrivedAt)}
                  </span>
                </div>
                <ArrowRight className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
