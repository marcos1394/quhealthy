import React from "react";
import { Sidebar } from "@/components/platform/Sidebar";

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
    // 1. Contenedor principal: Altura exacta de la pantalla (h-screen) y oculta el scroll global
    <div className="flex h-screen w-full bg-[#09090b] text-white font-sans antialiased selection:bg-purple-500/30 overflow-hidden">
      
      {/* 2. Sidebar (Solo Desktop). 
          Al no ser 'fixed', se comporta como una columna real.
          Framer Motion en el componente Sidebar se encargará de animar el ancho. */}
      <div className="hidden md:flex flex-shrink-0 h-full z-50 shadow-2xl">
        <Sidebar />
      </div>

      {/* 3. Área Principal (Toma todo el espacio sobrante fluídamente) 
          Aquí es donde ocurre el scroll real (overflow-y-auto) */}
      <main className="flex-1 overflow-y-auto relative bg-[#09090b]">
        <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-7xl animate-in fade-in-0 duration-500">
          {children}
        </div>
      </main>
      
    </div>
  );
}