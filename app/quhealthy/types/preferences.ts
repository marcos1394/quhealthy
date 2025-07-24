import { LucideIcon } from "lucide-react";

export type UserRole = "paciente" | "proveedor";

export interface NotificationPreferences {
  enabled: boolean;
  email: boolean;
  push: boolean;
  sms: boolean;
  appointments: boolean;
  messages: boolean;
  updates: boolean;
  requests: boolean;
  promotions: boolean;
  reminders: boolean;
}

export interface AppearancePreferences {
  theme: string;
  fontSize: string;
  reduceMotion: boolean;
  highContrast: boolean;
}

export interface PrivacyPreferences {
  showOnlineStatus: boolean;
  showLastSeen: boolean;
  showProfile: string;
  allowMessages: string;
}

export interface AppPreferences {
  notifications: NotificationPreferences;
  appearance: AppearancePreferences;
  language: string;
  currency: string;
  timeFormat: string;
  timeZone: string;
  privacy: PrivacyPreferences;
}

export interface NotificationType {
  id: keyof NotificationPreferences;
  label: string;
  icon: LucideIcon;
  description: string;
}