"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/ui/NotificationBell";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Sidebar } from "@/components/platform/Sidebar";
import { useSessionStore } from "@/stores/SessionStore";

export function MobileNavbar() {
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
    <div className="md:hidden flex items-center justify-between p-4 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 z-40 sticky top-0 transition-colors">
      <div className="flex items-center gap-3">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          {/* Usamos !max-w-[280px] para evitar que el sheet se estire demasiado en tablets pequeñas */}
          <SheetContent
            position="left"
            className="p-0 w-[280px] !max-w-[280px] bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800"
          >
            <div className="h-full w-full flex flex-col">
              {/* Le pasamos isMobile=true para que desactive el estado colapsado inicial */}
              <Sidebar
                className="w-full border-none"
                isMobile={true}
                onClose={() => setOpen(false)}
              />
            </div>
          </SheetContent>
        </Sheet>

        <Link href={homeLink} className="flex-shrink-0">
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-slate-400 tracking-tight">
            QuHealthy
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <NotificationBell isCollapsed={false} />
      </div>
    </div>
  );
}
