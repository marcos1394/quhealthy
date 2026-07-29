"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useState, useEffect, useMemo, useReducer, useCallback } from "react";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";
import {
  PackageSearch,
  Boxes,
  ScanLine,
  Search,
  Filter,
  Pill,
  ShieldCheck,
  ArrowRightLeft,
  Save,
  X,
  Activity,
} from "lucide-react";

import { useCatalog } from "@/hooks/useCatalog";
import { catalogService } from "@/services/catalog.service";
import { UI_Product, UI_Supply } from "@/types/catalog";
import { BarcodeScanner } from "@/components/ui/BarcodeScanner";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type InventoryItem = (UI_Product | UI_Supply) & { type: "PRODUCT" | "SUPPLY" };

interface State {
  searchQuery: string;
  filterType: "ALL" | "PRODUCT" | "SUPPLY";
  scannedItem: InventoryItem | null;
  adjustingItem: InventoryItem | null;
  adjustmentValue: number | "";
  isAdjusting: boolean;
}

type Action =
  | { type: "SET_SEARCHQUERY"; payload: string }
  | { type: "SET_FILTERTYPE"; payload: "ALL" | "PRODUCT" | "SUPPLY" }
  | { type: "SET_SCANNEDITEM"; payload: InventoryItem | null }
  | { type: "SET_ADJUSTINGITEM"; payload: InventoryItem | null }
  | { type: "SET_ADJUSTMENTVALUE"; payload: number | "" }
  | { type: "SET_ISADJUSTING"; payload: boolean };

const initialState: State = {
  searchQuery: "",
  filterType: "ALL",
  scannedItem: null,
  adjustingItem: null,
  adjustmentValue: "",
  isAdjusting: false,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_SEARCHQUERY":
      return { ...state, searchQuery: action.payload };
    case "SET_FILTERTYPE":
      return { ...state, filterType: action.payload };
    case "SET_SCANNEDITEM":
      return { ...state, scannedItem: action.payload };
    case "SET_ADJUSTINGITEM":
      return { ...state, adjustingItem: action.payload };
    case "SET_ADJUSTMENTVALUE":
      return { ...state, adjustmentValue: action.payload };
    case "SET_ISADJUSTING":
      return { ...state, isAdjusting: action.payload };
    default:
      return state;
  }
}

