"use client";

import React, { useState } from "react";
import { Sparkles, AlertTriangle, Check, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SoapNotes } from "@/types/ehr";

export interface SoapNoteDraftModalProps {
  isOpen: boolean;
  onClose: () => void;
  draftSoap: SoapNotes;
  onAccept: (editedSoap: SoapNotes) => void;
  onReject: () => void;
  patientName?: string;
}

export const SoapNoteDraftModal: React.FC<SoapNoteDraftModalProps> = ({
  isOpen,
  onClose,
  draftSoap,
  onAccept,
  onReject,
  patientName,
}) => {
  const [editedSoap, setEditedSoap] = useState<SoapNotes>(draftSoap);

  const handleChange = (field: keyof SoapNotes, value: string) => {
    setEditedSoap((prev) => ({ ...prev, [field]: value }));
  };

  const handleConfirm = () => {
    onAccept(editedSoap);
    onClose();
  };

  const handleDiscard = () => {
    onReject();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 p-6 rounded-3xl font-sans">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </span>
            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
              Borrador Clínico Sugerido — Health OS Copilot
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-gray-500">
            {patientName ? `Paciente: ${patientName}` : "Borrador preliminar generado por IA a partir del motivo de consulta"}
          </DialogDescription>
        </DialogHeader>

        {/* ── BANNER DE CUMPLIMIENTO REGULATORIO ── */}
        <div
          data-testid="ai-soap-suggestion-banner"
          className="rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-4 text-amber-800 dark:text-amber-300 text-xs font-semibold flex items-start gap-3 my-3"
        >
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">
              ⚠️ Sugerencia de Copiloto IA — Sujeto a revisión, edición y firma del médico responsable (NOM-004-SSA3-2012 / NOM-024-SSA3-2012)
            </p>
            <p className="text-[11px] font-normal text-amber-700/80 dark:text-amber-400/80">
              La inteligencia artificial actúa exclusivamente como asistente de redacción clínica y no emite diagnósticos concluyentes ni sustituye el criterio médico independiente.
            </p>
          </div>
        </div>

        {/* ── SECCIONES EDITABLES SOAP ── */}
        <div className="space-y-4 my-2">
          <div>
            <label className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2 mb-1">
              <span className="w-5 h-5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[11px] font-bold flex items-center justify-center">S</span>
              Subjetivo (Motivo de consulta y síntomas)
            </label>
            <Textarea
              data-testid="soap-subjective-input"
              value={editedSoap.subjective}
              onChange={(e) => handleChange("subjective", e.target.value)}
              className="text-xs rounded-xl"
              rows={3}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2 mb-1">
              <span className="w-5 h-5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[11px] font-bold flex items-center justify-center">O</span>
              Objetivo (Signos y hallazgos)
            </label>
            <Textarea
              data-testid="soap-objective-input"
              value={editedSoap.objective}
              onChange={(e) => handleChange("objective", e.target.value)}
              className="text-xs rounded-xl"
              rows={3}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2 mb-1">
              <span className="w-5 h-5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[11px] font-bold flex items-center justify-center">A</span>
              Análisis (Diagnóstico preliminar)
            </label>
            <Textarea
              data-testid="soap-assessment-input"
              value={editedSoap.assessment}
              onChange={(e) => handleChange("assessment", e.target.value)}
              className="text-xs rounded-xl"
              rows={3}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2 mb-1">
              <span className="w-5 h-5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[11px] font-bold flex items-center justify-center">P</span>
              Plan (Tratamiento y seguimiento)
            </label>
            <Textarea
              data-testid="soap-plan-input"
              value={editedSoap.plan}
              onChange={(e) => handleChange("plan", e.target.value)}
              className="text-xs rounded-xl"
              rows={3}
            />
          </div>
        </div>

        {/* ── BOTONES DE ACCIÓN ── */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
          <Button
            type="button"
            data-testid="ai-soap-reject-btn"
            variant="outline"
            onClick={handleDiscard}
            className="rounded-xl text-xs font-bold border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
          >
            <X className="w-4 h-4 mr-1.5" />
            Descartar Sugerencia
          </Button>

          <Button
            type="button"
            data-testid="ai-soap-accept-btn"
            onClick={handleConfirm}
            className="rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Check className="w-4 h-4 mr-1.5" />
            Aceptar e Insertar en Expediente
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
