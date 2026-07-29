"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useEffect, useReducer, useCallback } from "react";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";
import {
  ShoppingCart,
  Plus,
  CheckCircle2,
  XCircle,
  PackagePlus,
  X,
  Truck,
  Banknote,
} from "lucide-react";

import {
  purchaseOrderService,
  CreatePurchaseOrderRequest,
} from "@/services/purchase-order.service";
import { supplierService } from "@/services/supplier.service";
import { paymentService } from "@/services/payment.service";
import { useCatalog } from "@/hooks/useCatalog";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface OrderItem {
  catalogItemId: number;
  quantity: number;
  unitCost: number;
}

interface NewOrderState {
  supplierId?: number;
  items: OrderItem[];
}

interface State {
  orders: any[];
  suppliers: any[];
  isLoading: boolean;
  isNewOrderModalOpen: boolean;
  newOrder: NewOrderState;
  selectedCatalogItemId: string;
  itemQuantity: string | number;
  itemCost: string | number;
  receivingOrder: any | null;
  paymentMethod: "CASH" | "TRANSFER" | "CREDIT";
  payFromCashRegister: boolean;
}

type Action =
  | { type: "SET_ORDERS"; payload: any }
  | { type: "SET_SUPPLIERS"; payload: any }
  | { type: "SET_ISLOADING"; payload: boolean }
  | { type: "SET_ISNEWORDERMODALOPEN"; payload: boolean }
  | { type: "SET_NEWORDER"; payload: NewOrderState }
  | { type: "SET_SELECTEDCATALOGITEMID"; payload: string }
  | { type: "SET_ITEMQUANTITY"; payload: string | number }
  | { type: "SET_ITEMCOST"; payload: string | number }
  | { type: "SET_RECEIVINGORDER"; payload: any }
  | { type: "SET_PAYMENTMETHOD"; payload: "CASH" | "TRANSFER" | "CREDIT" }
  | { type: "SET_PAYFROMCASHREGISTER"; payload: boolean };

const initialState: State = {
  orders: [],
  suppliers: [],
  isLoading: true,
  isNewOrderModalOpen: false,
  newOrder: { items: [] },
  selectedCatalogItemId: "",
  itemQuantity: "",
  itemCost: "",
  receivingOrder: null,
  paymentMethod: "CASH",
  payFromCashRegister: true,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_ORDERS":
      return { ...state, orders: typeof action.payload === "function" ? action.payload(state.orders) : action.payload };
    case "SET_SUPPLIERS":
      return { ...state, suppliers: typeof action.payload === "function" ? action.payload(state.suppliers) : action.payload };
    case "SET_ISLOADING":
      return { ...state, isLoading: action.payload };
    case "SET_ISNEWORDERMODALOPEN":
      return { ...state, isNewOrderModalOpen: action.payload };
    case "SET_NEWORDER":
      return { ...state, newOrder: action.payload };
    case "SET_SELECTEDCATALOGITEMID":
      return { ...state, selectedCatalogItemId: action.payload };
    case "SET_ITEMQUANTITY":
      return { ...state, itemQuantity: action.payload };
    case "SET_ITEMCOST":
      return { ...state, itemCost: action.payload };
    case "SET_RECEIVINGORDER":
      return { ...state, receivingOrder: action.payload };
    case "SET_PAYMENTMETHOD":
      return { ...state, paymentMethod: action.payload };
    case "SET_PAYFROMCASHREGISTER":
      return { ...state, payFromCashRegister: action.payload };
    default:
      return state;
  }
}

