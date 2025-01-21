"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  CheckCircle, UserCheck, Briefcase, Star, Activity, ClipboardList,
  Calendar, Bell, Clock, TrendingUp, Users, Wallet, MessagesSquare,
  FileText, AlertCircle, ChevronRight
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface DashboardProps {
  role: "paciente" | "proveedor";
}

interface StatCard {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  trend?: number;
}

interface Appointment {
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

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success";
  date: string;
  isRead: boolean;
}

export default function Dashboard({ role }: DashboardProps) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "appointments" | "analytics">("overview");
  const [stats, setStats] = useState<StatCard[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedTimeFrame, setSelectedTimeFrame] = useState<"day" | "week" | "month">("week");

  useEffect(() => {
    setLoading(true);
    // Simulación de datos
    setTimeout(() => {
      const dummyStats = role === "paciente" ? getPatientStats() : getProviderStats();
      const dummyAppointments = getDummyAppointments();
      const dummyNotifications = getDummyNotifications();

      setStats(dummyStats);
      setUpcomingAppointments(dummyAppointments);
      setNotifications(dummyNotifications);
      setLoading(false);
    }, 1000);
  }, [role, selectedTimeFrame]);

  const getPatientStats = (): StatCard[] => [
    {
      title: "Próximas Citas",
      value: 3,
      icon: <Calendar className="w-6 h-6 text-blue-400" />,
      color: "bg-blue-500/20",
      trend: 0,
    },
    {
      title: "Servicios Completados",
      value: 12,
      icon: <CheckCircle className="w-6 h-6 text-emerald-400" />,
      color: "bg-emerald-500/20",
      trend: 2,
    },
    {
      title: "Calificación Promedio",
      value: "4.8/5",
      icon: <Star className="w-6 h-6 text-yellow-400" />,
      color: "bg-yellow-500/20",
    },
    {
      title: "Inversión en Salud",
      value: "$580",
      icon: <Wallet className="w-6 h-6 text-purple-400" />,
      color: "bg-purple-500/20",
      trend: -15,
    }
  ];

  const getProviderStats = (): StatCard[] => [
    {
      title: "Clientes Activos",
      value: 45,
      icon: <Users className="w-6 h-6 text-blue-400" />,
      color: "bg-blue-500/20",
      trend: 12,
    },
    {
      title: "Ingresos del Mes",
      value: "$12,000",
      icon: <Activity className="w-6 h-6 text-emerald-400" />,
      color: "bg-emerald-500/20",
      trend: 8,
    },
    {
      title: "Tasa de Ocupación",
      value: "85%",
      icon: <TrendingUp className="w-6 h-6 text-yellow-400" />,
      color: "bg-yellow-500/20",
      trend: 5,
    },
    {
      title: "Satisfacción",
      value: "4.9/5",
      icon: <UserCheck className="w-6 h-6 text-purple-400" />,
      color: "bg-purple-500/20",
      trend: 2,
    }
  ];

  const getDummyAppointments = (): Appointment[] => [
    {
      id: "1",
      serviceName: "Consulta Dermatológica",
      providerName: role === "paciente" ? "Dra. Ana García" : undefined,
      clientName: role === "proveedor" ? "María López" : undefined,
      dateTime: new Date(new Date().setHours(new Date().getHours() + 2)).toISOString(),
      status: "scheduled",
      location: "Consultorio 204",
      price: 120,
      notes: "Primera consulta - Tratamiento acné"
    },
    {
      id: "2",
      serviceName: "Masaje Terapéutico",
      providerName: role === "paciente" ? "Carlos Ruiz" : undefined,
      clientName: role === "proveedor" ? "Juan Pérez" : undefined,
      dateTime: new Date(new Date().setHours(new Date().getHours() + 24)).toISOString(),
      status: "scheduled",
      location: "Sala de Masajes 3",
      price: 80,
      notes: "Masaje deportivo"
    }
  ];

  const getDummyNotifications = (): Notification[] => [
    {
      id: "1",
      title: "Recordatorio de Cita",
      message: "Tienes una cita mañana a las 10:00 AM",
      type: "info",
      date: new Date().toISOString(),
      isRead: false
    },
    {
      id: "2",
      title: "Nueva Reseña",
      message: role === "paciente" ? "Tu reseña ha sido publicada" : "Has recibido una nueva reseña de 5 estrellas",
      type: "success",
      date: new Date(new Date().setHours(new Date().getHours() - 2)).toISOString(),
      isRead: true
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Progress value={50} className="w-1/2" />
      </div>
    );
  }

  const renderAppointmentCard = (appointment: Appointment) => (
    <Card className="bg-gray-800 border-gray-700 mb-4">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">{appointment.serviceName}</h3>
            <p className="text-gray-400">
              {role === "paciente" ? appointment.providerName : appointment.clientName}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-400">
                {new Date(appointment.dateTime).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <FileText className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-400">{appointment.notes}</span>
            </div>
          </div>
          <Badge
            className={
              appointment.status === "scheduled"
                ? "bg-blue-500/20 text-blue-400"
                : appointment.status === "completed"
                ? "bg-emerald-500/20 text-emerald-400"
                : "bg-red-500/20 text-red-400"
            }
          >
            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-teal-400">
              ¡Bienvenido{role === "proveedor" ? " de vuelta" : ""}!
            </h1>
            <p className="text-gray-400">
              {role === "paciente" 
                ? "Gestiona tus citas y servicios de salud y belleza"
                : "Administra tus servicios y clientes"}
            </p>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" className="bg-gray-800 border-gray-700">
              <Bell className="w-4 h-4 mr-2" />
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                {notifications.filter(n => !n.isRead).length}
              </span>
            </Button>
            <Button className="bg-teal-500 hover:bg-teal-600">
              {role === "paciente" ? "Agendar Cita" : "Crear Servicio"}
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-6">
          {["overview", "appointments", "analytics"].map((tab) => (
            <Button
              key={tab}
              variant={activeTab === tab ? "default" : "ghost"}
              onClick={() => setActiveTab(tab as any)}
              className={activeTab === tab ? "bg-teal-500 hover:bg-teal-600" : ""}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Button>
          ))}
        </div>

        {/* Time Frame Selector */}
        <div className="flex gap-2 mb-6">
          {["day", "week", "month"].map((timeFrame) => (
            <Button
              key={timeFrame}
              variant={selectedTimeFrame === timeFrame ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedTimeFrame(timeFrame as any)}
              className={selectedTimeFrame === timeFrame ? "bg-gray-700" : "bg-gray-800 border-gray-700"}
            >
              {timeFrame.charAt(0).toUpperCase() + timeFrame.slice(1)}
            </Button>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stats and Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {stats.map((stat, index) => (
                <Card key={index} className={`${stat.color} border-0`}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-gray-300 text-sm">{stat.title}</p>
                        <h3 className="text-2xl font-bold text-white mt-1">{stat.value}</h3>
                        {stat.trend !== undefined && (
                          <p className={`text-sm mt-1 ${
                            stat.trend > 0 ? "text-emerald-400" : stat.trend < 0 ? "text-red-400" : "text-gray-400"
                          }`}>
                            {stat.trend > 0 ? "+" : ""}{stat.trend}% vs. periodo anterior
                          </p>
                        )}
                      </div>
                      {stat.icon}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Recent Activity */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-xl text-white">Actividad Reciente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingAppointments.map(appointment => renderAppointmentCard(appointment))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Appointments */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg text-white">Próximas Citas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingAppointments.map(appointment => (
                    <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                      <div>
                        <p className="font-medium text-white">{appointment.serviceName}</p>
                        <p className="text-sm text-gray-400">
                          {new Date(appointment.dateTime).toLocaleString()}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg text-white">Notificaciones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notifications.map(notification => (
                    <Alert key={notification.id} className={`
                      ${notification.type === "success" ? "bg-emerald-500/20 border-emerald-500/50" :
                        notification.type === "warning" ? "bg-yellow-500/20 border-yellow-500/50" :
                        "bg-blue-500/20 border-blue-500/50"}
                      ${!notification.isRead ? "border-l-4" : ""}`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <AlertTitle className="text-white mb-1">{notification.title}</AlertTitle>
                          <AlertDescription className="text-gray-400 text-sm">
                            {notification.message}
                          </AlertDescription>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(notification.date).toLocaleString()}
                          </p>
                        </div>
                        {!notification.isRead && (
                          <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                        )}
                      </div>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg text-white">Acciones Rápidas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {role === "paciente" ? (
                    <>
                      <Button variant="outline" className="bg-gray-700 border-gray-600 hover:bg-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        Agendar
                      </Button>
                      <Button variant="outline" className="bg-gray-700 border-gray-600 hover:bg-gray-600">
                        <MessagesSquare className="w-4 h-4 mr-2" />
                        Consultar
                      </Button>
                      <Button variant="outline" className="bg-gray-700 border-gray-600 hover:bg-gray-600">
                        <FileText className="w-4 h-4 mr-2" />
                        Historial
                      </Button>
                      <Button variant="outline" className="bg-gray-700 border-gray-600 hover:bg-gray-600">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        Ayuda
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" className="bg-gray-700 border-gray-600 hover:bg-gray-600">
                        <Users className="w-4 h-4 mr-2" />
                        Clientes
                      </Button>
                      <Button variant="outline" className="bg-gray-700 border-gray-600 hover:bg-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        Agenda
                      </Button>
                      <Button variant="outline" className="bg-gray-700 border-gray-600 hover:bg-gray-600">
                        <Activity className="w-4 h-4 mr-2" />
                        Reportes
                      </Button>
                      <Button variant="outline" className="bg-gray-700 border-gray-600 hover:bg-gray-600">
                        <Wallet className="w-4 h-4 mr-2" />
                        Ingresos
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Professional/Patient Profile Summary */}
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center">
                    <Users className="w-8 h-8 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {role === "paciente" ? "Tu Plan de Salud" : "Tu Perfil Profesional"}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {role === "paciente" 
                        ? "Plan Premium - Renovación en 45 días" 
                        : "Disponibilidad: Lun-Vie 9AM-6PM"}
                    </p>
                  </div>
                </div>
                
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-400">
                      {role === "paciente" ? "Uso del Plan" : "Ocupación Semanal"}
                    </span>
                    <span className="text-sm text-white">75%</span>
                  </div>
                  <Progress value={75} className="bg-gray-700" />
                </div>

                <Button className="w-full mt-6 bg-teal-500 hover:bg-teal-600">
                  {role === "paciente" ? "Ver Beneficios" : "Actualizar Disponibilidad"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}