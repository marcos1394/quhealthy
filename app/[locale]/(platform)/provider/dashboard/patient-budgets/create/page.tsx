"use client";

/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-doctor/button-has-type */

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calculator,
  Plus,
  Trash2,
  Calendar as CalendarIcon,
  Sparkles,
  FileText,
  User,
  Activity,
  CheckCircle2,
  DollarSign,
  Loader2,
  Eye,
  Edit3,
  Search,
  Building2,
  ShieldCheck,
  Stethoscope,
  Clock,
  Printer,
  ChevronRight,
  Send,
  Save,
  Columns,
  Palette,
  Image as ImageIcon,
  Check,
  X,
  UserPlus,
  BriefcaseMedical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import {
  CreatePatientBudgetDTO,
  PatientBudgetItemDTO,
  PatientBudgetItemType,
} from "@/types/clinical-budget";
import { clinicalBudgetService } from "@/services/clinical-budget.service";
import { patientDirectoryService } from "@/services/patientDirectory.service";
import { catalogService } from "@/services/catalog.service";
import { consumerProfileService } from "@/services/consumerProfile.service";
import { onboardingService } from "@/services/onboarding.service";
import { PatientDirectorySearchResult } from "@/types/patient";
import { CatalogItemDTO } from "@/types/catalog";
import { ProfileResponse, OnboardingStatusResponse } from "@/types/onboarding";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const ITEM_TYPES: { id: PatientBudgetItemType; label: string }[] = [
  { id: "SURGEON_FEE", label: "Honorarios Cirujano / Especialista" },
  { id: "ANESTHESIOLOGIST_FEE", label: "Honorarios Anestesiólogo" },
  { id: "ASSISTANT_FEE", label: "Honorarios Primer Ayudante" },
  { id: "OR_ROOM", label: "Renta de Quirófano / Sala Quirúrgica" },
  { id: "HOSPITAL_STAY", label: "Estancia / Habitación Hospitalaria" },
  { id: "SUPPLY", label: "Material de Curación / Prótesis / Insumos" },
  { id: "MEDICATION", label: "Medicamentos Perioperatorios" },
  { id: "LAB", label: "Estudios de Laboratorio" },
  { id: "STUDY", label: "Gabinete / Imagenología" },
  { id: "OTHER", label: "Otro Concepto" },
];

const PRESET_COLORS = [
  { name: "Verde Clínico", hex: "#059669" },
  { name: "Azul Quirúrgico", hex: "#0284c7" },
  { name: "Índigo Hospitalario", hex: "#4f46e5" },
  { name: "Azul Marino", hex: "#1e3a8a" },
  { name: "Borgoña Especialidad", hex: "#9f1239" },
  { name: "Gris Ejecutivo", hex: "#334155" },
];

const TEMPLATES = [
  {
    name: "Cirugía de Catarata + Lente",
    procedureName: "Facoemulsificación con Implante de Lente Intraocular",
    diagnosisCie10: "H25.9",
    items: [
      { itemType: "SURGEON_FEE" as PatientBudgetItemType, description: "Honorarios de Cirujano Oftalmólogo", quantity: 1, unitPrice: 12000 },
      { itemType: "ANESTHESIOLOGIST_FEE" as PatientBudgetItemType, description: "Honorarios de Anestesiólogo (Sedación)", quantity: 1, unitPrice: 3500 },
      { itemType: "OR_ROOM" as PatientBudgetItemType, description: "Renta de Quirófano Ambulatorio (2 hrs)", quantity: 1, unitPrice: 6500 },
      { itemType: "SUPPLY" as PatientBudgetItemType, description: "Lente Intraocular Plegable Premium + Viscoelástico", quantity: 1, unitPrice: 8000 },
      { itemType: "MEDICATION" as PatientBudgetItemType, description: "Kit de Gotas Antibióticas y Antiinflamatorias", quantity: 1, unitPrice: 950 },
    ],
  },
  {
    name: "Colecistectomía Laparoscópica",
    procedureName: "Extirpación de Vesícula Biliar por Laparoscopia",
    diagnosisCie10: "K80.2",
    items: [
      { itemType: "SURGEON_FEE" as PatientBudgetItemType, description: "Honorarios Cirujano General", quantity: 1, unitPrice: 18000 },
      { itemType: "ASSISTANT_FEE" as PatientBudgetItemType, description: "Honorarios Primer Ayudante Quirúrgico", quantity: 1, unitPrice: 4000 },
      { itemType: "ANESTHESIOLOGIST_FEE" as PatientBudgetItemType, description: "Honorarios Anestesiólogo (Anestesia General)", quantity: 1, unitPrice: 5500 },
      { itemType: "OR_ROOM" as PatientBudgetItemType, description: "Quirófano + Torre de Laparoscopia HD (3 hrs)", quantity: 1, unitPrice: 11000 },
      { itemType: "HOSPITAL_STAY" as PatientBudgetItemType, description: "Habitación Individual (1 Noche de Recuperación)", quantity: 1, unitPrice: 4500 },
    ],
  },
  {
    name: "Implante Dental + Corona",
    procedureName: "Colocación de Implante de Titanio y Corona Zirconia",
    diagnosisCie10: "K08.1",
    items: [
      { itemType: "SURGEON_FEE" as PatientBudgetItemType, description: "Fase Quirúrgica (Colocación de Implante Osteointegrado)", quantity: 1, unitPrice: 9500 },
      { itemType: "SUPPLY" as PatientBudgetItemType, description: "Pilar Protésico y Corona de Zirconia Monolítica", quantity: 1, unitPrice: 6500 },
      { itemType: "STUDY" as PatientBudgetItemType, description: "Tomografía Cone Beam 3D y Guía Quirúrgica", quantity: 1, unitPrice: 1800 },
    ],
  },
  {
    name: "Chequeo Médico Integral 360°",
    procedureName: "Protocolo de Evaluación Preventiva Integral",
    diagnosisCie10: "Z00.0",
    items: [
      { itemType: "SURGEON_FEE" as PatientBudgetItemType, description: "Consulta de Medicina Interna + Electrocardiograma", quantity: 1, unitPrice: 1500 },
      { itemType: "LAB" as PatientBudgetItemType, description: "Checkup de Laboratorio (Biometría, Química 45, Perfil Lipídico)", quantity: 1, unitPrice: 2200 },
      { itemType: "STUDY" as PatientBudgetItemType, description: "Ultrasonido Abdominal Completo y Rx de Tórax", quantity: 1, unitPrice: 1800 },
    ],
  },
];

