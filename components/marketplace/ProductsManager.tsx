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
  Package,
  Check,
  Boxes,
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

      const currentProduct = products.find((p) => p.id === productId);
      const isPharmaDetected = Boolean(
        (aiData.activeIngredient && aiData.activeIngredient.trim().length > 0) ||
        (aiData.cofeprisCategory && aiData.cofeprisCategory !== "OTC_GENERAL") ||
        aiData.requiresPrescription ||
        aiData.isAntibiotic ||
        aiData.requiresPhysicalRetention
      );

      const shouldBeMedical = currentProduct?.isMedicalProduct || isPharmaDetected;

      onUpdate(productId, {
        name: aiData.name || currentProduct?.name || "",
        description: aiData.description || currentProduct?.description || "",
        manufacturer: aiData.manufacturer || currentProduct?.manufacturer || "",
        isMedicalProduct: shouldBeMedical,
        activeIngredient: shouldBeMedical ? (aiData.activeIngredient || "") : "",
        cofeprisCategory: shouldBeMedical ? (aiData.cofeprisCategory || "OTC_GENERAL") : "OTC_GENERAL",
        requiresPrescription: shouldBeMedical ? (aiData.requiresPrescription || false) : false,
        isAntibiotic: shouldBeMedical ? (aiData.isAntibiotic || false) : false,
        requiresPhysicalRetention: shouldBeMedical ? (aiData.requiresPhysicalRetention || false) : false,
        allowsInterstateShipping: shouldBeMedical ? (aiData.allowsInterstateShipping ?? true) : true,
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
                    {/* 🏷️ Selector de Tipo de Producto */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-gray-800 dark:text-gray-200 block">
                          {t("product_type_label")}
                        </label>
                        <span
                          className={cn(
                            "text-[10px] font-bold px-2.5 py-0.5 rounded-full border shadow-2xs font-mono",
                            product.isMedicalProduct
                              ? "bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800"
                              : "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                          )}
                        >
                          {product.isMedicalProduct ? t("badge_medical") : t("badge_general")}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Opción 1: Producto General */}
                        <button
                          type="button"
                          onClick={() => {
                            onUpdate(product.id, {
                              isMedicalProduct: false,
                              cofeprisCategory: "OTC_GENERAL",
                              activeIngredient: "",
                              requiresPrescription: false,
                              isAntibiotic: false,
                              requiresPhysicalRetention: false,
                              allowsInterstateShipping: true,
                              requiresResponsiblePharmacistApproval: false,
                            });
                          }}
                          className={cn(
                            "flex items-start gap-3 p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative",
                            !product.isMedicalProduct
                              ? "bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-500 ring-2 ring-emerald-500/20 shadow-2xs"
                              : "bg-gray-50/50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700"
                          )}
                        >
                          <div
                            className={cn(
                              "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition-colors",
                              !product.isMedicalProduct
                                ? "bg-emerald-600 text-white shadow-xs"
                                : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500"
                            )}
                          >
                            <Package className="w-4 h-4" strokeWidth={2} />
                          </div>
                          <div className="flex-1 min-w-0 pr-4">
                            <span className="text-xs font-bold text-gray-900 dark:text-white block">
                              {t("type_general_title")}
                            </span>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">
                              {t("type_general_desc")}
                            </p>
                          </div>
                          {!product.isMedicalProduct && (
                            <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-2xs">
                              <Check className="w-3 h-3" strokeWidth={3} />
                            </div>
                          )}
                        </button>

                        {/* Opción 2: Medicamento / Clínico */}
                        <button
                          type="button"
                          onClick={() => {
                            onUpdate(product.id, {
                              isMedicalProduct: true,
                              cofeprisCategory: product.cofeprisCategory || "OTC_GENERAL",
                            });
                          }}
                          className={cn(
                            "flex items-start gap-3 p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative",
                            product.isMedicalProduct
                              ? "bg-purple-50/60 dark:bg-purple-950/20 border-purple-500 ring-2 ring-purple-500/20 shadow-2xs"
                              : "bg-gray-50/50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700"
                          )}
                        >
                          <div
                            className={cn(
                              "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition-colors",
                              product.isMedicalProduct
                                ? "bg-purple-600 text-white shadow-xs"
                                : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500"
                            )}
                          >
                            <FlaskConical className="w-4 h-4" strokeWidth={2} />
                          </div>
                          <div className="flex-1 min-w-0 pr-4">
                            <span className="text-xs font-bold text-gray-900 dark:text-white block">
                              {t("type_medical_title")}
                            </span>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">
                              {t("type_medical_desc")}
                            </p>
                          </div>
                          {product.isMedicalProduct && (
                            <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-2xs">
                              <Check className="w-3 h-3" strokeWidth={3} />
                            </div>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* 🚀 Banner de Escaneo con IA */}
                    <div
                      className={cn(
                        "rounded-2xl border p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xs transition-colors",
                        product.isMedicalProduct
                          ? "border-purple-200 dark:border-purple-900/40 bg-purple-50/40 dark:bg-purple-950/20"
                          : "border-emerald-100 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/20"
                      )}
                    >
                      <div className="space-y-0.5">
                        <h4
                          className={cn(
                            "text-xs sm:text-sm font-bold flex items-center gap-1.5",
                            product.isMedicalProduct
                              ? "text-purple-900 dark:text-purple-300"
                              : "text-emerald-900 dark:text-emerald-300"
                          )}
                        >
                          <Sparkles
                            className={cn(
                              "w-4 h-4",
                              product.isMedicalProduct
                                ? "text-purple-600 dark:text-purple-400"
                                : "text-emerald-600 dark:text-emerald-400"
                            )}
                            strokeWidth={2}
                          />
                          <span>
                            {product.isMedicalProduct
                              ? t("ai_scanner_medical_title")
                              : t("ai_scanner_general_title")}
                          </span>
                        </h4>
                        <p
                          className={cn(
                            "text-xs font-medium leading-relaxed",
                            product.isMedicalProduct
                              ? "text-purple-800/80 dark:text-purple-400/80"
                              : "text-emerald-800/80 dark:text-emerald-400/80"
                          )}
                        >
                          {product.isMedicalProduct
                            ? t("ai_scanner_medical_subtitle")
                            : t("ai_scanner_general_subtitle")}
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
                          className={cn(
                            "flex-1 md:flex-none rounded-xl text-white text-xs font-bold h-10 px-4 transition-all shadow-xs border-0 cursor-pointer disabled:opacity-50",
                            product.isMedicalProduct
                              ? "bg-purple-600 hover:bg-purple-700"
                              : "bg-emerald-600 hover:bg-emerald-700"
                          )}
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
                          className={cn(
                            "flex-1 md:flex-none rounded-xl border bg-white dark:bg-[#0a0a0a] text-xs font-bold h-10 px-4 transition-all shadow-2xs cursor-pointer",
                            product.isMedicalProduct
                              ? "border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/30"
                              : "border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                          )}
                        >
                          <ImagePlus className="w-4 h-4 mr-1.5" strokeWidth={2} />
                          <span>{t("btn_scan_file")}</span>
                        </Button>
                      </div>
                    </div>

                    {/* Campos Básicos */}
                    <div className="space-y-4">
                      {/* Fila 1: Nombre y Categoría */}
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

                      {/* Fila 2: Precio, SKU, Stock, Alerta Mínima */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-gray-800 dark:text-gray-200 block">
                            {t("label_price")} <span className="text-rose-500">*</span>
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
                          <label className="text-xs font-bold text-gray-800 dark:text-gray-200 block truncate">
                            {t("label_sku")}
                          </label>
                          <Input
                            value={product.sku || ""}
                            onChange={(e) =>
                              onUpdate(product.id, { sku: e.target.value })
                            }
                            placeholder={t("placeholder_sku")}
                            className="rounded-xl bg-gray-50/50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 h-11 text-xs font-mono font-semibold text-gray-900 dark:text-white focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 transition-all shadow-2xs"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1 truncate">
                            <Boxes className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            <span>{t("label_stock")}</span>
                          </label>
                          <Input
                            type="number"
                            min="0"
                            value={product.stockQuantity ?? 0}
                            onChange={(e) =>
                              onUpdate(product.id, {
                                stockQuantity: parseInt(e.target.value, 10) || 0,
                              })
                            }
                            className="rounded-xl bg-gray-50/50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 h-11 text-xs font-mono font-bold text-gray-900 dark:text-white focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 transition-all shadow-2xs"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-gray-800 dark:text-gray-200 block truncate">
                            {t("label_stock_alert")}
                          </label>
                          <Input
                            type="number"
                            min="1"
                            value={product.stockAlertThreshold ?? 5}
                            onChange={(e) =>
                              onUpdate(product.id, {
                                stockAlertThreshold: parseInt(e.target.value, 10) || 5,
                              })
                            }
                            className="rounded-xl bg-gray-50/50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 h-11 text-xs font-mono font-bold text-gray-900 dark:text-white focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 transition-all shadow-2xs"
                          />
                        </div>
                      </div>

                      {/* Marca / Fabricante opcional para productos generales */}
                      {!product.isMedicalProduct && (
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                            <span>{t("label_brand_general")}</span>
                          </label>
                          <Input
                            value={product.manufacturer || ""}
                            onChange={(e) =>
                              onUpdate(product.id, { manufacturer: e.target.value })
                            }
                            placeholder={t("placeholder_brand_general")}
                            className="rounded-xl bg-gray-50/50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 h-11 text-xs font-semibold text-gray-900 dark:text-white focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 transition-all shadow-2xs"
                          />
                        </div>
                      )}
                    </div>

                    {/* 🛡️ SECCIÓN CUMPLIMIENTO REGULATORIO (COFEPRIS) - Solo visible para medicamentos */}
                    <AnimatePresence>
                      {product.isMedicalProduct && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="border border-purple-200 dark:border-purple-900/50 bg-white dark:bg-[#0a0a0a] rounded-2xl overflow-hidden shadow-2xs space-y-0"
                        >
                          <div className="border-b border-purple-100 dark:border-purple-900/40 p-4 bg-purple-50/50 dark:bg-purple-950/20 flex items-center justify-between">
                            <h4 className="text-xs font-bold text-purple-900 dark:text-purple-300 flex items-center gap-2">
                              <ShieldAlert
                                className="w-4 h-4 text-purple-600 dark:text-purple-400"
                                strokeWidth={2}
                              />
                              <span>{t("cofepris_section_title")}</span>
                            </h4>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400 font-mono">
                              COFEPRIS
                            </span>
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
                                  className="w-full h-11 rounded-xl bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 px-3.5 transition-all appearance-none cursor-pointer shadow-2xs"
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
                                  <FileText className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" strokeWidth={2} />
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
                                  className="rounded-xl bg-gray-50/50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 h-11 text-xs font-mono font-semibold text-gray-900 dark:text-white focus-visible:ring-2 focus-visible:ring-purple-500/20 focus-visible:border-purple-500 transition-all shadow-2xs"
                                />
                              </div>

                              {/* Sustancia Activa */}
                              <div className="space-y-1.5 relative">
                                <div className="flex items-center justify-between">
                                  <label className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                                    <FlaskConical className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" strokeWidth={2} />
                                    <span>{t("label_active_ingredient")}</span>
                                  </label>
                                  {suggestStatus[product.id] === "SEARCHING" && (
                                    <span className="text-[11px] font-bold text-purple-600 animate-pulse font-mono">
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
                                  className="rounded-xl bg-gray-50/50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 h-11 text-xs font-semibold text-gray-900 dark:text-white focus-visible:ring-2 focus-visible:ring-purple-500/20 focus-visible:border-purple-500 transition-all shadow-2xs"
                                />
                              </div>

                              {/* Laboratorio / Fabricante */}
                              <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                                  <Building2 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" strokeWidth={2} />
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
                                  className="rounded-xl bg-gray-50/50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 h-11 text-xs font-semibold text-gray-900 dark:text-white focus-visible:ring-2 focus-visible:ring-purple-500/20 focus-visible:border-purple-500 transition-all shadow-2xs"
                                />
                              </div>
                            </div>

                            {/* Banderas de Restricciones Reguladoras */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4 border-t border-purple-100 dark:border-purple-900/40">
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
                                  className="flex items-center space-x-3 cursor-pointer p-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] hover:border-purple-500/30 transition-all shadow-2xs"
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
                                    className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 dark:border-gray-700 dark:bg-[#0a0a0a]"
                                  />
                                  <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                                    {t(labelKey)}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

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
                        onClick={() => {
                          if (!product.name?.trim()) {
                            toast.warning(tGlobal("validation_name") || "El nombre del producto es obligatorio.");
                            return;
                          }
                          if (!product.price || product.price <= 0) {
                            toast.warning(tGlobal("name_price_required") || "El precio del producto debe ser mayor a 0.");
                            return;
                          }
                          if (
                            product.isMedicalProduct &&
                            product.cofeprisCategory &&
                            product.cofeprisCategory !== "OTC_GENERAL" &&
                            product.cofeprisCategory !== "OTC_FARMACIA"
                          ) {
                            if (!product.activeIngredient?.trim()) {
                              toast.warning("Para medicamentos regulados por COFEPRIS, la sustancia activa es obligatoria.");
                              return;
                            }
                          }
                          onSave(product);
                        }}
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