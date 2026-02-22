// services/schedule.service.ts
import axiosInstance from '@/lib/axios';
import { ProviderSchedule, TimeBlock, CreateTimeBlockPayload } from '@/types/schedule';

const BASE_URL = '/api/appointments/schedules'; // 🚀 Ajustado

export const scheduleService = {
  /**
   * Obtiene la configuración de la semana laboral del doctor (GET /api/schedules)
   */
  getMySchedule: async (): Promise<ProviderSchedule[]> => {
    const response = await axiosInstance.get<ProviderSchedule[]>(BASE_URL);
    return response.data;
  },

  /**
   * Actualiza (Wipe & Replace) la configuración de la semana laboral (PUT /api/schedules)
   */
  updateSchedule: async (schedules: ProviderSchedule[]): Promise<ProviderSchedule[]> => {
    const response = await axiosInstance.put<ProviderSchedule[]>(BASE_URL, schedules);
    return response.data;
  },

  /**
   * Crea un bloqueo temporal en la agenda (POST /api/schedules/blocks)
   */
  createTimeBlock: async (data: CreateTimeBlockPayload): Promise<TimeBlock> => {
    const response = await axiosInstance.post<TimeBlock>(`${BASE_URL}/blocks`, data);
    return response.data;
  }
};