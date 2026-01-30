import React from "react";
import { Sidebar } from "@/components/platform/Sidebar";
import { Header } from "@/components/platform/Header";

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
    <div className="flex min-h-screen bg-background text-foreground font-sans antialiased">
      
      {/* Sidebar - Fixed (Desktop Only) */}
      <aside className="hidden lg:flex flex-col w-64 fixed inset-y-0 z-50">
        <Sidebar className="h-full w-full" />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-64 transition-all duration-300">
        
        {/* Header - Sticky */}
        <Header />

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden">
          <div className="container mx-auto px-4 py-6 md:px-6 lg:px-8 max-w-7xl">
            {children}
          </div>
        </main>
        
        {/* Footer */}
        <footer className="border-t border-border py-4 px-6">
          <div className="container mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>QuHealthy Enterprise v2.0</p>
            <div className="flex items-center gap-4">
              <a href="/privacy" className="hover:text-foreground transition-colors">Privacidad</a>
              <a href="/terms" className="hover:text-foreground transition-colors">Terminos</a>
              <a href="/support" className="hover:text-foreground transition-colors">Soporte</a>
            </div>
          </div>
        </footer>
      </div>
      
    </div>
  );
}
