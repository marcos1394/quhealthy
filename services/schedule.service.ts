// services/schedule.service.ts
import axiosInstance from '@/lib/axios';
import { ProviderSchedule, TimeBlock, CreateTimeBlockPayload } from '@/types/schedule';

const BASE_URL = '/api/schedules';

export const scheduleService = {
  
  // -- HORARIOS BASE --
  getMySchedule: async (): Promise<ProviderSchedule[]> => {
    const response = await axiosInstance.get<ProviderSchedule[]>(BASE_URL);
    return response.data;
  },

  updateSchedule: async (schedules: ProviderSchedule[]): Promise<ProviderSchedule[]> => {
    const response = await axiosInstance.put<ProviderSchedule[]>(BASE_URL, schedules);
    return response.data;
  },

  // -- BLOQUEOS DE TIEMPO (VACACIONES/PERMISOS) --
  createTimeBlock: async (data: CreateTimeBlockPayload): Promise<TimeBlock> => {
    // 🚀 POST /api/schedules/blocks
    const response = await axiosInstance.post<TimeBlock>(`${BASE_URL}/blocks`, data);
    return response.data;
  }
};