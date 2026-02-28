/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  Loader2,
  Clock,
  Video,
  Calendar,
  CalendarPlus,
  MapPin,
  Search,
  Filter,
  Download,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  RefreshCw,
  Plus,
  Sparkles,
  TrendingUp,
  Star
} from 'lucide-react';
import { formatInTimeZone } from 'date-fns-tz';
import { es } from 'date-fns/locale';

// ShadCN UI
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Components
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { cn } from '@/lib/utils';

// Types
interface Appointment {
  id: number;
  status: 'pending' | 'confirmed' | 'completed' | 'canceled_by_provider' | 'canceled_by_consumer';
  startTime: string;
  endTime: string;
  provider: {
    name: string;
    specialty?: string;
    image?: string;
    rating?: number;
  };
  service: {
    name: string;
    serviceDeliveryType: 'in_person' | 'video_call';
  };
  location?: string;
  priceAtBooking?: number;
}

// Mock Data
const mockAppointments: Appointment[] = [
  {
    id: 1,
    status: 'confirmed',
    startTime: new Date(Date.now() + 86400000).toISOString(),
    endTime: new Date(Date.now() + 90000000).toISOString(),
    provider: {
      name: "Dr. Roberto Casas",
      specialty: "Dentista",
      rating: 4.8
    },
    service: { name: "Limpieza Dental", serviceDeliveryType: 'in_person' },
    location: "Av. Reforma 222, Consultorio 301",
    priceAtBooking: 800
  },
  {
    id: 2,
    status: 'confirmed',
    startTime: new Date(Date.now() + 172800000).toISOString(),
    endTime: new Date(Date.now() + 176400000).toISOString(),
    provider: {
      name: "Dra. Elena Gómez",
      specialty: "Nutrióloga",
      rating: 4.9
    },
    service: { name: "Consulta Nutricional", serviceDeliveryType: 'video_call' },
    priceAtBooking: 650
  },
  {
    id: 3,
    status: 'completed',
    startTime: new Date(Date.now() - 86400000 * 5).toISOString(),
    endTime: new Date(Date.now() - 86400000 * 5 + 3600000).toISOString(),
    provider: {
      name: "Dr. Carlos Méndez",
      specialty: "Medicina General",
      rating: 4.7
    },
    service: { name: "Consulta General", serviceDeliveryType: 'in_person' },
    location: "Calle Norte 15, Piso 2",
    priceAtBooking: 500
  },
];

type TabValue = 'upcoming' | 'past' | 'cancelled';

