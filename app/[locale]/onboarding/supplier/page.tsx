"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/no-giant-component */

import React, { useEffect, useState, useRef } from "react";
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
  Search,
  Camera,
  Check,
  Shield,
} from "lucide-react";
import { toast } from "react-toastify";
import Confetti from "react-confetti";
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
import { UniversalCameraModal } from "@/components/ui/UniversalCameraModal";
import { googleService } from "@/services/google.service";
import { useSessionStore } from "@/stores/SessionStore";
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
  { id: 4, label: "Documentación KYB", icon: ShieldCheck, subtitle: "Expediente Oficial" },
  { id: 5, label: "Equipo & Activación", icon: Users, subtitle: "Resumen y Panel" },
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
  required: boolean;
}[] = [
  { value: "COFEPRIS_NOTICE", label: "Aviso de Funcionamiento COFEPRIS", description: "Obligatorio para comercialización sanitaria (NOM-137-SSA1)", required: true },
  { value: "TAX_ID_PROOF", label: "Constancia de Situación Fiscal (SAT)", description: "RFC emitido en los últimos 3 meses con actividad médica", required: true },
  { value: "POWER_OF_ATTORNEY", label: "Poder Notarial del Representante", description: "Facultades para actos de administración (Personas Morales)", required: false },
  { value: "ARTICLES_OF_INCORPORATION", label: "Acta Constitutiva de la Empresa", description: "Con boleta de inscripción en el Registro Público", required: false },
  { value: "SANITARY_LICENSE", label: "Licencia Sanitaria Oficial", description: "Requerida si manejas psicotrópicos, estupefacientes o biológicos", required: false },
  { value: "GOOD_STORAGE_PRACTICES_CERT", label: "Certificado de Buenas Prácticas de Almacenamiento", description: "Cumplimiento de la NOM-059 para insumos de la salud", required: false },
];

