"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useEffect, useReducer, useCallback } from "react";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";
import {
  Building2,
  Plus,
  Search,
  Edit2,
  Trash2,
  Phone,
  Mail,
  User,
  X,
  Save,
} from "lucide-react";

import { supplierService } from "@/services/supplier.service";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface Supplier {
  id?: number;
  name?: string;
  contactName?: string;
  phone?: string;
  email?: string;
}

interface State {
  suppliers: Supplier[];
  isLoading: boolean;
  searchQuery: string;
  isModalOpen: boolean;
  editingSupplier: Supplier;
  isSaving: boolean;
}

type Action =
  | { type: "SET_SUPPLIERS"; payload: any }
  | { type: "SET_ISLOADING"; payload: boolean }
  | { type: "SET_SEARCHQUERY"; payload: string }
  | { type: "SET_ISMODALOPEN"; payload: boolean }
  | { type: "SET_EDITINGSUPPLIER"; payload: Supplier }
  | { type: "SET_ISSAVING"; payload: boolean };

const initialState: State = {
  suppliers: [],
  isLoading: true,
  searchQuery: "",
  isModalOpen: false,
  editingSupplier: {},
  isSaving: false,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_SUPPLIERS":
      return {
        ...state,
        suppliers:
          typeof action.payload === "function"
            ? action.payload(state.suppliers)
            : action.payload,
      };
    case "SET_ISLOADING":
      return { ...state, isLoading: action.payload };
    case "SET_SEARCHQUERY":
      return { ...state, searchQuery: action.payload };
    case "SET_ISMODALOPEN":
      return { ...state, isModalOpen: action.payload };
    case "SET_EDITINGSUPPLIER":
      return { ...state, editingSupplier: action.payload };
    case "SET_ISSAVING":
      return { ...state, isSaving: action.payload };
    default:
      return state;
  }
}

