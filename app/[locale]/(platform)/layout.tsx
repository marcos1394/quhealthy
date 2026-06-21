import React from "react";
import { Sidebar } from "@/components/platform/Sidebar";
import { MobileNavbar } from "@/components/platform/MobileNavbar"; 

// 🚀 IMPORTAMOS NUESTRO GUARDIÁN DE SEGURIDAD AQUÍ (SOLO PARA EL DASHBOARD)
import AuthProvider from '@/components/providers/AuthProvider';

export const metadata = {
  title: "Dashboard | QuHealthy",
  description: "Plataforma de gestión para profesionales de la salud",
};

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {/* Contenedor principal arquitectónico */}
      <div className="flex flex-col md:flex-row h-screen w-full bg-white dark:bg-[#0a0a0a] text-black dark:text-white font-sans antialiased selection:bg-gray-200 dark:selection:bg-white/20 overflow-hidden transition-colors duration-300">
        
        {/* Navbar (Mobile only) */}
        <MobileNavbar />

        {/* Sidebar (Desktop only) */}
        <div className="hidden md:flex flex-shrink-0 h-full z-50 border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505]">
          <Sidebar />
        </div>

        {/* Main Content Area con Scroll nativo y minimalista */}
        <main className="flex-1 overflow-y-auto relative bg-white dark:bg-[#0a0a0a] transition-colors duration-300 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-300 hover:[&::-webkit-scrollbar-thumb]:bg-gray-400 dark:[&::-webkit-scrollbar-track]:bg-[#0a0a0a] dark:[&::-webkit-scrollbar-thumb]:bg-gray-800 dark:hover:[&::-webkit-scrollbar-thumb]:bg-gray-700">
          <div className="mx-auto w-full p-6 md:p-10 lg:p-12 max-w-7xl animate-in fade-in-0 duration-500">
            {children}
          </div>
        </main>
      </div>
    </AuthProvider>
  );
}