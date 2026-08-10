"use client";

import React, { useState, useEffect } from "react";
import { DiagnosisAndStagingWidget, OncologyProfileDto } from "@/components/patient/oncology/DiagnosisAndStagingWidget";
import { TreatmentManager, TreatmentDto } from "@/components/patient/health-record/TreatmentManager";
import { treatmentService } from "@/services/treatment.service";
import { oncologyService } from "@/services/oncology.service";
import { Ribbon, Activity, FileText } from "lucide-react";
import { useSessionStore } from "@/stores/SessionStore";

import { medicalTeamService, MedicalTeamMemberDto } from "@/services/medical-team.service";

export default function OncologyDashboardPage() {
  const { user } = useSessionStore();
  const [profile, setProfile] = useState<OncologyProfileDto | null>(null);
  const [treatments, setTreatments] = useState<TreatmentDto[]>([]);
  const [medicalTeam, setMedicalTeam] = useState<MedicalTeamMemberDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user?.id) return;
      try {
        const [profData, treatmentsData, teamData] = await Promise.all([
          oncologyService.getProfile(user.id),
          treatmentService.getMyTreatments(),
          medicalTeamService.getOncologyTeam().catch(() => []) // Fallback in case endpoint is not up
        ]);
        setProfile(profData);
        setTreatments(treatmentsData);
        setMedicalTeam(teamData);
      } catch (err) {
        console.error("Failed to load oncology dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="p-10 text-center text-gray-500">Cargando...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-6">
      <div className="flex items-center gap-4 mb-8 border-b border-gray-100 dark:border-gray-800 pb-6">
        <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500 rounded-2xl flex items-center justify-center">
          <Ribbon className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Oncology Journey</h1>
          <p className="text-gray-500 font-medium mt-1">
            Monitoreo clínico, estadificación y tratamientos oncológicos
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {profile && <DiagnosisAndStagingWidget profile={profile} />}
          
          <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
             <div className="flex items-center gap-2 mb-6">
               <Activity className="w-6 h-6 text-emerald-500" />
               <h2 className="text-xl font-bold text-gray-900 dark:text-white">Terapias Oncológicas Activas</h2>
             </div>
             <p className="text-sm text-gray-500 mb-6">
               Estos tratamientos se sincronizan automáticamente con tu <span className="font-semibold text-emerald-600">Gestor de Tratamientos Centralizado</span>. Si marcas un medicamento aquí, se actualizará en todo tu expediente.
             </p>
             <TreatmentManager 
                treatments={treatments.filter(t => t.category === "ONCOLOGY")} 
                onAddManual={() => alert("Para agregar manual ve al Gestor de Tratamientos")} 
             />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-900 dark:bg-black rounded-3xl p-6 text-white border border-gray-800 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10">
               <Ribbon className="w-24 h-24" />
             </div>
             <h3 className="text-lg font-bold mb-2">
               {medicalTeam.length > 0 && medicalTeam[0].assigned
                 ? "Mi Equipo Médico"
                 : "Especialistas Oncológicos Recomendados"}
             </h3>
             <p className="text-sm text-gray-400 mb-4">
               {medicalTeam.length > 0 && medicalTeam[0].assigned
                 ? "No estás solo en esto. Tu equipo multidisciplinario está conectado a QuHealthy."
                 : "Aún no tienes oncólogos asignados. Te sugerimos estos especialistas de QuHealthy:"}
             </p>
             <div className="space-y-3">
               {medicalTeam.length === 0 ? (
                 <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 text-center">
                   <p className="text-sm text-gray-400">Aún no tienes especialistas oncológicos asignados a tu expediente.</p>
                 </div>
               ) : (
                 medicalTeam.map((member) => (
                   <div key={member.id} className="bg-gray-800/50 rounded-xl p-3 border border-gray-700">
                     <p className="font-semibold text-sm">
                       {member.firstName} {member.lastName}
                     </p>
                     <p className="text-xs text-gray-400">{member.specialty}</p>
                   </div>
                 ))
               )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
