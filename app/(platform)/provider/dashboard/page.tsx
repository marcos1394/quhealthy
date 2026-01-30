"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Loader2, 
  AlertCircle, 
  DollarSign, 
  CheckCircle, 
  Users, 
  Calendar as CalendarIcon, 
  TrendingUp,
  ArrowUpRight,
  Clock,
  Star,
  MoreHorizontal,
  Activity,
  Target,
  Zap,
} from 'lucide-react';

// ShadCN UI
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Componentes del Dashboard
import { SummaryCard } from '@/components/dashboard/SummaryCard';
import { UpcomingAppointments } from '@/components/dashboard/UpcomingAppointments';

// Hook
import { useDashboardData } from '@/hooks/useDashboardData';

// Activity Feed Item
interface ActivityItem {
  id: string;
  type: 'appointment' | 'review' | 'payment' | 'patient';
  title: string;
  description: string;
  time: string;
  icon: React.ElementType;
}

const recentActivity: ActivityItem[] = [
  { id: '1', type: 'appointment', title: 'Cita completada', description: 'Consulta general con Maria Garcia', time: 'Hace 2h', icon: CheckCircle },
  { id: '2', type: 'review', title: 'Nueva reseña', description: 'Juan Perez te dio 5 estrellas', time: 'Hace 3h', icon: Star },
  { id: '3', type: 'payment', title: 'Pago recibido', description: '$850 MXN - Limpieza dental', time: 'Hace 4h', icon: DollarSign },
  { id: '4', type: 'patient', title: 'Nuevo paciente', description: 'Carlos Lopez se registro', time: 'Hace 5h', icon: Users },
];

const activityColors = {
  appointment: 'bg-chart-3/10 text-chart-3',
  review: 'bg-chart-4/10 text-chart-4',
  payment: 'bg-primary/10 text-primary',
  patient: 'bg-chart-2/10 text-chart-2',
};

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState('this_month');
  const { data, isLoading, refetch } = useDashboardData(dateRange);

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex justify-center items-center flex-col gap-4">
        <div className="relative">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
        <p className="text-muted-foreground font-medium text-sm">Cargando metricas...</p>
      </div>
    );
  }

  // Error State
  if (!data) {
    return (
      <div className="min-h-[60vh] flex flex-col justify-center items-center text-center space-y-4">
        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-destructive" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-foreground mb-2">Error al cargar datos</h3>
          <p className="text-muted-foreground text-sm mb-4">No pudimos obtener la informacion del dashboard.</p>
          <Button onClick={() => refetch()} variant="outline">
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  const { analytics, upcomingAppointments } = data;

  return (
    <div className="space-y-8 pb-10 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-xs font-normal text-primary border-primary/30">
              <Activity className="w-3 h-3 mr-1" />
              En vivo
            </Badge>
          </div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Resumen de tu actividad y rendimiento
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px] bg-card border-border">
              <CalendarIcon className="w-4 h-4 mr-2 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hoy</SelectItem>
              <SelectItem value="this_week">Esta Semana</SelectItem>
              <SelectItem value="this_month">Este Mes</SelectItem>
              <SelectItem value="last_month">Mes Pasado</SelectItem>
              <SelectItem value="all_time">Todo el Historial</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="default" className="hidden md:flex">
            <Zap className="w-4 h-4 mr-2" />
            Exportar Reporte
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard 
          title="Ingresos del Mes" 
          value={analytics.monthlyRevenue.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })} 
          icon={DollarSign}
          variant="primary"
          trend={{ value: 12.5, isPositive: true, label: 'vs mes anterior' }}
        />
        <SummaryCard 
          title="Citas Completadas" 
          value={analytics.completedAppointments.toString()} 
          icon={CheckCircle}
          variant="success"
          trend={{ value: 8.2, isPositive: true, label: 'vs mes anterior' }}
        />
        <SummaryCard 
          title="Nuevos Pacientes" 
          value={analytics.newClients.toString()} 
          icon={Users}
          variant="info"
          trend={{ value: 4.1, isPositive: true, label: 'vs mes anterior' }}
        />
        <SummaryCard 
          title="Tasa de Ocupacion" 
          value="78%" 
          icon={Target}
          variant="warning"
          trend={{ value: 2.3, isPositive: false, label: 'vs mes anterior' }}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Revenue Chart */}
        <Card className="lg:col-span-2 bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Rendimiento Financiero
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Ingresos mensuales del ano en curso
              </CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Ver detalles</DropdownMenuItem>
                <DropdownMenuItem>Exportar datos</DropdownMenuItem>
                <DropdownMenuItem>Configurar alertas</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
          <CardContent className="pt-4">
            {/* Chart Visualization */}
            <div className="h-[280px] flex items-end justify-between gap-2">
              {[35, 45, 38, 60, 55, 70, 65, 80, 75, 90, 85, 78].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div 
                    className="w-full bg-muted rounded-t-md relative group cursor-pointer hover:bg-primary/10 transition-colors overflow-hidden" 
                    style={{ height: `${h * 2.5}px` }}
                  >
                    <div 
                      className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary to-chart-2 rounded-t-md transition-all duration-500" 
                      style={{ height: `${h}%` }}
                    />
                    {/* Tooltip */}
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-foreground text-background text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      ${(h * 320).toLocaleString()}
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-medium">
                    {['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'][i]}
                  </span>
                </div>
              ))}
            </div>
            
            {/* Legend */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-primary to-chart-2" />
                  <span className="text-xs text-muted-foreground">Ingresos</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-muted" />
                  <span className="text-xs text-muted-foreground">Proyeccion</span>
                </div>
              </div>
              <Link href="/provider/dashboard/analytics" className="text-xs text-primary hover:underline flex items-center gap-1">
                Ver reporte completo
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Appointments */}
        <div className="lg:col-span-1">
          <UpcomingAppointments appointments={upcomingAppointments} />
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Activity */}
        <Card className="lg:col-span-2 bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg font-semibold text-foreground">
                Actividad Reciente
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Ultimos eventos de tu cuenta
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
              Ver todo
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activityColors[item.type]}`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{item.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{item.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Goals & Progress */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Metas del Mes
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Progreso hacia tus objetivos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Revenue Goal */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Ingresos</span>
                <span className="font-medium text-foreground">$28,500 / $35,000</span>
              </div>
              <Progress value={81} className="h-2" />
              <p className="text-xs text-muted-foreground">81% completado</p>
            </div>
            
            {/* Appointments Goal */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Citas</span>
                <span className="font-medium text-foreground">42 / 50</span>
              </div>
              <Progress value={84} className="h-2" />
              <p className="text-xs text-muted-foreground">84% completado</p>
            </div>
            
            {/* New Patients Goal */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Nuevos Pacientes</span>
                <span className="font-medium text-foreground">12 / 20</span>
              </div>
              <Progress value={60} className="h-2" />
              <p className="text-xs text-muted-foreground">60% completado</p>
            </div>
            
            {/* Rating Goal */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Calificacion Promedio</span>
                <span className="font-medium text-foreground flex items-center gap-1">
                  <Star className="w-4 h-4 text-chart-4 fill-chart-4" />
                  4.8 / 5.0
                </span>
              </div>
              <Progress value={96} className="h-2" />
              <p className="text-xs text-muted-foreground">Excelente rendimiento</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
