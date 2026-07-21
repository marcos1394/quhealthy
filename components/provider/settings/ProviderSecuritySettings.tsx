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
 ChevronRight,
 UserX
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

export function ProviderSecuritySettings() {
 const t = useTranslations('SettingsSecurity');

 // Configuración de las opciones de seguridad
 const securityOptions = [
 {
 id: "2fa",
 title: t('options.2fa.title'),
 description: t('options.2fa.desc'),
 icon: Smartphone,
 link: "/provider/dashboard/settings/security/2fa",
 status: t('options.2fa.status'),
 color: "text-black dark:text-white",
 bgHover: "group-hover:bg-black/5 dark:group-hover:bg-white/5"
 },
 {
 id: "password",
 title: t('options.password.title'),
 description: t('options.password.desc'),
 icon: Lock,
 link: "/provider/dashboard/settings/security/password",
 color: "text-black dark:text-white",
 bgHover: "group-hover:bg-black/5 dark:group-hover:bg-white/5"
 },
 {
 id: "login-alerts",
 title: t('options.alerts.title'),
 description: t('options.alerts.desc'),
 icon: Bell,
 link: "/provider/dashboard/settings/security/alerts",
 color: "text-black dark:text-white",
 bgHover: "group-hover:bg-black/5 dark:group-hover:bg-white/5"
 },
 {
 id: "devices",
 title: t('options.devices.title'),
 description: t('options.devices.desc'),
 icon: Laptop,
 link: "/provider/dashboard/settings/security/devices",
 color: "text-black dark:text-white",
 bgHover: "group-hover:bg-black/5 dark:group-hover:bg-white/5"
 },
 {
 id: "activity",
 title: t('options.activity.title'),
 description: t('options.activity.desc'),
 icon: Activity,
 link: "/provider/dashboard/settings/security/activity",
 color: "text-black dark:text-white",
 bgHover: "group-hover:bg-black/5 dark:group-hover:bg-white/5"
 },
 {
 id: "delete-account",
 title: "Eliminar Cuenta",
 description: "Borrar permanentemente tu cuenta y todos tus datos.",
 icon: UserX,
 link: "/provider/dashboard/settings/security/delete-account",
 color: "text-red-600 dark:text-red-400",
 bgHover: "group-hover:bg-red-500/10 dark:group-hover:bg-red-500/20"
 },
 ];

 return (
 <div className="min-h-screen bg-transparent p-4 md:p-8 font-sans">
 <div className="max-w-5xl mx-auto space-y-8">

 {/* Encabezado de la Sección */}
 <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4 mb-4">
 <div className="p-3 bg-black dark:bg-white rounded-none border border-black dark:border-white w-fit">
 <Shield className="w-8 h-8 text-white dark:text-black" />
 </div>
 <div>
 <h1 className="text-2xl font-bold uppercase tracking-tighter text-black dark:text-white">{t('title')}</h1>
 <p className="text-[10px] uppercase font-bold tracking-widest text-gray-500 dark:text-gray-400 mt-1">{t('subtitle')}</p>
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
 <Card className="h-full bg-transparent border-black/20 dark:border-white/20 rounded-none hover:border-black dark:hover:border-white transition-all duration-300 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] relative group-hover:-translate-y-1 overflow-hidden">
 <CardHeader className="pb-4">
 <div className="flex justify-between items-start mb-2">
 <div className={`p-3 border border-black/10 dark:border-white/10 transition-colors ${option.bgHover} ${option.color}`}>
 <Icon className="w-6 h-6" />
 </div>
 {option.status && (
 <Badge variant="outline" className="bg-black text-white dark:bg-white dark:text-black border-black dark:border-white rounded-none text-[9px] uppercase tracking-widest px-2 py-0.5">
 {option.status}
 </Badge>
 )}
 </div>
 <CardTitle className="text-lg font-bold uppercase tracking-tight text-black dark:text-white group-hover:underline transition-all mt-2">
 {option.title}
 </CardTitle>
 </CardHeader>
 <CardContent className="flex flex-col h-[calc(100%-88px)]">
 <CardDescription className="text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide leading-relaxed mb-4 flex-grow">
 {option.description}
 </CardDescription>

 <div className="flex items-center text-[10px] font-bold uppercase tracking-widest text-black/50 dark:text-white/50 group-hover:text-black dark:group-hover:text-white transition-colors mt-auto pt-4 border-t border-black/10 dark:border-white/10">
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