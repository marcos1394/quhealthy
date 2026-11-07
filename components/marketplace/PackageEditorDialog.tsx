"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable @next/next/no-img-element */

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  ImagePlus,
  X,
  Zap,
  Percent,
  DollarSign,
  ShoppingCart,
  CheckCircle2,
  AlertCircle,
  Info,
  Camera,
  CheckSquare,
  BriefcaseMedical,
  ShoppingBag,
  GraduationCap,
  Layers,
  Search,
} from "lucide-react";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { toast } from "react-toastify";
import {
  UI_Package,
  UI_Service,
  UI_Product,
  UI_Course,
  PackageItemRef,
} from "@/types/catalog";

interface SelectableItem {
  id: number;
  name: string;
  type: "SERVICE" | "PRODUCT" | "COURSE";
  price: number;
  category?: string;
  imageUrl?: string;
}

interface PackageEditorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: UI_Package | null;
  availableServices?: UI_Service[];
  availableProducts?: UI_Product[];
  availableCourses?: UI_Course[];
  onSave: (pkg: UI_Package) => void;
  onImageUpload?: (id: number, file: File) => void;
}

export function PackageEditorDialog({
  isOpen,
  onClose,
  initialData,
  availableServices = [],
  availableProducts = [],
  availableCourses = [],
  onSave,
  onImageUpload,
}: PackageEditorDialogProps) {
  const t = useTranslations("Marketplace.packages");

  const [pkg, setPkg] = useState<UI_Package | null>(null);
  const [discountPercent, setDiscountPercent] = useState(15);
  const [selectedFilter, setSelectedFilter] = useState<
    "ALL" | "SERVICE" | "PRODUCT" | "COURSE"
  >("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Lista unificada de todos los elementos disponibles para empaquetar
  const allAvailableItems = useMemo<SelectableItem[]>(() => {
    const list: SelectableItem[] = [];

    (availableServices || []).forEach((s) => {
      list.push({
        id: s.id,
        name: s.name,
        type: "SERVICE",
        price: s.price,
        category: s.category,
        imageUrl: s.imageUrl,
      });
    });

    (availableProducts || []).forEach((p) => {
      list.push({
        id: p.id,
        name: p.name,
        type: "PRODUCT",
        price: p.price,
        category: p.category,
        imageUrl: p.imageUrl,
      });
    });

    (availableCourses || []).forEach((c) => {
      list.push({
        id: c.id,
        name: c.name,
        type: "COURSE",
        price: c.price,
        category: c.category,
        imageUrl: c.imageUrl,
      });
    });

    return list;
  }, [availableServices, availableProducts, availableCourses]);

  function calculateRealValue(items: UI_Package["packageItems"]) {
    if (!items) return 0;
    return items.reduce((sum, item) => {
      const matched = allAvailableItems.find((it) => it.id === item.id);
      const unitPrice = matched ? matched.price : (item.price || 0);
      return sum + unitPrice * item.quantity;
    }, 0);
  }

  useEffect(() => {
    if (isOpen && initialData) {
      const p = {
        ...initialData,
        packageItems: initialData.packageItems || [],
      };
      setPkg(p);
      const rVal = calculateRealValue(p.packageItems);
      setDiscountPercent(
        rVal > 0 ? Math.round(((rVal - p.price) / rVal) * 100) : 15
      );
      setSelectedFilter("ALL");
      setSearchQuery("");
    }
  }, [isOpen, initialData]);

  if (!pkg) return null;

  const realValue = calculateRealValue(pkg.packageItems);
  const savings = Math.max(0, realValue - pkg.price);

  const filteredItems = allAvailableItems.filter((item) => {
    const matchesType =
      selectedFilter === "ALL" || item.type === selectedFilter;
    const q = searchQuery.trim().toLowerCase();
    const matchesQuery =
      !q ||
      item.name.toLowerCase().includes(q) ||
      (item.category && item.category.toLowerCase().includes(q));
    return matchesType && matchesQuery;
  });

  const servicesCount = (availableServices || []).length;
  const productsCount = (availableProducts || []).length;
  const coursesCount = (availableCourses || []).length;
  const totalCount = allAvailableItems.length;

  const handleQuantityChange = (itemId: number, delta: number) => {
    const currentItems = [...(pkg.packageItems || [])];
    const existingIndex = currentItems.findIndex((i) => i.id === itemId);

    if (existingIndex >= 0) {
      const newQuantity = Math.max(
        0,
        currentItems[existingIndex].quantity + delta
      );
      if (newQuantity === 0) {
        currentItems.splice(existingIndex, 1);
      } else {
        currentItems[existingIndex] = {
          ...currentItems[existingIndex],
          quantity: newQuantity,
        };
      }
    } else if (delta > 0) {
      const targetItem = allAvailableItems.find((it) => it.id === itemId);
      if (targetItem) {
        currentItems.push({
          id: targetItem.id,
          name: targetItem.name,
          type: targetItem.type,
          price: targetItem.price,
          quantity: delta,
          imageUrl: targetItem.imageUrl,
          category: targetItem.category,
        });
      }
    }

    const newRealValue = calculateRealValue(currentItems);
    const newPrice = Math.round(newRealValue * (1 - discountPercent / 100));
    setPkg({ ...pkg, packageItems: currentItems, price: newPrice });
  };

  const applyDiscountPercent = (percent: number) => {
    if (realValue === 0) return;
    const newPrice = Math.round(realValue * (1 - percent / 100));
    setPkg({ ...pkg, price: newPrice });
    setDiscountPercent(percent);
  };

  const manualPriceChange = (newPrice: number) => {
    setPkg({ ...pkg, price: newPrice });
    setDiscountPercent(
      realValue > 0
        ? Math.max(
            0,
            Math.min(
              100,
              Math.round(((realValue - newPrice) / realValue) * 100)
            )
          )
        : 0
    );
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !pkg) return;
    const objectUrl = URL.createObjectURL(file);
    setPkg({ ...pkg, imageUrl: objectUrl });
    if (onImageUpload) onImageUpload(pkg.id, file);
    e.target.value = "";
  };

  const suggestedDiscounts = [
    { label: "10%", percent: 10 },
    { label: "15%", percent: 15 },
    { label: "20%", percent: 20 },
    { label: "25%", percent: 25 },
  ];

  const totalItemsCount = (pkg.packageItems || []).reduce(
    (acc, i) => acc + i.quantity,
    0
  );

  const nameWords = pkg.name.trim() ? pkg.name.trim().split(/\s+/).length : 0;
  const descChars = pkg.description?.length || 0;

  const isValid =
    pkg.name &&
    pkg.category &&
    pkg.price >= 0 &&
    (pkg.packageItems || []).length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="[&>button]:hidden bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 !w-[95vw] !max-w-[1240px] p-0 overflow-hidden rounded-3xl shadow-2xl flex flex-col max-h-[92vh] font-sans transition-colors select-none">
        {/* ── HEADER DEL DIÁLOGO ──────────────────────────────────────── */}
        <div className="flex items-center justify-between p-6 md:p-8 bg-gray-50/60 dark:bg-[#050505] border-b border-gray-100 dark:border-gray-800 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-2xs">
              <ShoppingCart className="w-6 h-6" strokeWidth={2} />
            </div>
            <div className="space-y-0.5">
              <DialogTitle className="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                {pkg.isNew ? t("dialog_create") : t("dialog_edit")}
              </DialogTitle>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                {t("header_subtitle")}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-gray-500 cursor-pointer shadow-2xs shrink-0"
          >
            <X className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>

        {/* ── ÁREA DE CONTENIDO PRINCIPAL (SCROLL) ────────────────────── */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50/30 dark:bg-[#050505] flex flex-col">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]">
            {/* ── COLUMNA IZQUIERDA: DETALLES E IDENTIDAD ──────────────── */}
            <div className="flex flex-col border-b lg:border-b-0 lg:border-r border-gray-100 dark:border-gray-800">
              {/* Fotografía / Banner */}
              <div className="p-6 md:p-8 border-b border-gray-100 dark:border-gray-800 bg-gray-50/40 dark:bg-[#050505] flex flex-col space-y-3">
                <label className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                  <Camera className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                  <span>{t("banner_label")}</span>
                </label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleBannerChange}
                />

                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      fileInputRef.current?.click();
                    }
                  }}
                  className={cn(
                    "w-full aspect-[21/9] rounded-2xl border border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center overflow-hidden transition-all cursor-pointer group bg-white dark:bg-[#0a0a0a] shadow-2xs",
                    pkg.imageUrl
                      ? "border-solid"
                      : "border-dashed hover:border-emerald-500/50"
                  )}
                >
                  {pkg.imageUrl ? (
                    <img
                      src={pkg.imageUrl}
                      alt={pkg.name || "Banner"}
                      className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                    />
                  ) : (
                    <div className="text-center flex flex-col items-center p-6 space-y-2">
                      <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700 flex items-center justify-center text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors shadow-2xs">
                        <ImagePlus className="w-5 h-5" strokeWidth={2} />
                      </div>
                      <p className="text-xs font-bold text-gray-900 dark:text-white">
                        {t("select_file")}
                      </p>
                      <p className="text-[11px] font-medium text-gray-400">
                        {t("banner_recommendation")}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Formulario (Campos principales) */}
              <div className="flex flex-col bg-white dark:bg-[#0a0a0a] p-6 md:p-8 space-y-5">
                <div className="flex flex-col sm:flex-row gap-5">
                  {/* Nombre del paquete */}
                  <div className="flex-1 space-y-1.5">
                    <label className="text-xs font-bold text-gray-800 dark:text-gray-200 block">
                      {t("name_label")} <span className="text-rose-500">*</span>
                    </label>
                    <input
                      value={pkg.name}
                      onChange={(e) =>
                        setPkg({ ...pkg, name: e.target.value })
                      }
                      placeholder={t("name_placeholder")}
                      className="w-full h-11 px-3.5 rounded-xl bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-2xs placeholder:text-gray-400 placeholder:font-normal"
                    />
                    <div className="text-[11px] font-bold font-mono">
                      <span
                        className={
                          nameWords < 3
                            ? "text-rose-500"
                            : "text-emerald-600 dark:text-emerald-400"
                        }
                      >
                        {t("words_min", { count: nameWords })}
                      </span>
                    </div>
                  </div>

                  {/* Categoría */}
                  <div className="flex-1 space-y-1.5">
                    <label className="text-xs font-bold text-gray-800 dark:text-gray-200 block">
                      {t("category_label")} <span className="text-rose-500">*</span>
                    </label>
                    <input
                      value={pkg.category}
                      onChange={(e) =>
                        setPkg({ ...pkg, category: e.target.value })
                      }
                      placeholder={t("category_placeholder")}
                      className="w-full h-11 px-3.5 rounded-xl bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-2xs placeholder:text-gray-400 placeholder:font-normal"
                    />
                  </div>
                </div>

                {/* Descripción */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-800 dark:text-gray-200 block">
                    {t("desc_label")}
                  </label>
                  <textarea
                    value={pkg.description}
                    onChange={(e) =>
                      setPkg({ ...pkg, description: e.target.value })
                    }
                    placeholder={t("desc_placeholder")}
                    rows={4}
                    className="w-full min-h-[110px] p-3.5 rounded-xl bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-y placeholder:text-gray-400 placeholder:font-normal shadow-2xs"
                  />
                  <div className="text-[11px] font-bold font-mono">
                    <span
                      className={
                        descChars < 150
                          ? "text-gray-500 dark:text-gray-400"
                          : "text-emerald-600 dark:text-emerald-400"
                      }
                    >
                      {t("chars_min", { count: descChars })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── COLUMNA DERECHA: SELECCIÓN Y CONFIGURACIÓN DE PRECIOS ──── */}
            <div className="flex flex-col bg-white dark:bg-[#0a0a0a]">
              {/* 1. SELECCIÓN DE ELEMENTOS INCLUIDOS (SERVICIOS, PRODUCTOS, CURSOS) */}
              <div className="flex flex-col border-b border-gray-100 dark:border-gray-800 flex-1 min-h-[340px]">
                <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-[#050505] flex flex-col gap-3 shrink-0">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                      <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                      <span>{t("included_services") || "Elementos Incluidos"}</span>
                    </label>

                    <span className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 px-2.5 py-0.5 text-[11px] font-bold font-mono rounded-full shadow-2xs">
                      {totalItemsCount} {totalItemsCount === 1 ? "elemento" : "elementos"}
                    </span>
                  </div>

                  {/* Pestañas de Filtro y Buscador */}
                  <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center justify-between">
                    {/* Segmented Filter Pills */}
                    <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-900/80 rounded-xl overflow-x-auto text-[11px] font-bold">
                      <button
                        type="button"
                        onClick={() => setSelectedFilter("ALL")}
                        className={cn(
                          "px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 shrink-0",
                          selectedFilter === "ALL"
                            ? "bg-white dark:bg-[#151515] text-gray-900 dark:text-white shadow-2xs"
                            : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-200"
                        )}
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>Todos</span>
                        <span className="opacity-60 text-[10px]">({totalCount})</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedFilter("SERVICE")}
                        className={cn(
                          "px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 shrink-0",
                          selectedFilter === "SERVICE"
                            ? "bg-white dark:bg-[#151515] text-emerald-700 dark:text-emerald-400 shadow-2xs"
                            : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-200"
                        )}
                      >
                        <BriefcaseMedical className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>Servicios</span>
                        <span className="opacity-60 text-[10px]">({servicesCount})</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedFilter("PRODUCT")}
                        className={cn(
                          "px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 shrink-0",
                          selectedFilter === "PRODUCT"
                            ? "bg-white dark:bg-[#151515] text-sky-700 dark:text-sky-400 shadow-2xs"
                            : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-200"
                        )}
                      >
                        <ShoppingBag className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                        <span>Productos</span>
                        <span className="opacity-60 text-[10px]">({productsCount})</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedFilter("COURSE")}
                        className={cn(
                          "px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 shrink-0",
                          selectedFilter === "COURSE"
                            ? "bg-white dark:bg-[#151515] text-purple-700 dark:text-purple-400 shadow-2xs"
                            : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-200"
                        )}
                      >
                        <GraduationCap className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                        <span>Cursos</span>
                        <span className="opacity-60 text-[10px]">({coursesCount})</span>
                      </button>
                    </div>

                    {/* Search Box */}
                    <div className="relative flex-1 sm:max-w-[180px]">
                      <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Buscar..."
                        className="w-full h-7 pl-7 pr-3 text-xs rounded-xl bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery("")}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto max-h-[320px] custom-scrollbar bg-white dark:bg-[#0a0a0a]">
                  {allAvailableItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center p-10 h-full space-y-2">
                      <AlertCircle className="w-7 h-7 text-gray-300 dark:text-gray-600" strokeWidth={2} />
                      <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
                        {t("no_services") || "No tienes elementos guardados"}
                      </p>
                      <p className="text-[11px] font-medium text-gray-400 max-w-xs leading-relaxed">
                        Agrega servicios, productos o cursos individuales a tu catálogo antes de crear un paquete.
                      </p>
                    </div>
                  ) : filteredItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center p-8 space-y-1">
                      <p className="text-xs font-bold text-gray-600 dark:text-gray-400">
                        No se encontraron elementos
                      </p>
                      <p className="text-[11px] text-gray-400">
                        Prueba cambiando el filtro o término de búsqueda.
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col p-4 gap-2">
                      {filteredItems.map((item) => {
                        const packageItem = (pkg.packageItems || []).find(
                          (i) => i.id === item.id
                        );
                        const quantity = packageItem ? packageItem.quantity : 0;
                        const isSelected = quantity > 0;

                        const typeConfig =
                          item.type === "PRODUCT"
                            ? {
                                label: "Producto",
                                icon: ShoppingBag,
                                badgeClass:
                                  "bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800",
                                selectedClass:
                                  "bg-sky-50/40 dark:bg-sky-950/20 border-sky-300/80 dark:border-sky-800/60",
                                iconBoxClass:
                                  "bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-800",
                              }
                            : item.type === "COURSE"
                            ? {
                                label: "Curso",
                                icon: GraduationCap,
                                badgeClass:
                                  "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800",
                                selectedClass:
                                  "bg-purple-50/40 dark:bg-purple-950/20 border-purple-300/80 dark:border-purple-800/60",
                                iconBoxClass:
                                  "bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800",
                              }
                            : {
                                label: "Servicio",
                                icon: BriefcaseMedical,
                                badgeClass:
                                  "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
                                selectedClass:
                                  "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300/80 dark:border-emerald-800/60",
                                iconBoxClass:
                                  "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
                              };

                        const TypeIcon = typeConfig.icon;

                        return (
                          <div
                            key={item.id}
                            className={cn(
                              "flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl transition-all border shadow-2xs",
                              isSelected
                                ? typeConfig.selectedClass
                                : "bg-white dark:bg-[#0a0a0a] border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-[#050505]"
                            )}
                          >
                            <div className="flex-1 min-w-0 flex items-center gap-3">
                              <div
                                className={cn(
                                  "w-9 h-9 flex items-center justify-center rounded-xl border text-xs font-bold font-mono shrink-0",
                                  isSelected
                                    ? "bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-white border-gray-300 dark:border-gray-700"
                                    : "bg-gray-50 dark:bg-[#050505] text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-800"
                                )}
                              >
                                {quantity}x
                              </div>

                              <div
                                className={cn(
                                  "w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 overflow-hidden",
                                  typeConfig.iconBoxClass
                                )}
                              >
                                {item.imageUrl ? (
                                  <img
                                    src={item.imageUrl}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <TypeIcon className="w-4 h-4" />
                                )}
                              </div>

                              <div className="flex flex-col min-w-0 space-y-0.5">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <p
                                    className={cn(
                                      "text-xs font-bold truncate leading-tight",
                                      isSelected
                                        ? "text-gray-950 dark:text-white"
                                        : "text-gray-900 dark:text-white"
                                    )}
                                  >
                                    {item.name}
                                  </p>
                                  <span
                                    className={cn(
                                      "px-1.5 py-0.2 rounded-md text-[9px] font-bold border",
                                      typeConfig.badgeClass
                                    )}
                                  >
                                    {typeConfig.label}
                                  </span>
                                </div>
                                <span className="text-[11px] font-mono font-bold text-gray-400">
                                  ${item.price} c/u {item.category ? `• ${item.category}` : ""}
                                </span>
                              </div>
                            </div>

                            {/* Controles Incrementar / Decrementar */}
                            <div className="flex items-center rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] overflow-hidden shrink-0 h-9 shadow-2xs self-start sm:self-center">
                              <button
                                type="button"
                                onClick={() =>
                                  handleQuantityChange(item.id, -1)
                                }
                                className="w-9 h-full flex items-center justify-center text-gray-500 hover:bg-gray-50 dark:hover:bg-[#111] transition-colors cursor-pointer font-bold text-xs"
                              >
                                -
                              </button>
                              <div className="w-9 h-full flex items-center justify-center text-xs font-bold font-mono border-x border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] text-gray-900 dark:text-white">
                                {quantity}
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  handleQuantityChange(item.id, 1)
                                }
                                className="w-9 h-full flex items-center justify-center text-gray-500 hover:bg-gray-50 dark:hover:bg-[#111] transition-colors cursor-pointer font-bold text-xs"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* 2. MOTOR DE PRECIOS Y VALOR TÉCNICO */}
              <div
                className={cn(
                  "p-6 md:p-8 flex flex-col bg-gray-50/40 dark:bg-[#050505] transition-opacity space-y-6",
                  (pkg.packageItems || []).length === 0 &&
                    "opacity-50 pointer-events-none"
                )}
              >
                {/* Valuación técnica vs ahorro */}
                <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-5">
                  <div className="flex flex-col space-y-0.5">
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400">
                      {t("real_value")}
                    </p>
                    <p className="text-sm font-mono font-bold text-gray-400 line-through">
                      ${realValue}
                    </p>
                  </div>

                  <div className="flex flex-col items-end space-y-0.5">
                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <span>{t("saving")}</span>
                      <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} />
                    </p>
                    <p className="text-xl sm:text-2xl font-mono font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                      ${savings}
                    </p>
                  </div>
                </div>

                {/* Controles de Precio y Slider */}
                <div className="space-y-5">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                        <Percent className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                        <span>{t("suggested_discount")}</span>
                      </span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-mono text-sm">
                        {discountPercent}%
                      </span>
                    </div>

                    <Slider
                      value={[discountPercent]}
                      min={0}
                      max={70}
                      step={1}
                      onValueChange={(val) => applyDiscountPercent(val[0])}
                      className="py-2"
                    />

                    <div className="flex gap-2">
                      {suggestedDiscounts.map((d) => (
                        <button
                          key={d.percent}
                          type="button"
                          onClick={() => applyDiscountPercent(d.percent)}
                          className={cn(
                            "flex-1 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all shadow-2xs cursor-pointer",
                            discountPercent === d.percent
                              ? "bg-emerald-600 text-white border-emerald-600"
                              : "bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#111]"
                          )}
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Input Precio Final Manual */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                      <span>{t("manual_price")}</span>
                    </label>

                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 font-mono font-bold text-sm">
                        $
                      </div>
                      <input
                        type="number"
                        min="0"
                        value={pkg.price || ""}
                        onChange={(e) =>
                          manualPriceChange(Number(e.target.value))
                        }
                        className="w-full h-12 pl-10 pr-4 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 text-base font-mono font-black text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-2xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── FOOTER DE COMANDOS / ACCIONES ───────────────────────────── */}
        <div className="p-5 sm:p-6 bg-white dark:bg-[#0a0a0a] border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-2 w-full sm:w-auto text-xs font-semibold text-amber-600 dark:text-amber-500">
            {!isValid && (
              <>
                <Info className="w-4 h-4 shrink-0" strokeWidth={2} />
                <span>{t("validation_warning")}</span>
              </>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="h-11 px-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#111] transition-all text-xs font-bold w-full sm:w-auto shadow-2xs cursor-pointer"
            >
              {t("cancel")}
            </button>

            <button
              type="button"
              onClick={() => {
                if (!isValid) {
                  if (!pkg.name?.trim()) {
                    toast.warning("El nombre del paquete es obligatorio.");
                    return;
                  }
                  if (!pkg.packageItems || pkg.packageItems.length === 0) {
                    toast.warning(
                      "Debes seleccionar al menos un servicio, producto o curso dentro del paquete."
                    );
                    return;
                  }
                  if (!pkg.price || pkg.price <= 0) {
                    toast.warning("El precio promocional del paquete debe ser mayor a 0.");
                    return;
                  }
                }
                onSave(pkg);
              }}
              className="h-11 px-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 border-0 w-full sm:w-auto cursor-pointer"
            >
              <Zap className="w-4 h-4" strokeWidth={2} />
              <span>{t("save_package")}</span>
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
