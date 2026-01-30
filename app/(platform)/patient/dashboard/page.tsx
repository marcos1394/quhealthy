"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Loader2, 
  Calendar, 
  Clock, 
  ArrowRight, 
  Search, 
  MapPin,
  Video,
  FileText,
  Heart,
  Star,
  Bell,
  ChevronRight,
  Stethoscope,
  Pill,
  Activity,
  CheckCircle,
} from 'lucide-react';
import { formatInTimeZone } from 'date-fns-tz';
import { es } from 'date-fns/locale';

// ShadCN UI
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

// Store
import { useSessionStore } from '@/stores/SessionStore';

// Types
interface Appointment {
  id: number;
  status: 'pending' | 'confirmed' | 'completed' | 'canceled';
  startTime: string;
  provider: { 
    name: string; 
    image?: string; 
    specialty?: string;
    rating?: number;
  };
  service: { name: string };
  location?: string;
  type?: 'in-person' | 'video';
}

interface HealthMetric {
  label: string;
  value: string;
  unit: string;
  icon: React.ElementType;
  status: 'normal' | 'warning' | 'alert';
  trend?: 'up' | 'down' | 'stable';
}

// Mock Data
const mockAppointments: Appointment[] = [
  {
    id: 1,
    status: 'confirmed',
    startTime: new Date(Date.now() + 86400000).toISOString(),
    provider: { name: "Dr. Roberto Casas", specialty: "Dentista", rating: 4.9, image: "/avatars/doctor-02.jpg" },
    service: { name: "Limpieza Dental Profunda" },
    location: "Av. Reforma 222, CDMX",
    type: 'in-person'
  },
  {
    id: 2,
    status: 'confirmed',
    startTime: new Date(Date.now() + 172800000).toISOString(),
    provider: { name: "Dra. Maria Lopez", specialty: "Nutriologa", rating: 4.8 },
    service: { name: "Consulta de Seguimiento" },
    type: 'video'
  },
];

const healthMetrics: HealthMetric[] = [
  { label: "Citas este ano", value: "12", unit: "visitas", icon: Calendar, status: 'normal' },
  { label: "Proxima revision", value: "15", unit: "dias", icon: Clock, status: 'warning' },
  { label: "Recetas activas", value: "2", unit: "medicamentos", icon: Pill, status: 'normal' },
];

const quickActions = [
  { label: "Buscar Especialista", icon: Search, href: "/patient/discover", color: "bg-primary/10 text-primary" },
  { label: "Mis Citas", icon: Calendar, href: "/patient/dashboard/appointments", color: "bg-chart-2/10 text-chart-2" },
  { label: "Historial Medico", icon: FileText, href: "/patient/dashboard/history", color: "bg-chart-3/10 text-chart-3" },
  { label: "Mis Favoritos", icon: Heart, href: "/patient/favorites", color: "bg-chart-5/10 text-chart-5" },
];

const statusStyles = {
  confirmed: { label: 'Confirmada', class: 'status-success' },
  pending: { label: 'Pendiente', class: 'status-warning' },
  completed: { label: 'Completada', class: 'status-info' },
  canceled: { label: 'Cancelada', class: 'status-error' },
};

