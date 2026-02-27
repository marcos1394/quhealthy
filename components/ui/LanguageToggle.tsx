"use client";

import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import { useLocale } from "next-intl";

export function LanguageToggle() {
    const router = useRouter();
    const pathname = usePathname();
    const locale = useLocale();

    const toggleLanguage = () => {
        const nextLocale = locale === "es" ? "en" : "es";
        // Si la ruta contiene el locale actual, lo reemplazamos
        if (pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`) {
            const newPath = pathname.replace(`/${locale}`, `/${nextLocale}`);
            router.push(newPath || `/${nextLocale}`);
        } else {
            router.push(`/${nextLocale}${pathname}`);
        }
    };

    return (
        <Button
            variant="outline"
            onClick={toggleLanguage}
            className="bg-transparent border-none hover:bg-gray-100 dark:hover:bg-gray-800 focus-visible:ring-1 focus-visible:ring-purple-500 rounded-full h-10 w-10 p-2 flex items-center justify-center transition-colors"
            aria-label="Toggle Language"
        >
            <Globe className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            <span className="sr-only">Toggle Language</span>
        </Button>
    );
}
