"use client";

import React from "react";
import { usePathname } from "@/i18n/routing";
import { Navbar } from "@/components/Navbar";
import Footer from "@/components/Footer";

export function PublicLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDiscover = pathname === "/discover";

  if (isDiscover) {
    return (
      <div className="flex flex-col h-screen w-full bg-white dark:bg-[#0a0a0a] text-black dark:text-white selection:bg-gray-200 dark:selection:bg-white/20 font-sans transition-colors duration-300 overflow-hidden">
        <Navbar />
        <main className="flex-1 relative z-0 overflow-hidden pt-20 md:pt-24">{children}</main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen w-full bg-white dark:bg-[#0a0a0a] text-black dark:text-white selection:bg-gray-200 dark:selection:bg-white/20 font-sans transition-colors duration-300">
      <Navbar />
      <main className="flex-grow relative z-0">{children}</main>
      <Footer />
    </div>
  );
}
