// --- Tipos para el Resumen del Dashboard ---

// El tipo para cada cita en la lista de "Próximas Citas"
export interface Appointment {
  id: number;
  clientName: string;
  time: string;
  service: string;
}

// El tipo para las tarjetas de resumen (KPIs)
export interface SummaryCards {
  todayAppointments: number;
  unreadMessages: number;
  monthlyRevenue: number;
}

// El tipo para el estado detallado de las verificaciones
export interface VerificationStatus {
  kyc: { 
    isComplete: boolean; 
    status: string; 
  };
  // 'license' es opcional porque no todos los arquetipos lo tienen
  license?: { 
    isComplete: boolean; 
    status: string; 
  };
}

// La estructura completa de la respuesta del endpoint del dashboard
export interface DashboardData {
  summaryCards: SummaryCards;
  upcomingAppointments: Appointment[];
  verificationStatus: VerificationStatus;
}