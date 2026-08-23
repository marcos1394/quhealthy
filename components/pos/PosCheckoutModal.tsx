"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard,
  Banknote,
  Smartphone,
  Plus,
  Trash2,
  X,
  Calculator,
  User,
  Search,
  CheckCircle2,
  AlertCircle,
  FileText,
  Building2,
  ShieldCheck,
  Receipt,
  RotateCcw,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PosCheckoutRequest,
  PosItem,
  PaymentSplit,
  PaymentMethodType,
  PosReceipt,
} from "@/types/pos";
import { posService } from "@/services/pos.service";
import { useCatalog } from "@/hooks/useCatalog";
import { patientDirectoryService } from "@/services/patientDirectory.service";
import { toast } from "sonner";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { cn } from "@/lib/utils";

const PRESET_DENOMINATIONS = [
  { value: 1000, label: "$1,000" },
  { value: 500, label: "$500" },
  { value: 200, label: "$200" },
  { value: 100, label: "$100" },
  { value: 50, label: "$50" },
  { value: 20, label: "$20" },
];

interface PosCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPatientName?: string;
  initialPatientEmail?: string;
  initialPatientPhone?: string;
  initialItems?: PosItem[];
  appointmentId?: number;
  orderId?: number;
  patientClinicalBudgetId?: number;
  onSuccess?: (receipt: PosReceipt) => void;
}

