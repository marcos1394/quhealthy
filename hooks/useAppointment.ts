// hooks/useAppointments.ts
import { useState, useCallback } from 'react';
import { appointmentService } from '@/services/appointment.service';
// 🚀 FIX: Importamos CalendarEvent directamente de nuestro archivo de tipos centralizado
import { 
  Appointment, 
  AppointmentStatus, 
  ReschedulePayload, 
  CalendarEvent 
} from '@/types/appointments';
import { toast } from 'react-toastify';

export const useAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Mapear Status de Java al formato de tu componente UI
  const mapStatusForUI = (status: AppointmentStatus) => {
    switch (status) {
      case 'CONFIRMED': return 'confirmed';
      case 'PENDING': return 'pending';
      case 'CANCELLED': return 'cancelled';
      case 'COMPLETED': return 'completed';
      default: return 'pending';
    }
  };

  // 1. OBTENER Y TRANSFORMAR PARA EL CALENDARIO
  const fetchAppointments = useCallback(async (): Promise<CalendarEvent[]> => {
    setIsLoading(true);
    try {
      const data = await appointmentService.getMyAppointments();
      setAppointments(data);
      
      // Transformamos al formato que exige FullCalendar
      return data.map(app => ({
        id: String(app.id),
        title: app.serviceName || 'Cita Médica',
        start: app.startTime, // FullCalendar acepta strings ISO
        end: app.endTime,
        extendedProps: {
          status: mapStatusForUI(app.status),
          clientName: app.consumerName,
          type: app.appointmentType,
          notes: app.consumerSymptoms
        }
      }));
    } catch (error) {
      console.error("Error cargando citas:", error);
      toast.error("No pudimos cargar tu calendario.");
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 2. REPROGRAMAR (Drag & Drop)
  const reschedule = async (id: number, newStartTime: string): Promise<boolean> => {
    try {
      await appointmentService.rescheduleAppointment(id, { newStartTime });
      toast.success("Cita reprogramada con éxito.");
      return true;
    } catch (error: any) {
      console.error("Error al reprogramar:", error);
      toast.error(error.response?.data?.message || "No se pudo reprogramar la cita.");
      return false;
    }
  };

  // 3. CANCELAR
  const cancel = async (id: number, reason: string): Promise<boolean> => {
    try {
      await appointmentService.cancelAppointment(id, reason);
      toast.success("Cita cancelada.");
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al cancelar la cita.");
      return false;
    }
  };

  return {
    appointments, // Los datos crudos por si los necesitas para una tabla
    fetchAppointments,
    reschedule,
    cancel,
    isLoading
  };
};