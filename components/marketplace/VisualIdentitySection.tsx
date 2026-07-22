"use client";
/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/click-events-have-key-events */
/* eslint-disable react-doctor/prefer-module-scope-pure-function */
/* eslint-disable react-doctor/no-giant-component */

import React, { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  Palette,
  UploadCloud,
  Check,
  X,
  AlertCircle,
  Info,
  Sparkles,
  Eye,
  Image as ImageIcon,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { toast } from "react-toastify";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { GalleryUploadManager } from "@/components/ui/gallery/GalleryUploadManager";
import { cn } from "@/lib/utils";

// Color presets - Architectural Selection
const colorPresets = [
  { name: "Negro Puro", value: "#000000", category: "neutral" },
  { name: "Grafito", value: "#333333", category: "neutral" },
  { name: "Púrpura", value: "#9333ea", category: "popular" },
  { name: "Azul", value: "#3b82f6", category: "popular" },
  { name: "Esmeralda", value: "#10b981", category: "popular" },
  { name: "Rosa", value: "#ec4899", category: "popular" },
  { name: "Naranja", value: "#f97316", category: "warm" },
  { name: "Índigo", value: "#6366f1", category: "cool" },
];

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
  const [slugError, setSlugError] = useState<string>("");
  const [uploadingType, setUploadingType] = useState<"logo" | "banner" | null>(
    null,
  );
  const [showPreview, setShowPreview] = useState(false);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // Validate slug
  const validateSlug = (slug: string) => {
    if (!slug) {
      setSlugError("La URL es requerida");
      return false;
    }
    if (slug.length < 3) {
      setSlugError("Mínimo 3 caracteres");
      return false;
    }
    if (slug.length > 50) {
      setSlugError("Máximo 50 caracteres");
      return false;
    }
    if (!/^[a-z0-9-]+$/.test(slug)) {
      setSlugError("Solo letras, números y guiones");
      return false;
    }
    setSlugError("");
    return true;
  };

  // Handle slug change
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
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.warning(
        "Por favor selecciona un archivo de imagen válido (JPG, PNG)",
      );
      event.target.value = "";
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast.warning("La imagen no debe superar los 5MB de peso");
      event.target.value = "";
      return;
    }

    setUploadingType(type);

    if (onImageUpload) {
      try {
        await onImageUpload(type, file);
      } catch (error) {
        console.error("Error en componente al subir imagen", error);
      }
    }

    setUploadingType(null);
    event.target.value = "";
  };

  // Get image specs
  const getImageSpecs = (type: "logo" | "banner") => {
    return type === "logo"
      ? { size: "400x400px", aspect: "Cuadrado 1:1" }
      : { size: "1200x400px", aspect: "Rectangular 3:1" };
  };

  return (
    <div className="flex flex-col bg-white dark:bg-[#0a0a0a]">
      {/* Header Interior */}
      <div className="border-b border-gray-200 dark:border-gray-800 p-6 md:p-8 bg-gray-50 dark:bg-[#050505]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 border border-black dark:border-white flex items-center justify-center bg-white dark:bg-black shrink-0">
              <Palette
                className="w-5 h-5 text-black dark:text-white"
                strokeWidth={1.5}
              />
            </div>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-black dark:text-white mb-1">
                Identidad Visual
              </h2>
              <p className="text-[10px] text-gray-500 font-light uppercase tracking-widest">
                Personaliza la apariencia de tu perfil público
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => setShowPreview(!showPreview)}
            className="rounded-none border border-black dark:border-white text-[10px] font-bold uppercase tracking-widest hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors h-10 px-6"
          >
            <Eye className="w-3.5 h-3.5 mr-2" strokeWidth={2} />
            {showPreview ? "Ocultar Preview" : "Ver Preview"}
          </Button>
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-12">
        {/* Live Preview (Architectural Rendering) */}
        <AnimatePresence>
          {showPreview && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="border border-gray-200 dark:border-gray-800 p-6 bg-gray-50 dark:bg-[#050505] mb-8">
                <div className="flex items-center gap-2 mb-6">
                  <Eye
                    className="w-4 h-4 text-black dark:text-white"
                    strokeWidth={1.5}
                  />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
                    Renderizado de Perfil
                  </p>
                </div>

                {/* Banner Preview */}
                <div className="aspect-[3/1] bg-white dark:bg-black border border-gray-200 dark:border-gray-800 relative mb-8">
                  {settings.bannerImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={settings.bannerImageUrl}
                      alt="Banner"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon
                        className="w-8 h-8 text-gray-300 dark:text-gray-700"
                        strokeWidth={1}
                      />
                    </div>
                  )}

                  {/* Logo Overlay */}
                  <div className="absolute -bottom-8 left-8">
                    {settings.storeLogoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={settings.storeLogoUrl}
                        alt="Logo"
                        className="w-24 h-24 border border-black dark:border-white bg-white object-cover"
                      />
                    ) : (
                      <div className="w-24 h-24 border border-gray-300 dark:border-gray-700 bg-white dark:bg-black flex items-center justify-center">
                        <ImageIcon
                          className="w-6 h-6 text-gray-300 dark:text-gray-700"
                          strokeWidth={1}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Profile Info Preview */}
                <div className="pl-8 space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-black dark:text-white tracking-tight">
                      {settings.storeName || "NOMBRE_ENTIDAD"}
                    </h3>
                    {/* Se eliminó la clase 'uppercase' y se armó la URL completa */}
                    <p className="text-[10px] font-bold tracking-widest text-gray-500 mt-1">
                      https://www.quhealthy.org/es/store/
                      {settings.storeSlug
                        ? settings.storeSlug.toLowerCase()
                        : "url-entidad"}
                    </p>
                  </div>
                  <button
                    className="h-10 px-6 text-[10px] font-bold uppercase tracking-widest text-white border border-transparent hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: settings.primaryColor }}
                  >
                    Agendar Cita
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Name and URL */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Store Name */}
          <div className="space-y-3">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white flex items-center justify-between">
              Nombre de la Entidad
              <span className="text-gray-400 font-light normal-case tracking-normal flex items-center gap-1">
                <Info className="w-3 h-3" /> Visible en búsquedas
              </span>
            </Label>
            <Input
              placeholder="Ej: Centro Médico QuHealthy"
              value={settings.storeName}
              onChange={(e) => onChange("storeName", e.target.value)}
              onBlur={() =>
                onSaveField && onSaveField("storeName", settings.storeName)
              }
              className={cn(
                "rounded-none bg-gray-50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 h-12 text-sm focus-visible:ring-0 focus-visible:border-black dark:focus-visible:border-white transition-colors",
                !settings.storeName ? "border-red-500 dark:border-red-500" : "",
              )}
            />
          </div>

          {/* Store Slug */}
          <div className="space-y-3">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
              URL Personalizada (Identificador)
            </Label>
            <div className="flex focus-within:ring-1 focus-within:ring-black dark:focus-within:ring-white transition-shadow">
              <span className="bg-gray-100 dark:bg-gray-900 border border-r-0 border-gray-200 dark:border-gray-800 px-4 py-3 text-[10px] font-bold tracking-widest text-gray-500 flex items-center">
                quhealthy.org/
              </span>
              <Input
                placeholder="mi-clinica"
                value={settings.storeSlug}
                onChange={(e) => handleSlugChange(e.target.value)}
                onBlur={() =>
                  !slugError &&
                  onSaveField &&
                  onSaveField("storeSlug", settings.storeSlug)
                }
                className={cn(
                  "rounded-none bg-gray-50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 h-12 font-mono text-sm focus-visible:ring-0 focus-visible:border-none transition-colors w-full",
                  slugError
                    ? "border-red-500 dark:border-red-500 text-red-500"
                    : "",
                )}
              />
            </div>

            {/* Slug Validation Feedback */}
            <div className="h-4">
              {slugError ? (
                <p className="text-[9px] font-bold uppercase tracking-widest text-red-500 flex items-center gap-1.5">
                  <X className="w-3 h-3" strokeWidth={2} /> {slugError}
                </p>
              ) : (
                settings.storeSlug && (
                  <p className="text-[9px] font-bold uppercase tracking-widest text-black dark:text-white flex items-center gap-1.5">
                    <Check className="w-3 h-3" strokeWidth={2} /> Identificador
                    válido
                  </p>
                )
              )}
            </div>
          </div>
        </div>

        {/* Image Uploads */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 border-t border-gray-200 dark:border-gray-800 pt-8">
          {/* Logo Upload */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
                Logotipo Institucional
              </Label>
              <span className="border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-gray-500">
                {getImageSpecs("logo").size}
              </span>
            </div>

            {settings.storeLogoUrl ? (
              <div className="relative group border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] p-2 aspect-square">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={settings.storeLogoUrl}
                  alt="Logo"
                  className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-screen"
                />
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    onClick={() => logoInputRef.current?.click()}
                    className="rounded-none bg-white text-black hover:bg-gray-200 h-10 px-4 text-[9px] font-bold uppercase tracking-widest border-0"
                  >
                    <RefreshCw className="w-3.5 h-3.5 mr-2" /> Actualizar
                  </Button>
                  {onImageDelete && (
                    <Button
                      onClick={() => {
                        onImageDelete("logo");
                        toast.success("Logotipo revocado");
                      }}
                      className="rounded-none border border-red-500 bg-transparent text-red-500 hover:bg-red-500 hover:text-white h-10 px-4 text-[9px] font-bold uppercase tracking-widest"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-2" /> Remover
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div
                onClick={() => logoInputRef.current?.click()}
                className="aspect-square w-full border border-dashed border-gray-400 dark:border-gray-600 bg-gray-50 dark:bg-[#050505] hover:border-black dark:hover:border-white hover:bg-gray-100 dark:hover:bg-[#0a0a0a] flex flex-col items-center justify-center cursor-pointer transition-colors group"
              >
                <div className="w-14 h-14 border border-gray-300 dark:border-gray-700 flex items-center justify-center bg-white dark:bg-black mb-4 group-hover:border-black dark:group-hover:border-white transition-colors">
                  {uploadingType === "logo" ? (
                    <RefreshCw
                      className="w-6 h-6 text-black dark:text-white animate-spin"
                      strokeWidth={1.5}
                    />
                  ) : (
                    <UploadCloud
                      className="w-6 h-6 text-black dark:text-white"
                      strokeWidth={1.5}
                    />
                  )}
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white text-center mb-1">
                  Logo Cuadrado
                </p>
                <p className="text-[9px] uppercase tracking-widest text-gray-500 font-light">
                  JPG o PNG • Máx 5MB
                </p>
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
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
                Banner de Portada
              </Label>
              <span className="border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-gray-500">
                {getImageSpecs("banner").size}
              </span>
            </div>

            {settings.bannerImageUrl ? (
              <div className="relative group border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] p-2 h-[calc(100%-2rem)] min-h-[200px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={settings.bannerImageUrl}
                  alt="Banner"
                  className="w-full h-full object-cover mix-blend-multiply dark:mix-blend-screen"
                />
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    onClick={() => bannerInputRef.current?.click()}
                    className="rounded-none bg-white text-black hover:bg-gray-200 h-10 px-4 text-[9px] font-bold uppercase tracking-widest border-0"
                  >
                    <RefreshCw className="w-3.5 h-3.5 mr-2" /> Actualizar
                  </Button>
                  {onImageDelete && (
                    <Button
                      onClick={() => {
                        onImageDelete("banner");
                        toast.success("Banner revocado");
                      }}
                      className="rounded-none border border-red-500 bg-transparent text-red-500 hover:bg-red-500 hover:text-white h-10 px-4 text-[9px] font-bold uppercase tracking-widest"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-2" /> Remover
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div
                onClick={() => bannerInputRef.current?.click()}
                className="h-[calc(100%-2rem)] min-h-[200px] w-full border border-dashed border-gray-400 dark:border-gray-600 bg-gray-50 dark:bg-[#050505] hover:border-black dark:hover:border-white hover:bg-gray-100 dark:hover:bg-[#0a0a0a] flex flex-col items-center justify-center cursor-pointer transition-colors group"
              >
                <div className="w-14 h-14 border border-gray-300 dark:border-gray-700 flex items-center justify-center bg-white dark:bg-black mb-4 group-hover:border-black dark:group-hover:border-white transition-colors">
                  {uploadingType === "banner" ? (
                    <RefreshCw
                      className="w-6 h-6 text-black dark:text-white animate-spin"
                      strokeWidth={1.5}
                    />
                  ) : (
                    <UploadCloud
                      className="w-6 h-6 text-black dark:text-white"
                      strokeWidth={1.5}
                    />
                  )}
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white text-center mb-1">
                  Banner Horizontal
                </p>
                <p className="text-[9px] uppercase tracking-widest text-gray-500 font-light">
                  JPG o PNG • Máx 5MB
                </p>
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

        {/* Color Picker Section */}
        <div className="space-y-4 border-t border-gray-200 dark:border-gray-800 pt-8">
          <Label className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white block mb-4">
            Acento Cromático Principal
          </Label>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Custom Color Input */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div
                  className="w-14 h-14 border border-gray-300 dark:border-gray-700 cursor-pointer overflow-hidden group"
                  style={{ backgroundColor: settings.primaryColor }}
                >
                  <input
                    type="color"
                    value={settings.primaryColor}
                    onChange={(e) => onChange("primaryColor", e.target.value)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {/* Crosshair indicator on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-white/20 transition-opacity flex items-center justify-center pointer-events-none">
                    <div className="w-4 h-px bg-white mix-blend-difference absolute" />
                    <div className="w-px h-4 bg-white mix-blend-difference absolute" />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500">
                  Valor Hexadecimal
                </span>
                <Input
                  value={settings.primaryColor}
                  onChange={(e) => {
                    let val = e.target.value;
                    if (val && !val.startsWith("#")) val = "#" + val;
                    onChange("primaryColor", val);
                  }}
                  className="rounded-none bg-gray-50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 w-32 h-10 text-xs uppercase font-mono focus-visible:ring-0 focus-visible:border-black dark:focus-visible:border-white transition-colors"
                  maxLength={7}
                  placeholder="#000000"
                />
              </div>
            </div>

            <div className="hidden lg:block w-px h-14 bg-gray-200 dark:bg-gray-800" />

            {/* Color Presets */}
            <div className="flex-1">
              <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-3">
                Selección Rápida
              </p>
              <div className="flex flex-wrap gap-2">
                {colorPresets.map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => onChange("primaryColor", preset.value)}
                    className={cn(
                      "w-10 h-10 border transition-all relative flex items-center justify-center",
                      settings.primaryColor === preset.value
                        ? "border-black dark:border-white scale-110 z-10"
                        : "border-gray-200 dark:border-gray-800 hover:border-gray-400",
                    )}
                    style={{ backgroundColor: preset.value }}
                    title={preset.name}
                  >
                    {settings.primaryColor === preset.value && (
                      <Check
                        className="w-4 h-4 text-white mix-blend-difference"
                        strokeWidth={2}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* --- GALERÍAS DE LA CLÍNICA --- */}
        <div className="space-y-12 border-t border-gray-200 dark:border-gray-800 pt-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 border border-black dark:border-white flex items-center justify-center bg-white dark:bg-black shrink-0">
              <ImageIcon
                className="w-5 h-5 text-black dark:text-white"
                strokeWidth={1.5}
              />
            </div>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-black dark:text-white mb-1">
                Galerías e Instalaciones
              </h2>
              <p className="text-[10px] text-gray-500 font-light uppercase tracking-widest">
                Muestra tu consultorio, equipo médico y certificaciones
              </p>
            </div>
          </div>

          <div className="space-y-16">
            <GalleryUploadManager
              galleryType="OFFICE"
              title="Fotos del Consultorio / Clínica"
              description="Sube fotos de tus instalaciones, salas de espera, fachada, etc."
              maxImages={15}
            />

            <GalleryUploadManager
              galleryType="EQUIPMENT"
              title="Equipamiento Médico y Tecnología"
              description="Destaca la tecnología y equipos especializados con los que cuentas."
              maxImages={10}
            />

            <GalleryUploadManager
              galleryType="CERTIFICATION"
              title="Diplomas y Certificaciones"
              description="Añade fotos o scans legibles de tus títulos, membresías o reconocimientos."
              maxImages={10}
            />
          </div>
        </div>

        {/* Best Practices Tips (Margin Note) */}
        <div className="border-l-2 border-black dark:border-white pl-6 py-4 bg-gray-50 dark:bg-[#050505] mt-12">
          <p className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white flex items-center gap-2 mb-4">
            <Info className="w-4 h-4" strokeWidth={1.5} /> Directrices de
            Identidad
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-500 font-light">
            <div className="flex items-center gap-3">
              <Check
                className="w-3.5 h-3.5 text-black dark:text-white shrink-0"
                strokeWidth={2}
              />
              <span>Resolución nativa recomendada (1:1 y 3:1)</span>
            </div>
            <div className="flex items-center gap-3">
              <Check
                className="w-3.5 h-3.5 text-black dark:text-white shrink-0"
                strokeWidth={2}
              />
              <span>Legibilidad garantizada en dispositivos móviles</span>
            </div>
            <div className="flex items-center gap-3">
              <Check
                className="w-3.5 h-3.5 text-black dark:text-white shrink-0"
                strokeWidth={2}
              />
              <span>Acento cromático alineado con tu branding</span>
            </div>
            <div className="flex items-center gap-3">
              <Check
                className="w-3.5 h-3.5 text-black dark:text-white shrink-0"
                strokeWidth={2}
              />
              <span>Consistencia gráfica en el marketplace</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
