"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes";
import { LazyMotion, domAnimation } from "framer-motion";

export default function CustomProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={true}
      disableTransitionOnChange
      {...props}
    >
      <LazyMotion features={domAnimation}>
        {children}
      </LazyMotion>
    </NextThemesProvider>
  );
}
