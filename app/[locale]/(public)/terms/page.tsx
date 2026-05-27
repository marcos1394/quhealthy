"use client";
import React from "react";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

export default function TermsPage() {
  const sections = [
    { id: "introduccion", title: "1. Introducción" },
    { id: "uso", title: "2. Uso de la Plataforma" },
    { id: "citas", title: "3. Políticas de Citas y Cancelaciones" },
    { id: "privacidad", title: "4. Privacidad y Datos" },
    { id: "responsabilidad", title: "5. Limitación de Responsabilidad" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans selection:bg-medical-500/30">
      
      {/* Header */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-24 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-6 md:px-12 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-2 text-sm text-medical-600 dark:text-medical-400 font-semibold uppercase tracking-widest mb-6">
              <Link href="/" className="hover:underline">QuHealthy</Link>
              <ChevronRight className="w-4 h-4" />
              <span>Legal</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-slate-900 dark:text-white mb-6">
              Términos de Servicio
            </h1>
            <p className="text-lg text-slate-500 dark:text-slate-400 font-light">
              Última actualización: 27 de Mayo, 2026
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-6 md:px-12 max-w-5xl">
          <div className="flex flex-col md:flex-row gap-12 lg:gap-20 items-start">
            
            {/* Sidebar Navigation */}
            <motion.aside 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="w-full md:w-64 shrink-0 md:sticky md:top-32"
            >
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-6">Contenido</h3>
              <ul className="space-y-4">
                {sections.map((sec) => (
                  <li key={sec.id}>
                    <a 
                      href={`#${sec.id}`}
                      className="text-slate-500 dark:text-slate-400 hover:text-medical-600 dark:hover:text-medical-400 font-medium text-sm transition-colors"
                    >
                      {sec.title}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.aside>

            {/* Document Body */}
            <motion.article 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="prose prose-slate dark:prose-invert prose-lg max-w-none text-slate-600 dark:text-slate-300 font-light leading-relaxed"
            >
              <p>
                Al utilizar QuHealthy, usted acepta estos términos de servicio en su totalidad. Por favor, léalos cuidadosamente antes de utilizar nuestra plataforma para reservar citas médicas, gestionar expedientes o comunicarse con especialistas.
              </p>

              <h2 id="introduccion" className="text-2xl font-semibold text-slate-900 dark:text-white mt-12 mb-6">1. Introducción</h2>
              <p>
                QuHealthy ("Nosotros", "la Plataforma") proporciona una infraestructura tecnológica para conectar a pacientes con profesionales de la salud. Nosotros no proveemos servicios médicos directamente ni somos responsables de los diagnósticos emitidos por los profesionales registrados.
              </p>

              <h2 id="uso" className="text-2xl font-semibold text-slate-900 dark:text-white mt-12 mb-6">2. Uso de la Plataforma</h2>
              <p>
                Usted se compromete a proporcionar información verdadera, exacta y completa al crear una cuenta. El uso de la plataforma para fines ilícitos, suplantación de identidad o generación de citas falsas resultará en la suspensión inmediata y permanente de la cuenta.
              </p>

              <h2 id="citas" className="text-2xl font-semibold text-slate-900 dark:text-white mt-12 mb-6">3. Políticas de Citas y Cancelaciones</h2>
              <p>
                Los pacientes pueden cancelar o reprogramar una cita con al menos 24 horas de anticipación sin penalización, a menos que el profesional de salud especifique lo contrario en su propio perfil. Las ausencias (no-shows) repetidas pueden derivar en bloqueos temporales.
              </p>

              <h2 id="privacidad" className="text-2xl font-semibold text-slate-900 dark:text-white mt-12 mb-6">4. Privacidad y Datos</h2>
              <p>
                La protección de su información de salud (PHI) es nuestra máxima prioridad. Todos los datos son encriptados en reposo y en tránsito siguiendo los lineamientos de HIPAA. Para más detalles, por favor consulte nuestra <Link href="/privacy" className="text-medical-600 dark:text-medical-400 font-medium">Política de Privacidad</Link.
              </p>

              <h2 id="responsabilidad" className="text-2xl font-semibold text-slate-900 dark:text-white mt-12 mb-6">5. Limitación de Responsabilidad</h2>
              <p>
                QuHealthy actúa exclusivamente como un facilitador tecnológico. No seremos responsables por negligencia médica, prescripciones erróneas o disputas directas que surjan entre el paciente y el proveedor de salud. En caso de una emergencia médica, usted debe contactar inmediatamente a los servicios de urgencia locales (ej. 911), y no utilizar nuestra plataforma.
              </p>
              
              <div className="mt-16 pt-8 border-t border-slate-200 dark:border-slate-800 text-sm">
                ¿Tiene alguna duda sobre estos términos? Contáctenos a <a href="mailto:legal@quhealthy.com" className="text-medical-600 dark:text-medical-400 font-medium">legal@quhealthy.com</a>.
              </div>
            </motion.article>

          </div>
        </div>
      </section>
    </div>
  );
}
