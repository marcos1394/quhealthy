"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  ChevronRight, 
  ShieldCheck, 
  ArrowRight, 
  FileText, 
  RefreshCcw,
  XCircle,
  AlertTriangle
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function ReturnsPage() {
  const [activeSection, setActiveSection] = useState("intro");

  const sections = [
    { id: "intro", title: "1. Política General", icon: FileText },
    { id: "devoluciones", title: "2. Devoluciones", icon: AlertTriangle },
    { id: "cambios", title: "3. Cambios", icon: XCircle },
    { id: "proceso", title: "4. Proceso de Devolución", icon: RefreshCcw },
  ];

  // UX Improvement: ScrollSpy (Detecta qué sección está en pantalla)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0px -80% 0px" }
    );

    sections.forEach((sec) => {
      const element = document.getElementById(sec.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [sections]);

  // UX Improvement: Smooth Scroll con compensación de encabezado
  const scrollToSection = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    id: string
  ) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const elementPosition =
        element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] font-sans selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500">
      
      {/* ── HERO SECTION ──────────────────────────────────────────────────── */}
      <section className="pt-28 pb-16 md:pt-36 md:pb-20 bg-white dark:bg-[#0a0a0a] border-b border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-6 md:px-12 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="space-y-6"
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
                Política de Devoluciones
              </span>
            </div>

            <div className="space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-900/40">
                <ShieldCheck className="w-3.5 h-3.5" strokeWidth={2} />
                <span>Transparencia y Garantía</span>
              </span>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-white leading-[1.15]">
                Política de Devoluciones y Cambios
              </h1>

              <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 font-medium max-w-3xl leading-relaxed pt-1">
                Información clara sobre nuestras políticas aplicables a los productos y servicios adquiridos en nuestra plataforma.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── SECCIÓN DE CONTENIDO ──────────────────────────────────────────── */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-6 md:px-12 max-w-6xl">
          <div className="flex flex-col lg:flex-row gap-12 items-start">
            
            {/* ── NAVEGACIÓN LATERAL (SCROLLSPY) ─────────────────────────── */}
            <motion.aside
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
              className="w-full lg:w-64 shrink-0 lg:sticky lg:top-28 hidden lg:block"
            >
              <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-5 shadow-sm space-y-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2">
                  Tabla de Contenido
                </p>

                <nav className="flex flex-col space-y-1 relative">
                  {sections.map((sec) => {
                    const isActive = activeSection === sec.id;
                    const Icon = sec.icon;
                    return (
                      <a
                        key={sec.id}
                        href={`#${sec.id}`}
                        onClick={(e) => scrollToSection(e, sec.id)}
                        className={cn(
                          "flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all leading-tight",
                          isActive
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 font-bold border border-emerald-200/60 dark:border-emerald-900/40"
                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#111] hover:text-gray-900 dark:hover:text-white"
                        )}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
                        <span className="truncate">{sec.title}</span>
                      </a>
                    );
                  })}
                </nav>
              </div>
            </motion.aside>

            {/* ── CUERPO DEL DOCUMENTO ──────────────────────────────────── */}
            <motion.article
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
              className="flex-1 space-y-8"
            >
              {/* Intro Container */}
              <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 rounded-3xl p-6 sm:p-8 shadow-sm">
                <p className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 leading-relaxed">
                  En QuHealthy nos esforzamos por ofrecer productos y servicios de la más alta calidad. Esta política detalla los lineamientos bajo los cuales se pueden realizar solicitudes de devoluciones o cambios de manera transparente y justa.
                </p>
              </div>

              {/* Sección 1: Política General */}
              <section id="intro" className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-3 scroll-mt-28">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                    <FileText className="w-4 h-4" strokeWidth={2} />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    1. Política General
                  </h2>
                </div>
                <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-300 leading-relaxed">
                  Toda compra realizada en nuestra plataforma está sujeta a las condiciones estipuladas en este documento. Es responsabilidad del usuario revisar estas políticas antes de finalizar su compra.
                </p>
              </section>

              {/* Sección 2: Devoluciones */}
              <section id="devoluciones" className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4 scroll-mt-28">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                    <AlertTriangle className="w-4 h-4" strokeWidth={2} />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    2. Política de Devoluciones
                  </h2>
                </div>

                <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-300 leading-relaxed">
                  Aceptamos devoluciones <strong className="text-gray-900 dark:text-white font-bold">única y exclusivamente para productos defectuosos</strong> o que presenten fallas de fábrica que impidan su correcto funcionamiento.
                </p>

                <ul className="space-y-2 pt-1 text-xs md:text-sm font-medium text-gray-600 dark:text-gray-300">
                  <li className="p-3 rounded-2xl bg-gray-50/50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800">
                    <strong className="text-gray-900 dark:text-white font-bold">Condiciones para la devolución:</strong> El producto debe reportarse dentro de los primeros 7 días naturales posteriores a su recepción.
                  </li>
                  <li className="p-3 rounded-2xl bg-gray-50/50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800">
                    <strong className="text-gray-900 dark:text-white font-bold">Estado del producto:</strong> Debe devolverse con sus empaques originales, manuales y accesorios.
                  </li>
                  <li className="p-3 rounded-2xl bg-gray-50/50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800">
                    <strong className="text-gray-900 dark:text-white font-bold">Excepciones:</strong> No se procesarán devoluciones por insatisfacción personal, errores en la compra por parte del usuario o productos que hayan sido utilizados de manera incorrecta.
                  </li>
                </ul>
              </section>

              {/* Sección 3: Cambios */}
              <section id="cambios" className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-3 scroll-mt-28">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
                    <XCircle className="w-4 h-4" strokeWidth={2} />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    3. Política de Cambios
                  </h2>
                </div>
                <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-300 leading-relaxed">
                  Actualmente <strong className="text-gray-900 dark:text-white font-bold">no se aceptan cambios</strong> de productos bajo ninguna circunstancia. Si usted recibe un producto defectuoso, el procedimiento aplicable será el de devolución (ver sección anterior).
                </p>
              </section>

              {/* Sección 4: Proceso de Devolución */}
              <section id="proceso" className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-3 scroll-mt-28">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                    <RefreshCcw className="w-4 h-4" strokeWidth={2} />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    4. Proceso de Devolución
                  </h2>
                </div>
                <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-300 leading-relaxed">
                  Si tu caso cumple con los requisitos de producto defectuoso, sigue estos pasos:
                </p>
                <ol className="list-decimal list-inside space-y-2 pt-1 text-xs md:text-sm font-medium text-gray-600 dark:text-gray-300">
                  <li>Envía un correo a <strong className="text-gray-900 dark:text-white font-bold">support@quhealthy.org</strong> con tu número de orden y evidencia fotográfica o en video del defecto.</li>
                  <li>Nuestro equipo de calidad revisará la solicitud en un plazo no mayor a 3 días hábiles.</li>
                  <li>Si la solicitud es aprobada, te enviaremos las instrucciones y la guía para el retorno del paquete.</li>
                  <li>Una vez recibido y validado el defecto en nuestras instalaciones, se procederá con el reembolso al método de pago original.</li>
                </ol>
              </section>

              {/* Footer Section */}
              <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-12">
                <p className="text-xs font-medium text-gray-500">
                  ¿Dudas sobre devoluciones?
                </p>
                <Link
                  href="/contact"
                  className="h-10 px-5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-xs font-bold shadow-sm flex items-center gap-2 shrink-0"
                >
                  <span>Contactar a Soporte</span>
                  <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
                </Link>
              </div>

            </motion.article>

          </div>
        </div>
      </section>

    </div>
  );
}
