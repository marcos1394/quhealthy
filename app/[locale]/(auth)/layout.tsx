import React from "react";

export const metadata = {
    title: "Autenticación | QuHealthy",
    description: "Inicia sesión, regístrate o recupera tu cuenta en QuHealthy.",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
            {children}
        </div>
    );
}
