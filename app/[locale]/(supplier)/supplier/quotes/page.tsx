"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/no-giant-component */

import React, { useEffect, useState } from "react";
import {
  FileText,
  Plus,
  Search,
  Filter,
  Send,
  CheckCircle2,
  Printer,
  X,
  ArrowRight,
  Building2,
  Calendar,
  DollarSign,
  Truck,
  Layers,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { toast } from "react-toastify";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { supplierService } from "@/services/supplier.service";
import {
  SupplierQuote,
  MedicalProduct,
  QuoteStatus,
  PaymentTerm,
  SaveSupplierQuotePayload,
  SaveSupplierQuoteItemPayload,
} from "@/types/supplier";

export default function SupplierQuotesPage() {
  const [quotes, setQuotes] = useState<SupplierQuote[]>([]);
  const [products, setProducts] = useState<MedicalProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Modal Crear Cotización
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form Fields
  const [buyerOrgName, setBuyerOrgName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [buyerRfc, setBuyerRfc] = useState("");
  const [validDays, setValidDays] = useState(15);
  const [paymentTerms, setPaymentTerms] = useState<PaymentTerm>("NET_30");
  const [leadTimeDays, setLeadTimeDays] = useState(5);
  const [shippingAmount, setShippingAmount] = useState<string>("0");
  const [notes, setNotes] = useState("");

  // Items en la cotización actual
  const [items, setItems] = useState<
    Array<{
      productId: number;
      productName: string;
      sku?: string;
      quantity: number;
      unitPrice: number;
      discountPercentage: number;
      taxRate: number;
      total: number;
    }>
  >([]);

  // Item en proceso de adición
  const [selectedProdId, setSelectedProdId] = useState<number | "">("");
  const [itemQty, setItemQty] = useState<number>(10);
  const [itemPrice, setItemPrice] = useState<string>("");
  const [itemDiscount, setItemDiscount] = useState<string>("0");

  // Modal Ver Cotización Formal (Imprimible / PDF)
  const [viewQuote, setViewQuote] = useState<SupplierQuote | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [quoteList, prodList] = await Promise.all([
        supplierService.getQuotes(),
        supplierService.getProducts(),
      ]);
      setQuotes(quoteList);
      setProducts(prodList);
    } catch {
      toast.error("Error al cargar las cotizaciones.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setBuyerOrgName("");
    setBuyerEmail("");
    setBuyerPhone("");
    setBuyerRfc("");
    setValidDays(15);
    setPaymentTerms("NET_30");
    setLeadTimeDays(5);
    setShippingAmount("0");
    setNotes("Precios en MXN antes de impuestos. Flete asegurado y entrega en almacén del comprador.");
    setItems([]);
    setSelectedProdId("");
    setItemQty(10);
    setItemPrice("");
    setItemDiscount("0");
    setCreateModalOpen(true);
  };

  const handleProductSelect = (prodId: number) => {
    setSelectedProdId(prodId);
    const p = products.find((x) => x.id === prodId);
    if (p && p.basePriceB2c) {
      setItemPrice(p.basePriceB2c.toString());
    }
  };

  const handleAddItem = () => {
    if (!selectedProdId || !itemPrice || itemQty <= 0) {
      toast.warning("Selecciona un producto, precio unitario y cantidad válida.");
      return;
    }

    const p = products.find((x) => x.id === Number(selectedProdId));
    if (!p) return;

    const unitP = parseFloat(itemPrice);
    const disc = parseFloat(itemDiscount) || 0;
    const effectiveP = unitP * (1 - disc / 100);
    const lineTotal = effectiveP * itemQty;

    setItems([
      ...items,
      {
        productId: p.id,
        productName: p.name,
        sku: p.sku,
        quantity: itemQty,
        unitPrice: unitP,
        discountPercentage: disc,
        taxRate: 0.16,
        total: lineTotal,
      },
    ]);

    setSelectedProdId("");
    setItemPrice("");
    setItemDiscount("0");
    setItemQty(10);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculatedSubtotal = items.reduce((acc, it) => acc + it.total, 0);
  const calculatedTax = calculatedSubtotal * 0.16;
  const calculatedShipping = parseFloat(shippingAmount) || 0;
  const calculatedGrandTotal = calculatedSubtotal + calculatedTax + calculatedShipping;

  const handleSaveQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerOrgName.trim() || items.length === 0) {
      toast.warning("Ingresa el nombre del comprador y al menos un producto.");
      return;
    }

    try {
      setIsSaving(true);
      const validUntilDate = new Date();
      validUntilDate.setDate(validUntilDate.getDate() + validDays);

      const payload: SaveSupplierQuotePayload = {
        buyerOrganizationName: buyerOrgName.trim(),
        buyerContactEmail: buyerEmail.trim() || undefined,
        buyerContactPhone: buyerPhone.trim() || undefined,
        buyerRfc: buyerRfc.trim() || undefined,
        validUntil: validUntilDate.toISOString().split("T")[0],
        paymentTerms,
        deliveryLeadTimeDays: leadTimeDays,
        shippingAmount: calculatedShipping,
        notes: notes.trim() || undefined,
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          discountPercentage: i.discountPercentage,
          taxRate: i.taxRate,
        })),
      };

      await supplierService.createQuote(payload);
      toast.success("Cotización formal creada con éxito.");
      setCreateModalOpen(false);
      loadData();
    } catch {
      toast.error("Error al guardar la cotización.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendQuote = async (id: number) => {
    try {
      await supplierService.sendQuote(id);
      toast.success("Cotización enviada al comprador (Estado: SENT).");
      loadData();
    } catch {
      toast.error("Error al enviar la cotización.");
    }
  };

  const handleAcceptQuote = async (id: number) => {
    try {
      await supplierService.acceptQuote(id);
      toast.success("Cotización marcada como ACEPTADA.");
      loadData();
    } catch {
      toast.error("Error al aceptar la cotización.");
    }
  };

  const handleConvertToPo = async (id: number) => {
    try {
      const po = await supplierService.convertQuoteToPo(id);
      toast.success(`¡Cotización convertida a Orden de Compra ${po.poNumber}!`);
      loadData();
    } catch {
      toast.error("Error al convertir la cotización a PO.");
    }
  };

  const filteredQuotes = quotes.filter((q) => {
    const term = searchQuery.toLowerCase();
    const matchesSearch =
      q.quoteNumber.toLowerCase().includes(term) ||
      (q.buyerOrganizationName && q.buyerOrganizationName.toLowerCase().includes(term));
    const matchesStatus = statusFilter === "ALL" || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-slate-50/70 p-4 sm:p-6 lg:p-8 font-sans">
      {/* 🚀 Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Fase 3: Motor de Cotizaciones B2B & RFQ
            </span>
            <span className="text-xs text-slate-400">{quotes.length} Cotizaciones Emitidas</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">Cotizaciones & RFQ Institucionales</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Genera propuestas comerciales con escalas por volumen, términos de crédito y conversión formal a Purchase Orders.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl transition-all shadow-md shadow-indigo-600/20 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nueva Cotización Formal
        </button>
      </div>

      {/* 🔍 Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs mb-6">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por folio de cotización o razón social del comprador..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 text-slate-700 font-medium focus:outline-none"
          >
            <option value="ALL">Todos los Estados</option>
            <option value="DRAFT">Borrador (DRAFT)</option>
            <option value="SENT">Enviada (SENT)</option>
            <option value="ACCEPTED">Aceptada (ACCEPTED)</option>
            <option value="CONVERTED_TO_PO">Convertida a PO</option>
            <option value="REJECTED">Rechazada</option>
          </select>
        </div>
      </div>

      {/* 📋 Quotes Table */}
      {isLoading ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 flex flex-col items-center">
          <QhSpinner size="lg" className="text-indigo-600" />
          <p className="text-xs font-bold text-slate-500 mt-4 animate-pulse">Cargando cotizaciones...</p>
        </div>
      ) : filteredQuotes.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 text-slate-400">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-bold text-slate-700">No hay cotizaciones registradas</p>
          <p className="text-xs text-slate-400 mt-1">Haz clic en "Nueva Cotización Formal" para generar una propuesta.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">Folio & Fecha</th>
                  <th className="py-3.5 px-4">Comprador / Clínica</th>
                  <th className="py-3.5 px-4">Términos Comerciales</th>
                  <th className="py-3.5 px-4">Partidas</th>
                  <th className="py-3.5 px-4">Total Cotizado</th>
                  <th className="py-3.5 px-4">Estatus</th>
                  <th className="py-3.5 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredQuotes.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-4">
                      <div className="space-y-0.5">
                        <span className="font-mono font-extrabold text-indigo-700 text-xs">{q.quoteNumber}</span>
                        <span className="text-[10px] text-slate-400 block">
                          {q.createdAt ? new Date(q.createdAt).toLocaleDateString() : ""}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-900 block">{q.buyerOrganizationName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{q.buyerRfc || q.buyerContactEmail}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="space-y-0.5">
                        <span className="font-semibold text-slate-700 block">{q.paymentTerms}</span>
                        <span className="text-[10px] text-slate-400">Válida hasta: {q.validUntil}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span className="font-bold text-slate-700">{q.items?.length || 0} ítems</span>
                    </td>

                    <td className="py-4 px-4">
                      <span className="font-extrabold text-slate-900 text-xs">
                        ${q.total?.toLocaleString()} {q.currency}
                      </span>
                      <span className="text-[10px] text-slate-400 block">IVA inc.</span>
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          q.status === "ACCEPTED"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : q.status === "CONVERTED_TO_PO"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : q.status === "SENT"
                            ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {q.status}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setViewQuote(q)}
                          className="px-2.5 py-1 text-slate-600 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 rounded-lg text-[11px] font-bold transition-colors"
                        >
                          Ver / Imprimir
                        </button>

                        {q.status === "DRAFT" && (
                          <button
                            onClick={() => handleSendQuote(q.id)}
                            className="px-2.5 py-1 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg text-[11px] font-bold transition-all shadow-xs flex items-center gap-1"
                          >
                            <Send className="w-3 h-3" />
                            Enviar
                          </button>
                        )}

                        {q.status === "SENT" && (
                          <button
                            onClick={() => handleAcceptQuote(q.id)}
                            className="px-2.5 py-1 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-[11px] font-bold transition-colors"
                          >
                            Aceptar
                          </button>
                        )}

                        {q.status === "ACCEPTED" && (
                          <button
                            onClick={() => handleConvertToPo(q.id)}
                            className="px-3 py-1 text-white bg-blue-600 hover:bg-blue-700 rounded-lg text-[11px] font-bold transition-all shadow-xs flex items-center gap-1"
                          >
                            <Sparkles className="w-3 h-3" />
                            Convertir a PO
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 🚀 MODAL: CREAR COTIZACIÓN FORMAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-5 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-indigo-600 tracking-wider">
                  Propuesta Comercial
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">Crear Cotización B2B</h3>
              </div>
              <button onClick={() => setCreateModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuote} className="space-y-4">
              {/* Datos Comprador */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Razón Social / Clínica del Comprador *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Hospital San Rafael S.A. de C.V."
                    value={buyerOrgName}
                    onChange={(e) => setBuyerOrgName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">RFC del Comprador</label>
                  <input
                    type="text"
                    placeholder="HSR980101XYZ"
                    value={buyerRfc}
                    onChange={(e) => setBuyerRfc(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Términos de Pago *</label>
                  <select
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value as PaymentTerm)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-medium"
                  >
                    <option value="IMMEDIATE">Contado / Inmediato</option>
                    <option value="NET_15">Crédito 15 días (NET_15)</option>
                    <option value="NET_30">Crédito 30 días (NET_30)</option>
                    <option value="NET_60">Crédito 60 días (NET_60)</option>
                    <option value="FIFTY_FIFTY">50% Anticipo / 50% Entrega</option>
                    <option value="ON_DELIVERY">Contra Entrega (COD)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Vigencia (Días)</label>
                  <input
                    type="number"
                    min="1"
                    value={validDays}
                    onChange={(e) => setValidDays(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tiempo de Entrega (Días Hábiles)</label>
                  <input
                    type="number"
                    min="1"
                    value={leadTimeDays}
                    onChange={(e) => setLeadTimeDays(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50"
                  />
                </div>
              </div>

              {/* Agregar Partidas */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <h4 className="font-bold text-slate-800 text-xs">Agregar Insumos a la Cotización</h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <div className="sm:col-span-2">
                    <select
                      value={selectedProdId}
                      onChange={(e) => handleProductSelect(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-xs"
                    >
                      <option value="">Selecciona insumo...</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} (Base: ${p.basePriceB2c})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <input
                      type="number"
                      placeholder="Precio Unitario"
                      value={itemPrice}
                      onChange={(e) => setItemPrice(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-xs font-bold"
                    />
                  </div>

                  <div>
                    <input
                      type="number"
                      min="1"
                      placeholder="Cantidad"
                      value={itemQty}
                      onChange={(e) => setItemQty(parseInt(e.target.value, 10))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-xs"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 text-[11px]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Añadir Partida
                  </button>
                </div>
              </div>

              {/* Tabla de Partidas */}
              {items.length > 0 && (
                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="p-2.5">Insumo</th>
                        <th className="p-2.5 text-center">Cant.</th>
                        <th className="p-2.5 text-right">P. Unitario</th>
                        <th className="p-2.5 text-right">Total</th>
                        <th className="p-2.5 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {items.map((it, idx) => (
                        <tr key={idx}>
                          <td className="p-2.5 font-bold text-slate-800">{it.productName}</td>
                          <td className="p-2.5 text-center">{it.quantity} u.</td>
                          <td className="p-2.5 text-right">${it.unitPrice.toLocaleString()}</td>
                          <td className="p-2.5 text-right font-extrabold">${it.total.toLocaleString()}</td>
                          <td className="p-2.5 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className="text-rose-500 hover:text-rose-700 font-bold"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Desglose de Totales */}
              <div className="flex flex-col items-end gap-1.5 pt-2 text-xs">
                <div className="flex justify-between w-64 text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-bold font-mono">${calculatedSubtotal.toLocaleString()} MXN</span>
                </div>
                <div className="flex justify-between w-64 text-slate-600">
                  <span>IVA (16%):</span>
                  <span className="font-bold font-mono">${calculatedTax.toLocaleString()} MXN</span>
                </div>
                <div className="flex justify-between w-64 text-slate-600 items-center">
                  <span>Flete / Envío:</span>
                  <input
                    type="number"
                    value={shippingAmount}
                    onChange={(e) => setShippingAmount(e.target.value)}
                    className="w-24 px-2 py-1 border border-slate-200 rounded-lg text-right font-mono font-bold"
                  />
                </div>
                <div className="flex justify-between w-64 border-t border-slate-200 pt-2 text-slate-900 font-black text-sm">
                  <span>Total Formal:</span>
                  <span className="font-mono text-indigo-700">${calculatedGrandTotal.toLocaleString()} MXN</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2 rounded-xl transition-all shadow-sm"
                >
                  {isSaving ? "Guardando..." : "Emitir Cotización"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🚀 MODAL: VISTA IMPRIMIBLE / PDF DE COTIZACIÓN */}
      {viewQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-6 text-xs print:p-0 print:border-none print:shadow-none">
            {/* Header Cotización Membretada */}
            <div className="flex justify-between items-start border-b border-slate-200 pb-6">
              <div>
                <h2 className="text-xl font-black text-slate-900">{viewQuote.organizationName || "QuHealthy Supplier"}</h2>
                <p className="text-xs text-slate-500 font-mono mt-0.5">RFC: {viewQuote.organizationRfc || "XAXX010101000"}</p>
                <p className="text-xs text-slate-500">Distribución de Insumos & Equipamiento Médico</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-extrabold uppercase text-indigo-600 block">Cotización Formal</span>
                <span className="text-lg font-mono font-black text-slate-900 block">{viewQuote.quoteNumber}</span>
                <span className="text-slate-400 text-[11px]">
                  Fecha: {viewQuote.createdAt ? new Date(viewQuote.createdAt).toLocaleDateString() : ""}
                </span>
              </div>
            </div>

            {/* Datos Comprador */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Cliente / Razón Social:</span>
                <span className="font-bold text-slate-800 text-sm block">{viewQuote.buyerOrganizationName}</span>
                <span className="text-slate-500 font-mono text-[11px] block">{viewQuote.buyerRfc}</span>
              </div>
              <div className="text-right space-y-1">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Términos de Pago:</span>
                  <span className="font-bold text-slate-800">{viewQuote.paymentTerms}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Vigencia:</span>
                  <span className="font-bold text-slate-800">{viewQuote.validUntil}</span>
                </div>
              </div>
            </div>

            {/* Partidas */}
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                  <th className="py-2 px-3">Descripción</th>
                  <th className="py-2 px-3 text-center">Cant.</th>
                  <th className="py-2 px-3 text-right">P. Unitario</th>
                  <th className="py-2 px-3 text-right">Importe</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {viewQuote.items?.map((it) => (
                  <tr key={it.id}>
                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-800 block">{it.productName}</span>
                      {it.sku && <span className="text-[10px] text-slate-400 font-mono">SKU: {it.sku}</span>}
                    </td>
                    <td className="py-3 px-3 text-center font-medium">{it.quantity}</td>
                    <td className="py-3 px-3 text-right font-mono">${it.unitPrice?.toLocaleString()}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold">${it.totalPrice?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totales */}
            <div className="flex justify-end pt-2 border-t border-slate-200">
              <div className="w-60 space-y-1 text-right">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal:</span>
                  <span className="font-mono font-bold">${viewQuote.subtotal?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>IVA:</span>
                  <span className="font-mono font-bold">${viewQuote.taxAmount?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Flete:</span>
                  <span className="font-mono font-bold">${viewQuote.shippingAmount?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-base font-black text-slate-900 border-t border-slate-200 pt-1">
                  <span>Total:</span>
                  <span className="font-mono text-indigo-700">${viewQuote.total?.toLocaleString()} MXN</span>
                </div>
              </div>
            </div>

            {viewQuote.notes && (
              <div className="p-3 bg-slate-50 rounded-xl text-slate-600 text-[11px] italic">
                <b>Observaciones:</b> {viewQuote.notes}
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between print:hidden">
              <button
                onClick={() => setViewQuote(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold"
              >
                Cerrar
              </button>
              <button
                onClick={() => window.print()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2 rounded-xl transition-all shadow-sm flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Imprimir / Guardar PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
