"use client";

/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-doctor/button-has-type */

import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
  Plus,
  Trash2,
  Calendar as CalendarIcon,
  Sparkles,
  FileText,
  Calculator,
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
  BriefcaseMedical,
  Phone,
  Mail,
  Receipt,
  FileCheck,
} from "lucide-react";
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

interface CreatePatientBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ITEM_TYPES: { id: PatientBudgetItemType; label: string }[] = [
  { id: "SURGEON_FEE", label: "Honorarios Cirujano / Especialista" },
  { id: "ANESTHESIOLOGIST_FEE", label: "Honorarios Anestesiólogo" },
  { id: "ASSISTANT_FEE", label: "Honorarios Primer Ayudante" },
  { id: "OR_ROOM", label: "Renta de Quirófano / Sala" },
  { id: "HOSPITAL_STAY", label: "Estancia / Habitación Hospitalaria" },
  { id: "SUPPLY", label: "Material de Curación / Prótesis" },
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

export function CreatePatientBudgetModal({
  isOpen,
  onClose,
  onSuccess,
}: CreatePatientBudgetModalProps) {
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
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
  const [diagnosisName, setDiagnosisName] = useState("");
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
    if (!isOpen) return;

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
  }, [isOpen]);

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
    setDiagnosisName(item.name);
    setCie10SearchQuery("");
    setCie10SearchResults([]);
    toast.success(`Diagnóstico "${item.code} - ${item.name}" seleccionado.`);
  };

  const handleSelectCatalogService = (srv: CatalogItemDTO) => {
    setProcedureName(srv.name);
    setItems((prev) => [
      ...prev,
      {
        itemType: "SURGEON_FEE",
        description: srv.name,
        quantity: 1,
        unitPrice: srv.price || 0,
        notes: srv.description || "",
      },
    ]);
    toast.success(`Procedimiento "${srv.name}" añadido.`);
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

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Error al crear presupuesto:", err);
      toast.error(err.response?.data?.message || "No se pudo crear la cotización.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-full max-h-[94vh] overflow-y-auto font-sans p-6 sm:p-10 bg-white dark:bg-[#0c0c0c] border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white shadow-2xl rounded-3xl opacity-100">
        
        {/* ── HEADER Y TABS DE MODO ─────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-gray-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <Calculator className="w-5 h-5" />
              <span className="text-xs font-extrabold uppercase tracking-wider">
                Módulo de Cotizaciones Quirúrgicas & Tratamientos
              </span>
            </div>
            <DialogTitle className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              {activeTab === "edit" ? "Elaborar Presupuesto Clínico" : "Previsualización del Documento Oficial"}
            </DialogTitle>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-gray-100 dark:bg-[#141414] border border-gray-200/80 dark:border-gray-800 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab("edit")}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer",
                activeTab === "edit"
                  ? "bg-white dark:bg-[#202020] text-gray-900 dark:text-white shadow-xs"
                  : "text-gray-500 hover:text-gray-900"
              )}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edición</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("preview")}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer",
                activeTab === "preview"
                  ? "bg-white dark:bg-[#202020] text-gray-900 dark:text-white shadow-xs"
                  : "text-gray-500 hover:text-gray-900"
              )}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Previsualizar</span>
            </button>
          </div>
        </div>

        {/* ── MODO 1: EDICIÓN COMPLETA ───────────────────────────────── */}
        {activeTab === "edit" ? (
          <div className="space-y-6 pt-2">
            {/* Plantillas Rápidas */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Plantillas Quirúrgicas Rápidas:</span>
              </label>
              <div className="flex flex-wrap gap-2">
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

            {/* SECCIÓN 1: PACIENTE Y DIAGNÓSTICO */}
            <div className="p-5 rounded-3xl bg-gray-50/60 dark:bg-[#111] border border-gray-200/80 dark:border-gray-800 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-1.5">
                <User className="w-4 h-4 text-emerald-600" />
                <span>1. Datos del Paciente & Diagnóstico CIE-10</span>
              </h3>

              {/* Búsqueda en Directorio de Pacientes */}
              <div className="space-y-1 relative">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center justify-between">
                  <span>Buscar Paciente en QuHealthy (o captura libre)</span>
                  {selectedPatientId && (
                    <span className="text-[11px] font-bold text-emerald-600">✓ Paciente Vinculado</span>
                  )}
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por nombre, teléfono o correo..."
                    value={patientSearchQuery}
                    onChange={(e) => setPatientSearchQuery(e.target.value)}
                    className="pl-9 rounded-xl bg-white dark:bg-[#161616] text-xs h-10"
                  />
                  {isSearchingPatient && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />
                  )}
                </div>

                {/* Dropdown de Resultados de Pacientes */}
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

              {/* Campos manuales / confirmados */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    Nombre Completo del Paciente *
                  </label>
                  <Input
                    placeholder="Ej. María Elena Torres"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="rounded-xl bg-white dark:bg-[#161616] text-xs h-10"
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
                    className="rounded-xl bg-white dark:bg-[#161616] text-xs h-10"
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
                    className="rounded-xl bg-white dark:bg-[#161616] text-xs h-10"
                  />
                </div>
              </div>

              {/* Procedimiento y CIE-10 */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                <div className="sm:col-span-7 space-y-1">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    Procedimiento o Cirugía *
                  </label>
                  <Input
                    placeholder="Ej. Colecistectomía Laparoscópica + Exploración de Vías Biliares"
                    value={procedureName}
                    onChange={(e) => setProcedureName(e.target.value)}
                    className="rounded-xl bg-white dark:bg-[#161616] text-xs h-10"
                  />
                </div>

                {/* Buscador CIE-10 */}
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
                      placeholder="Buscar código o nombre (ej. Catarata, K80, Hernia)..."
                      value={cie10SearchQuery}
                      onChange={(e) => setCie10SearchQuery(e.target.value)}
                      className="pl-9 rounded-xl bg-white dark:bg-[#161616] text-xs h-10"
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

            {/* SECCIÓN 2: DESGLOSE DE CONCEPTOS / PARTIDAS */}
            <div className="p-5 rounded-3xl bg-gray-50/60 dark:bg-[#111] border border-gray-200/80 dark:border-gray-800 space-y-4">
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
                    className="p-3.5 rounded-2xl bg-white dark:bg-[#161616] border border-gray-200/80 dark:border-gray-800 grid grid-cols-12 gap-3 items-center shadow-2xs"
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
                        <SelectTrigger className="h-10 text-xs rounded-xl bg-gray-50 dark:bg-[#121212] border-gray-200 dark:border-gray-800">
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
                        className="h-10 text-xs rounded-xl bg-gray-50 dark:bg-[#121212]"
                      />
                    </div>

                    <div className="col-span-4 sm:col-span-1 space-y-1">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Cant.</span>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, "quantity", e.target.value)}
                        className="h-10 text-xs text-center rounded-xl bg-gray-50 dark:bg-[#121212] font-mono"
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
                        className="h-10 text-xs text-right rounded-xl bg-gray-50 dark:bg-[#121212] font-mono font-bold"
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

            {/* SECCIÓN 3: VIGENCIA, DESCUENTO Y TOTALES */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 p-5 rounded-3xl bg-gray-50/60 dark:bg-[#111] border border-gray-200/80 dark:border-gray-800">
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
                      className="rounded-xl text-xs h-10 bg-white dark:bg-[#161616]"
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
                      className="rounded-xl text-xs font-mono font-bold h-10 bg-white dark:bg-[#161616]"
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
                    className="rounded-xl text-xs bg-white dark:bg-[#161616]"
                  />
                </div>
              </div>

              <div className="sm:col-span-5 p-5 rounded-2xl bg-white dark:bg-[#161616] border border-gray-200/80 dark:border-gray-800 space-y-3 flex flex-col justify-between shadow-2xs">
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
                      <span>Descuento Aplicado:</span>
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
        ) : (
          /* ── MODO 2: PREVISUALIZACIÓN EN VIVO DE HOJA MEMBRETADA ──────── */
          <div className="space-y-6 p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0f0f0f] border border-gray-200 dark:border-gray-800 shadow-sm text-gray-900 dark:text-white">
            {/* Membrete del Médico / Clínica */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-gray-200 dark:border-gray-800">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-extrabold border border-emerald-200">
                  <FileText className="w-3.5 h-3.5" />
                  <span>COTIZACIÓN MÉDICA & QUIRÚRGICA</span>
                </div>
                <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                  {doctorStatus?.firstName ? `Dr(a). ${doctorStatus.firstName}` : (doctorProfile?.businessName || "Consultorio Médico Especializado")}
                </h2>
                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 font-medium">
                  {doctorStatus?.professionalLicenses && doctorStatus.professionalLicenses.length > 0 && (
                    <span className="flex items-center gap-1 font-bold text-gray-700 dark:text-gray-300">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>
                        Cédula Profesional: {doctorStatus.professionalLicenses[0].licenseNumber} (
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
                <span className="font-mono font-black text-sm text-gray-900 dark:text-white">PR-2026-PREVIEW</span>
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

            {/* Tabla de Conceptos */}
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 dark:bg-[#181818] text-gray-500 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Concepto</th>
                    <th className="p-3 text-center">Cant.</th>
                    <th className="p-3 text-right">P. Unitario</th>
                    <th className="p-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="p-3">
                        <span className="font-bold block">{it.description || "Concepto sin descripción"}</span>
                        <span className="text-[10px] text-gray-400 uppercase">{it.itemType.replace("_", " ")}</span>
                      </td>
                      <td className="p-3 text-center font-mono">{it.quantity}</td>
                      <td className="p-3 text-right font-mono">${(Number(it.unitPrice) || 0).toLocaleString("es-MX", { minimumFractionDigits: 2 })}</td>
                      <td className="p-3 text-right font-mono font-bold">
                        ${((Number(it.quantity) || 1) * (Number(it.unitPrice) || 0)).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totales */}
            <div className="flex justify-end pt-2">
              <div className="w-72 space-y-2 text-xs p-4 rounded-2xl bg-gray-50 dark:bg-[#181818] border border-gray-200 dark:border-gray-800">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal:</span>
                  <span className="font-mono font-bold">${subtotal.toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Descuento:</span>
                    <span className="font-mono">-${discountAmount.toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-500">
                  <span>IVA Exento (Art. 15 LIVA):</span>
                  <span className="font-mono text-emerald-600 font-bold">$0.00</span>
                </div>
                <div className="pt-2 border-t border-gray-200 dark:border-gray-800 flex justify-between items-baseline">
                  <span className="font-black uppercase text-[10px]">Total a Pagar:</span>
                  <span className="text-xl font-black font-mono text-emerald-600">
                    ${total.toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── FOOTER DE ACCIONES ─────────────────────────────────────── */}
        <DialogFooter className="pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-xl"
          >
            Cancelar
          </Button>

          <Button
            type="button"
            variant="secondary"
            onClick={() => handleSubmit(false)}
            disabled={isSubmitting}
            className="rounded-xl font-bold"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Guardar Borrador"}
          </Button>

          <Button
            type="button"
            onClick={() => handleSubmit(true)}
            disabled={isSubmitting}
            className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2 shadow-md shadow-emerald-600/20 cursor-pointer"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Crear y Enviar al Paciente</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
