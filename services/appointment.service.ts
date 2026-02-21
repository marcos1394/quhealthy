// services/appointment.service.ts
import axiosInstance from '@/lib/axios';
import { Appointment, ReschedulePayload } from '@/types/appointments';

const BASE_URL = '/api/appointments';

// Interfaz para la respuesta paginada de Spring Data
interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
}

export const appointmentService = {
  
  /**
   * Obtiene mis citas (Auto-detecta si eres Doctor o Paciente por el token)
   */
  getMyAppointments: async (): Promise<Appointment[]> => {
    // Pedimos hasta 500 citas para pintar el mes completo
    const response = await axiosInstance.get<PageResponse<Appointment>>(`${BASE_URL}?size=500&sort=startTime,asc`);
    return response.data.content;
  },

  /**
   * Cancela una cita
   */
  cancelAppointment: async (id: number, reason: string): Promise<Appointment> => {
    const response = await axiosInstance.patch<Appointment>(`${BASE_URL}/${id}/cancel?reason=${encodeURIComponent(reason)}`);
    return response.data;
  },

  /**
   * Reprograma una cita (Ideal para el Drag & Drop del calendario)
   */
  rescheduleAppointment: async (id: number, payload: ReschedulePayload): Promise<Appointment> => {
    const response = await axiosInstance.post<Appointment>(`${BASE_URL}/${id}/reschedule`, payload);
    return response.data;
  },

  /**
   * Marca la cita como completada (Solo Doctor)
   */
  completeAppointment: async (id: number, notes: string): Promise<Appointment> => {
    const response = await axiosInstance.patch<Appointment>(`${BASE_URL}/${id}/complete`, { notes });
    return response.data;
  }
};