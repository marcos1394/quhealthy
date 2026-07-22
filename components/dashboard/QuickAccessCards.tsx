"use client"
/* eslint-disable react-doctor/click-events-have-key-events */

import React from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Clock, User, ArrowRight, Wallet, Package, Star, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';

export function QuickAccessCards() {
 const router = useRouter();
 const t = useTranslations('PatientDashboard');

 // Definición de módulos de acceso con semántica Soft Health
 const cards = [
 {
 id: 'history',
 title: t('card_history', { defaultValue: 'Historial Clínico' }),
 desc: t('card_history_desc', { defaultValue: 'Diagnósticos, recetas y laboratorios.' }),
 icon: Clock,
 href: '/patient/dashboard/appointments',
 colorClass: 'text-teal-600 dark:text-teal-400',
 bgClass: 'bg-teal-50 dark:bg-teal-500/10'
 },
 {
 id: 'wallet',
 title: t('card_wallet', { defaultValue: 'Billetera Digital' }),
 desc: t('card_wallet_desc', { defaultValue: 'Saldo, recargas y transacciones.' }),
 icon: Wallet,
 href: '/patient/dashboard/wallet',
 colorClass: 'text-amber-600 dark:text-amber-400',
 bgClass: 'bg-amber-50 dark:bg-amber-500/10'
 },
 {
 id: 'packages',
 title: t('card_packages', { defaultValue: 'Suscripciones' }),
 desc: t('card_packages_desc', { defaultValue: 'Consultas y paquetes prepagados.' }),
 icon: Package,
 href: '/patient/dashboard/packages',
 colorClass: 'text-emerald-600 dark:text-emerald-400',
 bgClass: 'bg-emerald-50 dark:bg-emerald-500/10'
 },
 {
 id: 'orders',
 title: t('card_orders', { defaultValue: 'Logística / Pedidos' }),
 desc: t('card_orders_desc', { defaultValue: 'Seguimiento de farmacia e insumos.' }),
 icon: ShoppingBag,
 href: '/patient/dashboard/orders',
 colorClass: 'text-indigo-600 dark:text-indigo-400',
 bgClass: 'bg-indigo-50 dark:bg-indigo-500/10'
 },
 {
 id: 'reviews',
 title: t('card_reviews', { defaultValue: 'Evaluaciones' }),
 desc: t('card_reviews_desc', { defaultValue: 'Auditoría de servicios médicos.' }),
 icon: Star,
 href: '/patient/dashboard/reviews',
 colorClass: 'text-yellow-600 dark:text-yellow-400',
 bgClass: 'bg-yellow-50 dark:bg-yellow-500/10'
 },
 {
 id: 'profile',
 title: t('card_profile', { defaultValue: 'Expediente Base' }),
 desc: t('card_profile_desc', { defaultValue: 'Identidad, demografía y vitales.' }),
 icon: User,
 href: '/patient/dashboard/profile',
 colorClass: 'text-blue-600 dark:text-blue-400',
 bgClass: 'bg-blue-50 dark:bg-blue-500/10'
 }
 ];

 return (
 <div className="w-full">
 <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 px-1">
 Accesos a Módulos
 </h3>
 
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {cards.map((card) => (
 <div
 key={card.id}
 onClick={() => router.push(card.href)}
 className="group cursor-pointer rounded-3xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-8 flex flex-col justify-between min-h-[220px] shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1"
 >
 <div className="flex items-start justify-between mb-8">
 <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-colors duration-300", card.bgClass, card.colorClass)}>
 <card.icon className="w-6 h-6" strokeWidth={2} />
 </div>
 
 <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-50 dark:bg-gray-800/50 group-hover:bg-gray-100 dark:group-hover:bg-gray-800 transition-colors">
 <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" strokeWidth={2} />
 </div>
 </div>
 
 <div>
 <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
 {card.title}
 </h3>
 
 <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
 {card.desc}
 </p>
 </div>
 </div>
 ))}
 </div>
 </div>
 );
}