"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useState, useEffect, useCallback } from "react";
import { AlertTriangle, UserPlus, Activity } from "lucide-react";
import { toast } from "react-toastify";

import { useSessionStore } from "@/stores/SessionStore";
import { emergencyService, EmergencyQueueItem } from "@/services/emergency.service";
import { QhSpinner } from "@/components/ui/QhSpinner";

import { TriageMonitor } from "@/components/emergencies/TriageMonitor";
import { EmergencyConsole } from "@/components/emergencies/EmergencyConsole";
import { RegisterEmergencyModal } from "@/components/emergencies/RegisterEmergencyModal";

export default function EmergenciesPage() {
  const { user } = useSessionStore();
  const [queue, setQueue] = useState<EmergencyQueueItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEmergency, setSelectedEmergency] = useState<EmergencyQueueItem | null>(null);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);

  const fetchQueue = useCallback(async () => {
    if (!user?.id) return;
    try {
      const data = await emergencyService.getEmergencyQueue(user.id);
      setQueue(data);
    } catch (error) {
      console.error(error);
      toast.error("Error al cargar la cola de urgencias");
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchQueue();
    // Auto-actualización de la cola cada 30 segundos
    const interval = setInterval(fetchQueue, 30000);
    return () => clearInterval(interval);
  }, [fetchQueue]);

  const handlePatientSelect = (emergency: EmergencyQueueItem) => {
    setSelectedEmergency(emergency);
    setIsConsoleOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 bg-gray-50/50 dark:bg-[#050505]">
        <QhSpinner size="lg" className="text-red-600 dark:text-red-400" />
        <p className="text-sm font-semibold text-gray-500 animate-pulse">Sincronizando sala de urgencias...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] pt-8 px-4 md:px-10 pb-16 transition-colors duration-500">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 flex items-center justify-center shrink-0 shadow-sm">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" strokeWidth={2} />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1">
                Atención Médica Inmediata • NOM-004
              </p>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white leading-none">
                Urgencias y Triage
              </h1>
            </div>
          </div>

          <button 
            type="button"
            onClick={() => setIsRegisterModalOpen(true)}
            className="h-12 px-6 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors shadow-sm flex items-center justify-center gap-2 text-xs md:text-sm shrink-0"
          >
            <UserPlus className="w-4 h-4" strokeWidth={2} />
            <span>Ingresar Paciente</span>
          </button>
        </div>

        {/* --- MONITOR CENTRAL DE SANGRE / SENSADO --- */}
        <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 flex flex-col rounded-3xl shadow-sm overflow-hidden min-h-[600px] min-w-0">
          <div className="p-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] flex items-center justify-between shrink-0">
            <h2 className="text-xs md:text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
              <Activity className="w-4 h-4 text-red-600 dark:text-red-400" strokeWidth={2} /> 
              Monitor Sala de Espera
            </h2>
            <span className="text-xs font-semibold text-gray-500 bg-white dark:bg-[#0a0a0a] px-3 py-1 rounded-full border border-gray-200 dark:border-gray-800 shadow-sm">
              {queue.length} Pacientes en Espera
            </span>
          </div>

          <div className="p-6 flex-1 flex flex-col min-w-0 overflow-x-auto">
            <TriageMonitor 
              queue={queue} 
              onPatientSelect={handlePatientSelect} 
            />
          </div>
        </div>

      </div>

      {/* --- MODALES Y SLIDE-OVERS --- */}
      <RegisterEmergencyModal 
        isOpen={isRegisterModalOpen} 
        onClose={() => setIsRegisterModalOpen(false)} 
        onSuccess={() => {
          setIsRegisterModalOpen(false);
          fetchQueue();
          toast.success("Paciente ingresado a urgencias correctamente");
        }}
      />
      
      {selectedEmergency && (
        <EmergencyConsole
          isOpen={isConsoleOpen}
          onClose={() => setIsConsoleOpen(false)}
          emergency={selectedEmergency}
          onUpdate={fetchQueue}
        />
      )}
    </div>
  );
}