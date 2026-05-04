"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { toast } from 'react-toastify';
import { Gift, Copy, CheckCircle2, Users, Sparkles, AlertTriangle, CalendarDays, Share2, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { es, enUS } from 'date-fns/locale';

// ShadCN UI
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { QhSpinner } from '@/components/ui/QhSpinner';

// 🚀 Importamos el Hook de Arquitectura Limpia
import { useReferrals } from '@/hooks/useReferrals';

export default function ProviderReferralsPage() {
  const t = useTranslations('DashboardReferrals');
  const locale = useLocale();
  const dateLocale = locale === 'es' ? es : enUS;
  
  // 🚀 Usamos el Hook, el componente ya no sabe nada de Axios o Promesas
  const { data, isLoading } = useReferrals();
  const [copied, setCopied] = useState(false);

  // 💡 Si el backend aún no envía el código, puedes usar un fallback o conectarlo al Auth Context
  const userReferralCode = data?.referralCode || "MI-CODIGO"; 
  const referralLink = `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.quhealthy.org'}/signup?ref=${userReferralCode}`;

  const handleCopy = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success(t('toast_copied', { defaultValue: '¡Enlace copiado al portapapeles!' }));
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVATED": 
        return <Badge className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0"><CheckCircle2 className="w-3 h-3 mr-1" />{t('status_activated', { defaultValue: 'Completado' })}</Badge>;
      case "PENDING": 
        return <Badge className="bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-0"><AlertTriangle className="w-3 h-3 mr-1" />{t('status_pending', { defaultValue: 'Pendiente de Pago' })}</Badge>;
      default: 
        return <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-500 border-0">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <QhSpinner size="md" />
        <p className="text-slate-500 dark:text-slate-400 font-light mt-4">{t("loading", { defaultValue: 'Cargando programa de referidos...' })}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto space-y-8">
          
        {/* Header Homologado */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-50 dark:bg-purple-500/10 rounded-xl border border-purple-200 dark:border-purple-500/20">
              <Gift className="w-7 h-7 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-medium text-slate-900 dark:text-white tracking-tight">
                {t("title", { defaultValue: 'Programa de Referidos' })}
              </h1>
              <Badge className="mt-1 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border-0">
                <Sparkles className="w-2.5 h-2.5 mr-1" /> Programa VIP
              </Badge>
            </div>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-base max-w-2xl font-light leading-relaxed">
            {t('subtitle', { defaultValue: 'Invita a otros colegas a unirse a QuHealthy y recibe beneficios exclusivos o créditos en plataforma cuando activen su suscripción.' })}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Link Share Card (Ocupa 2 columnas en desktop) */}
          <Card className="lg:col-span-2 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
            <CardContent className="p-6 md:p-8 flex flex-col justify-center h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-1.5 bg-blue-50 dark:bg-blue-500/10 rounded-lg"><Share2 className="h-4 w-4 text-blue-600 dark:text-blue-400" /></div>
                <div>
                  <h2 className="text-base font-semibold text-slate-900 dark:text-white">{t('link_title', { defaultValue: 'Tu Enlace de Invitación' })}</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-light">Compártelo por WhatsApp, email o redes sociales.</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Input 
                    readOnly 
                    value={referralLink} 
                    className="h-12 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 pr-24 text-slate-600 dark:text-slate-300 font-mono text-sm"
                  />
                  <div className="absolute right-0 top-0 h-full flex items-center pr-4 pointer-events-none bg-gradient-to-l from-slate-50 dark:from-slate-950 to-transparent pl-8">
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">REF: {userReferralCode}</span>
                  </div>
                </div>
                <Button 
                  size="lg"
                  onClick={handleCopy} 
                  className={`h-12 px-8 font-semibold shadow-none transition-all rounded-xl ${
                    copied 
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 dark:border-emerald-500/30' 
                      : 'bg-medical-600 hover:bg-medical-700 text-white'
                  }`}
                >
                  {copied ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                  {copied ? t('copied', { defaultValue: 'Copiado' }) : t('copy', { defaultValue: 'Copiar Enlace' })}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Mini Stats Card */}
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
            <CardContent className="p-6 flex flex-col justify-center h-full space-y-4">
              <div className="flex justify-between items-end pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Referidos Activos</p>
                  <p className="text-3xl font-black text-slate-900 dark:text-white">{data?.activatedReferrals || 0}</p>
                </div>
                <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">En Espera (Pendientes)</p>
                  <p className="text-xl font-bold text-slate-700 dark:text-slate-300">{data?.pendingReferrals || 0}</p>
                </div>
                <div className="p-2 bg-amber-50 dark:bg-amber-500/10 rounded-lg text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Historial de Referidos (Homologado a tabla/lista limpia) */}
        <section>
          <div className="mb-4 flex items-center gap-2.5 pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg"><Users className="h-4 w-4 text-slate-600 dark:text-slate-400" /></div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">{t('history_title', { defaultValue: 'Historial de Invitados' })}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-light">Colegas que se han registrado usando tu código.</p>
            </div>
          </div>

          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
            <CardContent className="p-0">
              {!data?.history || data.history.length === 0 ? (
                <div className="p-14 text-center">
                  <div className="mx-auto max-w-sm space-y-3">
                    <div className="mx-auto w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                      <Users className="w-6 h-6 text-slate-400 dark:text-slate-600" />
                    </div>
                    <p className="text-sm font-light text-slate-500 dark:text-slate-400 leading-relaxed">
                      {t('empty_desc', { defaultValue: 'Aún no tienes referidos. ¡Comparte tu enlace para empezar a recibir beneficios!' })}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-[10px] uppercase text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="px-6 py-3 font-medium tracking-wider">Fecha de Registro</th>
                        <th className="px-6 py-3 font-medium tracking-wider">Doctor Invitado</th>
                        <th className="px-6 py-3 font-medium tracking-wider">Beneficio</th>
                        <th className="px-6 py-3 font-medium tracking-wider text-right">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {data.history.map((ref) => (
                        <tr key={ref.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-medium text-sm">
                              <CalendarDays className="w-4 h-4 text-slate-400" />
                              {format(new Date(ref.createdAt), "dd MMM yyyy", { locale: dateLocale })}
                            </div>
                            {ref.activatedAt && (
                              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 ml-6 mt-1 flex items-center font-medium">
                                <ArrowRight className="w-3 h-3 mr-1" /> Activado el {format(new Date(ref.activatedAt), "dd MMM yyyy", { locale: dateLocale })}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold text-xs border border-slate-200 dark:border-slate-700">
                                #{ref.referredId}
                              </div>
                              <span className="text-slate-900 dark:text-white font-medium">Doctor #{ref.referredId}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                              {ref.benefitType === 'PLATFORM_CREDITS' ? 'Créditos de Plataforma' : ref.benefitType}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {getStatusBadge(ref.status)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

      </motion.div>
    </div>
  );
}