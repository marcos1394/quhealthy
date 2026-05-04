import axios from 'axios';

// Usamos la variable de entorno que ya tienes configurada en tu proyecto
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.quhealthy.org';

export const publicService = {
  /**
   * Descarga la receta pública validando los últimos 4 dígitos del celular.
   */
  verifyAndDownloadPrescription: async (appointmentId: number, phoneLast4: string): Promise<Blob> => {
    const response = await axios.post(
      `${API_URL}/api/appointments/public/${appointmentId}/prescription/pdf`,
      { phoneLast4 },
      { 
        responseType: 'blob', // 🚀 CRÍTICO: Le decimos a Axios que esperamos un archivo binario
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/pdf'
        }
      }
    );
    return response.data;
  }
};
