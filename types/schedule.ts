// types/schedule.ts

// ==========================================
// HORARIO BASE (ProviderSchedule)
// ==========================================
export type DayOfWeek = 
  | 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' 
  | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

export interface ProviderSchedule {
  id?: number;
  providerId?: number;
  dayOfWeek: DayOfWeek;
  isWorkingDay: boolean;
  startTime: string | null;  // "HH:mm:ss"
  endTime: string | null;    // "HH:mm:ss"
  breakStart: string | null; // "HH:mm:ss"
  breakEnd: string | null;   // "HH:mm:ss"
}

// ==========================================
// BLOQUEOS DE TIEMPO (TimeBlock)
// ==========================================
export interface TimeBlock {
  id?: number;
  providerId?: number;
  startDateTime: string; // ISO 8601 (ej. "2026-02-21T14:00:00Z")
  endDateTime: string;   // ISO 8601
  reason: string;
}

// Payload específico para crear el bloqueo (omitimos ID y providerId porque el backend los asigna)
export interface CreateTimeBlockPayload {
  startDateTime: string;
  endDateTime: string;
  reason: string;
}