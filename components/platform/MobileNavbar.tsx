"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Menu, Sparkles, ShoppingBag } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/ui/NotificationBell";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Sidebar } from "@/components/platform/Sidebar";
import { useSessionStore } from "@/stores/SessionStore";
import { useBookingStore } from "@/hooks/useBookingStore";

export function MobileNavbar() {
  const t = useTranslations("PlatformMobileNavbar");
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { role } = useSessionStore();
  const { cart, openCart } = useBookingStore();

  const isFoundation = pathname?.includes("/foundation") || (role as string) === "ROLE_FOUNDATION" || (role as string) === "FOUNDATION";
  const isConsumer = !isFoundation && role === "ROLE_CONSUMER";
  const homeLink = isFoundation ? "/foundation/dashboard" : isConsumer ? "/patient/dashboard" : "/provider/dashboard";

  // Cerrar el menú al cambiar de ruta
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="md:hidden h-14 flex items-center justify-between px-4 bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 sticky top-0 z-40 font-sans select-none transition-colors">
      {/* ── MENÚ MÓVIL Y NAVEGACIÓN PRINCIPAL ─────────────────────────── */}
      <div className="flex items-center gap-3">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              type="button"
              aria-label={t("menu_aria")}
              variant="ghost"
              size="icon"
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl h-9 w-9 cursor-pointer"
            >
              <Menu className="w-5 h-5" strokeWidth={2} />
            </Button>
          </SheetTrigger>

          <SheetContent
            position="left"
            className="p-0 w-[280px] !max-w-[280px] bg-white dark:bg-[#0a0a0a] border-r border-gray-100 dark:border-gray-800 font-sans"
          >
            <SheetTitle className="sr-only">{t("brand_name")}</SheetTitle>
            <div className="h-full w-full flex flex-col">
              <Sidebar
                className="w-full border-none"
                isMobile={true}
                onClose={() => setOpen(false)}
              />
            </div>
          </SheetContent>
        </Sheet>

        {/* Marca / Logotipo */}
        <Link href={homeLink} className="flex items-center gap-2 shrink-0">
          <span className="text-base font-bold text-gray-900 dark:text-white tracking-tight">
            {t("brand_name")}
          </span>
        </Link>
      </div>

      {/* ── ACCIONES RÁPIDAS (TEMA Y NOTIFICACIONES) ──────────────────── */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={openCart}
          className="relative rounded-xl text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
        >
          <ShoppingBag size={18} />
          {cart.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
              {cart.length}
            </span>
          )}
        </Button>
        <ThemeToggle />
        <NotificationBell isCollapsed={false} />
      </div>
    </header>
  );
}