"use client";
import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, MapPin, Briefcase, Laptop, HeartPulse } from "lucide-react";
import { Button } from "@/components/ui/button";
import useSWR from "swr";
import axiosInstance from "@/lib/axios";

// Interfaz esperada del backend
interface JobOpening {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  tag?: string;
}

const fetcher = (url: string) => axiosInstance.get<JobOpening[]>(url).then(res => res.data);

export default function CareersPage() {
  const { data: jobOpenings, isLoading } = useSWR<JobOpening[]>("/api/careers/openings", fetcher);

  const benefits = [
    { icon: Laptop, title: "Trabajo Remoto y Flexible", desc: "Creemos en medir resultados, no horas de asiento. Trabaja desde donde seas más feliz y productivo." },
    { icon: HeartPulse, title: "Seguro Médico Premium", desc: "Salud total para ti y tu familia directa, incluyendo cobertura dental, visual y mental." },
    { icon: Briefcase, title: "Presupuesto de Desarrollo", desc: "$1,500 USD anuales para conferencias, cursos, libros o hardware que impulse tu carrera." }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans selection:bg-medical-500/30">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-medical-50/50 via-white to-white dark:from-medical-900/20 dark:via-slate-900 dark:to-slate-900 -z-10" />
        <div className="container mx-auto px-6 md:px-12 max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block border border-medical-200 dark:border-medical-800 bg-medical-50 dark:bg-medical-900/30 text-medical-600 dark:text-medical-400 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-6">
              Bolsa de Trabajo
            </span>
            <h1 className="text-5xl md:text-7xl font-semibold tracking-tight text-slate-900 dark:text-white mb-6">
              Construye el <span className="text-transparent bg-clip-text bg-gradient-to-r from-medical-600 to-teal-500 italic font-serif">futuro</span> de la salud.
            </h1>
            <p className="text-xl md:text-2xl text-slate-500 dark:text-slate-400 font-light max-w-3xl mx-auto leading-relaxed mb-10">
              Buscamos mentes brillantes y apasionadas que quieran resolver problemas difíciles y tener un impacto real en la calidad de vida de millones de personas.
            </p>
            <Button className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-full h-14 px-8 text-base font-medium shadow-xl hover:shadow-2xl transition-all">
              Ver Posiciones Abiertas <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-white dark:bg-slate-950">
        <div className="container mx-auto px-6 md:px-12 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-semibold text-slate-900 dark:text-white tracking-tight mb-4">¿Por qué unirte a QuHealthy?</h2>
            <p className="text-slate-500 dark:text-slate-400 text-lg">Nos ocupamos de nuestro equipo, para que ellos puedan ocuparse de nuestros usuarios.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, idx) => {
              const Icon = benefit.icon;
              return (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="bg-slate-50 dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 text-center"
                >
                  <div className="w-14 h-14 mx-auto bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                    <Icon className="w-6 h-6 text-medical-600 dark:text-medical-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">{benefit.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm font-light">{benefit.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Openings Section */}
      <section className="py-24 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-6 md:px-12 max-w-5xl">
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-semibold text-slate-900 dark:text-white tracking-tight">Posiciones Abiertas</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Únete a un equipo distribuido en toda América Latina.</p>
          </div>

          <div className="space-y-4">
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                <div className="w-8 h-8 border-4 border-medical-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p>Cargando posiciones abiertas...</p>
              </div>
            )}

            {!isLoading && (!jobOpenings || jobOpenings.length === 0) && (
              <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No hay posiciones abiertas</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  En este momento nuestro equipo está completo. Sin embargo, siempre estamos buscando talento excepcional. Envíanos tu información.
                </p>
              </div>
            )}

            {!isLoading && jobOpenings && jobOpenings.map((job, idx) => (
              <motion.div 
                key={job.id || idx}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="group flex flex-col md:flex-row md:items-center justify-between p-6 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-medical-500/50 dark:hover:border-medical-500/50 transition-all cursor-pointer hover:shadow-lg"
              >
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white group-hover:text-medical-600 dark:group-hover:text-medical-400 transition-colors">{job.title}</h3>
                    {job.tag && (
                      <span className="bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full">
                        {job.tag}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400 font-medium">
                    <span className="uppercase tracking-wider text-xs">{job.department}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                    <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {job.location}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                    <span>{job.type}</span>
                  </div>
                </div>
                
                <div className="mt-4 md:mt-0">
                  <Button variant="ghost" className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">
                    Aplicar <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-16 bg-medical-50 dark:bg-medical-900/10 border border-medical-100 dark:border-medical-900/30 p-8 rounded-3xl text-center">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">¿No encuentras tu posición?</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">Siempre estamos buscando talento excepcional. Envíanos tu currículum y cuéntanos por qué deberías estar en QuHealthy.</p>
            <Button className="bg-medical-600 hover:bg-medical-700 text-white rounded-xl h-11 px-6 font-medium">
              Enviar Solicitud Abierta
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
