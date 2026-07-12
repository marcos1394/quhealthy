"use client"
/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/js-hoist-intl */;

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Activity, Users, DollarSign, LogOut, Settings, ShieldCheck, Briefcase, CalendarCheck, Server, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { clearAuthCookies } from "@/app/actions/auth-cookies";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Legend, Cell, PieChart, Pie } from 'recharts';
import { adminService, UnitEconomicsDTO, AdminDashboardDTO } from '@/services/admin.service';
import { useSessionStore } from '@/stores/SessionStore';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'economics' | 'operations' | 'health'>('economics');
  
  const [economics, setEconomics] = useState<UnitEconomicsDTO | null>(null);
  const [dashboard, setDashboard] = useState<AdminDashboardDTO | null>(null);

  useEffect(() => {
    const cookies = document.cookie.split(';');
    const roleCookie = cookies.find(c => c.trim().startsWith('__Secure-userRole='));
    const role = roleCookie ? roleCookie.split('=')[1] : null;

    if (role !== 'ROLE_ADMIN' && role !== 'ADMIN') {
      toast.error('Acceso denegado. No eres administrador.');
      router.push('/admin/login');
    } else {
      useSessionStore.getState().initializeSession().then(async () => {
        try {
          const [econData, dashData] = await Promise.all([
            adminService.getUnitEconomics(),
            adminService.getDashboardMetrics()
          ]);
          setEconomics(econData);
          setDashboard(dashData);
        } catch (err) {
          console.error("Error fetching admin metrics", err);
          toast.error("Error al cargar métricas del panel");
        } finally {
          setIsLoading(false);
        }
      }).catch(() => {
        toast.error("Sesión inválida.");
        router.push('/admin/login');
      });
    }
  }, [router]);

  const handleLogout = async () => {
    await clearAuthCookies();
    router.push('/admin/login');
  };

  if (isLoading) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Cargando panel maestro...</div>;
  }

  const formatCurrency = (val: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-medical-500/30 font-sans">
      {/* Topbar */}
      <header className="h-16 border-b border-slate-200 bg-white/50 backdrop-blur-xl sticky top-0 z-50 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-200 shadow-sm">
            <ShieldCheck className="w-5 h-5 text-slate-800" />
          </div>
          <span className="font-bold text-lg text-slate-900 tracking-tight">QuHealthy Admin Master</span>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors rounded-full hover:bg-slate-100">
            <Settings className="w-5 h-5" />
          </button>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-full text-sm font-semibold transition-all shadow-md"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6 lg:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Centro de Mando</h1>
          <p className="text-slate-500 mt-1">Visibilidad crítica de negocio, operaciones y nube.</p>
        </div>

        {/* TABS */}
        <div className="flex space-x-2 border-b border-slate-200">
          <button 
            onClick={() => setActiveTab('economics')}
            className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'economics' ? 'border-medical-500 text-medical-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            <DollarSign className="w-4 h-4 inline mr-2"/>
            Unit Economics
          </button>
          <button 
            onClick={() => setActiveTab('operations')}
            className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'operations' ? 'border-medical-500 text-medical-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            <CalendarCheck className="w-4 h-4 inline mr-2"/>
            Operaciones Médicas
          </button>
          <button 
            onClick={() => setActiveTab('health')}
            className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'health' ? 'border-medical-500 text-medical-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            <Activity className="w-4 h-4 inline mr-2"/>
            Salud de Plataforma
          </button>
        </div>

        {/* TAB CONTENT */}
        <div className="mt-6">
          
          {/* TAB: ECONOMICS */}
          {activeTab === 'economics' && economics && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                  <p className="text-slate-500 text-sm font-medium">Ingreso Bruto (30 días)</p>
                  <h3 className="text-3xl font-bold text-slate-900 mt-1">{formatCurrency(economics.totalRevenue)}</h3>
                  <p className="text-xs text-emerald-600 mt-2">Stripe Total</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm border-l-4 border-l-orange-500">
                  <p className="text-slate-500 text-sm font-medium">Comisiones Stripe</p>
                  <h3 className="text-3xl font-bold text-slate-900 mt-1">{formatCurrency(economics.stripeFees)}</h3>
                  <p className="text-xs text-orange-600 mt-2">Costo de procesamiento</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm border-l-4 border-l-rose-500">
                  <p className="text-slate-500 text-sm font-medium">Costos GCP Nube</p>
                  <h3 className="text-3xl font-bold text-slate-900 mt-1">{formatCurrency(economics.cloudCosts)}</h3>
                  <p className="text-xs text-rose-600 mt-2">API Billing</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm border-l-4 border-l-blue-500">
                  <p className="text-slate-500 text-sm font-medium">ARPU</p>
                  <h3 className="text-3xl font-bold text-slate-900 mt-1">{formatCurrency(economics.arpu)}</h3>
                  <p className="text-xs text-slate-400 mt-2">Base: {economics.totalUsers} usuarios</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm border-l-4 border-l-emerald-500">
                  <p className="text-slate-500 text-sm font-medium">Beneficio Neto</p>
                  <h3 className="text-3xl font-bold text-emerald-600 mt-1">{formatCurrency(economics.netProfit)}</h3>
                  <p className="text-xs text-slate-400 mt-2">Ingresos menos Costos</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Rentabilidad por Usuario */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-center">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Rentabilidad por Usuario</h3>
                  <div className="flex gap-4 items-center justify-center flex-wrap">
                    <div className="text-center p-4 bg-slate-50 rounded-2xl flex-1 min-w-[120px]">
                      <p className="text-xs text-slate-500">Ingreso</p>
                      <p className="text-xl font-bold text-slate-800 mt-1">{formatCurrency(economics.arpu)}</p>
                    </div>
                    <div className="text-xl text-slate-300">-</div>
                    <div className="text-center p-4 bg-slate-50 rounded-2xl flex-1 min-w-[120px]">
                      <p className="text-xs text-slate-500">Costo Nube</p>
                      <p className="text-xl font-bold text-rose-500 mt-1">{formatCurrency(economics.costPerUser)}</p>
                    </div>
                    <div className="text-xl text-slate-300">=</div>
                    <div className="text-center p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex-1 min-w-[120px]">
                      <p className="text-xs text-emerald-700">Margen</p>
                      <p className="text-xl font-bold text-emerald-600 mt-1">
                        {formatCurrency(economics.arpu - economics.costPerUser)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Top Médicos */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm overflow-hidden">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center justify-between">
                    Top Médicos (Ingresos)
                    <Briefcase className="w-5 h-5 text-medical-500"/>
                  </h3>
                  {economics.topProviders && economics.topProviders.length > 0 ? (
                    <div className="space-y-3">
                      {economics.topProviders.map((provider, index) => (
                        <div key={provider.providerId} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-medical-100 text-medical-600 flex items-center justify-center font-bold text-sm">
                              {index + 1}
                            </div>
                            <span className="font-medium text-slate-700">{provider.providerName || `Dr. #${provider.providerId}`}</span>
                          </div>
                          <span className="font-bold text-slate-900">{formatCurrency(provider.totalEarned)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-slate-400 py-8">
                      No hay datos de doctores este mes.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB: OPERATIONS */}
          {activeTab === 'operations' && dashboard && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-slate-500 text-sm font-medium">Citas Hoy</p>
                    <Activity className="w-5 h-5 text-sky-500"/>
                  </div>
                  <h3 className="text-3xl font-bold text-slate-900">{dashboard.appointmentsToday}</h3>
                </div>
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-slate-500 text-sm font-medium">Médicos Activos (Mes)</p>
                    <Users className="w-5 h-5 text-medical-500"/>
                  </div>
                  <h3 className="text-3xl font-bold text-slate-900">{dashboard.activeProvidersThisMonth}</h3>
                </div>
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-slate-500 text-sm font-medium">Nuevos Médicos (Onboarding)</p>
                    <Users className="w-5 h-5 text-violet-500"/>
                  </div>
                  <h3 className="text-3xl font-bold text-slate-900">{dashboard.newProvidersThisMonth}</h3>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col min-h-[350px]">
                <h3 className="text-lg font-bold text-slate-900 mb-6">Estado de Citas (Mes Actual)</h3>
                <div className="flex-1 w-full h-full min-h-[250px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart
                      layout="vertical"
                      data={[
                        { name: 'Completadas', cantidad: dashboard.completedAppointmentsThisMonth, color: '#10b981' },
                        { name: 'Canceladas', cantidad: dashboard.cancelledAppointmentsThisMonth, color: '#f43f5e' },
                        { name: 'No-Show', cantidad: dashboard.noShowAppointmentsThisMonth, color: '#f59e0b' },
                      ]}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={100} />
                      <RechartsTooltip cursor={{fill: 'transparent'}} />
                      <Bar dataKey="cantidad" radius={[0, 4, 4, 0]}>
                        {
                          [0,1,2].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={['#10b981', '#f43f5e', '#f59e0b'][index]} />
                          ))
                        }
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* TAB: HEALTH */}
          {activeTab === 'health' && (
            <div className="space-y-6">
              
              <div className="bg-slate-900 text-white border border-slate-800 rounded-3xl p-8 shadow-xl">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                      <Server className="w-6 h-6 text-medical-400" />
                      Estado de Microservicios
                    </h3>
                    <p className="text-slate-400 mt-1">Monitoreo activo usando Spring Boot Actuator y Grafana</p>
                  </div>
                  <a 
                    href="http://grafana.localhost:3000" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
                  >
                    <Activity className="w-4 h-4"/>
                    Abrir Grafana
                  </a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { name: 'API Gateway', status: 'online' },
                    { name: 'Auth Service', status: 'online' },
                    { name: 'Appointment Service', status: 'online' },
                    { name: 'Payment Service', status: 'online' },
                    { name: 'Catalog Service', status: 'online' },
                    { name: 'Admin Service', status: 'online' },
                  ].map(srv => (
                    <div key={srv.name} className="bg-slate-800 rounded-xl p-4 flex items-center justify-between border border-slate-700">
                      <span className="font-medium">{srv.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="text-xs text-emerald-400 font-bold uppercase">Online</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex gap-3 text-rose-400">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p className="text-sm">
                    <strong>Nota:</strong> Los estados mostrados aquí son simulados en la capa del Admin Master UI. 
                    Para ver latencias reales, colas de RabbitMQ, uso de CPU y logs de errores 500, ingresa al panel oficial de Grafana en GCP.
                  </p>
                </div>
              </div>

            </div>
          )}

        </div>

      </main>
    </div>
  );
}
