"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "@/i18n/routing";
import { Navbar } from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSessionStore } from "@/stores/SessionStore";
import { Sidebar } from "@/components/platform/Sidebar";
import { MobileNavbar } from "@/components/platform/MobileNavbar";
import AuthProvider from "@/components/providers/AuthProvider";
import { GlobalCartDrawer } from "@/components/store/GlobalCartDrawer";
import { FloatingCartTrigger } from "@/components/cart/FloatingCartTrigger";

export function PublicLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDiscover = pathname.startsWith("/discover");
  const isStore = pathname.startsWith("/store");

  const { isAuthenticated, _hasHydrated, token } = useSessionStore();
  const isLoggedIn = _hasHydrated && isAuthenticated && !!token;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Si estamos en discover o store y el usuario está logueado, mostramos el layout de plataforma
  if ((isDiscover || isStore) && mounted && isLoggedIn) {
    return (
      <AuthProvider>
        <div className="flex flex-col md:flex-row h-screen w-full bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white font-sans antialiased selection:bg-emerald-100 dark:selection:bg-emerald-950/40 overflow-hidden transition-colors duration-300">
          <MobileNavbar />
          <div className="hidden md:flex shrink-0 h-full z-50 border-r border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-[#050505]">
            <Sidebar />
          </div>
          <main
            className={`flex-1 relative z-0 bg-white dark:bg-[#0a0a0a] ${
              isDiscover
                ? "overflow-hidden"
                : "overflow-y-auto custom-scrollbar"
            }`}
          >
            {children}
          </main>
          <GlobalCartDrawer />
          <FloatingCartTrigger />
        </div>
      </AuthProvider>
    );
  }

  // Prevenir desajustes de hidratación
  if ((isDiscover || isStore) && !mounted) {
    return (
      <div className="flex flex-col h-screen w-full bg-white dark:bg-[#0a0a0a]" />
    );
  }

  if (isDiscover) {
    return (
      <div className="flex flex-col h-screen w-full bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white selection:bg-emerald-100 dark:selection:bg-emerald-950/40 font-sans transition-colors duration-300 overflow-hidden">
        <Navbar />
        <main className="flex-1 relative z-0 overflow-hidden pt-20 md:pt-24">
          {children}
        </main>
        <GlobalCartDrawer />
        <FloatingCartTrigger />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen w-full bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white selection:bg-emerald-100 dark:selection:bg-emerald-950/40 font-sans transition-colors duration-300">
      <Navbar />
      <main className="flex-grow relative z-0">{children}</main>
      <GlobalCartDrawer />
      <FloatingCartTrigger />
      <Footer />
    </div>
  );
}