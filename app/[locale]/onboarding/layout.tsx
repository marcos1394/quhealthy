import React from "react";
import AuthProvider from "@/components/providers/AuthProvider";
import Link from "next/link";

export const metadata = {
    title: "Onboarding | QuHealthy",
    description: "Completa tu perfil profesional y verificación en QuHealthy.",
};

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <div className="flex flex-col h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-sans antialiased selection:bg-medical-500/20 dark:selection:bg-medical-500/30 overflow-hidden transition-colors duration-300">
                {/* Minimalist Topbar with Logo */}
                <header className="flex-none p-6 md:px-12 md:py-8 z-10 relative">
                    <Link href="/" className="inline-block">
                        <span className="text-2xl font-serif font-black tracking-tight text-slate-900 dark:text-white">
                            QuHealthy<span className="text-medical-600 dark:text-medical-400">.</span>
                        </span>
                    </Link>
                </header>
                
                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto relative bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
                    <div className="container mx-auto px-4 pb-12 max-w-3xl animate-in fade-in-0 duration-500 h-full flex flex-col">
                        {children}
                    </div>
                </main>
            </div>
        </AuthProvider>
    );
}
