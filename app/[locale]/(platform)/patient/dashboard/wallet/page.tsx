"use client";

import React, { useEffect } from "react";
import { useTranslations } from "next-intl";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale"; // Tip: Ajustar dinámicamente según el locale del usuario
import { motion } from "framer-motion";
import { 
  WalletCards, 
  CalendarCheck, 
  Package, 
  MonitorPlay, 
  Loader2, 
  ShieldCheck,
  ShoppingBag,
  ArrowRight
} from "lucide-react";

import { useConsumerWallet } from "@/hooks/useConsumerWallet";
import { PackageCredit } from "@/types/packages";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QhSpinner } from '@/components/ui/QhSpinner';

export default function PatientWalletPage() {
  const t = useTranslations('PatientWallet');
  const { packages, isLoading, fetchWallet } = useConsumerWallet();

  useEffect(() => {
    fetchWallet(t('toast_load_error'));
  }, [fetchWallet, t]);

  // 🧠 Lógica Inteligente para renderizar cada tipo de ítem
  const getItemConfig = (credit: PackageCredit) => {
    // Si no viene el type del backend, intentamos inferirlo por el nombre
    const type = credit.itemType || 
                (credit.serviceName.toLowerCase().includes('curso') ? 'COURSE' : 
                 credit.serviceName.toLowerCase().includes('producto') ? 'PRODUCT' : 'SERVICE');

    switch (type) {
      case 'COURSE':
        return {
          icon: <MonitorPlay className="w-5 h-5 text-purple-500" />,
          btnText: t('btn_view_course'),
          btnVariant: "bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-500/10 dark:text-purple-400 dark:hover:bg-purple-500/20 border-purple-200 dark:border-purple-500/30",
          bgBadge: "bg-purple-100 dark:bg-purple-900/40"
        };
      case 'PRODUCT':
        return {
          icon: <Package className="w-5 h-5 text-emerald-500" />,
          btnText: t('btn_redeem_product'),
          btnVariant: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20 border-emerald-200 dark:border-emerald-500/30",
          bgBadge: "bg-emerald-100 dark:bg-emerald-900/40"
        };
      case 'SERVICE':
      default:
        return {
          icon: <CalendarCheck className="w-5 h-5 text-blue-500" />,
          btnText: t('btn_redeem_service'),
          btnVariant: "bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20 border-blue-200 dark:border-blue-500/30",
          bgBadge: "bg-blue-100 dark:bg-blue-900/40"
        };
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* 🟦 HEADER DE LA BILLETERA */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <WalletCards className="w-8 h-8 text-medical-600 dark:text-medical-500" />
          {t('title')}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
          {t('subtitle')}
        </p>
      </div>

      {/* ⏳ ESTADO DE CARGA */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <QhSpinner size="lg" />
          <p className="text-slate-500 dark:text-slate-400 font-medium">{t('loading')}</p>
        </div>
      ) : packages.length === 0 ? (
        
        <Card className="border-dashed border-2 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 shadow-none">
          <CardContent className="flex flex-col items-center justify-center py-24 text-center">
            <div className="p-4 bg-white dark:bg-slate-800 rounded-full shadow-sm mb-6 border border-slate-100 dark:border-slate-700">
              <ShoppingBag className="w-12 h-12 text-slate-300 dark:text-slate-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              {t('empty_state_title')}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mb-8">
              {t('empty_state_desc')}
            </p>
            <Button className="bg-medical-600 text-white hover:bg-medical-700 h-12 px-8 rounded-xl text-md font-bold shadow-md shadow-medical-500/20 transition-all hover:-translate-y-0.5">
              {t('btn_explore')} <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      ) : (

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {packages.map((pkg, index) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4, ease: "easeOut" }}
            >
              <Card className="h-full border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group flex flex-col bg-white dark:bg-slate-900 rounded-2xl">
                
                {/* Cabecera del Paquete */}
                <CardHeader className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/80 dark:to-slate-900 border-b border-slate-100 dark:border-slate-800 pb-5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-medical-500/5 rounded-bl-full -z-0" />
                  
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-3">
                      <Badge className="bg-medical-100 text-medical-700 dark:bg-medical-500/20 dark:text-medical-400 border-medical-200 dark:border-medical-500/30 px-3 py-1">
                        <WalletCards className="w-3.5 h-3.5 mr-1.5" />
                        {t('badge_active')}
                      </Badge>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight mb-2">
                      {pkg.servicePackage.name}
                    </h3>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-sm mt-3">
                      <div className="flex items-center text-slate-600 dark:text-slate-300">
                        <ShieldCheck className="w-4 h-4 mr-1.5 text-medical-500" />
                        <span className="opacity-80 mr-1">{t('provider_label')}</span> 
                        <span className="font-semibold">{pkg.provider.name}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-slate-400 dark:text-slate-500 mt-4 font-medium flex items-center">
                    {t('purchased_on')} <strong className="ml-1 text-slate-500 dark:text-slate-400">{format(parseISO(pkg.purchaseDate), "d 'de' MMMM, yyyy", { locale: es })}</strong>
                  </div>
                </CardHeader>
                
                {/* Contenido (Créditos Híbridos) */}
                <CardContent className="p-6 flex-1 flex flex-col bg-slate-50/30 dark:bg-slate-900/50">
                  <p className="text-sm font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-wider opacity-80">
                    {t('credits_title')}
                  </p>
                  
                  <div className="space-y-3 flex-1">
                    {pkg.creditsRemaining.map((credit, idx) => {
                      const isExhausted = credit.quantity === 0;
                      const config = getItemConfig(credit);
                      
                      return (
                        <div 
                          key={`${pkg.id}-credit-${idx}`} 
                          className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${
                            isExhausted 
                              ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800/80 opacity-60 grayscale-[0.5]' 
                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm hover:border-slate-300 dark:hover:border-slate-600'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl flex-shrink-0 ${isExhausted ? 'bg-slate-200 dark:bg-slate-700' : config.bgBadge}`}>
                              {config.icon}
                            </div>
                            <div>
                              <p className={`text-base font-bold leading-tight ${isExhausted ? 'text-slate-500 line-through' : 'text-slate-900 dark:text-white'}`}>
                                {credit.serviceName}
                              </p>
                              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
                                {isExhausted 
                                  ? t('consumed_all') 
                                  : t('available', { remaining: credit.quantity, total: credit.totalQuantity })
                                }
                              </p>
                            </div>
                          </div>
                          
                          {/* Botón de Acción Dinámico */}
                          {!isExhausted && (
                            <Button 
                              variant="outline" 
                              className={`ml-4 h-10 px-4 font-bold border rounded-lg transition-colors shrink-0 ${config.btnVariant}`}
                              onClick={() => {
                                // Aquí conectarías la acción real según el tipo de ítem
                                console.log(`Canjear: ${credit.serviceId} de tipo ${credit.itemType}`);
                              }}
                            >
                              {config.btnText}
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}