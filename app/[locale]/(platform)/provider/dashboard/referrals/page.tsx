"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { toast } from 'react-toastify';
import { 
  Gift, 
  Copy, 
  CheckCircle2, 
  Users, 
  Sparkles, 
  AlertTriangle, 
  CalendarDays, 
  Share2, 
  ArrowRight, 
  MessageCircle, 
  Facebook, 
  Twitter, 
  Send 
} from 'lucide-react';
import { format } from 'date-fns';
import { es, enUS } from 'date-fns/locale';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QhSpinner } from '@/components/ui/QhSpinner';
import { cn } from '@/lib/utils';

// Hooks y Componentes
import { useReferrals } from '@/hooks/useReferrals';
import { RecommendationsManager } from '@/components/dashboard/referrals/RecommendationsManager'; 

export default function ProviderReferralsPage() {
  const t = useTranslations('DashboardReferrals');
  const locale = useLocale();
  const dateLocale = locale === 'es' ? es : enUS;
  
  const { data, isLoading } = useReferrals();
  const [copied, setCopied] = useState(false);

  const userReferralCode = data?.referralCode || "MI-CODIGO"; 
  const referralLink = `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.quhealthy.org'}/${locale}/provider/register?ref=${userReferralCode}`;

  const handleCopy = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success(t('toast_copied', { defaultValue: 'Enlace copiado al portapapeles' }), { theme: "colored" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: t('share_title', { defaultValue: 'QuHealthy Network' }),
          text: t('share_text', { defaultValue: 'Accede a la red médica QuHealthy mediante mi enlace de referenciación:' }),
          url: referralLink,
        });
      } catch (error) {
        // Ignorar cancelación del diálogo de compartir
      }
    } else {
      handleCopy();
    }
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(`Accede a la red médica QuHealthy mediante mi enlace de referenciación: ${referralLink}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleFacebookShare = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`, '_blank');
  };

  const handleTwitterShare = () => {
    const text = encodeURIComponent(`Accede a la red médica QuHealthy mediante mi enlace de referenciación!`);
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(referralLink)}&text=${text}`, '_blank');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVATED": 
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40 shadow-sm ml-auto">
            <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} />
            {t('status_activated', { defaultValue: 'Completado' })}
          </span>
        );
      case "PENDING": 
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg border border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/40 shadow-sm ml-auto">
            <AlertTriangle className="w-3.5 h-3.5" strokeWidth={2} />
            {t('status_pending', { defaultValue: 'Pendiente' })}
          </span>
        );
      default: 
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg border border-gray-200 bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 shadow-sm ml-auto">
            {status}
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 bg-gray-50/50 dark:bg-[#050505]">
        <QhSpinner size="lg" className="text-emerald-600 dark:text-emerald-400" />
        <p className="text-sm font-semibold text-gray-500 animate-pulse">
          {t("loading", { defaultValue: 'Sincronizando programa de referidos...' })}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] pt-8 px-4 md:px-10 pb-16 transition-colors duration-500 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 flex items-center justify-center shrink-0 shadow-sm">
              <Gift className="w-6 h-6 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1.5">
                Afiliación y Crecimiento 
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" strokeWidth={2}/>
              </p>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white leading-none">
                {t("title", { defaultValue: 'Sistema de Referidos' })}
              </h1>
            </div>
          </div>
        </div>

        {/* --- CONTENEDOR PRINCIPAL TABS --- */}
        <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 flex flex-col rounded-3xl shadow-sm overflow-hidden min-w-0">
          <Tabs defaultValue="affiliates" className="w-full flex flex-col rounded-none">
            
            {/* Tabs List */}
            <TabsList className="flex items-center bg-gray-50 dark:bg-[#050505] p-2 gap-2 border-b border-gray-100 dark:border-gray-800 shrink-0 h-auto rounded-none w-full justify-start">
              <TabsTrigger 
                value="affiliates" 
                className="h-10 px-5 rounded-xl border border-transparent data-[state=active]:border-gray-200 dark:data-[state=active]:border-gray-800 data-[state=active]:bg-white dark:data-[state=active]:bg-[#0a0a0a] data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-sm bg-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-xs font-bold transition-all flex items-center justify-center gap-2"
              >
                Invitación Red Médica
              </TabsTrigger>
              <TabsTrigger 
                value="recommendations" 
                className="h-10 px-5 rounded-xl border border-transparent data-[state=active]:border-gray-200 dark:data-[state=active]:border-gray-800 data-[state=active]:bg-white dark:data-[state=active]:bg-[#0a0a0a] data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-sm bg-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-xs font-bold transition-all flex items-center justify-center gap-2"
              >
                Códigos de Comisión
              </TabsTrigger>
            </TabsList>

            {/* TAB: AFILIADOS */}
            <TabsContent value="affiliates" className="m-0 p-0 border-none outline-none flex flex-col">
              
              <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-gray-100 dark:divide-gray-800">
                
                {/* Enlace de Invitación */}
                <div className="lg:col-span-2 flex flex-col">
                  <div className="p-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 flex items-center justify-center shrink-0 shadow-sm">
                      <Share2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                    </div>
                    <div>
                      <h2 className="text-xs md:text-sm font-bold text-gray-900 dark:text-white leading-tight">
                        {t('link_title', { defaultValue: 'URL de Referenciación' })}
                      </h2>
                      <p className="text-[11px] font-semibold text-gray-500">
                        Comparta este enlace para obtener créditos en la plataforma.
                      </p>
                    </div>
                  </div>

                  <div className="p-6 flex flex-col gap-6">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input 
                        readOnly 
                        value={referralLink} 
                        className="flex-1 h-11 px-4 bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white rounded-xl shadow-sm focus:outline-none font-mono truncate"
                      />
                      <button 
                        type="button"
                        onClick={handleCopy} 
                        className={cn(
                          "h-11 px-6 rounded-xl text-xs font-bold transition-colors shadow-sm flex items-center justify-center gap-2 shrink-0",
                          copied 
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800" 
                            : "bg-emerald-600 text-white hover:bg-emerald-700"
                        )}
                      >
                        {copied ? <CheckCircle2 className="w-4 h-4" strokeWidth={2} /> : <Copy className="w-4 h-4" strokeWidth={2} />}
                        <span>{copied ? t('copied', { defaultValue: 'Enlace Copiado' }) : t('copy', { defaultValue: 'Copiar Enlace' })}</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      <span className="text-xs font-semibold text-gray-500">Difusión rápida:</span>
                      <div className="flex flex-wrap gap-2">
                        <button 
                          type="button"
                          onClick={handleWhatsAppShare} 
                          className="h-9 px-4 flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40 hover:bg-emerald-100 transition-colors text-xs font-bold shadow-sm"
                        >
                          <MessageCircle className="w-4 h-4" strokeWidth={2} />
                          <span>WhatsApp</span>
                        </button>
                        <button 
                          type="button"
                          onClick={handleFacebookShare} 
                          className="h-9 px-4 flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/40 hover:bg-blue-100 transition-colors text-xs font-bold shadow-sm"
                        >
                          <Facebook className="w-4 h-4" strokeWidth={2} />
                          <span>Facebook</span>
                        </button>
                        <button 
                          type="button"
                          onClick={handleTwitterShare} 
                          className="h-9 px-4 flex items-center justify-center gap-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#111] transition-colors text-xs font-bold shadow-sm"
                        >
                          <Twitter className="w-4 h-4" strokeWidth={2} />
                          <span>X (Twitter)</span>
                        </button>
                        <button 
                          type="button"
                          onClick={handleShare} 
                          className="h-9 px-4 flex items-center justify-center gap-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#111] transition-colors text-xs font-bold shadow-sm sm:hidden"
                        >
                          <Send className="w-4 h-4" strokeWidth={2} />
                          <span>Compartir</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Métricas KPIs */}
                <div className="flex flex-col bg-gray-50/50 dark:bg-[#050505] divide-y divide-gray-100 dark:divide-gray-800">
                  <div className="p-6 flex flex-col justify-center flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-xs font-semibold text-gray-500">Afiliaciones Completadas</p>
                      <div className="w-9 h-9 rounded-xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
                        <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{data?.activatedReferrals || 0}</p>
                  </div>

                  <div className="p-6 flex flex-col justify-center flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-xs font-semibold text-gray-500">Registros Pendientes</p>
                      <div className="w-9 h-9 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-900/40 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-sm">
                        <AlertTriangle className="w-4 h-4" strokeWidth={2} />
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-700 dark:text-gray-300 tracking-tight">{data?.pendingReferrals || 0}</p>
                  </div>
                </div>

              </div>

              {/* Historial de Invitaciones */}
              <div className="flex flex-col border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]">
                <div className="p-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 flex items-center justify-center shrink-0 shadow-sm">
                    <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                  </div>
                  <div>
                    <h2 className="text-xs md:text-sm font-bold text-gray-900 dark:text-white leading-tight">
                      {t('history_title', { defaultValue: 'Registro de Invitaciones' })}
                    </h2>
                    <p className="text-[11px] font-semibold text-gray-500">
                      Auditoría de colegas vinculados a la plataforma.
                    </p>
                  </div>
                </div>

                <div className="w-full">
                  {!data?.history || data.history.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center p-12">
                      <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-gray-800 flex items-center justify-center mb-4 shadow-sm">
                        <Users className="w-6 h-6 text-gray-400" strokeWidth={2} />
                      </div>
                      <p className="text-base font-bold text-gray-900 dark:text-white mb-1">
                        Sin Registros
                      </p>
                      <p className="text-xs font-medium text-gray-500 max-w-xs leading-relaxed">
                        {t('empty_desc', { defaultValue: 'Comparta su enlace para iniciar la vinculación de colegas.' })}
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto custom-scrollbar">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50/50 dark:bg-[#050505] border-b border-gray-100 dark:border-gray-800">
                          <tr>
                            <th className="px-6 py-3.5 text-xs font-bold text-gray-500 whitespace-nowrap">Fecha Registro</th>
                            <th className="px-6 py-3.5 text-xs font-bold text-gray-500 whitespace-nowrap">ID Sistema</th>
                            <th className="px-6 py-3.5 text-xs font-bold text-gray-500 whitespace-nowrap">Beneficio Aplicado</th>
                            <th className="px-6 py-3.5 text-xs font-bold text-gray-500 text-right whitespace-nowrap">Estado</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                          {data.history.map((ref) => (
                            <tr key={ref.id} className="hover:bg-gray-50 dark:hover:bg-[#111] transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-2 text-xs font-bold text-gray-900 dark:text-white mb-1">
                                  <CalendarDays className="w-3.5 h-3.5 text-gray-400" strokeWidth={2} />
                                  {format(new Date(ref.createdAt), "dd MMM yyyy", { locale: dateLocale })}
                                </div>
                                {ref.activatedAt && (
                                  <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                    <ArrowRight className="w-3 h-3" strokeWidth={2} /> 
                                    <span>Activado: {format(new Date(ref.activatedAt), "dd MMM yyyy", { locale: dateLocale })}</span>
                                  </div>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-[#111] flex items-center justify-center border border-gray-200 dark:border-gray-700">
                                    <span className="text-[11px] font-mono font-bold text-gray-700 dark:text-gray-300">#{ref.referredId}</span>
                                  </div>
                                  <span className="text-xs font-semibold text-gray-900 dark:text-white">Colega Vinculado</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                                  {ref.benefitType === 'PLATFORM_CREDITS' ? 'Créditos Plataforma' : ref.benefitType}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right whitespace-nowrap">
                                {getStatusBadge(ref.status)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

            </TabsContent>

            {/* TAB: RECOMENDACIONES MANAGER */}
            <TabsContent value="recommendations" className="m-0 p-0 border-none outline-none">
              <RecommendationsManager />
            </TabsContent>

          </Tabs>
        </div>

      </div>
    </div>
  );
}