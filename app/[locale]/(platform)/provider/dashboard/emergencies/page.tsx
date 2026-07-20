"use client"
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Clock, Activity, FileText, UserPlus, FileCheck } from "lucide-react";
import { useSessionStore } from "@/stores/SessionStore";
import { emergencyService, EmergencyQueueItem, TriageLevel } from "@/services/emergency.service";
import { toast } from "react-toastify";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { cn } from "@/lib/utils";

// Mock component placeholders, to be created next
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

  const fetchQueue = async () => {
    if (!user?.id) return;
    try {
      // In a real scenario we'd use useQuery, but fetching directly here for simplicity
      const data = await emergencyService.getEmergencyQueue(user.id);
      setQueue(data);
    } catch (error) {
      console.error(error);
      toast.error("Error al cargar la cola de urgencias");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
    // Auto-refresh the queue every 30 seconds
    const interval = setInterval(fetchQueue, 30000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const handlePatientSelect = (emergency: EmergencyQueueItem) => {
    setSelectedEmergency(emergency);
    setIsConsoleOpen(true);
  };

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center"><QhSpinner size="lg" /></div>;
  }

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-red-500" />
            Urgencias y Triage
          </h1>
          <p className="text-gray-500 mt-2 font-medium">
            Monitor central de pacientes en sala de emergencias (Cumplimiento NOM-004)
          </p>
        </div>
        <button 
          onClick={() => setIsRegisterModalOpen(true)}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-xl font-bold transition-all shadow-lg shadow-red-500/30"
        >
          <UserPlus className="w-5 h-5" />
          Ingresar Paciente
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm overflow-hidden flex flex-col">
        <TriageMonitor 
          queue={queue} 
          onPatientSelect={handlePatientSelect} 
        />
      </div>

      {/* Modals & Slide-overs */}
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
