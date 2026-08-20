"use client";

import React, { useState } from "react";
import { UsersRound, UserPlus, Shield, Key, Mail, Phone, CheckCircle2, X } from "lucide-react";
import { toast } from "react-toastify";

export default function FoundationTeamPage() {
  const [teamMembers, setTeamMembers] = useState([
    {
      id: 1,
      name: "Dra. Carolina Mendívil",
      email: "c.mendivil@fundacion.org",
      phone: "+52 668 111 2233",
      role: "MEDICAL_DIRECTOR",
      roleLabel: "Directora Médica",
      accessScope: "Acceso clínico autorizado (Health Data Sharing)",
      mfaStatus: "ACTIVE",
    },
    {
      id: 2,
      name: "Lic. Andrea Morales",
      email: "a.morales@fundacion.org",
      phone: "+52 668 222 3344",
      role: "SOCIAL_WORKER",
      roleLabel: "Trabajadora Social",
      accessScope: "Padrón de beneficiarios y estudios socioeconómicos",
      mfaStatus: "ACTIVE",
    },
    {
      id: 3,
      name: "Ing. Roberto Solís",
      email: "r.solis@fundacion.org",
      phone: "+52 668 333 4455",
      role: "PROGRAM_COORDINATOR",
      roleLabel: "Coordinador de Programas",
      accessScope: "Gestión de presupuestos y reglas de apoyo",
      mfaStatus: "ACTIVE",
    },
    {
      id: 4,
      name: "Lic. Fernando Gil",
      email: "f.gil@fundacion.org",
      phone: "+52 668 444 5566",
      role: "AUDITOR",
      roleLabel: "Auditor Interno",
      accessScope: "Trazabilidad, bitácora de apoyos y conciliación",
      mfaStatus: "ACTIVE",
    },
  ]);

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("SOCIAL_WORKER");

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.warning("Ingresa el nombre y correo del miembro.");
      return;
    }

    const roleMap: Record<string, { label: string; scope: string }> = {
      SOCIAL_WORKER: {
        label: "Trabajador(a) Social",
        scope: "Padrón de beneficiarios y estudios socioeconómicos",
      },
      PROGRAM_COORDINATOR: {
        label: "Coordinador(a) de Programa",
        scope: "Gestión de presupuestos y reglas de apoyo",
      },
      MEDICAL_DIRECTOR: {
        label: "Director(a) Médico(a)",
        scope: "Acceso clínico autorizado (Health Data Sharing)",
      },
      AUDITOR: {
        label: "Auditor(a)",
        scope: "Trazabilidad, bitácora de apoyos y conciliación",
      },
      VOLUNTEER: {
        label: "Voluntario(a)",
        scope: "Registro en jornadas y apoyo en campo",
      },
    };

    const newMember = {
      id: Date.now(),
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || "+52 668 000 0000",
      role,
      roleLabel: roleMap[role]?.label || role,
      accessScope: roleMap[role]?.scope || "Acceso estándar",
      mfaStatus: "INVITED",
    };

    setTeamMembers((prev) => [...prev, newMember]);
    toast.success("Invitación institucional enviada con requerimiento de MFA.");
    setIsInviteModalOpen(false);
    setName("");
    setEmail("");
    setPhone("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <UsersRound className="w-6 h-6 text-indigo-600" />
            Equipo Institucional & Control de Accesos (RBAC)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Principio de mínimo acceso necesario, segregación de funciones y autenticación MFA para usuarios institucionales.
          </p>
        </div>

        <button
          onClick={() => setIsInviteModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-md shadow-indigo-600/20 self-stretch sm:self-auto justify-center"
        >
          <UserPlus className="w-4 h-4" />
          Invitar Miembro al Equipo
        </button>
      </div>

      {/* Security Note Banner */}
      <div className="p-4 bg-slate-900 text-white rounded-2xl flex items-start gap-3 text-xs">
        <Shield className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-emerald-300">Segregación Estricta de Funciones (RBAC)</span>
          <p className="text-slate-300 leading-relaxed">
            Las <strong>Trabajadoras Sociales</strong> gestionan expedientes socioeconómicos sin acceso a notas clínicas reservadas; la <strong>Dirección Médica</strong> accede exclusivamente a estudios autorizados por el paciente; los <strong>Auditores</strong> verifican trazabilidad sin datos personales sensibles.
          </p>
        </div>
      </div>

      {/* Team Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="text-[11px] uppercase bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3.5 rounded-tl-xl">Nombre / Contacto</th>
                <th className="px-4 py-3.5">Rol Institucional</th>
                <th className="px-4 py-3.5">Alcance de Acceso (Principio de Mínimo Privilegio)</th>
                <th className="px-4 py-3.5 text-right rounded-tr-xl">MFA & Seguridad</th>
              </tr>
            </thead>
            <tbody>
              {teamMembers.map((member) => (
                <tr key={member.id} className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3.5">
                    <span className="font-bold text-slate-900 text-sm block">{member.name}</span>
                    <span className="text-[11px] text-slate-400 font-mono block">{member.email}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                      {member.roleLabel}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 max-w-sm">
                    <span className="text-slate-700 font-medium">{member.accessScope}</span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <Key className="w-3 h-3 text-emerald-600" />
                      MFA Activo
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🚀 Modal: Invitar Miembro */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Invitar Miembro Institucional</h3>
                <p className="text-xs text-slate-500">Se enviará invitación con enlace de verificación y MFA.</p>
              </div>
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInvite} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Lic. Laura Ramos"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Correo Institucional *</label>
                <input
                  type="email"
                  required
                  placeholder="l.ramos@fundacion.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Teléfono</label>
                <input
                  type="tel"
                  placeholder="+52 668 000 0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Rol & Perfil de Acceso *</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
                >
                  <option value="SOCIAL_WORKER">Trabajador(a) Social (Padrón & Vulnerabilidad)</option>
                  <option value="PROGRAM_COORDINATOR">Coordinador(a) de Programas & Presupuestos</option>
                  <option value="MEDICAL_DIRECTOR">Director(a) Médico(a) (Acceso Clínico Autorizado)</option>
                  <option value="AUDITOR">Auditor(a) (Trazabilidad & Conciliación)</option>
                  <option value="VOLUNTEER">Voluntario(a) (Jornadas en Campo)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-sm"
                >
                  Enviar Invitación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
