"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "@/i18n/routing";
import { Navbar } from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSessionStore } from "@/stores/SessionStore";
import { Sidebar } from "@/components/platform/Sidebar";
import { MobileNavbar } from "@/components/platform/MobileNavbar";
import AuthProvider from "@/components/providers/AuthProvider";

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
 <div className="flex flex-col md:flex-row h-screen w-full bg-white dark:bg-[#0a0a0a] text-black dark:text-white font-sans antialiased selection:bg-gray-200 dark:selection:bg-white/20 overflow-hidden transition-colors duration-300">
 <MobileNavbar />
 <div className="hidden md:flex flex-shrink-0 h-full z-50 border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505]">
 <Sidebar />
 </div>
 <main className={`flex-1 relative z-0 bg-white dark:bg-[#0a0a0a] ${isDiscover ? 'overflow-hidden' : 'overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-300 hover:[&::-webkit-scrollbar-thumb]:bg-gray-400 dark:[&::-webkit-scrollbar-track]:bg-[#0a0a0a] dark:[&::-webkit-scrollbar-thumb]:bg-gray-800 dark:hover:[&::-webkit-scrollbar-thumb]:bg-gray-700'}`}>
 {children}
 </main>
 </div>
 </AuthProvider>
 );
 }

 // Prevenir desajustes de hidratación
 if ((isDiscover || isStore) && !mounted) {
 return (
 <div className="flex flex-col h-screen w-full bg-white dark:bg-[#0a0a0a]">
 </div>
 );
 }

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
