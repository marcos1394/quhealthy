"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/no-giant-component */

import React, { useState } from "react";
import { Users, Plus, Trash2, ArrowRight, ArrowLeft, Mail, Phone, UserCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FoundationRole, FoundationTeamInvitePayload, FoundationStaffMember } from "@/types/foundation";
import { QhSpinner } from "@/components/ui/QhSpinner";

interface Step3TeamProps {
  initialMembers?: FoundationStaffMember[];
  onSave: (data: FoundationTeamInvitePayload) => Promise<void>;
  onBack: () => void;
  isLoading?: boolean;
}

const ROLE_DEFINITIONS: { role: FoundationRole; label: string; desc: string }[] = [
  { role: "SOCIAL_WORKER", label: "Trabajador/a Social", desc: "Registro de beneficiarios y evaluación socioeconómica." },
  { role: "PROGRAM_COORDINATOR", label: "Coordinador/a de Programa", desc: "Gestión operativa de apoyos y convocatorias." },
  { role: "MEDICAL_DIRECTOR", label: "Director/a Médico / Asesor", desc: "Revisión clínica y aprobación médica de apoyos." },
  { role: "AUDITOR", label: "Patronato / Auditor", desc: "Supervisión de métricas, reportes y transparencia." },
  { role: "VOLUNTEER", label: "Voluntario/a", desc: "Apoyo en brigadas y captura de datos." },
];

export const Step3Team: React.FC<Step3TeamProps> = ({
  initialMembers = [],
  onSave,
  onBack,
  isLoading = false,
}) => {
  const [members, setMembers] = useState<FoundationTeamInvitePayload["members"]>(
    initialMembers.map((m) => ({
      name: m.name,
      email: m.email,
      phone: m.phone || "",
      role: m.role,
    }))
  );

  const [newMember, setNewMember] = useState({
    name: "",
    email: "",
    phone: "",
    role: "SOCIAL_WORKER" as FoundationRole,
  });

  const handleAddMember = () => {
    if (!newMember.name.trim() || !newMember.email.trim()) return;
    setMembers((prev) => [...prev, { ...newMember }]);
    setNewMember({
      name: "",
      email: "",
      phone: "",
      role: "SOCIAL_WORKER",
    });
  };

  const handleRemoveMember = (index: number) => {
    setMembers((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({ members });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto font-sans">
      {/* ── CARD 1: AGREGAR COLABORADOR ──────────────────────────────── */}
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-gray-800">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              Estructura Organizacional & Equipo
            </h2>
            <p className="text-xs text-gray-500">
              Invita a trabajadores sociales, coordinadores o directores médicos con roles segmentados.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 p-4 rounded-2xl bg-gray-50/50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800">
          <div className="sm:col-span-4 space-y-1.5">
            <label className="text-[11px] font-bold text-gray-800 dark:text-gray-200">Nombre Completo</label>
            <Input
              placeholder="Ej. Lic. Laura Gómez"
              value={newMember.name}
              onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
              className="bg-white dark:bg-[#0a0a0a] h-10 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-semibold"
            />
          </div>

          <div className="sm:col-span-4 space-y-1.5">
            <label className="text-[11px] font-bold text-gray-800 dark:text-gray-200">Correo Electrónico</label>
            <Input
              type="email"
              placeholder="laura@fundacion.org"
              value={newMember.email}
              onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
              className="bg-white dark:bg-[#0a0a0a] h-10 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-semibold"
            />
          </div>

          <div className="sm:col-span-4 space-y-1.5">
            <label className="text-[11px] font-bold text-gray-800 dark:text-gray-200">Rol Institucional</label>
            <Select
              value={newMember.role}
              onValueChange={(val: FoundationRole) => setNewMember({ ...newMember, role: val })}
            >
              <SelectTrigger className="bg-white dark:bg-[#0a0a0a] h-10 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-semibold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {ROLE_DEFINITIONS.map((r) => (
                  <SelectItem key={r.role} value={r.role} className="text-xs">
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="sm:col-span-12 flex justify-end pt-2">
            <button
              type="button"
              onClick={handleAddMember}
              disabled={!newMember.name.trim() || !newMember.email.trim()}
              className="h-10 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border-0"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar al Equipo</span>
            </button>
          </div>
        </div>

        {/* Lista de Miembros */}
        <div className="space-y-2.5">
          {members.length === 0 ? (
            <div className="py-8 text-center text-xs font-medium text-gray-400 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl bg-gray-50/30">
              Aún no has agregado colaboradores. Puedes invitar a tu equipo ahora o más tarde desde tu panel.
            </div>
          ) : (
            members.map((m, idx) => {
              const def = ROLE_DEFINITIONS.find((r) => r.role === m.role);
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 shadow-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white">{m.name}</h4>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold border border-emerald-200 dark:border-emerald-900/40">
                        {def?.label || m.role}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400">{m.email}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveMember(idx)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── BOTONES DE NAVEGACIÓN ────────────────────────────────────── */}
      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={onBack}
          className="h-12 px-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 text-xs font-bold transition-all shadow-xs flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a Legal & Fiscal</span>
        </button>

        <button
          type="submit"
          disabled={isLoading}
          className="h-12 px-8 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-2 cursor-pointer border-0"
        >
          {isLoading ? (
            <QhSpinner size="sm" className="text-white" />
          ) : (
            <>
              <span>Continuar a Configurar Programa</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </form>
  );
};
