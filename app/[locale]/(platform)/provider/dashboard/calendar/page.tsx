"use client";

import React, { useState, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Plus, Loader2, Settings, Link as LinkIcon, CheckCircle, RefreshCcw, CalendarDays, Sparkles, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CalendarView } from "@/components/dashboard/CalendarView";
import { OperatingHoursModal } from "@/components/dashboard/OperatingHours";
import { TimeBlockModal } from "@/components/dashboard/TimeBlockModal";
import { useCalendarIntegration } from "@/hooks/useCalendarIntegration";

function CalendarLoading() {
  return (
    <div className="min-h-[60vh] w-full flex flex-col items-center justify-center">
      <Loader2 className="w-8 h-8 text-medical-600 dark:text-medical-400 animate-spin mb-3" />
      <p className="text-slate-500 dark:text-slate-400 animate-pulse font-light">Preparing your smart calendar...</p>
    </div>
  );
}

function CalendarContent() {
  const [isHoursModalOpen, setIsHoursModalOpen] = useState(false);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { isGoogleConnected, isCheckingGoogle, handleGoogleConnect } = useCalendarIntegration();

  return (
    <div className="space-y-6 pb-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6 max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 pb-5 border-b border-slate-200 dark:border-slate-800">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-medical-50 dark:bg-medical-500/10 rounded-xl border border-medical-200 dark:border-medical-500/20">
                <CalendarDays className="w-6 h-6 text-medical-600 dark:text-medical-400" />
              </div>
              <h1 className="text-2xl md:text-3xl font-medium text-slate-900 dark:text-white tracking-tight">Virtual Calendar</h1>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-base max-w-xl font-light ml-12">
              Control your office hours, block personal time, and view upcoming patients.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <Button onClick={() => setIsHoursModalOpen(true)} variant="outline"
              className="h-9 px-4 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl font-medium text-sm">
              <Clock className="w-3.5 h-3.5 mr-1.5 text-medical-600 dark:text-medical-400" />Operating Hours
            </Button>
            <Button onClick={() => setIsBlockModalOpen(true)}
              className="h-9 px-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 rounded-xl font-semibold text-sm shadow-none">
              <Plus className="w-4 h-4 mr-1" />Block Time
            </Button>
          </div>
        </div>

        {/* Google Integration Banner */}
        <AnimatePresence>
          <motion.div layout initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            className={cn("rounded-xl border p-5 flex flex-col md:flex-row items-center justify-between gap-5 relative overflow-hidden transition-all",
              isGoogleConnected
                ? "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                : "bg-medical-50 dark:bg-medical-500/5 border-medical-200 dark:border-medical-500/20"
            )}>
            <div className="flex items-center gap-4 relative z-10">
              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 shrink-0">
                <svg className="w-6 h-6" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path fill="#4285F4" d="M3 10.5v27C3 41.085 5.915 44 9.5 44h29c3.585 0 6.5-2.915 6.5-6.5v-27H3z" />
                  <path fill="#1666D5" d="M3 10.5v12h42v-12H3z" />
                  <path fill="#E8EAED" d="M3 10.5h42V20H3z" />
                  <text x="24" y="34" fill="#1666D5" fontFamily="Arial" fontSize="16" fontWeight="bold" textAnchor="middle">31</text>
                  <path fill="#EA4335" d="M9.5 4h5v9h-5z" />
                  <path fill="#FBBC04" d="M33.5 4h5v9h-5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-0.5">
                  Bidirectional Sync
                  {isGoogleConnected ? (
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/20">
                      <CheckCircle className="w-2.5 h-2.5" />ACTIVE
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-500/20">
                      <AlertCircle className="w-2.5 h-2.5" />RECOMMENDED
                    </span>
                  )}
                </h3>
                <p className={cn("text-sm font-light", isGoogleConnected ? "text-slate-500 dark:text-slate-400" : "text-slate-600 dark:text-slate-400")}>
                  {isGoogleConnected
                    ? "Your personal events automatically block your medical calendar."
                    : "Connect your calendar to prevent patients from scheduling over your personal commitments."}
                </p>
              </div>
            </div>
            <div className="shrink-0 relative z-10 w-full md:w-auto">
              {isCheckingGoogle ? (
                <div className="h-9 w-28 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
              ) : isGoogleConnected ? (
                <Button variant="outline" className="w-full md:w-auto h-9 px-5 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-medium text-sm">
                  <Settings className="w-3.5 h-3.5 mr-1.5" />Settings
                </Button>
              ) : (
                <Button onClick={handleGoogleConnect}
                  className="w-full md:w-auto h-9 px-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 font-semibold rounded-xl shadow-none text-sm">
                  <LinkIcon className="w-3.5 h-3.5 mr-1.5" />Connect Google
                </Button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Calendar Area */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden rounded-xl">
          <CardContent className="p-0">
            <div className="h-[70vh] min-h-[650px] w-full relative">
              <CalendarView key={refreshKey} />
            </div>
          </CardContent>
        </Card>

        {/* Status Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Operating Hours", value: "Configured", icon: Clock, color: "text-medical-600 dark:text-medical-400", bg: "bg-medical-50 dark:bg-medical-500/10", border: "border-medical-200 dark:border-medical-500/20" },
            { label: "Sync", value: isGoogleConnected ? "Real-time" : "Manual", icon: RefreshCcw, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-500/10", border: "border-blue-200 dark:border-blue-500/20" },
            { label: "Booking Engine", value: "Active", icon: Sparkles, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10", border: "border-emerald-200 dark:border-emerald-500/20" },
          ].map((metric, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex items-center gap-4 transition-colors">
              <div className={cn("p-2.5 rounded-xl border", metric.bg, metric.border)}>
                <metric.icon className={cn("w-5 h-5", metric.color)} />
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-0.5">{metric.label}</p>
                <p className={cn("text-base font-semibold", metric.color)}>{metric.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Modals */}
        <OperatingHoursModal isOpen={isHoursModalOpen} onClose={() => setIsHoursModalOpen(false)} onSaveSuccess={() => setRefreshKey(p => p + 1)} />
        <TimeBlockModal isOpen={isBlockModalOpen} onClose={() => setIsBlockModalOpen(false)} onSaveSuccess={() => setRefreshKey(p => p + 1)} />
      </motion.div>
    </div>
  );
}

export default function CalendarPage() {
  return (
    <Suspense fallback={<CalendarLoading />}>
      <CalendarContent />
    </Suspense>
  );
}