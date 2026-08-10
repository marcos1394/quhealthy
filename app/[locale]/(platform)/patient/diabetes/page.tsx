"use client";

import React, { useState, useEffect } from "react";
import { DiabetesProfileWidget } from "@/components/patient/diabetes/DiabetesProfileWidget";
import { GlucoseLogWidget } from "@/components/patient/diabetes/GlucoseLogWidget";
import { GlucoseRangeChart } from "@/components/patient/diabetes/GlucoseRangeChart";
import { diabetesService, DiabetesProfileDto, DiabetesLogDto } from "@/services/diabetes.service";
import { Activity, Syringe, Plus } from "lucide-react";
import { useSessionStore } from "@/stores/SessionStore";
import { toast } from "react-toastify";

export default function DiabetesDashboardPage() {
  const { user } = useSessionStore();
  const [profile, setProfile] = useState<DiabetesProfileDto | null>(null);
  const [logs, setLogs] = useState<DiabetesLogDto[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const [profData, logsData] = await Promise.all([
        diabetesService.getProfile(user.id).catch(() => null),
        diabetesService.getLogs(user.id).catch(() => [])
      ]);
      setProfile(profData);
      setLogs(logsData);
    } catch (err) {
      console.error("Failed to load diabetes dashboard:", err);
      toast.error("Error al cargar la información de diabetes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.id]);

  if (loading) return <div className="p-10 text-center text-gray-500">Cargando...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-6">
      <div className="flex items-center gap-4 mb-8 border-b border-gray-100 dark:border-gray-800 pb-6">
        <div className="w-14 h-14 bg-pink-100 dark:bg-pink-900/30 text-pink-500 rounded-2xl flex items-center justify-center">
          <Activity className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Diabetes Journey</h1>
          <p className="text-gray-500 font-medium mt-1">
            Monitoreo clínico, glucosa y control metabólico
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {profile ? (
            <DiabetesProfileWidget profile={profile} />
          ) : (
            <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm text-center">
              <Activity className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No hay perfil registrado</h3>
              <p className="text-gray-500 text-sm mb-4">No se encontró un perfil diabetológico asociado a tu cuenta.</p>
              {/* Optional: Add button to create profile or link to settings */}
            </div>
          )}

          <div className="h-[400px]">
            <GlucoseRangeChart 
              logs={logs} 
              targetMin={70} 
              targetMax={profile?.targetPostprandialGlucose || 180} 
            />
          </div>
        </div>

        <div className="lg:col-span-1 h-[700px]">
          <GlucoseLogWidget logs={logs} onLogAdded={loadData} />
        </div>
      </div>
    </div>
  );
}
