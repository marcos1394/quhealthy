// types/dashboard.ts

export interface PlanInfo {
  name: string;
  status: string;
  daysLeft: number;
}

export interface TopItemDto {
  name: string;
  type: string;
  quantity: number;
  revenue: number;
}

export interface LocationMetricDto {
  locationId: number;
  locationName: string;
  revenue: number;
  appointmentCount: number;
}

export interface DashboardAnalytics {
  monthlyRevenue: number;
  completedAppointments: number;
  newClients: number;
  revenueByItemType?: Record<string, number>;
  topSellingItems?: TopItemDto[];
  revenueGrowth: number;
  appointmentsGrowth: number;
  clientsGrowth: number;
}

export interface UpcomingAppointmentDto {
  id: number;
  consumerName: string;
  serviceName: string;
  startTime: string; // ISO String (ej. "2026-02-26T16:30:00")
  status: string; // 'SCHEDULED', 'IN_PROGRESS', 'PENDING_PAYMENT', etc.
  paymentStatus: string; // 'SETTLED', 'PENDING', etc.
  modality: string; // 'IN_PERSON', 'ONLINE'
}

export interface ProviderDashboardResponse {
  plan: PlanInfo;
  hasConfiguredStore: boolean;
  analytics: DashboardAnalytics;
  metricsByLocation?: LocationMetricDto[];
  upcomingAppointments: UpcomingAppointmentDto[];
}