"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useState, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "react-toastify";
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
  Send,
} from "lucide-react";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Hooks y Componentes
import { useReferrals } from "@/hooks/useReferrals";
import { RecommendationsManager } from "@/components/dashboard/referrals/RecommendationsManager";

export default function ProviderReferralsPage() {
  const t = useTranslations("DashboardReferrals");
  const locale = useLocale();
  const dateLocale = locale === "es" ? es : enUS;

  const { data, isLoading } = useReferrals();
  const [copied, setCopied] = useState(false);

  const userReferralCode = data?.referralCode || "MI-CODIGO";
  const referralLink = `${
    process.env.NEXT_PUBLIC_APP_URL || "https://www.quhealthy.org"
  }/${locale}/provider/register?ref=${userReferralCode}`;

  const handleCopy = useCallback(() => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success(t("toast_copied"), { theme: "colored" });
    setTimeout(() => setCopied(false), 2000);
  }, [referralLink, t]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: t("share_title"),
          text: t("share_text"),
          url: referralLink,
        });
      } catch (error) {
        // Ignorar cancelación del diálogo nativo
      }
    } else {
      handleCopy();
    }
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `${t("share_text")} ${referralLink}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const handleFacebookShare = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        referralLink
      )}`,
      "_blank"
    );
  };

  const handleTwitterShare = () => {
    const text = encodeURIComponent(t("share_text"));
    window.open(
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(
        referralLink
      )}&text=${text}`,
      "_blank"
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVATED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-bold rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40 shadow-sm ml-auto">
            <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} />
            <span>{t("status_activated")}</span>
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-bold rounded-full border border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/40 shadow-sm ml-auto">
            <AlertTriangle className="w-3.5 h-3.5" strokeWidth={2} />
            <span>{t("status_pending")}</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-bold rounded-full border border-gray-200 bg-gray-50 text-gray-700 dark:bg-gray-800/60 dark:text-gray-300 dark:border-gray-800 shadow-sm ml-auto">
            {status}
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 bg-gray-50/50 dark:bg-[#050505] transition-colors duration-500">
        <QhSpinner size="lg" />
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 animate-pulse">
          {t("loading")}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] font-sans text-gray-900 dark:text-white selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500 pt-8 px-6 md:px-10 pb-24">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* ── HEADER PRINCIPAL ────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-sm">
              <Gift className="w-7 h-7" strokeWidth={2} />
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  {t("title")}
                </span>
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-1">
                {t("title")}
              </h1>
              <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl">
                {t("subtitle")}
              </p>
            </div>
          </div>
        </div>

        {/* ── CONTENEDOR PRINCIPAL Y PESTAÑAS ──────────────────────────────── */}
        <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 flex flex-col rounded-3xl shadow-sm overflow-hidden min-w-0">
          <Tabs defaultValue="affiliates" className="w-full flex flex-col rounded-none">
            
            {/* Tabs List Header */}
            <TabsList className="flex items-center bg-gray-50/50 dark:bg-[#050505] p-2 gap-2 border-b border-gray-100 dark:border-gray-800 shrink-0 h-auto rounded-none w-full justify-start overflow-x-auto custom-scrollbar">
              <TabsTrigger
                value="affiliates"
                className="h-10 px-5 rounded-xl border border-transparent data-[state=active]:border-gray-200 dark:data-[state=active]:border-gray-800 data-[state=active]:bg-white dark:data-[state=active]:bg-[#0a0a0a] data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-sm bg-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 text-xs font-bold transition-all flex items-center justify-center gap-2 shrink-0"
              >
                <Users className="w-4 h-4 shrink-0" strokeWidth={2} />
                <span>{t("tabs.affiliates")}</span>
              </TabsTrigger>

              <TabsTrigger
                value="recommendations"
                className="h-10 px-5 rounded-xl border border-transparent data-[state=active]:border-gray-200 dark:data-[state=active]:border-gray-800 data-[state=active]:bg-white dark:data-[state=active]:bg-[#0a0a0a] data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-sm bg-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 text-xs font-bold transition-all flex items-center justify-center gap-2 shrink-0"
              >
                <Sparkles className="w-4 h-4 shrink-0" strokeWidth={2} />
                <span>{t("tabs.recommendations")}</span>
              </TabsTrigger>
            </TabsList>

            {/* ── TAB 1: AFILIADOS E INVITACIONES ───────────────────────────── */}
            <TabsContent
              value="affiliates"
              className="m-0 p-0 border-none outline-none focus-visible:ring-0 flex flex-col"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-gray-100 dark:divide-gray-800">
                
                {/* Enlace de Invitación */}
                <div className="lg:col-span-2 flex flex-col">
                  <div className="p-6 md:p-8 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-sm">
                      <Share2 className="w-5 h-5" strokeWidth={2} />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                        {t("link_title")}
                      </h2>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">
                        {t("link_subtitle")}
                      </p>
                    </div>
                  </div>

                  <div className="p-6 md:p-8 flex flex-col gap-6 bg-white dark:bg-[#0a0a0a]">
                    <div className="flex flex-col sm:flex-row gap-2.5">
                      <input
                        type="text"
                        readOnly
                        value={referralLink}
                        className="flex-1 h-11 px-4 bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-xs font-mono font-bold text-gray-900 dark:text-white rounded-xl shadow-sm focus:outline-none truncate"
                      />
                      <Button
                        onClick={handleCopy}
                        className={cn(
                          "h-11 px-6 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 shrink-0 border-0",
                          copied
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                            : "bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white"
                        )}
                      >
                        {copied ? (
                          <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
                        ) : (
                          <Copy className="w-4 h-4" strokeWidth={2} />
                        )}
                        <span>{copied ? t("copied") : t("copy")}</span>
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                        {t("quick_share")}
                      </span>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          onClick={handleWhatsAppShare}
                          className="h-9 px-4 rounded-xl border-emerald-200 bg-emerald-50/60 dark:bg-emerald-950/30 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-xs font-bold shadow-sm"
                        >
                          <MessageCircle className="w-4 h-4 mr-1.5" strokeWidth={2} />
                          <span>WhatsApp</span>
                        </Button>

                        <Button
                          variant="outline"
                          onClick={handleFacebookShare}
                          className="h-9 px-4 rounded-xl border-sky-200 bg-sky-50/60 dark:bg-sky-950/30 dark:border-sky-900/40 text-sky-700 dark:text-sky-400 text-xs font-bold shadow-sm"
                        >
                          <Facebook className="w-4 h-4 mr-1.5" strokeWidth={2} />
                          <span>Facebook</span>
                        </Button>

                        <Button
                          variant="outline"
                          onClick={handleTwitterShare}
                          className="h-9 px-4 rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 text-xs font-bold shadow-sm"
                        >
                          <Twitter className="w-4 h-4 mr-1.5" strokeWidth={2} />
                          <span>X (Twitter)</span>
                        </Button>

                        <Button
                          variant="outline"
                          onClick={handleShare}
                          className="h-9 px-4 rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 text-xs font-bold shadow-sm sm:hidden"
                        >
                          <Send className="w-4 h-4 mr-1.5" strokeWidth={2} />
                          <span>{t("copy")}</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Métricas KPIs */}
                <div className="flex flex-col bg-gray-50/50 dark:bg-[#050505] divide-y divide-gray-100 dark:divide-gray-800">
                  <div className="p-6 md:p-8 flex flex-col justify-center flex-1 space-y-2">
                    <div className="flex justify-between items-start">
                      <p className="text-xs font-bold text-gray-500 dark:text-gray-400">
                        {t("metrics.completed")}
                      </p>
                      <div className="w-8 h-8 rounded-xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
                        <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
                      </div>
                    </div>
                    <p className="text-2xl sm:text-3xl font-mono font-bold text-gray-900 dark:text-white tracking-tight">
                      {data?.activatedReferrals || 0}
                    </p>
                  </div>

                  <div className="p-6 md:p-8 flex flex-col justify-center flex-1 space-y-2">
                    <div className="flex justify-between items-start">
                      <p className="text-xs font-bold text-gray-500 dark:text-gray-400">
                        {t("metrics.pending")}
                      </p>
                      <div className="w-8 h-8 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-900/40 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-sm">
                        <AlertTriangle className="w-4 h-4" strokeWidth={2} />
                      </div>
                    </div>
                    <p className="text-2xl sm:text-3xl font-mono font-bold text-gray-800 dark:text-gray-200 tracking-tight">
                      {data?.pendingReferrals || 0}
                    </p>
                  </div>
                </div>

              </div>

              {/* Historial de Invitaciones */}
              <div className="flex flex-col border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]">
                <div className="p-6 md:p-8 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-sm">
                    <Users className="w-5 h-5" strokeWidth={2} />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                      {t("history_title")}
                    </h2>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">
                      {t("history_subtitle")}
                    </p>
                  </div>
                </div>

                <div className="w-full">
                  {!data?.history || data.history.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center p-12 gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 flex items-center justify-center text-gray-400 shadow-sm">
                        <Users className="w-7 h-7" strokeWidth={2} />
                      </div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">
                        {t("empty_title")}
                      </p>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed">
                        {t("empty_desc")}
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto custom-scrollbar">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50/50 dark:bg-[#050505] border-b border-gray-100 dark:border-gray-800">
                          <tr>
                            <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 whitespace-nowrap">
                              {t("table.reg_date")}
                            </th>
                            <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 whitespace-nowrap">
                              {t("table.system_id")}
                            </th>
                            <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 whitespace-nowrap">
                              {t("table.benefit")}
                            </th>
                            <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 text-right whitespace-nowrap">
                              {t("table.status")}
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                          {data.history.map((ref) => (
                            <tr
                              key={ref.id}
                              className="hover:bg-gray-50/50 dark:hover:bg-[#111]/50 transition-colors"
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-2 text-xs font-bold text-gray-900 dark:text-white mb-0.5">
                                  <CalendarDays
                                    className="w-3.5 h-3.5 text-gray-400"
                                    strokeWidth={2}
                                  />
                                  <span>
                                    {format(
                                      new Date(ref.createdAt),
                                      "dd MMM yyyy",
                                      { locale: dateLocale }
                                    )}
                                  </span>
                                </div>
                                {ref.activatedAt && (
                                  <div className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                    <ArrowRight
                                      className="w-3 h-3"
                                      strokeWidth={2}
                                    />
                                    <span>
                                      {t("table.activated_at", {
                                        date: format(
                                          new Date(ref.activatedAt),
                                          "dd MMM yyyy",
                                          { locale: dateLocale }
                                        ),
                                      })}
                                    </span>
                                  </div>
                                )}
                              </td>

                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-7 h-7 rounded-lg bg-gray-50 dark:bg-[#050505] flex items-center justify-center border border-gray-100 dark:border-gray-800">
                                    <span className="text-[10px] font-mono font-bold text-gray-700 dark:text-gray-300">
                                      #{ref.referredId}
                                    </span>
                                  </div>
                                  <span className="text-xs font-semibold text-gray-900 dark:text-white">
                                    {t("table.colleague_linked")}
                                  </span>
                                </div>
                              </td>

                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                  {ref.benefitType === "PLATFORM_CREDITS"
                                    ? t("table.credits_benefit")
                                    : ref.benefitType}
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

            {/* ── TAB 2: CÓDIGOS Y RECOMENDACIONES MANAGER ─────────────────── */}
            <TabsContent
              value="recommendations"
              className="m-0 p-0 border-none outline-none focus-visible:ring-0"
            >
              <RecommendationsManager />
            </TabsContent>

          </Tabs>
        </div>

      </div>
    </div>
  );
}