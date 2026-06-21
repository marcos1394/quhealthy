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
      <Card className="bg-white dark:bg-[#0a0a0a] border-2 border-black dark:border-white rounded-none shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center space-x-5 animate-pulse">
            <div className="h-12 w-12 border-2 border-black dark:border-white bg-gray-200 dark:bg-gray-800" />
            <div className="space-y-3 flex-1">
              <div className="h-4 w-52 bg-black dark:bg-white" />
              <div className="h-3 w-80 bg-gray-300 dark:bg-gray-700" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isReady = status?.ready === true;
  const isPending = status?.status === "PENDING" || (status && !status.ready);
  const isNotConnected = !status || status.status === "NOT_CREATED";

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card className={cn(
        "overflow-hidden shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] border-2 rounded-none transition-all duration-300 group hover:shadow-[6px_6px_0_0_#000] dark:hover:shadow-[6px_6px_0_0_#fff]",
        "bg-white dark:bg-[#0a0a0a]",
        isReady ? "border-black dark:border-white" :
          isPending ? "border-black dark:border-white" :
            "border-black dark:border-white"
      )}>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex items-start gap-5 flex-1">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }} className="flex-shrink-0">
                {isReady ? (
                  <div className="flex h-12 w-12 items-center justify-center border-2 border-black dark:border-white bg-black dark:bg-white">
                    <CheckCircle2 className="h-6 w-6 text-white dark:text-black" strokeWidth={2} />
                  </div>
                ) : isPending ? (
                  <div className="flex h-12 w-12 items-center justify-center border-2 border-black dark:border-white bg-white text-black dark:bg-[#0a0a0a] dark:text-white">
                    <AlertTriangle className="h-6 w-6" strokeWidth={2} />
                  </div>
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center border-2 border-black dark:border-white bg-white text-black dark:bg-[#0a0a0a] dark:text-white">
                    <AlertCircle className="h-6 w-6" strokeWidth={2} />
                  </div>
                )}
              </motion.div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <h3 className="text-xl font-serif font-bold uppercase tracking-wide text-black dark:text-white">{t('title')}</h3>
                  {isReady ? (
                    <Badge className="bg-black text-white dark:bg-white dark:text-black border-2 border-black dark:border-white rounded-none px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest"><CheckCircle2 className="w-3 h-3 mr-1.5" strokeWidth={2} />{t('badge_active')}</Badge>
                  ) : isPending ? (
                    <Badge className="bg-white text-black dark:bg-[#0a0a0a] dark:text-white border-2 border-black dark:border-white rounded-none px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest animate-pulse"><AlertTriangle className="w-3 h-3 mr-1.5" strokeWidth={2} />{t('badge_pending', { defaultValue: 'ACCIÓN REQUERIDA' })}</Badge>
                  ) : (
                    <Badge className="bg-white text-gray-500 dark:bg-[#0a0a0a] border-2 border-gray-300 dark:border-gray-700 rounded-none px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest">{t('badge_inactive')}</Badge>
                  )}
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed max-w-xl font-medium">
                  {isReady
                    ? t('active_desc')
                    : isPending
                      ? t('pending_desc', { defaultValue: 'Stripe requiere más información (como tu identificación o cuenta CLABE) para habilitar los depósitos a tu cuenta bancaria.' })
                      : t('not_configured_desc')}
                </p>

                {isPending && status && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className={cn("text-[10px] uppercase font-bold tracking-widest px-3 py-1 border-2 rounded-none",
                      status.charges_enabled ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white"
                        : "bg-white text-black border-black dark:bg-[#0a0a0a] dark:text-white dark:border-white")}>
                      COBROS: {status.charges_enabled ? "HABILITADOS" : "PENDIENTES"}
                    </span>
                    <span className={cn("text-[10px] uppercase font-bold tracking-widest px-3 py-1 border-2 rounded-none",
                      status.payouts_enabled ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white"
                        : "bg-white text-black border-black dark:bg-[#0a0a0a] dark:text-white dark:border-white")}>
                      DEPÓSITOS: {status.payouts_enabled ? "HABILITADOS" : "REQUIERE ACCIÓN"}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex-shrink-0 pt-2 lg:pt-0">
              <Button onClick={handleOnboarding} disabled={isRedirecting}
                className={cn("w-full lg:w-auto h-12 px-6 font-bold text-[10px] uppercase tracking-widest shadow-[2px_2px_0_0_#000] dark:shadow-[2px_2px_0_0_#fff] border-2 border-black dark:border-white rounded-none transition-colors",
                  isReady
                    ? "bg-white text-black hover:bg-gray-100 dark:bg-[#0a0a0a] dark:text-white dark:hover:bg-gray-900"
                    : isPending
                      ? "bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                      : "bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                )}>
                {isRedirecting ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t('processing', { defaultValue: 'PROCESANDO...' })}</>
                ) : isReady ? (
                  <>{t('manage')}<ExternalLink className="ml-2 h-4 w-4" strokeWidth={2} /></>
                ) : isPending ? (
                  <><AlertTriangle className="mr-2 h-4 w-4" strokeWidth={2} />{t('complete_setup', { defaultValue: 'COMPLETAR REGISTRO' })}</>
                ) : (
                  <><CreditCard className="mr-2 h-4 w-4" strokeWidth={2} />{t('connect_stripe')}</>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
        {!isReady && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-gray-50 dark:bg-[#111] px-6 py-4 border-t-2 border-black dark:border-white">
            <div className="flex items-center justify-center lg:justify-start gap-3">
              <div className="p-1 border-2 border-black dark:border-white bg-white dark:bg-[#0a0a0a]">
                <Shield className="h-3 w-3 text-black dark:text-white" strokeWidth={2} />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
                {t('security_footer')}
              </p>
            </div>
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
}