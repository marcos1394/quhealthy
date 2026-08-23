"use client";

/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-doctor/button-has-type */

import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { ProfileResponse } from "@/types/onboarding";
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

  // Datos del Doctor / Perfil Emisor
  const [doctorProfile, setDoctorProfile] = useState<ProfileResponse | null>(null);
  const [doctorStatus, setDoctorStatus] = useState<any>(null);

  // Catálogo de Servicios del Doctor
  const [catalogItems, setCatalogItems] = useState<CatalogItemDTO[]>([]);

  // Búsqueda de Pacientes de QuHealthy
  const [patientSearchQuery, setPatientSearchQuery] = useState("");
  const [patientSearchResults, setPatientSearchResults] = useState<PatientDirectorySearchResult[]>([]);
  const [isSearchingPatient, setIsSearchingPatient] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<number | undefined>();

  // Búsqueda CIE-10
  const [cie10SearchQuery, setCie10SearchQuery] = useState("");
  const [cie10SearchResults, setCie10SearchResults] = useState<any[]>([]);
  const [isSearchingCie10, setIsSearchingCie10] = useState(false);

  // Form State
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

  // Carga inicial del perfil del doctor y catálogo de servicios
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
          setDoctorStatus(statusRes.value);
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

  // Búsqueda de Pacientes en QuHealthy
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
      } catch (err) {
        console.error("Error searching patients:", err);
      } finally {
        setIsSearchingPatient(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [patientSearchQuery]);

  // Búsqueda CIE-10 en tiempo real
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
        } else {
          setCie10SearchResults([]);
        }
      } catch (err) {
        console.error("Error searching CIE10:", err);
      } finally {
        setIsSearchingCie10(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [cie10SearchQuery]);

  const handleSelectPatient = (p: PatientDirectorySearchResult) => {
    const fullName = `${p.firstName || ""} ${p.lastName || ""}`.trim();
    setSelectedPatientId(p.id);
    setPatientName(fullName);
    setPatientEmail(p.email || "");
    setPatientPhone(p.phone || "");
    setPatientSearchQuery("");
    setPatientSearchResults([]);
    toast.success(`Paciente "${fullName}" seleccionado.`);
  };

  const handleSelectCie10 = (item: { code: string; name: string }) => {
    setDiagnosisCie10(item.code);
    setCie10SearchQuery("");
    setCie10SearchResults([]);
    toast.success(`Diagnóstico "${item.code} - ${item.name}" seleccionado.`);
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

  /* Render de la Hoja Membretada (Usado en Preview y Split View) */
  const renderOfficialLetterhead = () => (
    <div className="space-y-6 p-6 sm:p-10 rounded-3xl bg-white dark:bg-[#0c0c0c] border border-gray-200 dark:border-gray-800 shadow-sm text-gray-900 dark:text-white">
      {/* Membrete Oficial */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-gray-200 dark:border-gray-800">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-extrabold border border-emerald-200">
            <FileText className="w-3.5 h-3.5" />
            <span>COTIZACIÓN CLÍNICA & QUIRÚRGICA</span>
          </div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            {doctorStatus?.firstName ? `Dr(a). ${doctorStatus.firstName}` : (doctorProfile?.businessName || "Consultorio Médico Especializado")}
          </h2>
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 font-medium">
            {doctorStatus?.professionalLicenses && doctorStatus.professionalLicenses.length > 0 && (
              <span className="flex items-center gap-1 font-bold text-gray-700 dark:text-gray-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
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
            {doctorProfile?.contactPhone && <span>• {doctorProfile.contactPhone}</span>}
            {doctorProfile?.address && <span>• {doctorProfile.address}</span>}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#181818] border border-gray-200 dark:border-gray-800 text-right shrink-0">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Folio Proyectado</span>
          <span className="font-mono font-black text-base text-gray-900 dark:text-white">PR-2026-NUEVO</span>
          <span className="text-[10px] text-gray-400 block">Vigencia: {validUntilDate.toLocaleDateString("es-MX")}</span>
        </div>
      </div>

      {/* Datos del Paciente */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-gray-50/60 dark:bg-[#141414] border border-gray-100 dark:border-gray-800 text-xs">
        <div>
          <span className="text-gray-400 font-bold uppercase text-[10px] block">Paciente</span>
          <span className="font-extrabold text-gray-900 dark:text-white text-sm">{patientName || "Nombre del Paciente"}</span>
        </div>
        <div>
          <span className="text-gray-400 font-bold uppercase text-[10px] block">Procedimiento</span>
          <span className="font-bold text-gray-800 dark:text-gray-200">{procedureName || "Sin procedimiento especificado"}</span>
        </div>
        <div>
          <span className="text-gray-400 font-bold uppercase text-[10px] block">Diagnóstico CIE-10</span>
          <span className="font-mono font-bold text-emerald-600">{diagnosisCie10 || "N/A"}</span>
        </div>
      </div>

      {/* Tabla de Partidas */}
      <div className="space-y-2">
        <h3 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white">
          Desglose de Conceptos Médicos & Hospitalarios
        </h3>
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 dark:bg-[#181818] text-gray-500 font-bold uppercase text-[10px] border-b border-gray-200 dark:border-gray-800">
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

        <div className="w-full sm:w-80 space-y-2 text-xs p-5 rounded-2xl bg-gray-50 dark:bg-[#181818] border border-gray-200 dark:border-gray-800 shrink-0">
          <div className="flex justify-between text-gray-500">
            <span>Subtotal Bruto:</span>
            <span className="font-mono font-bold">${subtotal.toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-emerald-600 font-bold">
              <span>Descuento Comercial:</span>
              <span className="font-mono">-${discountAmount.toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN</span>
            </div>
          )}
          <div className="flex justify-between text-gray-500">
            <span>IVA Exento (Art. 15 Fracc. XIV LIVA):</span>
            <span className="font-mono text-emerald-600 font-bold">$0.00 (0%)</span>
          </div>
          <div className="pt-2 border-t border-gray-200 dark:border-gray-800 flex justify-between items-baseline">
            <span className="font-black uppercase text-[10px] text-gray-900 dark:text-white">Total a Pagar:</span>
            <span className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
              ${total.toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN
            </span>
          </div>
        </div>
      </div>

      {/* Pie de Documento con Área de Firma */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Documento Clínico Cifrado QuHealthy Engine</span>
        </div>
        <div className="border-b border-dashed border-gray-400 w-48 text-center text-[10px] pb-1">
          Espacio para Firma del Paciente
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
            <span className="text-emerald-600 dark:text-emerald-400">Nueva Cotización</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            Elaborar Presupuesto Clínico & Quirúrgico
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-2xl">
            Cotiza procedimientos médicos con desglose transparente de honorarios, renta de quirófano e insumos, listo para compartir y firmar digitalmente.
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
            className="h-10 px-4 rounded-xl text-xs font-bold gap-1.5"
          >
            {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>Guardar Borrador</span>
          </Button>

          <Button
            type="button"
            onClick={() => handleSubmit(true)}
            disabled={isSubmitting}
            className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer"
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
            
            {/* 1. Plantillas Quirúrgicas Rápidas */}
            <div className="p-5 rounded-3xl bg-white dark:bg-[#0c0c0c] border border-gray-200/80 dark:border-gray-800 space-y-2 shadow-xs">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Cargar desde Plantilla Quirúrgica Preconfigurada:</span>
              </label>
              <div className="flex flex-wrap gap-2 pt-1">
                {TEMPLATES.map((tpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyTemplate(tpl)}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <span>{tpl.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Sección: Paciente & Diagnóstico CIE-10 */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0c0c0c] border border-gray-200/80 dark:border-gray-800 space-y-4 shadow-xs">
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-1.5">
                <User className="w-4 h-4 text-emerald-600" />
                <span>1. Información del Paciente & Diagnóstico</span>
              </h3>

              {/* Buscador de Pacientes en QuHealthy */}
              <div className="space-y-1 relative">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center justify-between">
                  <span>Buscar Paciente en Directorio QuHealthy (o captura libre)</span>
                  {selectedPatientId && (
                    <span className="text-[11px] font-bold text-emerald-600">✓ Paciente Registrado Vinculado</span>
                  )}
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Escribe el nombre, teléfono o correo del paciente..."
                    value={patientSearchQuery}
                    onChange={(e) => setPatientSearchQuery(e.target.value)}
                    className="pl-9 rounded-xl bg-gray-50 dark:bg-[#141414] text-xs h-10"
                  />
                  {isSearchingPatient && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />
                  )}
                </div>

                {/* Dropdown Resultados de Paciente */}
                {patientSearchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white dark:bg-[#161616] border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl max-h-48 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
                    {patientSearchResults.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => handleSelectPatient(p)}
                        className="p-3 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 cursor-pointer flex items-center justify-between transition-colors"
                      >
                        <div>
                          <span className="font-bold text-xs text-gray-900 dark:text-white block">
                            {p.firstName} {p.lastName}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {p.email || p.phone || "Sin datos de contacto"}
                          </span>
                        </div>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Datos de Contacto del Paciente */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    Nombre del Paciente *
                  </label>
                  <Input
                    placeholder="Ej. María Elena Torres"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="rounded-xl bg-gray-50 dark:bg-[#141414] text-xs h-10"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    Correo Electrónico
                  </label>
                  <Input
                    type="email"
                    placeholder="paciente@correo.com"
                    value={patientEmail}
                    onChange={(e) => setPatientEmail(e.target.value)}
                    className="rounded-xl bg-gray-50 dark:bg-[#141414] text-xs h-10"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    Teléfono / WhatsApp
                  </label>
                  <Input
                    placeholder="+52 55 1234 5678"
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    className="rounded-xl bg-gray-50 dark:bg-[#141414] text-xs h-10"
                  />
                </div>
              </div>

              {/* Procedimiento & Buscador CIE-10 */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                <div className="sm:col-span-7 space-y-1">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    Procedimiento o Cirugía *
                  </label>
                  <Input
                    placeholder="Ej. Colecistectomía Laparoscópica + Exploración de Vías Biliares"
                    value={procedureName}
                    onChange={(e) => setProcedureName(e.target.value)}
                    className="rounded-xl bg-gray-50 dark:bg-[#141414] text-xs h-10"
                  />
                </div>

                <div className="sm:col-span-5 space-y-1 relative">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center justify-between">
                    <span>Diagnóstico CIE-10</span>
                    {diagnosisCie10 && (
                      <span className="font-mono text-emerald-600 font-bold">{diagnosisCie10}</span>
                    )}
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Buscar código o condición (ej. Catarata, K80)..."
                      value={cie10SearchQuery}
                      onChange={(e) => setCie10SearchQuery(e.target.value)}
                      className="pl-9 rounded-xl bg-gray-50 dark:bg-[#141414] text-xs h-10"
                    />
                    {isSearchingCie10 && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />
                    )}
                  </div>

                  {/* Dropdown CIE-10 */}
                  {cie10SearchResults.length > 0 && (
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
                  <Activity className="w-4 h-4 text-emerald-600" />
                  <span>2. Desglose de Partidas (Honorarios, Quirófano, Insumos)</span>
                </h3>

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleAddItem}
                  className="rounded-xl text-xs font-bold gap-1 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Agregar Concepto</span>
                </Button>
              </div>

              <div className="space-y-3">
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-gray-50/70 dark:bg-[#141414] border border-gray-200/80 dark:border-gray-800 grid grid-cols-12 gap-3 items-center"
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
                        className="h-10 text-xs rounded-xl bg-white dark:bg-[#1a1a1a]"
                      />
                    </div>

                    <div className="col-span-4 sm:col-span-1 space-y-1">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Cant.</span>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, "quantity", e.target.value)}
                        className="h-10 text-xs text-center rounded-xl bg-white dark:bg-[#1a1a1a] font-mono"
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
                        className="h-10 text-xs text-right rounded-xl bg-white dark:bg-[#1a1a1a] font-mono font-bold"
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
                      <CalendarIcon className="w-3.5 h-3.5 text-emerald-600" />
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
                      className="rounded-xl text-xs font-mono font-bold h-10 bg-gray-50 dark:bg-[#141414]"
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
                    className="rounded-xl text-xs bg-gray-50 dark:bg-[#141414]"
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
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>Descuento Comercial:</span>
                      <span className="font-mono">-${discountAmount.toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-500">
                    <span>IVA (Art. 15 Fracc. XIV LIVA):</span>
                    <span className="font-mono text-emerald-600 font-bold">EXENTO (0%)</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-200 dark:border-gray-800 flex items-baseline justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white">
                    Total a Pagar:
                  </span>
                  <span className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
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
