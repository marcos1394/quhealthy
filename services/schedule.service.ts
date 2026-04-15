// services/schedule.service.ts
import axiosInstance from '@/lib/axios';
import { ProviderSchedule, TimeBlock, CreateTimeBlockPayload } from '@/types/schedule';

const BASE_URL = '/api/appointments/schedules'; // 🚀 Ajustado

export const scheduleService = {
  /**
   * Obtiene la configuración de la semana laboral del doctor para una sede
   * 🚀 FIX: Ahora pasa locationId como path param (GET /schedules/{locationId})
   */
  getMySchedule: async (locationId: number): Promise<ProviderSchedule[]> => {
    const response = await axiosInstance.get<ProviderSchedule[]>(`${BASE_URL}/${locationId}`);
    return response.data;
  },

  /**
   * Actualiza (Wipe & Replace) la configuración de la semana laboral por sede
   * 🚀 FIX: Ahora pasa locationId como path param (PUT /schedules/{locationId})
   */
  updateSchedule: async (locationId: number, schedules: ProviderSchedule[]): Promise<ProviderSchedule[]> => {
    const response = await axiosInstance.put<ProviderSchedule[]>(`${BASE_URL}/${locationId}`, schedules);
    return response.data;
  },

  /**
   * Crea un bloqueo temporal en la agenda (POST /schedules/blocks)
   */
  createTimeBlock: async (data: CreateTimeBlockPayload): Promise<TimeBlock> => {
    const response = await axiosInstance.post<TimeBlock>(`${BASE_URL}/blocks`, data);
    return response.data;
  },

  /**
   * 📅 PÚBLICO: Obtiene los horarios disponibles reales para un doctor en una sede
   * Cruza la agenda base con Google Calendar y citas existentes.
   * 🚀 FIX: Ahora pasa locationId como query param requerido
   */
  getAvailableSlots: async (
    providerId: number,
    locationId: number,
    startDate: string,
    endDate: string,
    durationMinutes: number
  ): Promise<string[]> => {
    const response = await axiosInstance.get<string[]>(
      `${BASE_URL}/${providerId}/available-slots`,
      {
        params: {
          locationId,
          startDate,
          endDate,
          durationMinutes
        }
      }
    );

    // El backend devuelve un array de LocalDateTime: ["2026-02-23T09:00:00", "2026-02-23T09:30:00"]
    // Lo mapeamos aquí mismo para devolverle al UI solo las horas ("09:00", "09:30")
    return response.data.map((dateTimeStr: string) => {
      return dateTimeStr.split('T')[1].substring(0, 5); 
    });
  }

};