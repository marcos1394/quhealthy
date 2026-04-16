import React from "react";
import AuthProvider from "@/components/providers/AuthProvider";

export const metadata = {
    title: "Onboarding | QuHealthy",
    description: "Completa tu perfil profesional y verificación en QuHealthy.",
};

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
                {children}
            </div>
        </AuthProvider>
    );
}
