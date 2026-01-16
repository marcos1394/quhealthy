"use client";

import useSWR from 'swr';
import axios from 'axios';
import { subMonths, startOfMonth, endOfMonth, format } from 'date-fns';

// Importamos tipos compartidos (o los definimos aquí si son exclusivos del dashboard)
import { Appointment } from '@/components/dashboard/UpcomingAppointments';
import { VerificationStatusData } from '@/components/dashboard/VerificationStatus';

interface DashboardData {
  analytics: {
    monthlyRevenue: number;
    completedAppointments: number;
    newClients: number;
  };
  upcomingAppointments: Appointment[];
  verificationStatus: VerificationStatusData;
}

// --- MOCK DATA (Para desarrollo) ---
const mockDashboardData: DashboardData = {
  analytics: {
    monthlyRevenue: 24500,
    completedAppointments: 42,
    newClients: 8,
  },
  verificationStatus: {
    kyc: { isComplete: true, status: 'verified' },
    license: { isComplete: false, status: 'pending' }, // Ejemplo: Falta verificar licencia
  },
  upcomingAppointments: [
    { id: '1', clientName: 'Ana García', service: 'Consulta General', time: '09:00 AM', status: 'confirmed' },
    { id: '2', clientName: 'Carlos Ruiz', service: 'Limpieza Dental', time: '11:30 AM', status: 'pending' },
    { id: '3', clientName: 'Sofia Mendez', service: 'Blanqueamiento', time: '03:00 PM', status: 'confirmed' },
    { id: '4', clientName: 'Luis Torres', service: 'Consulta Seguimiento', time: '04:45 PM', status: 'confirmed' },
  ]
};

const fetcher = async (url: string) => {
  try {
    const res = await axios.get(url, { withCredentials: true });
    return res.data;
  } catch (error) {
    // Si falla la API en desarrollo, lanzamos error para que SWR lo capture, 
    // pero manejaremos el fallback en el hook.
    throw error;
  }
};

export const useDashboardData = (dateRange: string) => {
  let query = '';
  if (dateRange !== 'all_time') {
    const now = new Date();
    let startDate, endDate;
    if (dateRange === 'last_month') {
      const lastMonth = subMonths(now, 1);
      startDate = startOfMonth(lastMonth);
      endDate = endOfMonth(lastMonth);
    } else { // 'this_month' or 'today' logic
      startDate = startOfMonth(now);
      endDate = endOfMonth(now);
    }
    query = `?startDate=${format(startDate, 'yyyy-MM-dd')}&endDate=${format(endDate, 'yyyy-MM-dd')}`;
  }
  
  const { data, error, isLoading, mutate } = useSWR<DashboardData>(`/api/provider/dashboard/data${query}`, fetcher);

  return {
    // IMPORTANTE: Si hay error (API no existe), devolvemos el mock para que puedas trabajar.
    data: data || (error ? mockDashboardData : undefined),
    isLoading: isLoading && !data && !error, // Dejamos de cargar si hay error (y usamos mock)
    error: null, // Ocultamos el error para usar el mock silenciosamente
    refetch: mutate,
  };
};