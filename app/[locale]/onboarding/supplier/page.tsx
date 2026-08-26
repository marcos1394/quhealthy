"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/no-giant-component */

import React, { useEffect, useState } from "react";
import { useRouter } from "@/i18n/routing";
import { handleApiError } from "@/lib/handleApiError";
import {
  Building2,
  Package,
  Truck,
  ShieldCheck,
  Award,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Upload,
  FileText,
  Users,
  Plus,
  Sparkles,
  Layers,
  ThermometerSnowflake,
  Globe,
  Mail,
  Phone,
  BriefcaseMedical,
  ShoppingBag,
  Activity,
  X,
  ExternalLink,
  MapPin,
  FileCheck,
} from "lucide-react";
import { toast } from "react-toastify";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  { id: 1, label: "Identidad & Modelo", icon: Building2, subtitle: "Giro y Canales" },
  { id: 2, label: "Datos Fiscales", icon: FileText, subtitle: "RFC y COFEPRIS" },
  { id: 3, label: "Almacén Principal", icon: Truck, subtitle: "Sede y Despacho" },
  { id: 4, label: "Documentación", icon: ShieldCheck, subtitle: "Validación KYB" },
  { id: 5, label: "Equipo & RBAC", icon: Users, subtitle: "Colaboradores" },
];

const SUPPLIER_TYPES: {
  value: SupplierType;
  label: string;
  badge: string;
  icon: string;
  description: string;
}[] = [
  {
    value: "DISTRIBUTOR",
    label: "Distribuidor Mayorista de Insumos Médicos",
    badge: "Distribución",
    icon: "📦",
    description: "Comercialización de material de curación, consumibles clínicos y reactivos.",
  },
  {
    value: "MANUFACTURER",
    label: "Fabricante / Laboratorio Productor",
    badge: "Producción",
    icon: "🏭",
    description: "Elaboración directa de tecnología médica, dispositivos o productos de patente.",
  },
  {
    value: "PHARMACEUTICAL_WHOLESALER",
    label: "Farmacia / Droguería Mayorista",
    badge: "Farmacéutica",
    icon: "💊",
    description: "Distribución regulada de medicamentos de patente, genéricos y biológicos.",
  },
  {
    value: "BIOMEDICAL_EQUIPMENT",
    label: "Equipamiento Biomédico & Arrendamiento",
    badge: "Tecnología Biomédica",
    icon: "🔬",
    description: "Venta, mantenimiento y renta de equipos médicos para clínicas y quirófanos.",
  },
  {
    value: "ORTHOPEDICS_IMPLANTS",
    label: "Ortopedia, Prótesis & Material Quirúrgico",
    badge: "Alta Especialidad",
    icon: "🦾",
    description: "Implantes, prótesis, instrumental quirúrgico y ortesis especializadas.",
  },
  {
    value: "GENERAL_HEALTH_SUPPLIES",
    label: "Insumos Generales & Cuidado de la Salud",
    badge: "Consumibles",
    icon: "🩺",
    description: "Equipos de protección (EPP), higiene hospitalaria y consumibles generales.",
  },
];

const DOCUMENT_TYPES: {
  value: SupplierDocumentType;
  label: string;
  description: string;
}[] = [
  { value: "COFEPRIS_NOTICE", label: "Aviso de Funcionamiento COFEPRIS", description: "Obligatorio para comercialización sanitaria" },
  { value: "TAX_ID_PROOF", label: "Constancia de Situación Fiscal (SAT)", description: "RFC emitido en los últimos 3 meses" },
  { value: "SANITARY_LICENSE", label: "Licencia Sanitaria Oficial", description: "Requerida para psicotrópicos, estupefacientes o biológicos" },
  { value: "POWER_OF_ATTORNEY", label: "Poder Notarial del Representante", description: "Facultades para actos de administración" },
  { value: "ARTICLES_OF_INCORPORATION", label: "Acta Constitutiva de la Empresa", description: "Con boleta de inscripción en el Registro Público" },
  { value: "GOOD_STORAGE_PRACTICES_CERT", label: "Certificado de Buenas Prácticas de Almacenamiento", description: "Cumplimiento de la NOM-059/NOM-137" },
];

