"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/no-giant-component */

import React, { useEffect, useState } from "react";
import {
  Package,
  Plus,
  Search,
  Filter,
  Upload,
  FileText,
  ShieldCheck,
  AlertTriangle,
  ThermometerSnowflake,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  ExternalLink,
  Layers,
  Sparkles,
} from "lucide-react";
import { toast } from "react-toastify";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { supplierService } from "@/services/supplier.service";
import {
  MedicalProduct,
  RiskClass,
  ProductComplianceStatus,
  SaveMedicalProductPayload,
} from "@/types/supplier";

export default function SupplierProductsPage() {
  const [products, setProducts] = useState<MedicalProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRisk, setSelectedRisk] = useState<string>("ALL");

  // Modal Crear / Editar
  const [modalOpen, setModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [genericName, setGenericName] = useState("");
  const [sku, setSku] = useState("");
  const [barcodeEan, setBarcodeEan] = useState("");
  const [satProdServKey, setSatProdServKey] = useState("");
  const [brand, setBrand] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [category, setCategory] = useState("MATERIAL_CURACION");
  const [description, setDescription] = useState("");
  const [riskClass, setRiskClass] = useState<RiskClass>("CLASS_I");
  const [cofeprisRegisterNumber, setCofeprisRegisterNumber] = useState("");
  const [cofeprisRegisterExpiry, setCofeprisRegisterExpiry] = useState("");
  const [technicalSheetUrl, setTechnicalSheetUrl] = useState("");
  const [basePriceB2c, setBasePriceB2c] = useState<string>("");
  const [isB2cEnabled, setIsB2cEnabled] = useState(true);
  const [isB2bEnabled, setIsB2bEnabled] = useState(true);
  const [isRentalEnabled, setIsRentalEnabled] = useState(false);
  const [rentalMonthlyRate, setRentalMonthlyRate] = useState<string>("");

  // Storage Requirements Form
  const [requiresColdChain, setRequiresColdChain] = useState(false);
  const [minTemperature, setMinTemperature] = useState<string>("");
  const [maxTemperature, setMaxTemperature] = useState<string>("");
  const [lightSensitive, setLightSensitive] = useState(false);
  const [humidityControlled, setHumidityControlled] = useState(false);
  const [specialHandling, setSpecialHandling] = useState("");

  // Modal CSV Import
  const [csvModalOpen, setCsvModalOpen] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const data = await supplierService.getProducts();
      setProducts(data);
    } catch {
      toast.error("Error al cargar el catálogo de productos.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setName("");
    setGenericName("");
    setSku("");
    setBarcodeEan("");
    setSatProdServKey("");
    setBrand("");
    setManufacturer("");
    setCategory("MATERIAL_CURACION");
    setDescription("");
    setRiskClass("CLASS_I");
    setCofeprisRegisterNumber("");
    setCofeprisRegisterExpiry("");
    setTechnicalSheetUrl("");
    setBasePriceB2c("");
    setIsB2cEnabled(true);
    setIsB2bEnabled(true);
    setIsRentalEnabled(false);
    setRentalMonthlyRate("");
    setRequiresColdChain(false);
    setMinTemperature("");
    setMaxTemperature("");
    setLightSensitive(false);
    setHumidityControlled(false);
    setSpecialHandling("");
    setModalOpen(true);
  };

  const handleOpenEditModal = (p: MedicalProduct) => {
    setEditingId(p.id);
    setName(p.name);
    setGenericName(p.genericName || "");
    setSku(p.sku || "");
    setBarcodeEan(p.barcodeEan || "");
    setSatProdServKey(p.satProdServKey || "");
    setBrand(p.brand || "");
    setManufacturer(p.manufacturer || "");
    setCategory(p.category || "MATERIAL_CURACION");
    setDescription(p.description || "");
    setRiskClass(p.riskClass || "CLASS_I");
    setCofeprisRegisterNumber(p.cofeprisRegisterNumber || "");
    setCofeprisRegisterExpiry(p.cofeprisRegisterExpiry || "");
    setTechnicalSheetUrl(p.technicalSheetUrl || "");
    setBasePriceB2c(p.basePriceB2c ? p.basePriceB2c.toString() : "");
    setIsB2cEnabled(p.isB2cEnabled);
    setIsB2bEnabled(p.isB2bEnabled);
    setIsRentalEnabled(p.isRentalEnabled);
    setRentalMonthlyRate(p.rentalMonthlyRate ? p.rentalMonthlyRate.toString() : "");

    const req = p.storageRequirement;
    setRequiresColdChain(req?.requiresColdChain || false);
    setMinTemperature(req?.minTemperature !== undefined ? req.minTemperature.toString() : "");
    setMaxTemperature(req?.maxTemperature !== undefined ? req.maxTemperature.toString() : "");
    setLightSensitive(req?.lightSensitive || false);
    setHumidityControlled(req?.humidityControlled || false);
    setSpecialHandling(req?.specialHandlingInstructions || "");
    setModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.warning("El nombre del producto es obligatorio.");
      return;
    }

    try {
      setIsSaving(true);
      const payload: SaveMedicalProductPayload = {
        name: name.trim(),
        genericName: genericName.trim() || undefined,
        sku: sku.trim() || undefined,
        barcodeEan: barcodeEan.trim() || undefined,
        satProdServKey: satProdServKey.trim() || undefined,
        brand: brand.trim() || undefined,
        manufacturer: manufacturer.trim() || undefined,
        category,
        description: description.trim() || undefined,
        riskClass,
        cofeprisRegisterNumber: cofeprisRegisterNumber.trim() || undefined,
        cofeprisRegisterExpiry: cofeprisRegisterExpiry || undefined,
        technicalSheetUrl: technicalSheetUrl.trim() || undefined,
        basePriceB2c: basePriceB2c ? parseFloat(basePriceB2c) : undefined,
        isB2cEnabled,
        isB2bEnabled,
        isRentalEnabled,
        rentalMonthlyRate: rentalMonthlyRate ? parseFloat(rentalMonthlyRate) : undefined,
        requiresColdChain,
        minTemperature: minTemperature ? parseFloat(minTemperature) : undefined,
        maxTemperature: maxTemperature ? parseFloat(maxTemperature) : undefined,
        lightSensitive,
        humidityControlled,
        specialHandlingInstructions: specialHandling.trim() || undefined,
      };

      if (editingId) {
        await supplierService.updateProduct(editingId, payload);
        toast.success("Producto actualizado correctamente.");
      } else {
        await supplierService.createProduct(payload);
        toast.success("Producto creado con éxito.");
      }

      setModalOpen(false);
      loadProducts();
    } catch {
      toast.error("Error al guardar el producto.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm("¿Seguro que deseas desactivar este producto del catálogo?")) return;
    try {
      await supplierService.deleteProduct(id);
      toast.success("Producto desactivado.");
      loadProducts();
    } catch {
      toast.error("Error al desactivar el producto.");
    }
  };

  const handleImportCsv = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvFile) {
      toast.warning("Selecciona un archivo CSV válido.");
      return;
    }

    try {
      setIsImporting(true);
      const res = await supplierService.importProductsCsv(csvFile);
      toast.success(`Importación finalizada: ${res.successfulImports} productos procesados con éxito.`);
      if (res.errors && res.errors.length > 0) {
        toast.warning(`${res.failedImports} filas con errores.`);
      }
      setCsvModalOpen(false);
      setCsvFile(null);
      loadProducts();
    } catch {
      toast.error("Error al procesar el archivo CSV.");
    } finally {
      setIsImporting(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      p.name.toLowerCase().includes(q) ||
      (p.sku && p.sku.toLowerCase().includes(q)) ||
      (p.brand && p.brand.toLowerCase().includes(q)) ||
      (p.cofeprisRegisterNumber && p.cofeprisRegisterNumber.toLowerCase().includes(q));
    const matchesRisk = selectedRisk === "ALL" || p.riskClass === selectedRisk;
    return matchesSearch && matchesRisk;
  });

  return (
    <div className="min-h-screen bg-slate-50/70 p-4 sm:p-6 lg:p-8 font-sans">
      {/* 🚀 Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Fase 2: Catálogo & Trazabilidad
            </span>
            <span className="text-xs text-slate-400">Total: {products.length} SKUs</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">Catálogo Maestro de Insumos Médicos</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Administra especificaciones técnicas, requerimientos de temperatura, cumplimiento COFEPRIS y canales de venta.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setCsvModalOpen(true)}
            className="px-4 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-2xl transition-all shadow-2xs flex items-center gap-2"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            Importar CSV
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl transition-all shadow-md shadow-indigo-600/20 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nuevo Insumo
          </button>
        </div>
      </div>

      {/* 🔍 Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs mb-6">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre, SKU, marca o registro COFEPRIS..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedRisk}
            onChange={(e) => setSelectedRisk(e.target.value)}
            className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 text-slate-700 font-medium focus:outline-none"
          >
            <option value="ALL">Todas las Clases de Riesgo</option>
            <option value="CLASS_I">Clase I (Bajo Riesgo)</option>
            <option value="CLASS_II">Clase II (Riesgo Moderado)</option>
            <option value="CLASS_III">Clase III (Alto Riesgo / Soporte de Vida)</option>
            <option value="NON_REGULATED">No Regulado / Consumible</option>
          </select>
        </div>
      </div>

      {/* 📦 Products Table */}
      {isLoading ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 flex flex-col items-center justify-center">
          <QhSpinner size="lg" className="text-indigo-600" />
          <p className="text-xs font-bold text-slate-500 mt-4 animate-pulse">Cargando catálogo...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 text-slate-400">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-bold text-slate-700">No se encontraron productos en el catálogo</p>
          <p className="text-xs text-slate-400 mt-1">Crea tu primer insumo médico o importa un archivo CSV.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">Producto & SKU</th>
                  <th className="py-3.5 px-4">Categoría & Riesgo</th>
                  <th className="py-3.5 px-4">Compliance COFEPRIS</th>
                  <th className="py-3.5 px-4">Almacenamiento</th>
                  <th className="py-3.5 px-4">Stock en Lotes</th>
                  <th className="py-3.5 px-4">Precio B2C</th>
                  <th className="py-3.5 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-4">
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-900 block text-xs">{prod.name}</span>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400">
                          {prod.sku && <span className="font-mono font-semibold text-slate-600">SKU: {prod.sku}</span>}
                          {prod.brand && <span>• {prod.brand}</span>}
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700 block w-max">
                          {prod.category || "GENERAL"}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 block">
                          {prod.riskClass}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            prod.complianceStatus === "VERIFIED"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          <ShieldCheck className="w-3 h-3" />
                          {prod.complianceStatus}
                        </span>
                        {prod.cofeprisRegisterNumber && (
                          <span className="text-[10px] text-slate-500 font-mono block">
                            Reg: {prod.cofeprisRegisterNumber}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      {prod.storageRequirement?.requiresColdChain ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          <ThermometerSnowflake className="w-3 h-3 text-blue-600" />
                          {prod.storageRequirement.minTemperature || 2}° a {prod.storageRequirement.maxTemperature || 8}°C
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500">Ambiente Controlado</span>
                      )}
                    </td>

                    <td className="py-4 px-4">
                      <div className="space-y-0.5">
                        <span className="font-extrabold text-slate-900 text-xs">{prod.totalStock || 0} u.</span>
                        <span className="text-[10px] text-slate-400 block">
                          ({prod.batches?.length || 0} lotes)
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span className="font-extrabold text-slate-900">
                        ${prod.basePriceB2c?.toLocaleString() || "0.00"} {prod.currency}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(prod)}
                          className="p-1.5 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(prod.id)}
                          className="p-1.5 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-lg transition-colors"
                          title="Desactivar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 🚀 MODAL: CREAR / EDITAR INSUMO */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-5 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-indigo-600 tracking-wider">
                  Catálogo Sanitario
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  {editingId ? "Editar Insumo Médico" : "Nuevo Insumo en Catálogo"}
                </h3>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nombre Comercial del Producto *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Catéter Intravenoso 18G"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nombre Genérico / Principio Activo</label>
                  <input
                    type="text"
                    placeholder="Ej. Catéter de teflón radiopaco"
                    value={genericName}
                    onChange={(e) => setGenericName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Código SKU</label>
                  <input
                    type="text"
                    placeholder="CAT-18G-001"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Código de Barras EAN-13</label>
                  <input
                    type="text"
                    placeholder="7501234567890"
                    value={barcodeEan}
                    onChange={(e) => setBarcodeEan(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Clave SAT (ClaveProdServ)</label>
                  <input
                    type="text"
                    placeholder="42142100"
                    value={satProdServKey}
                    onChange={(e) => setSatProdServKey(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Clase de Riesgo COFEPRIS</label>
                  <select
                    value={riskClass}
                    onChange={(e) => setRiskClass(e.target.value as RiskClass)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-medium"
                  >
                    <option value="CLASS_I">Clase I (Bajo Riesgo)</option>
                    <option value="CLASS_II">Clase II (Riesgo Moderado)</option>
                    <option value="CLASS_III">Clase III (Alto Riesgo)</option>
                    <option value="NON_REGULATED">No Regulado / Consumible</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Registro Sanitario COFEPRIS</label>
                  <input
                    type="text"
                    placeholder="Ej. 1234C2024 SSA"
                    value={cofeprisRegisterNumber}
                    onChange={(e) => setCofeprisRegisterNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Precio Base B2C (MXN)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="150.00"
                    value={basePriceB2c}
                    onChange={(e) => setBasePriceB2c(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-bold"
                  />
                </div>
              </div>

              {/* Condiciones de Almacenamiento & Cadena de Frío */}
              <div className="p-4 border border-slate-200 rounded-2xl bg-slate-50 space-y-3">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={requiresColdChain}
                    onChange={(e) => setRequiresColdChain(e.target.checked)}
                    className="rounded text-indigo-600"
                  />
                  <ThermometerSnowflake className="w-4 h-4 text-blue-600" />
                  Requiere Cadena de Frío / Almacenamiento Térmico Controlado
                </label>

                {requiresColdChain && (
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="font-bold text-slate-600 block mb-1">Temp. Mínima (°C)</label>
                      <input
                        type="number"
                        placeholder="2.0"
                        value={minTemperature}
                        onChange={(e) => setMinTemperature(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-600 block mb-1">Temp. Máxima (°C)</label>
                      <input
                        type="number"
                        placeholder="8.0"
                        value={maxTemperature}
                        onChange={(e) => setMaxTemperature(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2 rounded-xl transition-all shadow-sm"
                >
                  {isSaving ? "Guardando..." : "Guardar Producto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🚀 MODAL: IMPORTAR CSV */}
      {csvModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-indigo-600 tracking-wider">
                  Carga Masiva
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">Importar Catálogo por CSV</h3>
              </div>
              <button onClick={() => setCsvModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-slate-600 leading-relaxed">
              Sube un archivo <b>.CSV</b> con columnas: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">Nombre, SKU, Categoría, Precio, RegistroCOFEPRIS</code>.
            </p>

            <form onSubmit={handleImportCsv} className="space-y-4 pt-2">
              <input
                type="file"
                required
                accept=".csv"
                onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50"
              />

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCsvModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isImporting}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2 rounded-xl transition-all shadow-sm"
                >
                  {isImporting ? "Importando..." : "Procesar Archivo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
