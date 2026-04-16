import React from "react";
import { Sidebar } from "@/components/platform/Sidebar";
import AuthProvider from "@/components/providers/AuthProvider";

export const metadata = {
    title: "Onboarding | QuHealthy",
    description: "Completa tu perfil profesional y verificación en QuHealthy.",
};

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-sans antialiased selection:bg-medical-500/20 dark:selection:bg-medical-500/30 overflow-hidden transition-colors duration-300">
                {/* Sidebar (Desktop only) — mismo patrón que PlatformLayout */}
                <div className="hidden md:flex flex-shrink-0 h-full z-50 shadow-sm dark:shadow-xl">
                    <Sidebar />
                </div>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto relative bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
                    <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-7xl animate-in fade-in-0 duration-500">
                        {children}
                    </div>
                </main>
            </div>
        </AuthProvider>
    );
}
