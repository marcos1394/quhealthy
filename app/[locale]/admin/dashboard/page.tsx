"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Activity, Users, DollarSign, LogOut, Settings, BarChart3, ShieldCheck, Briefcase } from 'lucide-react';
import { toast } from 'react-toastify';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { adminService, FinanceMetricsDTO } from '@/services/admin.service';

export default function AdminDashboardPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [metrics, setMetrics] = useState<FinanceMetricsDTO | null>(null);

    useEffect(() => {
        // Validate admin role from cookie
        const cookies = document.cookie.split(';');
        const roleCookie = cookies.find(c => c.trim().startsWith('__Secure-userRole='));
        const role = roleCookie ? roleCookie.split('=')[1] : null;

        if (role !== 'ADMIN') {
            toast.error('Acceso denegado. No eres administrador.');
            router.push('/admin/login');
        } else {
            adminService.getFinanceMetrics()
                .then(data => {
                    setMetrics(data);
                    setIsLoading(false);
                })
                .catch(err => {
                    console.error("Error fetching metrics", err);
                    toast.error("Error al cargar métricas de Stripe");
                    setIsLoading(false);
                });
        }
    }, [router]);

    const handleLogout = () => {
        document.cookie = '__Secure-userRole=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        router.push('/admin/login');
    };

    if (isLoading) {
        return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Cargando panel...</div>;
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-medical-500/30 font-sans">
            {/* Topbar */}
            <header className="h-16 border-b border-slate-200 bg-white/50 backdrop-blur-xl sticky top-0 z-50 flex items-center justify-between px-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-200 shadow-sm">
                        <ShieldCheck className="w-5 h-5 text-slate-800" />
                    </div>
                    <span className="font-bold text-lg text-slate-900 tracking-tight">QuHealthy Admin</span>
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
                    <h1 className="text-3xl font-bold text-slate-900">Resumen Operativo</h1>
                    <p className="text-slate-500 mt-1">Métricas principales de la plataforma</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Stat Card 1 */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm relative overflow-hidden group hover:border-medical-500/50 transition-colors">
                        <div className="absolute -right-6 -top-6 w-32 h-32 bg-medical-500/10 rounded-full blur-2xl group-hover:bg-medical-500/20 transition-all" />
                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <div>
                                <p className="text-slate-500 text-sm font-medium">Ingresos Totales (30 días)</p>
                                <h3 className="text-3xl font-bold text-slate-900 mt-1">
                                    {metrics ? new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(metrics.totalRevenue) : 'Cargando...'}
                                </h3>
                            </div>
                            <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-medical-500 shadow-sm">
                                <DollarSign className="w-6 h-6" />
                            </div>
                        </div>
                        <p className="text-sm text-emerald-600 font-medium relative z-10">Conectado a Stripe Live</p>
                    </div>

                    {/* Stat Card 2 */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm relative overflow-hidden group hover:border-sky-500/50 transition-colors">
                        <div className="absolute -right-6 -top-6 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl group-hover:bg-sky-500/20 transition-all" />
                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <div>
                                <p className="text-slate-500 text-sm font-medium">Suscripciones Activas</p>
                                <h3 className="text-3xl font-bold text-slate-900 mt-1">
                                    {metrics ? metrics.activeSubscriptionsCount : 'Cargando...'}
                                </h3>
                            </div>
                            <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-sky-500 shadow-sm">
                                <Users className="w-6 h-6" />
                            </div>
                        </div>
                        <p className="text-sm text-sky-600 font-medium relative z-10">Médicos Premium</p>
                    </div>

                    {/* Stat Card 3 */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm relative overflow-hidden group hover:border-violet-500/50 transition-colors">
                        <div className="absolute -right-6 -top-6 w-32 h-32 bg-violet-500/10 rounded-full blur-2xl group-hover:bg-violet-500/20 transition-all" />
                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <div>
                                <p className="text-slate-500 text-sm font-medium">Ingresos por Comisiones</p>
                                <h3 className="text-3xl font-bold text-slate-900 mt-1">
                                    {metrics ? new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(metrics.totalCommissionsRevenue) : 'Cargando...'}
                                </h3>
                            </div>
                            <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-violet-500 shadow-sm">
                                <Briefcase className="w-6 h-6" />
                            </div>
                        </div>
                        <p className="text-sm text-slate-500 font-medium relative z-10">Cortes de Stripe Connect</p>
                    </div>
                </div>

                {/* Main Content Area placeholder */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col min-h-[400px]">
                        <h3 className="text-xl font-bold text-slate-900 mb-6">Ingresos (Últimos 30 días)</h3>
                        <div className="flex-1 w-full h-full min-h-[300px]">
                            {metrics && metrics.chartData ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={metrics.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorSub" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorCom" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', color: '#0f172a' }}
                                            itemStyle={{ color: '#0f172a' }}
                                        />
                                        <Area type="monotone" dataKey="subscriptions" name="Suscripciones" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorSub)" />
                                        <Area type="monotone" dataKey="commissions" name="Comisiones" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorCom)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex h-full items-center justify-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-300"></div>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col items-center justify-center min-h-[400px]">
                        <Users className="w-16 h-16 text-slate-300 mb-4" />
                        <h3 className="text-xl font-bold text-slate-900 text-center">Top Médicos</h3>
                        <p className="text-slate-500 mt-2 text-center max-w-[200px]">
                            Listado de médicos con más ingresos generados.
                        </p>
                    </div>
                </div>

            </main>
        </div>
    );
}
