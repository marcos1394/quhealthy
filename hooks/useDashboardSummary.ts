"use client";

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// Define la estructura de los datos que el dashboard espera
// Esto debe coincidir con la respuesta de tu endpoint
interface SummaryCards {
  todayAppointments: number;
  unreadMessages: number;
  monthlyRevenue: number;
}
interface Appointment {
  id: number;
  clientName: string;
  time: string;
  service: string;
}
interface VerificationStatus {
  kyc: { isComplete: boolean; status: string; };
  license?: { isComplete: boolean; status: string; };
}
export interface DashboardData {
  summaryCards: SummaryCards;
  upcomingAppointments: Appointment[];
  verificationStatus: VerificationStatus;
}

export const useDashboardSummary = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get<DashboardData>('/api/auth/dashboard-summary', {
        withCredentials: true,
      });
      setData(response.data);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError("No se pudieron cargar los datos del dashboard.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
};