// hooks/useAppointmentDetails.ts
import { useState, useEffect } from 'react';
import { Appointment } from '@/types/appointments';
import { appointmentService } from '@/services/appointment.service';
import { toast } from 'react-toastify';

export const useAppointmentDetails = (appointmentId: string | number | undefined) => {
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (!appointmentId) {
      setIsLoading(false);
      return;
    }

    const fetchDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await appointmentService.getAppointmentById(appointmentId);
        setAppointment(data);
      } catch (err: any) {
        console.error("Error fetching appointment details:", err);
        setError(err);
        toast.error("No se pudieron cargar los detalles de la cita.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
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
      toast.error("El recibo no está disponible en este momento.");
    } finally {
      setIsDownloading(false);
    }
  };

  return {
    appointment,
    isLoading,
    error,
    isDownloading,
    downloadInvoice
  };
};