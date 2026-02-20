export interface PlanStatus {
  id: string;
  name: string;
  status: 'ACTIVE' | 'TRIAL' | 'EXPIRED' | 'GRACE_PERIOD';
  daysLeft: number;
  renewalDate: string;
}

export interface DashboardAnalytics {
  monthlyRevenue: number;
  completedAppointments: number;
  newClients: number;
}

export interface DashboardData {
  plan: PlanStatus;
  hasConfiguredStore: boolean; // 👈 Crítico para saber si mostrar el CTA de la tienda
  verificationStatus: string;  // PENDING, COMPLETED, etc.
  analytics: DashboardAnalytics;
  upcomingAppointments: any[]; // Tiparás esto cuando hagas el módulo de citas
}