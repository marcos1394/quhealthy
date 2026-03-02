"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { AlertCircle, BarChart2, CheckCircle, Users, Sparkles, RefreshCw, Crown, Clock, Store, ArrowRight, CalendarDays, Video, MapPin, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SummaryCard } from "@/components/dashboard/SummaryCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { useDashboardData } from "@/hooks/useDashboardData";
import { cn } from "@/lib/utils";

// 🚀 IMPORTAMOS EL NUEVO COMPONENTE DE REPUTACIÓN
import { ProviderReputationCard } from "@/components/dashboard/ProviderReputationCard";

export default function DashboardPage() {
  const router = useRouter();
  const [dateRange, setDateRange] = useState("this_month");
  const { data, isLoading, refetch } = useDashboardData(dateRange);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex justify-center items-center flex-col gap-5">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
          <Sparkles className="w-10 h-10 text-medical-600 dark:text-medical-400" />
        </motion.div>
        <div className="text-center space-y-1">
          <p className="text-slate-700 dark:text-slate-300 font-medium text-lg">Loading your dashboard</p>
          <p className="text-slate-500 dark:text-slate-400 text-sm animate-pulse font-light">Syncing information...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-[70vh] flex flex-col justify-center items-center text-center px-4">
        <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 rounded-xl flex items-center justify-center border border-red-200 dark:border-red-500/20 mb-5">
          <AlertCircle className="w-8 h-8 text-red-500 dark:text-red-400" />
        </div>
        <div className="space-y-3 max-w-md">
          <h3 className="text-xl font-medium text-slate-900 dark:text-white">Could not load data</h3>
          <p className="text-slate-500 dark:text-slate-400 font-light">An error occurred while syncing your information. Please try again.</p>
          <Button onClick={() => refetch()} variant="outline" className="border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">
            <RefreshCw className="w-4 h-4 mr-2" />Retry
          </Button>
        </div>
      </div>
    );
  }

  const { plan, hasConfiguredStore, analytics, upcomingAppointments } = data;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SCHEDULED": return <Badge className="bg-medical-50 dark:bg-medical-500/10 text-medical-600 dark:text-medical-400 border-0">Confirmed</Badge>;
      case "PENDING_PAYMENT": return <Badge className="bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-0">Payment Pending</Badge>;
      case "IN_PROGRESS": return <Badge className="bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-0 animate-pulse">In Progress</Badge>;
      default: return <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-500 border-0">{status}</Badge>;
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6 pb-10">
      {/* Header & Subscription Banner */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 mb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-medium text-slate-900 dark:text-white tracking-tight mb-1.5">Welcome back 👋</h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg font-light">Here&apos;s your business summary.</p>
        </div>
        <div className={cn(
          "flex items-center justify-between gap-5 px-4 py-2.5 rounded-xl border transition-colors",
          plan.status === "TRIAL" ? "bg-blue-50 dark:bg-blue-500/5 border-blue-200 dark:border-blue-500/20" :
            plan.status === "EXPIRED" ? "bg-red-50 dark:bg-red-500/5 border-red-200 dark:border-red-500/20" :
              "bg-medical-50 dark:bg-medical-500/5 border-medical-200 dark:border-medical-500/20"
        )}>
          <div className="flex items-center gap-2.5">
            <div className={cn("p-1.5 rounded-lg",
              plan.status === "TRIAL" ? "bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400" : "bg-medical-100 dark:bg-medical-500/10 text-medical-600 dark:text-medical-400")}>
              <Crown className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{plan.name}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <Clock className="w-3 h-3 text-slate-400" />
                <span className={cn("text-xs font-medium", plan.daysLeft <= 3 ? "text-red-500 dark:text-red-400" : "text-slate-500 dark:text-slate-400")}>
                  {plan.daysLeft} days left
                </span>
              </div>
            </div>
          </div>
          <Button size="sm" className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 font-semibold rounded-lg shadow-none text-xs">
            Upgrade
          </Button>
        </div>
      </div>

      {/* CTA: Configure Store */}
      <AnimatePresence>
        {!hasConfiguredStore && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-6">
            <Card className="bg-medical-50 dark:bg-medical-500/5 border-medical-200 dark:border-medical-500/20 shadow-sm overflow-hidden relative group">
              <CardContent className="p-5 md:p-7 flex flex-col md:flex-row items-center justify-between gap-5 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-medical-600 dark:bg-medical-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Store className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-0.5">Your store is still empty</h3>
                    <p className="text-slate-600 dark:text-slate-400 max-w-xl font-light text-sm">
                      Set up your services, prices and schedules so patients can start booking appointments with you.
                    </p>
                  </div>
                </div>
                <Button size="lg" onClick={() => router.push("/provider/store")}
                  className="w-full md:w-auto bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 font-semibold h-11 px-6 shadow-none rounded-xl">
                  Set Up My Store<ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <SummaryCard title="Revenue (This month)" value={analytics.monthlyRevenue.toLocaleString("es-MX", { style: "currency", currency: "MXN" })}
          icon={BarChart2} color="text-emerald-600 dark:text-emerald-400" bgColor="bg-emerald-50 dark:bg-emerald-500/10" borderColor="border-slate-200 dark:border-slate-800"
          trend={{ value: 12.5, isPositive: true, period: "last month" }} />
        <SummaryCard title="Completed Appointments" value={analytics.completedAppointments.toString()}
          icon={CheckCircle} color="text-blue-600 dark:text-blue-400" bgColor="bg-blue-50 dark:bg-blue-500/10" borderColor="border-slate-200 dark:border-slate-800"
          trend={{ value: 8.2, isPositive: true, period: "last month" }} />
        <SummaryCard title="New Patients" value={analytics.newClients.toString()}
          icon={Users} color="text-pink-600 dark:text-pink-400" bgColor="bg-pink-50 dark:bg-pink-500/10" borderColor="border-slate-200 dark:border-slate-800"
          trend={{ value: 2.1, isPositive: false, period: "last month" }} />
      </div>

      {/* Main Content Grid: Chart & Reputation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-6">
        {/* Revenue Chart */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 min-h-[350px] flex flex-col p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-medical-600 dark:text-medical-400" /> Financial Overview
              </h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-light mt-0.5">Revenue growth over the last 6 months</p>
            </div>
            <Badge variant="outline" className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20 text-xs font-semibold">
              +15% Top
            </Badge>
          </div>
          <RevenueChart />
        </Card>

        {/* 🚀 TARJETA DE REPUTACIÓN DEL PROVEEDOR */}
        <ProviderReputationCard />
      </div>

      {/* Upcoming Appointments (Full Width below the grid) */}
      <div className="mt-5">
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-3.5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-medical-600 dark:text-medical-400" />Upcoming Appointments
              </CardTitle>
              {upcomingAppointments.length > 0 && (
                <Button variant="ghost" size="sm" onClick={() => router.push("/provider/appointments")}
                  className="text-medical-600 dark:text-medical-400 hover:text-medical-700 dark:hover:text-medical-300 text-xs">
                  View all
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-y-auto custom-scrollbar max-h-[400px]">
            {upcomingAppointments.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-7 text-center min-h-[220px]">
                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3">
                  <CalendarDays className="w-6 h-6 text-slate-400 dark:text-slate-600" />
                </div>
                <h4 className="text-base font-medium text-slate-700 dark:text-slate-300 mb-1">No upcoming appointments</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto font-light">
                  You don&apos;t have any reservations for the next few days. Share your profile to receive patients.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {upcomingAppointments.map((appt) => {
                  const dateObj = parseISO(appt.startTime);
                  const formattedDate = format(dateObj, "EEE d 'de' MMM", { locale: es });
                  const formattedTime = format(dateObj, "h:mm a");
                  return (
                    <div key={appt.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                      <div className="flex justify-between items-start mb-2.5">
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white text-base">{appt.consumerName}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400 font-light">{appt.serviceName}</p>
                        </div>
                        {getStatusBadge(appt.status)}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700">
                            <Clock className="w-3 h-3 text-medical-600 dark:text-medical-400" />
                            <span className="font-medium text-slate-700 dark:text-slate-300 capitalize text-xs">{formattedDate} • {formattedTime}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {appt.modality === "ONLINE" ? <Video className="w-3.5 h-3.5 text-blue-500" /> : <MapPin className="w-3.5 h-3.5 text-emerald-500" />}
                            <span className="text-xs">{appt.modality === "ONLINE" ? "Video Call" : "In Office"}</span>
                          </div>
                        </div>
                        <Button size="sm" onClick={() => router.push(`/provider/appointments/${appt.id}`)}
                          className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 font-medium opacity-0 group-hover:opacity-100 transition-opacity rounded-lg shadow-none text-xs h-7">
                          <Check className="w-3 h-3 mr-1" />Manage
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Floating Quick Actions */}
      <QuickActions />
    </motion.div>
  );
}