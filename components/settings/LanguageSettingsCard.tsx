"use client";

import React, { useTransition } from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { Globe, Check, Sparkles } from "lucide-react";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";
import { QhSpinner } from "@/components/ui/QhSpinner";

interface Props {
  className?: string;
  showTitleHeader?: boolean;
}

const LANGUAGES = [
  {
    code: "es",
    name: "Español",
    nativeName: "Español (México / Latinoamérica)",
    flag: "🇲🇽",
    desc: "Interfaz completamente en español, formatos de fecha local y términos médicos estandarizados.",
  },
  {
    code: "en",
    name: "English",
    nativeName: "English (United States)",
    flag: "🇺🇸",
    desc: "Complete English interface, US date/time formats and international terminology.",
  },
];

export function LanguageSettingsCard({ className, showTitleHeader = true }: Props) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleLanguageSelect = (newLocale: string) => {
    if (newLocale === locale) return;

    // Guardar preferencia en cookie permanente para next-intl
    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000;SameSite=Lax`;

    startTransition(() => {
      let newPath = pathname;
      if (pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`) {
        newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
      } else {
        newPath = `/${newLocale}${pathname}`;
      }
      router.push(newPath || `/${newLocale}`);
      toast.success(
        newLocale === "es"
          ? "Idioma cambiado a Español 🇲🇽"
          : "Language switched to English 🇺🇸"
      );
    });
  };

  return (
    <div
      className={cn(
        "bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-5 sm:p-8 shadow-2xs font-sans transition-colors space-y-6 select-none",
        className
      )}
    >
      {/* ── ENCABEZADO ──────────────────────────────────────────────── */}
      {showTitleHeader && (
        <div className="flex items-center gap-4 pb-6 border-b border-gray-100 dark:border-gray-800">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-2xs">
            <Globe className="w-6 h-6" strokeWidth={2} />
          </div>

          <div className="space-y-0.5">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>{locale === "es" ? "Idioma de la Plataforma" : "Platform Language"}</span>
              {isPending && <QhSpinner size="sm" className="text-emerald-600 dark:text-emerald-400" />}
            </h2>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
              {locale === "es"
                ? "Elige el idioma principal para tu panel, notificaciones, recetas y herramientas clínicas."
                : "Choose your preferred language for your dashboard, notifications, prescriptions, and clinical tools."}
            </p>
          </div>
        </div>
      )}

      {/* ── LISTA DE IDIOMAS SELECCIONABLES ─────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {LANGUAGES.map((lang) => {
          const isSelected = locale === lang.code;

          return (
            <div
              key={lang.code}
              role="button"
              tabIndex={0}
              onClick={() => handleLanguageSelect(lang.code)}
              onKeyDown={(e) => e.key === "Enter" && handleLanguageSelect(lang.code)}
              className={cn(
                "p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-4 text-left relative overflow-hidden group",
                isSelected
                  ? "border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20 shadow-sm"
                  : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 bg-white dark:bg-[#0a0a0a]"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl sm:text-3xl leading-none select-none">{lang.flag}</span>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <span>{lang.name}</span>
                      {isSelected && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-bold">
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>{locale === "es" ? "Activo" : "Active"}</span>
                        </span>
                      )}
                    </h4>
                    <p className="text-[11px] font-medium text-gray-400 mt-0.5">
                      {lang.nativeName}
                    </p>
                  </div>
                </div>

                <div
                  className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                    isSelected
                      ? "border-emerald-600 bg-emerald-600 text-white"
                      : "border-gray-300 dark:border-gray-700 group-hover:border-gray-400"
                  )}
                >
                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-gray-800/60 pt-3">
                {lang.desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
