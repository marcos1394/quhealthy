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

}
