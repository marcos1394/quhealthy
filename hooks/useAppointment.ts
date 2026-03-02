// hooks/useAppointments.ts
import { useState, useCallback } from 'react';
import { appointmentService } from '@/services/appointment.service';
import { 
  Appointment, 
  AppointmentStatus, 
  ReschedulePayload, 
  CalendarEvent 
} from '@/types/appointments'; // 🚀 Asegúrate de que el nombre del archivo coincida con tu proyecto (appointment o appointments)
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

  // 1. OBTENER Y TRANSFORMAR PARA EL CALENDARIO Y LA LISTA
  const fetchAppointments = useCallback(async (page = 0, size = 500): Promise<CalendarEvent[]> => {
    setIsLoading(true);
    try {
      // Obtenemos la paginación de Spring Boot
      const pageData = await appointmentService.getMyAppointments(page, size);
      
      // Extraemos el arreglo real
      const data = pageData.content || [];
      
      // 🚀 Guardamos la data cruda en el estado para la vista de Lista (La pantalla del paciente)
      setAppointments(data);
      
      // 🚀 Retornamos la data transformada para la vista de Calendario
      return data.map(app => ({
        id: String(app.id),
        title: app.serviceName || 'Cita Médica',
        start: app.startTime, 
        end: app.endTime,
        extendedProps: {
          status: mapStatusForUI(app.status),
          clientName: app.consumerNameSnapshot || app.consumerName,
          providerName: app.providerNameSnapshot,
          type: app.type || app.appointmentType,
          notes: app.consumerSymptoms
        }
      }));
    } catch (error) {
      console.error("Error cargando citas:", error);
      toast.error("No pudimos cargar tus citas.");
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 2. REPROGRAMAR (Drag & Drop o UI)
  const reschedule = async (id: number, newStartTime: string): Promise<boolean> => {
    try {
      const payload: ReschedulePayload = { newStartTime };
      const updatedAppt = await appointmentService.rescheduleAppointment(id, payload);
      
      // 🚀 Actualizamos el estado local para que la UI reaccione instantáneamente
      setAppointments(prev => prev.map(app => app.id === id ? updatedAppt : app));
      
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
      const updatedAppt = await appointmentService.cancelAppointment(id, reason);
      
      // 🚀 Actualizamos el estado local para que la UI reaccione instantáneamente
      setAppointments(prev => prev.map(app => app.id === id ? updatedAppt : app));
      
      toast.success("Cita cancelada.");
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al cancelar la cita.");
      return false;
    }
  };

  // Envolvemos el cancel original en la firma que espera la pantalla del paciente actual
  // (Para mantener compatibilidad con el código que te pasé antes)
  const cancelAppointment = async (id: number, reason: string) => {
    return await cancel(id, reason);
  };

  return {
    appointments, // Usado por ConsumerAppointmentsPage
    fetchAppointments, // Usado por ambos
    reschedule, // Usado por Calendario
    cancel, // Usado por Calendario
    cancelAppointment, // Usado por ConsumerAppointmentsPage
    isLoading
  };
};