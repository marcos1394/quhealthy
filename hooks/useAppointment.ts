// hooks/useAppointments.ts
import { useState, useCallback } from 'react';
import { appointmentService } from '@/services/appointment.service';
import { 
  Appointment, 
  AppointmentStatus, 
  ReschedulePayload, 
  CalendarEvent 
} from '@/types/appointments'; // 🚀 Asegúrate de que apunte al archivo correcto
import { toast } from 'react-toastify';

export const useAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 🚀 FIX: Mapear los NUEVOS Status de Java al formato de tu componente UI (FullCalendar o Custom)
  const mapStatusForUI = (status: AppointmentStatus): string => {
    switch (status) {
      // Casos de Cita Activa / Confirmada
      case 'SCHEDULED': 
      case 'RESCHEDULED': 
        return 'confirmed';
        
      // Casos de Cita Pendiente de Acción
      case 'PENDING': 
      case 'PENDING_APPROVAL': 
      case 'PENDING_PAYMENT':
        return 'pending';
        
      // Casos de Cita Cancelada o Perdida
      case 'CANCELED_BY_CONSUMER': 
      case 'CANCELED_BY_PROVIDER': 
      case 'NO_SHOW':
        return 'cancelled';
        
      // Casos de Cita Finalizada
      case 'COMPLETED': 
        return 'completed';
        
      // Casos en proceso
      case 'IN_PROGRESS':
      case 'WAITING_ROOM':
        return 'in_progress'; // O el string que use tu UI para citas actuales
        
      default: 
        return 'pending';
    }
  };

  // 1. OBTENER Y TRANSFORMAR PARA EL CALENDARIO
  const fetchAppointments = useCallback(async (): Promise<CalendarEvent[]> => {
    setIsLoading(true);
    try {
      const data = await appointmentService.getMyAppointments();
      setAppointments(data);
      
      // Transformamos al formato que exige FullCalendar (o tu UI)
      return data.map(app => ({
        id: String(app.id),
        title: app.serviceName || 'Cita Médica',
        start: app.startTime, 
        end: app.endTime,
        extendedProps: {
          status: mapStatusForUI(app.status), // Usamos la nueva función mapeadora
          clientName: app.consumerNameSnapshot || app.consumerName, // Usamos los snapshots si existen
          providerName: app.providerNameSnapshot,
          type: app.type || app.appointmentType,
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
      const payload: ReschedulePayload = { newStartTime };
      await appointmentService.rescheduleAppointment(id, payload);
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