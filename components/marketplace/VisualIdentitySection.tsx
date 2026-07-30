"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/click-events-have-key-events */
/* eslint-disable @next/next/no-img-element */

import React, { useState, useRef, useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  Palette,
  Check,
  Image as ImageIcon,
  Trash2,
} from "lucide-react";
import { toast } from "react-toastify";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { GalleryUploadManager } from "@/components/ui/gallery/GalleryUploadManager";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { cn } from "@/lib/utils";

export interface IdentitySettings {
  storeName: string;
  storeSlug: string;
  primaryColor: string;
  storeLogoUrl?: string;
  bannerImageUrl?: string;
}

interface VisualIdentitySectionProps {
  settings: IdentitySettings;
  onChange: (key: keyof IdentitySettings, value: string) => void;
  onSaveField?: (key: keyof IdentitySettings, value: string) => void;
  onImageUpload?: (type: "logo" | "banner", file: File) => Promise<void>;
  onImageDelete?: (type: "logo" | "banner") => void;
}

export function VisualIdentitySection({
  settings,
  onChange,
  onSaveField,
  onImageUpload,
  onImageDelete,
}: VisualIdentitySectionProps) {
  const t = useTranslations("VisualIdentitySection");

  const [slugError, setSlugError] = useState<string>("");
  const [uploadingType, setUploadingType] = useState<"logo" | "banner" | null>(
    null
  );

  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const colorPresets = useMemo(
    () => [
      { name: t("preset_pure_black"), value: "#000000" },
      { name: t("preset_graphite"), value: "#333333" },
      { name: t("preset_purple"), value: "#9333ea" },
      { name: t("preset_blue"), value: "#3b82f6" },
      { name: t("preset_emerald"), value: "#10b981" },
      { name: t("preset_pink"), value: "#ec4899" },
      { name: t("preset_orange"), value: "#f97316" },
      { name: t("preset_indigo"), value: "#6366f1" },
    ],
    [t]
  );

  // Validación de Slug
  const validateSlug = (slug: string) => {
    if (!slug) {
      setSlugError(t("err_slug_required"));
      return false;
    }
    if (slug.length < 3) {
      setSlugError(t("err_slug_min"));
      return false;
    }
    if (slug.length > 50) {
      setSlugError(t("err_slug_max"));
      return false;
    }
    if (!/^[a-z0-9-]+$/.test(slug)) {
      setSlugError(t("err_slug_invalid"));
      return false;
    }
    setSlugError("");
    return true;
  };

  const handleSlugChange = (value: string) => {
    const sanitized = value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/--+/g, "-");
    onChange("storeSlug", sanitized);
    validateSlug(sanitized);
  };

  const handleImageUpload = async (
    type: "logo" | "banner",
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.warning(t("toast_invalid_image"));
      event.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.warning(t("toast_image_too_large"));
      event.target.value = "";
      return;
    }

    setUploadingType(type);

    if (onImageUpload) {
      try {
        await onImageUpload(type, file);
      } catch (error) {
        console.error("Error al subir imagen:", error);
      }
    }

    setUploadingType(null);
    event.target.value = "";
  };

  return (
    <div className="flex flex-col bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl shadow-2xs font-sans transition-colors select-none overflow-hidden">
      {/* ── CABECERA INTERIOR ────────────────────────────────────────── */}
      <div className="border-b border-gray-100 dark:border-gray-800 p-6 md:p-8 bg-gray-50/60 dark:bg-[#050505]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-2xs">
            <Palette className="w-6 h-6" strokeWidth={2} />
          </div>
          <div className="space-y-0.5">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight">
              {t("header_title")}
            </h2>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
              {t("header_subtitle")}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-10">
        {/* ── NOMBRE Y URL DEL COMERCIO ───────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-gray-800 dark:text-gray-200 block">
              {t("label_store_name")}
            </Label>
            <Input
              value={settings.storeName}
              onChange={(e) => onChange("storeName", e.target.value)}
              onBlur={() => onSaveField?.("storeName", settings.storeName)}
              placeholder={t("placeholder_store_name")}
              className="rounded-xl h-11 bg-gray-50/50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 shadow-2xs transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <Label className="text-xs font-bold text-gray-800 dark:text-gray-200 block">
                {t("label_store_slug")}
              </Label>
              {slugError && (
                <span className="text-[11px] text-rose-500 font-bold font-mono">
                  {slugError}
                </span>
              )}
            </div>

            <div className="flex items-center rounded-xl bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 shadow-2xs focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 overflow-hidden h-11 transition-all">
              <div className="bg-gray-100/80 dark:bg-gray-800/80 px-3.5 flex items-center h-full border-r border-gray-200 dark:border-gray-700 text-xs font-mono font-bold text-gray-500 dark:text-gray-400 select-none">
                quhealthy.com/
              </div>
              <input
                value={settings.storeSlug}
                onChange={(e) => handleSlugChange(e.target.value)}
                onBlur={() => onSaveField?.("storeSlug", settings.storeSlug)}
                placeholder={t("placeholder_store_slug")}
                className="flex-1 bg-transparent border-0 focus:ring-0 px-3.5 text-xs font-mono font-bold text-gray-900 dark:text-white outline-none"
              />
            </div>
          </div>
        </div>

        {/* ── SELECCIÓN DE COLOR PRINCIPAL DE MARCA ──────────────────── */}
        <div className="space-y-4 pt-6 border-t border-gray-100 dark:border-gray-800">
          <div className="space-y-0.5">
            <Label className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white block">
              {t("label_primary_color")}
            </Label>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
              {t("subtitle_primary_color")}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3.5 pt-1">
            {colorPresets.map((color) => (
              <button
                key={color.value}
                type="button"
                onClick={() => onChange("primaryColor", color.value)}
                className={cn(
                  "w-10 h-10 rounded-2xl flex items-center justify-center transition-all shadow-2xs relative overflow-hidden cursor-pointer",
                  settings.primaryColor === color.value
                    ? "ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-[#0a0a0a] scale-105"
                    : "hover:scale-105"
                )}
                style={{ backgroundColor: color.value }}
                title={color.name}
              >
                {settings.primaryColor === color.value && (
                  <Check className="w-4 h-4 text-white drop-shadow-md" strokeWidth={3} />
                )}
              </button>
            ))}

            <div className="flex items-center gap-3 border-l border-gray-200 dark:border-gray-800 pl-4 ml-1">
              <div
                className="w-10 h-10 rounded-2xl shadow-2xs border border-gray-200 dark:border-gray-700 overflow-hidden relative cursor-pointer"
                style={{ backgroundColor: settings.primaryColor }}
              >
                <input
                  type="color"
                  value={settings.primaryColor}
                  onChange={(e) => onChange("primaryColor", e.target.value)}
                  className="absolute inset-[-10px] w-[200%] h-[200%] opacity-0 cursor-pointer"
                />
              </div>

              <div className="flex flex-col space-y-0.5">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  {t("color_hex")}
                </span>
                <span className="text-xs font-mono font-bold text-gray-900 dark:text-white uppercase">
                  {settings.primaryColor}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── LOGOTIPO Y BANNER PROMOCIONAL ───────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-6 border-t border-gray-100 dark:border-gray-800">
          {/* Logo Upload */}
          <div className="space-y-3">
            <div className="space-y-0.5">
              <Label className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white block">
                {t("label_logo")}
              </Label>
              <p className="text-[11px] font-medium text-gray-400">
                {t("specs_logo")}
              </p>
            </div>

            {settings.storeLogoUrl ? (
              <div className="relative group w-40 h-40 rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] overflow-hidden shadow-2xs flex items-center justify-center p-3">
                <img
                  src={settings.storeLogoUrl}
                  alt="Logo"
                  className="max-w-full max-h-full object-contain"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-2xs flex items-center justify-center">
                  <Button
                    type="button"
                    onClick={() => onImageDelete?.("logo")}
                    className="rounded-xl border border-white/20 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-2xs h-9 px-3.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1.5" strokeWidth={2} />
                    <span>{t("delete_logo")}</span>
                  </Button>
                </div>
              </div>
            ) : (
              <div
                role="button"
                tabIndex={0}
                onClick={() => logoInputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    logoInputRef.current?.click();
                  }
                }}
                className="w-40 h-40 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] hover:border-emerald-500/50 hover:bg-emerald-50/20 transition-all flex flex-col items-center justify-center cursor-pointer shadow-2xs group"
              >
                {uploadingType === "logo" ? (
                  <QhSpinner size="md" className="text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 flex items-center justify-center mb-2 shadow-2xs group-hover:scale-105 transition-transform">
                      <ImageIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                    </div>
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      {t("upload_logo")}
                    </span>
                  </>
                )}
              </div>
            )}

            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImageUpload("logo", e)}
            />
          </div>

          {/* Banner Upload */}
          <div className="space-y-3">
            <div className="space-y-0.5">
              <Label className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white block">
                {t("label_banner")}
              </Label>
              <p className="text-[11px] font-medium text-gray-400">
                {t("specs_banner")}
              </p>
            </div>

            {settings.bannerImageUrl ? (
              <div className="relative group w-full aspect-[3/1] rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] overflow-hidden shadow-2xs">
                <img
                  src={settings.bannerImageUrl}
                  alt="Banner"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-2xs flex items-center justify-center">
                  <Button
                    type="button"
                    onClick={() => onImageDelete?.("banner")}
                    className="rounded-xl border border-white/20 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-2xs h-9 px-3.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1.5" strokeWidth={2} />
                    <span>{t("delete_banner")}</span>
                  </Button>
                </div>
              </div>
            ) : (
              <div
                role="button"
                tabIndex={0}
                onClick={() => bannerInputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    bannerInputRef.current?.click();
                  }
                }}
                className="w-full aspect-[3/1] rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] hover:border-emerald-500/50 hover:bg-emerald-50/20 transition-all flex flex-col items-center justify-center cursor-pointer shadow-2xs group"
              >
                {uploadingType === "banner" ? (
                  <QhSpinner size="md" className="text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 flex items-center justify-center mb-2 shadow-2xs group-hover:scale-105 transition-transform">
                      <ImageIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                    </div>
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      {t("upload_banner")}
                    </span>
                  </>
                )}
              </div>
            )}

            <input
              ref={bannerInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImageUpload("banner", e)}
            />
          </div>
        </div>

        {/* ── GALERÍA DE INSTALACIONES ────────────────────────────────── */}
        <div className="space-y-4 pt-8 border-t border-gray-100 dark:border-gray-800">
          <div className="space-y-0.5">
            <h3 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white tracking-tight">
              {t("gallery_facilities_title")}
            </h3>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
              {t("gallery_facilities_desc")}
            </p>
          </div>
          <GalleryUploadManager galleryType="OFFICE" maxImages={10} />
        </div>

        {/* ── GALERÍA DE CERTIFICACIONES Y DIPLOMAS ───────────────────── */}
        <div className="space-y-4 pt-8 border-t border-gray-100 dark:border-gray-800">
          <div className="space-y-0.5">
            <h3 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white tracking-tight">
              {t("gallery_certifications_title")}
            </h3>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
              {t("gallery_certifications_desc")}
            </p>
          </div>
          <GalleryUploadManager galleryType="CERTIFICATION" maxImages={5} />
        </div>

        {/* ── GALERÍA DE EQUIPO MÉDICO Y TECNOLOGÍA ───────────────────── */}
        <div className="space-y-4 pt-8 border-t border-gray-100 dark:border-gray-800">
          <div className="space-y-0.5">
            <h3 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white tracking-tight">
              {t("gallery_equipment_title")}
            </h3>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
              {t("gallery_equipment_desc")}
            </p>
          </div>
          <GalleryUploadManager galleryType="EQUIPMENT" maxImages={10} />
        </div>

        {/* ── GALERÍA DE CASOS DE ÉXITO (ANTES Y DESPUÉS) ─────────────── */}
        <div className="space-y-4 pt-8 border-t border-gray-100 dark:border-gray-800">
          <div className="space-y-0.5">
            <h3 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white tracking-tight">
              {t("gallery_before_after_title")}
            </h3>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
              {t("gallery_before_after_desc")}
            </p>
          </div>
          <GalleryUploadManager galleryType="BEFORE_AFTER" maxImages={10} />
        </div>
      </div>
    </div>
  );
}