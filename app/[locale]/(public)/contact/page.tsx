"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Mail, Phone, MapPin } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { sendContactEmail } from "@/app/actions/contact";
import { toast } from "sonner"; // Assuming sonner is installed as I see it in package.json

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

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 font-sans selection:bg-medical-500/30">
      <section className="pt-32 pb-20 md:pt-40 md:pb-32">
        <div className="container mx-auto px-6 md:px-12 max-w-7xl">
          
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
            
            {/* Left Column - Context */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center gap-2 text-sm text-medical-600 dark:text-medical-400 font-semibold uppercase tracking-widest mb-6">
                <Link href="/" className="hover:underline">QuHealthy</Link>
                <ArrowRight className="w-4 h-4" />
                <span>{t('breadcrumb')}</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-semibold tracking-tight text-slate-900 dark:text-white mb-6">
                {t('title')}
              </h1>
              <p className="text-xl text-slate-500 dark:text-slate-400 font-light leading-relaxed mb-12">
                {t('subtitle')}
              </p>

              <div className="space-y-8">
                <div className="flex gap-5 items-start">
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-800">
                    <Mail className="w-5 h-5 text-slate-900 dark:text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">Correo Electrónico</h3>
                    <a href="mailto:founders@quhealthy.org" className="text-medical-600 dark:text-medical-400 hover:underline">founders@quhealthy.org</a>
                  </div>
                </div>

                {/* Teléfono eliminado temporalmente */}

                <div className="flex gap-5 items-start">
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-800">
                    <MapPin className="w-5 h-5 text-slate-900 dark:text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">Sede Principal</h3>
                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                      Los Mochis, Sinaloa<br />México
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Column - Form */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] border border-slate-200 dark:border-slate-800"
            >
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-8">{t('form_title')}</h2>
              <form className="space-y-6" onSubmit={handleSubmit}>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('form.name')}</label>
                    <input 
                      type="text" 
                      name="name"
                      required
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-medical-500/50 focus:border-medical-500 outline-none transition-all text-slate-900 dark:text-white"
                      placeholder={t('form.name_ph')}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Empresa (Opcional)</label>
                    <input 
                      type="text" 
                      name="company"
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-medical-500/50 focus:border-medical-500 outline-none transition-all text-slate-900 dark:text-white"
                      placeholder="Acme Corp"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('form.email')}</label>
                  <input 
                    type="email" 
                    name="email"
                    required
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-medical-500/50 focus:border-medical-500 outline-none transition-all text-slate-900 dark:text-white"
                    placeholder={t('form.email_ph')}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('form.topic')}</label>
                  <select name="topic" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-medical-500/50 focus:border-medical-500 outline-none transition-all text-slate-900 dark:text-white appearance-none">
                    <option>{t('form.topics.support')}</option>
                    <option>{t('form.topics.billing')}</option>
                    <option>{t('form.topics.careers')}</option>
                    <option>{t('form.topics.other')}</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('form.message')}</label>
                  <textarea 
                    rows={4}
                    name="message"
                    required
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-medical-500/50 focus:border-medical-500 outline-none transition-all text-slate-900 dark:text-white resize-none"
                    placeholder={t('form.message_ph')}
                  />
                </div>

                <Button disabled={isSubmitting} className="w-full bg-medical-600 hover:bg-medical-700 text-white rounded-xl h-14 text-base font-semibold mt-4 group">
                  {isSubmitting ? "Enviando..." : t('form.submit')}
                  {!isSubmitting && <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />}
                </Button>

                <p className="text-xs text-center text-slate-500 mt-4">
                  Al enviar este formulario, aceptas nuestra <a href="/privacy" className="underline hover:text-slate-700 dark:hover:text-slate-300">Política de Privacidad</a>.
                </p>

              </form>
            </motion.div>

          </div>
        </div>
      </section>
    </div>
  );
}
