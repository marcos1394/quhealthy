"use client";

/* eslint-disable react-doctor/click-events-have-key-events */

import React from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Clock,
  User,
  ArrowRight,
  Wallet,
  Package,
  Star,
  ShoppingBag,
} from "lucide-react";

import { cn } from "@/lib/utils";

export function QuickAccessCards() {
  const router = useRouter();
  const t = useTranslations("PatientDashboard.QuickAccess");

  // Mapeo semántico de accesos rápidos
  const cards = [
    {
      id: "history",
      title: t("card_history"),
      desc: t("card_history_desc"),
      icon: Clock,
      href: "/patient/dashboard/appointments",
      colorClass: "text-emerald-600 dark:text-emerald-400",
      bgClass: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/30",
    },
    {
      id: "wallet",
      title: t("card_wallet"),
      desc: t("card_wallet_desc"),
      icon: Wallet,
      href: "/patient/dashboard/wallet",
      colorClass: "text-amber-600 dark:text-amber-400",
      bgClass: "bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/30",
    },
    {
      id: "packages",
      title: t("card_packages"),
      desc: t("card_packages_desc"),
      icon: Package,
      href: "/patient/dashboard/packages",
      colorClass: "text-teal-600 dark:text-teal-400",
      bgClass: "bg-teal-50 dark:bg-teal-950/30 border-teal-100 dark:border-teal-900/30",
    },
    {
      id: "orders",
      title: t("card_orders"),
      desc: t("card_orders_desc"),
      icon: ShoppingBag,
      href: "/patient/dashboard/orders",
      colorClass: "text-indigo-600 dark:text-indigo-400",
      bgClass: "bg-indigo-50 dark:bg-indigo-950/30 border-indigo-100 dark:border-indigo-900/30",
    },
    {
      id: "reviews",
      title: t("card_reviews"),
      desc: t("card_reviews_desc"),
      icon: Star,
      href: "/patient/dashboard/reviews",
      colorClass: "text-amber-500 dark:text-amber-400",
      bgClass: "bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900/30",
    },
    {
      id: "profile",
      title: t("card_profile"),
      desc: t("card_profile_desc"),
      icon: User,
      href: "/patient/dashboard/profile",
      colorClass: "text-blue-600 dark:text-blue-400",
      bgClass: "bg-blue-50 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900/30",
    },
  ];

  return (
    <div className="w-full font-sans transition-colors">
      <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 px-1 tracking-tight">
        {t("section_title")}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              role="button"
              tabIndex={0}
              onClick={() => router.push(card.href)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  router.push(card.href);
                }
              }}
              className="group cursor-pointer rounded-3xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-6 flex flex-col justify-between min-h-[190px] shadow-2xs hover:shadow-md hover:border-emerald-500/30 transition-all duration-200 select-none"
            >
              <div className="flex items-start justify-between mb-6">
                <div
                  className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-transform duration-200 group-hover:scale-105 border shadow-2xs",
                    card.bgClass,
                    card.colorClass
                  )}
                >
                  <Icon className="w-6 h-6" strokeWidth={2} />
                </div>

                <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-gray-50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors shadow-2xs">
                  <ArrowRight
                    className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
                    strokeWidth={2}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white tracking-tight">
                  {card.title}
                </h4>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                  {card.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}