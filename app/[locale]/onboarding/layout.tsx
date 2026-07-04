import React from "react";
import AuthProvider from "@/components/providers/AuthProvider";
import Link from "next/link";
import { OnboardingHeader } from "./OnboardingHeader";
export const metadata = {
 title: "Onboarding | QuHealthy",
 description: "Completa tu perfil profesional y verificación en QuHealthy.",
};

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
 return (
 <AuthProvider>
 <div className="flex flex-col h-screen w-full bg-white dark:bg-[#0a0a0a] text-black dark:text-white font-sans antialiased selection:bg-gray-200 dark:selection:bg-white/20 overflow-hidden transition-colors duration-300">
 {/* Minimalist Topbar with Actions (Editorial) */}
 <OnboardingHeader />
 {/* Main Content Area */}
 <main className="flex-1 overflow-y-auto relative bg-white dark:bg-[#0a0a0a] transition-colors duration-300">
 <div className="container mx-auto px-4 pb-12 max-w-3xl animate-in fade-in-0 duration-500 h-full flex flex-col">
 {children}
 </div>
 </main>
 </div>
 </AuthProvider>
 );
}