"use client";

import { useStripeConnect } from "@/hooks/useStripeConnect";
import { CreditCard, CheckCircle2, AlertCircle, ExternalLink, Loader2, Shield, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function StripeConnectCard() {
  const { status, isLoadingStatus, isRedirecting, handleOnboarding } = useStripeConnect();

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
  const isPending = status?.status === "PENDING";

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card className={cn(
        "overflow-hidden shadow-sm border transition-all duration-300",
        "bg-white dark:bg-slate-900",
        isReady ? "border-emerald-200 dark:border-emerald-500/20" : "border-slate-200 dark:border-slate-800 hover:border-medical-200 dark:hover:border-medical-500/20"
      )}>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex items-start gap-4 flex-1">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }} className="flex-shrink-0">
                {isReady ? (
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20">
                    <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-medical-50 dark:bg-medical-500/10 border border-medical-200 dark:border-medical-500/20">
                    <AlertCircle className="h-6 w-6 text-medical-600 dark:text-medical-400" />
                  </div>
                )}
              </motion.div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5 mb-2">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Payments & Transfers</h3>
                  {isReady ? (
                    <Badge className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0"><CheckCircle2 className="w-2.5 h-2.5 mr-1" />Active</Badge>
                  ) : isPending ? (
                    <Badge className="bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-0"><Sparkles className="w-2.5 h-2.5 mr-1" />Verification Pending</Badge>
                  ) : (
                    <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-500 border-0">Not Configured</Badge>
                  )}
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl font-light">
                  {isReady
                    ? "Your bank account is linked correctly. You're ready to receive payments from your consultations directly to your account."
                    : "To charge for your services, you need to link a bank account and verify your identity securely."}
                </p>
                {isPending && status && (
                  <div className="flex gap-2 mt-3">
                    <span className={cn("text-[10px] px-2 py-0.5 rounded-md border font-medium",
                      status.charges_enabled ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                        : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500")}>
                      Charges: {status.charges_enabled ? "Enabled" : "Pending"}
                    </span>
                    <span className={cn("text-[10px] px-2 py-0.5 rounded-md border font-medium",
                      status.payouts_enabled ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                        : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500")}>
                      Deposits: {status.payouts_enabled ? "Enabled" : "Pending"}
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
                    : "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100"
                )}>
                {isRedirecting ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processing...</>)
                  : isReady ? (<>Manage in Stripe<ExternalLink className="ml-2 h-4 w-4 text-slate-400" /></>)
                    : (<><CreditCard className="mr-2 h-4 w-4" />Link Bank Account</>)}
              </Button>
            </div>
          </div>
        </CardContent>
        {!isReady && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-slate-50 dark:bg-slate-800/30 px-6 py-3.5 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-center lg:justify-start gap-2">
              <div className="p-1 bg-medical-50 dark:bg-medical-500/10 rounded-md"><Shield className="h-3 w-3 text-medical-600 dark:text-medical-400" /></div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-light">Your data is protected and encrypted by Stripe Connect</p>
            </div>
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
}