export default function ConsumerDashboardPage() {
  const { user } = useSessionStore();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setAppointments(mockAppointments);
      setIsLoading(false);
    }, 800);
  }, []);

  const nextAppointment = useMemo(() => {
    const upcoming = appointments
      .filter(appt => new Date(appt.startTime) > new Date() && appt.status === 'confirmed')
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    return upcoming.length > 0 ? upcoming[0] : null;
  }, [appointments]);

  const profileCompletion = 75;
  
  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium">Cargando tu informacion...</p>
      </div>
    );
  }

  const firstName = user?.name ? user.name.split(' ')[0] : 'Paciente';

  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            Hola, {firstName}
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestiona tu salud y bienestar desde aqui.
          </p>
        </div>
        
        <Button 
          onClick={() => router.push('/patient/discover')}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Search className="w-4 h-4 mr-2" />
          Buscar Especialista
        </Button>
      </div>

      {/* Next Appointment Card */}
      {nextAppointment ? (
        <Card className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-card to-chart-2/5 border-primary/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none -mr-32 -mt-32" />
          
          <CardContent className="p-6 md:p-8 relative">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              
              {/* Appointment Info */}
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-xs">
                    <Bell className="w-3 h-3 mr-1" />
                    Proxima Cita
                  </Badge>
                  <Badge variant="outline" className={statusStyles[nextAppointment.status].class}>
                    {statusStyles[nextAppointment.status].label}
                  </Badge>
                </div>
                
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                  {nextAppointment.service.name}
                </h2>
                
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
                  {/* Provider Info */}
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border-2 border-primary/30">
                      <AvatarImage src={nextAppointment.provider.image} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {nextAppointment.provider.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-foreground">{nextAppointment.provider.name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{nextAppointment.provider.specialty}</span>
                        {nextAppointment.provider.rating && (
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-chart-4 fill-chart-4" />
                            {nextAppointment.provider.rating}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="hidden sm:block w-px bg-border h-12" />
                  
                  {/* Date & Time */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-foreground">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">
                        {formatInTimeZone(new Date(nextAppointment.startTime), 'UTC', "EEEE d 'de' MMMM", { locale: es })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{formatInTimeZone(new Date(nextAppointment.startTime), 'UTC', "h:mm a", { locale: es })}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      {nextAppointment.type === 'video' ? (
                        <>
                          <Video className="w-4 h-4" />
                          <span>Videoconsulta</span>
                        </>
                      ) : (
                        <>
                          <MapPin className="w-4 h-4" />
                          <span className="truncate max-w-[200px]">{nextAppointment.location}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex flex-col gap-3 lg:min-w-[180px]">
                <Button 
                  onClick={() => router.push(`/patient/appointments/${nextAppointment.id}`)}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Ver Detalles
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                {nextAppointment.type === 'video' && (
                  <Button variant="outline" className="w-full">
                    <Video className="w-4 h-4 mr-2" />
                    Unirse a Llamada
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-card border-border border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Stethoscope className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Sin citas programadas</h3>
            <p className="text-muted-foreground max-w-sm mb-4">
              No tienes citas proximas. Es un buen momento para agendar tu siguiente revision.
            </p>
            <Button onClick={() => router.push('/patient/discover')}>
              <Search className="w-4 h-4 mr-2" />
              Buscar Especialista
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickActions.map((action) => (
          <Card 
            key={action.href}
            className="bg-card border-border hover:border-primary/30 transition-all cursor-pointer group"
            onClick={() => router.push(action.href)}
          >
            <CardContent className="p-4 flex flex-col items-center text-center gap-3">
              <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <action.icon className="w-6 h-6" />
              </div>
              <span className="text-sm font-medium text-foreground">{action.label}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Health Summary */}
        <Card className="lg:col-span-2 bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Resumen de Salud
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Tu actividad medica reciente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {healthMetrics.map((metric, index) => (
                <div 
                  key={index}
                  className="p-4 rounded-xl bg-muted/50 border border-border"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <metric.icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-sm text-muted-foreground">{metric.label}</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-foreground">{metric.value}</span>
                    <span className="text-sm text-muted-foreground">{metric.unit}</span>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Upcoming Appointments List */}
            {appointments.length > 0 && (
              <div className="mt-6 pt-6 border-t border-border">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-foreground">Citas Programadas</h4>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs text-muted-foreground"
                    onClick={() => router.push('/patient/dashboard/appointments')}
                  >
                    Ver todas
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
                <div className="space-y-3">
                  {appointments.slice(0, 3).map((appt) => (
                    <div 
                      key={appt.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => router.push(`/patient/appointments/${appt.id}`)}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={appt.provider.image} />
                          <AvatarFallback className="bg-primary/10 text-primary text-sm">
                            {appt.provider.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-foreground">{appt.service.name}</p>
                          <p className="text-xs text-muted-foreground">{appt.provider.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-foreground">
                          {formatInTimeZone(new Date(appt.startTime), 'UTC', "d MMM", { locale: es })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatInTimeZone(new Date(appt.startTime), 'UTC', "h:mm a", { locale: es })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Profile Completion */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">
              Tu Perfil
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Completa tu informacion para una mejor atencion
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Progreso</span>
                <span className="text-sm font-medium text-foreground">{profileCompletion}%</span>
              </div>
              <Progress value={profileCompletion} className="h-2" />
            </div>
            
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Pendientes por completar:</p>
              
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                  <CheckCircle className="w-5 h-5 text-chart-3" />
                  <span className="text-sm text-foreground">Datos personales</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                  <CheckCircle className="w-5 h-5 text-chart-3" />
                  <span className="text-sm text-foreground">Contacto verificado</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-chart-4/10 border border-chart-4/20">
                  <Clock className="w-5 h-5 text-chart-4" />
                  <span className="text-sm text-foreground">Historial medico</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 opacity-60">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Metodo de pago</span>
                </div>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => router.push('/patient/profile')}
            >
              Completar Perfil
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
