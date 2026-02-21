// types/schedule.ts

// Mapeo exacto del ENUM en Java
export type DayOfWeek = 
  | 'MONDAY' 
  | 'TUESDAY' 
  | 'WEDNESDAY' 
  | 'THURSDAY' 
  | 'FRIDAY' 
  | 'SATURDAY' 
  | 'SUNDAY';

// El modelo exacto que espera Spring Boot
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
  startDateTime: string; // ISO 8601
  endDateTime: string;   // ISO 8601
  reason: string;
}

export interface CreateTimeBlockPayload {
  startDateTime: string;
  endDateTime: string;
  reason: string;
}

// ==========================================
// UTILIDADES DE MAPEO (Front <-> Back)
// ==========================================
const dayMap: Record<number, DayOfWeek> = {
  1: 'MONDAY',
  2: 'TUESDAY',
  3: 'WEDNESDAY',
  4: 'THURSDAY',
  5: 'FRIDAY',
  6: 'SATURDAY',
  0: 'SUNDAY',
};

const reverseDayMap: Record<DayOfWeek, number> = {
  'MONDAY': 1,
  'TUESDAY': 2,
  'WEDNESDAY': 3,
  'THURSDAY': 4,
  'FRIDAY': 5,
  'SATURDAY': 6,
  'SUNDAY': 0,
};

export const mapNumberToEnum = (dayNum: number): DayOfWeek => dayMap[dayNum];
export const mapEnumToNumber = (dayEnum: DayOfWeek): number => reverseDayMap[dayEnum];