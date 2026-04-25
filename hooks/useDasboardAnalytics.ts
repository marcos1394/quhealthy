/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '@/lib/axios';

// Define la estructura de los datos de analíticas
export interface AnalyticsData {
  monthlyRevenue: number;
  completedAppointments: number;
  newClients: number;
}

export const useDashboardAnalytics = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get<AnalyticsData>('/api/provider/dashboard/analytics');
      setData(response.data);
    } catch (err) {
      setError("No se pudieron cargar las analíticas.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
};