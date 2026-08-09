"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/click-events-have-key-events */
/* eslint-disable react-doctor/prefer-module-scope-static-value */
/* eslint-disable react-doctor/no-giant-component */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  Pill,
  ShoppingBag,
  Plus,
  Trash2,
  ArrowLeft,
  CheckCircle2,
  Search,
  Package,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PrescriptionItem } from "@/types/ehr";
import { useCatalog } from "@/hooks/useCatalog";
import { UI_Product } from "@/types/catalog";
import { QhSpinner } from "@/components/ui/QhSpinner";

interface TreatmentCheckoutStepProps {
  prescription: PrescriptionItem[];
  newRx: {
    medicationName: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
    administrationRoute?: string;
    catalogItemId?: number;
    price?: string | number;
    frequencyEnum?: string;
    durationDays?: number | string;
    quantity?: number;
  };
  setNewRx: (rx: any) => void;
  handleAddRx: () => void;
  removePrescriptionItem: (id: string) => void;
  onBack: () => void;
}

export const TreatmentCheckoutStep: React.FC<TreatmentCheckoutStepProps> = ({
  prescription,
  newRx,
  setNewRx,
  handleAddRx,
  removePrescriptionItem,
  onBack,
}) => {
  const t = useTranslations("EHR");
  const { products, isLoading, fetchInventory } = useCatalog();

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredProducts = products.filter((product) =>
    product.name
      .toLowerCase()
      .includes((newRx.medicationName || "").toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectProduct = (product: UI_Product) => {
    setNewRx({
      ...newRx,
      medicationName: product.name,
      catalogItemId: product.id,
      price: product.price || 0,
    });
    setShowDropdown(false);
  };

  const FREQUENCY_OPTIONS = [
    {
      value: "EVERY_4_HOURS",
      label: t("freq_every_4_hours"),
      readable: t("freq_every_4_hours"),
    },
    {
      value: "EVERY_6_HOURS",
      label: t("freq_every_6_hours"),
      readable: t("freq_every_6_hours"),
    },
    {
      value: "EVERY_8_HOURS",
      label: t("freq_every_8_hours"),
      readable: t("freq_every_8_hours"),
    },
    {
      value: "EVERY_12_HOURS",
      label: t("freq_every_12_hours"),
      readable: t("freq_every_12_hours"),
    },
    {
      value: "ONCE_DAILY",
      label: t("freq_once_daily"),
      readable: t("freq_once_daily"),
    },
    {
      value: "AS_NEEDED",
      label: t("freq_as_needed"),
      readable: t("freq_as_needed"),
    },
    { value: "CUSTOM", label: t("freq_custom"), readable: "" },
  ];

  return (
    <div className="h-full flex flex-col max-w-5xl mx-auto w-full font-sans transition-colors">
      {/* ── HEADER TÉCNICO ────────────────────────────────────────────── */}
      <div className="text-center mb-8 flex flex-col items-center space-y-2">
        <div className="w-14 h-14 rounded-3xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-xs">
          <Pill className="w-7 h-7" strokeWidth={2} />
        </div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
          {t("protocol_pharmacological")}
        </p>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
          {t("digital_prescription_closure")}
        </h2>
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 max-w-xl mx-auto leading-relaxed">
          {t("prescription_desc")}
        </p>
      </div>

      {/* ── CONTENEDOR PRINCIPAL ──────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm mb-8 overflow-hidden transition-colors">
        {/* Cabecera Interna */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-[#050505] p-5 sm:p-6 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-xs">
              <Pill className="w-4 h-4" strokeWidth={2} />
            </div>
            <h3 className="text-xs font-bold text-gray-900 dark:text-white tracking-tight">
              {t("form_instructions_title")}
            </h3>
          </div>

          <div className="inline-flex items-center gap-2 bg-emerald-600 text-white px-3.5 py-1.5 rounded-full text-[11px] font-bold shadow-xs shrink-0">
            <ShoppingBag className="w-3.5 h-3.5" strokeWidth={2} />
            <span>{t("linked_catalog")}</span>
          </div>
        </div>

        {/* Formulario e Indicaciones */}
        <div className="p-5 sm:p-6 space-y-6 bg-white dark:bg-[#0a0a0a]">
          {/* Grid de Formulario */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 p-5 rounded-2xl bg-gray-50/50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 shadow-xs">
            {/* Buscador de Producto / Medicamento */}
            <div
              className="col-span-1 md:col-span-6 space-y-1.5 relative"
              ref={dropdownRef}
            >
              <label className="text-xs font-bold text-gray-800 dark:text-gray-200 block">
                {t("medication_or_product")}
              </label>

              <div className="relative flex items-center">
                <Search
                  className="w-4 h-4 absolute left-3.5 text-gray-400 pointer-events-none"
                  strokeWidth={2}
                />
                <Input
                  placeholder={t("search_inventory_placeholder")}
                  value={newRx.medicationName}
                  onChange={(e) => {
                    setNewRx({
                      ...newRx,
                      medicationName: e.target.value,
                      catalogItemId: undefined,
                    });
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  className="bg-white dark:bg-[#0a0a0a] h-11 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white pl-10 pr-10 focus-visible:ring-emerald-500/20 placeholder:text-gray-400 shadow-xs"
                />

                {isLoading && (
                  <div className="absolute right-3.5 flex items-center pointer-events-none">
                    <QhSpinner size="sm" className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                )}
              </div>

              {/* Dropdown de Resultados de Catálogo */}
              {showDropdown && newRx.medicationName.length > 0 && (
                <div className="absolute left-0 right-0 top-full z-50 mt-2 bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl max-h-60 overflow-y-auto custom-scrollbar">
                  {filteredProducts.length > 0 ? (
                    <div className="divide-y divide-gray-100 dark:divide-gray-800/60">
                      {filteredProducts.map((product) => (
                        <div
                          key={product.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => handleSelectProduct(product)}
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleSelectProduct(product)
                          }
                          className="flex items-center gap-3.5 p-3.5 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 cursor-pointer transition-colors group select-none"
                        >
                          {product.imageUrl ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-10 h-10 object-cover rounded-xl border border-gray-200 dark:border-gray-800 shrink-0 bg-white"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#111] flex items-center justify-center shrink-0 text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                              <Package className="w-5 h-5" strokeWidth={2} />
                            </div>
                          )}

                          <div className="space-y-0.5 min-w-0">
                            <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                              {product.name}
                            </p>
                            <div className="flex gap-2 items-center text-[11px] font-semibold text-gray-400 font-mono">
                              <span>
                                {product.price
                                  ? `$${product.price} MXN`
                                  : t("consult_price")}
                              </span>
                              {product.stockQuantity !== undefined && (
                                <span
                                  className={
                                    product.stockQuantity > 0
                                      ? "text-emerald-600 dark:text-emerald-400 font-bold"
                                      : "text-red-500 font-bold"
                                  }
                                >
                                  •{" "}
                                  {product.stockQuantity > 0
                                    ? t("unit_available", {
                                        count: product.stockQuantity,
                                      })
                                    : t("inventory_out_of_stock")}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-xs font-medium text-gray-400 text-center bg-gray-50/50 dark:bg-[#050505]">
                      {t("no_matches_free_text")}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Dosis */}
            <div className="col-span-1 md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-gray-800 dark:text-gray-200 block">
                {t("dosage")}
              </label>
              <Input
                placeholder={t("dosage_placeholder")}
                value={newRx.dosage}
                onChange={(e) =>
                  setNewRx({ ...newRx, dosage: e.target.value })
                }
                className="bg-white dark:bg-[#0a0a0a] h-11 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white focus-visible:ring-emerald-500/20 placeholder:text-gray-400 shadow-xs"
              />
            </div>

            {/* Vía de administración */}
            <div className="col-span-1 md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-gray-800 dark:text-gray-200 block">
                Vía de adm.
              </label>
              <Input
                placeholder="Ej. Oral, Tópica"
                value={newRx.administrationRoute || ""}
                onChange={(e) =>
                  setNewRx({ ...newRx, administrationRoute: e.target.value })
                }
                className="bg-white dark:bg-[#0a0a0a] h-11 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white focus-visible:ring-emerald-500/20 placeholder:text-gray-400 shadow-xs"
              />
            </div>

            {/* Cantidad Venta */}
            <div className="col-span-1 md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-gray-800 dark:text-gray-200 block">
                {t("sale_quantity")}
              </label>
              <Input
                type="number"
                min="1"
                placeholder="1"
                value={newRx.quantity || 1}
                onChange={(e) =>
                  setNewRx({
                    ...newRx,
                    quantity: parseInt(e.target.value) || 1,
                  })
                }
                className="bg-white dark:bg-[#0a0a0a] h-11 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-bold font-mono text-center text-gray-900 dark:text-white focus-visible:ring-emerald-500/20 placeholder:text-gray-400 shadow-xs"
              />
            </div>

            {/* Frecuencia */}
            <div className="col-span-1 md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-gray-800 dark:text-gray-200 block">
                {t("frequency")}
              </label>
              {newRx.frequencyEnum === "CUSTOM" ? (
                <div className="flex gap-2">
                  <Input
                    placeholder="Ej. Cada 8 horas"
                    value={newRx.frequency}
                    onChange={(e) =>
                      setNewRx({ ...newRx, frequency: e.target.value })
                    }
                    className="bg-white dark:bg-[#0a0a0a] h-11 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white focus-visible:ring-emerald-500/20 flex-1 placeholder:text-gray-400 shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setNewRx({ ...newRx, frequencyEnum: "", frequency: "" })
                    }
                    className="w-11 h-11 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 flex justify-center items-center text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors shrink-0 shadow-xs cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" strokeWidth={2} />
                  </button>
                </div>
              ) : (
                <Select
                  value={newRx.frequencyEnum || ""}
                  onValueChange={(val) => {
                    if (val === "CUSTOM") {
                      setNewRx({ ...newRx, frequencyEnum: val, frequency: "" });
                    } else {
                      const opt = FREQUENCY_OPTIONS.find((o) => o.value === val);
                      setNewRx({
                        ...newRx,
                        frequencyEnum: val,
                        frequency: opt?.readable || "",
                      });
                    }
                  }}
                >
                  <SelectTrigger className="bg-white dark:bg-[#0a0a0a] h-11 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white focus:ring-emerald-500/20 shadow-xs">
                    <SelectValue placeholder={t("select_placeholder")} />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl font-sans">
                    {FREQUENCY_OPTIONS.map((opt) => (
                      <SelectItem
                        key={opt.value}
                        value={opt.value}
                        className="text-xs font-semibold cursor-pointer"
                      >
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Duración */}
            <div className="col-span-1 md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-gray-800 dark:text-gray-200 block">
                {t("duration")}
              </label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  min="1"
                  placeholder={t("days_short")}
                  value={newRx.durationDays || ""}
                  onChange={(e) => {
                    const days = e.target.value;
                    setNewRx({
                      ...newRx,
                      durationDays: days,
                      duration: days
                        ? t("duration_days_prefix", { days })
                        : "",
                    });
                  }}
                  className="bg-white dark:bg-[#0a0a0a] h-11 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-bold font-mono text-center text-gray-900 dark:text-white focus-visible:ring-emerald-500/20 w-20 shrink-0 shadow-xs"
                />
                <Input
                  placeholder={t("duration_free_text")}
                  value={newRx.duration}
                  onChange={(e) =>
                    setNewRx({ ...newRx, duration: e.target.value })
                  }
                  className="bg-white dark:bg-[#0a0a0a] h-11 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white focus-visible:ring-emerald-500/20 flex-1 placeholder:text-gray-400 shadow-xs"
                />
              </div>
            </div>

            {/* Instrucciones Extra */}
            <div className="col-span-1 md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-gray-800 dark:text-gray-200 block">
                {t("extra_instructions")}
              </label>
              <Input
                placeholder={t("rx_instructions_placeholder")}
                value={newRx.instructions}
                onChange={(e) =>
                  setNewRx({ ...newRx, instructions: e.target.value })
                }
                className="bg-white dark:bg-[#0a0a0a] h-11 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white focus-visible:ring-emerald-500/20 placeholder:text-gray-400 shadow-xs"
              />
            </div>

            {/* Botón de Agregar */}
            <div className="col-span-1 md:col-span-6 pt-2">
              <button
                type="button"
                onClick={handleAddRx}
                disabled={!newRx.medicationName}
                className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border-0"
              >
                <Plus className="w-4 h-4" strokeWidth={2.5} />
                <span>{t("rx_add_item")}</span>
              </button>
            </div>
          </div>

          {/* Lista de Indicaciones Agregadas */}
          <div className="space-y-3">
            {prescription.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center rounded-3xl border border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-xs">
                  <Pill className="w-6 h-6" strokeWidth={2} />
                </div>
                <p className="text-xs font-medium text-gray-400 max-w-sm">
                  {t("rx_empty_state")}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {prescription.map((item: any, index) => (
                  <div
                    key={item.id || index}
                    className="flex justify-between items-center p-5 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 shadow-xs transition-colors"
                  >
                    <div className="space-y-1 min-w-0 pr-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-bold text-xs text-gray-900 dark:text-white truncate">
                          {item.medicationName}
                        </h4>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold border border-emerald-200 dark:border-emerald-900/40">
                          {item.dosage}
                        </span>

                        {item.catalogItemId && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-bold shadow-2xs">
                            <ShoppingBag className="w-3 h-3" strokeWidth={2} />
                            <span>
                              {t("direct_sale_badge", {
                                qty: item.quantity || 1,
                              })}
                            </span>
                          </span>
                        )}
                      </div>

                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-snug">
                        {item.administrationRoute && (
                          <span className="font-bold text-gray-700 dark:text-gray-300 mr-1">
                            Vía {item.administrationRoute}.
                          </span>
                        )}
                        {t("take_medication", {
                          frequency: item.frequency,
                          duration: item.duration,
                        })}
                      </p>

                      {item.instructions && (
                        <p className="text-[11px] font-medium text-gray-400 italic pt-0.5">
                          {t("note_label")}: {item.instructions}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => removePrescriptionItem(item.id)}
                      className="w-9 h-9 rounded-xl flex items-center justify-center bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors shrink-0 cursor-pointer border border-red-100 dark:border-red-900/30"
                    >
                      <Trash2 className="w-4 h-4" strokeWidth={2} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── FOOTER DE NAVEGACIÓN ──────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0">
        <button
          type="button"
          onClick={onBack}
          className="w-full sm:w-auto h-12 px-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#111] text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={2} />
          <span>{t("btn_back_to_evaluation")}</span>
        </button>

        <div className="text-center sm:text-right text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center flex-wrap justify-center sm:justify-end gap-1.5">
          <span>
            {t("finish_charge_notice", {
              button: "",
            }).split("{button}")[0]}
          </span>
          <span className="inline-flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-900/40">
            <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} />
            <span>{t("finish_charge_btn_text")}</span>
          </span>
        </div>
      </div>
    </div>
  );
};