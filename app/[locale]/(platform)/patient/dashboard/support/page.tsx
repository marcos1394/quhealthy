"use client";

/* eslint-disable react-doctor/prefer-module-scope-pure-function */

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import {
  MessageSquare,
  Mail,
  Smartphone,
  Loader2,
  Send,
  Headset,
} from "lucide-react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { sendSupportEmail } from "@/app/actions/support";

export default function SupportPage() {
  const t = useTranslations("PatientSupport");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const res = await sendSupportEmail(formData);

    if (res.success) {
      toast.success(t("toast_success"));
      (e.target as HTMLFormElement).reset();
    } else {
      toast.error(res.error || t("toast_error"));
    }

    setIsSubmitting(false);
  };

  const handleChatwootOpen = () => {
    // @ts-ignore
    if (typeof window !== "undefined" && window.$chatwoot) {
      // @ts-ignore
      window.$chatwoot.toggle("open");
    } else {
      toast.info(t("chat_initializing"));
    }
  };

  const handleComingSoon = (channel: string) => {
    toast.info(t("coming_soon_toast", { channel }));
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] font-sans text-gray-900 dark:text-white selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500 pb-24">
      <div className="max-w-5xl mx-auto px-6 py-10 sm:py-12 space-y-10">
        
        {/* ── HEADER ────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-5 border-b border-gray-100 dark:border-gray-800 pb-8">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 shadow-sm flex items-center justify-center shrink-0">
            <Headset className="w-7 h-7" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              {t("title")}
            </h1>
            <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mt-0.5">
              {t("subtitle")}
            </p>
          </div>
        </div>

        {/* ── GRID PRINCIPAL ────────────────────────────────────────────── */}
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          
          {/* Columna Izquierda: Formulario de Soporte (2 columnas) */}
          <div className="lg:col-span-2 rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Mail className="w-4.5 h-4.5" strokeWidth={2} />
              </div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                {t("ticket_title")}
              </h2>
            </div>

            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400">
                    {t("label_name")}
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full h-11 px-4 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm placeholder:text-gray-400 dark:placeholder:text-gray-600"
                    placeholder={t("placeholder_name")}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400">
                    {t("label_email")}
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full h-11 px-4 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm placeholder:text-gray-400 dark:placeholder:text-gray-600"
                    placeholder={t("placeholder_email")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400">
                  {t("label_subject")}
                </label>
                <input
                  type="text"
                  name="subject"
                  required
                  className="w-full h-11 px-4 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm placeholder:text-gray-400 dark:placeholder:text-gray-600"
                  placeholder={t("placeholder_subject")}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400">
                  {t("label_message")}
                </label>
                <textarea
                  name="message"
                  required
                  rows={5}
                  className="w-full p-4 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm placeholder:text-gray-400 dark:placeholder:text-gray-600 resize-none"
                  placeholder={t("placeholder_message")}
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 h-11 text-xs font-bold transition-all shadow-sm border-0 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t("btn_sending")}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" strokeWidth={2} />
                    <span>{t("btn_send")}</span>
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Columna Derecha: Canales Rápidos (1 columna) */}
          <div className="space-y-6">
            
            {/* Tarjeta Chat en Vivo */}
            <div className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-6 shadow-sm flex flex-col justify-between h-56">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-900/40 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-4 shadow-sm">
                  <MessageSquare className="w-5 h-5" strokeWidth={2} />
                </div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                  {t("live_chat_title")}
                </h3>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                  {t("live_chat_desc")}
                </p>
              </div>
              <Button
                onClick={handleChatwootOpen}
                variant="outline"
                className="w-full rounded-xl border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#111] text-gray-900 dark:text-white text-xs font-bold transition-all h-10 shadow-sm"
              >
                {t("btn_open_chat")}
              </Button>
            </div>

            {/* Tarjeta WhatsApp */}
            <div className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-6 shadow-sm flex flex-col justify-between h-56">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 shadow-sm">
                  <Smartphone className="w-5 h-5" strokeWidth={2} />
                </div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                  {t("whatsapp_title")}
                </h3>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                  {t("whatsapp_desc")}
                </p>
              </div>
              <Button
                onClick={() => handleComingSoon("WhatsApp")}
                variant="outline"
                disabled
                className="w-full rounded-xl border-gray-100 dark:border-gray-800 text-gray-400 dark:text-gray-500 text-xs font-bold transition-all h-10 shadow-sm opacity-60 cursor-not-allowed"
              >
                {t("btn_coming_soon")}
              </Button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}