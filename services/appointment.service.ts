// services/appointment.service.ts
import axiosInstance from '@/lib/axios';
import { Appointment, ReschedulePayload } from '@/types/appointments';

const BASE_URL = '/api/appointments';

interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
}

export const appointmentService = {
  
  /**
   * Obtiene mis citas
   * 🚀 CAMBIO: Apunta a /list para evitar errores de ruteo
   */
  getMyAppointments: async (): Promise<Appointment[]> => {
    const response = await axiosInstance.get<PageResponse<Appointment>>(
      `${BASE_URL}/list?size=500&sort=startTime,asc`
    );
    return response.data.content;
  },

  /**
   * Crea una nueva reserva
   * 🚀 CAMBIO: Apunta a /create
   */
  createAppointment: async (payload: any): Promise<Appointment> => {
    const response = await axiosInstance.post<Appointment>(`${BASE_URL}/create`, payload);
    return response.data;
  },

  /**
   * Cancela una cita
   */
  cancelAppointment: async (id: number, reason: string): Promise<Appointment> => {
    const response = await axiosInstance.patch<Appointment>(
      `${BASE_URL}/${id}/cancel?reason=${encodeURIComponent(reason)}`
    );
    return response.data;
  },

  /**
   * Reprograma una cita
   */
  rescheduleAppointment: async (id: number, payload: ReschedulePayload): Promise<Appointment> => {
    const response = await axiosInstance.post<Appointment>(`${BASE_URL}/${id}/reschedule`, payload);
    return response.data;
  },

  /**
   * Marca la cita como completada
   */
  completeAppointment: async (id: number, notes: string): Promise<Appointment> => {
    const response = await axiosInstance.patch<Appointment>(`${BASE_URL}/${id}/complete`, { notes });
    return response.data;
  }
};