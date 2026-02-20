import React from "react";
import { Navbar } from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen w-full">
      {/* 🚀 EL NAVBAR SE MONTA SOLO EN RUTAS PÚBLICAS */}
      <Navbar />
      
      {/* Mantenemos tu pt-20 para que el Navbar fijo no tape el contenido */}
      <main className="flex-grow pt-20 relative z-0">
         {children}
      </main>

      {/* 🚀 EL FOOTER SE MONTA SOLO EN RUTAS PÚBLICAS */}
      <Footer />
    </div>
  );
}