const MEMBER_ROLES: {
  value: SupplierRole;
  label: string;
  description: string;
}[] = [
  { value: "SUPPLIER_SALES", label: "Ventas & Cotizaciones B2B", description: "Gestión de solicitudes de cotización y pedidos" },
  { value: "SUPPLIER_INVENTORY", label: "Almacén & Inventarios", description: "Control de lotes, transferencias y recepciones" },
  { value: "SUPPLIER_FINANCE", label: "Finanzas & Facturación", description: "Facturación SAT y cobranza de órdenes" },
  { value: "SUPPLIER_LOGISTICS", label: "Logística & Cadena de Frío", description: "Despachos y telemetría de temperatura" },
  { value: "SUPPLIER_SUPPORT", label: "Atención & Soporte Clínico", description: "Servicio a médicos y seguimiento de garantías" },
  { value: "SUPPLIER_ADMIN", label: "Administrador General", description: "Acceso total a configuración y equipo" },
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!legalName.trim()) {
      toast.warning("Ingresa la razón social oficial de la empresa.");
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
      toast.success("Identidad comercial guardada correctamente.");
      setCurrentStep(2);
    } catch (err: any) {
      handleApiError(err, "Error al guardar la identidad comercial.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rfc.trim()) {
      toast.warning("Ingresa el RFC de la empresa.");
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
      toast.success("Datos fiscales y sanitarios registrados.");
      setCurrentStep(3);
    } catch (err: any) {
      handleApiError(err, "Error al guardar los datos fiscales.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveStep3 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!whName.trim() || !whCity.trim()) {
      toast.warning("Completa el nombre y la ciudad del almacén.");
      return;
    }

    try {
      setIsSaving(true);
      const payload: SaveSupplierWarehousePayload = {
        name: whName.trim(),
        code: whCode.trim() || undefined,
        addressStreet: whStreet.trim() || undefined,
        addressCity: whCity.trim(),
        addressState: whState.trim() || undefined,
        addressPostalCode: whPostalCode.trim() || undefined,
        isColdStorage: whColdStorage,
        minTemperature: whMinTemp ? parseFloat(whMinTemp) : undefined,
        maxTemperature: whMaxTemp ? parseFloat(whMaxTemp) : undefined,
        managerName: whManager.trim() || undefined,
        managerPhone: whManagerPhone.trim() || undefined,
      };

      await supplierService.saveWarehouse(payload);
      const profile = await supplierService.getProfile();
      setOrg(profile);
      toast.success("Almacén principal configurado.");
      setCurrentStep(4);
    } catch (err: any) {
      handleApiError(err, "Error al guardar el almacén.");
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
    } catch (err: any) {
      handleApiError(err, "Error al subir el documento.");
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
    } catch (err: any) {
      handleApiError(err, "Error al agregar al colaborador.");
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
      toast.success("¡Capacidad de Proveedor habilitada con éxito para tu cuenta!");
      setMigrationModalOpen(false);
      await loadOnboarding();
      router.push("/supplier/dashboard");
    } catch (err: any) {
      handleApiError(err, "No se pudo completar la vinculación.");
    } finally {
      setMigrating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <QhSpinner size="lg" className="text-emerald-600 dark:text-emerald-400" />
        <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 animate-pulse">
          Cargando Portal de Onboarding para Proveedores...
        </p>
      </div>
    );
  }

  const completionPercentage = Math.round((currentStep / 5) * 100);

  return (
    <div className="w-full py-6 sm:py-8 font-sans space-y-6 animate-in fade-in-0 duration-300">
      {/* ── ENCABEZADO Y HERO DEL ONBOARDING ──────────────────────────────── */}
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-2xs transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-2xs shrink-0">
              <Package className="w-6 h-6" strokeWidth={2.2} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Registro de Empresa & Catálogo
                </span>
                <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">
                  Vertical de Insumos & Biomédica
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight mt-0.5">
                Onboarding para Proveedores Médicos
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 max-w-2xl leading-relaxed">
                Habilita la distribución de consumibles clínicos, equipamiento, medicamentos y despacho con cadena de frío conforme a la normativa sanitaria.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMigrationModalOpen(true)}
            className="self-start sm:self-center px-4 py-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 shadow-2xs"
          >
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>¿Ya operas? Vincula tu empresa</span>
          </button>
        </div>

        {/* ── BARRA DE PROGRESO Y STEPPER ─────────────────────────────────── */}
        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between text-xs font-bold text-gray-500 dark:text-gray-400 mb-3">
            <span className="text-gray-900 dark:text-white font-extrabold">Paso {currentStep} de 5</span>
            <span className="text-emerald-600 dark:text-emerald-400">{completionPercentage}% Completado</span>
          </div>

          <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden mb-6">
            <div
              className="h-full bg-linear-to-r from-emerald-500 to-teal-500 transition-all duration-500 rounded-full"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
            {STEPS.map((step) => {
              const Icon = step.icon;
              const isDone = currentStep > step.id;
              const isCurrent = currentStep === step.id;

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setCurrentStep(step.id)}
                  className={`flex flex-col sm:flex-row items-center sm:items-start gap-2.5 p-3 rounded-2xl border transition-all text-left select-none cursor-pointer ${
                    isCurrent
                      ? "border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-2xs text-emerald-950 dark:text-emerald-200"
                      : isDone
                      ? "border-emerald-200/70 dark:border-emerald-900/40 bg-emerald-50/20 dark:bg-emerald-950/10 text-gray-800 dark:text-gray-200 hover:border-emerald-300"
                      : "border-gray-200/70 dark:border-gray-800/80 bg-gray-50/40 dark:bg-[#111] text-gray-400 dark:text-gray-500 hover:bg-gray-100/50 dark:hover:bg-[#161616]"
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                      isCurrent
                        ? "bg-emerald-600 text-white shadow-2xs"
                        : isDone
                        ? "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300"
                        : "bg-gray-200/70 dark:bg-gray-800 text-gray-500"
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-emerald-300" /> : <Icon className="w-3.5 h-3.5" />}
                  </div>
                  <div className="min-w-0 text-center sm:text-left">
                    <p className="text-[11px] font-bold truncate">{step.label}</p>
                    <p className="hidden md:block text-[10px] text-gray-400 dark:text-gray-500 truncate">{step.subtitle}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 📋 PASO 1: IDENTIDAD & MODELO DE VENTA */}
      {currentStep === 1 && (
        <form onSubmit={handleSaveStep1} className="space-y-6">
          {/* Bloque 1.1: Identidad Corporativa */}
          <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-6 transition-colors">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-gray-800">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">
                  1. Identidad Institucional & Razón Social
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Ingresa la denominación oficial de tu empresa y el giro sanitario correspondiente.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
                  Razón Social Oficial <span className="text-rose-500">*</span>
                </label>
                <Input
                  required
                  icon={<Building2 className="w-4 h-4" />}
                  placeholder="Ej. Distribuidora Médica del Norte S.A. de C.V."
                  value={legalName}
                  onChange={(e) => setLegalName(e.target.value)}
                  className="bg-white dark:bg-[#0a0a0a] h-12 rounded-2xl border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white shadow-2xs focus-visible:ring-emerald-500/20"
                />
                <p className="text-[11px] text-gray-400 dark:text-gray-500">
                  Nombre fiscal legal registrado en tu Cédula de Identificación Fiscal (SAT).
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
                  Nombre Comercial / Marca
                </label>
                <Input
                  icon={<Award className="w-4 h-4" />}
                  placeholder="Ej. MedSupply México"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="bg-white dark:bg-[#0a0a0a] h-12 rounded-2xl border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white shadow-2xs focus-visible:ring-emerald-500/20"
                />
                <p className="text-[11px] text-gray-400 dark:text-gray-500">
                  Nombre visible en el Marketplace para consultorios y clínicas.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
                  Tipo de Proveedor / Giro Sanitario <span className="text-rose-500">*</span>
                </label>
                <Select
                  value={supplierType}
                  onValueChange={(val: SupplierType) => setSupplierType(val)}
                >
                  <SelectTrigger className="w-full bg-white dark:bg-[#0a0a0a] h-12 rounded-2xl border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white shadow-2xs focus:ring-2 focus:ring-emerald-500/20">
                    <SelectValue placeholder="Selecciona el giro de la empresa" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-xl p-1">
                    {SUPPLIER_TYPES.map((type) => (
                      <SelectItem
                        key={type.value}
                        value={type.value}
                        className="py-2.5 px-3 rounded-xl cursor-pointer text-xs focus:bg-emerald-50 dark:focus:bg-emerald-950/30"
                      >
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {type.icon} {type.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
                  Descripción Comercial & Resumen de Catálogo
                </label>
                <Textarea
                  rows={3}
                  placeholder="Describe tus principales líneas de productos, marcas representadas, tiempos de despacho y cobertura geográfica..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-white dark:bg-[#0a0a0a] rounded-2xl border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white shadow-2xs focus-visible:ring-emerald-500/20 p-3.5"
                />
              </div>
            </div>
          </div>

          {/* Bloque 1.2: Capacidades y Canales Comerciales */}
          <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-6 transition-colors">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-gray-800">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">
                  2. Canales & Capacidades Operativas Habilitadas
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Activa los modelos comerciales y servicios logísticos que tu empresa operará dentro de QuHealthy.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Tarjeta 1: Ventas B2B */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => setAllowsB2b(!allowsB2b)}
                onKeyDown={(e) => e.key === "Enter" && setAllowsB2b(!allowsB2b)}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer select-none flex flex-col justify-between gap-3 ${
                  allowsB2b
                    ? "border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/20 shadow-2xs"
                    : "border-gray-200 dark:border-gray-800 bg-gray-50/30 dark:bg-[#111] hover:border-gray-300 dark:hover:border-gray-700"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 flex items-center justify-center shrink-0">
                      <BriefcaseMedical className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-gray-900 dark:text-white">Ventas B2B Clínicas</span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                          Mayorista
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">
                        Cotizaciones formales y órdenes de compra con precios por escala para médicos y clínicas.
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={allowsB2b}
                    onCheckedChange={setAllowsB2b}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>

              {/* Tarjeta 2: Ventas B2C */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => setAllowsB2c(!allowsB2c)}
                onKeyDown={(e) => e.key === "Enter" && setAllowsB2c(!allowsB2c)}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer select-none flex flex-col justify-between gap-3 ${
                  allowsB2c
                    ? "border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20 shadow-2xs"
                    : "border-gray-200 dark:border-gray-800 bg-gray-50/30 dark:bg-[#111] hover:border-gray-300 dark:hover:border-gray-700"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300 flex items-center justify-center shrink-0">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-gray-900 dark:text-white">Ventas B2C Pacientes</span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                          Marketplace
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">
                        Publicación de productos en la tienda con cobro en línea y entregas directas a domicilio.
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={allowsB2c}
                    onCheckedChange={setAllowsB2c}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>

              {/* Tarjeta 3: Renta de Equipos */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => setAllowsRental(!allowsRental)}
                onKeyDown={(e) => e.key === "Enter" && setAllowsRental(!allowsRental)}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer select-none flex flex-col justify-between gap-3 ${
                  allowsRental
                    ? "border-amber-500 bg-amber-50/20 dark:bg-amber-950/20 shadow-2xs"
                    : "border-gray-200 dark:border-gray-800 bg-gray-50/30 dark:bg-[#111] hover:border-gray-300 dark:hover:border-gray-700"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300 flex items-center justify-center shrink-0">
                      <Activity className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-gray-900 dark:text-white">Renta de Equipos</span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300">
                          Comodato & Renta
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">
                        Contratos de arrendamiento de tecnología médica con bitácora de mantenimiento.
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={allowsRental}
                    onCheckedChange={setAllowsRental}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>

              {/* Tarjeta 4: Cadena de Frío */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => setHasColdChainCapacity(!hasColdChainCapacity)}
                onKeyDown={(e) => e.key === "Enter" && setHasColdChainCapacity(!hasColdChainCapacity)}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer select-none flex flex-col justify-between gap-3 ${
                  hasColdChainCapacity
                    ? "border-sky-500 bg-sky-50/20 dark:bg-sky-950/20 shadow-2xs"
                    : "border-gray-200 dark:border-gray-800 bg-gray-50/30 dark:bg-[#111] hover:border-gray-300 dark:hover:border-gray-700"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-300 flex items-center justify-center shrink-0">
                      <ThermometerSnowflake className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-gray-900 dark:text-white">Cadena de Frío NOM-059</span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300">
                          Telemetría IoT
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">
                        Despacho térmico con monitoreo de temperatura en tiempo real y detección de excursiones.
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={hasColdChainCapacity}
                    onCheckedChange={setHasColdChainCapacity}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bloque 1.3: Contacto Comercial & Canales Digitales */}
          <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-6 transition-colors">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-gray-800">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">
                  3. Canales de Contacto & Enlaces Digitales
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Datos de contacto comercial para notificaciones de órdenes de compra y cotizaciones.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
                  Sitio Web Oficial
                </label>
                <Input
                  type="url"
                  icon={<Globe className="w-4 h-4" />}
                  placeholder="https://www.tuempresa.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="bg-white dark:bg-[#0a0a0a] h-12 rounded-2xl border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white shadow-2xs focus-visible:ring-emerald-500/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
                  Correo Electrónico de Ventas
                </label>
                <Input
                  type="email"
                  icon={<Mail className="w-4 h-4" />}
                  placeholder="ventas@tuempresa.com"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="bg-white dark:bg-[#0a0a0a] h-12 rounded-2xl border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white shadow-2xs focus-visible:ring-emerald-500/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
                  Teléfono Móvil / WhatsApp
                </label>
                <Input
                  type="tel"
                  icon={<Phone className="w-4 h-4" />}
                  placeholder="55 1234 5678"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="bg-white dark:bg-[#0a0a0a] h-12 rounded-2xl border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white shadow-2xs focus-visible:ring-emerald-500/20"
                />
              </div>
            </div>
          </div>

          {/* Botón de Acción Siguiente */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSaving || !legalName.trim()}
              className="h-12 px-8 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border-0"
            >
              {isSaving ? (
                <QhSpinner size="sm" className="text-white" />
              ) : (
                <>
                  <span>Guardar & Continuar a Datos Fiscales</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* 📋 PASO 2: DATOS FISCALES & REGULATORIOS */}
      {currentStep === 2 && (
        <form onSubmit={handleSaveStep2} className="space-y-6">
          <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-6 transition-colors">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-gray-800">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">
                  Datos Fiscales y Avisos Sanitarios COFEPRIS
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Ingresa el RFC de la persona moral o física y los folios de funcionamiento regulatorio.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
                  RFC de la Empresa <span className="text-rose-500">*</span>
                </label>
                <Input
                  required
                  maxLength={13}
                  placeholder="DMN180423AA1"
                  value={rfc}
                  onChange={(e) => setRfc(e.target.value.toUpperCase())}
                  className="bg-white dark:bg-[#0a0a0a] h-12 rounded-2xl border border-gray-200 dark:border-gray-800 text-xs font-semibold font-mono text-gray-900 dark:text-white shadow-2xs focus-visible:ring-emerald-500/20 uppercase"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
                  Folio de Aviso de Funcionamiento COFEPRIS
                </label>
                <Input
                  placeholder="Ej. 243300518X0123"
                  value={cofeprisNoticeNumber}
                  onChange={(e) => setCofeprisNoticeNumber(e.target.value)}
                  className="bg-white dark:bg-[#0a0a0a] h-12 rounded-2xl border border-gray-200 dark:border-gray-800 text-xs font-semibold font-mono text-gray-900 dark:text-white shadow-2xs focus-visible:ring-emerald-500/20"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
                  Licencia Sanitaria (Opcional - solo requerida para psicotrópicos, estupefacientes o hemoderivados)
                </label>
                <Input
                  placeholder="Ej. LIC-SAN-09-012"
                  value={sanitaryLicenseNumber}
                  onChange={(e) => setSanitaryLicenseNumber(e.target.value)}
                  className="bg-white dark:bg-[#0a0a0a] h-12 rounded-2xl border border-gray-200 dark:border-gray-800 text-xs font-semibold font-mono text-gray-900 dark:text-white shadow-2xs focus-visible:ring-emerald-500/20"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="h-12 px-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] hover:bg-gray-50 dark:hover:bg-[#151515] text-gray-700 dark:text-gray-300 font-bold text-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver a Identidad</span>
            </button>
            <button
              type="submit"
              disabled={isSaving || !rfc.trim()}
              className="h-12 px-8 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border-0"
            >
              {isSaving ? (
                <QhSpinner size="sm" className="text-white" />
              ) : (
                <>
                  <span>Guardar & Continuar a Almacén</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* 📋 PASO 3: ALMACÉN PRINCIPAL */}
      {currentStep === 3 && (
        <form onSubmit={handleSaveStep3} className="space-y-6">
          <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-6 transition-colors">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-gray-800">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">
                  Configuración del Almacén Principal & Despacho
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Registra la ubicación central desde donde se surten los lotes y pedidos. Podrás agregar más sedes en el dashboard.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
                  Nombre del Almacén <span className="text-rose-500">*</span>
                </label>
                <Input
                  required
                  placeholder="Ej. Almacén Central Vallejo"
                  value={whName}
                  onChange={(e) => setWhName(e.target.value)}
                  className="bg-white dark:bg-[#0a0a0a] h-12 rounded-2xl border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white shadow-2xs focus-visible:ring-emerald-500/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
                  Código de Identificación Interno
                </label>
                <Input
                  placeholder="ALM-01"
                  value={whCode}
                  onChange={(e) => setWhCode(e.target.value)}
                  className="bg-white dark:bg-[#0a0a0a] h-12 rounded-2xl border border-gray-200 dark:border-gray-800 text-xs font-semibold font-mono text-gray-900 dark:text-white shadow-2xs focus-visible:ring-emerald-500/20"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
                  Calle y Número
                </label>
                <Input
                  icon={<MapPin className="w-4 h-4" />}
                  placeholder="Ej. Av. Poniente 140 #835, Col. Industrial Vallejo"
                  value={whStreet}
                  onChange={(e) => setWhStreet(e.target.value)}
                  className="bg-white dark:bg-[#0a0a0a] h-12 rounded-2xl border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white shadow-2xs focus-visible:ring-emerald-500/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
                  Ciudad / Municipio <span className="text-rose-500">*</span>
                </label>
                <Input
                  required
                  placeholder="Ej. Ciudad de México / Guadalajara"
                  value={whCity}
                  onChange={(e) => setWhCity(e.target.value)}
                  className="bg-white dark:bg-[#0a0a0a] h-12 rounded-2xl border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white shadow-2xs focus-visible:ring-emerald-500/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
                  Estado
                </label>
                <Input
                  placeholder="Ej. CDMX / Jalisco / Nuevo León"
                  value={whState}
                  onChange={(e) => setWhState(e.target.value)}
                  className="bg-white dark:bg-[#0a0a0a] h-12 rounded-2xl border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white shadow-2xs focus-visible:ring-emerald-500/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
                  Código Postal
                </label>
                <Input
                  placeholder="02300"
                  value={whPostalCode}
                  onChange={(e) => setWhPostalCode(e.target.value)}
                  className="bg-white dark:bg-[#0a0a0a] h-12 rounded-2xl border border-gray-200 dark:border-gray-800 text-xs font-semibold font-mono text-gray-900 dark:text-white shadow-2xs focus-visible:ring-emerald-500/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
                  Responsable de Almacén / Farmacéutico
                </label>
                <Input
                  placeholder="Ej. Q.F.B. Mariana Morales"
                  value={whManager}
                  onChange={(e) => setWhManager(e.target.value)}
                  className="bg-white dark:bg-[#0a0a0a] h-12 rounded-2xl border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white shadow-2xs focus-visible:ring-emerald-500/20"
                />
              </div>
            </div>

            {/* Configuración de Cámaras de Cadena de Frío */}
            <div className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#111] space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-300 flex items-center justify-center shrink-0">
                    <ThermometerSnowflake className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-900 dark:text-white block">
                      Cámaras de Refrigeración / Congelación
                    </span>
                    <span className="text-[11px] text-gray-500 dark:text-gray-400">
                      Habilita control de rangos térmicos NOM-059 para este almacén
                    </span>
                  </div>
                </div>
                <Switch
                  checked={whColdStorage}
                  onCheckedChange={setWhColdStorage}
                />
              </div>

              {whColdStorage && (
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200 dark:border-gray-800">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Temperatura Mínima (°C)</label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="2.0"
                      value={whMinTemp}
                      onChange={(e) => setWhMinTemp(e.target.value)}
                      className="bg-white dark:bg-[#0a0a0a] h-11 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Temperatura Máxima (°C)</label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="8.0"
                      value={whMaxTemp}
                      onChange={(e) => setWhMaxTemp(e.target.value)}
                      className="bg-white dark:bg-[#0a0a0a] h-11 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="h-12 px-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] hover:bg-gray-50 dark:hover:bg-[#151515] text-gray-700 dark:text-gray-300 font-bold text-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver a Fiscal</span>
            </button>
            <button
              type="submit"
              disabled={isSaving || !whName.trim() || !whCity.trim()}
              className="h-12 px-8 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border-0"
            >
              {isSaving ? (
                <QhSpinner size="sm" className="text-white" />
              ) : (
                <>
                  <span>Guardar & Continuar a Documentos</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* 📋 PASO 4: CARGA DE DOCUMENTACIÓN */}
      {currentStep === 4 && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-6 transition-colors">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-gray-800">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">
                  Expediente Regulatorio y Validación KYB
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Carga tus documentos oficiales para la revisión del equipo de cumplimiento sanitario.
                </p>
              </div>
            </div>

            <form onSubmit={handleUploadDoc} className="space-y-4 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#111]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
                    Tipo de Documento <span className="text-rose-500">*</span>
                  </label>
                  <Select
                    value={docType}
                    onValueChange={(val: SupplierDocumentType) => setDocType(val)}
                  >
                    <SelectTrigger className="w-full bg-white dark:bg-[#0a0a0a] h-12 rounded-2xl border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white shadow-2xs focus:ring-2 focus:ring-emerald-500/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-xl p-1">
                      {DOCUMENT_TYPES.map((dt) => (
                        <SelectItem
                          key={dt.value}
                          value={dt.value}
                          className="py-2.5 px-3 rounded-xl cursor-pointer text-xs focus:bg-emerald-50 dark:focus:bg-emerald-950/30"
                        >
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {dt.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
                    Número de Folio / Referencia Oficial
                  </label>
                  <Input
                    placeholder="Ej. Folio Oficial SAT / COFEPRIS"
                    value={docNumber}
                    onChange={(e) => setDocNumber(e.target.value)}
                    className="bg-white dark:bg-[#0a0a0a] h-12 rounded-2xl border border-gray-200 dark:border-gray-800 text-xs font-semibold font-mono text-gray-900 dark:text-white shadow-2xs focus-visible:ring-emerald-500/20"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
                  Archivo Digital (PDF o Imagen) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="file"
                    required
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={(e) => setDocFile(e.target.files?.[0] || null)}
                    className="w-full px-3 py-2.5 border border-dashed border-gray-300 dark:border-gray-700 rounded-2xl bg-white dark:bg-[#0a0a0a] text-xs font-semibold text-gray-700 dark:text-gray-300 file:mr-4 file:py-1.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 dark:file:bg-emerald-950/50 dark:file:text-emerald-300 hover:file:bg-emerald-100 cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSaving || !docFile}
                  className="h-11 px-6 bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-white text-white dark:text-gray-900 font-bold text-xs rounded-2xl transition-all shadow-2xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" />
                  <span>{isSaving ? "Subiendo archivo..." : "Subir Documento"}</span>
                </button>
              </div>
            </form>

            {/* Lista de Documentos Cargados */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Documentos Registrados ({org?.documents?.length || 0})
                </h4>
              </div>

              {org?.documents && org.documents.length > 0 ? (
                <div className="divide-y divide-gray-100 dark:divide-gray-800 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden bg-white dark:bg-[#0a0a0a]">
                  {org.documents.map((doc) => (
                    <div key={doc.id} className="p-4 flex items-center justify-between text-xs gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                          <FileCheck className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <span className="font-bold text-gray-900 dark:text-white block truncate">
                            {DOCUMENT_TYPES.find((d) => d.value === doc.documentType)?.label || doc.documentType}
                          </span>
                          <span className="text-[11px] text-gray-400 font-mono">
                            {doc.documentNumber || doc.fileName || "Archivo adjunto"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-900">
                          {doc.status}
                        </span>

                        {doc.fileUrl && (
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            title="Ver documento"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 text-center text-xs text-gray-400">
                  Aún no has subido documentos. Carga al menos tu Aviso de Funcionamiento COFEPRIS.
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="h-12 px-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] hover:bg-gray-50 dark:hover:bg-[#151515] text-gray-700 dark:text-gray-300 font-bold text-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver a Almacén</span>
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(5)}
              className="h-12 px-8 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-2 cursor-pointer border-0"
            >
              <span>Continuar a Equipo & RBAC</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 📋 PASO 5: EQUIPO & RBAC */}
      {currentStep === 5 && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-6 transition-colors">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-gray-800">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">
                  Equipo Institucional & Permisos RBAC
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Invita a los ejecutivos de ventas, almacenistas y finanzas que operarán el portal.
                </p>
              </div>
            </div>

            <form onSubmit={handleInviteMember} className="space-y-4 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#111]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
                    Nombre Completo <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    required
                    placeholder="Ej. Lic. Carlos Méndez"
                    value={memberName}
                    onChange={(e) => setMemberName(e.target.value)}
                    className="bg-white dark:bg-[#0a0a0a] h-12 rounded-2xl border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white shadow-2xs focus-visible:ring-emerald-500/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
                    Correo Electrónico Corporativo <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    type="email"
                    required
                    placeholder="carlos@tuempresa.com"
                    value={memberEmail}
                    onChange={(e) => setMemberEmail(e.target.value)}
                    className="bg-white dark:bg-[#0a0a0a] h-12 rounded-2xl border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white shadow-2xs focus-visible:ring-emerald-500/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
                    Rol RBAC Asignado <span className="text-rose-500">*</span>
                  </label>
                  <Select
                    value={memberRole}
                    onValueChange={(val: SupplierRole) => setMemberRole(val)}
                  >
                    <SelectTrigger className="w-full bg-white dark:bg-[#0a0a0a] h-12 rounded-2xl border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white shadow-2xs focus:ring-2 focus:ring-emerald-500/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-xl p-1">
                      {MEMBER_ROLES.map((role) => (
                        <SelectItem
                          key={role.value}
                          value={role.value}
                          className="py-2.5 px-3 rounded-xl cursor-pointer text-xs focus:bg-emerald-50 dark:focus:bg-emerald-950/30"
                        >
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {role.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
                    Teléfono Móvil
                  </label>
                  <Input
                    type="tel"
                    placeholder="55 9876 5432"
                    value={memberPhone}
                    onChange={(e) => setMemberPhone(e.target.value)}
                    className="bg-white dark:bg-[#0a0a0a] h-12 rounded-2xl border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white shadow-2xs focus-visible:ring-emerald-500/20"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSaving || !memberName.trim() || !memberEmail.trim()}
                  className="h-11 px-6 bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-white text-white dark:text-gray-900 font-bold text-xs rounded-2xl transition-all shadow-2xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isSaving ? "Agregando..." : "Agregar Colaborador"}</span>
                </button>
              </div>
            </form>

            {/* Lista de Miembros */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Colaboradores Registrados ({org?.members?.length || 0})
              </h4>
              {org?.members && org.members.length > 0 ? (
                <div className="divide-y divide-gray-100 dark:divide-gray-800 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden bg-white dark:bg-[#0a0a0a]">
                  {org.members.map((m) => (
                    <div key={m.id} className="p-4 flex items-center justify-between text-xs gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                          {m.fullName.charAt(0)}
                        </div>
                        <div>
                          <span className="font-bold text-gray-900 dark:text-white block">{m.fullName}</span>
                          <span className="text-[11px] text-gray-400">{m.email}</span>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-300 dark:border-indigo-900">
                        {m.role}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 text-center text-xs text-gray-400">
                  Aún no has agregado colaboradores adicionales. Puedes finalizar ahora y agregarlos más tarde desde el dashboard.
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setCurrentStep(4)}
              className="h-12 px-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] hover:bg-gray-50 dark:hover:bg-[#151515] text-gray-700 dark:text-gray-300 font-bold text-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver a Documentación</span>
            </button>
            <button
              type="button"
              onClick={() => {
                toast.success("¡Onboarding completado exitosamente!");
                router.push("/supplier/dashboard");
              }}
              className="h-12 px-8 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-2 cursor-pointer border-0"
            >
              <span>Finalizar Onboarding & Ir al Panel</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 🚀 MODAL: MIGRACIÓN ADITIVA UNIVERSAL */}
      {migrationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-0 duration-200">
          <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-200 dark:border-gray-800 space-y-5 text-xs transition-colors">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block">
                    Vinculación Empresarial
                  </span>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    Habilitar Capacidad de Proveedor
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMigrationModalOpen(false)}
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Esta función asocia una <b>Organización Proveedora</b> a tu cuenta profesional existente de forma <b>100% aditiva y no destructiva</b>. Tus pacientes, agenda médica y consultas se mantendrán intactas.
            </p>

            <form onSubmit={handleAdditiveMigration} className="space-y-4 pt-1">
              <div className="space-y-1.5">
                <label className="font-bold text-gray-800 dark:text-gray-200 block">
                  Razón Social / Nombre Comercial <span className="text-rose-500">*</span>
                </label>
                <Input
                  required
                  placeholder="Ej. Distribuidora Médica del Norte"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="bg-white dark:bg-[#0a0a0a] h-12 rounded-2xl border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white shadow-2xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-gray-800 dark:text-gray-200 block">
                  Tipo de Proveedor / Giro
                </label>
                <Select
                  value={supplierType}
                  onValueChange={(val: SupplierType) => setSupplierType(val)}
                >
                  <SelectTrigger className="w-full bg-white dark:bg-[#0a0a0a] h-12 rounded-2xl border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white shadow-2xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] shadow-xl p-1">
                    {SUPPLIER_TYPES.map((type) => (
                      <SelectItem
                        key={type.value}
                        value={type.value}
                        className="py-2 px-3 rounded-xl cursor-pointer text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span>{type.icon}</span>
                          <span className="font-semibold text-gray-900 dark:text-white">{type.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setMigrationModalOpen(false)}
                  className="px-5 py-2.5 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#151515] rounded-2xl font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={migrating}
                  className="h-11 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-2 cursor-pointer border-0"
                >
                  {migrating ? <QhSpinner size="sm" className="text-white" /> : "Habilitar Capacidad Proveedor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
