"use client"
/* eslint-disable react-doctor/click-events-have-key-events */;

import React from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Clock, User, ArrowRight, Wallet, Package, Star, ShoppingBag } from 'lucide-react';

export function QuickAccessCards() {
  const router = useRouter();
  const t = useTranslations('PatientDashboard');

  // Definición de módulos de acceso (Iconos y estéticas puramente monocromáticas)
  const cards = [
    {
      id: 'history',
      title: t('card_history', { defaultValue: 'Historial Clínico' }),
      desc: t('card_history_desc', { defaultValue: 'Diagnósticos, recetas y laboratorios.' }),
      icon: Clock,
      href: '/patient/dashboard/appointments',
    },
    {
      id: 'wallet',
      title: t('card_wallet', { defaultValue: 'Billetera Digital' }),
      desc: t('card_wallet_desc', { defaultValue: 'Saldo, recargas y transacciones.' }),
      icon: Wallet,
      href: '/patient/dashboard/wallet',
    },
    {
      id: 'packages',
      title: t('card_packages', { defaultValue: 'Suscripciones' }),
      desc: t('card_packages_desc', { defaultValue: 'Consultas y paquetes prepagados.' }),
      icon: Package,
      href: '/patient/dashboard/packages',
    },
    {
      id: 'orders',
      title: t('card_orders', { defaultValue: 'Logística / Pedidos' }),
      desc: t('card_orders_desc', { defaultValue: 'Seguimiento de farmacia e insumos.' }),
      icon: ShoppingBag,
      href: '/patient/dashboard/orders',
    },
    {
      id: 'reviews',
      title: t('card_reviews', { defaultValue: 'Evaluaciones' }),
      desc: t('card_reviews_desc', { defaultValue: 'Auditoría de servicios médicos.' }),
      icon: Star,
      href: '/patient/dashboard/reviews',
    },
    {
      id: 'profile',
      title: t('card_profile', { defaultValue: 'Expediente Base' }),
      desc: t('card_profile_desc', { defaultValue: 'Identidad, demografía y vitales.' }),
      icon: User,
      href: '/patient/dashboard/profile',
    }
  ];

  return (
    <div className="w-full">
      <h3 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white mb-6">
        Accesos a Módulos
      </h3>
      
      {/* Blueprint Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border-t border-l border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505]">
        {cards.map((card) => (
          <div
            key={card.id}
            onClick={() => router.push(card.href)}
            className="group cursor-pointer border-b border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-8 flex flex-col justify-between min-h-[220px] transition-colors hover:bg-gray-50 dark:hover:bg-[#050505]"
          >
            <div className="flex items-start justify-between mb-8">
              <div className="w-12 h-12 border border-black dark:border-white flex items-center justify-center bg-gray-50 dark:bg-[#050505] group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors shrink-0">
                <card.icon className="w-5 h-5" strokeWidth={1.5} />
              </div>
              <ArrowRight className="w-4 h-4 text-gray-300 dark:text-gray-700 group-hover:text-black dark:group-hover:text-white transition-colors" strokeWidth={1.5} />
            </div>
            
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white mb-2">
                {card.title}
              </h3>
              <p className="text-xs text-gray-500 font-light leading-relaxed">
                {card.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}