const MEMBER_ROLES: {
  value: SupplierRole;
  label: string;
  description: string;
}[] = [
  { value: "SUPPLIER_SALES", label: "Ventas & Cotizaciones B2B", description: "Gestión de solicitudes de cotización y pedidos" },
  { value: "SUPPLIER_INVENTORY", label: "Almacén & Control de Inventarios", description: "Control de lotes, transferencias y recepciones" },
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
  const [showConfetti, setShowConfetti] = useState(false);

  // Modal de Migración Aditiva
  const [migrationModalOpen, setMigrationModalOpen] = useState(false);
  const [migrating, setMigrating] = useState(false);

  // Cámara KYB Modal
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [activeCameraDocType, setActiveCameraDocType] = useState<SupplierDocumentType>("COFEPRIS_NOTICE");

  // Google Places Autocomplete (Paso 1 y Almacén)
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearchingPlaces, setIsSearchingPlaces] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedPlaceInfo, setSelectedPlaceInfo] = useState<{
    name: string;
    address: string;
    rating?: number;
    userRatingsTotal?: number;
  } | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 5: Team Form
  const [memberName, setMemberName] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [memberPhone, setMemberPhone] = useState("");
  const [memberRole, setMemberRole] = useState<SupplierRole>("SUPPLIER_SALES");

  useEffect(() => {
    loadOnboarding();
  }, []);

  // Autocomplete con Google Places
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingPlaces(true);
      try {
        const response = await googleService.autocomplete(searchQuery.trim());
        const data = typeof response === "string" ? JSON.parse(response) : response;
        if (Array.isArray(data)) {
          setSuggestions(data);
        } else if (data && Array.isArray(data.predictions)) {
          setSuggestions(data.predictions);
        } else {
          setSuggestions([]);
        }
        setShowSuggestions(true);
      } catch (error) {
        console.error("Error al autocompletar con Google Places:", error);
        setSuggestions([]);
      } finally {
        setIsSearchingPlaces(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside para cerrar sugerencias
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const parseAddressComponents = (components: any[], formattedAddress?: string) => {
    let streetNumber = "";
    let route = "";
    let neighborhood = "";
    let city = "";
    let state = "";
    let postalCode = "";

    if (Array.isArray(components) && components.length > 0) {
      for (const c of components) {
        const types: string[] = c.types || [];
        if (types.includes("street_number")) {
          streetNumber = c.long_name || "";
        } else if (types.includes("route")) {
          route = c.long_name || "";
        } else if (
          types.includes("sublocality_level_1") || 
          types.includes("sublocality") || 
          types.includes("neighborhood")
        ) {
          if (!neighborhood) neighborhood = c.long_name || "";
        } else if (types.includes("locality")) {
          city = c.long_name || "";
        } else if (types.includes("administrative_area_level_2") && !city) {
          city = c.long_name || "";
        } else if (types.includes("administrative_area_level_1")) {
          state = c.long_name || "";
        } else if (types.includes("postal_code")) {
          postalCode = c.long_name || "";
        }
      }
    }

    if (formattedAddress && (!route || !city)) {
      const parts = formattedAddress.split(",").map((p) => p.trim());
      if (!route && parts.length > 0) route = parts[0];
      if (!neighborhood && parts.length > 1) neighborhood = parts[1];
      if (!city && parts.length > 2) city = parts[2];
      if (!state && parts.length > 3) state = parts[3];
    }

    return { streetNumber, route, neighborhood, city, state, postalCode };
  };

  const handleSelectPlace = async (placeId?: string, descriptionText?: string) => {
    if (!placeId) {
      if (descriptionText) {
        setBrandName(descriptionText);
        if (!legalName) setLegalName(descriptionText);
      }
      setShowSuggestions(false);
      return;
    }

    setIsSearchingPlaces(true);
    setShowSuggestions(false);
    try {
      const response = await googleService.getDetails(placeId);
      const data = typeof response === "string" ? JSON.parse(response) : response;
      const result = data.result || data;

      // 1. Nombre Comercial / Legal
      if (result.name) {
        setBrandName(result.name);
        if (!legalName) setLegalName(result.name);
      }

      // 2. Teléfono
      const phone = result.international_phone_number || result.formatted_phone_number;
      if (phone) {
        setContactPhone(phone.replace(/\s+/g, ""));
      }

      // 3. Sitio Web
      if (result.website) {
        setWebsite(result.website);
      }

      // 4. Dirección del Almacén Sede
      const parsed = parseAddressComponents(result.address_components || [], result.formatted_address);
      if (parsed.route || parsed.streetNumber) {
        setWhStreet(`${parsed.route} ${parsed.streetNumber}`.trim());
      }
      if (parsed.city) setWhCity(parsed.city);
      if (parsed.state) setWhState(parsed.state);
      if (parsed.postalCode) setWhPostalCode(parsed.postalCode);
      if (result.name && !whName) setWhName(`Almacén Principal ${result.name}`);

      setSelectedPlaceInfo({
        name: result.name || descriptionText || "Establecimiento",
        address: result.formatted_address || descriptionText || "",
        rating: result.rating,
        userRatingsTotal: result.user_ratings_total,
      });

      setSearchQuery(result.name || descriptionText || "");
      toast.success(`🏪 Datos importados de Google: ${result.name || "Establecimiento"}`);
    } catch (error) {
      console.error("Error al obtener detalles de Google Places:", error);
      if (descriptionText) {
        setBrandName(descriptionText);
        if (!legalName) setLegalName(descriptionText);
      }
    } finally {
      setIsSearchingPlaces(false);
    }
  };

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

        if (profile.warehouses && profile.warehouses.length > 0) {
          const mainWh = profile.warehouses[0];
          setWhName(mainWh.name || "");
          setWhCode(mainWh.code || "ALM-01");
          setWhStreet(mainWh.streetAddress || "");
          setWhCity(mainWh.city || "");
          setWhState(mainWh.state || "");
          setWhPostalCode(mainWh.postalCode || "");
          setWhColdStorage(mainWh.allowsColdStorage ?? false);
          setWhMinTemp(mainWh.minTempSupported != null ? String(mainWh.minTempSupported) : "");
          setWhMaxTemp(mainWh.maxTempSupported != null ? String(mainWh.maxTempSupported) : "");
          setWhManager(mainWh.managerName || "");
          setWhManagerPhone(mainWh.managerPhone || "");
        }
      } else {
        // Usuario recién registrado con Google o correo: prellenar con datos de sesión
        const currentUser = useSessionStore.getState().user;
        if (currentUser) {
          const defaultName = `${currentUser.firstName || ""} ${currentUser.lastName || ""}`.trim();
          if (defaultName) {
            setBrandName((prev) => prev || defaultName);
          }
          if (currentUser.email) {
            setContactEmail((prev) => prev || currentUser.email);
          }
        }
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
        streetAddress: whStreet.trim() || undefined,
        city: whCity.trim(),
        state: whState.trim() || undefined,
        postalCode: whPostalCode.trim() || undefined,
        allowsColdStorage: whColdStorage,
        minTempSupported: whMinTemp ? parseFloat(whMinTemp) : undefined,
        maxTempSupported: whMaxTemp ? parseFloat(whMaxTemp) : undefined,
        managerName: whManager.trim() || undefined,
        managerPhone: whManagerPhone.trim() || undefined,
        isMain: true,
      };

      await supplierService.createWarehouse(payload);
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

  const handleUploadDoc = async (fileToUpload?: File) => {
    const targetFile = fileToUpload || docFile;
    if (!targetFile) {
      toast.warning("Selecciona un archivo PDF o toma una fotografía.");
      return;
    }

    try {
      setIsSaving(true);
      await supplierService.uploadDocument(docType, targetFile, docNumber.trim() || undefined);
      const profile = await supplierService.getProfile();
      setOrg(profile);
      setDocFile(null);
      setDocNumber("");
      toast.success("Documento cargado correctamente en el expediente.");
    } catch (err: any) {
      handleApiError(err, "Error al subir el documento.");
    } finally {
      setIsSaving(false);
    }
  };

  const openCameraForDoc = (type: SupplierDocumentType) => {
    setActiveCameraDocType(type);
    setDocType(type);
    setIsCameraOpen(true);
  };

  const handleCameraCapture = async (file: File) => {
    setIsCameraOpen(false);
    setDocFile(file);
    await handleUploadDoc(file);
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

  const handleSkipToDashboard = () => {
    toast.info("📋 Progreso guardado. Podrás completar los requisitos pendientes desde tu panel.");
    router.push("/supplier/dashboard");
  };

  const handleFinishOnboarding = () => {
    setShowConfetti(true);
    toast.success("¡Onboarding completado exitosamente! Bienvenido a QuHealthy.", {
      autoClose: 4000,
    });
    setTimeout(() => {
      router.push("/supplier/dashboard");
    }, 1500);
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
      {showConfetti && <Confetti recycle={false} numberOfPieces={400} />}

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
                Habilita la comercialización de insumos, dispositivos médicos, medicamentos y despacho con cadena de frío conforme a la normativa sanitaria.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-center shrink-0">
            <button
              type="button"
              onClick={handleSkipToDashboard}
              className="px-3.5 py-2 rounded-2xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#151515] text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-xs font-bold transition-all cursor-pointer shadow-2xs"
            >
              Completar después
            </button>

            <button
              type="button"
              onClick={() => setMigrationModalOpen(true)}
              className="px-4 py-2 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Vincular cuenta</span>
            </button>
          </div>
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
          {/* Bloque 1.1: Identidad Corporativa & Google Places */}
          <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-6 transition-colors">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900 dark:text-white">
                    1. Identidad Institucional & Búsqueda Inteligente
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Busca tu empresa en Google Places para auto-importar tus datos o llena el formulario manualmente.
                  </p>
                </div>
              </div>

              {selectedPlaceInfo && (
                <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Google Places Vinculado</span>
                </div>
              )}
            </div>

            {/* 🔍 Buscador de Google Places */}
            <div ref={searchContainerRef} className="relative space-y-2">
              <label className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Buscar empresa en Google Places (Opcional - Autocompletado rápido)</span>
              </label>

              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-gray-400 pointer-events-none">
                  <Search className="w-4 h-4" />
                </div>

                <Input
                  type="text"
                  placeholder="Escribe el nombre de la empresa, distribuidora o laboratorio en Google..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => {
                    if (suggestions.length > 0) setShowSuggestions(true);
                  }}
                  className="pl-10 pr-10 bg-emerald-50/20 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-900/40 h-12 rounded-2xl text-xs font-semibold text-gray-900 dark:text-white shadow-2xs focus-visible:ring-emerald-500/20"
                />

                <div className="absolute right-3.5 flex items-center gap-2">
                  {isSearchingPlaces && (
                    <QhSpinner size="sm" className="text-emerald-600 dark:text-emerald-400" />
                  )}
                  {searchQuery && !isSearchingPlaces && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        setSuggestions([]);
                        setSelectedPlaceInfo(null);
                      }}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-0.5 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Sugerencias desplegables */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-50 left-0 right-0 top-full mt-1.5 bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl overflow-hidden divide-y divide-gray-100 dark:divide-gray-800 animate-in fade-in-0 duration-150">
                  {suggestions.map((item, idx) => {
                    const pId = item.place_id || item.placeId;
                    const mainText = item.structured_formatting?.main_text || item.description;
                    const secondaryText = item.structured_formatting?.secondary_text || "";
                    return (
                      <button
                        key={pId || idx}
                        type="button"
                        onClick={() => handleSelectPlace(pId, item.description)}
                        className="w-full text-left px-4 py-3 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/30 flex items-start gap-3 transition-colors text-xs cursor-pointer group"
                      >
                        <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/50 flex items-center justify-center text-gray-500 group-hover:text-emerald-600 shrink-0 mt-0.5 transition-colors">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 dark:text-white truncate">
                            {mainText}
                          </p>
                          {secondaryText && (
                            <p className="text-[11px] text-gray-400 truncate mt-0.5">
                              {secondaryText}
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {selectedPlaceInfo && (
                <div className="p-3.5 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40 flex items-center justify-between text-xs gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-base">🏪</span>
                    <div className="truncate">
                      <p className="font-bold text-emerald-900 dark:text-emerald-300 truncate">
                        {selectedPlaceInfo.name}
                      </p>
                      <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80 truncate">
                        {selectedPlaceInfo.address}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedPlaceInfo(null)}
                    className="text-[11px] font-bold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 underline cursor-pointer shrink-0"
                  >
                    Limpiar
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
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
                  Nombre legal registrado ante el SAT en tu Cédula de Identificación Fiscal.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
                  Nombre Comercial / Marca Visible
                </label>
                <Input
                  icon={<Award className="w-4 h-4" />}
                  placeholder="Ej. MedSupply México"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="bg-white dark:bg-[#0a0a0a] h-12 rounded-2xl border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white shadow-2xs focus-visible:ring-emerald-500/20"
                />
                <p className="text-[11px] text-gray-400 dark:text-gray-500">
                  Nombre visible en el Marketplace de cotizaciones y pedidos.
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
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleSkipToDashboard}
              className="text-xs font-bold text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 underline cursor-pointer"
            >
              Completar más tarde e ir al Panel
            </button>

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

            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 flex items-start gap-3">
              <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                Tus datos fiscales están protegidos y serán utilizados para la emisión de CFDI 4.0 por transacciones dentro del ecosistema QuHealthy.
              </p>
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

      {/* 📋 PASO 4: CARGA DE DOCUMENTACIÓN KYB (ARCHIVOS + CÁMARA) */}
      {currentStep === 4 && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-6 transition-colors">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900 dark:text-white">
                    Expediente Regulatorio y Validación KYB
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Carga tus documentos mediante archivo digital (PDF/JPG) o <b>escaneo directo con cámara</b>.
                  </p>
                </div>
              </div>

              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 text-xs font-bold border border-indigo-200 dark:border-indigo-900/40">
                <Camera className="w-3.5 h-3.5" />
                <span>Foto & Archivo Soportados</span>
              </span>
            </div>

            {/* Selector y Carga Rápida */}
            <div className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#111] space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
                    Tipo de Documento a Cargar <span className="text-rose-500">*</span>
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
                            {dt.label} {dt.required ? "(Obligatorio)" : "(Opcional)"}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-800 dark:text-gray-200">
                    Número de Folio / Referencia Oficial (Opcional)
                  </label>
                  <Input
                    placeholder="Ej. Folio Oficial SAT / COFEPRIS"
                    value={docNumber}
                    onChange={(e) => setDocNumber(e.target.value)}
                    className="bg-white dark:bg-[#0a0a0a] h-12 rounded-2xl border border-gray-200 dark:border-gray-800 text-xs font-semibold font-mono text-gray-900 dark:text-white shadow-2xs focus-visible:ring-emerald-500/20"
                  />
                </div>
              </div>

              {/* Botones de Carga: Archivo + Cámara */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setDocFile(file);
                      handleUploadDoc(file);
                    }
                  }}
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSaving}
                  className="w-full sm:w-1/2 h-12 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-emerald-500 bg-white dark:bg-[#0a0a0a] text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center justify-center gap-2 cursor-pointer transition-all shadow-2xs"
                >
                  <Upload className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Subir Archivo (PDF / Imagen)</span>
                </button>

                <button
                  type="button"
                  onClick={() => openCameraForDoc(docType)}
                  disabled={isSaving}
                  className="w-full sm:w-1/2 h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all shadow-sm border-0"
                >
                  <Camera className="w-4 h-4 text-white" />
                  <span>Tomar Foto con Cámara</span>
                </button>
              </div>

              {isSaving && (
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 pt-2 animate-pulse">
                  <QhSpinner size="sm" />
                  <span>Procesando y subiendo documento al expediente...</span>
                </div>
              )}
            </div>

            {/* Lista y Estado de los Documentos del Catálogo KYB */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Expediente de Documentos ({org?.documents?.length || 0} cargados)
                </h4>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {DOCUMENT_TYPES.map((dt) => {
                  const uploadedDoc = org?.documents?.find((d) => d.documentType === dt.value);
                  const isUploaded = !!uploadedDoc;

                  return (
                    <div
                      key={dt.value}
                      className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isUploaded
                          ? "border-emerald-200/80 dark:border-emerald-900/40 bg-emerald-50/20 dark:bg-emerald-950/10"
                          : "border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]"
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                            isUploaded
                              ? "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-400"
                          }`}
                        >
                          {isUploaded ? <Check className="w-4 h-4 stroke-2" /> : <FileText className="w-4 h-4" />}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900 dark:text-white text-xs truncate">
                              {dt.label}
                            </span>
                            {dt.required && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/60">
                                Requerido
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate mt-0.5">
                            {dt.description}
                          </p>
                          {uploadedDoc && (
                            <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono mt-1">
                              Folio: {uploadedDoc.documentNumber || uploadedDoc.fileName || "Cargado"}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        {isUploaded ? (
                          <>
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-900">
                              {uploadedDoc.status}
                            </span>

                            {uploadedDoc.fileUrl && (
                              <a
                                href={uploadedDoc.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                title="Ver documento"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            )}

                            <button
                              type="button"
                              onClick={() => openCameraForDoc(dt.value)}
                              className="px-2.5 py-1.5 rounded-xl border border-gray-200 dark:border-gray-800 text-[11px] font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#151515] flex items-center gap-1 cursor-pointer"
                              title="Tomar nueva foto"
                            >
                              <Camera className="w-3.5 h-3.5" />
                              <span>Reemplazar</span>
                            </button>
                          </>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => openCameraForDoc(dt.value)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50 hover:bg-emerald-100 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                            >
                              <Camera className="w-3.5 h-3.5" />
                              <span>Foto</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setDocType(dt.value);
                                fileInputRef.current?.click();
                              }}
                              className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#151515] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              <span>Subir</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
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
              <span>Continuar a Equipo & Activación</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 📋 PASO 5: EQUIPO & ACTIVACIÓN PROGRESIVA */}
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
                <div className="p-5 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 text-center text-xs text-gray-400">
                  Aún no has agregado colaboradores adicionales. Podrás agregarlos desde el menú de Ajustes en cualquier momento.
                </div>
              )}
            </div>

            {/* 📋 RESUMEN DE ACTIVACIÓN & REQUISITOS PENDIENTES */}
            <div className="p-6 rounded-3xl bg-linear-to-br from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/20 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                    Onboarding Progresivo Habilitado
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Tu portal empresarial está listo para operar inmediatamente.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 flex items-center justify-center font-bold text-xs">✓</div>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">Identidad comercial y modelo de venta</span>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 flex items-center gap-2.5">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs ${
                    rfc ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50" : "bg-amber-100 text-amber-600"
                  }`}>
                    {rfc ? "✓" : "!"}
                  </div>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    {rfc ? "Datos fiscales y RFC registrados" : "RFC pendiente de completar"}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 flex items-center gap-2.5">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs ${
                    whName ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50" : "bg-amber-100 text-amber-600"
                  }`}>
                    {whName ? "✓" : "!"}
                  </div>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    {whName ? "Almacén de despacho registrado" : "Almacén inicial pendiente"}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 flex items-center gap-2.5">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs ${
                    (org?.documents?.length || 0) > 0 ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50" : "bg-amber-100 text-amber-600"
                  }`}>
                    {(org?.documents?.length || 0) > 0 ? "✓" : "!"}
                  </div>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    {(org?.documents?.length || 0) > 0
                      ? `${org?.documents?.length} documentos en validación`
                      : "Documentación KYB pendiente"}
                  </span>
                </div>
              </div>
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
              onClick={handleFinishOnboarding}
              className="h-12 px-8 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-2 cursor-pointer border-0"
            >
              <span>Finalizar Onboarding & Entrar al Panel</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 📸 MODAL: CÁMARA UNIVERSAL PARA ESCANEO DE DOCUMENTOS */}
      <UniversalCameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
        mode="document"
        title={`Escanear ${DOCUMENT_TYPES.find((d) => d.value === activeCameraDocType)?.label || "Documento"}`}
        description="Coloca el documento centrado dentro del recuadro con buena iluminación."
      />

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
                        <span className="font-semibold text-gray-900 dark:text-white">{type.label}</span>
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
