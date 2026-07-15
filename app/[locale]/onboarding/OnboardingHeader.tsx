"use client";

import React from "react";
import { Link, useRouter } from "@/i18n/routing";
import { LogOut, Home } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Button } from "@/components/ui/button";

export function OnboardingHeader() {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <header className="flex-none flex items-center justify-between p-6 md:px-12 md:py-8 z-10 relative border-b border-gray-200 dark:border-gray-800">
      <Link href="/" className="inline-block group">
        <span className="text-2xl font-serif italic tracking-tight text-black dark:text-white transition-opacity group-hover:opacity-60">
          QuHealthy.
        </span>
      </Link>

      <div className="flex items-center gap-2 sm:gap-4">
        <LanguageToggle />
        <ThemeToggle />
        <div className="hidden sm:block h-6 w-px bg-gray-200 dark:bg-gray-800 mx-1" />

        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/")}
          title="Return Home"
          className="rounded-none hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
        >
          <Home className="w-4 h-4 text-black dark:text-white" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          title="Log out"
          className="rounded-none hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
        >
          <LogOut className="w-4 h-4 text-black dark:text-white" />
        </Button>
      </div>
    </header>
  );
}
