"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, Share } from "lucide-react";
import { toast } from "react-toastify";

import { cn } from "@/lib/utils";

interface StorefrontNavigationProps {
  storeName: string;
  category?: string;
}

export const StorefrontNavigation: React.FC<StorefrontNavigationProps> = ({
  storeName,
  category,
}) => {
  const router = useRouter();
  const t = useTranslations("StorefrontNavigation");
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 150);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleShare = async () => {
    const shareData = {
      title: storeName,
      text: t("share_text", { name: storeName }),
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error("Error al compartir:", err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success(t("copied_toast"));
    }
  };

  return (
    <>
      {/* Breadcrumbs de Escritorio */}
      <div className="hidden md:flex max-w-7xl mx-auto px-6 py-4 items-center text-xs font-semibold text-gray-500 font-sans select-none">
        <button
          type="button"
          onClick={() => router.push("/es/discover")}
          className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
        >
          {t("discover")}
        </button>
        <span className="mx-2 text-gray-300 dark:text-gray-700">/</span>
        {category && (
          <>
            <span className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer">
              {category}
            </span>
            <span className="mx-2 text-gray-300 dark:text-gray-700">/</span>
          </>
        )}
        <span className="text-gray-900 dark:text-white truncate max-w-[200px] font-bold">
          {storeName}
        </span>
      </div>

      {/* Cabecera Móvil y Pegajosa al Scroll */}
      <div
        className={cn(
          "fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-md transition-all duration-300 border-b font-sans select-none",
          isScrolled
            ? "translate-y-0 opacity-100 border-gray-100 dark:border-gray-800 shadow-2xs"
            : "-translate-y-full opacity-0 border-transparent pointer-events-none"
        )}
      >
        <div className="h-14 px-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={2} />
          </button>

          <h1 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white truncate flex-1 text-center px-4 tracking-tight">
            {storeName}
          </h1>

          <button
            type="button"
            onClick={handleShare}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer shadow-2xs"
          >
            <Share className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Botón Flotante Superior en Móvil (Estático al tope) */}
      <div
        className={cn(
          "md:hidden absolute top-4 left-4 z-40 transition-opacity duration-300 font-sans",
          isScrolled ? "opacity-0 pointer-events-none" : "opacity-100"
        )}
      >
        <button
          type="button"
          onClick={() => router.back()}
          className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white shadow-2xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={2} />
        </button>
      </div>
    </>
  );
};