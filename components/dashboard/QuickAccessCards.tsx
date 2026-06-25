"use client"
/* eslint-disable react-doctor/click-events-have-key-events */

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
            // 1. APLICAMOS EL HOVER AL CONTENEDOR PADRE: Fondo, elevación, sombra sólida y z-index relativo
            className="group relative z-0 hover:z-10 cursor-pointer border-b border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-8 flex flex-col justify-between min-h-[220px] transition-all duration-300 hover:bg-black dark:hover:bg-white hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#000] dark:hover:shadow-[6px_6px_0_0_#fff]"
          >
            <div className="flex items-start justify-between mb-8">
              {/* 2. INVERSIÓN DEL CONTENEDOR DEL ICONO: Para contrastar con la tarjeta que ahora será negra/blanca */}
              <div className="w-12 h-12 border border-black dark:border-white flex items-center justify-center bg-gray-50 dark:bg-[#050505] transition-colors duration-300 shrink-0 group-hover:border-white dark:group-hover:border-black group-hover:bg-white group-hover:text-black dark:group-hover:bg-black dark:group-hover:text-white">
                <card.icon className="w-5 h-5" strokeWidth={1.5} />
              </div>
              
              {/* 3. ICONO DE FLECHA */}
              <ArrowRight className="w-4 h-4 text-gray-300 dark:text-gray-700 group-hover:text-white dark:group-hover:text-black transition-colors duration-300" strokeWidth={1.5} />
            </div>
            
            <div>
              {/* 4. TÍTULO: Pasa de negro a blanco al hacer hover */}
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white mb-2 transition-colors duration-300 group-hover:text-white dark:group-hover:text-black">
                {card.title}
              </h3>
              
              {/* 5. DESCRIPCIÓN: Pasa de un gris medio a un gris claro/oscuro para no perderse en el nuevo fondo */}
              <p className="text-xs text-gray-500 font-light leading-relaxed transition-colors duration-300 group-hover:text-gray-300 dark:group-hover:text-gray-600">
                {card.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}