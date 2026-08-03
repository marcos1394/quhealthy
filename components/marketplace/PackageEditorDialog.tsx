"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable @next/next/no-img-element */

import React, { useState, useEffect, useRef } from "react";
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
} from "lucide-react";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { UI_Package, UI_Service } from "@/types/catalog";

interface PackageEditorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: UI_Package | null;
  availableServices: UI_Service[];
  onSave: (pkg: UI_Package) => void;
  onImageUpload?: (id: number, file: File) => void;
}

export function PackageEditorDialog({
  isOpen,
  onClose,
  initialData,
  availableServices,
  onSave,
  onImageUpload,
}: PackageEditorDialogProps) {
  const t = useTranslations("Marketplace.packages");

  const [pkg, setPkg] = useState<UI_Package | null>(null);
  const [discountPercent, setDiscountPercent] = useState(15);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    }
  }, [isOpen, initialData]);

  if (!pkg) return null;

  const realValue = calculateRealValue(pkg.packageItems);
  const savings = Math.max(0, realValue - pkg.price);

  function calculateRealValue(items: UI_Package["packageItems"]) {
    if (!items) return 0;
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  const handleQuantityChange = (serviceId: number, delta: number) => {
    const currentItems = [...(pkg.packageItems || [])];
    const existingIndex = currentItems.findIndex((i) => i.id === serviceId);

    if (existingIndex >= 0) {
      const newQuantity = Math.max(
        0,
        currentItems[existingIndex].quantity + delta
      );
      if (newQuantity === 0) {
        currentItems.splice(existingIndex, 1);
      } else {
        currentItems[existingIndex].quantity = newQuantity;
      }
    } else if (delta > 0) {
      const service = availableServices.find((s) => s.id === serviceId);
      if (service) {
        currentItems.push({
          id: service.id,
          name: service.name,
          type: "SERVICE",
          price: service.price,
          quantity: delta,
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
      <DialogContent className="[&>button]:hidden bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 !w-[95vw] !max-w-[1200px] p-0 overflow-hidden rounded-3xl shadow-2xl flex flex-col max-h-[90vh] font-sans transition-colors select-none">
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
              {/* 1. SELECCIÓN DE SERVICIOS INCLUIDOS */}
              <div className="flex flex-col border-b border-gray-100 dark:border-gray-800 flex-1 min-h-[280px]">
                <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-[#050505] flex items-center justify-between shrink-0">
                  <label className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                    <span>{t("included_services")}</span>
                  </label>

                  <span className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 px-2.5 py-0.5 text-[11px] font-bold font-mono rounded-full shadow-2xs">
                    {t("items_count", { count: totalItemsCount })}
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar bg-white dark:bg-[#0a0a0a]">
                  {availableServices.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center p-10 h-full space-y-2">
                      <AlertCircle className="w-7 h-7 text-gray-300 dark:text-gray-600" strokeWidth={2} />
                      <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
                        {t("no_services")}
                      </p>
                      <p className="text-[11px] font-medium text-gray-400 max-w-xs leading-relaxed">
                        {t("no_services_desc")}
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col p-4 gap-2">
                      {availableServices.map((service) => {
                        const packageItem = (pkg.packageItems || []).find(
                          (i) => i.id === service.id
                        );
                        const quantity = packageItem ? packageItem.quantity : 0;
                        const isSelected = quantity > 0;

                        return (
                          <div
                            key={service.id}
                            className={cn(
                              "flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl transition-all border shadow-2xs",
                              isSelected
                                ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-900/40"
                                : "bg-white dark:bg-[#0a0a0a] border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-[#050505]"
                            )}
                          >
                            <div className="flex-1 min-w-0 flex items-center gap-3">
                              <div className="w-9 h-9 flex items-center justify-center bg-gray-50 dark:bg-[#050505] rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-bold font-mono text-gray-700 dark:text-gray-300 shrink-0">
                                {quantity}x
                              </div>

                              <div className="flex flex-col min-w-0 space-y-0.5">
                                <p
                                  className={cn(
                                    "text-xs font-bold truncate leading-tight",
                                    isSelected
                                      ? "text-emerald-950 dark:text-emerald-200"
                                      : "text-gray-900 dark:text-white"
                                  )}
                                >
                                  {service.name}
                                </p>
                                <span className="text-[11px] font-mono font-bold text-gray-400">
                                  ${service.price} c/u
                                </span>
                              </div>
                            </div>

                            {/* Controles Incrementar / Decrementar */}
                            <div className="flex items-center rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] overflow-hidden shrink-0 h-9 shadow-2xs self-start sm:self-center">
                              <button
                                type="button"
                                onClick={() =>
                                  handleQuantityChange(service.id, -1)
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
                                  handleQuantityChange(service.id, 1)
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
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                        <Percent className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                        <span>{t("suggested_discount")}</span>
                      </label>
                      <span className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 px-2.5 py-0.5 rounded-full text-xs font-bold font-mono shadow-2xs">
                        {discountPercent}%
                      </span>
                    </div>

                    <Slider
                      value={[discountPercent]}
                      max={60}
                      min={0}
                      step={1}
                      onValueChange={(vals) => applyDiscountPercent(vals[0])}
                      className="py-1"
                    />

                    <div className="flex gap-2">
                      {suggestedDiscounts.map((sug, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => applyDiscountPercent(sug.percent)}
                          className={cn(
                            "flex-1 h-9 rounded-xl text-xs font-bold font-mono transition-all border cursor-pointer shadow-2xs",
                            discountPercent === sug.percent
                              ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                              : "bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:border-emerald-500/30"
                          )}
                        >
                          {sug.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Campo de precio comercial manual */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-800 dark:text-gray-200 block">
                      {t("manual_price")}
                    </label>
                    <div className="relative">
                      <DollarSign
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600 dark:text-emerald-400 pointer-events-none"
                        strokeWidth={2}
                      />
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
              onClick={() => onSave(pkg)}
              disabled={!isValid}
              className="h-11 px-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 border-0 w-full sm:w-auto cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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