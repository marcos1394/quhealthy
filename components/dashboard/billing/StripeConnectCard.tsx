"use client";

import { useStripeConnect } from "@/hooks/useStripeConnect";
import { CreditCard, CheckCircle2, AlertCircle, ExternalLink, Loader2, Shield, Sparkles, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

export default function StripeConnectCard() {
  const { status, isLoadingStatus, isRedirecting, handleOnboarding } = useStripeConnect();
  const t = useTranslations('DashboardStripeConnect');

  if (isLoadingStatus && !status) {
    return (
      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <CardContent className="p-6">
          <div className="flex items-center space-x-5 animate-pulse">
            <div className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-slate-800" />
            <div className="space-y-2.5 flex-1">
              <div className="h-4 w-52 rounded-lg bg-slate-100 dark:bg-slate-800" />
              <div className="h-3 w-80 rounded-lg bg-slate-100 dark:bg-slate-800" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isReady = status?.ready === true;
  const isPending = status?.status === "PENDING" || (status && !status.ready);
  const isNotConnected = !status || status.status === "NOT_CONNECTED";

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card className={cn(
        "overflow-hidden shadow-sm border transition-all duration-300",
        "bg-white dark:bg-slate-900",
        isReady ? "border-emerald-200 dark:border-emerald-500/20" :
          isPending ? "border-amber-200 dark:border-amber-500/20" :
            "border-slate-200 dark:border-slate-800 hover:border-medical-200 dark:hover:border-medical-500/20"
      )}>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex items-start gap-4 flex-1">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }} className="flex-shrink-0">
                {isReady ? (
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20">
                    <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                ) : isPending ? (
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
                    <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                  </div>
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-medical-50 dark:bg-medical-500/10 border border-medical-200 dark:border-medical-500/20">
                    <AlertCircle className="h-6 w-6 text-medical-600 dark:text-medical-400" />
                  </div>
                )}
              </motion.div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5 mb-2">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{t('title')}</h3>
                  {isReady ? (
                    <Badge className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0"><CheckCircle2 className="w-2.5 h-2.5 mr-1" />{t('badge_active')}</Badge>
                  ) : isPending ? (
                    <Badge className="bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-0"><AlertTriangle className="w-2.5 h-2.5 mr-1" />{t('badge_pending', { defaultValue: 'Acción Requerida' })}</Badge>
                  ) : (
                    <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-500 border-0">{t('badge_inactive')}</Badge>
                  )}
                </div>
                
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl font-light">
                  {isReady
                    ? t('active_desc')
                    : isPending
                      ? t('pending_desc', { defaultValue: 'Stripe requiere más información (como tu identificación o cuenta CLABE) para habilitar los depósitos a tu cuenta bancaria.' })
                      : t('not_configured_desc')}
                </p>

                {isPending && status && (
                  <div className="flex gap-2 mt-3">
                    <span className={cn("text-[10px] px-2 py-0.5 rounded-md border font-medium",
                      status.charges_enabled ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                        : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500")}>
                      Cobros: {status.charges_enabled ? "Habilitados" : "Pendientes"}
                    </span>
                    <span className={cn("text-[10px] px-2 py-0.5 rounded-md border font-medium",
                      status.payouts_enabled ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                        : "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 text-amber-600 dark:text-amber-400")}>
                      Depósitos: {status.payouts_enabled ? "Habilitados" : "Requiere Acción"}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex-shrink-0 pt-1 lg:pt-0">
              <Button onClick={handleOnboarding} disabled={isRedirecting} size="lg"
                className={cn("w-full lg:w-auto h-11 px-6 font-semibold shadow-none transition-all rounded-xl",
                  isReady
                    ? "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-white border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700"
                    : isPending
                      ? "bg-amber-500 hover:bg-amber-600 text-white border border-amber-600"
                      : "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100"
                )}>
                {isRedirecting ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t('processing', { defaultValue: 'Procesando...' })}</>
                ) : isReady ? (
                  <>{t('manage')}<ExternalLink className="ml-2 h-4 w-4 text-slate-400" /></>
                ) : isPending ? (
                  <><AlertTriangle className="mr-2 h-4 w-4" />{t('complete_setup', { defaultValue: 'Completar Registro' })}</>
                ) : (
                  <><CreditCard className="mr-2 h-4 w-4" />{t('connect_stripe')}</>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
        {!isReady && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-slate-50 dark:bg-slate-800/30 px-6 py-3.5 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-center lg:justify-start gap-2">
              <div className="p-1 bg-medical-50 dark:bg-medical-500/10 rounded-md"><Shield className="h-3 w-3 text-medical-600 dark:text-medical-400" /></div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-light">{t('security_footer')}</p>
            </div>
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
}