export function PosCheckoutModal({
  isOpen,
  onClose,
  initialPatientName = "",
  initialPatientEmail = "",
  initialPatientPhone = "",
  initialItems = [],
  appointmentId,
  orderId,
  patientClinicalBudgetId,
  onSuccess,
}: PosCheckoutModalProps) {
  const { services, products, isLoading: isCatalogLoading } = useCatalog();

  // Estado del Paciente
  const [patientName, setPatientName] = useState(initialPatientName);
  const [patientEmail, setPatientEmail] = useState(initialPatientEmail);
  const [patientPhone, setPatientPhone] = useState(initialPatientPhone);
  const [patientRfc, setPatientRfc] = useState("");

  // Búsqueda de pacientes existentes
  const [patientSearch, setPatientSearch] = useState("");
  const [patientSuggestions, setPatientSuggestions] = useState<any[]>([]);
  const [isSearchingPatient, setIsSearchingPatient] = useState(false);

  // Conceptos a Cobrar
  const [items, setItems] = useState<PosItem[]>(
    initialItems.length > 0
      ? initialItems
      : [{ description: "Consulta Médica General", quantity: 1, unitPrice: 800, isTaxExempt: true }]
  );

  // Formas de Pago Mixtas (Split Payments)
  const [payments, setPayments] = useState<PaymentSplit[]>([
    { method: "CASH", amount: 800 },
  ]);

  // Denominaciones recibidas en efectivo
  const [cashGiven, setCashGiven] = useState<number>(800);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [notes, setNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Inicializar items y paciente al abrir
  useEffect(() => {
    if (isOpen) {
      if (initialPatientName) setPatientName(initialPatientName);
      if (initialPatientEmail) setPatientEmail(initialPatientEmail);
      if (initialPatientPhone) setPatientPhone(initialPatientPhone);
      if (initialItems && initialItems.length > 0) {
        setItems(initialItems);
        const sub = initialItems.reduce((acc, it) => acc + it.quantity * it.unitPrice, 0);
        setPayments([{ method: "CASH", amount: sub }]);
        setCashGiven(sub);
      }
    }
  }, [isOpen, initialPatientName, initialPatientEmail, initialPatientPhone, initialItems]);

  // Búsqueda de pacientes registrados
  useEffect(() => {
    if (!patientSearch.trim() || patientSearch.length < 2) {
      setPatientSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        setIsSearchingPatient(true);
        const res = await patientDirectoryService.searchPatients(patientSearch);
        setPatientSuggestions(res || []);
      } catch (e) {
        console.error(e);
      } finally {
        setIsSearchingPatient(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [patientSearch]);

  // Cálculos en tiempo real
  const subtotal = items.reduce((acc, it) => acc + (Number(it.quantity) || 1) * (Number(it.unitPrice) || 0), 0);
  const total = Math.max(0, subtotal - (Number(discountAmount) || 0));
  const totalPaid = payments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
  const remainingDue = Math.max(0, total - totalPaid);

  // Cálculo de cambio si el pago es en efectivo
  const cashPayment = payments.find((p) => p.method === "CASH");
  const cashAmount = cashPayment ? Number(cashPayment.amount) || 0 : 0;
  const changeToGive = Math.max(0, cashGiven - cashAmount);

  // Manejo de Items
  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      { description: "", quantity: 1, unitPrice: 0, isTaxExempt: true },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof PosItem, value: any) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleSelectCatalogItem = (index: number, itemIdStr: string) => {
    const itemId = Number(itemIdStr);
    const svc = services.find((s) => s.id === itemId);
    const prod = products.find((p) => p.id === itemId);
    const found = svc || prod;

    if (found) {
      setItems((prev) => {
        const next = [...prev];
        next[index] = {
          catalogItemId: found.id,
          description: found.name,
          quantity: 1,
          unitPrice: found.price || 0,
          isTaxExempt: svc ? true : false,
        };
        return next;
      });
    }
  };

  // Manejo de Split Payments
  const handleAddPaymentRow = () => {
    if (remainingDue <= 0) {
      toast.info("La cuenta ya está completamente cubierta.");
      return;
    }
    setPayments((prev) => [
      ...prev,
      { method: "CARD_TERMINAL", amount: remainingDue },
    ]);
  };

  const handleRemovePaymentRow = (index: number) => {
    if (payments.length <= 1) return;
    setPayments((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePaymentChange = (index: number, field: keyof PaymentSplit, value: any) => {
    setPayments((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleFastCashPreset = (denomValue: number) => {
    setCashGiven((prev) => prev + denomValue);
  };

  // Enviar Checkout
  const handleProcessCheckout = async () => {
    if (!patientName.trim()) {
      toast.error("El nombre del paciente es obligatorio.");
      return;
    }

    if (items.some((it) => !it.description.trim() || Number(it.unitPrice) <= 0)) {
      toast.error("Por favor revisa la descripción y precio de los conceptos.");
      return;
    }

    if (totalPaid < total) {
      toast.error(`Aún falta cubrir $${remainingDue.toFixed(2)} MXN del total.`);
      return;
    }

    try {
      setIsProcessing(true);

      const payload: PosCheckoutRequest = {
        appointmentId,
        orderId,
        patientClinicalBudgetId,
        patientName,
        patientEmail: patientEmail.trim() || undefined,
        patientPhone: patientPhone.trim() || undefined,
        patientRfc: patientRfc.trim() || undefined,
        items: items.map((it) => ({
          ...it,
          quantity: Number(it.quantity) || 1,
          unitPrice: Number(it.unitPrice) || 0,
          subtotal: (Number(it.quantity) || 1) * (Number(it.unitPrice) || 0),
        })),
        payments: payments.map((p) => ({
          method: p.method,
          amount: Number(p.amount) || 0,
          reference: p.reference?.trim() || undefined,
        })),
        discountAmount: Number(discountAmount) || 0,
        taxAmount: 0,
        totalAmount: total,
        amountReceived: cashAmount > 0 ? cashGiven : totalPaid,
        changeAmount: changeToGive > 0 ? changeToGive : 0,
        notes: notes.trim() || undefined,
      };

      const receipt = await posService.processCheckout(payload);
      toast.success(`Ticket ${receipt.folio} generado y registrado en caja.`);
      onClose();
      if (onSuccess) onSuccess(receipt);
    } catch (e: any) {
      console.error(e);
      toast.error(e.response?.data?.message || "Error al procesar el cobro en caja.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans select-none overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 10 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-3xl bg-white dark:bg-[#0c0c0c] border border-gray-200 dark:border-gray-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col my-6 max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 bg-white dark:bg-[#0c0c0c] border-b border-gray-100 dark:border-gray-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                  Punto de Venta Clínico • POS & Split Payment
                </span>
                <h2 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white">
                  Registrar Cobro en Caja
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-gray-50 dark:bg-[#141414] hover:bg-gray-100 dark:hover:bg-[#1f1f1f] text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body Scrollable */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
            {/* 1. Datos del Paciente */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gray-50/70 dark:bg-[#121212] border border-gray-100 dark:border-gray-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-600" />
                  <span>1. Paciente / Receptor del Comprobante</span>
                </span>
              </div>

              {/* Buscador Rápido de Pacientes */}
              <div className="relative">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Buscar paciente existente por nombre..."
                    value={patientSearch}
                    onChange={(e) => setPatientSearch(e.target.value)}
                    className="pl-9 text-xs h-9 rounded-xl bg-white dark:bg-[#181818]"
                  />
                  {isSearchingPatient && (
                    <QhSpinner size="sm" className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600" />
                  )}
                </div>

                {patientSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#181818] border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-30 overflow-hidden divide-y divide-gray-100 dark:divide-gray-800 max-h-40 overflow-y-auto">
                    {patientSuggestions.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setPatientName(`${p.firstName || ""} ${p.lastName || ""}`.trim() || p.fullName || "");
                          if (p.email) setPatientEmail(p.email);
                          if (p.phone) setPatientPhone(p.phone);
                          setPatientSuggestions([]);
                          setPatientSearch("");
                        }}
                        className="w-full p-2.5 text-left text-xs hover:bg-emerald-50 dark:hover:bg-emerald-950/30 flex items-center justify-between cursor-pointer"
                      >
                        <span className="font-bold text-gray-900 dark:text-white">
                          {p.firstName} {p.lastName}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">
                          {p.phone || p.email}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500">Nombre Completo *</label>
                  <Input
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="Nombre del paciente"
                    className="text-xs h-9 rounded-xl bg-white dark:bg-[#181818]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500">Teléfono (WhatsApp)</label>
                  <Input
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    placeholder="+52 55 1234 5678"
                    className="text-xs h-9 rounded-xl bg-white dark:bg-[#181818]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500">Correo Electrónico</label>
                  <Input
                    value={patientEmail}
                    onChange={(e) => setPatientEmail(e.target.value)}
                    placeholder="paciente@correo.com"
                    className="text-xs h-9 rounded-xl bg-white dark:bg-[#181818]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500">RFC (Si factura ya)</label>
                  <Input
                    value={patientRfc}
                    onChange={(e) => setPatientRfc(e.target.value.toUpperCase())}
                    placeholder="XAXX010101000"
                    className="text-xs h-9 rounded-xl bg-white dark:bg-[#181818] font-mono uppercase font-bold"
                  />
                </div>
              </div>
            </div>

            {/* 2. Partidas / Conceptos a Cobrar */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gray-50/70 dark:bg-[#121212] border border-gray-100 dark:border-gray-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-emerald-600" />
                  <span>2. Conceptos & Servicios ({items.length})</span>
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleAddItem}
                  className="rounded-xl text-xs h-8 px-2.5 gap-1 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Agregar Concepto</span>
                </Button>
              </div>

              <div className="space-y-2.5">
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-white dark:bg-[#181818] border border-gray-200/80 dark:border-gray-700 grid grid-cols-12 gap-2 items-center"
                  >
                    {/* Selector de Catálogo Rápido */}
                    <div className="col-span-12 sm:col-span-6 space-y-1">
                      <Input
                        value={item.description}
                        onChange={(e) => handleItemChange(idx, "description", e.target.value)}
                        placeholder="Descripción del servicio o procedimiento..."
                        className="text-xs h-8 rounded-lg"
                      />
                    </div>

                    <div className="col-span-3 sm:col-span-2">
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, "quantity", e.target.value)}
                        placeholder="Cant"
                        className="text-xs h-8 rounded-lg font-mono text-center"
                      />
                    </div>

                    <div className="col-span-4 sm:col-span-3">
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(idx, "unitPrice", e.target.value)}
                          placeholder="Precio"
                          className="text-xs h-8 rounded-lg pl-6 font-mono font-bold"
                        />
                      </div>
                    </div>

                    <div className="col-span-5 sm:col-span-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        disabled={items.length <= 1}
                        className="w-7 h-7 rounded-lg text-gray-400 hover:text-rose-600 disabled:opacity-30 flex items-center justify-center cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Descuento y Totales */}
              <div className="pt-3 border-t border-gray-200/60 dark:border-gray-800 flex flex-col sm:flex-row items-end sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 font-bold">Descuento Especial:</span>
                  <div className="relative w-28">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
                    <Input
                      type="number"
                      min="0"
                      value={discountAmount || ""}
                      onChange={(e) => setDiscountAmount(Number(e.target.value) || 0)}
                      placeholder="0.00"
                      className="text-xs h-8 pl-6 rounded-lg font-mono"
                    />
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">Total a Liquidar</span>
                  <span className="text-xl font-black font-mono text-gray-900 dark:text-white">
                    ${total.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN
                  </span>
                </div>
              </div>
            </div>

            {/* 3. Motor de Cobro Multiforma (Split Payment) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-50/50 via-gray-50/70 to-teal-50/30 dark:from-emerald-950/20 dark:via-[#121212] dark:to-teal-950/10 border border-emerald-200/60 dark:border-emerald-800/40 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                  <Calculator className="w-3.5 h-3.5 text-emerald-600" />
                  <span>3. Formas de Pago Mixtas (Split Payment)</span>
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleAddPaymentRow}
                  className="rounded-xl text-xs h-8 px-2.5 gap-1 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 bg-white dark:bg-[#181818]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Dividir Pago (+ Método)</span>
                </Button>
              </div>

              {/* Filas de Pago */}
              <div className="space-y-2.5">
                {payments.map((p, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-white dark:bg-[#181818] border border-gray-200 dark:border-gray-700 grid grid-cols-12 gap-2.5 items-center shadow-2xs"
                  >
                    <div className="col-span-12 sm:col-span-4">
                      <Select
                        value={p.method}
                        onValueChange={(val) => handlePaymentChange(idx, "method", val as PaymentMethodType)}
                      >
                        <SelectTrigger className="text-xs h-8 rounded-lg bg-gray-50 dark:bg-[#111]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl text-xs">
                          <SelectItem value="CASH">💵 Efectivo</SelectItem>
                          <SelectItem value="CARD_TERMINAL">💳 Tarjeta Terminal POS</SelectItem>
                          <SelectItem value="SPEI_TRANSFER">🏦 Transferencia SPEI</SelectItem>
                          <SelectItem value="STRIPE">⚡ Tarjeta Online (Stripe)</SelectItem>
                          <SelectItem value="MERCADO_PAGO">📱 Mercado Pago / CoDi</SelectItem>
                          <SelectItem value="VOUCHER">🎟️ Vale / Seguro de Salud</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="col-span-6 sm:col-span-4">
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
                        <Input
                          type="number"
                          step="0.01"
                          value={p.amount}
                          onChange={(e) => handlePaymentChange(idx, "amount", e.target.value)}
                          placeholder="Monto"
                          className="text-xs h-8 pl-6 rounded-lg font-mono font-black"
                        />
                      </div>
                    </div>

                    <div className="col-span-5 sm:col-span-3">
                      <Input
                        value={p.reference || ""}
                        onChange={(e) => handleItemChange(idx, "reference" as any, e.target.value)}
                        placeholder="Folio / Aut. / Ref..."
                        className="text-[11px] h-8 rounded-lg"
                      />
                    </div>

                    <div className="col-span-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleRemovePaymentRow(idx)}
                        disabled={payments.length <= 1}
                        className="w-7 h-7 rounded-lg text-gray-400 hover:text-rose-600 disabled:opacity-30 flex items-center justify-center cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Si hay pago en efectivo: Calculadora de cambio y billetes rápidos */}
              {cashPayment && (
                <div className="p-3.5 rounded-xl bg-white dark:bg-[#181818] border border-gray-200 dark:border-gray-700 space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-gray-600 dark:text-gray-300 flex items-center gap-1">
                      <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Efectivo Recibido (Para calcular cambio):</span>
                    </span>

                    <div className="flex items-center gap-2">
                      <div className="relative w-32">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span>
                        <Input
                          type="number"
                          value={cashGiven || ""}
                          onChange={(e) => setCashGiven(Number(e.target.value) || 0)}
                          placeholder="0.00"
                          className="text-xs h-8 pl-6 rounded-lg font-mono font-bold"
                        />
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-gray-400 block font-bold uppercase">Cambio:</span>
                        <span className="text-sm font-black font-mono text-emerald-600 dark:text-emerald-400">
                          ${changeToGive.toFixed(2)} MXN
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Billetes rápidos */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-gray-100 dark:border-gray-800">
                    <span className="text-[10px] text-gray-400 font-bold">Sumar Billetes:</span>
                    {PRESET_DENOMINATIONS.map((d) => (
                      <button
                        key={d.value}
                        type="button"
                        onClick={() => handleFastCashPreset(d.value)}
                        className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-gray-50 dark:bg-[#202020] border border-gray-200 dark:border-gray-700 hover:border-emerald-500 transition-colors"
                      >
                        +{d.label}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setCashGiven(cashAmount)}
                      className="px-2 py-0.5 rounded-md text-[10px] font-bold text-gray-500 hover:text-emerald-600 ml-auto underline"
                    >
                      Exacto
                    </button>
                  </div>
                </div>
              )}

              {/* Resumen del Cuadre de Pagos */}
              <div className="flex items-center justify-between pt-2 text-xs font-bold">
                <div className="flex items-center gap-3">
                  <span className="text-gray-500">
                    Total Cubierto: <strong className="font-mono text-gray-900 dark:text-white">${totalPaid.toFixed(2)}</strong>
                  </span>
                  {remainingDue > 0 ? (
                    <span className="text-rose-600 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Faltan: ${remainingDue.toFixed(2)}</span>
                    </span>
                  ) : (
                    <span className="text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Total 100% Cubierto</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-5 sm:p-6 bg-white dark:bg-[#0c0c0c] border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3 shrink-0">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="rounded-xl text-xs h-10 px-4 text-gray-500 hover:text-gray-900"
            >
              Cancelar
            </Button>

            <Button
              type="button"
              onClick={handleProcessCheckout}
              disabled={isProcessing || remainingDue > 0}
              className="rounded-xl text-xs font-black h-11 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/25 flex items-center gap-2 cursor-pointer border-0"
            >
              {isProcessing ? (
                <QhSpinner size="sm" />
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Cobrar e Imprimir Ticket (${total.toFixed(2)} MXN)</span>
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
