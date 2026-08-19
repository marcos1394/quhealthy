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
  Stethoscope,
  Receipt,
  Users,
  CreditCard,
  Building2,
  Sparkles,
  Activity,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PrescriptionItem, InConsultationItem } from "@/types/ehr";
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

  // 🚀 NUEVOS PROPS: Procedimientos e Insumos en Consultorio
  inConsultationServices: InConsultationItem[];
  addInConsultationService: (svc: Omit<InConsultationItem, "id">) => void;
  removeInConsultationService: (id: string) => void;
  updateInConsultationServiceQty: (id: string, qty: number) => void;

  // 🚀 NUEVOS PROPS: Finanzas y Coordinación de Cobro
  basePrice: number;
  paymentStatus?: string;
  paymentHandlingMode: "COLLECT_NOW" | "DELEGATE_TO_STAFF";
  setPaymentHandlingMode: (mode: "COLLECT_NOW" | "DELEGATE_TO_STAFF") => void;

  onBack: () => void;
}

export const TreatmentCheckoutStep: React.FC<TreatmentCheckoutStepProps> = ({
  prescription,
  newRx,
  setNewRx,
  handleAddRx,
  removePrescriptionItem,
  inConsultationServices = [],
  addInConsultationService,
  removeInConsultationService,
  updateInConsultationServiceQty,
  basePrice = 0,
  paymentStatus = "",
  paymentHandlingMode = "COLLECT_NOW",
  setPaymentHandlingMode,
  onBack,
}) => {
  const t = useTranslations("EHR");
  const { products, isLoading, fetchInventory } = useCatalog();

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  // Estado para el formulario de Procedimientos en Consultorio
  const [newProcedure, setNewProcedure] = useState({
    name: "",
    price: "",
    quantity: 1,
    serviceType: "PROCEDURE" as "PROCEDURE" | "STUDY" | "SUPPLY" | "CUSTOM",
    catalogItemId: undefined as number | undefined,
    notes: "",
  });

  const [showProcedureDropdown, setShowProcedureDropdown] = useState(false);
  const procedureDropdownRef = useRef<HTMLDivElement>(null);

  // Dropdown para Farmacia / Receta
  const [showRxDropdown, setShowRxDropdown] = useState(false);
  const rxDropdownRef = useRef<HTMLDivElement>(null);

  // Filtros de catálogo
  const filteredCatalogItems = products.filter((item) =>
    item.name.toLowerCase().includes((newProcedure.name || "").toLowerCase())
  );

  const filteredRxProducts = products.filter((product) =>
    product.name.toLowerCase().includes((newRx.medicationName || "").toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        procedureDropdownRef.current &&
        !procedureDropdownRef.current.contains(event.target as Node)
      ) {
        setShowProcedureDropdown(false);
      }
      if (
        rxDropdownRef.current &&
        !rxDropdownRef.current.contains(event.target as Node)
      ) {
        setShowRxDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectProcedureItem = (item: UI_Product) => {
    setNewProcedure({
      ...newProcedure,
      name: item.name,
      price: item.price ? String(item.price) : "",
      catalogItemId: item.id,
      serviceType: "PROCEDURE",
    });
    setShowProcedureDropdown(false);
  };

  const handleAddProcedure = () => {
    if (!newProcedure.name.trim()) return;
    const priceNum = parseFloat(newProcedure.price) || 0;
    addInConsultationService({
      name: newProcedure.name.trim(),
      price: priceNum,
      quantity: newProcedure.quantity || 1,
      serviceType: newProcedure.serviceType,
      catalogItemId: newProcedure.catalogItemId,
      notes: newProcedure.notes.trim() || undefined,
    });
    setNewProcedure({
      name: "",
      price: "",
      quantity: 1,
      serviceType: "PROCEDURE",
      catalogItemId: undefined,
      notes: "",
    });
  };

  const handleSelectRxProduct = (product: UI_Product) => {
    setNewRx({
      ...newRx,
      medicationName: product.name,
      catalogItemId: product.id,
      price: product.price || 0,
    });
    setShowRxDropdown(false);
  };

  // Cálculos Financieros
  const proceduresTotal = inConsultationServices.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
    0
  );

  const pharmacyTotal = prescription.reduce((sum, item) => {
    const price = Number((item as any).price) || 0;
    const qty = item.quantity || 1;
    return sum + price * qty;
  }, 0);

  const additionalChargesTotal = proceduresTotal + pharmacyTotal;
  const isPrepaid = paymentStatus === "SETTLED" || paymentStatus === "COMPLETED";
  const grandTotal = (basePrice || 0) + proceduresTotal + pharmacyTotal;
  const pendingToCollect = isPrepaid ? additionalChargesTotal : grandTotal;

  const FREQUENCY_OPTIONS = [
    { value: "EVERY_4_HOURS", label: "Cada 4 horas", readable: "cada 4 horas" },
    { value: "EVERY_6_HOURS", label: "Cada 6 horas", readable: "cada 6 horas" },
    { value: "EVERY_8_HOURS", label: "Cada 8 horas", readable: "cada 8 horas" },
    { value: "EVERY_12_HOURS", label: "Cada 12 horas", readable: "cada 12 horas" },
    { value: "ONCE_DAILY", label: "1 vez al día", readable: "1 vez al día" },
    { value: "AS_NEEDED", label: "Según sea necesario (PRN)", readable: "según sea necesario" },
    { value: "CUSTOM", label: "Personalizado / Texto libre", readable: "" },
  ];

  return (
    <div className="h-full flex flex-col max-w-5xl mx-auto w-full font-sans transition-colors space-y-8 pb-12">
      {/* ── HEADER TÉCNICO ────────────────────────────────────────────── */}
      <div className="text-center flex flex-col items-center space-y-2">
        <div className="w-14 h-14 rounded-3xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-xs">
          <Stethoscope className="w-7 h-7" strokeWidth={2} />
        </div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
          Cierre Clínico & Liquidación
        </p>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
          Tratamiento, Procedimientos & Cuenta
        </h2>
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 max-w-xl mx-auto leading-relaxed">
          Agrega los procedimientos e insumos realizados en el consultorio, expide la receta médica y consolida el ticket de cobro para ti o tu recepción.
        </p>
      </div>

      {/* ── SECCIÓN 1: PROCEDIMIENTOS & INSUMOS EN CONSULTORIO ────────── */}
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm overflow-hidden transition-colors">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-[#050505] p-5 sm:p-6 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-xs">
              <Activity className="w-4 h-4" strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-gray-900 dark:text-white tracking-tight">
                1. Procedimientos, Estudios e Insumos en Consultorio
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Suturas, lavados óticos, ECG, nebulizaciones, aplicaciones inyectadas o insumos utilizados.
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-full text-[11px] font-bold shadow-2xs shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{inConsultationServices.length} agregados</span>
          </div>
        </div>

        <div className="p-5 sm:p-6 space-y-6">
          {/* Formulario de Agregar Procedimiento */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 p-4 rounded-2xl bg-gray-50/50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 shadow-xs">
            {/* Buscador de Procedimiento / Insumo */}
            <div
              className="col-span-1 md:col-span-5 space-y-1.5 relative"
              ref={procedureDropdownRef}
            >
              <label className="text-[11px] font-bold text-gray-800 dark:text-gray-200 block">
                Nombre del Procedimiento / Insumo
              </label>
              <div className="relative flex items-center">
                <Search className="w-4 h-4 absolute left-3.5 text-gray-400 pointer-events-none" strokeWidth={2} />
                <Input
                  placeholder="Ej. Lavado ótico, Sutura, ECG, Inyección..."
                  value={newProcedure.name}
                  onChange={(e) => {
                    setNewProcedure({ ...newProcedure, name: e.target.value, catalogItemId: undefined });
                    setShowProcedureDropdown(true);
                  }}
                  onFocus={() => setShowProcedureDropdown(true)}
                  className="bg-white dark:bg-[#0a0a0a] h-10 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white pl-10 pr-4 focus-visible:ring-emerald-500/20 shadow-xs"
                />
              </div>

              {/* Dropdown de Catálogo */}
              {showProcedureDropdown && newProcedure.name.length > 0 && (
                <div className="absolute left-0 right-0 top-full z-50 mt-2 bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl max-h-52 overflow-y-auto custom-scrollbar">
                  {filteredCatalogItems.length > 0 ? (
                    <div className="divide-y divide-gray-100 dark:divide-gray-800/60">
                      {filteredCatalogItems.map((item) => (
                        <div
                          key={item.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => handleSelectProcedureItem(item)}
                          onKeyDown={(e) => e.key === "Enter" && handleSelectProcedureItem(item)}
                          className="flex items-center justify-between p-3 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 cursor-pointer transition-colors"
                        >
                          <div>
                            <p className="text-xs font-bold text-gray-900 dark:text-white">{item.name}</p>
                            <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">
                              {item.category || "Servicio"}
                            </span>
                          </div>
                          <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            ${item.price || 0} MXN
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 text-xs font-medium text-gray-400 text-center">
                      Presiona agregar para registrarlo como personalizado
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Tipo */}
            <div className="col-span-1 md:col-span-2 space-y-1.5">
              <label className="text-[11px] font-bold text-gray-800 dark:text-gray-200 block">Tipo</label>
              <Select
                value={newProcedure.serviceType}
                onValueChange={(val: any) => setNewProcedure({ ...newProcedure, serviceType: val })}
              >
                <SelectTrigger className="bg-white dark:bg-[#0a0a0a] h-10 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="PROCEDURE" className="text-xs">Procedimiento</SelectItem>
                  <SelectItem value="STUDY" className="text-xs">Estudio / Gabinete</SelectItem>
                  <SelectItem value="SUPPLY" className="text-xs">Insumo / Kit</SelectItem>
                  <SelectItem value="CUSTOM" className="text-xs">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Precio Unitario */}
            <div className="col-span-1 md:col-span-2 space-y-1.5">
              <label className="text-[11px] font-bold text-gray-800 dark:text-gray-200 block">Precio ($ MXN)</label>
              <Input
                type="number"
                min="0"
                step="50"
                placeholder="0.00"
                value={newProcedure.price}
                onChange={(e) => setNewProcedure({ ...newProcedure, price: e.target.value })}
                className="bg-white dark:bg-[#0a0a0a] h-10 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-bold font-mono text-gray-900 dark:text-white"
              />
            </div>

            {/* Cantidad */}
            <div className="col-span-1 md:col-span-1 space-y-1.5">
              <label className="text-[11px] font-bold text-gray-800 dark:text-gray-200 block">Cant.</label>
              <Input
                type="number"
                min="1"
                value={newProcedure.quantity}
                onChange={(e) => setNewProcedure({ ...newProcedure, quantity: parseInt(e.target.value) || 1 })}
                className="bg-white dark:bg-[#0a0a0a] h-10 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-bold font-mono text-center text-gray-900 dark:text-white"
              />
            </div>

            {/* Botón Agregar */}
            <div className="col-span-1 md:col-span-2 flex items-end">
              <button
                type="button"
                onClick={handleAddProcedure}
                disabled={!newProcedure.name.trim()}
                className="w-full h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border-0"
              >
                <Plus className="w-4 h-4" strokeWidth={2.5} />
                <span>Agregar</span>
              </button>
            </div>
          </div>

          {/* Lista de Procedimientos en Consulta */}
          {inConsultationServices.length === 0 ? (
            <div className="py-6 text-center text-xs font-medium text-gray-400 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl bg-gray-50/30 dark:bg-[#050505]">
              No se han añadido procedimientos adicionales a esta consulta.
            </div>
          ) : (
            <div className="space-y-2.5">
              {inConsultationServices.map((svc) => (
                <div
                  key={svc.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold border border-emerald-200 dark:border-emerald-900/40">
                      {svc.serviceType}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-gray-900 dark:text-white">{svc.name}</p>
                      <p className="text-[11px] font-mono text-gray-500">
                        ${svc.price} MXN c/u × {svc.quantity} = <strong className="text-emerald-600 dark:text-emerald-400">${svc.price * svc.quantity} MXN</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
                      <button
                        type="button"
                        onClick={() => updateInConsultationServiceQty(svc.id, svc.quantity - 1)}
                        className="px-2 py-1 text-xs hover:bg-gray-100 dark:hover:bg-gray-800 font-bold"
                      >
                        -
                      </button>
                      <span className="px-2.5 text-xs font-bold font-mono">{svc.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateInConsultationServiceQty(svc.id, svc.quantity + 1)}
                        className="px-2 py-1 text-xs hover:bg-gray-100 dark:hover:bg-gray-800 font-bold"
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeInConsultationService(svc.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 transition-colors border border-red-100 dark:border-red-900/30 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── SECCIÓN 2: RECETA MÉDICA DIGITAL (TRATAMIENTO DOMICILIARIO) ─ */}
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm overflow-hidden transition-colors">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-[#050505] p-5 sm:p-6 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-xs">
              <Pill className="w-4 h-4" strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-gray-900 dark:text-white tracking-tight">
                2. Receta Médica Digital (Tratamiento Domiciliario NOM-004)
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Medicamentos que el paciente tomará en casa tras la consulta.
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 bg-emerald-600 text-white px-3.5 py-1.5 rounded-full text-[11px] font-bold shadow-xs shrink-0">
            <ShoppingBag className="w-3.5 h-3.5" strokeWidth={2} />
            <span>Farmacia del Catálogo</span>
          </div>
        </div>

        <div className="p-5 sm:p-6 space-y-6">
          {/* Grid de Formulario de Receta */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 p-5 rounded-2xl bg-gray-50/50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 shadow-xs">
            {/* Buscador de Producto / Fármaco */}
            <div className="col-span-1 md:col-span-6 space-y-1.5 relative" ref={rxDropdownRef}>
              <label className="text-xs font-bold text-gray-800 dark:text-gray-200 block">
                Fármaco o Producto de Farmacia
              </label>

              <div className="relative flex items-center">
                <Search className="w-4 h-4 absolute left-3.5 text-gray-400 pointer-events-none" strokeWidth={2} />
                <Input
                  placeholder="Buscar en farmacia o ingresar fármaco libre..."
                  value={newRx.medicationName}
                  onChange={(e) => {
                    setNewRx({ ...newRx, medicationName: e.target.value, catalogItemId: undefined });
                    setShowRxDropdown(true);
                  }}
                  onFocus={() => setShowRxDropdown(true)}
                  className="bg-white dark:bg-[#0a0a0a] h-11 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white pl-10 pr-10 focus-visible:ring-emerald-500/20 placeholder:text-gray-400 shadow-xs"
                />
                {isLoading && (
                  <div className="absolute right-3.5 flex items-center pointer-events-none">
                    <QhSpinner size="sm" className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                )}
              </div>

              {/* Dropdown de Farmacia */}
              {showRxDropdown && newRx.medicationName.length > 0 && (
                <div className="absolute left-0 right-0 top-full z-50 mt-2 bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl max-h-60 overflow-y-auto custom-scrollbar">
                  {filteredRxProducts.length > 0 ? (
                    <div className="divide-y divide-gray-100 dark:divide-gray-800/60">
                      {filteredRxProducts.map((product) => (
                        <div
                          key={product.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => handleSelectRxProduct(product)}
                          onKeyDown={(e) => e.key === "Enter" && handleSelectRxProduct(product)}
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
                            <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{product.name}</p>
                            <div className="flex gap-2 items-center text-[11px] font-semibold text-gray-400 font-mono">
                              <span>{product.price ? `$${product.price} MXN` : "Consultar precio"}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-xs font-medium text-gray-400 text-center">
                      Presiona agregar para prescribirlo como texto libre
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Dosis */}
            <div className="col-span-1 md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-gray-800 dark:text-gray-200 block">Dosis (ej. 500 mg)</label>
              <Input
                placeholder="500 mg, 1 tableta..."
                value={newRx.dosage}
                onChange={(e) => setNewRx({ ...newRx, dosage: e.target.value })}
                className="bg-white dark:bg-[#0a0a0a] h-11 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white"
              />
            </div>

            {/* Vía de administración */}
            <div className="col-span-1 md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-gray-800 dark:text-gray-200 block">Vía de adm.</label>
              <Input
                placeholder="Oral, Tópica, IM..."
                value={newRx.administrationRoute || ""}
                onChange={(e) => setNewRx({ ...newRx, administrationRoute: e.target.value })}
                className="bg-white dark:bg-[#0a0a0a] h-11 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white"
              />
            </div>

            {/* Cantidad Venta */}
            <div className="col-span-1 md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-gray-800 dark:text-gray-200 block">Cant. Cajas/Frascos</label>
              <Input
                type="number"
                min="1"
                placeholder="1"
                value={newRx.quantity || 1}
                onChange={(e) => setNewRx({ ...newRx, quantity: parseInt(e.target.value) || 1 })}
                className="bg-white dark:bg-[#0a0a0a] h-11 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-bold font-mono text-center text-gray-900 dark:text-white"
              />
            </div>

            {/* Frecuencia */}
            <div className="col-span-1 md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-gray-800 dark:text-gray-200 block">Frecuencia</label>
              <Select
                value={newRx.frequencyEnum || ""}
                onValueChange={(val) => {
                  if (val === "CUSTOM") {
                    setNewRx({ ...newRx, frequencyEnum: val, frequency: "" });
                  } else {
                    const opt = FREQUENCY_OPTIONS.find((o) => o.value === val);
                    setNewRx({ ...newRx, frequencyEnum: val, frequency: opt?.readable || "" });
                  }
                }}
              >
                <SelectTrigger className="bg-white dark:bg-[#0a0a0a] h-11 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white">
                  <SelectValue placeholder="Seleccionar frecuencia" />
                </SelectTrigger>
                <SelectContent className="rounded-xl font-sans">
                  {FREQUENCY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="text-xs font-semibold">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Duración */}
            <div className="col-span-1 md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-gray-800 dark:text-gray-200 block">Duración</label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  min="1"
                  placeholder="Días"
                  value={newRx.durationDays || ""}
                  onChange={(e) => {
                    const days = e.target.value;
                    setNewRx({
                      ...newRx,
                      durationDays: days,
                      duration: days ? `${days} días` : "",
                    });
                  }}
                  className="bg-white dark:bg-[#0a0a0a] h-11 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-bold font-mono text-center text-gray-900 dark:text-white w-20 shrink-0"
                />
                <Input
                  placeholder="Ej. 7 días"
                  value={newRx.duration}
                  onChange={(e) => setNewRx({ ...newRx, duration: e.target.value })}
                  className="bg-white dark:bg-[#0a0a0a] h-11 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white flex-1"
                />
              </div>
            </div>

            {/* Instrucciones */}
            <div className="col-span-1 md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-gray-800 dark:text-gray-200 block">Indicaciones Extra</label>
              <Input
                placeholder="Tomar después de los alimentos..."
                value={newRx.instructions}
                onChange={(e) => setNewRx({ ...newRx, instructions: e.target.value })}
                className="bg-white dark:bg-[#0a0a0a] h-11 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white"
              />
            </div>

            {/* Botón Agregar Receta */}
            <div className="col-span-1 md:col-span-6 pt-2">
              <button
                type="button"
                onClick={handleAddRx}
                disabled={!newRx.medicationName}
                className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border-0"
              >
                <Plus className="w-4 h-4" strokeWidth={2.5} />
                <span>Agregar Medicamento a la Receta</span>
              </button>
            </div>
          </div>

          {/* Lista de Fármacos en Receta */}
          {prescription.length === 0 ? (
            <div className="py-6 text-center text-xs font-medium text-gray-400 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl bg-gray-50/30 dark:bg-[#050505]">
              No se han agregado medicamentos a la receta médica.
            </div>
          ) : (
            <div className="space-y-2.5">
              {prescription.map((item: any) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center p-4 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 shadow-xs"
                >
                  <div className="space-y-1 min-w-0 pr-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-bold text-xs text-gray-900 dark:text-white">{item.medicationName}</h4>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold border border-emerald-200 dark:border-emerald-900/40">
                        {item.dosage}
                      </span>
                      {item.catalogItemId && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-bold">
                          <ShoppingBag className="w-3 h-3" />
                          <span>Venta directa (${item.price || 0} MXN × {item.quantity || 1})</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {item.administrationRoute && <span className="font-bold mr-1">Vía {item.administrationRoute}.</span>}
                      Tomar {item.frequency} durante {item.duration}.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => removePrescriptionItem(item.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 transition-colors border border-red-100 dark:border-red-900/30 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── SECCIÓN 3: RESUMEN CONSOLIDADO DE CUENTA (TICKET) ─────────── */}
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm overflow-hidden transition-colors">
        <div className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-[#050505] p-5 sm:p-6 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-xs">
            <Receipt className="w-4 h-4" strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-gray-900 dark:text-white tracking-tight">
              3. Resumen Consolidado de Cuenta (Ticket de Consulta)
            </h3>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              Desglose completo de conceptos que se cobrarán por esta atención médica.
            </p>
          </div>
        </div>

        <div className="p-5 sm:p-6 space-y-4">
          <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/40 dark:bg-[#050505] p-4 sm:p-5 space-y-3">
            {/* Fila Cita Base */}
            <div className="flex justify-between items-center text-xs pb-2 border-b border-gray-200 dark:border-gray-800/60">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isPrepaid ? "bg-emerald-500" : "bg-amber-500"}`} />
                <span className="font-semibold text-gray-800 dark:text-gray-200">Honorarios de Consulta Base</span>
                {isPrepaid && (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold border border-emerald-200 dark:border-emerald-900/40">
                    ✅ Pagado en Línea
                  </span>
                )}
              </div>
              <span className="font-mono font-bold text-gray-900 dark:text-white">
                ${basePrice} MXN {isPrepaid && <span className="text-[10px] text-emerald-600 font-semibold">(Saldado)</span>}
              </span>
            </div>

            {/* Procedimientos Adicionales */}
            {inConsultationServices.map((svc) => (
              <div key={svc.id} className="flex justify-between items-center text-xs text-gray-600 dark:text-gray-400 pl-4">
                <span>• Procedimiento: {svc.name} (×{svc.quantity})</span>
                <span className="font-mono font-semibold text-amber-600 dark:text-amber-400">+${svc.price * svc.quantity} MXN</span>
              </div>
            ))}

            {/* Farmacia / Productos */}
            {prescription.filter((item: any) => item.catalogItemId).map((item: any) => (
              <div key={item.id} className="flex justify-between items-center text-xs text-gray-600 dark:text-gray-400 pl-4">
                <span>• Farmacia: {item.medicationName} (×{item.quantity || 1})</span>
                <span className="font-mono font-semibold text-amber-600 dark:text-amber-400">+${(Number((item as any).price) || 0) * (item.quantity || 1)} MXN</span>
              </div>
            ))}

            {/* Gran Total / Saldo Pendiente */}
            <div className="pt-3 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wide">
                  {isPrepaid ? "Saldo Pendiente por Cobrar" : "Gran Total a Liquidar"}
                </p>
                <p className="text-[10px] text-gray-400 font-medium">
                  {isPrepaid
                    ? additionalChargesTotal > 0
                      ? "Cita base liquidada. Saldo por procedimientos/farmacia agregados."
                      : "La consulta ya fue pagada en línea al 100%."
                    : "Incluye cita, procedimientos y farmacia"}
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                  ${pendingToCollect} <span className="text-sm font-semibold text-gray-400">MXN</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── SECCIÓN 4: COORDINACIÓN DE COBRO (MÉDICO VS RECEPCIÓN) ───── */}
      {isPrepaid && additionalChargesTotal === 0 ? (
        <div className="bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 shadow-2xs">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                Consulta Pagada en Línea (Sin Saldo Pendiente)
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xl">
                Esta consulta fue liquidada con anticipación vía pasarela de pagos. No se agregaron conceptos ni procedimientos adicionales, por lo que la cuenta está 100% saldada.
              </p>
            </div>
          </div>
          <span className="px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 text-xs font-bold shrink-0 border border-emerald-200 dark:border-emerald-800">
            Saldo Pendiente: $0.00 MXN
          </span>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm overflow-hidden transition-colors">
          <div className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-[#050505] p-5 sm:p-6 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-xs">
              <Users className="w-4 h-4" strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-gray-900 dark:text-white tracking-tight">
                {isPrepaid
                  ? `4. Modalidad de Cobro para Cargos Adicionales ($${additionalChargesTotal} MXN)`
                  : "4. Modalidad de Cobro & Coordinación de Equipo"}
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                {isPrepaid
                  ? `Define si cobrarás en consultorio los $${additionalChargesTotal} MXN de adicionales o enviarás el saldo a recepción.`
                  : "Define si cobrarás directamente en consultorio o enviarás la cuenta a la recepción de la clínica."}
              </p>
            </div>
          </div>

          <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Opción A: Cobrar yo mismo */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => setPaymentHandlingMode("COLLECT_NOW")}
              onKeyDown={(e) => e.key === "Enter" && setPaymentHandlingMode("COLLECT_NOW")}
              className={`p-5 rounded-2xl border-2 transition-all cursor-pointer select-none ${
                paymentHandlingMode === "COLLECT_NOW"
                  ? "border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20 shadow-sm"
                  : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 bg-white dark:bg-[#0a0a0a]"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  paymentHandlingMode === "COLLECT_NOW"
                    ? "border-emerald-600 bg-emerald-600 text-white"
                    : "border-gray-300 dark:border-gray-700"
                }`}>
                  {paymentHandlingMode === "COLLECT_NOW" && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
              </div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                {isPrepaid ? "Cobrar adicionales en consultorio" : "Cobrar yo mismo ahora en consultorio"}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                {isPrepaid
                  ? `Se abrirá la pasarela al finalizar para cobrar los $${additionalChargesTotal} MXN (efectivo, tarjeta física o link de pago).`
                  : "Ideal si trabajas como médico independiente. Al finalizar se abrirá la pasarela para registrar efectivo con cálculo de cambio, tarjeta física POS o link de pago."}
              </p>
            </div>

            {/* Opción B: Delegar a Recepción / Staff */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => setPaymentHandlingMode("DELEGATE_TO_STAFF")}
              onKeyDown={(e) => e.key === "Enter" && setPaymentHandlingMode("DELEGATE_TO_STAFF")}
              className={`p-5 rounded-2xl border-2 transition-all cursor-pointer select-none ${
                paymentHandlingMode === "DELEGATE_TO_STAFF"
                  ? "border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20 shadow-sm"
                  : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 bg-white dark:bg-[#0a0a0a]"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  paymentHandlingMode === "DELEGATE_TO_STAFF"
                    ? "border-emerald-600 bg-emerald-600 text-white"
                    : "border-gray-300 dark:border-gray-700"
                }`}>
                  {paymentHandlingMode === "DELEGATE_TO_STAFF" && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
              </div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                {isPrepaid ? "Enviar adicionales a Recepción" : "Enviar a Recepción / Staff para Cobro"}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                {isPrepaid
                  ? `La consulta se finaliza y el ticket por los $${additionalChargesTotal} MXN adicionales pasa al staff de recepción.`
                  : "La consulta se sella clínicamente de inmediato y el ticket consolidado pasa al mostrador de recepción para que el asistente cobre al paciente al salir."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── FOOTER DE NAVEGACIÓN ──────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="w-full sm:w-auto h-12 px-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#111] text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={2} />
          <span>Volver a Evaluación SOAP</span>
        </button>

        <div className="text-center sm:text-right text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center flex-wrap justify-center sm:justify-end gap-1.5">
          <span>Total consolidado:</span>
          <span className="inline-flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-900/40">
            <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
            <span>${grandTotal} MXN ({paymentHandlingMode === "DELEGATE_TO_STAFF" ? "Cobro en Recepción" : "Cobro por Médico"})</span>
          </span>
        </div>
      </div>
    </div>
  );
};