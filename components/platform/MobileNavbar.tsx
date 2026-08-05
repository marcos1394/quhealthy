"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Menu, Sparkles } from "lucide-react";

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

export function MobileNavbar() {
  const t = useTranslations("PlatformMobileNavbar");
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { role } = useSessionStore();

  const isConsumer = role === "ROLE_CONSUMER";
  const homeLink = isConsumer ? "/patient/dashboard" : "/provider/dashboard";

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
          <div className="w-7 h-7 rounded-xl bg-emerald-600 dark:bg-emerald-500 flex items-center justify-center text-white shadow-2xs">
            <Sparkles className="w-4 h-4" strokeWidth={2} />
          </div>
          <span className="text-base font-bold text-gray-900 dark:text-white tracking-tight">
            {t("brand_name")}
          </span>
        </Link>
      </div>

      {/* ── ACCIONES RÁPIDAS (TEMA Y NOTIFICACIONES) ──────────────────── */}
      <div className="flex items-center gap-1">
        <ThemeToggle />
        <NotificationBell isCollapsed={false} />
      </div>
    </header>
  );
}