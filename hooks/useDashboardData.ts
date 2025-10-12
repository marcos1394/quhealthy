/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import useSWR from 'swr';
import axios from 'axios';
import { subMonths, startOfMonth, endOfMonth, format } from 'date-fns';

// Definimos la estructura de datos que esperamos del nuevo endpoint
interface DashboardData {
  analytics: {
    monthlyRevenue: number;
    completedAppointments: number;
    newClients: number;
  };
  upcomingAppointments: any[];
  verificationStatus: any;
}

const fetcher = (url: string) => axios.get(url, { withCredentials: true }).then(res => res.data);

export const useDashboardData = (dateRange: string) => {
  // Construimos la URL con los parámetros de fecha
  let query = '';
  if (dateRange !== 'all_time') {
    const now = new Date();
    let startDate, endDate;
    if (dateRange === 'last_month') {
      const lastMonth = subMonths(now, 1);
      startDate = startOfMonth(lastMonth);
      endDate = endOfMonth(lastMonth);
    } else { // 'this_month'
      startDate = startOfMonth(now);
      endDate = endOfMonth(now);
    }
    query = `?startDate=${format(startDate, 'yyyy-MM-dd')}&endDate=${format(endDate, 'yyyy-MM-dd')}`;
  }
  
  // La clave de SWR ahora incluye el rango, para que se recargue al cambiar
  const { data, error, isLoading, mutate } = useSWR<DashboardData>(`/api/provider/dashboard/data${query}`, fetcher);

  return {
    data,
    isLoading,
    error,
    refetch: mutate,
  };
};