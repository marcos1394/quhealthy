"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Lock,
  Shield,
  Laptop,
  Activity,
  Bell,
  Smartphone,
  ChevronRight
} from "lucide-react";
import { useTranslations } from "next-intl";

// ShadCN UI
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function SecuritySettingsPage() {
  const t = useTranslations('SettingsSecurity');

  // Configuración de las opciones de seguridad
  const securityOptions = [
    {
      id: "2fa",
      title: t('options.2fa.title'),
      description: t('options.2fa.desc'),
      icon: Smartphone,
      link: "security/2fa",
      status: t('options.2fa.status'),
      color: "text-medical-600 dark:text-medical-400",
      bgHover: "group-hover:bg-medical-50 dark:group-hover:bg-medical-500/10"
    },
    {
      id: "password",
      title: t('options.password.title'),
      description: t('options.password.desc'),
      icon: Lock,
      link: "security/password",
      color: "text-blue-600 dark:text-blue-400",
      bgHover: "group-hover:bg-blue-50 dark:group-hover:bg-blue-500/10"
    },
    {
      id: "login-alerts",
      title: t('options.alerts.title'),
      description: t('options.alerts.desc'),
      icon: Bell,
      link: "security/alerts",
      color: "text-amber-600 dark:text-amber-400",
      bgHover: "group-hover:bg-amber-50 dark:group-hover:bg-amber-500/10"
    },
    {
      id: "devices",
      title: t('options.devices.title'),
      description: t('options.devices.desc'),
      icon: Laptop,
      link: "security/devices",
      color: "text-emerald-600 dark:text-emerald-400",
      bgHover: "group-hover:bg-emerald-50 dark:group-hover:bg-emerald-500/10"
    },
    {
      id: "activity",
      title: t('options.activity.title'),
      description: t('options.activity.desc'),
      icon: Activity,
      link: "security/activity",
      color: "text-purple-600 dark:text-purple-400",
      bgHover: "group-hover:bg-purple-50 dark:group-hover:bg-purple-500/10"
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 font-sans selection:bg-medical-500/30">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Encabezado de la Sección */}
        <div className="flex items-center space-x-4 mb-4">
          <div className="p-3 bg-medical-50 dark:bg-medical-500/10 rounded-xl border border-medical-100 dark:border-medical-500/20 shadow-sm">
            <Shield className="w-8 h-8 text-medical-600 dark:text-medical-400" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{t('title')}</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">{t('subtitle')}</p>
          </div>
        </div>

        {/* Grid de Opciones */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {securityOptions.map((option) => {
            const Icon = option.icon;

            return (
              <Link key={option.id} href={option.link} className="block group h-full">
                <motion.div variants={itemVariants} className="h-full">
                  <Card className="h-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-medical-300 dark:hover:border-medical-500/50 transition-all duration-300 hover:shadow-md hover:-translate-y-1 overflow-hidden relative">
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className={`p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 transition-colors ${option.bgHover} ${option.color}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        {option.status && (
                          <Badge variant="outline" className="bg-medical-50 text-medical-700 border-medical-200 dark:bg-medical-500/10 dark:text-medical-300 dark:border-medical-500/20 text-[10px] font-medium px-2 py-0.5">
                            {option.status}
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-medical-600 dark:group-hover:text-medical-400 transition-colors mt-2">
                        {option.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col h-[calc(100%-88px)]">
                      <CardDescription className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-4 flex-grow">
                        {option.description}
                      </CardDescription>

                      <div className="flex items-center text-sm font-semibold text-slate-400 dark:text-slate-500 group-hover:text-medical-600 dark:group-hover:text-medical-400 transition-colors mt-auto pt-4 border-t border-slate-100 dark:border-slate-800/50">
                        {t('configure')} <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </Link>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}