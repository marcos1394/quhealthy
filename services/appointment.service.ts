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
   * Flujo de paciente (Consumer) -> POST /api/appointments/create
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createAppointment: async (payload: any): Promise<AppointmentResponse> => {
    const response = await axiosInstance.post<AppointmentResponse>(`${BASE_URL}/create`, payload);
    return response.data;
  },

  /**
   * 🩺 Crea una cita desde dashboard del doctor
   * Flujo de provider -> POST /api/appointments/provider/create
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createProviderAppointment: async (payload: any): Promise<AppointmentResponse> => {
    const response = await axiosInstance.post<AppointmentResponse>(`${BASE_URL}/provider/create`, payload);
    return response.data;
  },

  /**
   * ❌ Cancela una cita
   */
  cancelAppointment: async (id: number, reason: string): Promise<AppointmentResponse> => {
    const response = await axiosInstance.patch<AppointmentResponse>(
      `${BASE_URL}/${id}/cancel`, 
      null, 
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
   */
  completeAppointment: async (id: number, notes: string): Promise<AppointmentResponse> => {
    const response = await axiosInstance.patch<AppointmentResponse>(`${BASE_URL}/${id}/complete`, { notes });
    return response.data;
  },

  /**
   * 🔄 Actualiza el estado operativo de una cita
   */
  updateStatus: async (id: string | number, status: string): Promise<AppointmentResponse> => {
    const response = await axiosInstance.patch<AppointmentResponse>(
      `${BASE_URL}/${id}/status`,
      null,
      { params: { status } }
    );
    return response.data;
  },

  /**
   * 📄 Descarga el recibo de la cita en formato PDF
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
      return { MXN: 1, USD: 0.058, EUR: 0.054 }; 
    }
  },

  /**
   * 🚀 NUEVO: Método para preparar la orden híbrida
   * FIX FF-003: Removida la barra duplicada en la interpolación de la ruta.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  prepareHybridOrder: async (payload: any): Promise<any> => {
    const response = await axiosInstance.post(`${BASE_URL}/checkout/prepare`, payload);
    return response.data;
  },

  /**
   * 📱 Obtiene el QR de Check-in con JWT para el paciente
   * GET /api/appointments/{id}/qr-code
   */
  getCheckInQrCode: async (id: number): Promise<Blob> => {
    const response = await axiosInstance.get(`${BASE_URL}/${id}/qr-code`, {
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * 🏥 Procesa el check-in clínico escaneando el QR del paciente (Solo Doctor/Recepción)
   * POST /api/appointments/{id}/checkin?token=
   */
  processCheckIn: async (id: number, token: string): Promise<{ status: string; message: string; appointmentId: string }> => {
    const response = await axiosInstance.post<{ status: string; message: string; appointmentId: string }>(
      `${BASE_URL}/${id}/checkin`,
      null,
      { params: { token } }
    );
    return response.data;
  },

  /**
   * 🛒 Obtiene el historial de compras/órdenes del paciente
   * GET /api/consumer/orders
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getConsumerOrders: async (): Promise<any[]> => {
    const response = await axiosInstance.get('/api/consumer/orders');
    return response.data;
  },

  /**
   * 📋 Obtiene el historial médico del paciente
   * GET /api/patients/me/medical-history
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getPatientMedicalHistory: async (): Promise<any> => {
    const response = await axiosInstance.get('/api/patients/me/medical-history');
    return response.data;
  }
};