export default function PurchasesPage() {
  const t = useTranslations("PurchaseOrders");
  const { products, supplies } = useCatalog();

  const [state, dispatch] = useReducer(reducer, initialState);

  const {
    orders,
    suppliers,
    isLoading,
    isNewOrderModalOpen,
    newOrder,
    selectedCatalogItemId,
    itemQuantity,
    itemCost,
    receivingOrder,
    paymentMethod,
    payFromCashRegister,
  } = state;

  const catalogItems = [...(products || []), ...(supplies || [])];

  const fetchData = useCallback(async () => {
    dispatch({ type: "SET_ISLOADING", payload: true });
    try {
      const [ordersRes, suppliersRes] = await Promise.all([
        purchaseOrderService.getPurchaseOrders(0, 100),
        supplierService.getSuppliers(0, 100),
      ]);
      dispatch({ type: "SET_ORDERS", payload: ordersRes.content || [] });
      dispatch({ type: "SET_SUPPLIERS", payload: suppliersRes.content || [] });
    } catch (error) {
      console.error(error);
      toast.error(t("toasts.read_error"));
    } finally {
      dispatch({ type: "SET_ISLOADING", payload: false });
    }
  }, [t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddItem = () => {
    const qty = Number(itemQuantity);
    const cost = Number(itemCost);

    if (!selectedCatalogItemId || isNaN(qty) || isNaN(cost) || qty <= 0 || cost < 0) {
      return;
    }

    const currentItems = newOrder.items || [];
    dispatch({
      type: "SET_NEWORDER",
      payload: {
        ...newOrder,
        items: [
          ...currentItems,
          {
            catalogItemId: parseInt(selectedCatalogItemId, 10),
            quantity: qty,
            unitCost: cost,
          },
        ],
      },
    });

    dispatch({ type: "SET_SELECTEDCATALOGITEMID", payload: "" });
    dispatch({ type: "SET_ITEMQUANTITY", payload: "" });
    dispatch({ type: "SET_ITEMCOST", payload: "" });
  };

  const handleRemoveItem = (index: number) => {
    const currentItems = [...(newOrder.items || [])];
    currentItems.splice(index, 1);
    dispatch({
      type: "SET_NEWORDER",
      payload: { ...newOrder, items: currentItems },
    });
  };

  const handleCreateOrder = async () => {
    if (!newOrder.supplierId || !newOrder.items || newOrder.items.length === 0) {
      toast.error(t("toasts.incomplete_data"));
      return;
    }

    try {
      await purchaseOrderService.createPurchaseOrder(
        newOrder as CreatePurchaseOrderRequest
      );
      toast.success(t("toasts.order_created"));
      dispatch({ type: "SET_ISNEWORDERMODALOPEN", payload: false });
      dispatch({ type: "SET_NEWORDER", payload: { items: [] } });
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error(t("toasts.order_error"));
    }
  };

  const handleReceiveOrder = async () => {
    if (!receivingOrder) return;

    try {
      await purchaseOrderService.receivePurchaseOrder(
        receivingOrder.id,
        paymentMethod
      );

      if (paymentMethod === "CASH" && payFromCashRegister) {
        try {
          await paymentService.registerManualExpense({
            description: `Pago O.C. #${receivingOrder.id} - ${receivingOrder.supplier?.name || ""}`,
            amount: receivingOrder.totalAmount,
            expenseDenominations: {},
          });
          toast.success(t("toasts.received_success"));
        } catch (cashError) {
          console.error(cashError);
          toast.warning(t("toasts.cash_warning"));
        }
      } else {
        toast.success(t("toasts.received_no_cash"));
      }

      dispatch({ type: "SET_RECEIVINGORDER", payload: null });
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error(t("toasts.receive_error"));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SENT":
        return (
          <span className="border border-blue-200 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-900/40 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 shadow-sm">
            <Truck className="w-3.5 h-3.5" strokeWidth={2} />
            {t("status.sent")}
          </span>
        );
      case "RECEIVED":
        return (
          <span className="border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} />
            {t("status.received")}
          </span>
        );
      case "CANCELLED":
        return (
          <span className="border border-rose-200 bg-rose-50 dark:bg-rose-950/30 dark:border-rose-900/40 text-rose-700 dark:text-rose-400 px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 shadow-sm">
            <XCircle className="w-3.5 h-3.5" strokeWidth={2} />
            {t("status.cancelled")}
          </span>
        );
      default:
        return (
          <span className="border border-gray-200 bg-gray-50 dark:bg-[#111] dark:border-gray-800 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-[10px] font-bold shadow-sm">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] font-sans text-gray-900 dark:text-white selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500 pb-24">
      <div className="max-w-7xl mx-auto px-6 py-10 sm:py-12 space-y-8">
        
        {/* ── HEADER ────────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 dark:border-gray-800 pb-8">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-sm">
              <PackagePlus className="w-7 h-7" strokeWidth={2} />
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

          <Button
            className="w-full md:w-auto h-11 px-6 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white flex items-center justify-center gap-2 text-xs font-bold rounded-xl border-0 shadow-sm transition-all"
            onClick={() =>
              dispatch({ type: "SET_ISNEWORDERMODALOPEN", payload: true })
            }
          >
            <Plus className="w-4 h-4" strokeWidth={2} />
            <span>{t("btn_new_order")}</span>
          </Button>
        </div>

        {/* ── HISTORIAL DE ÓRDENES ──────────────────────────────────────── */}
        <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 flex flex-col rounded-3xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505]">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">
              {t("table_title")}
            </h2>
          </div>

          {isLoading ? (
            <div className="p-16 flex flex-col justify-center items-center gap-3">
              <QhSpinner size="lg" />
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 animate-pulse">
                {t("loading")}
              </p>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-16 flex flex-col justify-center items-center text-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 flex items-center justify-center text-gray-400 shadow-sm">
                <ShoppingCart className="w-7 h-7" strokeWidth={2} />
              </div>
              <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">
                {t("empty_title")}
              </p>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed">
                {t("empty_desc")}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {orders.map((order: any) => (
                <div
                  key={order.id}
                  className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-gray-50/50 dark:hover:bg-[#111]/50 transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 flex items-center justify-center shrink-0 shadow-sm text-gray-400">
                      <ShoppingCart className="w-5 h-5" strokeWidth={2} />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-3 mb-1.5">
                        <h3 className="font-mono font-bold text-xs text-gray-900 dark:text-white">
                          DOC-{order.id.toString().padStart(4, "0")}
                        </h3>
                        {getStatusBadge(order.status)}
                      </div>
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                        {t("supplier_label")}{" "}
                        <span className="text-gray-900 dark:text-white font-bold">
                          {order.supplier?.name}
                        </span>
                      </p>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium text-gray-400">
                        <span className="bg-gray-100 dark:bg-gray-800/60 px-2.5 py-0.5 rounded-lg font-mono font-bold text-gray-600 dark:text-gray-300">
                          {new Date(order.orderDate).toLocaleDateString("es-MX", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                        <span>•</span>
                        <span className="font-semibold">
                          {t("items_count", { count: order.items?.length || 0 })}
                        </span>
                        <span>•</span>
                        <span className="text-gray-900 dark:text-white font-mono font-bold">
                          {t("total_label")} ${order.totalAmount?.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex justify-end w-full md:w-auto">
                    {order.status === "SENT" && (
                      <Button
                        onClick={() =>
                          dispatch({ type: "SET_RECEIVINGORDER", payload: order })
                        }
                        className="h-10 px-5 rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-500 dark:hover:text-white transition-all text-xs font-bold flex items-center gap-2 shadow-sm"
                      >
                        <Truck className="w-4 h-4" strokeWidth={2} />
                        <span>{t("btn_audit_receipt")}</span>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── MODAL NUEVA ORDEN DE COMPRA ───────────────────────────────── */}
        <Dialog
          open={isNewOrderModalOpen}
          onOpenChange={(open) =>
            !open && dispatch({ type: "SET_ISNEWORDERMODALOPEN", payload: false })
          }
        >
          <DialogContent className="sm:max-w-4xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-0 rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
            
            <div className="flex items-center justify-between p-6 md:p-8 bg-gray-50/50 dark:bg-[#050505] border-b border-gray-100 dark:border-gray-800 shrink-0">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-sm">
                  <PackagePlus className="w-6 h-6" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">
                    {t("modal_new.header_category")}
                  </p>
                  <DialogTitle className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                    {t("modal_new.title")}
                  </DialogTitle>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  dispatch({ type: "SET_ISNEWORDERMODALOPEN", payload: false })
                }
                className="w-9 h-9 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] hover:bg-gray-50 dark:hover:bg-[#111] flex items-center justify-center transition-all shadow-sm text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                <X className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar bg-white dark:bg-[#0a0a0a] flex flex-col gap-6 p-6 md:p-8">
              
              {/* Selección de Proveedor */}
              <div className="p-6 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/40 dark:bg-[#050505]/40 space-y-3">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  {t("modal_new.step1_title")}
                </label>
                <Select
                  onValueChange={(val) =>
                    dispatch({
                      type: "SET_NEWORDER",
                      payload: { ...newOrder, supplierId: parseInt(val, 10) },
                    })
                  }
                >
                  <SelectTrigger className="w-full h-11 px-3 text-xs font-bold rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-sm">
                    <SelectValue placeholder={t("modal_new.step1_placeholder")} />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-lg max-h-52">
                    {suppliers.map((s: any) => (
                      <SelectItem
                        key={s.id}
                        value={s.id.toString()}
                        className="text-xs font-bold rounded-xl"
                      >
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Agregar Partidas */}
              <div className="p-6 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/40 dark:bg-[#050505]/40 space-y-4">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  {t("modal_new.step2_title")}
                </label>

                <div className="flex flex-col md:flex-row gap-2">
                  <div className="flex-1">
                    <Select
                      value={selectedCatalogItemId}
                      onValueChange={(val) =>
                        dispatch({
                          type: "SET_SELECTEDCATALOGITEMID",
                          payload: val,
                        })
                      }
                    >
                      <SelectTrigger className="w-full h-11 px-3 text-xs font-bold rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-sm">
                        <SelectValue placeholder={t("modal_new.item_placeholder")} />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-lg max-h-52">
                        {catalogItems.map((i) => (
                          <SelectItem
                            key={i.id}
                            value={i.id.toString()}
                            className="text-xs font-bold rounded-xl"
                          >
                            {i.name} (
                            {t("modal_new.stock_available", {
                              quantity: i.stockQuantity,
                            })}
                            )
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <input
                    type="number"
                    placeholder={t("modal_new.col_qty")}
                    className="w-full md:w-28 h-11 px-3 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-mono font-bold text-gray-900 dark:text-white text-center focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
                    value={itemQuantity}
                    onChange={(e) =>
                      dispatch({
                        type: "SET_ITEMQUANTITY",
                        payload: e.target.value ? parseInt(e.target.value, 10) : "",
                      })
                    }
                  />

                  <div className="w-full md:w-36 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">
                      $
                    </span>
                    <input
                      type="number"
                      placeholder={t("modal_new.col_unit_cost")}
                      className="w-full h-11 pl-7 pr-3 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-mono font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
                      value={itemCost}
                      onChange={(e) =>
                        dispatch({
                          type: "SET_ITEMCOST",
                          payload: e.target.value ? parseFloat(e.target.value) : "",
                        })
                      }
                    />
                  </div>

                  <Button
                    type="button"
                    onClick={handleAddItem}
                    className="h-11 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm transition-all border-0 flex items-center justify-center shrink-0"
                  >
                    <Plus className="w-4 h-4" strokeWidth={2} />
                  </Button>
                </div>

                {/* Tabla de Items */}
                {newOrder.items && newOrder.items.length > 0 && (
                  <div className="rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm bg-white dark:bg-[#0a0a0a]">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50/50 dark:bg-[#050505] border-b border-gray-100 dark:border-gray-800">
                        <tr>
                          <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            {t("modal_new.col_qty")}
                          </th>
                          <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            {t("modal_new.col_concept")}
                          </th>
                          <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400 text-right">
                            {t("modal_new.col_unit_cost")}
                          </th>
                          <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400 text-right">
                            {t("modal_new.col_subtotal")}
                          </th>
                          <th className="px-4 py-3 w-10"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {newOrder.items.map((item: OrderItem, idx: number) => {
                          const catItem = catalogItems.find(
                            (c) => c.id === item.catalogItemId
                          );
                          return (
                            <tr
                              key={idx}
                              className="hover:bg-gray-50/50 dark:hover:bg-[#111]/50 transition-colors"
                            >
                              <td className="px-4 py-3 text-xs font-mono font-bold text-gray-900 dark:text-white">
                                {item.quantity}
                              </td>
                              <td className="px-4 py-3 text-xs font-bold text-gray-800 dark:text-gray-200">
                                {catItem?.name}
                              </td>
                              <td className="px-4 py-3 text-xs font-mono font-medium text-gray-500 text-right">
                                ${item.unitCost.toFixed(2)}
                              </td>
                              <td className="px-4 py-3 text-xs font-mono font-bold text-gray-900 dark:text-white text-right">
                                ${(item.quantity * item.unitCost).toFixed(2)}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveItem(idx)}
                                  className="text-gray-400 hover:text-rose-500 p-1 rounded-lg transition-colors"
                                >
                                  <X className="w-4 h-4" strokeWidth={2} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot className="bg-gray-50/50 dark:bg-[#050505] border-t border-gray-100 dark:border-gray-800">
                        <tr>
                          <td
                            colSpan={3}
                            className="px-4 py-3 text-xs font-bold text-gray-500 text-right uppercase tracking-wider"
                          >
                            {t("modal_new.total_projected")}
                          </td>
                          <td className="px-4 py-3 text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400 text-right">
                            $
                            {newOrder.items
                              .reduce(
                                (acc: number, curr: OrderItem) =>
                                  acc + curr.quantity * curr.unitCost,
                                0
                              )
                              .toFixed(2)}
                          </td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 md:p-8 bg-gray-50/50 dark:bg-[#050505] border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row justify-end gap-3 shrink-0">
              <Button
                variant="outline"
                onClick={() =>
                  dispatch({ type: "SET_ISNEWORDERMODALOPEN", payload: false })
                }
                className="h-11 px-6 rounded-xl border-gray-200 dark:border-gray-800 text-xs font-bold"
              >
                {t("modal_new.btn_cancel")}
              </Button>
              <Button
                onClick={handleCreateOrder}
                className="h-11 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm border-0"
              >
                <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
                <span>{t("modal_new.btn_confirm")}</span>
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* ── MODAL RECIBIR ORDEN DE COMPRA ─────────────────────────────── */}
        {receivingOrder && (
          <Dialog
            open={!!receivingOrder}
            onOpenChange={(open) =>
              !open && dispatch({ type: "SET_RECEIVINGORDER", payload: null })
            }
          >
            <DialogContent className="sm:max-w-xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-0 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
              
              <div className="p-6 md:p-8 bg-gray-50/50 dark:bg-[#050505] border-b border-gray-100 dark:border-gray-800 flex items-start justify-between">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-sm">
                    <Truck className="w-6 h-6" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">
                      {t("modal_receive.header_category", {
                        id: receivingOrder.id.toString().padStart(4, "0"),
                      })}
                    </p>
                    <DialogTitle className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
                      {t("modal_receive.title")}
                    </DialogTitle>
                  </div>
                </div>
              </div>

              <div className="flex flex-col bg-white dark:bg-[#0a0a0a] p-6 md:p-8 gap-5">
                <div className="p-5 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/40 dark:bg-[#050505]/40 flex items-center justify-between shadow-sm">
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    {t("modal_receive.settlement_label")}
                  </span>
                  <span className="text-xl font-mono font-bold text-gray-900 dark:text-white">
                    ${receivingOrder.totalAmount?.toFixed(2)}
                  </span>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Banknote
                      className="w-4 h-4 text-emerald-600 dark:text-emerald-400"
                      strokeWidth={2}
                    />
                    {t("modal_receive.payment_method_label")}
                  </label>
                  <Select
                    value={paymentMethod}
                    onValueChange={(val: any) =>
                      dispatch({ type: "SET_PAYMENTMETHOD", payload: val })
                    }
                  >
                    <SelectTrigger className="w-full h-11 px-3 text-xs font-bold rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-lg">
                      <SelectItem
                        value="CASH"
                        className="text-xs font-bold rounded-xl"
                      >
                        {t("modal_receive.payment_methods.cash")}
                      </SelectItem>
                      <SelectItem
                        value="TRANSFER"
                        className="text-xs font-bold rounded-xl"
                      >
                        {t("modal_receive.payment_methods.transfer")}
                      </SelectItem>
                      <SelectItem
                        value="CREDIT"
                        className="text-xs font-bold rounded-xl"
                      >
                        {t("modal_receive.payment_methods.credit")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {paymentMethod === "CASH" && (
                  <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="deductCash"
                      checked={payFromCashRegister}
                      onChange={(e) =>
                        dispatch({
                          type: "SET_PAYFROMCASHREGISTER",
                          payload: e.target.checked,
                        })
                      }
                      className="w-4 h-4 mt-0.5 rounded border-amber-300 text-amber-600 focus:ring-amber-500/20 cursor-pointer"
                    />
                    <label
                      htmlFor="deductCash"
                      className="text-xs font-medium text-amber-800 dark:text-amber-300 leading-relaxed cursor-pointer"
                    >
                      {t("modal_receive.deduct_cash_label")}
                    </label>
                  </div>
                )}

                <DialogDescription className="text-xs font-medium text-gray-500 dark:text-gray-400 text-center leading-relaxed">
                  {t("modal_receive.description")}
                </DialogDescription>
              </div>

              <div className="p-6 md:p-8 bg-gray-50/50 dark:bg-[#050505] border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row justify-end gap-3 shrink-0">
                <Button
                  variant="outline"
                  onClick={() =>
                    dispatch({ type: "SET_RECEIVINGORDER", payload: null })
                  }
                  className="h-11 px-6 rounded-xl border-gray-200 dark:border-gray-800 text-xs font-bold"
                >
                  {t("modal_receive.btn_postpone")}
                </Button>
                <Button
                  onClick={handleReceiveOrder}
                  className="h-11 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm border-0"
                >
                  <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
                  <span>{t("modal_receive.btn_confirm")}</span>
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}

      </div>
    </div>
  );
}