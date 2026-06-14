"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Activity, Users, DollarSign, LogOut, Settings, BarChart3, ShieldCheck } from 'lucide-react';
import { toast } from 'react-toastify';

export default function AdminDashboardPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Validate admin role from cookie
        const cookies = document.cookie.split(';');
        const roleCookie = cookies.find(c => c.trim().startsWith('__Secure-userRole='));
        const role = roleCookie ? roleCookie.split('=')[1] : null;

        if (role !== 'ADMIN') {
            toast.error('Acceso denegado. No eres administrador.');
            router.push('/admin/login');
        } else {
            setIsLoading(false);
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
        <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-medical-500/30 font-sans">
            {/* Topbar */}
            <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50 flex items-center justify-between px-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center border border-slate-700">
                        <ShieldCheck className="w-5 h-5 text-medical-500" />
                    </div>
                    <span className="font-bold text-lg text-white tracking-tight">QuHealthy Admin</span>
                </div>
                
                <div className="flex items-center gap-4">
                    <button className="p-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-slate-800">
                        <Settings className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={handleLogout}
                        className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-full text-sm font-semibold transition-all border border-slate-700"
                    >
                        <LogOut className="w-4 h-4" />
                        Cerrar Sesión
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto p-6 lg:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                
                <div>
                    <h1 className="text-3xl font-bold text-white">Resumen Operativo</h1>
                    <p className="text-slate-400 mt-1">Métricas principales de la plataforma</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Stat Card 1 */}
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:border-medical-500/50 transition-colors">
                        <div className="absolute -right-6 -top-6 w-32 h-32 bg-medical-500/10 rounded-full blur-2xl group-hover:bg-medical-500/20 transition-all" />
                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <div>
                                <p className="text-slate-400 text-sm font-medium">Ingresos Totales (Mes)</p>
                                <h3 className="text-3xl font-bold text-white mt-1">$124,500 MXN</h3>
                            </div>
                            <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center text-medical-500">
                                <DollarSign className="w-6 h-6" />
                            </div>
                        </div>
                        <p className="text-sm text-emerald-400 font-medium relative z-10">+12.5% vs mes anterior</p>
                    </div>

                    {/* Stat Card 2 */}
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:border-sky-500/50 transition-colors">
                        <div className="absolute -right-6 -top-6 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl group-hover:bg-sky-500/20 transition-all" />
                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <div>
                                <p className="text-slate-400 text-sm font-medium">Médicos Activos</p>
                                <h3 className="text-3xl font-bold text-white mt-1">1,248</h3>
                            </div>
                            <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center text-sky-500">
                                <Users className="w-6 h-6" />
                            </div>
                        </div>
                        <p className="text-sm text-emerald-400 font-medium relative z-10">+42 nuevos esta semana</p>
                    </div>

                    {/* Stat Card 3 */}
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:border-violet-500/50 transition-colors">
                        <div className="absolute -right-6 -top-6 w-32 h-32 bg-violet-500/10 rounded-full blur-2xl group-hover:bg-violet-500/20 transition-all" />
                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <div>
                                <p className="text-slate-400 text-sm font-medium">Consultas Realizadas</p>
                                <h3 className="text-3xl font-bold text-white mt-1">8,432</h3>
                            </div>
                            <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center text-violet-500">
                                <Activity className="w-6 h-6" />
                            </div>
                        </div>
                        <p className="text-sm text-slate-400 font-medium relative z-10">En los últimos 30 días</p>
                    </div>
                </div>

                {/* Main Content Area placeholder */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col items-center justify-center min-h-[400px]">
                        <BarChart3 className="w-16 h-16 text-slate-700 mb-4" />
                        <h3 className="text-xl font-bold text-slate-300">Gráfico de Suscripciones (Próximamente)</h3>
                        <p className="text-slate-500 mt-2 text-center max-w-sm">
                            Aquí integraremos la vista detallada de Stripe Billing y Stripe Connect para el desglose de ingresos.
                        </p>
                    </div>
                    
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col items-center justify-center min-h-[400px]">
                        <Users className="w-16 h-16 text-slate-700 mb-4" />
                        <h3 className="text-xl font-bold text-slate-300 text-center">Top Médicos</h3>
                        <p className="text-slate-500 mt-2 text-center max-w-[200px]">
                            Listado de médicos con más ingresos generados.
                        </p>
                    </div>
                </div>

            </main>
        </div>
    );
}
