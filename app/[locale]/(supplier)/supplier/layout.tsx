import React from "react";
import type { Metadata } from "next";

import { Sidebar } from "@/components/platform/Sidebar";
import { MobileNavbar } from "@/components/platform/MobileNavbar";
import AuthProvider from "@/components/providers/AuthProvider";

export const metadata: Metadata = {
  title: "Portal Proveedores | QuHealthy",
  description: "Centro de gestión y distribución para proveedores médicos, insumos clínicos y cadena de frío",
  robots: {
    index: false,
    follow: false,
  },
};

export default function SupplierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="flex flex-col md:flex-row h-screen w-full bg-gray-50/50 dark:bg-[#050505] text-gray-900 dark:text-white font-sans antialiased selection:bg-indigo-500/20 overflow-hidden transition-colors duration-500">
        {/* Navbar (Mobile only) */}
        <MobileNavbar />

        {/* Sidebar (Desktop only) */}
        <div className="hidden md:flex flex-shrink-0 h-full z-50 border-r border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]">
          <Sidebar />
        </div>

        {/* Main Content Area con Scroll customizado */}
        <main className="flex-1 overflow-y-auto relative bg-gray-50/50 dark:bg-[#050505] transition-colors duration-500 custom-scrollbar">
          <div className="mx-auto w-full p-6 md:p-10 lg:p-12 max-w-7xl animate-in fade-in-0 duration-300">
            {children}
          </div>
        </main>
      </div>
    </AuthProvider>
  );
}
