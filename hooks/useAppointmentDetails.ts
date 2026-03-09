// hooks/useAppointmentDetails.ts
import { useState, useEffect } from 'react';
import { Appointment } from '@/types/appointments'; // ⚠️ Ojo con el nombre del archivo
import { appointmentService } from '@/services/appointment.service';
import { toast } from 'react-toastify';
import { handleApiError } from '@/lib/handleApiError';

export const useAppointmentDetails = (appointmentId: string | number | undefined) => {
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Estados para archivos
  const [isDownloading, setIsDownloading] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null); // 📱 NUEVO

  useEffect(() => {
    if (!appointmentId) {
      setIsLoading(false);
      return;
    }

    const fetchDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // 1. Cargamos los datos de la cita
        const data = await appointmentService.getAppointmentById(appointmentId);
        setAppointment(data);
        
        // 2. 📱 Inmediatamente cargamos el código QR si la cita se obtuvo correctamente
        try {
          const qrBlob = await appointmentService.getQrCode(appointmentId);
          // Convertimos los bytes crudos en una URL que una etiqueta <img> pueda leer
          const qrObjectUrl = URL.createObjectURL(qrBlob);
          setQrCodeUrl(qrObjectUrl);
        } catch (qrErr) {
          console.error("Error cargando el código QR:", qrErr);
          // Opcional: No lanzamos toast error para no interrumpir al usuario si solo falla el QR
        }
        
      } catch (err: any) {
        console.error("Error fetching appointment details:", err);
        setError(err);
        handleApiError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();

    // Limpieza de memoria (importante al usar URL.createObjectURL)
    return () => {
      if (qrCodeUrl) {
        URL.revokeObjectURL(qrCodeUrl);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointmentId]);

  const downloadInvoice = async () => {
    if (!appointmentId) return;
    
    setIsDownloading(true);
    try {
      const blob = await appointmentService.downloadInvoice(appointmentId);
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `confirmacion-cita-${appointmentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success("Recibo descargado exitosamente");
    } catch (err) {
      console.error("Error downloading invoice:", err);
      handleApiError(err);
    } finally {
      setIsDownloading(false);
    }
  };

  return {
    appointment,
    isLoading,
    error,
    isDownloading,
    downloadInvoice,
    qrCodeUrl // 📱 Exponemos el QR a la página
  };
};