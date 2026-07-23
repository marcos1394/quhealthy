"use client";
/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/no-giant-component */

import React, { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  PackageSearch,
  Boxes,
  ScanLine,
  Search,
  Plus,
  Filter,
  Pill,
  ShieldCheck,
  CheckCircle2,
  ArrowRightLeft,
  Loader2,
  Save,
  X,
  Activity,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useCatalog } from "@/hooks/useCatalog";
import { catalogService } from "@/services/catalog.service";
import { UI_Product, UI_Supply } from "@/types/catalog";
import { toast } from "react-toastify";

import { BarcodeScanner } from "@/components/ui/BarcodeScanner";
import { QhSpinner } from "@/components/ui/QhSpinner";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type InventoryItem = (UI_Product | UI_Supply) & { type: "PRODUCT" | "SUPPLY" };

export default function InventoryPage() {
  const t = useTranslations("StoreHub");
  const {
    products,
    supplies,
    fetchInventory,
    isLoading: isCatalogLoading,
  } = useCatalog();

  const [
    {
      searchQuery,
      filterType,
      scannedItem,
      adjustingItem,
      adjustmentValue,
      isAdjusting,
    },
    dispatch,
  ] = React.useReducer(
    (state: any, action: any) => {
      switch (action.type) {
        case "SET_SEARCHQUERY":
          return {
            ...state,
            searchQuery:
              typeof action.payload === "function"
                ? action.payload(state.searchQuery)
                : action.payload,
          };
        case "SET_FILTERTYPE":
          return {
            ...state,
            filterType:
              typeof action.payload === "function"
                ? action.payload(state.filterType)
                : action.payload,
          };
        case "SET_SCANNEDITEM":
          return {
            ...state,
            scannedItem:
              typeof action.payload === "function"
                ? action.payload(state.scannedItem)
                : action.payload,
          };
        case "SET_ADJUSTINGITEM":
          return {
            ...state,
            adjustingItem:
              typeof action.payload === "function"
                ? action.payload(state.adjustingItem)
                : action.payload,
          };
        case "SET_ADJUSTMENTVALUE":
          return {
            ...state,
            adjustmentValue:
              typeof action.payload === "function"
                ? action.payload(state.adjustmentValue)
                : action.payload,
          };
        case "SET_ISADJUSTING":
          return {
            ...state,
            isAdjusting:
              typeof action.payload === "function"
                ? action.payload(state.isAdjusting)
                : action.payload,
          };
        default:
          return state;
      }
    },
    {
      searchQuery: "",
      filterType: "ALL",
      scannedItem: null,
      adjustingItem: null,
      adjustmentValue: "",
      isAdjusting: false,
    },
  );

  const setSearchQuery = (val: any) =>
    dispatch({ type: "SET_SEARCHQUERY", payload: val });
  const setFilterType = (val: any) =>
    dispatch({ type: "SET_FILTERTYPE", payload: val });
  const setScannedItem = (val: any) =>
    dispatch({ type: "SET_SCANNEDITEM", payload: val });
  const setAdjustingItem = (val: any) =>
    dispatch({ type: "SET_ADJUSTINGITEM", payload: val });
  const setAdjustmentValue = (val: any) =>
    dispatch({ type: "SET_ADJUSTMENTVALUE", payload: val });
  const setIsAdjusting = (val: any) =>
    dispatch({ type: "SET_ISADJUSTING", payload: val });

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  // Combine products and supplies into a single inventory list
  const inventory: InventoryItem[] = useMemo(() => {
    const p = products.map((p) => ({ ...p, type: "PRODUCT" as const }));
    const s = supplies.map((s) => ({ ...s, type: "SUPPLY" as const }));
    return [...p, ...s];
  }, [products, supplies]);

  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.sku &&
          item.sku.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesType = filterType === "ALL" || item.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [inventory, searchQuery, filterType]);

  const handleScan = (barcode: string) => {
    const found = inventory.find(
      (i) =>
        i.sku?.toUpperCase() === barcode.toUpperCase() ||
        i.name.toUpperCase() === barcode.toUpperCase(),
    );
    if (found) {
      setScannedItem(found);
      setSearchQuery("");
      toast.success(`Ítem localizado: ${found.name}`, { theme: "colored" });
      setAdjustingItem(found);
      setAdjustmentValue(1);
    } else {
      toast.error(`Código no identificado: ${barcode}`, { theme: "colored" });
      setSearchQuery(barcode);
    }
  };

  const handleAdjustStock = async () => {
    if (!adjustingItem || typeof adjustmentValue !== "number") return;

    setIsAdjusting(true);
    try {
      await catalogService.adjustStock(adjustingItem.id, adjustmentValue);
      toast.success(`Inventario actualizado: ${adjustingItem.name}`, {
        theme: "colored",
      });
      setAdjustingItem(null);
      setAdjustmentValue("");
      await fetchInventory();
    } catch (error) {
      toast.error("Fallo en la actualización de stock.", { theme: "colored" });
    } finally {
      setIsAdjusting(false);
    }
  };

  if (isCatalogLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 bg-gray-50/50 dark:bg-[#050505]">
        <QhSpinner
          size="lg"
          className="text-emerald-600 dark:text-emerald-400"
        />
        <p className="text-sm font-semibold text-gray-500 animate-pulse">
          Sincronizando inventario...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] pt-8 px-6 md:px-10 pb-16 transition-colors duration-500">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 flex items-center justify-center shrink-0 shadow-sm">
              <Boxes
                className="w-6 h-6 text-emerald-600 dark:text-emerald-400"
                strokeWidth={2}
              />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1">
                Logística y Almacén
              </p>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white leading-none">
                Control de Inventarios
              </h1>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* --- COLUMNA IZQUIERDA (CONTROLES) --- */}
          <div className="space-y-6 lg:col-span-1">
            {/* Escáner */}
            <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 flex flex-col rounded-3xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] flex items-center gap-2">
                <ScanLine
                  className="w-4 h-4 text-emerald-600 dark:text-emerald-400"
                  strokeWidth={2}
                />
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  Óptica / Escáner
                </span>
              </div>
              <div className="p-6 flex flex-col relative min-h-[200px] items-center justify-center">
                <BarcodeScanner onScan={handleScan} />
              </div>
            </div>

            {/* Filtros */}
            <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 flex flex-col rounded-3xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] flex items-center gap-2">
                <Filter
                  className="w-4 h-4 text-emerald-600 dark:text-emerald-400"
                  strokeWidth={2}
                />
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  Parámetros de Búsqueda
                </span>
              </div>

              <div className="relative border-b border-gray-100 dark:border-gray-800">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                  strokeWidth={2}
                />
                <input
                  placeholder="Buscar nombre o código..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-14 pl-12 pr-4 bg-transparent border-0 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-0 placeholder:text-gray-400 placeholder:font-normal"
                />
              </div>

              <div className="flex bg-gray-50 dark:bg-[#050505] p-2 gap-2">
                <button
                  onClick={() => setFilterType("ALL")}
                  className={cn(
                    "flex-1 h-10 flex items-center justify-center rounded-lg transition-colors text-xs font-bold shadow-sm",
                    filterType === "ALL"
                      ? "bg-white dark:bg-[#111] text-emerald-600 border border-gray-200 dark:border-gray-700"
                      : "bg-transparent text-gray-500 hover:bg-gray-100 dark:hover:bg-[#111]",
                  )}
                >
                  Todos
                </button>
                <button
                  onClick={() => setFilterType("PRODUCT")}
                  className={cn(
                    "flex-1 h-10 flex items-center justify-center gap-2 rounded-lg transition-colors text-xs font-bold shadow-sm",
                    filterType === "PRODUCT"
                      ? "bg-white dark:bg-[#111] text-emerald-600 border border-gray-200 dark:border-gray-700"
                      : "bg-transparent text-gray-500 hover:bg-gray-100 dark:hover:bg-[#111]",
                  )}
                >
                  <Pill className="w-3.5 h-3.5" strokeWidth={2} /> Venta
                </button>
                <button
                  onClick={() => setFilterType("SUPPLY")}
                  className={cn(
                    "flex-1 h-10 flex items-center justify-center gap-2 rounded-lg transition-colors text-xs font-bold shadow-sm",
                    filterType === "SUPPLY"
                      ? "bg-white dark:bg-[#111] text-emerald-600 border border-gray-200 dark:border-gray-700"
                      : "bg-transparent text-gray-500 hover:bg-gray-100 dark:hover:bg-[#111]",
                  )}
                >
                  <ShieldCheck className="w-3.5 h-3.5" strokeWidth={2} />{" "}
                  Insumos
                </button>
              </div>
            </div>
          </div>

          {/* --- COLUMNA DERECHA (KARDEX) --- */}
          <div className="lg:col-span-2 bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 flex flex-col rounded-3xl shadow-sm overflow-hidden min-h-[600px] max-h-[800px]">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] flex items-center justify-between shrink-0">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <PackageSearch
                  className="w-4 h-4 text-emerald-600 dark:text-emerald-400"
                  strokeWidth={2}
                />
                Kardex de Artículos
              </h2>
              <span className="text-xs font-semibold text-gray-500 bg-white dark:bg-[#0a0a0a] px-3 py-1 rounded-full border border-gray-200 dark:border-gray-800 shadow-sm">
                {filteredInventory.length} Registros
              </span>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {filteredInventory.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center p-8">
                  <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-[#111] flex items-center justify-center mb-6">
                    <Boxes className="w-6 h-6 text-gray-400" strokeWidth={2} />
                  </div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    Cero Coincidencias
                  </p>
                  <p className="text-sm font-medium text-gray-500 max-w-xs leading-relaxed">
                    No se encontraron artículos. Intente con otro término o
                    código de barras.
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
                        className="p-6 hover:bg-gray-50 dark:hover:bg-[#111] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-6 cursor-pointer group"
                      >
                        <div className="flex items-start sm:items-center gap-5 flex-1 min-w-0">
                          <div className="w-12 h-12 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-700 flex items-center justify-center shrink-0 shadow-sm group-hover:border-emerald-200 group-hover:bg-emerald-50 dark:group-hover:border-emerald-900/30 dark:group-hover:bg-emerald-900/10 transition-colors">
                            {item.type === "PRODUCT" ? (
                              <Pill
                                className="w-5 h-5 text-gray-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors"
                                strokeWidth={2}
                              />
                            ) : (
                              <ShieldCheck
                                className="w-5 h-5 text-gray-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors"
                                strokeWidth={2}
                              />
                            )}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate mb-2">
                              {item.name}
                            </h4>
                            <div className="flex flex-wrap items-center gap-2">
                              {item.sku && (
                                <span className="bg-gray-100 dark:bg-[#111] px-2 py-0.5 rounded-md text-xs font-mono font-semibold text-gray-600 dark:text-gray-400">
                                  SKU: {item.sku}
                                </span>
                              )}
                              <span className="text-xs font-semibold text-gray-500">
                                {item.type === "PRODUCT"
                                  ? "Público (Venta)"
                                  : "Interno (Insumo)"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0 w-full sm:w-auto">
                          <div className="text-left sm:text-right flex flex-col items-start sm:items-end">
                            <p className="text-xs font-semibold text-gray-500 mb-1.5">
                              Disponible
                            </p>
                            <span
                              className={cn(
                                "inline-flex border px-3 py-1 text-xs font-bold rounded-md shadow-sm",
                                isLowStock
                                  ? "border-red-200 bg-red-50 text-red-600 dark:bg-red-900/10 dark:text-red-400 dark:border-red-900/30"
                                  : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/10 dark:text-emerald-400 dark:border-emerald-900/30",
                              )}
                            >
                              {item.stockQuantity} un.
                            </span>
                          </div>

                          <button
                            className="h-10 px-4 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#111] transition-colors text-xs font-bold flex items-center justify-center gap-2 shadow-sm"
                            onClick={() => {
                              setAdjustingItem(item);
                              setAdjustmentValue("");
                            }}
                          >
                            <ArrowRightLeft
                              className="w-4 h-4"
                              strokeWidth={2}
                            />
                            <span className="hidden sm:inline">Ajustar</span>
                          </button>
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

      {/* --- MODAL AJUSTE DE STOCK --- */}
      <Dialog
        open={!!adjustingItem}
        onOpenChange={(open) => !open && setAdjustingItem(null)}
      >
        <DialogContent className="sm:max-w-lg bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-0 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
          <div className="flex items-start md:items-center justify-between p-6 md:p-8 bg-white dark:bg-[#0a0a0a] border-b border-gray-100 dark:border-gray-800 shrink-0">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0">
                <Activity
                  className="w-6 h-6 text-emerald-600 dark:text-emerald-400"
                  strokeWidth={2}
                />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-1">
                  Modificación Manual
                </p>
                <DialogTitle className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white leading-none">
                  Ajustar Inventario
                </DialogTitle>
              </div>
            </div>
            <button
              onClick={() => setAdjustingItem(null)}
              className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-50 dark:bg-[#111] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0"
            >
              <X className="w-5 h-5 text-gray-500" strokeWidth={2} />
            </button>
          </div>

          <div className="flex flex-col bg-gray-50/50 dark:bg-[#050505]/50">
            <div className="p-6 md:p-8 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]">
              <DialogDescription className="text-sm font-semibold text-gray-500 leading-relaxed bg-gray-50 dark:bg-[#111] p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                Establezca el ajuste para{" "}
                <span className="text-gray-900 dark:text-white font-bold">
                  {adjustingItem?.name}
                </span>
                . Utilice valores positivos para entradas y negativos para
                mermas o uso interno.
              </DialogDescription>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 md:p-8 bg-white dark:bg-[#0a0a0a]">
              {/* Stock Actual */}
              <div className="flex flex-col justify-center bg-gray-50 dark:bg-[#050505] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 items-center text-center">
                <span className="text-xs font-semibold text-gray-500 mb-2">
                  Stock Registrado
                </span>
                <span className="text-4xl font-bold text-gray-900 dark:text-white">
                  {adjustingItem?.stockQuantity}
                </span>
              </div>

              {/* Controles de Ajuste */}
              <div className="flex flex-col justify-center">
                <span className="text-xs font-semibold text-gray-500 mb-2">
                  Diferencial (+ / -)
                </span>
                <div className="flex items-stretch h-14 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0a0a0a] overflow-hidden shadow-sm">
                  <button
                    onClick={() =>
                      setAdjustmentValue((v: any) =>
                        typeof v === "number" ? v - 1 : -1,
                      )
                    }
                    className="w-14 flex items-center justify-center bg-gray-50 dark:bg-[#111] border-r border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-300"
                  >
                    <span className="text-xl font-bold">-</span>
                  </button>
                  <input
                    type="number"
                    className="flex-1 bg-transparent border-0 text-center text-lg font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-0 placeholder:text-gray-300"
                    value={adjustmentValue}
                    onChange={(e) =>
                      setAdjustmentValue(
                        e.target.value === "" ? "" : parseInt(e.target.value),
                      )
                    }
                    placeholder="0"
                  />
                  <button
                    onClick={() =>
                      setAdjustmentValue((v: any) =>
                        typeof v === "number" ? v + 1 : 1,
                      )
                    }
                    className="w-14 flex items-center justify-center bg-gray-50 dark:bg-[#111] border-l border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-300"
                  >
                    <span className="text-xl font-bold">+</span>
                  </button>
                </div>
                <p className="text-xs font-semibold text-gray-500 mt-4 text-center">
                  Proyección Final:{" "}
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold ml-1">
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
          </div>

          <div className="p-6 md:p-8 bg-white dark:bg-[#0a0a0a] border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row justify-end gap-4 shrink-0">
            <button
              onClick={() => setAdjustingItem(null)}
              className="w-full sm:w-auto h-12 px-8 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#111] transition-colors text-sm font-bold shadow-sm disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleAdjustStock}
              disabled={
                isAdjusting ||
                typeof adjustmentValue !== "number" ||
                adjustmentValue === 0
              }
              className="w-full sm:w-auto h-12 px-10 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-sm font-bold flex items-center justify-center gap-2 border-0 shadow-sm disabled:opacity-50"
            >
              {isAdjusting ? (
                <>
                  <QhSpinner size="sm" className="text-current" /> Procesando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" strokeWidth={2} /> Aplicar Auditoría
                </>
              )}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
