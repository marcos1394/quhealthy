import React from "react";
import { Sidebar } from "@/components/platform/Sidebar";
import { Header } from "@/components/platform/Header";

// Opcional: Metadata para esta sección
export const metadata = {
  title: "Dashboard | QuHealthy",
  description: "Plataforma de gestión para profesionales de la salud",
};

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-950 text-white font-sans antialiased selection:bg-purple-500/30">
      
      {/* 1. Sidebar Fijo (Solo Desktop) */}
      <aside className="hidden md:flex flex-col w-64 fixed inset-y-0 z-50">
        <Sidebar className="h-full w-full" />
      </aside>

      {/* 2. Área Principal */}
      <div className="flex-1 flex flex-col md:pl-64 transition-all duration-300">
        
        {/* Header Fijo */}
        <Header />

        {/* 3. Contenido Scrollable (Aquí se inyectan tus páginas) */}
        <main className="flex-1 overflow-x-hidden relative">
          <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-7xl animate-in fade-in-0 duration-500">
            {children}
          </div>
        </main>
      </div>
      
    </div>
  );
}