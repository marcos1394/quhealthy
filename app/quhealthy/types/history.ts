export type UserRole = "paciente" | "proveedor";
export type HistoryEntryStatus = 'completed' | 'cancelled' | 'rescheduled';

export interface HistoryEntry {
  id: string;
  date: string;
  description: string;
  provider?: {
    id: string;
    name: string;
    rating: number;
    specialty: string;
  };
  client?: {
    id: string;
    name: string;
    history: string;
  };
  type: string;
  status: HistoryEntryStatus;
  rating?: number;
  notes?: string;
  duration?: string;
  cost?: number;
  location?: string;
  followUp?: string;
}

export interface FilterOptions {
  dateRange: 'all' | 'today' | 'week' | 'month' | 'year';
  type: string;
  status: string;
}