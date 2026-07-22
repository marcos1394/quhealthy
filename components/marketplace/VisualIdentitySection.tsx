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
    <div className="flex flex-col bg-transparent">
      {/* Header Interior */}
      <div className="border-b border-gray-100 dark:border-gray-800 p-6 md:p-8 bg-white dark:bg-[#0a0a0a] rounded-t-3xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0">
            <Palette className="w-6 h-6 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
              Identidad Visual
            </h2>
            <p className="text-sm font-medium text-gray-500">
              Personaliza el branding y estilo de tu tienda.
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-12 bg-white dark:bg-[#0a0a0a] rounded-b-3xl">
        
        {/* Nombre y URL */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <Label className="text-sm font-bold text-gray-900 dark:text-white">
              Nombre Comercial
            </Label>
            <Input
              value={settings.storeName}
              onChange={(e) => onChange("storeName", e.target.value)}
              onBlur={() => onSaveField?.("storeName", settings.storeName)}
              placeholder="Ej: Clínica San José"
              className="rounded-xl h-12 bg-gray-50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 focus-visible:ring-emerald-500 shadow-sm"
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between">
              <Label className="text-sm font-bold text-gray-900 dark:text-white">
                URL de Tienda (Slug)
              </Label>
              {slugError && <span className="text-xs text-red-500 font-bold">{slugError}</span>}
            </div>
            <div className="flex items-center rounded-xl bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 shadow-sm focus-within:ring-1 focus-within:ring-emerald-500 overflow-hidden h-12">
              <div className="bg-gray-100 dark:bg-gray-800 px-4 flex items-center h-full border-r border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-500">
                quhealthy.com/
              </div>
              <input
                value={settings.storeSlug}
                onChange={(e) => handleSlugChange(e.target.value)}
                onBlur={() => onSaveField?.("storeSlug", settings.storeSlug)}
                placeholder="clinica-san-jose"
                className="flex-1 bg-transparent border-0 focus:ring-0 px-4 text-sm font-medium text-gray-900 dark:text-white outline-none"
              />
            </div>
          </div>
        </div>

        {/* Color Principal */}
        <div className="space-y-6 pt-6 border-t border-gray-100 dark:border-gray-800">
          <div>
            <Label className="text-sm font-bold text-gray-900 dark:text-white block mb-1">
              Color de Marca Principal
            </Label>
            <p className="text-xs text-gray-500 font-medium">
              Este color se usará en los botones primarios y enlaces de tu tienda.
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            {colorPresets.map((color) => (
              <button
                key={color.value}
                onClick={() => onChange("primaryColor", color.value)}
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-sm relative overflow-hidden",
                  settings.primaryColor === color.value 
                    ? "ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-black scale-110" 
                    : "hover:scale-105"
                )}
                style={{ backgroundColor: color.value }}
              >
                {settings.primaryColor === color.value && (
                  <Check className="w-5 h-5 text-white" strokeWidth={3} />
                )}
              </button>
            ))}
            
            <div className="flex items-center gap-3 ml-2 border-l pl-6 border-gray-200 dark:border-gray-800">
              <div 
                className="w-12 h-12 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden relative cursor-pointer"
                style={{ backgroundColor: settings.primaryColor }}
              >
                <input
                  type="color"
                  value={settings.primaryColor}
                  onChange={(e) => onChange("primaryColor", e.target.value)}
                  className="absolute inset-[-10px] w-[200%] h-[200%] opacity-0 cursor-pointer"
                />
              </div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                Hex<br/>{settings.primaryColor}
              </span>
            </div>
          </div>
        </div>

        {/* Logo & Banner */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-6 border-t border-gray-100 dark:border-gray-800">
          
          {/* Logo Upload */}
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-bold text-gray-900 dark:text-white block mb-1">
                Logotipo de Tienda
              </Label>
              <p className="text-xs text-gray-500 font-medium">
                {getImageSpecs('logo').size} • {getImageSpecs('logo').aspect}
              </p>
            </div>
            
            {settings.storeLogoUrl ? (
              <div className="relative group w-40 h-40 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-black overflow-hidden shadow-sm flex items-center justify-center p-2">
                <img src={settings.storeLogoUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    onClick={() => onImageDelete?.('logo')}
                    className="rounded-xl border border-white/20 bg-red-500/80 hover:bg-red-500 text-white shadow-sm"
                    size="sm"
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Eliminar
                  </Button>
                </div>
              </div>
            ) : (
              <div 
                onClick={() => logoInputRef.current?.click()}
                className="w-40 h-40 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-colors flex flex-col items-center justify-center cursor-pointer shadow-sm group"
              >
                {uploadingType === 'logo' ? (
                  <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" strokeWidth={2} />
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-white dark:bg-black flex items-center justify-center mb-3 shadow-sm group-hover:scale-110 transition-transform">
                      <ImageIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <span className="text-xs font-bold text-gray-500">Subir Logo</span>
                  </>
                )}
              </div>
            )}
            <input 
              ref={logoInputRef} 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={(e) => handleImageUpload('logo', e)} 
            />
          </div>

          {/* Banner Upload */}
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-bold text-gray-900 dark:text-white block mb-1">
                Banner de Tienda
              </Label>
              <p className="text-xs text-gray-500 font-medium">
                {getImageSpecs('banner').size} • {getImageSpecs('banner').aspect}
              </p>
            </div>
            
            {settings.bannerImageUrl ? (
              <div className="relative group w-full aspect-[3/1] rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-black overflow-hidden shadow-sm">
                <img src={settings.bannerImageUrl} alt="Banner" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    onClick={() => onImageDelete?.('banner')}
                    className="rounded-xl border border-white/20 bg-red-500/80 hover:bg-red-500 text-white shadow-sm"
                    size="sm"
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Eliminar Banner
                  </Button>
                </div>
              </div>
            ) : (
              <div 
                onClick={() => bannerInputRef.current?.click()}
                className="w-full aspect-[3/1] rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-colors flex flex-col items-center justify-center cursor-pointer shadow-sm group"
              >
                {uploadingType === 'banner' ? (
                  <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" strokeWidth={2} />
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-white dark:bg-black flex items-center justify-center mb-3 shadow-sm group-hover:scale-110 transition-transform">
                      <ImageIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <span className="text-xs font-bold text-gray-500">Subir Banner</span>
                  </>
                )}
              </div>
            )}
            <input 
              ref={bannerInputRef} 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={(e) => handleImageUpload('banner', e)} 
            />
          </div>

        </div>

      </div>
    </div>
  );
}
