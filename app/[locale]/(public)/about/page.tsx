"use client";
import React from "react";
import { motion } from "framer-motion";
import { Users, Target, Zap, ShieldCheck } from "lucide-react";

export default function AboutPage() {
  const values = [
    {
      icon: Users,
      title: "Centrados en el Paciente",
      description: "Construimos herramientas que devuelven el control de la salud a las personas, eliminando fricciones y tiempos de espera."
    },
    {
      icon: Target,
      title: "Precisión y Calidad",
      description: "Seleccionamos rigurosamente a cada especialista en nuestra red para garantizar los estándares más altos de atención."
    },
    {
      icon: Zap,
      title: "Innovación Tecnológica",
      description: "Utilizamos la última tecnología en Silicon Valley para crear una infraestructura rápida, segura y escalable."
    },
    {
      icon: ShieldCheck,
      title: "Privacidad por Diseño",
      description: "Cumplimos con normativas globales (HIPAA, GDPR) asegurando que tus datos médicos sean estrictamente confidenciales."
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 font-sans selection:bg-medical-500/30">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-medical-50/50 via-white to-white dark:from-medical-900/20 dark:via-slate-950 dark:to-slate-950 -z-10" />
        <div className="container mx-auto px-6 md:px-12 text-center max-w-5xl">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-semibold tracking-tight text-slate-900 dark:text-white mb-8"
          >
            Nuestra misión es <span className="text-transparent bg-clip-text bg-gradient-to-r from-medical-600 to-teal-500 italic font-serif">democratizar</span> el acceso al bienestar.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-xl md:text-2xl text-slate-500 dark:text-slate-400 font-light max-w-3xl mx-auto leading-relaxed"
          >
            QuHealthy nace de la necesidad de conectar a las personas con servicios de salud y belleza de calidad, a través de una plataforma moderna, transparente y eficiente.
          </motion.p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
            {[
              { label: "Especialistas", value: "5k+" },
              { label: "Pacientes", value: "120k" },
              { label: "Citas Agendadas", value: "1.2M" },
              { label: "Uptime", value: "99.9%" }
            ].map((stat, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <div className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tighter mb-2">{stat.value}</div>
                <div className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-6 md:px-12 max-w-6xl">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-slate-900 dark:text-white mb-6">Nuestros Valores</h2>
            <p className="text-lg text-slate-500 dark:text-slate-400 font-light max-w-2xl mx-auto">
              Principios inquebrantables que guían cada línea de código que escribimos y cada decisión que tomamos.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 md:gap-16">
            {values.map((val, idx) => {
              const Icon = val.icon;
              return (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  className="flex gap-6"
                >
                  <div className="w-14 h-14 rounded-2xl bg-medical-50 dark:bg-medical-900/30 flex items-center justify-center shrink-0 border border-medical-100 dark:border-medical-800">
                    <Icon className="w-6 h-6 text-medical-600 dark:text-medical-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">{val.title}</h3>
                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-light">{val.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
