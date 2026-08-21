"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/no-giant-component */

import React, { useEffect, useState } from "react";
import {
  Stethoscope,
  FileCheck,
  Wrench,
  Plus,
  Search,
  Filter,
  Calendar,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  X,
  Building2,
  QrCode,
  Tag,
  Warehouse,
  ExternalLink,
} from "lucide-react";
import { toast } from "react-toastify";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { supplierService } from "@/services/supplier.service";
import {
  BiomedicalAsset,
  EquipmentRentalContract,
  BiomedicalMaintenance,
  MedicalProduct,
  SupplierWarehouse,
  AssetCondition,
  AssetStatus,
  RentalContractStatus,
  MaintenanceType,
  SaveBiomedicalAssetPayload,
  SaveRentalContractPayload,
  ReturnRentalDepositPayload,
  SaveBiomedicalMaintenancePayload,
} from "@/types/supplier";

export default function SupplierRentalsPage() {
  const [activeTab, setActiveTab] = useState<"assets" | "contracts" | "maintenances">("assets");
  const [isLoading, setIsLoading] = useState(true);

  // Core Data
  const [assets, setAssets] = useState<BiomedicalAsset[]>([]);
  const [contracts, setContracts] = useState<EquipmentRentalContract[]>([]);
  const [maintenances, setMaintenances] = useState<BiomedicalMaintenance[]>([]);
  const [products, setProducts] = useState<MedicalProduct[]>([]);
  const [warehouses, setWarehouses] = useState<SupplierWarehouse[]>([]);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");

  // Modal 1: Registrar Activo Biomédico
  const [assetModalOpen, setAssetModalOpen] = useState(false);
  const [isSavingAsset, setIsSavingAsset] = useState(false);
  const [assetProdId, setAssetProdId] = useState<number | "">("");
  const [assetWhId, setAssetWhId] = useState<number | "">("");
  const [serialNumber, setSerialNumber] = useState("");
  const [assetTag, setAssetTag] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [manufactureYear, setManufactureYear] = useState<number>(2024);
  const [lastCalibration, setLastCalibration] = useState("");
  const [nextCalibration, setNextCalibration] = useState("");
  const [dailyRate, setDailyRate] = useState("");
  const [monthlyRate, setMonthlyRate] = useState("");
  const [depositRequired, setDepositRequired] = useState("");
  const [assetNotes, setAssetNotes] = useState("");

  // Modal 2: Crear Contrato de Renta
  const [contractModalOpen, setContractModalOpen] = useState(false);
  const [isSavingContract, setIsSavingContract] = useState(false);
  const [contractAssetId, setContractAssetId] = useState<number | "">("");
  const [renterName, setRenterName] = useState("");
  const [renterRfc, setRenterRfc] = useState("");
  const [renterEmail, setRenterEmail] = useState("");
  const [renterPhone, setRenterPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [contractStartDate, setContractStartDate] = useState("");
  const [contractEndDate, setContractEndDate] = useState("");
  const [contractMonthlyRate, setContractMonthlyRate] = useState("");
  const [contractDeposit, setContractDeposit] = useState("");

  // Modal 3: Devolución de Depósito
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState<number | null>(null);
  const [deductionAmount, setDeductionAmount] = useState("0");
  const [deductionReason, setDeductionReason] = useState("");

  // Modal 4: Registrar Mantenimiento
  const [maintModalOpen, setMaintModalOpen] = useState(false);
  const [isSavingMaint, setIsSavingMaint] = useState(false);
  const [maintAssetId, setMaintAssetId] = useState<number | "">("");
  const [maintType, setMaintType] = useState<MaintenanceType>("PREVENTIVE");
  const [maintDate, setMaintDate] = useState(new Date().toISOString().split("T")[0]);
  const [performedBy, setPerformedBy] = useState("");
  const [technicianName, setTechnicianName] = useState("");
  const [maintCost, setMaintCost] = useState("");
  const [findings, setFindings] = useState("");
  const [actionsTaken, setActionsTaken] = useState("");
  const [nextScheduledDate, setNextScheduledDate] = useState("");

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      setIsLoading(true);
      const [assetList, contractList, maintList, prodList, whList] = await Promise.all([
        supplierService.getAssets(),
        supplierService.getRentalContracts(),
        supplierService.getMaintenances(),
        supplierService.getProducts(),
        supplierService.getWarehouses(),
      ]);

      setAssets(assetList);
      setContracts(contractList);
      setMaintenances(maintList);
      setProducts(prodList);
      setWarehouses(whList);
    } catch {
      toast.error("Error al cargar la información de activos y rentas.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetProdId || !assetWhId || !serialNumber.trim()) {
      toast.warning("Completa el producto, almacén y número de serie.");
      return;
    }

    try {
      setIsSavingAsset(true);
      const payload: SaveBiomedicalAssetPayload = {
        productId: Number(assetProdId),
        warehouseId: Number(assetWhId),
        serialNumber: serialNumber.trim().toUpperCase(),
        assetTag: assetTag.trim() || undefined,
        brand: brand.trim() || undefined,
        model: model.trim() || undefined,
        manufactureYear: manufactureYear || undefined,
        lastCalibrationDate: lastCalibration || undefined,
        nextCalibrationDate: nextCalibration || undefined,
        dailyRentalRate: dailyRate ? parseFloat(dailyRate) : undefined,
        monthlyRentalRate: monthlyRate ? parseFloat(monthlyRate) : undefined,
        depositRequired: depositRequired ? parseFloat(depositRequired) : undefined,
        notes: assetNotes.trim() || undefined,
      };

      await supplierService.createAsset(payload);
      toast.success("Equipo biomédico registrado correctamente.");
      setAssetModalOpen(false);
      setSerialNumber("");
      setAssetTag("");
      loadAll();
    } catch {
      toast.error("Error al registrar el equipo biomédico.");
    } finally {
      setIsSavingAsset(false);
    }
  };

  const handleCreateContract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractAssetId || !renterName.trim() || !contractStartDate || !contractEndDate || !contractMonthlyRate) {
      toast.warning("Completa todos los campos obligatorios del contrato.");
      return;
    }

    try {
      setIsSavingContract(true);
      const payload: SaveRentalContractPayload = {
        assetId: Number(contractAssetId),
        renterOrganizationName: renterName.trim(),
        renterRfc: renterRfc.trim() || undefined,
        renterContactEmail: renterEmail.trim() || undefined,
        renterContactPhone: renterPhone.trim() || undefined,
        deliveryAddress: deliveryAddress.trim() || undefined,
        startDate: contractStartDate,
        endDate: contractEndDate,
        monthlyRate: parseFloat(contractMonthlyRate),
        depositAmount: parseFloat(contractDeposit) || 0,
      };

      await supplierService.createRentalContract(payload);
      toast.success("Contrato de renta generado con éxito.");
      setContractModalOpen(false);
      setRenterName("");
      loadAll();
    } catch {
      toast.error("Error al crear el contrato de renta.");
    } finally {
      setIsSavingContract(false);
    }
  };

  const handleReturnDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContractId) return;

    try {
      const payload: ReturnRentalDepositPayload = {
        returnDate: new Date().toISOString().split("T")[0],
        deductionAmount: parseFloat(deductionAmount) || 0,
        deductionReason: deductionReason.trim() || undefined,
      };

      await supplierService.returnRentalDeposit(selectedContractId, payload);
      toast.success("Depósito liquidado y equipo devuelto a disponibilidad.");
      setDepositModalOpen(false);
      loadAll();
    } catch {
      toast.error("Error al registrar la devolución del depósito.");
    }
  };

  const handleCreateMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!maintAssetId || !maintDate) {
      toast.warning("Selecciona el equipo y la fecha del servicio.");
      return;
    }

    try {
      setIsSavingMaint(true);
      const payload: SaveBiomedicalMaintenancePayload = {
        assetId: Number(maintAssetId),
        maintenanceType: maintType,
        maintenanceDate: maintDate,
        performedBy: performedBy.trim() || undefined,
        technicianName: technicianName.trim() || undefined,
        cost: maintCost ? parseFloat(maintCost) : undefined,
        findings: findings.trim() || undefined,
        actionsTaken: actionsTaken.trim() || undefined,
        nextScheduledDate: nextScheduledDate || undefined,
      };

      await supplierService.createMaintenance(payload);
      toast.success("Bitácora de mantenimiento registrada con éxito.");
      setMaintModalOpen(false);
      setFindings("");
      setActionsTaken("");
      loadAll();
    } catch {
      toast.error("Error al registrar el mantenimiento.");
    } finally {
      setIsSavingMaint(false);
    }
  };

  const filteredAssets = assets.filter((a) => {
    const q = searchQuery.toLowerCase();
    return (
      a.serialNumber.toLowerCase().includes(q) ||
      (a.productName && a.productName.toLowerCase().includes(q)) ||
      (a.model && a.model.toLowerCase().includes(q)) ||
      (a.assetTag && a.assetTag.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-slate-50/70 p-4 sm:p-6 lg:p-8 font-sans">
      {/* 🚀 Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Fase 4: Renta Biomédica & Mantenimiento
            </span>
            <span className="text-xs text-slate-400">{assets.length} Activos en Inventario</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">Gestión de Equipos Biomédicos & Renta</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Trazabilidad por número de serie, contratos de arrendamiento, depósitos en garantía y bitácora técnica de calibraciones.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMaintModalOpen(true)}
            className="px-4 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-2xl transition-all shadow-2xs flex items-center gap-2"
          >
            <Wrench className="w-3.5 h-3.5 text-slate-500" />
            Servicio Técnico
          </button>

          <button
            onClick={() => setContractModalOpen(true)}
            className="px-4 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-2xl transition-all shadow-2xs flex items-center gap-2"
          >
            <FileCheck className="w-3.5 h-3.5 text-slate-500" />
            Nuevo Contrato
          </button>

          <button
            onClick={() => setAssetModalOpen(true)}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl transition-all shadow-md shadow-indigo-600/20 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Registrar Equipo
          </button>
        </div>
      </div>

      {/* 🧭 Tabs */}
      <div className="flex border-b border-slate-200 gap-6 mb-6">
        <button
          onClick={() => setActiveTab("assets")}
          className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === "assets"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <Stethoscope className="w-4 h-4" />
          Parque de Equipos ({assets.length})
        </button>

        <button
          onClick={() => setActiveTab("contracts")}
          className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === "contracts"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <FileCheck className="w-4 h-4" />
          Contratos de Renta Activos ({contracts.length})
        </button>

        <button
          onClick={() => setActiveTab("maintenances")}
          className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === "maintenances"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <Wrench className="w-4 h-4" />
          Bitácora de Mantenimiento ({maintenances.length})
        </button>
      </div>

      {/* 📋 TAB 1: PARQUE DE EQUIPOS */}
      {activeTab === "assets" && (
        <div className="space-y-4 animate-in fade-in">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-3">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por número de serie, modelo, marca o tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs bg-transparent focus:outline-none text-slate-700"
            />
          </div>

          {isLoading ? (
            <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 flex flex-col items-center">
              <QhSpinner size="lg" className="text-indigo-600" />
              <p className="text-xs font-bold text-slate-500 mt-4 animate-pulse">Cargando parque de activos...</p>
            </div>
          ) : filteredAssets.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 text-slate-400">
              <Stethoscope className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-bold text-slate-700">No hay equipos biomédicos registrados</p>
              <p className="text-xs text-slate-400 mt-1">Haz clic en "Registrar Equipo" para ingresar números de serie al inventario.</p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-3.5 px-4">Serie & Equipo</th>
                      <th className="py-3.5 px-4">Marca & Modelo</th>
                      <th className="py-3.5 px-4">Almacén</th>
                      <th className="py-3.5 px-4">Calibración</th>
                      <th className="py-3.5 px-4">Tarifa Renta / Depósito</th>
                      <th className="py-3.5 px-4">Estatus</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredAssets.map((a) => (
                      <tr key={a.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-4 px-4">
                          <div className="space-y-0.5">
                            <span className="font-mono font-extrabold text-slate-900 text-xs">
                              S/N: {a.serialNumber}
                            </span>
                            <span className="text-[11px] text-slate-500 block">{a.productName}</span>
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <span className="font-bold text-slate-700 block">{a.brand || "N/A"}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{a.model || "Modelo Base"}</span>
                        </td>

                        <td className="py-4 px-4">
                          <span className="text-slate-700 flex items-center gap-1">
                            <Warehouse className="w-3.5 h-3.5 text-slate-400" />
                            {a.warehouseName}
                          </span>
                        </td>

                        <td className="py-4 px-4">
                          <div className="space-y-0.5 text-[11px]">
                            <span className="text-slate-700 block">
                              Última: {a.lastCalibrationDate || "Sin registro"}
                            </span>
                            <span className="text-indigo-600 font-bold block">
                              Próxima: {a.nextCalibrationDate || "Pendiente"}
                            </span>
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <div className="space-y-0.5 font-mono">
                            <span className="font-black text-slate-900 block text-xs">
                              ${a.monthlyRentalRate?.toLocaleString() || "0"}/mes
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              Depósito: ${a.depositRequired?.toLocaleString() || "0"}
                            </span>
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              a.status === "AVAILABLE"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : a.status === "RENTED"
                                ? "bg-blue-50 text-blue-700 border border-blue-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}
                          >
                            {a.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 📄 TAB 2: CONTRATOS DE RENTA */}
      {activeTab === "contracts" && (
        <div className="space-y-4 animate-in fade-in">
          {contracts.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 text-slate-400">
              <FileCheck className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-bold text-slate-700">No hay contratos de renta activos</p>
              <p className="text-xs text-slate-400 mt-1">Haz clic en "Nuevo Contrato" para asignar un equipo en renta.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contracts.map((c) => (
                <div key={c.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <span className="font-mono font-black text-xs text-indigo-700 block">{c.contractNumber}</span>
                      <h4 className="font-bold text-slate-900 text-sm mt-0.5">{c.renterOrganizationName}</h4>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        c.status === "ACTIVE"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : c.status === "COMPLETED"
                          ? "bg-slate-100 text-slate-700"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Equipo Asignado:</span>
                      <b className="text-slate-900 font-mono">S/N {c.assetSerialNumber} ({c.productName})</b>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Vigencia del Contrato:</span>
                      <b>{c.startDate} al {c.endDate}</b>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Tarifa Mensual:</span>
                      <b className="font-mono text-slate-900">${c.monthlyRate?.toLocaleString()} MXN</b>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Depósito en Garantía:</span>
                      <b className="font-mono text-indigo-700">${c.depositAmount?.toLocaleString()} MXN</b>
                    </div>
                  </div>

                  {c.status === "ACTIVE" && (
                    <div className="flex justify-end pt-3 border-t border-slate-100">
                      <button
                        onClick={() => {
                          setSelectedContractId(c.id);
                          setDepositModalOpen(true);
                        }}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs"
                      >
                        Finalizar Renta & Devolver Depósito
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 🔧 TAB 3: BITÁCORA DE MANTENIMIENTO */}
      {activeTab === "maintenances" && (
        <div className="space-y-4 animate-in fade-in">
          {maintenances.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 text-slate-400">
              <Wrench className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-bold text-slate-700">No hay registros de servicio técnico</p>
              <p className="text-xs text-slate-400 mt-1">Usa "Servicio Técnico" para registrar calibraciones o mantenimientos.</p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-3.5 px-4">Fecha & Tipo</th>
                      <th className="py-3.5 px-4">Equipo (Serie)</th>
                      <th className="py-3.5 px-4">Técnico / Proveedor</th>
                      <th className="py-3.5 px-4">Hallazgos & Dictamen</th>
                      <th className="py-3.5 px-4">Próxima Calibración</th>
                      <th className="py-3.5 px-4 text-right">Costo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {maintenances.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-4 px-4">
                          <div className="space-y-0.5">
                            <span className="font-bold text-slate-900 block">{m.maintenanceType}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{m.maintenanceDate}</span>
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <span className="font-mono font-bold text-indigo-700">S/N: {m.assetSerialNumber}</span>
                        </td>

                        <td className="py-4 px-4">
                          <span className="text-slate-700 block">{m.technicianName || m.performedBy || "Taller Central"}</span>
                        </td>

                        <td className="py-4 px-4 max-w-xs">
                          <p className="text-slate-600 text-[11px] truncate">{m.findings || m.actionsTaken || "Servicio rutinario"}</p>
                        </td>

                        <td className="py-4 px-4">
                          <span className="font-mono text-emerald-700 font-bold">{m.nextScheduledDate || "N/A"}</span>
                        </td>

                        <td className="py-4 px-4 text-right">
                          <span className="font-mono font-bold text-slate-900">
                            ${m.cost?.toLocaleString() || "0.00"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 🚀 MODAL 1: REGISTRAR EQUIPO BIOMÉDICO */}
      {assetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-indigo-600 tracking-wider">
                  Parque Biomédico
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">Registrar Equipo Individual</h3>
              </div>
              <button onClick={() => setAssetModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAsset} className="space-y-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Insumo / Catálogo Maestro *</label>
                <select
                  required
                  value={assetProdId}
                  onChange={(e) => setAssetProdId(e.target.value ? Number(e.target.value) : "")}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50"
                >
                  <option value="">Selecciona equipo del catálogo...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Almacén de Resguardo *</label>
                <select
                  required
                  value={assetWhId}
                  onChange={(e) => setAssetWhId(e.target.value ? Number(e.target.value) : "")}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50"
                >
                  <option value="">Selecciona almacén...</option>
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.city})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Número de Serie Físico *</label>
                  <input
                    type="text"
                    required
                    placeholder="SN-98214-X"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Etiqueta de Activo (Asset Tag)</label>
                  <input
                    type="text"
                    placeholder="TAG-BIO-012"
                    value={assetTag}
                    onChange={(e) => setAssetTag(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Marca</label>
                  <input
                    type="text"
                    placeholder="Ej. Philips / GE Health"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Modelo</label>
                  <input
                    type="text"
                    placeholder="Ej. IntelliVue MX40"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Renta Mensual (MXN)</label>
                  <input
                    type="number"
                    placeholder="4500.00"
                    value={monthlyRate}
                    onChange={(e) => setMonthlyRate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Depósito Requerido (MXN)</label>
                  <input
                    type="number"
                    placeholder="10000.00"
                    value={depositRequired}
                    onChange={(e) => setDepositRequired(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-bold"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAssetModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingAsset}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2 rounded-xl transition-all shadow-sm"
                >
                  {isSavingAsset ? "Guardando..." : "Registrar Activo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🚀 MODAL 2: CREAR CONTRATO DE RENTA */}
      {contractModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-indigo-600 tracking-wider">
                  Arrendamiento
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">Nuevo Contrato de Renta</h3>
              </div>
              <button onClick={() => setContractModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateContract} className="space-y-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Equipo Disponible *</label>
                <select
                  required
                  value={contractAssetId}
                  onChange={(e) => {
                    const id = Number(e.target.value);
                    setContractAssetId(id);
                    const a = assets.find((x) => x.id === id);
                    if (a) {
                      if (a.monthlyRentalRate) setContractMonthlyRate(a.monthlyRentalRate.toString());
                      if (a.depositRequired) setContractDeposit(a.depositRequired.toString());
                    }
                  }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50"
                >
                  <option value="">Selecciona equipo disponible...</option>
                  {assets
                    .filter((a) => a.status === "AVAILABLE")
                    .map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.productName} — S/N: {a.serialNumber} ({a.brand})
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Clínica / Arrendatario *</label>
                  <input
                    type="text"
                    required
                    placeholder="Hospital Ángeles S.A."
                    value={renterName}
                    onChange={(e) => setRenterName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">RFC</label>
                  <input
                    type="text"
                    placeholder="HAN900101XYZ"
                    value={renterRfc}
                    onChange={(e) => setRenterRfc(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Fecha de Inicio *</label>
                  <input
                    type="date"
                    required
                    value={contractStartDate}
                    onChange={(e) => setContractStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Fecha de Fin *</label>
                  <input
                    type="date"
                    required
                    value={contractEndDate}
                    onChange={(e) => setContractEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tarifa Mensual (MXN) *</label>
                  <input
                    type="number"
                    required
                    value={contractMonthlyRate}
                    onChange={(e) => setContractMonthlyRate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Depósito en Garantía (MXN) *</label>
                  <input
                    type="number"
                    required
                    value={contractDeposit}
                    onChange={(e) => setContractDeposit(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-bold"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setContractModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingContract}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2 rounded-xl transition-all shadow-sm"
                >
                  {isSavingContract ? "Generando..." : "Emitir Contrato"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🚀 MODAL 3: DEVOLUCIÓN DE DEPÓSITO */}
      {depositModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-indigo-600 tracking-wider">
                  Liquidación de Renta
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">Devolución de Garantía</h3>
              </div>
              <button onClick={() => setDepositModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReturnDeposit} className="space-y-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Monto de Deducción por Daño / Desgaste (MXN)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={deductionAmount}
                  onChange={(e) => setDeductionAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Motivo de Deducción (si aplica)</label>
                <input
                  type="text"
                  placeholder="Ej. Sustitución de cable de sensor dañado"
                  value={deductionReason}
                  onChange={(e) => setDeductionReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDepositModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2 rounded-xl transition-all shadow-sm"
                >
                  Liquidar Depósito & Liberar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🚀 MODAL 4: REGISTRAR MANTENIMIENTO */}
      {maintModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-indigo-600 tracking-wider">
                  Servicio Técnico
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">Registrar Mantenimiento / Calibración</h3>
              </div>
              <button onClick={() => setMaintModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMaintenance} className="space-y-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Equipo Biomédico *</label>
                <select
                  required
                  value={maintAssetId}
                  onChange={(e) => setMaintAssetId(e.target.value ? Number(e.target.value) : "")}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50"
                >
                  <option value="">Selecciona equipo...</option>
                  {assets.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.productName} — S/N: {a.serialNumber} ({a.brand})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tipo de Servicio *</label>
                  <select
                    value={maintType}
                    onChange={(e) => setMaintType(e.target.value as MaintenanceType)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-medium"
                  >
                    <option value="PREVENTIVE">Preventivo Programado</option>
                    <option value="CORRECTIVE">Correctivo / Reparación</option>
                    <option value="CALIBRATION">Calibración Metrológica</option>
                    <option value="CERTIFICATION">Certificación Sanitaria</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Fecha del Servicio *</label>
                  <input
                    type="date"
                    required
                    value={maintDate}
                    onChange={(e) => setMaintDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Técnico Responsable</label>
                  <input
                    type="text"
                    placeholder="Ing. Biomédico Juan Pérez"
                    value={technicianName}
                    onChange={(e) => setTechnicianName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Próxima Fecha Programada</label>
                  <input
                    type="date"
                    value={nextScheduledDate}
                    onChange={(e) => setNextScheduledDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Hallazgos & Acciones Realizadas</label>
                <textarea
                  rows={2}
                  placeholder="Se realizó limpieza de óptica, calibración de transductores y prueba de seguridad eléctrica NOM-001..."
                  value={findings}
                  onChange={(e) => setFindings(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setMaintModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingMaint}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2 rounded-xl transition-all shadow-sm"
                >
                  {isSavingMaint ? "Guardando..." : "Registrar Servicio"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