export default function ConsumerAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCanceling, setIsCanceling] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabValue>('upcoming');
  const [sortBy, setSortBy] = useState<'date' | 'provider'>('date');
  const router = useRouter();
  const t = useTranslations('PatientAppointments');

  // Cancel modal state
  const [cancelModalState, setCancelModalState] = useState<{
    isOpen: boolean;
    appointment: Appointment | null;
  }>({
    isOpen: false,
    appointment: null
  });

  // Fetch appointments
  const fetchAppointments = useCallback(async () => {
    try {
      await new Promise(r => setTimeout(r, 800));
      setAppointments(mockAppointments);
    } catch (error) {
      console.error(error);
      toast.error(t('toast_load_error'));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Filter and sort appointments
  useEffect(() => {
    let filtered = [...appointments];
    const now = new Date();

    if (activeTab === 'upcoming') {
      filtered = filtered.filter(a =>
        new Date(a.startTime) >= now &&
        (a.status === 'confirmed' || a.status === 'pending')
      );
    } else if (activeTab === 'past') {
      filtered = filtered.filter(a =>
        new Date(a.endTime) < now ||
        a.status === 'completed'
      );
    } else if (activeTab === 'cancelled') {
      filtered = filtered.filter(a =>
        a.status === 'canceled_by_consumer' ||
        a.status === 'canceled_by_provider'
      );
    }

    if (searchQuery) {
      filtered = filtered.filter(a =>
        a.provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.provider.specialty?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (sortBy === 'date') {
      filtered.sort((a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      );
    } else {
      filtered.sort((a, b) =>
        a.provider.name.localeCompare(b.provider.name)
      );
    }

    setFilteredAppointments(filtered);
  }, [appointments, activeTab, searchQuery, sortBy]);

  // Calculate stats
  const stats = {
    total: appointments.length,
    upcoming: appointments.filter(a =>
      new Date(a.startTime) >= new Date() &&
      (a.status === 'confirmed' || a.status === 'pending')
    ).length,
    completed: appointments.filter(a => a.status === 'completed').length,
    cancelled: appointments.filter(a =>
      a.status === 'canceled_by_consumer' ||
      a.status === 'canceled_by_provider'
    ).length
  };

  // Handle cancel
  const handleCancelAppointment = async () => {
    if (!cancelModalState.appointment) return;

    setIsCanceling(true);
    try {
      await new Promise(r => setTimeout(r, 1000));

      toast.success(t('toast_canceled'));

      setAppointments(prev => prev.map(a =>
        a.id === cancelModalState.appointment?.id
          ? { ...a, status: 'canceled_by_consumer' }
          : a
      ));

      setCancelModalState({ isOpen: false, appointment: null });
    } catch (error: any) {
      toast.error(t('toast_cancel_error'));
    } finally {
      setIsCanceling(false);
    }
  };

  // Status config
  const getStatusConfig = (status: Appointment['status']) => {
    switch (status) {
      case 'completed':
        return {
          label: t('status_completed'),
          icon: CheckCircle2,
          className: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
        };
      case 'confirmed':
        return {
          label: t('status_confirmed'),
          icon: CheckCircle2,
          className: 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20'
        };
      case 'pending':
        return {
          label: t('status_pending'),
          icon: AlertCircle,
          className: 'bg-amber-50 dark:bg-yellow-500/10 text-amber-700 dark:text-yellow-400 border-amber-200 dark:border-yellow-500/20'
        };
      case 'canceled_by_consumer':
        return {
          label: t('status_canceled'),
          icon: XCircle,
          className: 'bg-rose-50 dark:bg-red-500/10 text-rose-700 dark:text-red-400 border-rose-200 dark:border-red-500/20'
        };
      case 'canceled_by_provider':
        return {
          label: t('status_canceled_provider'),
          icon: XCircle,
          className: 'bg-rose-50 dark:bg-red-500/10 text-rose-700 dark:text-red-400 border-rose-200 dark:border-red-500/20'
        };
      default:
        return {
          label: t('status_unknown'),
          icon: AlertCircle,
          className: 'bg-slate-50 dark:bg-slate-500/10 text-slate-500 dark:text-slate-400'
        };
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh] space-y-4 bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-12 h-12 animate-spin text-medical-500" />
        <p className="text-slate-500 dark:text-slate-400">{t('loading')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans selection:bg-medical-500/30">
      <div className="space-y-6 max-w-6xl mx-auto px-4 py-8">

        {/* Header with Stats */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-medical-50 dark:bg-medical-500/10 rounded-xl border border-medical-100 dark:border-medical-500/20 shadow-sm">
                <Calendar className="w-8 h-8 text-medical-600 dark:text-medical-400" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {t('title')}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                  {t('subtitle')}
                </p>
              </div>
            </div>
            <Button
              onClick={() => router.push('/discover')}
              className="bg-gradient-to-r from-medical-600 to-medical-500 hover:from-medical-700 hover:to-medical-600 shadow-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t('btn_new')}
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{t('stat_total')}</p>
                    <p className="text-2xl font-bold text-medical-600 dark:text-medical-400">{stats.total}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-medical-300 dark:text-medical-600 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{t('stat_upcoming')}</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.upcoming}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-blue-300 dark:text-blue-600 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{t('stat_completed')}</p>
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.completed}</p>
                  </div>
                  <CheckCircle2 className="w-8 h-8 text-emerald-300 dark:text-emerald-600 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{t('stat_cancelled')}</p>
                    <p className="text-2xl font-bold text-rose-600 dark:text-red-400">{stats.cancelled}</p>
                  </div>
                  <XCircle className="w-8 h-8 text-rose-300 dark:text-red-600 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Filters Bar */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">

              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)} className="flex-1">
                <TabsList className="grid w-full grid-cols-3 bg-slate-100 dark:bg-slate-800">
                  <TabsTrigger value="upcoming" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                    {t('tab_upcoming')}
                  </TabsTrigger>
                  <TabsTrigger value="past" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
                    {t('tab_past')}
                  </TabsTrigger>
                  <TabsTrigger value="cancelled" className="data-[state=active]:bg-rose-500 data-[state=active]:text-white">
                    {t('tab_cancelled')}
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Search */}
              <div className="relative flex-1 md:max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('search_placeholder')}
                  className="pl-10 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                />
              </div>

              {/* Sort */}
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as 'date' | 'provider')}>
                <SelectTrigger className="w-full md:w-40 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">{t('sort_date')}</SelectItem>
                  <SelectItem value="provider">{t('sort_provider')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Appointments List */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredAppointments.length > 0 ? (
              filteredAppointments.map((appt, index) => {
                const statusConfig = getStatusConfig(appt.status);
                const StatusIcon = statusConfig.icon;
                const isPast = new Date(appt.endTime) < new Date();
                const isVideo = appt.service.serviceDeliveryType === 'video_call';
                const canJoinVideo = isVideo && !isPast && (appt.status === 'confirmed' || appt.status === 'pending');

                return (
                  <motion.div
                    key={appt.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                    layout
                  >
                    <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all overflow-hidden group">
                      <CardContent className="p-0">
                        <div className="flex flex-col lg:flex-row">

                          {/* Date Column */}
                          <div className="bg-slate-50 dark:bg-slate-800/50 p-6 flex flex-col justify-center items-center lg:items-start min-w-[180px] border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-800 gap-3">
                            <div className="text-center lg:text-left">
                              <p className="text-sm font-bold text-medical-600 dark:text-medical-400 uppercase tracking-wide">
                                {formatInTimeZone(new Date(appt.startTime), 'UTC', "MMM", { locale: es })}
                              </p>
                              <p className="text-4xl font-bold text-slate-900 dark:text-white">
                                {formatInTimeZone(new Date(appt.startTime), 'UTC', "d", { locale: es })}
                              </p>
                              <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold">
                                {formatInTimeZone(new Date(appt.startTime), 'UTC', "yyyy", { locale: es })}
                              </p>
                            </div>
                            <Badge variant="outline" className={cn("border", statusConfig.className)}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {statusConfig.label}
                            </Badge>
                            {isVideo && (
                              <Badge className="bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20">
                                <Video className="w-3 h-3 mr-1" />
                                {t('badge_video')}
                              </Badge>
                            )}
                          </div>

                          {/* Details Column */}
                          <div className="p-6 flex-1 space-y-4">
                            <div>
                              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-medical-600 dark:group-hover:text-medical-400 transition-colors">
                                {appt.service.name}
                              </h3>
                              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
                                <Clock className="w-4 h-4" />
                                <span className="font-semibold">
                                  {formatInTimeZone(new Date(appt.startTime), 'UTC', "h:mm a", { locale: es })}
                                  {' - '}
                                  {formatInTimeZone(new Date(appt.endTime), 'UTC', "h:mm a", { locale: es })}
                                </span>
                              </div>
                            </div>

                            {/* Provider Info */}
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10 border-2 border-medical-200 dark:border-medical-500/20">
                                <AvatarImage src={appt.provider.image} />
                                <AvatarFallback className="bg-medical-50 dark:bg-medical-500/10 text-medical-700 dark:text-medical-300 font-bold">
                                  {appt.provider.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <p className="font-bold text-slate-900 dark:text-white">{appt.provider.name}</p>
                                <div className="flex items-center gap-2">
                                  <p className="text-slate-500 dark:text-slate-400 text-xs">
                                    {appt.provider.specialty || t('specialist_fallback')}
                                  </p>
                                  {appt.provider.rating && (
                                    <div className="flex items-center gap-1">
                                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{appt.provider.rating}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Location or Price */}
                            <div className="flex items-center justify-between">
                              {appt.location && !isVideo && (
                                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                  <MapPin className="w-3.5 h-3.5" />
                                  <span>{appt.location}</span>
                                </div>
                              )}
                              {appt.priceAtBooking && (
                                <div className="text-right">
                                  <p className="text-xs text-slate-500 dark:text-slate-400">{t('label_total')}</p>
                                  <p className="text-lg font-bold text-medical-600 dark:text-medical-400">
                                    ${appt.priceAtBooking}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Actions Column */}
                          <div className="p-6 flex flex-col items-stretch justify-center gap-3 border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 min-w-[200px]">

                            {canJoinVideo && (
                              <Button
                                onClick={() => router.push(`/video-call/${appt.id}`)}
                                className="w-full bg-gradient-to-r from-blue-600 to-medical-600 hover:from-blue-700 hover:to-medical-700 shadow-lg group"
                              >
                                <Video className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                                {t('btn_join_video')}
                              </Button>
                            )}

                            <Button
                              variant="outline"
                              onClick={() => router.push(`/appointments/${appt.id}`)}
                              className="w-full border-slate-200 dark:border-slate-700"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              {t('btn_view_details')}
                            </Button>

                            {(appt.status === 'confirmed' || appt.status === 'pending') && !isPast && (
                              <Button
                                variant="outline"
                                onClick={() => toast.success(t('toast_calendar_added') || "Added to calendar.ics")}
                                className="w-full border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                              >
                                <CalendarPlus className="w-4 h-4 mr-2" />
                                {t('btn_add_calendar') || "Add to Calendar"}
                              </Button>
                            )}

                            {(appt.status === 'confirmed' || appt.status === 'pending') && !isPast && (
                              <Button
                                variant="outline"
                                onClick={() => setCancelModalState({ isOpen: true, appointment: appt })}
                                className="w-full border-rose-200 dark:border-red-900 text-rose-600 dark:text-red-400 hover:bg-rose-50 dark:hover:bg-red-900/20"
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                {t('btn_cancel')}
                              </Button>
                            )}

                            {isPast && (
                              <Button
                                variant="outline"
                                onClick={() => router.push(`/discover?provider=${encodeURIComponent(appt.provider.name)}`)}
                                className="w-full border-medical-200 dark:border-medical-700 text-medical-600 dark:text-medical-400"
                              >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                {t('btn_rebook')}
                              </Button>
                            )}

                            {appt.status === 'completed' && (
                              <Button
                                variant="ghost"
                                onClick={() => toast.info(t('toast_receipt'))}
                                className="w-full text-slate-600 dark:text-slate-400"
                              >
                                <Download className="w-4 h-4 mr-2" />
                                {t('btn_receipt')}
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 shadow-sm"
              >
                <Calendar className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  {searchQuery
                    ? t('empty_search')
                    : activeTab === 'upcoming'
                      ? t('empty_upcoming')
                      : activeTab === 'past'
                        ? t('empty_past')
                        : t('empty_cancelled')}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6">
                  {searchQuery
                    ? t('empty_search_hint')
                    : t('empty_hint')}
                </p>
                <Button
                  onClick={() => router.push('/discover')}
                  className="bg-gradient-to-r from-medical-600 to-medical-500 hover:from-medical-700 hover:to-medical-600 shadow-lg"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t('btn_find')}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Cancel Confirmation Modal */}
        <ConfirmationModal
          isOpen={cancelModalState.isOpen}
          onClose={() => setCancelModalState({ isOpen: false, appointment: null })}
          onConfirm={handleCancelAppointment}
          title={t('modal_title')}
          message={
            cancelModalState.appointment
              ? t('modal_message', {
                service: cancelModalState.appointment.service.name,
                provider: cancelModalState.appointment.provider.name
              })
              : ''
          }
          isLoading={isCanceling}
          variant="destructive"
        />
      </div>
    </div>
  );
}