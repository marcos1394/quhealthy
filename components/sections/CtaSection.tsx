"use client";

import React from "react";
import { motion } from "framer-motion";
import { Link } from "@/i18n/routing";
import { ArrowRight, CheckCircle2, Sparkles, ShieldCheck, HeartHandshake, Truck } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSessionStore } from "@/stores/SessionStore";
import { cn } from "@/lib/utils";

const CtaSection: React.FC = () => {
  const t = useTranslations('Cta');
  const { isAuthenticated, role } = useSessionStore();

  const benefits = [
    t('benefits.0'),
    t('benefits.1'),
    t('benefits.2')
  ];

  const getDashboardHref = () => {
    if (role === 'ROLE_PROVIDER' || role === 'ROLE_STAFF') return '/provider/dashboard';
    if (role === 'ROLE_FOUNDATION') return '/foundation/dashboard';
    if (role === 'ROLE_SUPPLIER') return '/supplier/dashboard';
    if (role === 'ROLE_ADMIN') return '/admin';
    return '/patient/dashboard';
  };

  const getDashboardLabel = () => {
    if (role === 'ROLE_PROVIDER' || role === 'ROLE_STAFF') return "Ir a Panel Médico";
    if (role === 'ROLE_FOUNDATION') return "Ir a Panel Institucional";
    if (role === 'ROLE_SUPPLIER') return "Ir a Panel Proveedor";
    if (role === 'ROLE_ADMIN') return "Ir a Panel Admin";
    return "Ir a Mi Salud";
  };

  return (
    <section className="py-20 md:py-28 bg-gray-50/50 dark:bg-[#050505] transition-colors duration-500 font-sans selection:bg-emerald-100 dark:selection:bg-emerald-950/30">
      <div className="container mx-auto px-6 md:px-12 xl:px-20 max-w-7xl">
        
        {/* ── CONTENEDOR HERO DE ALTO IMPACTO (CARD) ─────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative rounded-3xl bg-gray-900 dark:bg-[#0a0a0a] text-white p-8 sm:p-14 md:p-20 border border-gray-800 shadow-2xl overflow-hidden text-center max-w-5xl mx-auto space-y-8"
        >
          {/* Glowing Ambient Light Effect */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Badge de Entrada */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20 shadow-sm relative z-10">
            <Sparkles className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
            <span>Únete al Ecosistema QuHealthy</span>
          </div>

          {/* Headline Editorial */}
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.12] max-w-3xl mx-auto relative z-10">
            {t('title_start')}{" "}
            <span className="font-serif italic text-emerald-400 font-normal">
              {t('title_highlight')}
            </span>
          </h2>

          {/* Descripción */}
          <p className="text-xs sm:text-sm md:text-base text-gray-300 font-medium max-w-xl mx-auto leading-relaxed relative z-10">
            {t('description')}
          </p>

          {/* Beneficios Integrados en Pills */}
          <div className="flex flex-wrap justify-center items-center gap-2.5 sm:gap-3 relative z-10 pt-2">
            {benefits.map((benefit, idx) => (
              <div 
                key={idx} 
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-gray-200 backdrop-blur-md shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" strokeWidth={2.5} />
                <span>{benefit}</span>
              </div>
            ))}
          </div>

          {/* Botones de Acción / CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full sm:w-auto relative z-10 pt-4">
            <Link
              href={isAuthenticated ? getDashboardHref() : '/discover'}
              className="h-12 px-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 group w-full sm:w-auto cursor-pointer"
            >
              <span>{isAuthenticated ? getDashboardLabel() : "Buscar Médicos y Agendar Cita"}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" strokeWidth={2} />
            </Link>

            {!isAuthenticated && (
              <Link
                href="/provider/register"
                className="h-12 px-8 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs backdrop-blur-md border border-white/15 transition-all flex items-center justify-center w-full sm:w-auto cursor-pointer"
              >
                <span>Registrarme como Médico / Clínica</span>
              </Link>
            )}
          </div>

          {/* Opciones para Fundaciones y Proveedores */}
          {!isAuthenticated && (
            <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-xs text-gray-400 relative z-10">
              <span>{t('institutional_prompt', { defaultValue: "¿Representas una Fundación o Empresa de Insumos?" })}</span>
              <div className="flex items-center gap-2">
                <Link
                  href="/foundations"
                  className="font-bold text-rose-400 hover:text-rose-300 transition-colors underline underline-offset-4"
                >
                  {t('foundation_link', { defaultValue: "Solución para Fundaciones" })}
                </Link>
                <span>•</span>
                <Link
                  href="/suppliers"
                  className="font-bold text-blue-400 hover:text-blue-300 transition-colors underline underline-offset-4"
                >
                  {t('supplier_link', { defaultValue: "Canal para Proveedores" })}
                </Link>
              </div>
            </div>
          )}

          {/* Indicador de Confianza / Seguridad */}
          <div className="pt-8 border-t border-white/10 max-w-md mx-auto relative z-10">
            <p className="text-xs font-medium text-gray-400 flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" strokeWidth={2} />
              <span>{t('trust_indicator')}</span>
            </p>
          </div>

        </motion.div>

      </div>
    </section>
  );
};

export default CtaSection;