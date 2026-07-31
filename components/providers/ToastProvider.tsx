"use client";

/* eslint-disable react-doctor/no-initialize-state */

import React, { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import { useTranslations } from "next-intl";

import { hydrateErrorMessages } from "@/lib/handleApiError";

const ERROR_KEYS = [
  "400",
  "401",
  "403",
  "404",
  "408",
  "409",
  "413",
  "422",
  "429",
  "500",
  "502",
  "503",
  "network",
  "timeout",
  "unknown",
] as const;

/**
 * ToastProvider — Componente cliente para:
 * 1. Monitorear el tema claro/oscuro del sistema
 * 2. Hidratar el diccionario de errores traducidos según el locale
 */
export function ToastProvider() {
  const t = useTranslations("Errors");
  const [isDark, setIsDark] = useState(false);

  // Hidratar mensajes de error al montar o cambiar el locale
  useEffect(() => {
    const messages: Record<string, string> = {};
    for (const key of ERROR_KEYS) {
      try {
        messages[key] = t(key);
      } catch {
        // Omite claves no definidas
      }
    }
    hydrateErrorMessages(messages);
  }, [t]);

  // Observador de modo oscuro en la clase <html>
  useEffect(() => {
    const html = document.documentElement;

    const check = () => setIsDark(html.classList.contains("dark"));
    check();

    const observer = new MutationObserver(check);
    observer.observe(html, { attributes: true, attributeFilter: ["class"] });

    return () => observer.disconnect();
  }, []);

  return (
    <ToastContainer
      position="bottom-right"
      autoClose={4000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme={isDark ? "dark" : "light"}
      toastStyle={{
        borderRadius: "16px",
        fontSize: "13px",
        fontWeight: 600,
        fontFamily: "var(--font-sans), sans-serif",
      }}
    />
  );
}