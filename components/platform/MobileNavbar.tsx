"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Menu, ShoppingBag } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/ui/NotificationBell";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { Sidebar } from "@/components/platform/Sidebar";
import { useSessionStore } from "@/stores/SessionStore";
import { useBookingStore } from "@/hooks/useBookingStore";

export function MobileNavbar() {
  const t = useTranslations("PlatformMobileNavbar");
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { role } = useSessionStore();
  const { cart, openCart } = useBookingStore();

  const isFoundation =
    pathname?.includes("/foundation") ||
    (role as string) === "ROLE_FOUNDATION" ||
    (role as string) === "FOUNDATION";
  const isConsumer = !isFoundation && role === "ROLE_CONSUMER";
  const homeLink = isFoundation
    ? "/foundation/dashboard"
    : isConsumer
    ? "/patient/dashboard"
    : "/provider/dashboard";

  // Cerrar el menú al cambiar de ruta
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="md:hidden h-14 flex items-center justify-between px-3 bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 sticky top-0 z-40 font-sans select-none transition-colors">
      {/* ── MENÚ MÓVIL Y NAVEGACIÓN PRINCIPAL ─────────────────────────── */}
      <div className="flex items-center gap-2.5">
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
          <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-black text-xs shadow-2xs">
            Q
          </div>
          <span className="text-sm font-extrabold text-gray-900 dark:text-white tracking-tight">
            QuHealthy<span className="text-emerald-600 dark:text-emerald-400">.</span>
          </span>
        </Link>
      </div>

      {/* ── ACCIONES RÁPIDAS HOMOLOGADAS (CARRITO, NOTIFICACIONES, TEMA, IDIOMA) ── */}
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          onClick={openCart}
          className="relative rounded-xl border border-gray-200/80 dark:border-gray-800 bg-white/80 dark:bg-[#0a0a0a]/80 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shadow-2xs cursor-pointer h-9 w-9 p-0 flex items-center justify-center shrink-0"
          aria-label="Carrito"
        >
          <ShoppingBag className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
          {cart.length > 0 && (
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 items-center justify-center text-[8px] text-white font-mono font-black border border-white dark:border-[#0a0a0a]">
                {cart.length > 9 ? "9+" : cart.length}
              </span>
            </span>
          )}
        </Button>
        <NotificationBell isCollapsed={false} />
        <ThemeToggle />
        <LanguageToggle />
      </div>
    </header>
  );
}