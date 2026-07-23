import { HealthOSAction } from './actions';

export type WidgetType =
  | 'DoctorCardWidget'
  | 'AppointmentWidget'
  | 'CalendarWidget'
  | 'TimelineWidget'
  | 'QuScoreWidget'
  | 'BiometricsWidget'
  | 'VaultSummaryWidget'
  | 'LabResultsWidget'
  | 'PaymentWidget'
  | 'MarketplaceWidget'
  | 'DependentWidget'
  | 'PrescriptionWidget'
  | 'HealthInsightWidget';

export interface BaseWidget<T = any> {
  id: string; // Unique identifier for the widget instance
  type: WidgetType;
  data: T; // The payload specific to the widget
  actions?: HealthOSAction[]; // Available actions within this widget
  priority?: number; // Sorting/Rendering priority if needed
}

export interface DoctorCardData {
  id: string;
  name: string;
  specialty: string;
  imageUrl?: string;
  rating?: number;
  nextAvailableSlot?: string;
}

export type DoctorCardWidget = BaseWidget<DoctorCardData>;

export interface CalendarData {
  availableSlots: Array<{
    id: string;
    startTime: string;
    endTime: string;
  }>;
  selectedDate?: string;
}

export type CalendarWidget = BaseWidget<CalendarData>;

export interface PaymentData {
  amount: number;
  currency: string;
  description: string;
  paymentMethods: string[];
}

export type PaymentWidget = BaseWidget<PaymentData>;
