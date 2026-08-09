"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { womensHealthService, PostpartumDashboardResponse } from "@/services/womensHealth.service";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { BabyCareIntegrationWidget } from "./BabyCareIntegrationWidget";
import { PostpartumRecoveryWidget } from "./PostpartumRecoveryWidget";
import { BreastfeedingTrackerWidget } from "./BreastfeedingTrackerWidget";
import { UnifiedAppointmentsWidget } from "./UnifiedAppointmentsWidget";

export function PostpartumDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<PostpartumDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await womensHealthService.getPostpartumDashboard(user.id);
      setData(res);
    } catch (e) {
      console.error("Error fetching postpartum dashboard", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [user]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <QhSpinner size="lg" />
        <p className="mt-4 text-gray-500">Cargando tu seguimiento de postparto...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl p-8 border border-gray-100 dark:border-gray-800 text-center">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No se encontró seguimiento activo</h3>
        <p className="text-gray-500">Inicia tu etapa de postparto para llevar el control tuyo y de tu bebé.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-pink-50 dark:bg-pink-900/10 p-6 rounded-3xl border border-pink-100 dark:border-pink-900/30">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Etapa de Postparto</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Recuperación de la madre y cuidados del recién nacido
          </p>
        </div>
      </div>

      <BabyCareIntegrationWidget 
        babyProfile={data.babyProfile} 
        latestBabyWeight={data.latestBabyWeight} 
        nextVaccine={data.nextVaccine} 
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PostpartumRecoveryWidget 
          logs={data.logs} 
          onAddLog={() => { /* Modal for physical/emotional log */ }} 
        />
        <BreastfeedingTrackerWidget 
          logs={data.logs} 
          onAddLog={() => { /* Modal for breastfeeding log */ }} 
        />
      </div>

      <UnifiedAppointmentsWidget appointments={data.upcomingAppointments} />
    </div>
  );
}
