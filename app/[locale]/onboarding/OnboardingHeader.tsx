"use client";

import React from "react";
import { LogOut, Home } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link, useRouter } from "@/i18n/routing";
import { useAuth } from "@/hooks/useAuth";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Button } from "@/components/ui/button";

export function OnboardingHeader() {
  const { logout } = useAuth();
  const router = useRouter();
  const t = useTranslations("OnboardingLayout");

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <header className="flex-none flex items-center justify-between px-6 py-4 md:px-12 md:py-5 z-20 relative bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 transition-colors duration-500">
      <Link href="/" className="inline-block group">
        <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white transition-opacity group-hover:opacity-70">
          QuHealthy<span className="text-emerald-600 dark:text-emerald-400 font-extrabold">.</span>
        </span>
      </Link>

      <div className="flex items-center gap-2 sm:gap-3">
        <LanguageToggle />
        <ThemeToggle />
        <div className="hidden sm:block h-5 w-px bg-gray-200 dark:bg-gray-800 mx-1" />

        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/")}
          title={t("return_home")}
          className="w-9 h-9 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shadow-sm"
        >
          <Home className="w-4 h-4" strokeWidth={2} />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          title={t("logout")}
          className="w-9 h-9 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-red-600 dark:hover:text-red-400 transition-colors shadow-sm"
        >
          <LogOut className="w-4 h-4" strokeWidth={2} />
        </Button>
      </div>
    </header>
  );
}