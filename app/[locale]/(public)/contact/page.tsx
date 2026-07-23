"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/prefer-module-scope-static-value */

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  ArrowRight, 
  Mail, 
  MapPin, 
  ChevronRight, 
  MessageSquare, 
  Sparkles, 
  Send 
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { sendContactEmail } from "@/app/actions/contact";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { cn } from "@/lib/utils";

export default function ContactPage() {
  const t = useTranslations("PublicContact");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const res = await sendContactEmail(formData);

    if (res.success) {
      toast.success("¡Mensaje enviado correctamente! Te contactaremos pronto.");
      (e.target as HTMLFormElement).reset();
    } else {
      toast.error(res.error || "Hubo un error. Por favor intenta nuevamente.");
    }

    setIsSubmitting(false);
  };

  // Variantes de animación para los campos del formulario
  const formVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] font-sans selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500">
      <section className="pt-28 pb-20 md:pt-36 md:pb-28">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            
            {/* ── COLUMNA IZQUIERDA (CONTEXTO E INFO) ────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="lg:col-span-5 space-y-8"
            >
              {/* Breadcrumb Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800/60 text-xs font-semibold text-gray-600 dark:text-gray-300 shadow-sm">
                <Link
                  href="/"
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  QuHealthy
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-gray-900 dark:text-white font-bold">
                  {t("breadcrumb", { defaultValue: "Contacto" })}
                </span>
              </div>

              {/* Títulos */}
              <div className="space-y-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-900/40">
                  <MessageSquare className="w-3.5 h-3.5" strokeWidth={2} />
                  <span>Estamos para Ayudarte</span>
                </span>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-white leading-[1.15]">
                  {t("title", { defaultValue: "Ponte en Contacto con Nosotros" })}
                </h1>

                <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 font-medium leading-relaxed pt-1">
                  {t("subtitle", { defaultValue: "¿Tienes alguna duda, propuesta institucional o inquietud sobre nuestra plataforma? Envíanos un mensaje y te responderemos a la brevedad." })}
                </p>
              </div>

              {/* Tarjetas de Información de Contacto */}
              <div className="space-y-4 pt-2">
                
                {/* Email Card */}
                <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm flex items-start gap-4 hover:border-emerald-500/30 transition-all">
                  <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-sm">
                    <Mail className="w-5 h-5" strokeWidth={2} />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Correo Electrónico Directo
                    </h3>
                    <a
                      href="mailto:founders@quhealthy.org"
                      className="text-sm font-bold text-gray-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors truncate block"
                    >
                      founders@quhealthy.org
                    </a>
                  </div>
                </div>

                {/* Sede Card */}
                <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm flex items-start gap-4 hover:border-emerald-500/30 transition-all">
                  <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-sm">
                    <MapPin className="w-5 h-5" strokeWidth={2} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Sede Principal
                    </h3>
                    <p className="text-sm font-bold text-gray-900 dark:text-white leading-snug">
                      Los Mochis, Sinaloa • México
                    </p>
                  </div>
                </div>

              </div>
            </motion.div>

            {/* ── COLUMNA DERECHA (FORMULARIO) ──────────────────────────── */}
            <motion.div
              variants={formVariants}
              initial="hidden"
              animate="show"
              className="lg:col-span-7"
            >
              <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 md:p-10 shadow-sm space-y-6">
                
                <div className="space-y-1 border-b border-gray-100 dark:border-gray-800 pb-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {t("form_title", { defaultValue: "Envíanos un Mensaje" })}
                  </h2>
                  <p className="text-xs font-medium text-gray-500">
                    Completa el siguiente formulario para canalizar tu solicitud al área correspondiente.
                  </p>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit}>
                  
                  {/* Nombre y Empresa */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <motion.div variants={itemVariants} className="space-y-1.5">
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                        {t("form.name", { defaultValue: "Nombre Completo" })}
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        className="w-full h-12 px-4 bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 placeholder:text-gray-400 shadow-sm transition-all"
                        placeholder={t("form.name_ph", { defaultValue: "Dra. María Elena" })}
                      />
                    </motion.div>

                    <motion.div variants={itemVariants} className="space-y-1.5">
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                        Empresa / Clínica (Opcional)
                      </label>
                      <input
                        type="text"
                        name="company"
                        className="w-full h-12 px-4 bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 placeholder:text-gray-400 shadow-sm transition-all"
                        placeholder="Ej. Clínica Especialidades"
                      />
                    </motion.div>
                  </div>

                  {/* Correo Electrónico */}
                  <motion.div variants={itemVariants} className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                      {t("form.email", { defaultValue: "Correo Electrónico" })}
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      className="w-full h-12 px-4 bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 placeholder:text-gray-400 shadow-sm transition-all"
                      placeholder={t("form.email_ph", { defaultValue: "doctora@ejemplo.com" })}
                    />
                  </motion.div>

                  {/* Asunto / Tema */}
                  <motion.div variants={itemVariants} className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                      {t("form.topic", { defaultValue: "Asunto o Motivo" })}
                    </label>
                    <select
                      name="topic"
                      className="w-full h-12 px-4 bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm transition-all cursor-pointer"
                    >
                      <option value="Soporte Técnico" className="bg-white dark:bg-[#0a0a0a]">
                        {t("form.topics.support", { defaultValue: "Soporte Técnico y Ayuda" })}
                      </option>
                      <option value="Planes y Facturación" className="bg-white dark:bg-[#0a0a0a]">
                        {t("form.topics.billing", { defaultValue: "Ventas y Suscripciones B2B" })}
                      </option>
                      <option value="Carreras y Empleo" className="bg-white dark:bg-[#0a0a0a]">
                        {t("form.topics.careers", { defaultValue: "Carreras y Talento" })}
                      </option>
                      <option value="Otro" className="bg-white dark:bg-[#0a0a0a]">
                        {t("form.topics.other", { defaultValue: "Otro asunto" })}
                      </option>
                    </select>
                  </motion.div>

                  {/* Mensaje */}
                  <motion.div variants={itemVariants} className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                      {t("form.message", { defaultValue: "Mensaje" })}
                    </label>
                    <textarea
                      rows={4}
                      name="message"
                      required
                      className="w-full p-4 bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 placeholder:text-gray-400 shadow-sm transition-all resize-none"
                      placeholder={t("form.message_ph", { defaultValue: "Escribe aquí los detalles de tu consulta..." })}
                    />
                  </motion.div>

                  {/* Submit Button & Consent */}
                  <motion.div variants={itemVariants} className="pt-2 space-y-3">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-12 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-xs font-bold shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <QhSpinner size="sm" className="text-current" />
                          <span>Enviando mensaje...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" strokeWidth={2} />
                          <span>{t("form.submit", { defaultValue: "Enviar Mensaje" })}</span>
                        </>
                      )}
                    </button>

                    <p className="text-[11px] text-gray-400 font-medium text-center leading-relaxed">
                      Al enviar este formulario, confirmas que aceptas nuestra{" "}
                      <Link
                        href="/privacy"
                        className="text-emerald-600 dark:text-emerald-400 hover:underline font-bold"
                      >
                        Política de Privacidad
                      </Link>
                      .
                    </p>
                  </motion.div>

                </form>

              </div>
            </motion.div>

          </div>

        </div>
      </section>
    </div>
  );
}