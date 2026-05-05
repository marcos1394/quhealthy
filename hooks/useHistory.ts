import { useState, useCallback } from 'react';
import { appointmentService } from '@/services/appointment.service';
import { HistoryEntry } from '@/components/dashboard/history/HistoryTable';

export const useHistory = () => {
  const [historyData, setHistoryData] = useState<HistoryEntry[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  // Mapeamos el estatus de la base de datos (Backend) al que espera el Frontend
  const mapStatus = (dbStatus: string) => {
    if (!dbStatus) return 'pending';
    const statusLower = dbStatus.toLowerCase();
    if (statusLower.includes('cancel')) return 'cancelled';
    if (statusLower.includes('reschedule')) return 'rescheduled';
    if (statusLower.includes('complete')) return 'completed';
    return 'pending'; 
  };

  const fetchHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    try {
      // 1. Usamos el servicio que ya tienes creado
      const pageResponse = await appointmentService.getMyAppointments(0, 500);
      
      // 2. Extraemos el array 'content'
      const appointments = pageResponse.content || [];

      // 3. Mapeamos la respuesta al formato HistoryEntry[] que pide tu UI
      const mappedHistory: HistoryEntry[] = appointments.map((app: any) => ({
        id: app.id,
        date: app.startTime, 
        type: app.serviceName || 'Consulta General', 
        status: mapStatus(app.status), 
        duration: `${app.durationMinutes || 30} min`,
        notes: app.consumerSymptoms || app.clinicalNotes || 'Sin notas adicionales',
        client: { name: app.consumerNameSnapshot || 'Paciente Desconocido' },
        provider: { 
          name: app.providerNameSnapshot || 'Especialista', 
          specialty: app.providerSpecialty || 'General' 
        },
        priceAtBooking: app.price,
        cost: app.amountPaid
      }));

      setHistoryData(mappedHistory);
    } catch (error) {
      console.error("Error cargando el historial:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  return {
    historyData,
    isLoadingHistory,
    fetchHistory
  };
};
