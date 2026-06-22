"use client"
/* eslint-disable react-doctor/button-has-type */;

import React, { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { toast } from 'react-toastify';
import { Gift, Copy, CheckCircle2, Users, Sparkles, AlertTriangle, CalendarDays, Share2, ArrowRight, MessageCircle, Facebook, Twitter, Send } from 'lucide-react';
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
  const referralLink = `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.quhealthy.org'}/signup?ref=${userReferralCode}`;

  const handleCopy = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success(t('toast_copied', { defaultValue: 'ENLACE COPIADO AL PORTAPAPELES' }), { theme: "colored" });
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
        // Ignorar
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
        return <span className="border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 w-fit ml-auto"><CheckCircle2 className="w-3 h-3" strokeWidth={1.5} />{t('status_activated', { defaultValue: 'COMPLETADO' })}</span>;
      case "PENDING": 
        return <span className="border border-amber-500/30 bg-amber-50 dark:bg-amber-900/10 text-amber-700 dark:text-amber-400 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 w-fit ml-auto"><AlertTriangle className="w-3 h-3" strokeWidth={1.5} />{t('status_pending', { defaultValue: 'PENDIENTE' })}</span>;
      default: 
        return <span className="border border-gray-500/30 bg-gray-50 dark:bg-gray-900/10 text-gray-600 dark:text-gray-400 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 w-fit ml-auto">{status}</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-gray-50 dark:bg-[#050505]">
        <QhSpinner size="lg" className="text-black dark:text-white" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-6 animate-pulse">
          {t("loading", { defaultValue: 'SINCRONIZANDO PROGRAMA DE REFERIDOS...' })}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#050505] p-4 md:p-8 font-sans selection:bg-gray-200 dark:selection:bg-white/20 transition-colors">
      <div className="max-w-7xl mx-auto space-y-8">
          
        {/* --- HEADER ARQUITECTÓNICO --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-black/20 dark:border-white/20">
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] flex items-center justify-center shrink-0">
              <Gift className="w-6 h-6 text-black dark:text-white" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1 flex items-center gap-2">
                Afiliación y Crecimiento <Sparkles className="w-3 h-3 text-black dark:text-white" strokeWidth={1.5}/>
              </p>
              <h1 className="text-2xl md:text-3xl font-semibold uppercase tracking-tight text-black dark:text-white mb-2 leading-none">
                {t("title", { defaultValue: 'SISTEMA DE REFERIDOS' })}
              </h1>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 max-w-xl leading-relaxed">
                INVITE COLEGAS A LA RED Y RECOMIENDE SERVICIOS PARA OBTENER BENEFICIOS ECONÓMICOS Y COMISIONES.
              </p>
            </div>
          </div>
        </div>

        {/* --- SISTEMA DE PESTAÑAS (TABS) --- */}
        <Tabs defaultValue="affiliates" className="w-full flex flex-col border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] rounded-none transition-colors">
          
          <TabsList className="flex flex-row w-full bg-gray-50 dark:bg-[#050505] border-b border-black/20 dark:border-white/20 p-0 h-auto rounded-none justify-start shrink-0">
            <TabsTrigger 
              value="affiliates" 
              className="flex-1 sm:flex-none sm:w-64 rounded-none border-0 border-r border-black/20 dark:border-white/20 data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black bg-transparent text-gray-500 h-14 text-[9px] font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
            >
              INVITACIÓN RED MÉDICA
            </TabsTrigger>
            <TabsTrigger 
              value="recommendations" 
              className="flex-1 sm:flex-none sm:w-64 rounded-none border-0 border-r sm:border-r-0 border-black/20 dark:border-white/20 data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black bg-transparent text-gray-500 h-14 text-[9px] font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
            >
              CÓDIGOS DE COMISIÓN
            </TabsTrigger>
          </TabsList>

          <TabsContent value="affiliates" className="m-0 p-0 border-none outline-none flex flex-col">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
              
              {/* --- ENLACE DE INVITACIÓN --- */}
              <div className="lg:col-span-2 border-b lg:border-b-0 lg:border-r border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0a] flex flex-col">
                <div className="p-6 md:p-8 flex items-center gap-4 border-b border-black/10 dark:border-white/10 bg-gray-50 dark:bg-[#050505]">
                  <div className="w-10 h-10 border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] flex items-center justify-center shrink-0">
                    <Share2 className="w-4 h-4 text-black dark:text-white" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold uppercase tracking-tight text-black dark:text-white leading-none mb-1">
                      {t('link_title', { defaultValue: 'URL DE REFERENCIACIÓN' })}
                    </h2>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500">
                      COMPARTA ESTE ENLACE OBTENER CRÉDITOS EN PLATAFORMA.
                    </p>
                  </div>
                </div>

                <div className="p-6 md:p-8 flex flex-col gap-6">
                  <div className="flex flex-col sm:flex-row gap-0 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505]">
                    <div className="relative flex-1">
                      <input 
                        readOnly 
                        value={referralLink} 
                        className="w-full h-14 px-4 bg-transparent border-0 text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest focus:outline-none focus:ring-0 truncate"
                      />
                    </div>
                    <button 
                      onClick={handleCopy} 
                      className={cn(
                        "h-14 px-8 border-t sm:border-t-0 sm:border-l border-black/20 dark:border-white/20 text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 shrink-0",
                        copied 
                          ? "bg-white dark:bg-[#0a0a0a] text-black dark:text-white" 
                          : "bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
                      )}
                    >
                      {copied ? <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={1.5} /> : <Copy className="w-3.5 h-3.5" strokeWidth={1.5} />}
                      {copied ? t('copied', { defaultValue: 'ENLACE COPIADO' }) : t('copy', { defaultValue: 'COPIAR ENLACE' })}
                    </button>
                  </div>

                  <div className="flex flex-col gap-2">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500">DIFUSIÓN RÁPIDA:</span>
                    <div className="flex flex-wrap gap-2">
                      <button onClick={handleWhatsAppShare} className="h-10 px-4 flex items-center justify-center gap-2 border border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/10 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-600 transition-colors text-[9px] font-bold uppercase tracking-widest rounded-none">
                        <MessageCircle className="w-3.5 h-3.5" strokeWidth={1.5} /> WHATSAPP
                      </button>
                      <button onClick={handleFacebookShare} className="h-10 px-4 flex items-center justify-center gap-2 border border-blue-500/30 bg-blue-50 text-blue-700 dark:bg-blue-900/10 dark:text-blue-400 hover:bg-blue-600 hover:text-white transition-colors text-[9px] font-bold uppercase tracking-widest rounded-none">
                        <Facebook className="w-3.5 h-3.5" strokeWidth={1.5} /> FACEBOOK
                      </button>
                      <button onClick={handleTwitterShare} className="h-10 px-4 flex items-center justify-center gap-2 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors text-[9px] font-bold uppercase tracking-widest rounded-none">
                        <Twitter className="w-3.5 h-3.5" strokeWidth={1.5} /> X (TWITTER)
                      </button>
                      <button onClick={handleShare} className="h-10 px-4 flex items-center justify-center gap-2 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors text-[9px] font-bold uppercase tracking-widest rounded-none sm:hidden">
                        <Send className="w-3.5 h-3.5" strokeWidth={1.5} /> COMPARTIR
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* --- KPIS (METRICAS) --- */}
              <div className="flex flex-col bg-gray-50 dark:bg-[#050505]">
                <div className="p-6 md:p-8 flex flex-col justify-center border-b border-black/10 dark:border-white/10 flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500">AFILIACIONES COMPLETADAS</p>
                    <div className="w-8 h-8 border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-900/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" strokeWidth={1.5} />
                    </div>
                  </div>
                  <p className="text-3xl font-semibold tracking-tight text-black dark:text-white">{data?.activatedReferrals || 0}</p>
                </div>
                <div className="p-6 md:p-8 flex flex-col justify-center flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500">REGISTROS PENDIENTES</p>
                    <div className="w-8 h-8 border border-amber-500/30 bg-amber-50 dark:bg-amber-900/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
                      <AlertTriangle className="w-4 h-4" strokeWidth={1.5} />
                    </div>
                  </div>
                  <p className="text-xl font-semibold tracking-tight text-gray-700 dark:text-gray-300">{data?.pendingReferrals || 0}</p>
                </div>
              </div>
            </div>

            {/* --- TABLA DE HISTORIAL --- */}
            <div className="flex flex-col border-t border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0a]">
              <div className="p-6 md:p-8 border-b border-black/10 dark:border-white/10 bg-gray-50 dark:bg-[#050505] flex items-center gap-4">
                <div className="w-10 h-10 border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4 text-black dark:text-white" strokeWidth={1.5} />
                </div>
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-tight text-black dark:text-white leading-none mb-1">
                    {t('history_title', { defaultValue: 'REGISTRO DE INVITACIONES' })}
                  </h2>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500">
                    AUDITORÍA DE COLEGAS VINCULADOS A LA PLATAFORMA.
                  </p>
                </div>
              </div>

              <div className="w-full">
                {!data?.history || data.history.length === 0 ? (
                  <div className="p-24 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] flex items-center justify-center mb-6">
                      <Users className="w-6 h-6 text-gray-400" strokeWidth={1.5} />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 max-w-xs leading-relaxed">
                      {t('empty_desc', { defaultValue: 'CERO REGISTROS EN LA BASE DE DATOS. COMPARTA SU ENLACE PARA INICIAR LA AUDITORÍA.' })}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 dark:bg-[#050505] border-b border-black/10 dark:border-white/10">
                        <tr>
                          <th className="px-6 py-4 text-[9px] font-bold uppercase tracking-widest text-gray-500 whitespace-nowrap">FECHA REGISTRO</th>
                          <th className="px-6 py-4 text-[9px] font-bold uppercase tracking-widest text-gray-500 whitespace-nowrap">ID SISTEMA</th>
                          <th className="px-6 py-4 text-[9px] font-bold uppercase tracking-widest text-gray-500 whitespace-nowrap">BENEFICIO APLICADO</th>
                          <th className="px-6 py-4 text-[9px] font-bold uppercase tracking-widest text-gray-500 text-right whitespace-nowrap">ESTADO</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/10 dark:divide-white/10">
                        {data.history.map((ref) => (
                          <tr key={ref.id} className="hover:bg-gray-50 dark:hover:bg-[#111] transition-colors">
                            <td className="px-6 py-5 whitespace-nowrap">
                              <div className="flex items-center gap-2 text-xs font-semibold text-black dark:text-white uppercase tracking-widest mb-1.5">
                                <CalendarDays className="w-3.5 h-3.5 text-gray-400" strokeWidth={1.5} />
                                {format(new Date(ref.createdAt), "dd MMM yyyy", { locale: dateLocale })}
                              </div>
                              {ref.activatedAt && (
                                <div className="text-[9px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 flex items-center">
                                  <ArrowRight className="w-3 h-3 mr-1" strokeWidth={1.5} /> ACTIVADO: {format(new Date(ref.activatedAt), "dd MMM yyyy", { locale: dateLocale })}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-5 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] flex items-center justify-center">
                                  <span className="text-[9px] font-bold text-black dark:text-white">#{ref.referredId}</span>
                                </div>
                                <span className="text-xs font-semibold uppercase tracking-widest text-black dark:text-white">COLEGA VINCULADO</span>
                              </div>
                            </td>
                            <td className="px-6 py-5 whitespace-nowrap">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600 dark:text-gray-400">
                                {ref.benefitType === 'PLATFORM_CREDITS' ? 'CRÉDITOS PLATAFORMA' : ref.benefitType}
                              </span>
                            </td>
                            <td className="px-6 py-5 text-right whitespace-nowrap">
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

          {/* --- TABLA DE RECOMENDACIONES (MANAGER) --- */}
          <TabsContent value="recommendations" className="m-0 p-0 border-none outline-none">
            <RecommendationsManager />
          </TabsContent>

        </Tabs>

      </div>
    </div>
  );
}