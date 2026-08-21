"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/no-giant-component */

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  Package,
  Truck,
  ShieldCheck,
  Award,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  Upload,
  FileText,
  Users,
  Plus,
  Trash2,
  Sparkles,
  Layers,
  ThermometerSnowflake,
  AlertCircle,
  HelpCircle,
  X,
  ExternalLink,
} from "lucide-react";
import { toast } from "react-toastify";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { supplierService } from "@/services/supplier.service";
import {
  SupplierOrganization,
  SupplierOnboardingStatus,
  SupplierType,
  SupplierRole,
  SupplierDocumentType,
  SaveSupplierIdentityPayload,
  SaveSupplierLegalTaxPayload,
  SaveSupplierWarehousePayload,
  InviteSupplierMemberPayload,
  AdditiveMigrationPayload,
} from "@/types/supplier";

const STEPS = [
  { id: 1, label: "Identidad & Modelo", icon: Building2 },
  { id: 2, label: "Datos Fiscales", icon: FileText },
  { id: 3, label: "Almacén Principal", icon: Truck },
  { id: 4, label: "Documentación", icon: ShieldCheck },
  { id: 5, label: "Equipo & RBAC", icon: Users },
];

export default function SupplierOnboardingPage() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [org, setOrg] = useState<SupplierOrganization | null>(null);
  const [status, setStatus] = useState<SupplierOnboardingStatus | null>(null);

  // Modal de Migración Aditiva
  const [migrationModalOpen, setMigrationModalOpen] = useState(false);
  const [migrating, setMigrating] = useState(false);

  // Step 1: Identidad Form
  const [legalName, setLegalName] = useState("");
  const [brandName, setBrandName] = useState("");
  const [supplierType, setSupplierType] = useState<SupplierType>("DISTRIBUTOR");
  const [website, setWebsite] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [description, setDescription] = useState("");
  const [allowsB2b, setAllowsB2b] = useState(true);
  const [allowsB2c, setAllowsB2c] = useState(true);
  const [allowsRental, setAllowsRental] = useState(false);
  const [hasColdChainCapacity, setHasColdChainCapacity] = useState(false);

  // Step 2: Fiscal Form
  const [rfc, setRfc] = useState("");
  const [cofeprisNoticeNumber, setCofeprisNoticeNumber] = useState("");
  const [sanitaryLicenseNumber, setSanitaryLicenseNumber] = useState("");

  // Step 3: Almacén Form
  const [whName, setWhName] = useState("");
  const [whCode, setWhCode] = useState("ALM-01");
  const [whStreet, setWhStreet] = useState("");
  const [whCity, setWhCity] = useState("");
  const [whState, setWhState] = useState("");
  const [whPostalCode, setWhPostalCode] = useState("");
  const [whColdStorage, setWhColdStorage] = useState(false);
  const [whMinTemp, setWhMinTemp] = useState<string>("");
  const [whMaxTemp, setWhMaxTemp] = useState<string>("");
  const [whManager, setWhManager] = useState("");
  const [whManagerPhone, setWhManagerPhone] = useState("");

  // Step 4: Docs Form
  const [docType, setDocType] = useState<SupplierDocumentType>("COFEPRIS_NOTICE");
  const [docNumber, setDocNumber] = useState("");
  const [docFile, setDocFile] = useState<File | null>(null);

  // Step 5: Team Form
  const [memberName, setMemberName] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [memberPhone, setMemberPhone] = useState("");
  const [memberRole, setMemberRole] = useState<SupplierRole>("SUPPLIER_SALES");

  useEffect(() => {
    loadOnboarding();
  }, []);

  const loadOnboarding = async () => {
    try {
      setIsLoading(true);
      const st = await supplierService.getOnboardingStatus();
      setStatus(st);
      if (st.isRegistered) {
        const profile = await supplierService.getProfile();
        setOrg(profile);
        setCurrentStep(st.currentStep || 1);

        // Prellenar formularios
        setLegalName(profile.legalName || "");
        setBrandName(profile.brandName || "");
        setSupplierType(profile.supplierType || "DISTRIBUTOR");
        setWebsite(profile.website || "");
        setContactEmail(profile.contactEmail || "");
        setContactPhone(profile.contactPhone || "");
        setDescription(profile.description || "");
        setAllowsB2b(profile.allowsB2b ?? true);
        setAllowsB2c(profile.allowsB2c ?? true);
        setAllowsRental(profile.allowsRental ?? false);
        setHasColdChainCapacity(profile.hasColdChainCapacity ?? false);
        setRfc(profile.rfc || "");
      }
    } catch (err: any) {
      if (err?.response?.status === 401) {
        router.push("/supplier/register");
      }
      // Usuario nuevo, inicia en paso 1
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!legalName.trim()) {
      toast.warning("Ingresa la razón social o nombre comercial.");
      return;
    }

    try {
      setIsSaving(true);
      const payload: SaveSupplierIdentityPayload = {
        legalName: legalName.trim(),
        brandName: brandName.trim() || undefined,
        supplierType,
        website: website.trim() || undefined,
        contactEmail: contactEmail.trim() || undefined,
        contactPhone: contactPhone.trim() || undefined,
        description: description.trim() || undefined,
        allowsB2b,
        allowsB2c,
        allowsRental,
        hasColdChainCapacity,
      };

      const updated = await supplierService.saveIdentity(payload);
      setOrg(updated);
      toast.success("Identidad comercial guardada.");
      setCurrentStep(2);
    } catch {
      toast.error("Error al guardar la identidad comercial.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rfc.trim()) {
      toast.warning("Ingresa un RFC válido a 12 o 13 posiciones.");
      return;
    }

    try {
      setIsSaving(true);
      const payload: SaveSupplierLegalTaxPayload = {
        rfc: rfc.trim().toUpperCase(),
        cofeprisNoticeNumber: cofeprisNoticeNumber.trim() || undefined,
        sanitaryLicenseNumber: sanitaryLicenseNumber.trim() || undefined,
      };

      const updated = await supplierService.saveLegalTax(payload);
      setOrg(updated);
      toast.success("Datos fiscales registrados.");
      setCurrentStep(3);
    } catch {
      toast.error("Error al registrar los datos fiscales.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveStep3 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!whName.trim() || !whCity.trim()) {
      toast.warning("Ingresa al menos el nombre y ciudad del almacén.");
      return;
    }

    try {
      setIsSaving(true);
      const payload: SaveSupplierWarehousePayload = {
        name: whName.trim(),
        code: whCode.trim() || "ALM-01",
        streetAddress: whStreet.trim() || undefined,
        city: whCity.trim(),
        state: whState.trim() || undefined,
        postalCode: whPostalCode.trim() || undefined,
        isMain: true,
        allowsColdStorage: whColdStorage,
        minTempSupported: whMinTemp ? parseFloat(whMinTemp) : undefined,
        maxTempSupported: whMaxTemp ? parseFloat(whMaxTemp) : undefined,
        managerName: whManager.trim() || undefined,
        managerPhone: whManagerPhone.trim() || undefined,
      };

      await supplierService.createWarehouse(payload);
      const profile = await supplierService.getProfile();
      setOrg(profile);
      toast.success("Almacén principal registrado.");
      setCurrentStep(4);
    } catch {
      toast.error("Error al guardar el almacén.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUploadDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docFile) {
      toast.warning("Selecciona un archivo PDF o imagen.");
      return;
    }

    try {
      setIsSaving(true);
      await supplierService.uploadDocument(docType, docFile, docNumber.trim() || undefined);
      const profile = await supplierService.getProfile();
      setOrg(profile);
      setDocFile(null);
      setDocNumber("");
      toast.success("Documento cargado correctamente.");
    } catch {
      toast.error("Error al subir el documento.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberName.trim() || !memberEmail.trim()) {
      toast.warning("Ingresa el nombre y correo del colaborador.");
      return;
    }

    try {
      setIsSaving(true);
      const payload: InviteSupplierMemberPayload = {
        fullName: memberName.trim(),
        email: memberEmail.trim(),
        phone: memberPhone.trim() || undefined,
        role: memberRole,
      };

      await supplierService.inviteMember(payload);
      const profile = await supplierService.getProfile();
      setOrg(profile);
      setMemberName("");
      setMemberEmail("");
      setMemberPhone("");
      toast.success("Colaborador agregado al equipo.");
    } catch {
      toast.error("Error al agregar al colaborador.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAdditiveMigration = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setMigrating(true);
      const payload: AdditiveMigrationPayload = {
        legalName: legalName.trim() || "Distribuidora Médica",
        brandName: brandName.trim() || undefined,
        rfc: rfc.trim() || undefined,
        supplierType,
        defaultWarehouseName: "Almacén Principal",
        defaultWarehouseCity: "Ciudad Central",
        defaultWarehouseState: "México",
      };

      await supplierService.enableSupplierCapability(payload);
      toast.success("¡Capacidad SUPPLIER habilitada con éxito para tu cuenta!");
      setMigrationModalOpen(false);
      await loadOnboarding();
      router.push("/supplier/dashboard");
    } catch {
      toast.error("No se pudo completar la vinculación.");
    } finally {
      setMigrating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <QhSpinner size="lg" className="text-indigo-600" />
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mt-4 animate-pulse">
          Cargando Portal de Onboarding para Proveedores...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20 font-sans">
      {/* 🚀 Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-md shadow-indigo-600/20">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-slate-900 leading-none">
                Onboarding para Proveedores & Distribuidores
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Vertical de Insumos Médicos, Dispositivos y Equipamiento Biomédico
              </p>
            </div>
          </div>

          <button
            onClick={() => setMigrationModalOpen(true)}
            className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3.5 py-2 rounded-xl hover:bg-indigo-100 transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            ¿Ya operas en QuHealthy? Vincula tu empresa
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-8">
        {/* 🧭 Stepper Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs mb-8">
          {STEPS.map((step) => {
            const Icon = step.icon;
            const isDone = currentStep > step.id;
            const isCurrent = currentStep === step.id;
            return (
              <button
                key={step.id}
                onClick={() => setCurrentStep(step.id)}
                className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                  isCurrent
                    ? "bg-indigo-600 text-white shadow-sm"
                    : isDone
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs shrink-0 ${
                    isCurrent
                      ? "bg-white/20 text-white"
                      : isDone
                      ? "bg-emerald-200/60 text-emerald-800"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {isDone ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> : <Icon className="w-3.5 h-3.5" />}
                </div>
                <span className="truncate">{step.label}</span>
              </button>
            );
          })}
        </div>

        {/* 📋 PASO 1: IDENTIDAD & MODELO DE VENTA */}
        {currentStep === 1 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 animate-in fade-in">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-[10px] font-extrabold uppercase text-indigo-600 tracking-wider">
                Paso 1 de 5
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-1">Identidad Comercial y Líneas de Insumos</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Define el perfil de tu empresa, tipo de catálogo y canales de comercialización habilitados.
              </p>
            </div>

            <form onSubmit={handleSaveStep1} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Razón Social o Nombre Legal *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Distribuidora Médica del Norte S.A. de C.V."
                    value={legalName}
                    onChange={(e) => setLegalName(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nombre Comercial / Marca</label>
                  <input
                    type="text"
                    placeholder="Ej. MedSupply México"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tipo de Proveedor / Giro *</label>
                  <select
                    value={supplierType}
                    onChange={(e) => setSupplierType(e.target.value as SupplierType)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white font-medium"
                  >
                    <option value="DISTRIBUTOR">Distribuidor de Insumos Médicos</option>
                    <option value="MANUFACTURER">Fabricante Nacional / Internacional</option>
                    <option value="PHARMACEUTICAL_WHOLESALER">Farmacia / Droguería Mayorista</option>
                    <option value="BIOMEDICAL_EQUIPMENT">Equipamiento Biomédico & Renta</option>
                    <option value="ORTHOPEDICS_IMPLANTS">Ortopedia, Prótesis & Quirúrgico</option>
                    <option value="GENERAL_HEALTH_SUPPLIES">Consumibles y Cuidado de la Salud</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Sitio Web Oficial</label>
                  <input
                    type="url"
                    placeholder="https://www.tuempresa.com"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Correo de Contacto / Ventas</label>
                  <input
                    type="email"
                    placeholder="ventas@tuempresa.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Teléfono Móvil / WhatsApp</label>
                  <input
                    type="tel"
                    placeholder="Ej. 55 1234 5678"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              {/* Capacidades Comerciales */}
              <div className="pt-2">
                <label className="font-bold text-slate-700 block mb-2">Canales & Capacidades Habilitadas</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <label className="flex items-center gap-2 p-3 border border-slate-200 rounded-xl bg-slate-50 cursor-pointer hover:bg-slate-100">
                    <input
                      type="checkbox"
                      checked={allowsB2b}
                      onChange={(e) => setAllowsB2b(e.target.checked)}
                      className="rounded text-indigo-600"
                    />
                    <span className="font-bold text-slate-800">Ventas B2B (Médicos/Clínicas)</span>
                  </label>

                  <label className="flex items-center gap-2 p-3 border border-slate-200 rounded-xl bg-slate-50 cursor-pointer hover:bg-slate-100">
                    <input
                      type="checkbox"
                      checked={allowsB2c}
                      onChange={(e) => setAllowsB2c(e.target.checked)}
                      className="rounded text-indigo-600"
                    />
                    <span className="font-bold text-slate-800">Ventas B2C (Pacientes)</span>
                  </label>

                  <label className="flex items-center gap-2 p-3 border border-slate-200 rounded-xl bg-slate-50 cursor-pointer hover:bg-slate-100">
                    <input
                      type="checkbox"
                      checked={allowsRental}
                      onChange={(e) => setAllowsRental(e.target.checked)}
                      className="rounded text-indigo-600"
                    />
                    <span className="font-bold text-slate-800">Renta de Equipos</span>
                  </label>

                  <label className="flex items-center gap-2 p-3 border border-slate-200 rounded-xl bg-slate-50 cursor-pointer hover:bg-slate-100">
                    <input
                      type="checkbox"
                      checked={hasColdChainCapacity}
                      onChange={(e) => setHasColdChainCapacity(e.target.checked)}
                      className="rounded text-indigo-600"
                    />
                    <span className="font-bold text-slate-800">Cadena de Frío</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2"
                >
                  {isSaving ? "Guardando..." : "Guardar & Continuar"}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 📋 PASO 2: DATOS FISCALES & REGULATORIOS */}
        {currentStep === 2 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 animate-in fade-in">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-[10px] font-extrabold uppercase text-indigo-600 tracking-wider">
                Paso 2 de 5
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-1">Datos Fiscales y Avisos COFEPRIS</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Ingresa el RFC de la empresa y folios sanitarios de funcionamiento.
              </p>
            </div>

            <form onSubmit={handleSaveStep2} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">RFC de la Empresa *</label>
                  <input
                    type="text"
                    required
                    maxLength={13}
                    placeholder="ABC120315XX0"
                    value={rfc}
                    onChange={(e) => setRfc(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Folio de Aviso de Funcionamiento COFEPRIS</label>
                  <input
                    type="text"
                    placeholder="Ej. 243300518X0123"
                    value={cofeprisNoticeNumber}
                    onChange={(e) => setCofeprisNoticeNumber(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Licencia Sanitaria (Opcional - solo si manejas medicamentos controlados o biológicos)
                </label>
                <input
                  type="text"
                  placeholder="Ej. LIC-SAN-09-012"
                  value={sanitaryLicenseNumber}
                  onChange={(e) => setSanitaryLicenseNumber(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white font-mono"
                />
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50"
                >
                  Volver
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2"
                >
                  {isSaving ? "Guardando..." : "Guardar & Continuar"}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 📋 PASO 3: ALMACÉN PRINCIPAL */}
        {currentStep === 3 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 animate-in fade-in">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-[10px] font-extrabold uppercase text-indigo-600 tracking-wider">
                Paso 3 de 5
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-1">Configuración del Almacén Principal</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Registra la ubicación de despacho inicial. Podrás agregar más almacenes en el dashboard.
              </p>
            </div>

            <form onSubmit={handleSaveStep3} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nombre del Almacén *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Almacén Central Vallejo"
                    value={whName}
                    onChange={(e) => setWhName(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Código de Almacén</label>
                  <input
                    type="text"
                    placeholder="ALM-CDMX-01"
                    value={whCode}
                    onChange={(e) => setWhCode(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Ciudad / Municipio *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Azcapotzalco"
                    value={whCity}
                    onChange={(e) => setWhCity(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Estado</label>
                  <input
                    type="text"
                    placeholder="Ej. Ciudad de México"
                    value={whState}
                    onChange={(e) => setWhState(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Código Postal</label>
                  <input
                    type="text"
                    placeholder="02300"
                    value={whPostalCode}
                    onChange={(e) => setWhPostalCode(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white font-mono"
                  />
                </div>
              </div>

              <div className="p-4 border border-slate-200 rounded-2xl bg-slate-50 space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={whColdStorage}
                    onChange={(e) => setWhColdStorage(e.target.checked)}
                    className="rounded text-indigo-600"
                  />
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <ThermometerSnowflake className="w-4 h-4 text-blue-600" />
                    Este almacén cuenta con cámaras de refrigeración / cadena de frío
                  </span>
                </label>

                {whColdStorage && (
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="font-bold text-slate-600 block mb-1">Temp. Mínima (°C)</label>
                      <input
                        type="number"
                        placeholder="2.0"
                        value={whMinTemp}
                        onChange={(e) => setWhMinTemp(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-600 block mb-1">Temp. Máxima (°C)</label>
                      <input
                        type="number"
                        placeholder="8.0"
                        value={whMaxTemp}
                        onChange={(e) => setWhMaxTemp(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50"
                >
                  Volver
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2"
                >
                  {isSaving ? "Guardando..." : "Guardar & Continuar"}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 📋 PASO 4: CARGA DE DOCUMENTACIÓN */}
        {currentStep === 4 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 animate-in fade-in">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-[10px] font-extrabold uppercase text-indigo-600 tracking-wider">
                Paso 4 de 5
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-1">Carga Documental y Validación KYB</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Sube tu Aviso de Funcionamiento COFEPRIS, Constancia de Situación Fiscal y Poder Notarial.
              </p>
            </div>

            <form onSubmit={handleUploadDoc} className="space-y-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tipo de Documento *</label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value as SupplierDocumentType)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-medium"
                  >
                    <option value="COFEPRIS_NOTICE">Aviso de Funcionamiento COFEPRIS</option>
                    <option value="TAX_ID_PROOF">Constancia de Situación Fiscal (RFC)</option>
                    <option value="SANITARY_LICENSE">Licencia Sanitaria</option>
                    <option value="POWER_OF_ATTORNEY">Poder Notarial del Representante</option>
                    <option value="ARTICLES_OF_INCORPORATION">Acta Constitutiva</option>
                    <option value="GOOD_STORAGE_PRACTICES_CERT">Certificado Buenas Prácticas</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Número de Folio / Referencia</label>
                  <input
                    type="text"
                    placeholder="Ej. Folio Oficial SAT / COFEPRIS"
                    value={docNumber}
                    onChange={(e) => setDocNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Archivo (PDF o Imagen) *</label>
                <input
                  type="file"
                  required
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={(e) => setDocFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  {isSaving ? "Subiendo..." : "Subir Documento"}
                </button>
              </div>
            </form>

            {/* Lista de Documentos Cargados */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Documentos Registrados</h4>
              {org?.documents && org.documents.length > 0 ? (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
                  {org.documents.map((doc) => (
                    <div key={doc.id} className="p-3.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-4 h-4 text-indigo-600" />
                        <div>
                          <span className="font-bold text-slate-800 block">{doc.documentType}</span>
                          <span className="text-[11px] text-slate-400 font-mono">{doc.documentNumber || doc.fileName}</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        {doc.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No has subido documentos aún.</p>
              )}
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50"
              >
                Volver
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(5)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2"
              >
                Continuar a Equipo
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* 📋 PASO 5: EQUIPO & RBAC */}
        {currentStep === 5 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 animate-in fade-in">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-[10px] font-extrabold uppercase text-indigo-600 tracking-wider">
                Paso 5 de 5
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-1">Equipo & Roles RBAC</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Invita a los ejecutivos de ventas, personal de almacén y finanzas para operar la plataforma.
              </p>
            </div>

            <form onSubmit={handleInviteMember} className="space-y-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Lic. Carlos Méndez"
                    value={memberName}
                    onChange={(e) => setMemberName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Correo Electrónico *</label>
                  <input
                    type="email"
                    required
                    placeholder="carlos@tuempresa.com"
                    value={memberEmail}
                    onChange={(e) => setMemberEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Rol RBAC Asignado *</label>
                  <select
                    value={memberRole}
                    onChange={(e) => setMemberRole(e.target.value as SupplierRole)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-medium"
                  >
                    <option value="SUPPLIER_SALES">Ventas & Cotizaciones (SUPPLIER_SALES)</option>
                    <option value="SUPPLIER_INVENTORY">Almacén & Inventarios (SUPPLIER_INVENTORY)</option>
                    <option value="SUPPLIER_FINANCE">Finanzas & Facturación (SUPPLIER_FINANCE)</option>
                    <option value="SUPPLIER_LOGISTICS">Logística & Envíos (SUPPLIER_LOGISTICS)</option>
                    <option value="SUPPLIER_SUPPORT">Atención & Soporte (SUPPLIER_SUPPORT)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Teléfono</label>
                  <input
                    type="tel"
                    placeholder="55 9876 5432"
                    value={memberPhone}
                    onChange={(e) => setMemberPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {isSaving ? "Agregando..." : "Agregar Colaborador"}
                </button>
              </div>
            </form>

            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50"
              >
                Volver
              </button>
              <button
                type="button"
                onClick={() => {
                  toast.success("¡Onboarding inicial completado con éxito!");
                  router.push("/supplier/dashboard");
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2"
              >
                Finalizar Onboarding
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 🚀 MODAL: MIGRACIÓN ADITIVA RÁPIDA */}
      {migrationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-indigo-600 tracking-wider">
                  Migración Aditiva Universal
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">Vincular Organización Proveedora</h3>
              </div>
              <button onClick={() => setMigrationModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-slate-600 leading-relaxed">
              Esta función asocia una <b>SupplierOrganization</b> a tu cuenta actual de forma <b>100% no destructiva</b>. Tus productos, órdenes y presencia en el marketplace se preservarán intactos.
            </p>

            <form onSubmit={handleAdditiveMigration} className="space-y-3 pt-2">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nombre Comercial de la Empresa *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Distribuidora Médica"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Tipo de Proveedor</label>
                <select
                  value={supplierType}
                  onChange={(e) => setSupplierType(e.target.value as SupplierType)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 font-medium"
                >
                  <option value="DISTRIBUTOR">Distribuidor de Insumos Médicos</option>
                  <option value="MANUFACTURER">Fabricante</option>
                  <option value="PHARMACEUTICAL_WHOLESALER">Farmacia / Droguería Mayorista</option>
                  <option value="BIOMEDICAL_EQUIPMENT">Equipamiento Biomédico</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setMigrationModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={migrating}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2 rounded-xl transition-all shadow-sm"
                >
                  {migrating ? "Vinculando..." : "Habilitar Capacidad Proveedor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
