"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Calendar, CheckCircle, Star, Wallet, Users, Activity, TrendingUp, UserCheck } from "lucide-react";

// Importa los tipos
import { UserRole, StatCard, Appointment, Notification } from "@/app/quhealthy/types/dashboard";

// Importa tus nuevos componentes
import { DashboardHeader } from "@/app/quhealthy/components/dashboard/DashboardHeader";
import { StatCardsGrid } from "@/app/quhealthy/components/dashboard/StatCardsGrid";
import { RecentActivity } from "@/app/quhealthy/components/dashboard/RecentActivity";
import { Sidebar } from "@/app/quhealthy/components/dashboard/Sidebar";

export default function DashboardPage() {
  // --- ESTADO Y DATOS ---
  const [role, setRole] = useState<UserRole>("proveedor");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StatCard[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // --- OBTENCIÓN DE DATOS (AQUÍ IRÍA TU API REAL) ---
  useEffect(() => {
    const fetchData = () => {
      setLoading(true);
      // Simulación de datos
      setTimeout(() => {
        const dummyStats = role === "paciente" ? getPatientStats() : getProviderStats();
        const dummyAppointments = getDummyAppointments(role);
        const dummyNotifications = getDummyNotifications(role);

        setStats(dummyStats);
        setUpcomingAppointments(dummyAppointments);
        setNotifications(dummyNotifications);
        setLoading(false);
      }, 1000);
    };

    fetchData();
  }, [role]);

  // --- RENDERIZADO ---
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex justify-center items-center">
        <Progress value={50} className="w-1/2" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <DashboardHeader role={role} notifications={notifications} />

        {/* (Aquí podrías añadir los selectores de TABS y Tiempo si los necesitas) */}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-2 space-y-6">
            <StatCardsGrid stats={stats} />
            <RecentActivity appointments={upcomingAppointments} role={role} />
          </div>
          <Sidebar appointments={upcomingAppointments} notifications={notifications} role={role} />
        </div>
      </div>
    </div>
  );
}


// --- FUNCIONES DE DATOS DE PRUEBA (Mantenidas aquí temporalmente) ---
const getPatientStats = (): StatCard[] => [
    { title: "Próximas Citas", value: 3, icon: <Calendar className="w-6 h-6 text-blue-400" />, color: "bg-blue-500/20", trend: 0 },
    { title: "Servicios Completados", value: 12, icon: <CheckCircle className="w-6 h-6 text-emerald-400" />, color: "bg-emerald-500/20", trend: 2 },
    { title: "Calificación Promedio", value: "4.8/5", icon: <Star className="w-6 h-6 text-yellow-400" />, color: "bg-yellow-500/20" },
    { title: "Inversión en Salud", value: "$580", icon: <Wallet className="w-6 h-6 text-purple-400" />, color: "bg-purple-500/20", trend: -15 }
];
const getProviderStats = (): StatCard[] => [
    { title: "Clientes Activos", value: 45, icon: <Users className="w-6 h-6 text-blue-400" />, color: "bg-blue-500/20", trend: 12 },
    { title: "Ingresos del Mes", value: "$12,000", icon: <Activity className="w-6 h-6 text-emerald-400" />, color: "bg-emerald-500/20", trend: 8 },
    { title: "Tasa de Ocupación", value: "85%", icon: <TrendingUp className="w-6 h-6 text-yellow-400" />, color: "bg-yellow-500/20", trend: 5 },
    { title: "Satisfacción", value: "4.9/5", icon: <UserCheck className="w-6 h-6 text-purple-400" />, color: "bg-purple-500/20", trend: 2 }
];
const getDummyAppointments = (role: UserRole): Appointment[] => [
    { id: "1", serviceName: "Consulta Dermatológica", providerName: role === "paciente" ? "Dra. Ana García" : undefined, clientName: role === "proveedor" ? "María López" : undefined, dateTime: new Date(new Date().setHours(new Date().getHours() + 2)).toISOString(), status: "scheduled", location: "Consultorio 204", price: 120, notes: "Primera consulta - Tratamiento acné" },
    { id: "2", serviceName: "Masaje Terapéutico", providerName: role === "paciente" ? "Carlos Ruiz" : undefined, clientName: role === "proveedor" ? "Juan Pérez" : undefined, dateTime: new Date(new Date().setHours(new Date().getHours() + 24)).toISOString(), status: "scheduled", location: "Sala de Masajes 3", price: 80, notes: "Masaje deportivo" }
];
const getDummyNotifications = (role: UserRole): Notification[] => [
    { id: "1", title: "Recordatorio de Cita", message: "Tienes una cita mañana a las 10:00 AM", type: "info", date: new Date().toISOString(), isRead: false },
    { id: "2", title: "Nueva Reseña", message: role === "paciente" ? "Tu reseña ha sido publicada" : "Has recibido una nueva reseña de 5 estrellas", type: "success", date: new Date(new Date().setHours(new Date().getHours() - 2)).toISOString(), isRead: true }
];