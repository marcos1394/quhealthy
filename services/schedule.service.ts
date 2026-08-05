// services/schedule.service.ts
import axiosInstance from '@/lib/axios';
import { ProviderSchedule, TimeBlock, CreateTimeBlockPayload } from '@/types/schedule';

const BASE_URL = '/api/appointments/schedules'; // 🚀 Ajustado

export const scheduleService = {
  /**
   * Obtiene la configuración de la semana laboral del doctor o staff para una sede
   */
  getMySchedule: async (locationId: number, staffId?: number): Promise<ProviderSchedule[]> => {
    const response = await axiosInstance.get<ProviderSchedule[]>(`${BASE_URL}/${locationId}`, {
      params: {
        ...(staffId ? { staffId } : {})
      }
    });
    return response.data;
  },

  /**
   * Actualiza (Wipe & Replace) la configuración de la semana laboral por sede y staff
   */
  updateSchedule: async (locationId: number, schedules: ProviderSchedule[], staffId?: number): Promise<ProviderSchedule[]> => {
    const response = await axiosInstance.put<ProviderSchedule[]>(`${BASE_URL}/${locationId}`, schedules, {
      params: {
        ...(staffId ? { staffId } : {})
      }
    });
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
    locationId: number | undefined,
    startDate: string,
    endDate: string,
    durationMinutes: number,
    staffId?: number
  ): Promise<string[]> => {
    const response = await axiosInstance.get<string[]>(
      `${BASE_URL}/${providerId}/available-slots`,
      {
        params: {
          ...(locationId ? { locationId } : {}),
          ...(staffId ? { staffId } : {}),
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
  },

  /**
   * Obtiene los horarios disponibles y los agrupa por fecha.
   * Retorna un objeto: { "2026-02-23": ["09:00", "09:30"], ... }
   */
  getAvailableSlotsForRange: async (
    providerId: number,
    locationId: number | undefined,
    startDate: string,
    endDate: string,
    durationMinutes: number,
    staffId?: number
  ): Promise<Record<string, string[]>> => {
    const response = await axiosInstance.get<string[]>(
      `${BASE_URL}/${providerId}/available-slots`,
      {
        params: {
          ...(locationId ? { locationId } : {}),
          ...(staffId ? { staffId } : {}),
          startDate,
          endDate,
          durationMinutes
        }
      }
    );

    const grouped: Record<string, string[]> = {};
    
    response.data.forEach((dateTimeStr: string) => {
      const [datePart, timePart] = dateTimeStr.split('T');
      const timeStr = timePart.substring(0, 5);
      
      if (!grouped[datePart]) {
        grouped[datePart] = [];
      }
      grouped[datePart].push(timeStr);
    });

    return grouped;
  }
};