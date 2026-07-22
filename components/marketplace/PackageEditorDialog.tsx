"use client";
/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/no-event-handler */
/* eslint-disable react-doctor/click-events-have-key-events */
/* eslint-disable react-doctor/prefer-module-scope-static-value */
/* eslint-disable react-doctor/no-pass-data-to-parent */
/* eslint-disable react-doctor/no-giant-component */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import { useTranslations } from "next-intl";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
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
        rVal > 0 ? Math.round(((rVal - p.price) / rVal) * 100) : 15,
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
    let currentItems = [...(pkg.packageItems || [])];
    const existingIndex = currentItems.findIndex((i) => i.id === serviceId);

    if (existingIndex >= 0) {
      const newQuantity = Math.max(
        0,
        currentItems[existingIndex].quantity + delta,
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
              Math.round(((realValue - newPrice) / realValue) * 100),
            ),
          )
        : 0,
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

  const isValid =
    pkg.name &&
    pkg.category &&
    pkg.price >= 0 &&
    (pkg.packageItems || []).length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="[&>button]:hidden bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 !w-[95vw] !max-w-[1200px] p-0 overflow-hidden rounded-3xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* --- HEADER --- */}
        <div className="flex items-start md:items-center justify-between p-6 md:p-8 bg-white dark:bg-[#0a0a0a] border-b border-gray-100 dark:border-gray-800 shrink-0">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0">
              <ShoppingCart
                className="w-6 h-6 text-emerald-600 dark:text-emerald-400"
                strokeWidth={2}
              />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1">
                Ensamblador Comercial
              </p>
              <DialogTitle className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white leading-none">
                {pkg.isNew
                  ? t("dialog_create", { defaultValue: "Nuevo Paquete" })
                  : t("dialog_edit", { defaultValue: "Edición de Paquete" })}
              </DialogTitle>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-12 h-12 flex items-center justify-center rounded-xl bg-gray-50 dark:bg-[#111] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 shrink-0"
          >
            <X className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>

        {/* --- ÁREA DE SCROLL PRINCIPAL --- */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50/50 dark:bg-[#050505]/50 flex flex-col">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]">
            {/* --- COLUMNA IZQUIERDA: IDENTIDAD Y DETALLES --- */}
            <div className="flex flex-col border-b lg:border-b-0 lg:border-r border-gray-100 dark:border-gray-800">
              {/* Fotografía Panorámica */}
              <div className="p-6 md:p-8 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505]/50 flex flex-col">
                <label className="text-xs font-semibold text-gray-500 mb-4 flex items-center gap-2">
                  <Camera className="w-4 h-4" strokeWidth={2} />{" "}
                  {t("photo", { defaultValue: "Recurso Gráfico (Banner)" })}
                </label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleBannerChange}
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "w-full aspect-[21/9] rounded-2xl border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center overflow-hidden transition-colors cursor-pointer group bg-white dark:bg-[#0a0a0a] shadow-sm",
                    pkg.imageUrl
                      ? "border-solid"
                      : "border-dashed hover:bg-gray-50 dark:hover:bg-[#111]",
                  )}
                >
                  {pkg.imageUrl ? (
                    <img
                      src={pkg.imageUrl}
                      alt="Paquete"
                      className="w-full h-full object-cover group-hover:opacity-75 transition-opacity"
                    />
                  ) : (
                    <div className="text-center flex flex-col items-center p-6">
                      <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-[#111] flex items-center justify-center mb-4 transition-colors">
                        <ImagePlus
                          className="w-5 h-5 text-gray-400 group-hover:text-emerald-500"
                          strokeWidth={2}
                        />
                      </div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        Seleccionar Archivo
                      </p>
                      <p className="text-xs font-medium text-gray-500 mt-1">
                        1200x500px Recomendado
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Formulario (Inputs) */}
              <div className="flex flex-col bg-white dark:bg-[#0a0a0a] p-6 md:p-8 gap-6">
                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="flex-1">
                    <label className="text-xs font-semibold text-gray-500 mb-2 block">
                      {t("name_label", { defaultValue: "Denominación" })}{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      value={pkg.name}
                      onChange={(e) =>
                        setPkg({ ...pkg, name: e.target.value })
                      }
                      placeholder="Ej. Paquete Preventivo"
                      className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-0 focus:border-emerald-500 transition-colors placeholder:text-gray-400 placeholder:font-normal"
                    />
                    <div className="mt-2 text-xs font-semibold flex items-center justify-between">
                      <span
                        className={cn(
                          (pkg.name.trim()
                            ? pkg.name.trim().split(/\s+/).length
                            : 0) < 3
                            ? "text-red-500"
                            : "text-emerald-500",
                        )}
                      >
                        {pkg.name.trim()
                          ? pkg.name.trim().split(/\s+/).length
                          : 0}{" "}
                        / 3 Palabras mín.
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-semibold text-gray-500 mb-2 block">
                      {t("category_label", { defaultValue: "Categorización" })}{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      value={pkg.category}
                      onChange={(e) =>
                        setPkg({
                          ...pkg,
                          category: e.target.value,
                        })
                      }
                      placeholder="Ej. Chequeos Generales"
                      className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-0 focus:border-emerald-500 transition-colors placeholder:text-gray-400 placeholder:font-normal"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-2 block">
                    {t("desc_label", {
                      defaultValue: "Especificaciones del paquete",
                    })}
                  </label>
                  <textarea
                    value={pkg.description}
                    onChange={(e) =>
                      setPkg({
                        ...pkg,
                        description: e.target.value,
                      })
                    }
                    placeholder={t("desc_placeholder", {
                      defaultValue: "Descripción comercial...",
                    })}
                    rows={4}
                    className="w-full min-h-[120px] p-4 rounded-xl bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-0 focus:border-emerald-500 transition-colors resize-y placeholder:text-gray-400 placeholder:font-normal"
                  />
                  <div className="mt-2 text-xs font-semibold flex items-center justify-between">
                    <span
                      className={cn(
                        (pkg.description?.length || 0) < 150
                          ? "text-red-500"
                          : "text-emerald-500",
                      )}
                    >
                      {pkg.description?.length || 0} / 150 Caracteres mín.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* --- COLUMNA DERECHA: ENSAMBLE Y MOTOR DE PRECIOS --- */}
            <div className="flex flex-col bg-white dark:bg-[#0a0a0a]">
              {/* 1. SELECCIÓN DE SERVICIOS */}
              <div className="flex flex-col border-b border-gray-100 dark:border-gray-800 flex-1 min-h-[300px]">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505]/50 flex items-center justify-between shrink-0">
                  <label className="text-xs font-semibold text-gray-500 flex items-center gap-2">
                    <CheckSquare className="w-4 h-4" strokeWidth={2} />{" "}
                    {t("included_services", {
                      defaultValue: "Servicios Integrados",
                    })}
                  </label>
                  <span className="bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-3 py-1 text-xs font-bold rounded-full">
                    {(pkg.packageItems || []).reduce(
                      (acc, i) => acc + i.quantity,
                      0,
                    )}{" "}
                    ítems
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar bg-white dark:bg-[#0a0a0a]">
                  {availableServices.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center p-12 h-full">
                      <AlertCircle
                        className="w-8 h-8 text-gray-300 mb-4"
                        strokeWidth={2}
                      />
                      <p className="text-sm font-bold text-gray-500 mb-1">
                        {t("no_services", { defaultValue: "Inventario Vacío" })}
                      </p>
                      <p className="text-xs font-medium text-gray-400 max-w-xs leading-relaxed">
                        {t("no_services_desc", {
                          defaultValue:
                            "Agregue servicios al catálogo previo a la creación de un paquete.",
                        })}
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col p-4 gap-2">
                      {availableServices.map((service) => {
                        const packageItem = (pkg.packageItems || []).find(
                          (i) => i.id === service.id,
                        );
                        const quantity = packageItem ? packageItem.quantity : 0;
                        const isSelected = quantity > 0;
                        return (
                          <div
                            key={service.id}
                            className={cn(
                              "flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl transition-colors border",
                              isSelected
                                ? "bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800/30"
                                : "bg-white dark:bg-[#0a0a0a] border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#111]",
                            )}
                          >
                            <div className="flex-1 min-w-0 flex items-center gap-4">
                              <div className="w-10 h-10 flex items-center justify-center bg-gray-50 dark:bg-[#111] rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-700 dark:text-gray-300">
                                {quantity}x
                              </div>
                              <div className="flex flex-col min-w-0">
                                <p
                                  className={cn(
                                    "text-sm font-bold truncate",
                                    isSelected
                                      ? "text-emerald-900 dark:text-emerald-100"
                                      : "text-gray-900 dark:text-gray-100",
                                  )}
                                >
                                  {service.name}
                                </p>
                                <span className="text-xs font-mono font-medium text-gray-500 mt-1">
                                  ${service.price} c/u
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0a0a0a] overflow-hidden shrink-0 h-10 shadow-sm">
                              <button
                                onClick={() =>
                                  handleQuantityChange(service.id, -1)
                                }
                                className="w-10 h-full flex items-center justify-center text-gray-500 hover:bg-gray-50 dark:hover:bg-[#111] hover:text-gray-900 dark:hover:text-white transition-colors"
                              >
                                -
                              </button>
                              <div className="w-10 h-full flex items-center justify-center text-sm font-bold font-mono border-x border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#050505]">
                                {quantity}
                              </div>
                              <button
                                onClick={() =>
                                  handleQuantityChange(service.id, 1)
                                }
                                className="w-10 h-full flex items-center justify-center text-gray-500 hover:bg-gray-50 dark:hover:bg-[#111] hover:text-gray-900 dark:hover:text-white transition-colors"
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

              {/* 2. MOTOR DE PRECIOS Y VALOR */}
              <div
                className={cn(
                  "p-6 md:p-8 flex flex-col bg-gray-50/50 dark:bg-[#050505]/50 transition-opacity",
                  (pkg.packageItems || []).length === 0 &&
                    "opacity-50 pointer-events-none",
                )}
              >
                {/* Valuación */}
                <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-6 mb-6">
                  <div className="flex flex-col gap-1">
                    <p className="text-xs font-semibold text-gray-500">
                      {t("real_value", { defaultValue: "Valor Técnico" })}
                    </p>
                    <p className="text-base font-mono font-bold text-gray-400 line-through decoration-gray-500">
                      ${realValue}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      {t("saving", { defaultValue: "Diferencial (Ahorro)" })}{" "}
                      <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
                    </p>
                    <p className="text-2xl font-mono font-black tracking-tight text-emerald-600 dark:text-emerald-400">
                      ${savings}
                    </p>
                  </div>
                </div>

                {/* Controles de Precio */}
                <div className="flex flex-col gap-8">
                  <div className="flex flex-col gap-5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-gray-500 flex items-center gap-2">
                        <Percent className="w-4 h-4" strokeWidth={2} />{" "}
                        Descuento Sugerido
                      </label>
                      <span className="bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-bold">
                        {discountPercent}%
                      </span>
                    </div>

                    <Slider
                      value={[discountPercent]}
                      max={60}
                      min={0}
                      step={1}
                      onValueChange={(vals) => applyDiscountPercent(vals[0])}
                      className="py-2"
                    />

                    <div className="flex gap-2">
                      {suggestedDiscounts.map((sug, idx) => (
                        <button
                          key={idx}
                          onClick={() => applyDiscountPercent(sug.percent)}
                          className={cn(
                            "flex-1 h-10 rounded-xl text-xs font-bold transition-colors border",
                            discountPercent === sug.percent
                              ? "bg-emerald-600 text-white border-emerald-600"
                              : "bg-white dark:bg-[#0a0a0a] text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-[#111]",
                          )}
                        >
                          {sug.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <label className="text-xs font-semibold text-gray-500 mb-2">
                      {t("manual_price", {
                        defaultValue: "Valor Comercial Final",
                      })}
                    </label>
                    <div className="relative">
                      <DollarSign
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                        strokeWidth={2}
                      />
                      <input
                        type="number"
                        min="0"
                        value={pkg.price || ""}
                        onChange={(e) =>
                          manualPriceChange(Number(e.target.value))
                        }
                        className="w-full h-14 pl-12 pr-4 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-700 text-xl font-mono font-black text-gray-900 dark:text-white focus:outline-none focus:ring-0 focus:border-emerald-500 transition-colors shadow-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- FOOTER DE COMANDOS --- */}
        <div className="p-6 md:p-8 bg-white dark:bg-[#0a0a0a] border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-2 w-full sm:w-auto text-xs font-semibold text-amber-600 dark:text-amber-500">
            {!isValid && (
              <>
                <Info className="w-4 h-4" strokeWidth={2} />
                <span>Complete los campos obligatorios (*)</span>
              </>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="h-12 px-8 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#111] transition-colors text-sm font-bold w-full sm:w-auto shadow-sm"
            >
              {t("cancel", { defaultValue: "Cancelar" })}
            </button>
            <button
              onClick={() => onSave(pkg)}
              disabled={!isValid}
              className="h-12 px-8 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-sm font-bold flex items-center justify-center gap-2 border-0 w-full sm:w-auto disabled:opacity-50 shadow-sm"
            >
              <Zap className="w-4 h-4" strokeWidth={2} />{" "}
              {t("save_package", { defaultValue: "Confirmar Ensamble" })}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
