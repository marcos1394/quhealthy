// src/services/appointment.service.ts
import axiosInstance from '@/lib/axios';
import { 
  AppointmentResponse, 
  ProviderAppointment, 
  ReschedulePayload, 
  PageResponse 
} from '@/types/appointments';

const BASE_URL = '/api/appointments';

/**
 * Servicio encargado de la gestión de citas (Appointments)
 * Tanto para pacientes (Consumers) como para doctores (Providers).
 */
export const appointmentService = {
  
  /**
   * 📅 Obtiene el historial y próximas citas del Paciente (Consumer)
   * Retorna el objeto completo de paginación (PageResponse) para soportar 
   * scroll infinito o botones "Siguiente" en el futuro.
   */
  getMyAppointments: async (page = 0, size = 500): Promise<PageResponse<AppointmentResponse>> => {
    const response = await axiosInstance.get<PageResponse<AppointmentResponse>>(
      `${BASE_URL}/list`, {
        params: {
          page,
          size,
          sort: 'startTime,desc'
        }
      }
    );
    return response.data;
  },

  /**
   * 🔍 Obtiene los detalles extendidos de una cita específica por su ID
   */
  getAppointmentById: async (id: string | number): Promise<AppointmentResponse> => {
    const response = await axiosInstance.get<AppointmentResponse>(`${BASE_URL}/${id}`);
    return response.data;
  },

  /**
   * 🆕 Crea una nueva reserva (Booking)
   * El payload debe cumplir con los requisitos del backend (serviceId, startTime, etc.)
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createAppointment: async (payload: any): Promise<AppointmentResponse> => {
    const response = await axiosInstance.post<AppointmentResponse>(`${BASE_URL}/create`, payload);
    return response.data;
  },

  /**
   * ❌ Cancela una cita
   * Soporta el envío de un motivo (reason) como parámetro de consulta
   */
  cancelAppointment: async (id: number, reason: string): Promise<AppointmentResponse> => {
    const response = await axiosInstance.patch<AppointmentResponse>(
      `${BASE_URL}/${id}/cancel`, 
      null, // Body vacío porque va por query param en el backend
      { params: { reason } }
    );
    return response.data;
  },

  /**
   * ⏳ Reprograma una cita existente a un nuevo horario
   */
  rescheduleAppointment: async (id: number, payload: ReschedulePayload): Promise<AppointmentResponse> => {
    const response = await axiosInstance.post<AppointmentResponse>(`${BASE_URL}/${id}/reschedule`, payload);
    return response.data;
  },

  /**
   * ✅ Finaliza una cita (Solo para Providers)
   * Permite adjuntar notas clínicas o de seguimiento.
   */
  completeAppointment: async (id: number, notes: string): Promise<AppointmentResponse> => {
    const response = await axiosInstance.patch<AppointmentResponse>(`${BASE_URL}/${id}/complete`, { notes });
    return response.data;
  },

  /**
   * 📄 Descarga el recibo de la cita en formato PDF
   * Retorna un Blob que el navegador puede convertir en descarga o vista previa.
   */
  downloadInvoice: async (id: string | number): Promise<Blob> => {
    const response = await axiosInstance.get(`${BASE_URL}/${id}/invoice-pdf`, {
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * 🩺 Obtiene la lista de citas para la agenda del Proveedor (Doctor)
   */
  getProviderAppointments: async (): Promise<ProviderAppointment[]> => {
    const response = await axiosInstance.get<ProviderAppointment[]>(`${BASE_URL}/provider`);
    return response.data;
  },

  /**
   * 📱 Obtiene el código QR para validación rápida o Check-in
   */
  getQrCode: async (id: string | number): Promise<Blob> => {
    const response = await axiosInstance.get(`${BASE_URL}/${id}/qr`, {
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * 💱 Obtiene las tasas de cambio vigentes para pagos multimoneda
   */
  getExchangeRates: async (): Promise<Record<string, number>> => {
    try {
      const response = await axiosInstance.get<Record<string, number>>(`${BASE_URL}/exchange-rates`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener tasas de cambio:', error);
      // Fallback estático de seguridad para evitar bloqueos en la UI de pago
      return { MXN: 1, USD: 0.058, EUR: 0.054 }; 
    }
  }
};