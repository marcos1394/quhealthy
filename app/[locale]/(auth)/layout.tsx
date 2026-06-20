import React from "react";

export const metadata = {
    title: "Autenticación | QuHealthy",
    description: "Inicia sesión, regístrate o recupera tu cuenta en QuHealthy.",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen w-full bg-white dark:bg-[#0a0a0a] transition-colors duration-300">
            {children}
        </div>
    );
}
