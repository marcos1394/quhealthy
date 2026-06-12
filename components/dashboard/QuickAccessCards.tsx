"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Clock, User, ArrowRight, Wallet, Package, Star, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';

export function QuickAccessCards() {
  const router = useRouter();
  const t = useTranslations('PatientDashboard');

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
    show: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  // Definición de las tarjetas para el Bento Grid
  const cards = [
    {
      id: 'history',
      title: t('card_history', { defaultValue: 'Historial Médico' }),
      desc: t('card_history_desc', { defaultValue: 'Diagnósticos, recetas y laboratorios.' }),
      icon: Clock,
      href: '/patient/dashboard/appointments', // TODO: update routes later
      colorClass: 'text-medical-500',
      bgClass: 'bg-medical-50 dark:bg-medical-500/10',
      colSpan: 'col-span-1 md:col-span-2 lg:col-span-1',
    },
    {
      id: 'wallet',
      title: t('card_wallet', { defaultValue: 'Mi Billetera' }),
      desc: t('card_wallet_desc', { defaultValue: 'Saldo, recargas y movimientos.' }),
      icon: Wallet,
      href: '/patient/wallet',
      colorClass: 'text-emerald-500',
      bgClass: 'bg-emerald-50 dark:bg-emerald-500/10',
      colSpan: 'col-span-1',
    },
    {
      id: 'packages',
      title: t('card_packages', { defaultValue: 'Paquetes y Suscripciones' }),
      desc: t('card_packages_desc', { defaultValue: 'Consultas prepagadas activas.' }),
      icon: Package,
      href: '/patient/packages',
      colorClass: 'text-purple-500',
      bgClass: 'bg-purple-50 dark:bg-purple-500/10',
      colSpan: 'col-span-1 md:col-span-2 lg:col-span-1',
    },
    {
      id: 'orders',
      title: t('card_orders', { defaultValue: 'Mis Pedidos' }),
      desc: t('card_orders_desc', { defaultValue: 'Seguimiento de farmacia.' }),
      icon: ShoppingBag,
      href: '/patient/orders',
      colorClass: 'text-amber-500',
      bgClass: 'bg-amber-50 dark:bg-amber-500/10',
      colSpan: 'col-span-1',
    },
    {
      id: 'reviews',
      title: t('card_reviews', { defaultValue: 'Mis Reseñas' }),
      desc: t('card_reviews_desc', { defaultValue: 'Tus evaluaciones médicas.' }),
      icon: Star,
      href: '/patient/reviews',
      colorClass: 'text-yellow-500',
      bgClass: 'bg-yellow-50 dark:bg-yellow-500/10',
      colSpan: 'col-span-1',
    },
    {
      id: 'profile',
      title: t('card_profile', { defaultValue: 'Mi Expediente' }),
      desc: t('card_profile_desc', { defaultValue: 'Gestiona tu información personal.' }),
      icon: User,
      href: '/patient/profile',
      colorClass: 'text-blue-500',
      bgClass: 'bg-blue-50 dark:bg-blue-500/10',
      colSpan: 'col-span-1 md:col-span-2 lg:col-span-1',
    }
  ];

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6"
    >
      {cards.map((card) => (
        <motion.div
          key={card.id}
          variants={itemVariants}
          onClick={() => router.push(card.href)}
          className={`relative group cursor-pointer overflow-hidden rounded-[2rem] bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 p-6 shadow-sm hover:shadow-xl transition-all duration-300 ${card.colSpan}`}
        >
          {/* Glassmorphism Highlight Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent dark:from-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          
          <div className="flex flex-col h-full justify-between relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-2xl ${card.bgClass} transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3`}>
                <card.icon className={`w-6 h-6 ${card.colorClass}`} />
              </div>
              <ArrowRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-slate-900 dark:group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300" />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white tracking-tight mb-1">
                {card.title}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-light leading-relaxed">
                {card.desc}
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}