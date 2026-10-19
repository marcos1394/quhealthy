"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/rerender-state-only-in-handlers */
/* eslint-disable react-doctor/click-events-have-key-events */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */

import React, { useRef, useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import {
  Plus,
  Trash2,
  Save,
  ImagePlus,
  ShoppingBag,
  Tag,
  Sparkles,
  Camera,
  FlaskConical,
  Building2,
  ShieldAlert,
  FileText,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { UI_Product } from "@/types/catalog";
import { cn } from "@/lib/utils";
import { catalogAiService } from "@/services/catalogAiService";
import { complianceService } from "@/services/compliance.service";
import { handleApiError } from "@/lib/handleApiError";
import { CameraModal } from "./CameraModal";

interface ProductsManagerProps {
  products: UI_Product[];
  onAdd: () => void;
  onUpdate: (id: number, updates: Partial<UI_Product>) => void;
  onSave: (product: UI_Product) => void;
  onDelete: (id: number) => void;
  onImageUpload: (id: number, file: File) => void;
  canAdd?: boolean;
  currentUsage?: number;
  maxLimit?: number | null;
}

export function ProductsManager({
  products,
  onAdd,
  onUpdate,
  onSave,
  onDelete,
  onImageUpload,
  canAdd = true,
  currentUsage,
  maxLimit,
}: ProductsManagerProps) {
  const t = useTranslations("Marketplace.products");
  const tGlobal = useTranslations("StoreCatalog.actions");

  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const [scanningProductId, setScanningProductId] = useState<number | null>(
    null
  );
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [activeProductIdForCamera, setActiveProductIdForCamera] = useState<
    number | null
  >(null);

  const activeIngredientTimers = useRef<{ [key: number]: NodeJS.Timeout }>({});
  const [suggestStatus, setSuggestStatus] = useState<{
    [key: number]: "NONE" | "SEARCHING" | "FOUND" | "NOT_FOUND";
  }>({});

  const cofeprisCategories = useMemo(
    () => [
      { value: "OTC_GENERAL", label: t("cat_otc_general") },
      { value: "OTC_FARMACIA", label: t("cat_otc_farmacia") },
      { value: "RECETA_SIMPLE", label: t("cat_receta_simple") },
      { value: "ANTIBIOTICO", label: t("cat_antibiotico") },
      {
        value: "PSICOTROPICO_CONTROLADO",
        label: t("cat_psicotropico_controlado"),
      },
      {
        value: "PSICOTROPICO_RETENCION",
        label: t("cat_psicotropico_retencion"),
      },
      { value: "ESTUPEFACIENTE", label: t("cat_estupefaciente") },
    ],
    [t]
  );

  const handleAddWrapper = () => {
    if (!canAdd) {
      toast.warning(t("limit_reached_msg"));
      return;
    }
    onAdd();
  };

  const processImageWithAi = async (
    productId: number,
    base64OrFile: string | File
  ) => {
    setScanningProductId(productId);
    const loadingToast = toast.loading(t("scanning_toast_loading"));

    try {
      let base64String: string;

      if (base64OrFile instanceof File) {
        base64String = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.readAsDataURL(base64OrFile);
          reader.onload = () => resolve(reader.result as string);
        });
      } else {
        base64String = base64OrFile;
      }

      const aiData = await catalogAiService.scanProductImage(base64String);

      onUpdate(productId, {
        name: aiData.name || "",
        description: aiData.description || "",
        activeIngredient: aiData.activeIngredient || "",
        manufacturer: aiData.manufacturer || "",
        cofeprisCategory: aiData.cofeprisCategory || "OTC_GENERAL",
        requiresPrescription: aiData.requiresPrescription || false,
        isAntibiotic: aiData.isAntibiotic || false,
        requiresPhysicalRetention: aiData.requiresPhysicalRetention || false,
        allowsInterstateShipping: aiData.allowsInterstateShipping ?? true,
      });

      toast.update(loadingToast, {
        render: t("scanning_toast_success"),
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
    } catch (error) {
      handleApiError(error);
      toast.update(loadingToast, {
        render: t("scanning_toast_error"),
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    } finally {
      setScanningProductId(null);
    }
  };

  const handleAiScan = async (
    event: React.ChangeEvent<HTMLInputElement>,
    productId: number
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await processImageWithAi(productId, file);
    event.target.value = "";
  };

  const handleActiveIngredientChange = (productId: number, value: string) => {
    onUpdate(productId, { activeIngredient: value });

    if (activeIngredientTimers.current[productId]) {
      clearTimeout(activeIngredientTimers.current[productId]);
    }

    if (!value || value.trim().length < 3) {
      onUpdate(productId, {
        cofeprisCategory: "OTC_GENERAL",
        requiresPrescription: false,
        isAntibiotic: false,
        requiresPhysicalRetention: false,
        allowsInterstateShipping: true,
      });
      setSuggestStatus((prev) => ({ ...prev, [productId]: "NONE" }));
      return;
    }

    setSuggestStatus((prev) => ({ ...prev, [productId]: "SEARCHING" }));

    activeIngredientTimers.current[productId] = setTimeout(async () => {
      try {
        const result =
          await complianceService.suggestComplianceByIngredient(value);
        if (result.found) {
          onUpdate(productId, {
            cofeprisCategory: result.cofeprisCategory,
            requiresPrescription: result.requiresPrescription,
            isAntibiotic: result.isAntibiotic,
            requiresPhysicalRetention: result.requiresPhysicalRetention,
            allowsInterstateShipping: result.allowsInterstateShipping,
          });
          setSuggestStatus((prev) => ({ ...prev, [productId]: "FOUND" }));
          toast.info(t("rules_applied_toast", { ingredient: value }));
        } else {
          onUpdate(productId, {
            cofeprisCategory: "OTC_GENERAL",
            requiresPrescription: false,
            isAntibiotic: false,
            requiresPhysicalRetention: false,
            allowsInterstateShipping: true,
          });
          setSuggestStatus((prev) => ({ ...prev, [productId]: "NOT_FOUND" }));
        }
      } catch {
        setSuggestStatus((prev) => ({ ...prev, [productId]: "NONE" }));
      }
    }, 600);
  };

  const formattedMaxLimit =
    maxLimit === null || maxLimit === undefined ? "∞" : maxLimit;

  return (
    <div className="flex flex-col bg-transparent font-sans transition-colors select-none p-6 md:p-8">
      {/* ── CABECERA PRINCIPAL ────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between p-6 md:p-8 border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] rounded-3xl shadow-2xs gap-6 shrink-0 mb-6">
        <div className="flex items-center gap-4 sm:gap-5">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-2xs shrink-0">
            <ShoppingBag className="w-7 h-7" strokeWidth={2} />
          </div>

          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              {t("title")}
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white tracking-tight leading-none">
                {t("catalog_title")}
              </h2>

              <div className="flex flex-wrap items-center gap-2 mt-1 sm:mt-0">
                {products.length > 0 && (
                  <span className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-2xs">
                    <Sparkles className="w-3.5 h-3.5" strokeWidth={2} />
                    <span>
                      {t("products_count", { count: products.length })}
                    </span>
                  </span>
                )}

                {typeof currentUsage === "number" && (
                  <span
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-bold font-mono flex items-center gap-1.5 shadow-2xs border",
                      canAdd
                        ? "bg-gray-50/50 dark:bg-[#050505] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800"
                        : "bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/40"
                    )}
                  >
                    {t("usage_label", {
                      current: currentUsage,
                      max: formattedMaxLimit,
                    })}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <Button
          type="button"
          onClick={handleAddWrapper}
          disabled={!canAdd}
          className="w-full md:w-auto h-11 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 border-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" strokeWidth={2} />
          <span>{!canAdd ? t("limit_reached_btn") : t("btn_add")}</span>
        </Button>
      </div>

      <div className="space-y-6">
        {/* ── ESTADO VACÍO ────────────────────────────────────────────── */}
        {products.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center rounded-3xl border border-dashed border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-2xs p-8"
          >
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-5 shadow-2xs">
              <ShoppingBag className="w-8 h-8" strokeWidth={2} />
            </div>
            <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight mb-1">
              {t("empty_state")}
            </p>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-6 max-w-sm leading-relaxed">
              {t("empty_desc")}
            </p>
            <Button
              type="button"
              onClick={handleAddWrapper}
              disabled={!canAdd}
              className="h-11 px-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 border-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" strokeWidth={2} />
              <span>{!canAdd ? t("limit_reached_btn") : t("create_first")}</span>
            </Button>
          </motion.div>
        ) : (
          /* ── LISTADO DE PRODUCTOS ────────────────────────────────────── */
          <AnimatePresence mode="popLayout">
            {products.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                layout
                className={cn(
                  "border bg-white dark:bg-[#0a0a0a] transition-all rounded-3xl shadow-2xs overflow-hidden",
                  product.isNew || product.hasUnsavedChanges
                    ? "border-amber-300 dark:border-amber-800/80 ring-1 ring-amber-500/20"
                    : "border-gray-100 dark:border-gray-800 hover:border-emerald-500/30"
                )}
              >
                <div className="flex flex-col lg:flex-row">
                  {/* 📸 Zona Lateral: Imagen */}
                  <div className="lg:w-72 border-b lg:border-b-0 lg:border-r border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-[#050505] p-6 md:p-8 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-bold font-mono text-gray-400">
                          {t("id_label", {
                            id: product.id < 0 ? t("id_new") : product.id,
                          })}
                        </span>
                        {(product.isNew || product.hasUnsavedChanges) && (
                          <span className="text-[10px] font-bold bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40 px-2.5 py-0.5 rounded-full shadow-2xs">
                            {t("modified_badge")}
                          </span>
                        )}
                      </div>

                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() =>
                          fileInputRefs.current[`img_${product.id}`]?.click()
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            fileInputRefs.current[`img_${product.id}`]?.click();
                          }
                        }}
                        className="w-full aspect-square rounded-2xl border border-gray-200 dark:border-gray-800 flex items-center justify-center bg-white dark:bg-[#0a0a0a] overflow-hidden relative cursor-pointer group hover:border-emerald-500 transition-colors shadow-2xs"
                      >
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center gap-2 p-4 text-center">
                            <ImagePlus
                              className="w-8 h-8 text-gray-300 dark:text-gray-600 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors"
                              strokeWidth={1.5}
                            />
                            <span className="text-xs font-semibold text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                              {t("upload_image_hint")}
                            </span>
                          </div>
                        )}

                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-2xs">
                          <span className="text-xs font-bold text-white bg-black/50 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 shadow-2xs">
                            {t("change_image")}
                          </span>
                        </div>
                      </div>

                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={(el) => {
                          fileInputRefs.current[`img_${product.id}`] = el;
                        }}
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            onImageUpload(product.id, e.target.files[0]);
                          }
                        }}
                      />
                    </div>
                  </div>

                  {/* 📝 Zona Principal: Formulario */}
                  <div className="flex-1 p-6 md:p-8 space-y-6">
                    {/* 🚀 Banner de Escaneo e Extracción Inteligente */}
                    <div className="rounded-2xl border border-emerald-100 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/20 p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xs">
                      <div className="space-y-0.5">
                        <h4 className="text-xs sm:text-sm font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                          <Sparkles
                            className="w-4 h-4 text-emerald-600 dark:text-emerald-400"
                            strokeWidth={2}
                          />
                          <span>{t("ai_scanner_title")}</span>
                        </h4>
                        <p className="text-xs font-medium text-emerald-800/80 dark:text-emerald-400/80 leading-relaxed">
                          {t("ai_scanner_subtitle")}
                        </p>
                      </div>

                      <div className="flex gap-2.5 w-full md:w-auto shrink-0">
                        <input
                          type="file"
                          accept="image/*"
                          ref={(el) => {
                            fileInputRefs.current[`ai_${product.id}`] = el;
                          }}
                          className="hidden"
                          onChange={(e) => handleAiScan(e, product.id)}
                        />

                        <Button
                          type="button"
                          onClick={() => {
                            setActiveProductIdForCamera(product.id);
                            setIsCameraOpen(true);
                          }}
                          disabled={scanningProductId === product.id}
                          className="flex-1 md:flex-none rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold h-10 px-4 transition-all shadow-xs border-0 cursor-pointer disabled:opacity-50"
                        >
                          {scanningProductId === product.id ? (
                            <>
                              <QhSpinner size="sm" className="text-white mr-2" />
                              <span>...</span>
                            </>
                          ) : (
                            <>
                              <Camera className="w-4 h-4 mr-1.5" strokeWidth={2} />
                              <span>{t("btn_scan_camera")}</span>
                            </>
                          )}
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            fileInputRefs.current[`ai_${product.id}`]?.click()
                          }
                          disabled={scanningProductId === product.id}
                          className="flex-1 md:flex-none rounded-xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-[#0a0a0a] text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-xs font-bold h-10 px-4 transition-all shadow-2xs cursor-pointer"
                        >
                          <ImagePlus className="w-4 h-4 mr-1.5" strokeWidth={2} />
                          <span>{t("btn_scan_file")}</span>
                        </Button>
                      </div>
                    </div>

                    {/* Campos Básicos */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-800 dark:text-gray-200 block">
                          {t("label_name")} <span className="text-rose-500">*</span>
                        </label>
                        <Input
                          value={product.name}
                          onChange={(e) =>
                            onUpdate(product.id, { name: e.target.value })
                          }
                          placeholder={t("placeholder_name")}
                          className={cn(
                            "rounded-xl bg-gray-50/50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 h-11 text-xs font-semibold text-gray-900 dark:text-white focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 transition-all shadow-2xs",
                            !product.name
                              ? "border-rose-200 dark:border-rose-900/50"
                              : ""
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-gray-800 dark:text-gray-200 block">
                            {t("label_price")}
                          </label>
                          <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">
                              $
                            </span>
                            <Input
                              type="number"
                              min="0"
                              value={product.price || ""}
                              onChange={(e) =>
                                onUpdate(product.id, {
                                  price: parseFloat(e.target.value) || 0,
                                })
                              }
                              className="rounded-xl bg-gray-50/50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 h-11 pl-7 text-xs font-mono font-bold text-gray-900 dark:text-white focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 transition-all shadow-2xs"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                            <Tag className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                            <span>{t("label_category")}</span>
                          </label>
                          <Input
                            value={product.category}
                            onChange={(e) =>
                              onUpdate(product.id, { category: e.target.value })
                            }
                            placeholder={t("placeholder_category")}
                            className="rounded-xl bg-gray-50/50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 h-11 text-xs font-semibold text-gray-900 dark:text-white focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 transition-all shadow-2xs"
                          />
                        </div>
                      </div>
                    </div>

                    {/* 🛡️ SECCIÓN CUMPLIMIENTO REGULATORIO (COFEPRIS) */}
                    <div className="border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] rounded-2xl overflow-hidden shadow-2xs space-y-0">
                      <div className="border-b border-gray-100 dark:border-gray-800 p-4 bg-gray-50/60 dark:bg-[#050505]">
                        <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                          <ShieldAlert
                            className="w-4 h-4 text-emerald-600 dark:text-emerald-400"
                            strokeWidth={2}
                          />
                          <span>{t("cofepris_section_title")}</span>
                        </h4>
                      </div>

                      <div className="p-5 space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          {/* Clasificación Sanitaria */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-800 dark:text-gray-200 block">
                              {t("label_sanitary_class")}
                            </label>
                            <select
                              value={product.cofeprisCategory || "OTC_GENERAL"}
                              onChange={(e) =>
                                onUpdate(product.id, {
                                  cofeprisCategory: e.target.value,
                                })
                              }
                              className="w-full h-11 rounded-xl bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 px-3.5 transition-all appearance-none cursor-pointer shadow-2xs"
                            >
                              {cofeprisCategories.map((cat) => (
                                <option
                                  key={cat.value}
                                  value={cat.value}
                                  className="bg-white dark:bg-[#0a0a0a]"
                                >
                                  {cat.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Ficha Técnica (PDF) */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                              <FileText className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                              <span>{t("label_technical_sheet")}</span>
                            </label>
                            <Input
                              value={product.technicalSheetUrl || ""}
                              onChange={(e) =>
                                onUpdate(product.id, {
                                  technicalSheetUrl: e.target.value,
                                })
                              }
                              placeholder={t("placeholder_technical_sheet")}
                              className="rounded-xl bg-gray-50/50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 h-11 text-xs font-mono font-semibold text-gray-900 dark:text-white focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 transition-all shadow-2xs"
                            />
                          </div>

                          {/* Sustancia Activa */}
                          <div className="space-y-1.5 relative">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                                <FlaskConical className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                                <span>{t("label_active_ingredient")}</span>
                              </label>
                              {suggestStatus[product.id] === "SEARCHING" && (
                                <span className="text-[11px] font-bold text-emerald-600 animate-pulse font-mono">
                                  {t("validating_db")}
                                </span>
                              )}
                            </div>
                            <Input
                              value={product.activeIngredient || ""}
                              onChange={(e) =>
                                handleActiveIngredientChange(
                                  product.id,
                                  e.target.value
                                )
                              }
                              placeholder={t("placeholder_active_ingredient")}
                              className="rounded-xl bg-gray-50/50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 h-11 text-xs font-semibold text-gray-900 dark:text-white focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 transition-all shadow-2xs"
                            />
                          </div>

                          {/* Laboratorio / Marca */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                              <Building2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                              <span>{t("label_manufacturer")}</span>
                            </label>
                            <Input
                              value={product.manufacturer || ""}
                              onChange={(e) =>
                                onUpdate(product.id, {
                                  manufacturer: e.target.value,
                                })
                              }
                              placeholder={t("placeholder_manufacturer")}
                              className="rounded-xl bg-gray-50/50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 h-11 text-xs font-semibold text-gray-900 dark:text-white focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 transition-all shadow-2xs"
                            />
                          </div>
                        </div>

                        {/* Bandera de Restricciones Reguladoras */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                          {[
                            {
                              field: "requiresPrescription",
                              labelKey: "check_requires_prescription",
                            },
                            {
                              field: "isAntibiotic",
                              labelKey: "check_is_antibiotic",
                            },
                            {
                              field: "requiresPhysicalRetention",
                              labelKey: "check_requires_physical_retention",
                            },
                            {
                              field: "allowsInterstateShipping",
                              labelKey: "check_allows_interstate_shipping",
                            },
                          ].map(({ field, labelKey }) => (
                            <label
                              key={field}
                              className="flex items-center space-x-3 cursor-pointer p-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] hover:border-emerald-500/30 transition-all shadow-2xs"
                            >
                              <input
                                type="checkbox"
                                checked={
                                  (product[
                                    field as keyof UI_Product
                                  ] as boolean) ??
                                  (field === "allowsInterstateShipping"
                                    ? true
                                    : false)
                                }
                                onChange={(e) =>
                                  onUpdate(product.id, {
                                    [field]: e.target.checked,
                                  })
                                }
                                className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 dark:border-gray-700 dark:bg-[#0a0a0a]"
                              />
                              <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                                {t(labelKey)}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Descripción Comercial */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-800 dark:text-gray-200 block">
                        {t("label_desc")}
                      </label>
                      <Input
                        value={product.description}
                        onChange={(e) =>
                          onUpdate(product.id, { description: e.target.value })
                        }
                        placeholder={t("placeholder_desc")}
                        className="rounded-xl bg-gray-50/50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 h-11 text-xs font-semibold text-gray-900 dark:text-white focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 transition-all shadow-2xs"
                      />
                    </div>

                    {/* Acciones */}
                    <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-800">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => onDelete(product.id)}
                        className="w-full sm:w-auto h-11 px-6 rounded-xl border-rose-200 dark:border-rose-900/40 bg-white dark:bg-[#0a0a0a] text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all text-xs font-bold shadow-2xs cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4 mr-2" strokeWidth={2} />
                        <span>{tGlobal("delete")}</span>
                      </Button>

                      <Button
                        type="button"
                        onClick={() => onSave(product)}
                        disabled={!product.hasUnsavedChanges && !product.isNew}
                        className={cn(
                          "w-full sm:w-auto h-11 px-8 rounded-xl text-xs font-bold transition-all border-0 shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
                          product.hasUnsavedChanges || product.isNew
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-400"
                        )}
                      >
                        <Save className="w-4 h-4 mr-2" strokeWidth={2} />
                        <span>
                          {product.isNew
                            ? tGlobal("save_new")
                            : tGlobal("save_changes")}
                        </span>
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* 🚀 MODAL DE CÁMARA EN VIVO PARA IA */}
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => {
          setIsCameraOpen(false);
          setActiveProductIdForCamera(null);
        }}
        onCapture={(base64) => {
          if (activeProductIdForCamera !== null) {
            processImageWithAi(activeProductIdForCamera, base64);
          }
        }}
      />
    </div>
  );
}