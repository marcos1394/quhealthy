import React from "react";
import { Navbar } from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen w-full bg-white dark:bg-[#0a0a0a] text-black dark:text-white selection:bg-gray-200 dark:selection:bg-white/20 font-sans transition-colors duration-300">
      {/* 🚀 EL NAVBAR SE MONTA SOLO EN RUTAS PÚBLICAS */}
      <Navbar />

      {/* Main content absorbe el navbar para un efecto 'Immersive Hero' */}
      <main className="flex-grow relative z-0">
        {children}
      </main>

      {/* 🚀 EL FOOTER SE MONTA SOLO EN RUTAS PÚBLICAS */}
      <Footer />
    </div>
  );
}