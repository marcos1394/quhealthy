"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    return (
        <Button
            variant="outline"
            size="default"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="bg-transparent border-none hover:bg-gray-100 dark:hover:bg-gray-800 focus-visible:ring-1 focus-visible:ring-purple-500 rounded-full h-10 w-10 flex items-center justify-center transition-colors"
            aria-label="Toggle theme"
        >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-500" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-purple-400" />
        </Button>
    );
}
