"use client";

import React, { useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  showText?: boolean;
}

export function LanguageToggle({ className, showText = false }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const [isPending, startTransition] = useTransition();

  const toggleLanguage = () => {
    const nextLocale = locale === "es" ? "en" : "es";

    // Persistir cookie para next-intl
    document.cookie = `NEXT_LOCALE=${nextLocale};path=/;max-age=31536000;SameSite=Lax`;

    startTransition(() => {
      let newPath = pathname;
      if (pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`) {
        newPath = pathname.replace(`/${locale}`, `/${nextLocale}`);
      } else {
        newPath = `/${nextLocale}${pathname}`;
      }
      router.push(newPath || `/${nextLocale}`);
    });
  };

  return (
    <Button
      variant="ghost"
      size={showText ? "default" : "icon"}
      onClick={toggleLanguage}
      disabled={isPending}
      className={cn(
        "rounded-xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-[#0a0a0a]/80 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shadow-2xs cursor-pointer flex items-center justify-center gap-1.5",
        showText ? "h-9 px-3 text-xs font-bold font-mono" : "h-9 w-9 p-0",
        className
      )}
      aria-label="Toggle Language"
      title={locale === "es" ? "Cambiar a English" : "Switch to Español"}
    >
      <Globe className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" strokeWidth={2} />
      <span className="text-[11px] font-bold uppercase font-mono tracking-tight">
        {locale === "es" ? "ES" : "EN"}
      </span>
      <span className="sr-only">Toggle Language</span>
    </Button>
  );
}
