import React from 'react';

export type UserRole = "paciente" | "proveedor";

export interface StatCard {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  trend?: number;
}

export interface Appointment {
  id: string;
  serviceName: string;
  providerName?: string;
  clientName?: string;
  dateTime: string;
  status: "scheduled" | "completed" | "cancelled" | "pending";
  location: string;
  price: number;
  notes?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success";
  date: string;
  isRead: boolean;
}