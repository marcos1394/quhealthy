"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
// Importamos el tipo correctamente para asegurar el tipado estricto
import type { ThemeProviderProps } from "next-themes";

export default function CustomProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"      // Usa clases de Tailwind (.dark) en lugar de data-attributes
      defaultTheme="dark"    // Forzamos el tema oscuro por defecto (Premium feel)
      enableSystem={true}    // Permite respetar la preferencia del sistema operativo si el usuario cambia
      disableTransitionOnChange // Evita parpadeos molestos al cambiar de tema
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}