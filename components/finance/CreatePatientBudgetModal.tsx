"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useState } from "react";
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
  Plus,
  Trash2,
  Calendar,
  Sparkles,
  FileText,
  Calculator,
  User,
  Activity,
  CheckCircle2,
  DollarSign,
  Loader2,
} from "lucide-react";
import {
  CreatePatientBudgetDTO,
  PatientBudgetItemDTO,
  PatientBudgetItemType,
} from "@/types/clinical-budget";
import { clinicalBudgetService } from "@/services/clinical-budget.service";
import { toast } from "sonner";

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [patientName, setPatientName] = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [diagnosisCie10, setDiagnosisCie10] = useState("");
  const [procedureName, setProcedureName] = useState("");
  const [clinicalNotes, setClinicalNotes] = useState("");
  const [validUntil, setValidUntil] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
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
        patientName,
        patientEmail: patientEmail.trim() || undefined,
        patientPhone: patientPhone.trim() || undefined,
        diagnosisCie10: diagnosisCie10.trim() || undefined,
        procedureName,
        clinicalNotes: clinicalNotes.trim() || undefined,
        validUntil,
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
        toast.success(`Presupuesto ${created.folio} creado y enviado al paciente.`);
      } else {
        toast.success(`Presupuesto ${created.folio} guardado como borrador.`);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Error al crear presupuesto:", err);
      toast.error(err.response?.data?.message || "No se pudo crear el presupuesto.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto font-sans p-6 sm:p-8 bg-white dark:bg-[#0c0c0c] border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white shadow-2xl rounded-3xl opacity-100">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <Calculator className="w-5 h-5" />
            <span className="text-xs font-extrabold uppercase tracking-wider">
              Módulo de Cotizaciones Clínicas
            </span>
          </div>
          <DialogTitle className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            Crear Presupuesto Quirúrgico o de Tratamiento
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-gray-500">
            Elabora una cotización formal y desglosada para tu paciente con vigencia, honorarios y firma de aceptación digital.
          </DialogDescription>
        </DialogHeader>

        {/* ── PLANTILLAS RÁPIDAS ─────────────────────────────────────── */}
        <div className="space-y-2 pt-2">
          <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Cargar desde Plantilla Quirúrgica Preconfigurada:</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {TEMPLATES.map((tpl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyTemplate(tpl)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>{tpl.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── SECCIÓN 1: DATOS DEL PACIENTE Y PROCEDIMIENTO ──────────── */}
        <div className="space-y-4 pt-2 border-t border-gray-100 dark:border-gray-800">
          <h3 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-1.5">
            <User className="w-4 h-4 text-emerald-600" />
            <span>1. Información del Paciente & Diagnóstico</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1 space-y-1">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                Nombre del Paciente *
              </label>
              <Input
                placeholder="Ej. María Elena Torres"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="rounded-xl"
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
                className="rounded-xl"
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
                className="rounded-xl"
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                Procedimiento o Plan de Tratamiento *
              </label>
              <Input
                placeholder="Ej. Artroscopia de Rodilla Derecha + Plastia de Ligamento"
                value={procedureName}
                onChange={(e) => setProcedureName(e.target.value)}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                Código CIE-10 (Opcional)
              </label>
              <Input
                placeholder="Ej. M23.2"
                value={diagnosisCie10}
                onChange={(e) => setDiagnosisCie10(e.target.value)}
                className="rounded-xl font-mono uppercase"
              />
            </div>
          </div>
        </div>

        {/* ── SECCIÓN 2: DESGLOSE DE CONCEPTOS / PARTIDAS ────────────── */}
        <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
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
                className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#111] border border-gray-200/80 dark:border-gray-800 grid grid-cols-12 gap-3 items-center"
              >
                <div className="col-span-12 sm:col-span-4 space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">
                    Tipo de Concepto
                  </span>
                  <select
                    value={item.itemType}
                    onChange={(e) =>
                      handleItemChange(idx, "itemType", e.target.value as PatientBudgetItemType)
                    }
                    className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#181818] text-xs font-semibold text-gray-900 dark:text-white focus:outline-emerald-600"
                  >
                    {ITEM_TYPES.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-12 sm:col-span-4 space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">
                    Descripción del Concepto
                  </span>
                  <Input
                    placeholder="Descripción detallada"
                    value={item.description}
                    onChange={(e) => handleItemChange(idx, "description", e.target.value)}
                    className="h-10 text-xs rounded-xl bg-white dark:bg-[#181818]"
                  />
                </div>

                <div className="col-span-4 sm:col-span-1 space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Cant.</span>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(idx, "quantity", e.target.value)}
                    className="h-10 text-xs text-center rounded-xl bg-white dark:bg-[#181818] font-mono"
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
                    className="h-10 text-xs text-right rounded-xl bg-white dark:bg-[#181818] font-mono font-bold"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1 flex items-center justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(idx)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── SECCIÓN 3: VIGENCIA, NOTAS Y RESUMEN FINANCIERO ────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 pt-4 border-t border-gray-100 dark:border-gray-800">
          <div className="sm:col-span-7 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Vigencia de la Cotización *</span>
                </label>
                <Input
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                  className="rounded-xl text-xs font-mono"
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
                  className="rounded-xl text-xs font-mono font-bold"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                Indicaciones Clínicas / Notas para el Paciente
              </label>
              <Textarea
                rows={3}
                placeholder="Ej. Requiere ayuno de 8 horas previo a cirugía y valoración cardiológica vigente."
                value={clinicalNotes}
                onChange={(e) => setClinicalNotes(e.target.value)}
                className="rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="sm:col-span-5 p-5 rounded-2xl bg-gray-50 dark:bg-[#121212] border border-gray-200/80 dark:border-gray-800 space-y-3 flex flex-col justify-between">
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
            className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2 shadow-md shadow-emerald-600/20"
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
