"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, BarChart3, TrendingUp, Users, Search, ShoppingBag, Eye, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { useSessionStore } from "@/stores/SessionStore";
import { analyticsService } from "@/services/analytics.service";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell } from "recharts";

export default function StoreMetricsPage() {
  const router = useRouter();
  const t = useTranslations("StoreHub");
  const { user } = useSessionStore();
  
  const [loading, setLoading] = useState(true);
  const [salesMetrics, setSalesMetrics] = useState<any>(null);
  const [visitsMetrics, setVisitsMetrics] = useState<any>(null);
  const [days, setDays] = useState(30);

  useEffect(() => {
    if (user?.id) {
      loadMetrics(days);
    }
  }, [user?.id, days]);

  const loadMetrics = async (daysPeriod: number) => {
    setLoading(true);
    try {
      const providerId = user!.id; 
      const [sales, visits] = await Promise.all([
        analyticsService.getStoreSalesMetrics(providerId, daysPeriod),
        analyticsService.getStoreVisitsMetrics(providerId, daysPeriod)
      ]);
      setSalesMetrics(sales);
      setVisitsMetrics(visits);
    } catch (error) {
      console.error("Error loading metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] bg-gray-50/50 dark:bg-[#050505]">
        <QhSpinner size="lg" />
        <p className="text-xs font-semibold text-gray-500 mt-4 animate-pulse">Cargando métricas...</p>
      </div>
    );
  }

  // Preprocesar datos para gráficos
  const chartColors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  const formatPieData = (mapData: Record<string, number> | undefined) => {
    if (!mapData) return [];
    return Object.entries(mapData).map(([name, value]) => ({ name, value }));
  };

  const ageData = formatPieData(visitsMetrics?.demographicsAge);
  const genderData = formatPieData(visitsMetrics?.demographicsGender);
  const locationData = formatPieData(visitsMetrics?.demographicsLocation);

  const totalRevenue = salesMetrics?.revenueByDate?.reduce((acc: number, curr: any) => acc + curr.totalRevenue, 0) || 0;
  const totalVisits = visitsMetrics?.visitsByDate?.reduce((acc: number, curr: any) => acc + curr.count, 0) || 0;
  const topItem = salesMetrics?.topSellingItems?.[0];

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] font-sans text-gray-900 dark:text-white pt-8 px-6 md:px-10 pb-24">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.back()}
              className="w-10 h-10 rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]"
            >
              <ArrowLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" strokeWidth={2} />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Métricas de Tienda</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Analiza el rendimiento de tu catálogo y visitas</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {[7, 30, 90].map((d) => (
              <Button
                key={d}
                variant={days === d ? "default" : "outline"}
                onClick={() => setDays(d)}
                className={`h-9 px-3 rounded-lg text-xs font-bold ${days === d ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-0' : 'bg-white dark:bg-[#0a0a0a] text-gray-600 border-gray-200'}`}
              >
                {d} Días
              </Button>
            ))}
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-[#0a0a0a] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Eye className="w-6 h-6" strokeWidth={2} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Visitas</p>
              <p className="text-2xl font-bold">{totalVisits}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0a0a0a] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-6 h-6" strokeWidth={2} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ingresos</p>
              <p className="text-2xl font-bold">${totalRevenue.toLocaleString()}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0a0a0a] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <ShoppingBag className="w-6 h-6" strokeWidth={2} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Más Vendido</p>
              <p className="text-sm font-bold truncate max-w-[150px]">{topItem ? topItem.itemName : 'N/A'}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico Visitas */}
          <div className="bg-white dark:bg-[#0a0a0a] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <h3 className="text-sm font-bold mb-6 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-emerald-600"/> Visitas por Día</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={visitsMetrics?.visitsByDate || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                  <XAxis dataKey="visitDate" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                  <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={3} dot={false} activeDot={{r: 6}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gráfico Ventas */}
          <div className="bg-white dark:bg-[#0a0a0a] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <h3 className="text-sm font-bold mb-6 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-emerald-600"/> Ingresos por Día</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesMetrics?.revenueByDate || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                  <XAxis dataKey="saleDate" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                  <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="totalRevenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Demografía y Top Búsquedas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-[#0a0a0a] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm lg:col-span-1">
            <h3 className="text-sm font-bold mb-6 flex items-center gap-2"><Users className="w-4 h-4 text-emerald-600"/> Demografía (Edad)</h3>
            {ageData.length > 0 ? (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={ageData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={5} dataKey="value">
                      {ageData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend iconType="circle" wrapperStyle={{fontSize: '10px'}} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex h-48 items-center justify-center text-xs text-gray-500">No hay datos suficientes</div>
            )}
          </div>
          
          <div className="bg-white dark:bg-[#0a0a0a] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm lg:col-span-2">
            <h3 className="text-sm font-bold mb-6 flex items-center gap-2"><Search className="w-4 h-4 text-emerald-600"/> Top Búsquedas</h3>
            {visitsMetrics?.topSearchQueries?.length > 0 ? (
              <div className="space-y-3">
                {visitsMetrics.topSearchQueries.slice(0, 5).map((q: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#111] rounded-xl text-sm">
                    <span className="font-medium">"{q.term}"</span>
                    <span className="font-bold text-gray-500">{q.count} búsquedas</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-32 items-center justify-center text-xs text-gray-500">No hay búsquedas registradas</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
