"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Mail, MapPin, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { sendContactEmail } from "@/app/actions/contact";
import { toast } from "sonner"; 

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
      transition: { staggerChildren: 0.1, delayChildren: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] font-sans selection:bg-gray-200 dark:selection:bg-white/20">
      <section className="pt-32 pb-20 md:pt-40 md:pb-32">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
            
            {/* Left Column - Context (Estilo Editorial) */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Breadcrumbs */}
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-8">
                <Link href="/" className="hover:text-black dark:hover:text-white transition-colors">QuHealthy</Link>
                <ChevronRight className="w-3 h-3" />
                <span className="text-black dark:text-white">{t('breadcrumb')}</span>
              </div>

              {/* Títulos */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-black dark:text-white mb-6 leading-tight">
                {t('title')}
              </h1>
              <p className="text-lg text-gray-500 dark:text-gray-400 font-light leading-relaxed mb-16 max-w-md">
                {t('subtitle')}
              </p>

              {/* Bloques de Información de Contacto (Minimalistas) */}
              <div className="space-y-10 border-t border-gray-200 dark:border-white/10 pt-10">
                <div className="flex gap-6 items-start group">
                  <div className="mt-1 text-black dark:text-white opacity-50 group-hover:opacity-100 transition-opacity">
                    <Mail className="w-5 h-5" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-black dark:text-white uppercase tracking-widest mb-2">Correo Electrónico</h3>
                    <a href="mailto:founders@quhealthy.org" className="text-gray-600 dark:text-gray-300 font-light text-lg hover:text-black dark:hover:text-white transition-colors border-b border-transparent hover:border-black dark:hover:border-white pb-0.5">
                      founders@quhealthy.org
                    </a>
                  </div>
                </div>

                <div className="flex gap-6 items-start group">
                  <div className="mt-1 text-black dark:text-white opacity-50 group-hover:opacity-100 transition-opacity">
                    <MapPin className="w-5 h-5" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-black dark:text-white uppercase tracking-widest mb-2">Sede Principal</h3>
                    <p className="text-gray-600 dark:text-gray-300 font-light text-lg leading-relaxed">
                      Los Mochis, Sinaloa<br />México
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Column - Form (Clean Underline Inputs) */}
            <motion.div 
              variants={formVariants}
              initial="hidden"
              animate="show"
              className="w-full lg:pl-10"
            >
              <motion.h2 variants={itemVariants} className="text-2xl font-semibold text-black dark:text-white mb-10">
                {t('form_title')}
              </motion.h2>
              
              <form className="space-y-8" onSubmit={handleSubmit}>
                
                <div className="grid md:grid-cols-2 gap-8">
                  <motion.div variants={itemVariants} className="relative group">
                    <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1 block group-focus-within:text-black dark:group-focus-within:text-white transition-colors">
                      {t('form.name')}
                    </label>
                    <input 
                      type="text" 
                      name="name"
                      required
                      className="w-full bg-transparent border-b border-gray-300 dark:border-gray-800 py-3 text-black dark:text-white font-light focus:outline-none focus:border-black dark:focus:border-white transition-colors placeholder:text-gray-300 dark:placeholder:text-gray-700"
                      placeholder={t('form.name_ph')}
                    />
                  </motion.div>
                  
                  <motion.div variants={itemVariants} className="relative group">
                    <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1 block group-focus-within:text-black dark:group-focus-within:text-white transition-colors">
                      Empresa (Opcional)
                    </label>
                    <input 
                      type="text" 
                      name="company"
                      className="w-full bg-transparent border-b border-gray-300 dark:border-gray-800 py-3 text-black dark:text-white font-light focus:outline-none focus:border-black dark:focus:border-white transition-colors placeholder:text-gray-300 dark:placeholder:text-gray-700"
                      placeholder="Acme Corp"
                    />
                  </motion.div>
                </div>

                <motion.div variants={itemVariants} className="relative group">
                  <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1 block group-focus-within:text-black dark:group-focus-within:text-white transition-colors">
                    {t('form.email')}
                  </label>
                  <input 
                    type="email" 
                    name="email"
                    required
                    className="w-full bg-transparent border-b border-gray-300 dark:border-gray-800 py-3 text-black dark:text-white font-light focus:outline-none focus:border-black dark:focus:border-white transition-colors placeholder:text-gray-300 dark:placeholder:text-gray-700"
                    placeholder={t('form.email_ph')}
                  />
                </motion.div>

                <motion.div variants={itemVariants} className="relative group">
                  <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1 block group-focus-within:text-black dark:group-focus-within:text-white transition-colors">
                    {t('form.topic')}
                  </label>
                  <select name="topic" className="w-full bg-transparent border-b border-gray-300 dark:border-gray-800 py-3 text-black dark:text-white font-light focus:outline-none focus:border-black dark:focus:border-white transition-colors appearance-none cursor-pointer">
                    <option className="text-black">{t('form.topics.support')}</option>
                    <option className="text-black">{t('form.topics.billing')}</option>
                    <option className="text-black">{t('form.topics.careers')}</option>
                    <option className="text-black">{t('form.topics.other')}</option>
                  </select>
                </motion.div>

                <motion.div variants={itemVariants} className="relative group">
                  <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1 block group-focus-within:text-black dark:group-focus-within:text-white transition-colors">
                    {t('form.message')}
                  </label>
                  <textarea 
                    rows={4}
                    name="message"
                    required
                    className="w-full bg-transparent border-b border-gray-300 dark:border-gray-800 py-3 text-black dark:text-white font-light focus:outline-none focus:border-black dark:focus:border-white transition-colors placeholder:text-gray-300 dark:placeholder:text-gray-700 resize-none"
                    placeholder={t('form.message_ph')}
                  />
                </motion.div>

                <motion.div variants={itemVariants} className="pt-4">
                  <Button 
                    disabled={isSubmitting} 
                    className="w-full flex items-center justify-between bg-black hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-gray-100 text-white rounded-none h-14 px-6 text-sm font-semibold uppercase tracking-widest transition-all group"
                  >
                    <span>{isSubmitting ? "Enviando..." : t('form.submit')}</span>
                    {!isSubmitting && <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />}
                  </Button>

                  <p className="text-xs text-gray-400 dark:text-gray-600 mt-6 font-light leading-relaxed">
                    Al enviar este formulario, aceptas nuestra{" "}
                    <Link href="/privacy" className="text-black dark:text-white hover:underline font-medium">
                      Política de Privacidad
                    </Link>.
                  </p>
                </motion.div>

              </form>
            </motion.div>

          </div>
        </div>
      </section>
    </div>
  );
}