export default function CreatePatientBudgetPage() {
  const router = useRouter();

  const [viewMode, setViewMode] = useState<"edit" | "preview" | "split">("edit");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Datos del Médico & Personalización del Diseño (como en la receta) ────
  const [doctorProfile, setDoctorProfile] = useState<ProfileResponse | null>(null);
  const [doctorStatus, setDoctorStatus] = useState<OnboardingStatusResponse | null>(null);
  const [accentColor, setAccentColor] = useState<string>("#059669");
  const [clinicLogoUrl, setClinicLogoUrl] = useState<string>("");
  const [footerCustomNote, setFooterCustomNote] = useState<string>("");

  // ── Catálogo de Servicios del Doctor ────
  const [catalogItems, setCatalogItems] = useState<CatalogItemDTO[]>([]);
  const [procedureSearchQuery, setProcedureSearchQuery] = useState("");
  const [isProcedureDropdownOpen, setIsProcedureDropdownOpen] = useState(false);
  const procedureRef = useRef<HTMLDivElement>(null);

  // ── Búsqueda de Pacientes de QuHealthy ────
  const [patientSearchQuery, setPatientSearchQuery] = useState("");
  const [patientSearchResults, setPatientSearchResults] = useState<PatientDirectorySearchResult[]>([]);
  const [isSearchingPatient, setIsSearchingPatient] = useState(false);
  const [isPatientDropdownOpen, setIsPatientDropdownOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<number | undefined>();
  const patientRef = useRef<HTMLDivElement>(null);

  // ── Búsqueda CIE-10 ────
  const [cie10SearchQuery, setCie10SearchQuery] = useState("");
  const [cie10SearchResults, setCie10SearchResults] = useState<any[]>([]);
  const [isSearchingCie10, setIsSearchingCie10] = useState(false);
  const [isCie10DropdownOpen, setIsCie10DropdownOpen] = useState(false);
  const cie10Ref = useRef<HTMLDivElement>(null);

  // ── Form State ────
  const [patientName, setPatientName] = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [diagnosisCie10, setDiagnosisCie10] = useState("");
  const [procedureName, setProcedureName] = useState("");
  const [clinicalNotes, setClinicalNotes] = useState("");
  const [validUntilDate, setValidUntilDate] = useState<Date>(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  );
  const [discountAmount, setDiscountAmount] = useState<number>(0);

  const [items, setItems] = useState<PatientBudgetItemDTO[]>([
    {
      itemType: "SURGEON_FEE",
      description: "Honorarios Médicos de Cirujano Principal",
      quantity: 1,
      unitPrice: 0,
      notes: "",
    },
  ]);

  // Carga inicial del perfil del doctor, receta y catálogo de servicios
  useEffect(() => {
    async function loadDoctorData() {
      try {
        const [profileRes, statusRes, catalogRes] = await Promise.allSettled([
          onboardingService.getProfile(),
          onboardingService.getOnboardingStatus(),
          catalogService.getMyCatalog(),
        ]);
        if (profileRes.status === "fulfilled" && profileRes.value) {
          setDoctorProfile(profileRes.value);
        }
        if (statusRes.status === "fulfilled" && statusRes.value) {
          const st = statusRes.value;
          setDoctorStatus(st);
          // Cargar preferencias de la receta por defecto
          if (st.prescriptionColor) setAccentColor(st.prescriptionColor);
          if (st.prescriptionLogoUrl) setClinicLogoUrl(st.prescriptionLogoUrl);
          else if (st.profileImageUrl) setClinicLogoUrl(st.profileImageUrl);
          if (st.prescriptionFooterNote) setFooterCustomNote(st.prescriptionFooterNote);
        }
        if (catalogRes.status === "fulfilled" && catalogRes.value) {
          setCatalogItems(catalogRes.value || []);
        }
      } catch (err) {
        console.error("Error loading doctor profile/catalog:", err);
      }
    }
    loadDoctorData();
  }, []);

  // Cerrar dropdowns al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (patientRef.current && !patientRef.current.contains(e.target as Node)) {
        setIsPatientDropdownOpen(false);
      }
      if (cie10Ref.current && !cie10Ref.current.contains(e.target as Node)) {
        setIsCie10DropdownOpen(false);
      }
      if (procedureRef.current && !procedureRef.current.contains(e.target as Node)) {
        setIsProcedureDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── Búsqueda de Pacientes en QuHealthy con Debounce ────
  useEffect(() => {
    if (!patientSearchQuery.trim()) {
      setPatientSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        setIsSearchingPatient(true);
        const results = await patientDirectoryService.searchPatients(patientSearchQuery);
        setPatientSearchResults(results || []);
        setIsPatientDropdownOpen(true);
      } catch (err) {
        console.error("Error searching patients:", err);
      } finally {
        setIsSearchingPatient(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [patientSearchQuery]);

  // ── Búsqueda CIE-10 en tiempo real con Debounce ────
  useEffect(() => {
    if (!cie10SearchQuery.trim()) {
      setCie10SearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        setIsSearchingCie10(true);
        const res = await consumerProfileService.searchIcd10(cie10SearchQuery);
        if (res && res.content) {
          setCie10SearchResults(res.content);
          setIsCie10DropdownOpen(true);
        } else {
          setCie10SearchResults([]);
        }
      } catch (err) {
        console.error("Error searching CIE10:", err);
      } finally {
        setIsSearchingCie10(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [cie10SearchQuery]);

  // Selección de Paciente Registrado
  const handleSelectPatient = (p: PatientDirectorySearchResult) => {
    const fullName = `${p.firstName || ""} ${p.lastName || ""}`.trim();
    setSelectedPatientId(p.id);
    setPatientName(fullName);
    setPatientEmail(p.email || "");
    setPatientPhone(p.phone || "");
    setPatientSearchQuery("");
    setIsPatientDropdownOpen(false);
    toast.success(`Paciente "${fullName}" vinculado.`);
  };

  // Usar Paciente Manual / No Registrado
  const handleUseManualPatient = (customName: string) => {
    setSelectedPatientId(undefined);
    setPatientName(customName.trim());
    setPatientSearchQuery("");
    setIsPatientDropdownOpen(false);
    toast.info(`Paciente manual "${customName.trim()}" asignado.`);
  };

  // Selección de CIE-10
  const handleSelectCie10 = (item: { code: string; name: string }) => {
    setDiagnosisCie10(item.code);
    setCie10SearchQuery("");
    setIsCie10DropdownOpen(false);
    toast.success(`Diagnóstico "${item.code} - ${item.name}" seleccionado.`);
  };

  // Selección de Procedimiento del Catálogo
  const handleSelectCatalogService = (srv: CatalogItemDTO) => {
    setProcedureName(srv.name);
    setProcedureSearchQuery("");
    setIsProcedureDropdownOpen(false);

    // Auto-rellenar o agregar partida inicial
    setItems((prev) => {
      if (prev.length === 1 && (!prev[0].description || prev[0].unitPrice === 0)) {
        return [
          {
            itemType: "SURGEON_FEE",
            description: srv.name,
            quantity: 1,
            unitPrice: srv.price || 0,
            notes: srv.description || "",
          },
        ];
      }
      return [
        ...prev,
        {
          itemType: "SURGEON_FEE",
          description: srv.name,
          quantity: 1,
          unitPrice: srv.price || 0,
          notes: srv.description || "",
        },
      ];
    });
    toast.success(`Procedimiento "${srv.name}" añadido.`);
  };

  // Usar Procedimiento Personalizado Libre
  const handleUseCustomProcedure = (customName: string) => {
    setProcedureName(customName.trim());
    setProcedureSearchQuery("");
    setIsProcedureDropdownOpen(false);
  };

  const handleApplyTemplate = (tpl: typeof TEMPLATES[0]) => {
    setProcedureName(tpl.procedureName);
    setDiagnosisCie10(tpl.diagnosisCie10);
    setItems(
      tpl.items.map((i) => ({
        ...i,
        notes: "",
      }))
    );
    toast.success(`Plantilla "${tpl.name}" aplicada.`);
  };

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        itemType: "SUPPLY",
        description: "",
        quantity: 1,
        unitPrice: 0,
        notes: "",
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) {
      toast.error("El presupuesto debe contener al menos un concepto.");
      return;
    }
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (
    index: number,
    field: keyof PatientBudgetItemDTO,
    value: any
  ) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const subtotal = items.reduce(
    (acc, it) => acc + (Number(it.quantity) || 0) * (Number(it.unitPrice) || 0),
    0
  );
  const total = Math.max(0, subtotal - (Number(discountAmount) || 0));

  const filteredCatalogItems = catalogItems.filter((it) =>
    it.name.toLowerCase().includes(procedureSearchQuery.toLowerCase())
  );

  const handleSubmit = async (sendImmediately: boolean = false) => {
    if (!patientName.trim()) {
      toast.error("El nombre del paciente es obligatorio.");
      return;
    }
    if (!procedureName.trim()) {
      toast.error("El nombre del procedimiento es obligatorio.");
      return;
    }
    if (items.some((i) => !i.description.trim() || Number(i.unitPrice) <= 0)) {
      toast.error("Por favor completa la descripción y el precio de cada concepto.");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload: CreatePatientBudgetDTO = {
        patientId: selectedPatientId,
        patientName,
        patientEmail: patientEmail.trim() || undefined,
        patientPhone: patientPhone.trim() || undefined,
        diagnosisCie10: diagnosisCie10.trim() || undefined,
        procedureName,
        clinicalNotes: clinicalNotes.trim() || undefined,
        doctorName: doctorStatus?.firstName ? `Dr(a). ${doctorStatus.firstName}` : (doctorProfile?.businessName || undefined),
        doctorLicense: doctorStatus?.professionalLicenses && doctorStatus.professionalLicenses.length > 0 ? doctorStatus.professionalLicenses[0].licenseNumber : undefined,
        doctorSpecialty: doctorStatus?.professionalLicenses && doctorStatus.professionalLicenses.length > 0 ? (doctorStatus.professionalLicenses[0].institution || doctorStatus.professionalLicenses[0].type) : undefined,
        doctorPhone: doctorProfile?.contactPhone || undefined,
        doctorEmail: doctorProfile?.contactEmail || doctorStatus?.email || undefined,
        validUntil: validUntilDate.toISOString().split("T")[0],
        discountAmount: Number(discountAmount) || 0,
        taxAmount: 0,
        items: items.map((i) => ({
          itemType: i.itemType,
          description: i.description,
          quantity: Number(i.quantity) || 1,
          unitPrice: Number(i.unitPrice) || 0,
          notes: i.notes || undefined,
        })),
      };

      const created = await clinicalBudgetService.createBudget(payload);

      if (sendImmediately) {
        await clinicalBudgetService.sendBudget(created.id);
        toast.success(`Cotización ${created.folio} creada y enviada al paciente.`);
      } else {
        toast.success(`Cotización ${created.folio} guardada como borrador.`);
      }

      router.push("/provider/dashboard/patient-budgets");
    } catch (err: any) {
      console.error("Error al crear presupuesto:", err);
      toast.error(err.response?.data?.message || "No se pudo crear la cotización.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ── RENDER DE HOJA MEMBRETADA OFICIAL (ESTILO RECETA CLÍNICA) ────────── */
  const renderOfficialLetterhead = () => (
    <div
      className="space-y-6 p-6 sm:p-10 rounded-3xl bg-white dark:bg-[#0c0c0c] border border-gray-200 dark:border-gray-800 shadow-xl text-gray-900 dark:text-white transition-all duration-300 relative overflow-hidden"
      style={{ borderTop: `10px solid ${accentColor}` }}
    >
      {/* Membrete Oficial con Logo y Datos Reales del Médico */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-start gap-4">
          {/* Logotipo del Doctor / Clínica */}
          {clinicLogoUrl ? (
            <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-[#161616] border border-gray-200 dark:border-gray-800 flex items-center justify-center overflow-hidden p-1 shrink-0 shadow-xs">
              <img
                src={clinicLogoUrl}
                alt="Logo del Consultorio"
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-xs shrink-0"
              style={{ backgroundColor: accentColor }}
            >
              Q
            </div>
          )}

          <div className="space-y-1">
            <div
              className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-extrabold"
              style={{
                backgroundColor: `${accentColor}18`,
                color: accentColor,
              }}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>COTIZACIÓN CLÍNICA & QUIRÚRGICA</span>
            </div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              {doctorStatus?.firstName ? `Dr(a). ${doctorStatus.firstName}` : (doctorProfile?.businessName || "Consultorio Médico Especializado")}
            </h2>
            <div className="flex flex-wrap items-center gap-2.5 text-xs text-gray-500 font-medium">
              {doctorStatus?.professionalLicenses && doctorStatus.professionalLicenses.length > 0 && (
                <span className="flex items-center gap-1 font-bold text-gray-700 dark:text-gray-300">
                  <ShieldCheck className="w-3.5 h-3.5" style={{ color: accentColor }} />
                  <span>
                    Cédula Profesional SEP: {doctorStatus.professionalLicenses[0].licenseNumber} (
                    {doctorStatus.professionalLicenses[0].institution || doctorStatus.professionalLicenses[0].type}
                    )
                  </span>
                </span>
              )}
              {(doctorProfile?.contactEmail || doctorStatus?.email) && (
                <span>• {doctorProfile?.contactEmail || doctorStatus?.email}</span>
              )}
              {doctorProfile?.contactPhone && <span>• Tel: {doctorProfile.contactPhone}</span>}
              {doctorProfile?.address && <span>• {doctorProfile.address}</span>}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-gray-800 text-right shrink-0">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Folio Oficial</span>
          <span className="font-mono font-black text-base text-gray-900 dark:text-white">PR-2026-NUEVO</span>
          <span className="text-[10px] text-gray-400 block">Vigencia: {validUntilDate.toLocaleDateString("es-MX")}</span>
        </div>
      </div>

      {/* Datos del Paciente */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-gray-50/60 dark:bg-[#141414] border border-gray-100 dark:border-gray-800 text-xs">
        <div>
          <span className="text-gray-400 font-bold uppercase text-[10px] block">Paciente</span>
          <span className="font-extrabold text-gray-900 dark:text-white text-sm">{patientName || "Nombre del Paciente"}</span>
          {(patientPhone || patientEmail) && (
            <span className="text-[10px] text-gray-400 block">{patientPhone || patientEmail}</span>
          )}
        </div>
        <div>
          <span className="text-gray-400 font-bold uppercase text-[10px] block">Procedimiento</span>
          <span className="font-bold text-gray-800 dark:text-gray-200">{procedureName || "Sin procedimiento especificado"}</span>
        </div>
        <div>
          <span className="text-gray-400 font-bold uppercase text-[10px] block">Diagnóstico CIE-10</span>
          <span className="font-mono font-bold" style={{ color: accentColor }}>
            {diagnosisCie10 || "N/A"}
          </span>
        </div>
      </div>

      {/* Tabla de Partidas */}
      <div className="space-y-2">
        <h3 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white">
          Desglose Detallado de Conceptos Médicos & Hospitalarios
        </h3>
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 dark:bg-[#141414] text-gray-500 font-bold uppercase text-[10px] border-b border-gray-200 dark:border-gray-800">
              <tr>
                <th className="p-3.5">Concepto</th>
                <th className="p-3.5 text-center">Cant.</th>
                <th className="p-3.5 text-right">P. Unitario</th>
                <th className="p-3.5 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {items.map((it, idx) => (
                <tr key={idx} className="hover:bg-gray-50/40">
                  <td className="p-3.5">
                    <span className="font-bold block text-gray-900 dark:text-white">{it.description || "Concepto sin descripción"}</span>
                    <span className="text-[10px] text-gray-400 uppercase">{it.itemType.replace("_", " ")}</span>
                  </td>
                  <td className="p-3.5 text-center font-mono">{it.quantity}</td>
                  <td className="p-3.5 text-right font-mono">${(Number(it.unitPrice) || 0).toLocaleString("es-MX", { minimumFractionDigits: 2 })}</td>
                  <td className="p-3.5 text-right font-mono font-bold text-gray-900 dark:text-white">
                    ${((Number(it.quantity) || 1) * (Number(it.unitPrice) || 0)).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Indicaciones y Totales */}
      <div className="flex flex-col sm:flex-row justify-between gap-6 pt-4 border-t border-gray-200 dark:border-gray-800">
        <div className="space-y-1.5 sm:max-w-md text-xs text-gray-500">
          <h4 className="font-bold text-gray-900 dark:text-white uppercase text-[10px]">
            Indicaciones Clínicas
          </h4>
          <p className="leading-relaxed">
            {clinicalNotes || "No se especificaron indicaciones previas adicionales."}
          </p>
        </div>

        <div className="w-full sm:w-80 space-y-2 text-xs p-5 rounded-2xl bg-gray-50 dark:bg-[#141414] border border-gray-200 dark:border-gray-800 shrink-0">
          <div className="flex justify-between text-gray-500">
            <span>Subtotal Bruto:</span>
            <span className="font-mono font-bold">${subtotal.toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between font-bold" style={{ color: accentColor }}>
              <span>Descuento Comercial:</span>
              <span className="font-mono">-${discountAmount.toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN</span>
            </div>
          )}
          <div className="flex justify-between text-gray-500">
            <span>IVA Exento (Art. 15 Fracc. XIV LIVA):</span>
            <span className="font-mono font-bold" style={{ color: accentColor }}>$0.00 (0%)</span>
          </div>
          <div className="pt-2 border-t border-gray-200 dark:border-gray-800 flex justify-between items-baseline">
            <span className="font-black uppercase text-[10px] text-gray-900 dark:text-white">Total a Pagar:</span>
            <span className="text-2xl font-black font-mono" style={{ color: accentColor }}>
              ${total.toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN
            </span>
          </div>
        </div>
      </div>

      {/* Nota al pie personalizada */}
      {footerCustomNote && (
        <div className="p-3.5 rounded-xl bg-gray-50/70 dark:bg-[#141414] text-[11px] text-gray-500 text-center border border-gray-100 dark:border-gray-800">
          {footerCustomNote}
        </div>
      )}

      {/* Pie de Documento con Área de Firma */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" style={{ color: accentColor }} />
          <span>Documento Clínico Cifrado QuHealthy Engine</span>
        </div>
        <div className="border-b border-dashed border-gray-400 w-52 text-center text-[10px] pb-1">
          Espacio para Firma Digital del Paciente
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 sm:p-10 space-y-8 font-sans max-w-7xl mx-auto">
      
      {/* ── BREADCRUMB & HEADER SUPERIOR ────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-gray-400 font-bold">
            <Link
              href="/provider/dashboard/patient-budgets"
              className="hover:text-gray-900 dark:hover:text-white flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Presupuestos a Pacientes</span>
            </Link>
            <span>/</span>
            <span style={{ color: accentColor }}>Nueva Cotización</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            Elaborar Presupuesto Clínico & Quirúrgico
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-2xl">
            Cotiza procedimientos médicos con desglose transparente de honorarios, quirófano e insumos con membrete personalizado y firma digital.
          </p>
        </div>

        {/* Selector de Modos y Botones de Acción */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-gray-100 dark:bg-[#141414] border border-gray-200/80 dark:border-gray-800">
            <button
              type="button"
              onClick={() => setViewMode("edit")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                viewMode === "edit"
                  ? "bg-white dark:bg-[#202020] text-gray-900 dark:text-white shadow-xs"
                  : "text-gray-500 hover:text-gray-900"
              )}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edición</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("split")}
              className={cn(
                "hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                viewMode === "split"
                  ? "bg-white dark:bg-[#202020] text-gray-900 dark:text-white shadow-xs"
                  : "text-gray-500 hover:text-gray-900"
              )}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Lado a Lado</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("preview")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                viewMode === "preview"
                  ? "bg-white dark:bg-[#202020] text-gray-900 dark:text-white shadow-xs"
                  : "text-gray-500 hover:text-gray-900"
              )}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Previsualizar</span>
            </button>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => handleSubmit(false)}
            disabled={isSubmitting}
            className="h-10 px-4 rounded-xl text-xs font-bold gap-1.5 cursor-pointer"
          >
            {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>Guardar Borrador</span>
          </Button>

          <Button
            type="button"
            onClick={() => handleSubmit(true)}
            disabled={isSubmitting}
            className="h-10 px-4 rounded-xl text-white text-xs font-bold gap-1.5 shadow-md border-0 cursor-pointer"
            style={{ backgroundColor: accentColor }}
          >
            {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            <span>Crear y Enviar al Paciente</span>
          </Button>
        </div>
      </div>

      {/* ── CUERPO PRINCIPAL (SEGÚN MODO DE VISTA) ──────────────────── */}
      {viewMode === "preview" ? (
        renderOfficialLetterhead()
      ) : (
        <div className={cn(
          "grid gap-8 items-start",
          viewMode === "split" ? "grid-cols-1 lg:grid-cols-12" : "grid-cols-1"
        )}>
          
          {/* COLUMNA DE FORMULARIO DE EDICIÓN */}
          <div className={cn(
            "space-y-6",
            viewMode === "split" ? "lg:col-span-7" : "w-full"
          )}>
            
            {/* 🎨 PERSONALIZACIÓN DEL DISEÑO DE LA COTIZACIÓN (COMO EN LA RECETA) */}
            <div className="p-5 rounded-3xl bg-white dark:bg-[#0c0c0c] border border-gray-200/80 dark:border-gray-800 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-1.5">
                  <Palette className="w-4 h-4" style={{ color: accentColor }} />
                  <span>Personalización Visual del Documento</span>
                </label>
                <span className="text-[11px] font-mono text-gray-400 font-bold uppercase">{accentColor}</span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs text-gray-500 font-semibold">Color de Acento:</span>
                <div className="flex items-center gap-2">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => setAccentColor(c.hex)}
                      title={c.name}
                      className={cn(
                        "w-7 h-7 rounded-full transition-all cursor-pointer flex items-center justify-center border-2",
                        accentColor === c.hex
                          ? "border-gray-900 dark:border-white scale-110 shadow-sm"
                          : "border-transparent hover:scale-105"
                      )}
                      style={{ backgroundColor: c.hex }}
                    >
                      {accentColor === c.hex && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                    </button>
                  ))}

                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-7 h-7 rounded-full p-0 cursor-pointer border-0 bg-transparent"
                    title="Color personalizado"
                  />
                </div>
              </div>
            </div>

            {/* 1. Plantillas Quirúrgicas Rápidas */}
            <div className="p-5 rounded-3xl bg-white dark:bg-[#0c0c0c] border border-gray-200/80 dark:border-gray-800 space-y-2 shadow-xs">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" style={{ color: accentColor }} />
                <span>Plantillas Quirúrgicas Preconfiguradas:</span>
              </label>
              <div className="flex flex-wrap gap-2 pt-1">
                {TEMPLATES.map((tpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyTemplate(tpl)}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gray-50 dark:bg-[#141414] text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-800 hover:border-emerald-500 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <span>{tpl.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Sección: Paciente & Diagnóstico CIE-10 */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0c0c0c] border border-gray-200/80 dark:border-gray-800 space-y-4 shadow-xs">
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-1.5">
                <User className="w-4 h-4" style={{ color: accentColor }} />
                <span>1. Información del Paciente & Diagnóstico CIE-10</span>
              </h3>

              {/* ── BUSCADOR DE PACIENTE CONECTADO CON AUTOCOMPLETE + OPCIÓN LIBRE ── */}
              <div ref={patientRef} className="space-y-1.5 relative">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center justify-between">
                  <span>Paciente *</span>
                  {selectedPatientId ? (
                    <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Paciente Registrado Vinculado</span>
                    </span>
                  ) : patientName ? (
                    <span className="text-[11px] font-bold text-sky-600">Paciente No Registrado (Manual)</span>
                  ) : null}
                </label>

                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por nombre, teléfono o correo en QuHealthy (o escribe paciente nuevo)..."
                    value={patientSearchQuery || patientName}
                    onChange={(e) => {
                      setPatientSearchQuery(e.target.value);
                      setPatientName(e.target.value);
                    }}
                    onFocus={() => {
                      if (patientSearchResults.length > 0 || patientSearchQuery) {
                        setIsPatientDropdownOpen(true);
                      }
                    }}
                    className="pl-10 pr-10 rounded-xl bg-gray-50 dark:bg-[#141414] text-xs h-11 border-gray-200 dark:border-gray-800"
                  />
                  {isSearchingPatient ? (
                    <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />
                  ) : (patientSearchQuery || patientName) ? (
                    <button
                      type="button"
                      onClick={() => {
                        setPatientName("");
                        setPatientEmail("");
                        setPatientPhone("");
                        setSelectedPatientId(undefined);
                        setPatientSearchQuery("");
                        setIsPatientDropdownOpen(false);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  ) : null}
                </div>

                {/* Dropdown Resultados de Paciente */}
                {isPatientDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white dark:bg-[#161616] border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl max-h-56 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
                    {patientSearchResults.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => handleSelectPatient(p)}
                        className="p-3 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 cursor-pointer flex items-center justify-between transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-xs">
                            {p.firstName?.charAt(0) || "P"}
                          </div>
                          <div>
                            <span className="font-bold text-xs text-gray-900 dark:text-white block">
                              {p.firstName} {p.lastName}
                            </span>
                            <span className="text-[10px] text-gray-400">
                              {p.email || p.phone || "Sin datos de contacto"}
                            </span>
                          </div>
                        </div>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      </div>
                    ))}

                    {/* Opción libre / paciente nuevo */}
                    {patientSearchQuery && (
                      <div
                        onClick={() => handleUseManualPatient(patientSearchQuery)}
                        className="p-3 bg-sky-50/60 dark:bg-sky-950/30 hover:bg-sky-100 cursor-pointer flex items-center gap-2 text-xs font-bold text-sky-800 dark:text-sky-300 transition-colors"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>Usar &quot;{patientSearchQuery}&quot; como paciente nuevo / externo</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Teléfono y Correo del Paciente */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    Correo Electrónico (Para envío automático)
                  </label>
                  <Input
                    type="email"
                    placeholder="paciente@correo.com"
                    value={patientEmail}
                    onChange={(e) => setPatientEmail(e.target.value)}
                    className="rounded-xl bg-gray-50 dark:bg-[#141414] text-xs h-10 border-gray-200 dark:border-gray-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    Teléfono / WhatsApp (Para envío de enlace)
                  </label>
                  <Input
                    placeholder="+52 55 1234 5678"
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    className="rounded-xl bg-gray-50 dark:bg-[#141414] text-xs h-10 border-gray-200 dark:border-gray-800"
                  />
                </div>
              </div>

              {/* ── PROCEDIMIENTO CONECTADO AL CATÁLOGO + CAPTURA LIBRE ── */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                <div ref={procedureRef} className="sm:col-span-7 space-y-1 relative">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center justify-between">
                    <span>Procedimiento o Cirugía *</span>
                    <span className="text-[10px] text-gray-400">Catálogo o personalizada</span>
                  </label>

                  <div className="relative">
                    <BriefcaseMedical className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Buscar en tus servicios del catálogo o escribe una cirugía..."
                      value={procedureSearchQuery || procedureName}
                      onChange={(e) => {
                        setProcedureSearchQuery(e.target.value);
                        setProcedureName(e.target.value);
                        setIsProcedureDropdownOpen(true);
                      }}
                      onFocus={() => setIsProcedureDropdownOpen(true)}
                      className="pl-10 pr-8 rounded-xl bg-gray-50 dark:bg-[#141414] text-xs h-10 border-gray-200 dark:border-gray-800"
                    />
                    {(procedureSearchQuery || procedureName) && (
                      <button
                        type="button"
                        onClick={() => {
                          setProcedureName("");
                          setProcedureSearchQuery("");
                          setIsProcedureDropdownOpen(false);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Dropdown Catálogo de Procedimientos */}
                  {isProcedureDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white dark:bg-[#161616] border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl max-h-52 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
                      {filteredCatalogItems.map((srv) => (
                        <div
                          key={srv.id}
                          onClick={() => handleSelectCatalogService(srv)}
                          className="p-3 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 cursor-pointer flex items-center justify-between transition-colors"
                        >
                          <div>
                            <span className="font-bold text-xs text-gray-900 dark:text-white block">{srv.name}</span>
                            <span className="text-[10px] text-gray-400">Servicio de tu tienda</span>
                          </div>
                          <span className="font-mono font-bold text-xs text-emerald-600">
                            ${(srv.price || 0).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      ))}

                      {procedureSearchQuery && (
                        <div
                          onClick={() => handleUseCustomProcedure(procedureSearchQuery)}
                          className="p-3 bg-emerald-50/60 dark:bg-emerald-950/30 hover:bg-emerald-100 cursor-pointer flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Usar &quot;{procedureSearchQuery}&quot; como procedimiento personalizado</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* ── BUSCADOR CIE-10 CONECTADO CON AUTOCOMPLETE ── */}
                <div ref={cie10Ref} className="sm:col-span-5 space-y-1 relative">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center justify-between">
                    <span>Diagnóstico CIE-10</span>
                    {diagnosisCie10 && (
                      <span className="font-mono font-bold" style={{ color: accentColor }}>
                        {diagnosisCie10}
                      </span>
                    )}
                  </label>

                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Buscar código o condición (ej. Catarata, K80)..."
                      value={cie10SearchQuery || (diagnosisCie10 ? `CIE-10: ${diagnosisCie10}` : "")}
                      onChange={(e) => {
                        setCie10SearchQuery(e.target.value);
                        setDiagnosisCie10(e.target.value);
                      }}
                      onFocus={() => {
                        if (cie10SearchResults.length > 0) setIsCie10DropdownOpen(true);
                      }}
                      className="pl-10 pr-8 rounded-xl bg-gray-50 dark:bg-[#141414] text-xs h-10 border-gray-200 dark:border-gray-800"
                    />
                    {isSearchingCie10 && (
                      <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />
                    )}
                  </div>

                  {/* Dropdown CIE-10 */}
                  {isCie10DropdownOpen && cie10SearchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white dark:bg-[#161616] border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl max-h-48 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
                      {cie10SearchResults.map((d: any) => (
                        <div
                          key={d.code}
                          onClick={() => handleSelectCie10(d)}
                          className="p-2.5 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 cursor-pointer flex items-center justify-between transition-colors text-xs"
                        >
                          <div>
                            <span className="font-mono font-bold text-emerald-600">{d.code}</span>
                            <span className="text-gray-800 dark:text-gray-200 ml-2">{d.name}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 3. Sección: Desglose de Partidas */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0c0c0c] border border-gray-200/80 dark:border-gray-800 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-1.5">
                  <Activity className="w-4 h-4" style={{ color: accentColor }} />
                  <span>2. Desglose de Partidas (Honorarios, Quirófano, Insumos)</span>
                </h3>

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleAddItem}
                  className="rounded-xl text-xs font-bold gap-1 cursor-pointer hover:bg-gray-50"
                  style={{ borderColor: `${accentColor}40`, color: accentColor }}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Agregar Concepto</span>
                </Button>
              </div>

              <div className="space-y-3">
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-gray-50/70 dark:bg-[#141414] border border-gray-200/80 dark:border-gray-800 grid grid-cols-12 gap-3 items-center shadow-2xs"
                  >
                    <div className="col-span-12 sm:col-span-4 space-y-1">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">
                        Tipo de Partida
                      </span>
                      <Select
                        value={item.itemType}
                        onValueChange={(val) =>
                          handleItemChange(idx, "itemType", val as PatientBudgetItemType)
                        }
                      >
                        <SelectTrigger className="h-10 text-xs rounded-xl bg-white dark:bg-[#1a1a1a] border-gray-200 dark:border-gray-800">
                          <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl z-50">
                          {ITEM_TYPES.map((t) => (
                            <SelectItem key={t.id} value={t.id} className="text-xs">
                              {t.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="col-span-12 sm:col-span-4 space-y-1">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">
                        Descripción del Concepto
                      </span>
                      <Input
                        placeholder="Descripción detallada"
                        value={item.description}
                        onChange={(e) => handleItemChange(idx, "description", e.target.value)}
                        className="h-10 text-xs rounded-xl bg-white dark:bg-[#1a1a1a] border-gray-200 dark:border-gray-800"
                      />
                    </div>

                    <div className="col-span-4 sm:col-span-1 space-y-1">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Cant.</span>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, "quantity", e.target.value)}
                        className="h-10 text-xs text-center rounded-xl bg-white dark:bg-[#1a1a1a] border-gray-200 dark:border-gray-800 font-mono"
                      />
                    </div>

                    <div className="col-span-6 sm:col-span-2 space-y-1">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">
                        P. Unitario ($)
                      </span>
                      <Input
                        type="number"
                        min="0"
                        placeholder="0.00"
                        value={item.unitPrice || ""}
                        onChange={(e) => handleItemChange(idx, "unitPrice", e.target.value)}
                        className="h-10 text-xs text-right rounded-xl bg-white dark:bg-[#1a1a1a] border-gray-200 dark:border-gray-800 font-mono font-bold"
                      />
                    </div>

                    <div className="col-span-2 sm:col-span-1 flex items-center justify-end pt-4">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Sección: Vigencia, Descuento y Totales */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 p-6 rounded-3xl bg-white dark:bg-[#0c0c0c] border border-gray-200/80 dark:border-gray-800 shadow-xs">
              <div className="sm:col-span-7 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                      <CalendarIcon className="w-3.5 h-3.5" style={{ color: accentColor }} />
                      <span>Vigencia del Presupuesto *</span>
                    </label>
                    <DatePicker
                      value={validUntilDate}
                      onChange={(d) => d && setValidUntilDate(d)}
                      className="rounded-xl text-xs h-10 bg-gray-50 dark:bg-[#141414]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      Descuento Comercial ($ MXN)
                    </label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="0.00"
                      value={discountAmount || ""}
                      onChange={(e) => setDiscountAmount(Number(e.target.value) || 0)}
                      className="rounded-xl text-xs font-mono font-bold h-10 bg-gray-50 dark:bg-[#141414] border-gray-200 dark:border-gray-800"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    Indicaciones Médicas Previas para el Paciente
                  </label>
                  <Textarea
                    rows={3}
                    placeholder="Ej. Requiere ayuno de 8 horas previo a cirugía y valoración cardiológica vigente."
                    value={clinicalNotes}
                    onChange={(e) => setClinicalNotes(e.target.value)}
                    className="rounded-xl text-xs bg-gray-50 dark:bg-[#141414] border-gray-200 dark:border-gray-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    Nota al Pie del Documento
                  </label>
                  <Input
                    placeholder="Ej. Favor de presentar esta cotización en recepción el día del ingreso."
                    value={footerCustomNote}
                    onChange={(e) => setFooterCustomNote(e.target.value)}
                    className="rounded-xl text-xs bg-gray-50 dark:bg-[#141414] border-gray-200 dark:border-gray-800 h-10"
                  />
                </div>
              </div>

              <div className="sm:col-span-5 p-5 rounded-2xl bg-gray-50 dark:bg-[#141414] border border-gray-200/80 dark:border-gray-800 space-y-3 flex flex-col justify-between shadow-2xs">
                <h4 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white">
                  Resumen Económico
                </h4>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-gray-500">
                    <span>Subtotal Bruto:</span>
                    <span className="font-mono font-bold">${subtotal.toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between font-bold" style={{ color: accentColor }}>
                      <span>Descuento Comercial:</span>
                      <span className="font-mono">-${discountAmount.toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-500">
                    <span>IVA (Art. 15 Fracc. XIV LIVA):</span>
                    <span className="font-mono font-bold" style={{ color: accentColor }}>EXENTO (0%)</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-200 dark:border-gray-800 flex items-baseline justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white">
                    Total a Pagar:
                  </span>
                  <span className="text-2xl font-black font-mono" style={{ color: accentColor }}>
                    ${total.toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* COLUMNA DE PREVISUALIZACIÓN EN VIVO (SPLIT VIEW) */}
          {viewMode === "split" && (
            <div className="hidden lg:block lg:col-span-5 sticky top-6">
              {renderOfficialLetterhead()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