export default function InventoryPage() {
  const t = useTranslations("InventoryManagement");
  const {
    products,
    supplies,
    fetchInventory,
    isLoading: isCatalogLoading,
  } = useCatalog();

  const [state, dispatch] = useReducer(reducer, initialState);

  const {
    searchQuery,
    filterType,
    adjustingItem,
    adjustmentValue,
    isAdjusting,
  } = state;

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  // Combina productos e insumos en una sola lista para Kardex
  const inventory: InventoryItem[] = useMemo(() => {
    const p = (products || []).map((p) => ({ ...p, type: "PRODUCT" as const }));
    const s = (supplies || []).map((s) => ({ ...s, type: "SUPPLY" as const }));
    return [...p, ...s];
  }, [products, supplies]);

  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        item.name.toLowerCase().includes(q) ||
        (item.sku && item.sku.toLowerCase().includes(q));
      const matchesType = filterType === "ALL" || item.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [inventory, searchQuery, filterType]);

  const handleScan = useCallback(
    (barcode: string) => {
      const found = inventory.find(
        (i) =>
          i.sku?.toUpperCase() === barcode.toUpperCase() ||
          i.name.toUpperCase() === barcode.toUpperCase()
      );

      if (found) {
        dispatch({ type: "SET_SCANNEDITEM", payload: found });
        dispatch({ type: "SET_SEARCHQUERY", payload: "" });
        toast.success(t("scanner.scan_success", { name: found.name }));
        dispatch({ type: "SET_ADJUSTINGITEM", payload: found });
        dispatch({ type: "SET_ADJUSTMENTVALUE", payload: 1 });
      } else {
        toast.error(t("scanner.scan_not_found", { barcode }));
        dispatch({ type: "SET_SEARCHQUERY", payload: barcode });
      }
    },
    [inventory, t]
  );

  const handleAdjustStock = async () => {
    if (!adjustingItem || typeof adjustmentValue !== "number") return;

    dispatch({ type: "SET_ISADJUSTING", payload: true });
    try {
      await catalogService.adjustStock(adjustingItem.id, adjustmentValue);
      toast.success(t("toasts.update_success", { name: adjustingItem.name }));
      dispatch({ type: "SET_ADJUSTINGITEM", payload: null });
      dispatch({ type: "SET_ADJUSTMENTVALUE", payload: "" });
      await fetchInventory();
    } catch (error) {
      console.error(error);
      toast.error(t("toasts.update_error"));
    } finally {
      dispatch({ type: "SET_ISADJUSTING", payload: false });
    }
  };

  if (isCatalogLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 bg-gray-50/50 dark:bg-[#050505] transition-colors duration-500">
        <QhSpinner size="lg" />
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 animate-pulse">
          {t("loading")}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] font-sans text-gray-900 dark:text-white selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500 pb-24">
      <div className="max-w-7xl mx-auto px-6 py-10 sm:py-12 space-y-8">
        
        {/* ── HEADER PRINCIPAL ────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 dark:border-gray-800 pb-8">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-sm">
              <Boxes className="w-7 h-7" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-1">
                {t("title")}
              </h1>
              <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
                {t("subtitle")}
              </p>
            </div>
          </div>
        </div>

        {/* ── GRID CONTENEDOR ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* ── COLUMNA IZQUIERDA: CONTROLES Y ESCÁNER ────────────────────── */}
          <div className="space-y-6 lg:col-span-1">
            
            {/* Escáner de Óptica / Código de Barras */}
            <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 flex flex-col rounded-3xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] flex items-center gap-2">
                <ScanLine
                  className="w-4 h-4 text-emerald-600 dark:text-emerald-400"
                  strokeWidth={2}
                />
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  {t("scanner.title")}
                </span>
              </div>
              <div className="p-6 flex flex-col relative min-h-[200px] items-center justify-center">
                <BarcodeScanner onScan={handleScan} />
              </div>
            </div>

            {/* Búsqueda y Filtros de Tipo */}
            <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 flex flex-col rounded-3xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] flex items-center gap-2">
                <Filter
                  className="w-4 h-4 text-emerald-600 dark:text-emerald-400"
                  strokeWidth={2}
                />
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  {t("filters.title")}
                </span>
              </div>

              <div className="relative border-b border-gray-100 dark:border-gray-800">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                  strokeWidth={2}
                />
                <input
                  type="text"
                  placeholder={t("filters.placeholder")}
                  value={searchQuery}
                  onChange={(e) =>
                    dispatch({
                      type: "SET_SEARCHQUERY",
                      payload: e.target.value,
                    })
                  }
                  className="w-full h-12 pl-11 pr-4 bg-transparent border-0 text-xs font-bold text-gray-900 dark:text-white focus:outline-none placeholder:text-gray-400 placeholder:font-normal"
                />
              </div>

              {/* Selector Tabular */}
              <div className="flex bg-gray-50/50 dark:bg-[#050505] p-2 gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    dispatch({ type: "SET_FILTERTYPE", payload: "ALL" })
                  }
                  className={cn(
                    "flex-1 h-9 flex items-center justify-center rounded-xl transition-all text-xs font-bold shadow-sm",
                    filterType === "ALL"
                      ? "bg-white dark:bg-[#0a0a0a] text-emerald-700 dark:text-emerald-400 border border-gray-200 dark:border-gray-800"
                      : "bg-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-200"
                  )}
                >
                  {t("filters.all")}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    dispatch({ type: "SET_FILTERTYPE", payload: "PRODUCT" })
                  }
                  className={cn(
                    "flex-1 h-9 flex items-center justify-center gap-1.5 rounded-xl transition-all text-xs font-bold shadow-sm",
                    filterType === "PRODUCT"
                      ? "bg-white dark:bg-[#0a0a0a] text-emerald-700 dark:text-emerald-400 border border-gray-200 dark:border-gray-800"
                      : "bg-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-200"
                  )}
                >
                  <Pill className="w-3.5 h-3.5" strokeWidth={2} />
                  <span>{t("filters.products")}</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    dispatch({ type: "SET_FILTERTYPE", payload: "SUPPLY" })
                  }
                  className={cn(
                    "flex-1 h-9 flex items-center justify-center gap-1.5 rounded-xl transition-all text-xs font-bold shadow-sm",
                    filterType === "SUPPLY"
                      ? "bg-white dark:bg-[#0a0a0a] text-emerald-700 dark:text-emerald-400 border border-gray-200 dark:border-gray-800"
                      : "bg-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-200"
                  )}
                >
                  <ShieldCheck className="w-3.5 h-3.5" strokeWidth={2} />
                  <span>{t("filters.supplies")}</span>
                </button>
              </div>
            </div>
          </div>

          {/* ── COLUMNA DERECHA: KARDEX Y LISTADO ─────────────────────────── */}
          <div className="lg:col-span-2 bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 flex flex-col rounded-3xl shadow-sm overflow-hidden min-h-[550px] max-h-[750px]">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] flex items-center justify-between shrink-0">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
                <PackageSearch
                  className="w-4 h-4 text-emerald-600 dark:text-emerald-400"
                  strokeWidth={2}
                />
                <span>{t("kardex.title")}</span>
              </h2>
              <span className="text-[10px] font-mono font-bold text-gray-500 dark:text-gray-400 bg-white dark:bg-[#0a0a0a] px-3 py-1 rounded-full border border-gray-100 dark:border-gray-800 shadow-sm">
                {t("kardex.item_count", { count: filteredInventory.length })}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {filteredInventory.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full min-h-[350px] text-center p-8 gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 flex items-center justify-center text-gray-400 shadow-sm">
                    <Boxes className="w-7 h-7" strokeWidth={2} />
                  </div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">
                    {t("kardex.empty_title")}
                  </p>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed">
                    {t("kardex.empty_desc")}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filteredInventory.map((item) => {
                    const isLowStock =
                      item.stockQuantity <= (item.stockAlertThreshold || 5);

                    return (
                      <div
                        key={item.id}
                        className="p-6 hover:bg-gray-50/50 dark:hover:bg-[#111]/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-6"
                      >
                        <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                          <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 flex items-center justify-center shrink-0 text-gray-400 shadow-sm">
                            {item.type === "PRODUCT" ? (
                              <Pill className="w-5 h-5" strokeWidth={2} />
                            ) : (
                              <ShieldCheck className="w-5 h-5" strokeWidth={2} />
                            )}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-bold text-xs text-gray-900 dark:text-white truncate mb-1">
                              {item.name}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2">
                              {item.sku && (
                                <span className="bg-gray-100 dark:bg-gray-800/60 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold text-gray-600 dark:text-gray-300">
                                  SKU: {item.sku}
                                </span>
                              )}
                              <span className="text-[10px] font-medium text-gray-400">
                                {item.type === "PRODUCT"
                                  ? t("kardex.type_product")
                                  : t("kardex.type_supply")}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0 w-full sm:w-auto">
                          <div className="text-left sm:text-right flex flex-col items-start sm:items-end">
                            <span className="text-[10px] font-bold text-gray-400 mb-1">
                              {t("kardex.stock_label")}
                            </span>
                            <span
                              className={cn(
                                "inline-flex px-3 py-1 text-[10px] font-mono font-bold rounded-full shadow-sm border",
                                isLowStock
                                  ? "border-rose-200 bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/40"
                                  : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40"
                              )}
                            >
                              {t("kardex.unit_tag", { count: item.stockQuantity })}
                            </span>
                          </div>

                          <Button
                            variant="outline"
                            onClick={() => {
                              dispatch({
                                type: "SET_ADJUSTINGITEM",
                                payload: item,
                              });
                              dispatch({
                                type: "SET_ADJUSTMENTVALUE",
                                payload: "",
                              });
                            }}
                            className="h-10 px-4 rounded-xl border-gray-200 dark:border-gray-800 text-xs font-bold shadow-sm flex items-center gap-1.5"
                          >
                            <ArrowRightLeft className="w-3.5 h-3.5" strokeWidth={2} />
                            <span>{t("kardex.btn_adjust")}</span>
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* ── MODAL AJUSTE DE STOCK ─────────────────────────────────────── */}
      <Dialog
        open={!!adjustingItem}
        onOpenChange={(open) =>
          !open && dispatch({ type: "SET_ADJUSTINGITEM", payload: null })
        }
      >
        <DialogContent className="sm:max-w-md bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-0 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
          <div className="flex items-center justify-between p-6 md:p-8 bg-gray-50/50 dark:bg-[#050505] border-b border-gray-100 dark:border-gray-800 shrink-0">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-sm">
                <Activity className="w-6 h-6" strokeWidth={2} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">
                  {t("modal_adjust.header_category")}
                </p>
                <DialogTitle className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                  {t("modal_adjust.title")}
                </DialogTitle>
              </div>
            </div>
            <button
              type="button"
              onClick={() => dispatch({ type: "SET_ADJUSTINGITEM", payload: null })}
              className="w-9 h-9 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] hover:bg-gray-50 dark:hover:bg-[#111] flex items-center justify-center transition-all shadow-sm text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              <X className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>

          <div className="flex flex-col bg-white dark:bg-[#0a0a0a] p-6 md:p-8 gap-5">
            <DialogDescription className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed bg-gray-50/50 dark:bg-[#050505] p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
              {t("modal_adjust.description", {
                name: adjustingItem?.name || "",
              })}
            </DialogDescription>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Stock Registrado */}
              <div className="flex flex-col justify-center bg-gray-50/50 dark:bg-[#050505] p-4 rounded-2xl border border-gray-100 dark:border-gray-800 items-center text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                  {t("modal_adjust.current_stock")}
                </span>
                <span className="text-3xl font-mono font-bold text-gray-900 dark:text-white">
                  {adjustingItem?.stockQuantity || 0}
                </span>
              </div>

              {/* Controles de Ajuste (+ / -) */}
              <div className="flex flex-col justify-center space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 text-center sm:text-left">
                  {t("modal_adjust.differential_label")}
                </span>
                <div className="flex items-center h-11 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] overflow-hidden shadow-sm">
                  <button
                    type="button"
                    onClick={() =>
                      dispatch({
                        type: "SET_ADJUSTMENTVALUE",
                        payload:
                          typeof adjustmentValue === "number"
                            ? adjustmentValue - 1
                            : -1,
                      })
                    }
                    className="w-10 h-full flex items-center justify-center bg-gray-50 dark:bg-gray-800/50 border-r border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-gray-700 dark:text-gray-200 font-bold"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    className="flex-1 bg-transparent border-0 text-center text-xs font-mono font-bold text-gray-900 dark:text-white focus:outline-none"
                    value={adjustmentValue}
                    onChange={(e) =>
                      dispatch({
                        type: "SET_ADJUSTMENTVALUE",
                        payload:
                          e.target.value === ""
                            ? ""
                            : parseInt(e.target.value, 10),
                      })
                    }
                    placeholder="0"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      dispatch({
                        type: "SET_ADJUSTMENTVALUE",
                        payload:
                          typeof adjustmentValue === "number"
                            ? adjustmentValue + 1
                            : 1,
                      })
                    }
                    className="w-10 h-full flex items-center justify-center bg-gray-50 dark:bg-gray-800/50 border-l border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-gray-700 dark:text-gray-200 font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Proyección Final */}
            <div className="text-center pt-2">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                {t("modal_adjust.final_projection")}{" "}
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 ml-1">
                  {adjustingItem
                    ? adjustingItem.stockQuantity +
                      (typeof adjustmentValue === "number"
                        ? adjustmentValue
                        : 0)
                    : 0}
                </span>
              </p>
            </div>
          </div>

          <div className="p-6 md:p-8 bg-gray-50/50 dark:bg-[#050505] border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row justify-end gap-3 shrink-0">
            <Button
              variant="outline"
              onClick={() => dispatch({ type: "SET_ADJUSTINGITEM", payload: null })}
              className="h-11 px-6 rounded-xl border-gray-200 dark:border-gray-800 text-xs font-bold"
            >
              {t("modal_adjust.btn_cancel")}
            </Button>
            <Button
              onClick={handleAdjustStock}
              disabled={
                isAdjusting ||
                typeof adjustmentValue !== "number" ||
                adjustmentValue === 0
              }
              className="h-11 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm border-0 disabled:opacity-50"
            >
              {isAdjusting ? (
                <>
                  <QhSpinner size="sm" />
                  <span>{t("modal_adjust.btn_saving")}</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" strokeWidth={2} />
                  <span>{t("modal_adjust.btn_save")}</span>
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}