"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  AlertTriangle, 
  Crown, 
  ArrowRight, 
  X, 
  CheckCircle2, 
  Sparkles,
  Info,
  Clock,
  ChevronRight,
  ShieldAlert
} from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { PlanInfo } from "@/types/dashboard";
import { CurrentSubscription, subscriptionService } from "@/services/subscription.service";

interface ExpiredPlanNoticeBannerProps {
  plan?: PlanInfo;
  className?: string;
}

export const ExpiredPlanNoticeBanner: React.FC<ExpiredPlanNoticeBannerProps> = ({
  plan,
  className = "",
}) => {
  const t = useTranslations("DashboardProviderHome.ExpiredPlanNotice");
  const locale = useLocale();
  const router = useRouter();
  const [isDismissed, setIsDismissed] = useState(false);
  const [subscription, setSubscription] = useState<CurrentSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    // Check if dismissed in current session
    const dismissed = sessionStorage.getItem("qh_expired_plan_banner_dismissed");
    if (dismissed === "true") {
      setIsDismissed(true);
    }

    subscriptionService
      .getCurrentSubscription()
      .then((sub) => {
        setSubscription(sub);
      })
      .catch(() => {
        setSubscription(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem("qh_expired_plan_banner_dismissed", "true");
  };

  // Determinar si el plan está vencido o en modo gratuito
  const isExpired = 
    plan?.status === "EXPIRED" ||
    (plan?.daysLeft !== undefined && plan.daysLeft <= 0) ||
    subscription?.status === "CANCELED" ||
    subscription?.status === "PAST_DUE" ||
    subscription?.gateway === "FREE" ||
    (!loading && !subscription && (!plan || plan.name.toLowerCase().includes("free") || plan.name.toLowerCase().includes("gratis") || plan.name.toLowerCase().includes("gratuito")));

  if (isDismissed || loading || !isExpired) {
    return null;
  }

  const freeLimitations = [
    t("limit_ai_scribe", { defaultValue: "Cuotas mensuales limitadas de Copiloto IA (AI Scribe SOAP)" }),
    t("limit_storage", { defaultValue: "Almacenamiento estándar para expedientes y estudios clínicos" }),
    t("limit_marketing", { defaultValue: "Herramientas de marketing y catálogo de productos esenciales" }),
    t("limit_telemedicine", { defaultValue: "Teleconsulta HD estándar sin traducción simultánea avanzada" }),
  ];

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className={cn(
          "relative overflow-hidden rounded-3xl border border-amber-200/90 dark:border-amber-900/50 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-orange-500/10 dark:from-amber-950/40 dark:via-[#0c0c0c] dark:to-orange-950/30 p-5 sm:p-6 shadow-sm font-sans",
          className
        )}
      >
        {/* Glow sutil */}
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          {/* Lado Izquierdo: Icono y Mensaje Informativo */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center shrink-0 shadow-xs mt-0.5">
              <ShieldAlert className="w-6 h-6 animate-pulse" strokeWidth={2} />
            </div>

            <div className="space-y-1.5 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-200/70 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200 border border-amber-300/60 dark:border-amber-800/80 uppercase tracking-wider">
                  {t("badge_free_tier", { defaultValue: "Plan Gratuito Activo" })}
                </span>
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                  {t("plan_expired_notice", { defaultValue: "Tu suscripción previa ha concluido" })}
                </span>
              </div>

              <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                {t("headline", { defaultValue: "Tu cuenta está operando con las funcionalidades del Plan Gratuito" })}
              </h2>

              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 leading-relaxed">
                {t("body_text", { defaultValue: "Tu acceso a consultas, agenda médica y expedientes sigue activo para no interrumpir tu atención médica. Considera que algunas capacidades avanzadas de IA y almacenamiento tienen límites mensuales." })}
              </p>

              {/* Botón para ver limitaciones */}
              <button
                type="button"
                onClick={() => setShowDetailsModal(true)}
                className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 hover:underline pt-1 cursor-pointer"
              >
                <Info className="w-3.5 h-3.5" />
                <span>{t("see_free_limitations", { defaultValue: "Conocer las limitaciones del Plan Gratuito" })}</span>
              </button>
            </div>
          </div>

          {/* Lado Derecho: Acciones y Botón de Descarte */}
          <div className="flex items-center gap-3 shrink-0 self-end lg:self-center">
            <button
              type="button"
              onClick={() => router.push(`/${locale}/provider/dashboard/settings#subscription`)}
              className="h-11 px-5 rounded-2xl bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer group"
            >
              <Crown className="w-4 h-4" />
              <span>{t("reactivate_plan_btn", { defaultValue: "Ver Planes y Reactivar" })}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              type="button"
              onClick={handleDismiss}
              title={t("dismiss", { defaultValue: "Ocultar aviso por esta sesión" })}
              className="w-10 h-10 rounded-2xl bg-white/80 dark:bg-[#111] border border-amber-200 dark:border-amber-900/50 text-gray-500 hover:text-gray-800 dark:hover:text-white transition-all flex items-center justify-center shrink-0 cursor-pointer shadow-2xs"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

        </div>
      </motion.div>

      {/* ── MODAL INFORMATIVO DE LIMITACIONES DEL PLAN GRATUITO ─────────── */}
      <AnimatePresence>
        {showDetailsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-100 dark:border-gray-800 p-6 sm:p-8 shadow-2xl space-y-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 flex items-center justify-center">
                    <Info className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">
                      {t("modal_title", { defaultValue: "Consideraciones del Plan Gratuito" })}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {t("modal_subtitle", { defaultValue: "Tu servicio médico continúa operando con las siguientes condiciones:" })}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowDetailsModal(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Lista de Limitaciones */}
              <div className="space-y-3">
                {freeLimitations.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#111] border border-gray-100 dark:border-gray-800 flex items-start gap-3"
                  >
                    <div className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                      !
                    </div>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 leading-relaxed">
                      {item}
                    </span>
                  </div>
                ))}
              </div>

              {/* Lo que SÍ puedes seguir haciendo */}
              <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 space-y-2">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{t("allowed_title", { defaultValue: "Lo que SIEMPRE tendrás activo sin costo:" })}</span>
                </div>
                <p className="text-[11px] text-emerald-700/90 dark:text-emerald-400 leading-relaxed font-medium">
                  {t("allowed_desc", { defaultValue: "Gestión de agenda, creación y consulta de expedientes clínicos electrónicos (NOM-004), cobro de citas y emisión de recetas médicas oficiales." })}
                </p>
              </div>

              {/* Botones de acción del Modal */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDetailsModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#151515] cursor-pointer"
                >
                  {t("close", { defaultValue: "Entendido" })}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowDetailsModal(false);
                    router.push(`/${locale}/provider/dashboard/settings#subscription`);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  <Crown className="w-3.5 h-3.5" />
                  <span>{t("upgrade_btn_modal", { defaultValue: "Explorar Planes de Paga" })}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
