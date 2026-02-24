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
   * 🔍 NUEVO: Obtiene los detalles de una cita específica por su ID
   */
  getAppointmentById: async (id: string | number): Promise<Appointment> => {
    const response = await axiosInstance.get<Appointment>(`${BASE_URL}/${id}`);
    return response.data;
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
  },

  /**
   * 📄 NUEVO: Descarga el recibo de la cita en PDF (si el backend lo soporta)
   */
  downloadInvoice: async (id: string | number): Promise<Blob> => {
    const response = await axiosInstance.get(`${BASE_URL}/${id}/invoice-pdf`, {
      responseType: 'blob', // Crítico para manejar archivos
    });
    return response.data;
  },

  /**
   * 📱 NUEVO: Descarga el código QR para Check-in como una imagen
   */
  getQrCode: async (id: string | number): Promise<Blob> => {
    const response = await axiosInstance.get(`${BASE_URL}/${id}/qr`, {
      responseType: 'blob', // Retorna la imagen cruda
    });
    return response.data;
  },

  /**
   * Obtiene las tasas de cambio del día
   * Retorna un mapa, ej: { "MXN": 1, "USD": 0.057, "EUR": 0.052 }
   */
  getExchangeRates: async (): Promise<Record<string, number>> => {
    try {
      const response = await axiosInstance.get<Record<string, number>>(`${BASE_URL}/exchange-rates`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener tasas de cambio:', error);
      // Fallback estático en caso de que la red falle para no romper la UI
      return { MXN: 1, USD: 0.058, EUR: 0.054 }; 
    }
  }
};