export default function SuppliersPage() {
  const t = useTranslations("SuppliersDirectory");
  const [state, dispatch] = useReducer(reducer, initialState);

  const {
    suppliers,
    isLoading,
    searchQuery,
    isModalOpen,
    editingSupplier,
    isSaving,
  } = state;

  const fetchSuppliers = useCallback(async () => {
    dispatch({ type: "SET_ISLOADING", payload: true });
    try {
      const res = await supplierService.getSuppliers(0, 100);
      dispatch({ type: "SET_SUPPLIERS", payload: res.content || [] });
    } catch (error) {
      console.error(error);
      toast.error(t("toasts.fetch_error"));
    } finally {
      dispatch({ type: "SET_ISLOADING", payload: false });
    }
  }, [t]);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const filteredSuppliers = suppliers.filter((s) => {
    const q = searchQuery.toLowerCase();
    return (
      s.name?.toLowerCase().includes(q) ||
      s.contactName?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q)
    );
  });

  const handleSave = async () => {
    if (!editingSupplier.name?.trim()) {
      toast.error(t("toasts.name_required"));
      return;
    }

    dispatch({ type: "SET_ISSAVING", payload: true });
    try {
      if (editingSupplier.id) {
        await supplierService.updateSupplier(
          editingSupplier.id,
          editingSupplier
        );
        toast.success(t("toasts.update_success"));
      } else {
        await supplierService.createSupplier(editingSupplier);
        toast.success(t("toasts.create_success"));
      }
      dispatch({ type: "SET_ISMODALOPEN", payload: false });
      fetchSuppliers();
    } catch (error) {
      console.error(error);
      toast.error(t("toasts.save_error"));
    } finally {
      dispatch({ type: "SET_ISSAVING", payload: false });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t("confirm_delete"))) return;

    try {
      await supplierService.deleteSupplier(id);
      toast.success(t("toasts.delete_success"));
      fetchSuppliers();
    } catch (error) {
      console.error(error);
      toast.error(t("toasts.delete_error"));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#050505] font-sans text-gray-900 dark:text-white selection:bg-emerald-100 dark:selection:bg-emerald-950/30 transition-colors duration-500 pb-24">
      <div className="max-w-7xl mx-auto px-6 py-10 sm:py-12 space-y-8">
        
        {/* ── HEADER ────────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 dark:border-gray-800 pb-8">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-sm">
              <Building2 className="w-7 h-7" strokeWidth={2} />
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
            onClick={() => {
              dispatch({ type: "SET_EDITINGSUPPLIER", payload: {} });
              dispatch({ type: "SET_ISMODALOPEN", payload: true });
            }}
          >
            <Plus className="w-4 h-4" strokeWidth={2} />
            <span>{t("btn_new_supplier")}</span>
          </Button>
        </div>

        {/* ── PANEL BÚSQUEDA Y LISTADO ──────────────────────────────────── */}
        <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 flex flex-col rounded-3xl overflow-hidden shadow-sm">
          
          {/* Barra de Búsqueda */}
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505]">
            <div className="p-6 border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-800 flex-1">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                {t("table_title")}
              </h2>
            </div>
            <div className="relative w-full md:w-96 shrink-0">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                strokeWidth={2}
              />
              <input
                type="text"
                placeholder={t("search_placeholder")}
                value={searchQuery}
                onChange={(e) =>
                  dispatch({ type: "SET_SEARCHQUERY", payload: e.target.value })
                }
                className="w-full h-14 pl-11 pr-4 bg-transparent border-0 text-xs font-bold text-gray-900 dark:text-white focus:outline-none placeholder:text-gray-400 placeholder:font-normal"
              />
            </div>
          </div>

          {/* Listado de Proveedores */}
          <div className="flex-1 bg-white dark:bg-[#0a0a0a]">
            {isLoading ? (
              <div className="p-16 flex flex-col justify-center items-center gap-3">
                <QhSpinner size="lg" />
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 animate-pulse">
                  {t("loading")}
                </p>
              </div>
            ) : filteredSuppliers.length === 0 ? (
              <div className="p-16 flex flex-col justify-center items-center text-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 flex items-center justify-center text-gray-400 shadow-sm">
                  <Building2 className="w-7 h-7" strokeWidth={2} />
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
                {filteredSuppliers.map((supplier) => (
                  <div
                    key={supplier.id}
                    className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-gray-50/50 dark:hover:bg-[#111]/50 transition-colors"
                  >
                    <div className="flex items-start sm:items-center gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 flex items-center justify-center shrink-0 text-gray-400 shadow-sm">
                        <Building2 className="w-5 h-5" strokeWidth={2} />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-2">
                          {supplier.name}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-gray-500 dark:text-gray-400">
                          {supplier.contactName && (
                            <span className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800/60 px-2.5 py-0.5 rounded-lg text-gray-700 dark:text-gray-300 font-semibold">
                              <User className="w-3.5 h-3.5" strokeWidth={2} />
                              {supplier.contactName}
                            </span>
                          )}
                          {supplier.phone && (
                            <span className="flex items-center gap-1.5 font-mono text-gray-600 dark:text-gray-300">
                              <Phone className="w-3.5 h-3.5 text-gray-400" strokeWidth={2} />
                              {supplier.phone}
                            </span>
                          )}
                          {supplier.email && (
                            <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                              <Mail className="w-3.5 h-3.5 text-gray-400" strokeWidth={2} />
                              {supplier.email}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto shrink-0 justify-end">
                      <Button
                        variant="outline"
                        onClick={() => {
                          dispatch({
                            type: "SET_EDITINGSUPPLIER",
                            payload: supplier,
                          });
                          dispatch({ type: "SET_ISMODALOPEN", payload: true });
                        }}
                        className="h-10 px-4 rounded-xl border-gray-200 dark:border-gray-800 text-xs font-bold shadow-sm"
                      >
                        <Edit2 className="w-3.5 h-3.5 mr-1.5" strokeWidth={2} />
                        <span>{t("btn_edit")}</span>
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => supplier.id && handleDelete(supplier.id)}
                        className="h-10 px-4 rounded-xl border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white dark:hover:bg-rose-500 dark:hover:text-white text-xs font-bold shadow-sm transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1.5" strokeWidth={2} />
                        <span>{t("btn_delete")}</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── MODAL FICHA PROVEEDOR ─────────────────────────────────────── */}
        <Dialog
          open={isModalOpen}
          onOpenChange={(open) =>
            !open && !isSaving && dispatch({ type: "SET_ISMODALOPEN", payload: false })
          }
        >
          <DialogContent className="sm:max-w-2xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-0 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
            
            <div className="flex items-center justify-between p-6 md:p-8 bg-gray-50/50 dark:bg-[#050505] border-b border-gray-100 dark:border-gray-800 shrink-0">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-sm">
                  <Building2 className="w-6 h-6" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">
                    {t("modal.header_category")}
                  </p>
                  <DialogTitle className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                    {editingSupplier.id
                      ? t("modal.title_edit")
                      : t("modal.title_new")}
                  </DialogTitle>
                </div>
              </div>
              <button
                type="button"
                onClick={() => dispatch({ type: "SET_ISMODALOPEN", payload: false })}
                disabled={isSaving}
                className="w-9 h-9 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] hover:bg-gray-50 dark:hover:bg-[#111] flex items-center justify-center transition-all shadow-sm text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-50"
              >
                <X className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>

            {/* Formulario */}
            <div className="p-6 md:p-8 bg-white dark:bg-[#0a0a0a] space-y-5 overflow-y-auto max-h-[70vh] custom-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    {t("modal.field_name_label")}
                  </label>
                  <input
                    type="text"
                    value={editingSupplier.name || ""}
                    onChange={(e) =>
                      dispatch({
                        type: "SET_EDITINGSUPPLIER",
                        payload: { ...editingSupplier, name: e.target.value },
                      })
                    }
                    placeholder={t("modal.field_name_placeholder")}
                    className="w-full h-11 px-3 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
                    disabled={isSaving}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    {t("modal.field_contact_label")}
                  </label>
                  <input
                    type="text"
                    value={editingSupplier.contactName || ""}
                    onChange={(e) =>
                      dispatch({
                        type: "SET_EDITINGSUPPLIER",
                        payload: { ...editingSupplier, contactName: e.target.value },
                      })
                    }
                    placeholder={t("modal.field_contact_placeholder")}
                    className="w-full h-11 px-3 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
                    disabled={isSaving}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    {t("modal.field_phone_label")}
                  </label>
                  <input
                    type="text"
                    value={editingSupplier.phone || ""}
                    onChange={(e) =>
                      dispatch({
                        type: "SET_EDITINGSUPPLIER",
                        payload: { ...editingSupplier, phone: e.target.value },
                      })
                    }
                    placeholder={t("modal.field_phone_placeholder")}
                    className="w-full h-11 px-3 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-mono font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
                    disabled={isSaving}
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    {t("modal.field_email_label")}
                  </label>
                  <input
                    type="email"
                    value={editingSupplier.email || ""}
                    onChange={(e) =>
                      dispatch({
                        type: "SET_EDITINGSUPPLIER",
                        payload: { ...editingSupplier, email: e.target.value },
                      })
                    }
                    placeholder={t("modal.field_email_placeholder")}
                    className="w-full h-11 px-3 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
                    disabled={isSaving}
                  />
                </div>

              </div>
            </div>

            <div className="p-6 md:p-8 bg-gray-50/50 dark:bg-[#050505] border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row justify-end gap-3 shrink-0">
              <Button
                variant="outline"
                onClick={() => dispatch({ type: "SET_ISMODALOPEN", payload: false })}
                disabled={isSaving}
                className="h-11 px-6 rounded-xl border-gray-200 dark:border-gray-800 text-xs font-bold"
              >
                {t("modal.btn_cancel")}
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving || !editingSupplier.name?.trim()}
                className="h-11 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm border-0 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <QhSpinner size="sm" />
                    <span>{t("modal.btn_saving")}</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" strokeWidth={2} />
                    <span>{t("modal.btn_save")}</span>
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
}