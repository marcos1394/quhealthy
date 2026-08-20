"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Layers,
  HeartHandshake,
  Shield,
  Eye,
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
  Clock,
  Phone,
  Mail,
  MapPin,
  FolderOpen,
  FileCheck2,
  FilePlus,
  Check,
  Ban,
  AlertTriangle,
} from "lucide-react";
import { toast } from "react-toastify";
import { foundationService } from "@/services/foundation.service";
import {
  FoundationBeneficiary,
  FoundationProgram,
  BeneficiaryDocument,
  CreateBeneficiaryPayload,
  RequestDocumentPayload,
  ReviewDocumentPayload,
} from "@/types/foundation";

export default function FoundationBeneficiariesPage() {
  const searchParams = useSearchParams();
  const [beneficiaries, setBeneficiaries] = useState<FoundationBeneficiary[]>([]);
  const [programs, setPrograms] = useState<FoundationProgram[]>([]);
  const [beneficiaryDocs, setBeneficiaryDocs] = useState<BeneficiaryDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedVulnerability, setSelectedVulnerability] = useState("ALL");

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<FoundationBeneficiary | null>(null);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [isRequestDocModalOpen, setIsRequestDocModalOpen] = useState(false);
  const [selectedDocToReview, setSelectedDocToReview] = useState<BeneficiaryDocument | null>(null);

  // Form State (Create Beneficiary)
  const [curp, setCurp] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("MALE");
  const [birthDate, setBirthDate] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [vulnerabilityLevel, setVulnerabilityLevel] = useState("HIGH");
  const [socioEconomicLevel, setSocioEconomicLevel] = useState("D");
  const [city, setCity] = useState("Los Mochis");
  const [state, setState] = useState("Sinaloa");
  const [diagnosisSummary, setDiagnosisSummary] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedProgramIds, setSelectedProgramIds] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Enroll Form State
  const [enrollProgramId, setEnrollProgramId] = useState<number | null>(null);
  const [enrollSubsidyCap, setEnrollSubsidyCap] = useState<number>(5000);
  const [enrollNotes, setEnrollNotes] = useState("");

  // Request Document Form State
  const [docTypeToRequest, setDocTypeToRequest] = useState("SOCIOECONOMIC_STUDY");
  const [docTitleToRequest, setDocTitleToRequest] = useState("Estudio Socioeconómico 2026");

  // Review Document Form State
  const [reviewStatus, setReviewStatus] = useState<"APPROVED" | "OBSERVED" | "REJECTED">("APPROVED");
  const [reviewNotes, setReviewNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [benData, progData] = await Promise.all([
        foundationService.getBeneficiaries(undefined, "ALL", 0, 50),
        foundationService.getPrograms(),
      ]);
      setBeneficiaries(benData.content);
      setPrograms(progData);
      if (progData.length > 0) {
        setEnrollProgramId(progData[0].id);
      }
    } catch {
      toast.error("Error al cargar padrón de beneficiarios.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    if (searchParams?.get("action") === "new") {
      setIsCreateModalOpen(true);
    }
  }, [searchParams]);

  const loadBeneficiaryDocs = async (beneficiaryId: number) => {
    try {
      setIsLoadingDocs(true);
      const docs = await foundationService.getDocumentsByBeneficiary(beneficiaryId);
      setBeneficiaryDocs(docs);
    } catch {
      toast.error("Error al cargar expediente documental.");
    } finally {
      setIsLoadingDocs(false);
    }
  };

  const handleOpenExpediente = (b: FoundationBeneficiary) => {
    setSelectedBeneficiary(b);
    loadBeneficiaryDocs(b.id);
  };

  const handleCreateBeneficiary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!curp.trim() || curp.trim().length !== 18) {
      toast.warning("La CURP debe contener exactamente 18 caracteres.");
      return;
    }
    if (!firstName.trim() || !lastName.trim()) {
      toast.warning("Ingresa el nombre y apellidos completos.");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload: CreateBeneficiaryPayload = {
        curp: curp.trim().toUpperCase(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        gender,
        birthDate: birthDate || undefined,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        vulnerabilityLevel,
        socioEconomicLevel,
        city: city.trim(),
        state: state.trim(),
        diagnosisSummary: diagnosisSummary.trim(),
        notes: notes.trim(),
        programIdsToEnroll: selectedProgramIds,
      };

      await foundationService.createBeneficiary(payload);
      toast.success("Beneficiario registrado exitosamente en el padrón.");
      setIsCreateModalOpen(false);

      // Reset form
      setCurp("");
      setFirstName("");
      setLastName("");
      setDiagnosisSummary("");
      setNotes("");
      setSelectedProgramIds([]);
      loadData();
    } catch (err: any) {
      const msg = err.response?.data?.message || "No se pudo registrar al beneficiario.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEnrollBeneficiary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBeneficiary || !enrollProgramId) return;

    try {
      setIsSubmitting(true);
      await foundationService.enrollBeneficiary(
        selectedBeneficiary.id,
        enrollProgramId,
        enrollSubsidyCap,
        enrollNotes
      );
      toast.success("Beneficiario inscrito en el programa asistencial.");
      setIsEnrollModalOpen(false);
      loadData();
    } catch {
      toast.error("Error al inscribir beneficiario en el programa.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBeneficiary) return;

    try {
      setIsSubmitting(true);
      const payload: RequestDocumentPayload = {
        beneficiaryId: selectedBeneficiary.id,
        documentType: docTypeToRequest,
        title: docTitleToRequest.trim(),
      };
      await foundationService.requestDocument(payload);
      toast.success("Requerimiento documental solicitado con éxito.");
      setIsRequestDocModalOpen(false);
      loadBeneficiaryDocs(selectedBeneficiary.id);
    } catch {
      toast.error("No se pudo solicitar el documento.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReviewDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDocToReview || !selectedBeneficiary) return;

    try {
      setIsSubmitting(true);
      const payload: ReviewDocumentPayload = {
        verificationStatus: reviewStatus,
        rejectionReason: rejectionReason.trim() || undefined,
        reviewNotes: reviewNotes.trim() || undefined,
      };
      await foundationService.reviewDocument(selectedDocToReview.id, payload);
      toast.success(`Dictamen emitido: ${reviewStatus}`);
      setSelectedDocToReview(null);
      loadBeneficiaryDocs(selectedBeneficiary.id);
    } catch {
      toast.error("Error al emitir dictamen documental.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleProgramSelection = (pId: number) => {
    setSelectedProgramIds((prev) =>
      prev.includes(pId) ? prev.filter((id) => id !== pId) : [...prev, pId]
    );
  };

  const filteredBeneficiaries = beneficiaries.filter((b) => {
    const matchesSearch =
      b.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.curp.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.city && b.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (b.diagnosisSummary && b.diagnosisSummary.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = selectedStatus === "ALL" || b.status === selectedStatus;
    const matchesVuln = selectedVulnerability === "ALL" || b.vulnerabilityLevel === selectedVulnerability;

    return matchesSearch && matchesStatus && matchesVuln;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <Users className="w-6 h-6 text-indigo-600" />
            Padrón de Beneficiarios & Expedientes
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Registro, evaluación socioeconómica y validación documental (Trabajo Social & Dirección Médica).
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-md shadow-rose-600/20 self-stretch sm:self-auto justify-center"
        >
          <UserPlus className="w-4 h-4" />
          Registrar Beneficiario (Trabajo Social)
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por CURP, nombre, ciudad o diagnóstico..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedVulnerability}
            onChange={(e) => setSelectedVulnerability(e.target.value)}
            className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 text-slate-700 font-medium focus:outline-none"
          >
            <option value="ALL">Vulnerabilidad (Todas)</option>
            <option value="CRITICAL">Crítica</option>
            <option value="HIGH">Alta</option>
            <option value="MEDIUM">Media</option>
            <option value="LOW">Baja</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 text-slate-700 font-medium focus:outline-none"
          >
            <option value="ALL">Estatus (Todos)</option>
            <option value="ACTIVE">Activos</option>
            <option value="PENDING_REVIEW">En Revisión</option>
            <option value="SUSPENDED">Suspendidos</option>
            <option value="GRADUATED">Egresados</option>
          </select>
        </div>
      </div>

      {/* Beneficiaries Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-slate-400 text-sm">
            Cargando padrón de beneficiarios...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="text-[11px] uppercase bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3.5 rounded-tl-xl">Beneficiario / CURP</th>
                  <th className="px-4 py-3.5">Diagnóstico / Motivo</th>
                  <th className="px-4 py-3.5">Vulnerabilidad & NSE</th>
                  <th className="px-4 py-3.5">Programas Inscritos</th>
                  <th className="px-4 py-3.5">Origen</th>
                  <th className="px-4 py-3.5 text-right rounded-tr-xl">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredBeneficiaries.map((b) => (
                  <tr
                    key={b.id}
                    className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="px-4 py-3.5">
                      <span className="font-bold text-slate-900 text-sm block">{b.fullName}</span>
                      <span className="text-[11px] text-slate-400 font-mono block">{b.curp}</span>
                      <span className="text-[10px] text-slate-500 block">
                        {b.city || "Sinaloa"} • {b.phone || "Sin teléfono"}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 max-w-xs">
                      <span className="text-slate-700 font-medium line-clamp-2">
                        {b.diagnosisSummary || "Sin diagnóstico registrado."}
                      </span>
                    </td>

                    <td className="px-4 py-3.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${
                          b.vulnerabilityLevel === "CRITICAL"
                            ? "bg-rose-100 text-rose-800"
                            : b.vulnerabilityLevel === "HIGH"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {b.vulnerabilityLevel}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        NSE: {b.socioEconomicLevel || "No clasificado"}
                      </span>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {b.enrolledProgramIds && b.enrolledProgramIds.length > 0 ? (
                          b.enrolledProgramIds.map((pId) => {
                            const prog = programs.find((p) => p.id === pId);
                            return (
                              <span
                                key={pId}
                                className="text-[10px] font-semibold bg-rose-50 text-rose-700 px-2 py-0.5 rounded-md border border-rose-200"
                              >
                                {prog ? prog.name : `Prog #${pId}`}
                              </span>
                            );
                          })
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">Sin programas</span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="text-[11px] text-slate-600 font-medium block">
                        {b.origin === "PATIENT_SELF" ? "Auto-postulado" : "Trabajo Social"}
                      </span>
                      <span className="text-[10px] text-emerald-600 font-bold block">
                        {b.status}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => handleOpenExpediente(b)}
                        className="p-1.5 text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all font-semibold"
                        title="Ver Expediente y Documentos"
                      >
                        <FolderOpen className="w-3.5 h-3.5 inline mr-1 text-indigo-600" />
                        Expediente
                      </button>
                      <button
                        onClick={() => {
                          setSelectedBeneficiary(b);
                          setIsEnrollModalOpen(true);
                        }}
                        className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold px-2.5 py-1.5 rounded-lg text-[11px] transition-all border border-indigo-200"
                      >
                        Inscribir
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredBeneficiaries.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-slate-400 bg-slate-50 rounded-b-xl">
                      No se encontraron beneficiarios registrados con los criterios seleccionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 🚀 Modal / Drawer: Registrar Beneficiario */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 lg:p-8 space-y-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600">
                  <UserPlus className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 text-lg">
                    Registrar Beneficiario en Padrón
                  </h2>
                  <p className="text-xs text-slate-500">
                    Captura realizada por Trabajo Social para postulación y asignación de apoyos.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBeneficiary} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">CURP (18 Dígitos) *</label>
                  <input
                    type="text"
                    required
                    maxLength={18}
                    placeholder="ABCD800101HDFRRL00"
                    value={curp}
                    onChange={(e) => setCurp(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono uppercase focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Nombre(s) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Juan Carlos"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Apellidos *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Pérez Gómez"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Género</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-rose-500/20"
                  >
                    <option value="MALE">Masculino</option>
                    <option value="FEMALE">Femenino</option>
                    <option value="OTHER">Otro</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Fecha Nacimiento</label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-rose-500/20"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Teléfono</label>
                  <input
                    type="tel"
                    placeholder="+52 668 123 4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500/20"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Correo (Opcional)</label>
                  <input
                    type="email"
                    placeholder="paciente@correo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Nivel Vulnerabilidad</label>
                  <select
                    value={vulnerabilityLevel}
                    onChange={(e) => setVulnerabilityLevel(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-rose-500/20"
                  >
                    <option value="LOW">Bajo</option>
                    <option value="MEDIUM">Medio</option>
                    <option value="HIGH">Alto</option>
                    <option value="CRITICAL">Crítico</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Nivel Socioeconómico</label>
                  <select
                    value={socioEconomicLevel}
                    onChange={(e) => setSocioEconomicLevel(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-rose-500/20"
                  >
                    <option value="A_B">A/B (Alto)</option>
                    <option value="C_PLUS">C+ (Medio Alto)</option>
                    <option value="C">C (Medio)</option>
                    <option value="D_PLUS">D+ (Medio Bajo)</option>
                    <option value="D">D (Bajo)</option>
                    <option value="E">E (Muy Bajo / Marginado)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Ciudad / Municipio</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Estado</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Diagnóstico Médico o Motivo de Asistencia Social
                </label>
                <textarea
                  rows={2}
                  placeholder="Ej. Paciente con diagnóstico de insuficiencia renal crónica en lista de espera de trasplante..."
                  value={diagnosisSummary}
                  onChange={(e) => setDiagnosisSummary(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500/20"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1.5">
                  Inscribir de inmediato a Programas Asistenciales:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto p-1">
                  {programs.map((p) => (
                    <button
                      type="button"
                      key={p.id}
                      onClick={() => toggleProgramSelection(p.id)}
                      className={`p-2.5 rounded-xl text-left border transition-all flex items-center justify-between ${
                        selectedProgramIds.includes(p.id)
                          ? "bg-rose-50 border-rose-300 text-rose-900 font-bold"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <span className="truncate block pr-2">{p.name}</span>
                      <CheckCircle2
                        className={`w-4 h-4 shrink-0 ${
                          selectedProgramIds.includes(p.id) ? "text-rose-600" : "text-slate-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md shadow-rose-600/30 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? "Guardando..." : "Guardar en Padrón"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 📋 Modal: Expediente Integral & Bandeja Documental del Beneficiario */}
      {selectedBeneficiary && !isEnrollModalOpen && !isRequestDocModalOpen && !selectedDocToReview && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 lg:p-8 space-y-5 shadow-2xl border border-slate-100 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <FolderOpen className="w-5 h-5 text-indigo-600" />
                  Expediente de Asistencia Social & Validación
                </h3>
                <span className="text-xs font-mono text-slate-400">
                  {selectedBeneficiary.fullName} • {selectedBeneficiary.curp}
                </span>
              </div>
              <button
                onClick={() => setSelectedBeneficiary(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* General Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Ubicación & Contacto</span>
                <span className="font-bold text-slate-900 block">{selectedBeneficiary.city}, {selectedBeneficiary.state}</span>
                <span className="text-slate-600 font-mono block">{selectedBeneficiary.phone || "Sin teléfono"}</span>
              </div>
              <div className="p-3 bg-rose-50/50 border border-rose-100 rounded-xl space-y-1">
                <span className="text-rose-700 block text-[10px] uppercase font-bold">Vulnerabilidad & Diagnóstico</span>
                <span className="font-bold text-slate-900 block">Nivel: {selectedBeneficiary.vulnerabilityLevel} (NSE: {selectedBeneficiary.socioEconomicLevel || "D"})</span>
                <p className="text-slate-600 line-clamp-1">{selectedBeneficiary.diagnosisSummary || "Sin diagnóstico."}</p>
              </div>
            </div>

            {/* Document Validation Section */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <FileCheck2 className="w-4 h-4 text-emerald-600" />
                  Bandeja Documental Requerida
                </h4>
                <button
                  onClick={() => setIsRequestDocModalOpen(true)}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200"
                >
                  <FilePlus className="w-3.5 h-3.5" />
                  Solicitar Documento
                </button>
              </div>

              {isLoadingDocs ? (
                <div className="py-6 text-center text-slate-400 text-xs">Cargando expediente documental...</div>
              ) : (
                <div className="space-y-2">
                  {beneficiaryDocs.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <span className="font-bold text-slate-900 block truncate">{doc.title}</span>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                          <span className="font-semibold text-slate-600">{doc.documentType}</span>
                          <span>•</span>
                          <span>{doc.fileName ? doc.fileName : "Pendiente de carga"}</span>
                        </div>
                        {doc.reviewNotes && (
                          <p className="text-[11px] text-slate-600 italic">Notas: {doc.reviewNotes}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            doc.verificationStatus === "APPROVED"
                              ? "bg-emerald-100 text-emerald-800"
                              : doc.verificationStatus === "OBSERVED"
                              ? "bg-amber-100 text-amber-800"
                              : doc.verificationStatus === "REJECTED"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {doc.verificationStatus}
                        </span>

                        <button
                          onClick={() => {
                            setSelectedDocToReview(doc);
                            setReviewStatus("APPROVED");
                            setReviewNotes(doc.reviewNotes || "");
                          }}
                          className="bg-slate-900 hover:bg-slate-800 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all"
                        >
                          Dictaminar
                        </button>
                      </div>
                    </div>
                  ))}

                  {beneficiaryDocs.length === 0 && (
                    <div className="p-4 bg-slate-50 rounded-xl text-center text-slate-400 text-xs">
                      No hay requerimientos documentales asignados a este beneficiario.
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedBeneficiary(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-semibold text-xs"
              >
                Cerrar Expediente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🚀 Modal: Solicitar Documento al Beneficiario */}
      {isRequestDocModalOpen && selectedBeneficiary && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Solicitar Requerimiento Documental</h3>
                <p className="text-xs text-slate-500">{selectedBeneficiary.fullName}</p>
              </div>
              <button
                onClick={() => setIsRequestDocModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRequestDocument} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Tipo de Documento *</label>
                <select
                  value={docTypeToRequest}
                  onChange={(e) => {
                    setDocTypeToRequest(e.target.value);
                    if (e.target.value === "SOCIOECONOMIC_STUDY") setDocTitleToRequest("Estudio Socioeconómico 2026");
                    if (e.target.value === "INCOME_PROOF") setDocTitleToRequest("Comprobante de Ingresos Familiares");
                    if (e.target.value === "MEDICAL_SUMMARY") setDocTitleToRequest("Dictamen / Resumen Médico Oficial");
                    if (e.target.value === "ID_OFFICIAL") setDocTitleToRequest("Identificación Oficial (INE / Pasaporte)");
                    if (e.target.value === "PRESCRIPTION") setDocTitleToRequest("Receta Médica Electrónica Vigente");
                  }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
                >
                  <option value="SOCIOECONOMIC_STUDY">Estudio Socioeconómico</option>
                  <option value="INCOME_PROOF">Comprobante de Ingresos</option>
                  <option value="MEDICAL_SUMMARY">Dictamen / Resumen Médico</option>
                  <option value="ID_OFFICIAL">Identificación Oficial</option>
                  <option value="PRESCRIPTION">Receta Médica</option>
                  <option value="OTHER">Otro Documento</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Título del Requerimiento *</label>
                <input
                  type="text"
                  required
                  value={docTitleToRequest}
                  onChange={(e) => setDocTitleToRequest(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRequestDocModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? "Solicitando..." : "Confirmar Solicitud"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🚀 Modal: Dictamen Documental (Aprobar / Observar / Rechazar) */}
      {selectedDocToReview && selectedBeneficiary && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Dictaminar Documento</h3>
                <p className="text-xs text-slate-500">{selectedDocToReview.title}</p>
              </div>
              <button
                onClick={() => setSelectedDocToReview(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReviewDocument} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Dictamen de Trabajo Social *</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setReviewStatus("APPROVED")}
                    className={`p-2 rounded-xl border font-bold text-center transition-all ${
                      reviewStatus === "APPROVED"
                        ? "bg-emerald-50 border-emerald-400 text-emerald-800"
                        : "bg-slate-50 border-slate-200 text-slate-600"
                    }`}
                  >
                    Aprobado
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewStatus("OBSERVED")}
                    className={`p-2 rounded-xl border font-bold text-center transition-all ${
                      reviewStatus === "OBSERVED"
                        ? "bg-amber-50 border-amber-400 text-amber-800"
                        : "bg-slate-50 border-slate-200 text-slate-600"
                    }`}
                  >
                    Observado
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewStatus("REJECTED")}
                    className={`p-2 rounded-xl border font-bold text-center transition-all ${
                      reviewStatus === "REJECTED"
                        ? "bg-rose-50 border-rose-400 text-rose-800"
                        : "bg-slate-50 border-slate-200 text-slate-600"
                    }`}
                  >
                    Rechazado
                  </button>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Notas de Revisión / Observaciones</label>
                <textarea
                  rows={2}
                  placeholder="Comentarios de validación para el expediente..."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedDocToReview(null)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? "Guardando..." : "Guardar Dictamen"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🚀 Modal: Inscribir en Programa Asistencial */}
      {isEnrollModalOpen && selectedBeneficiary && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Inscribir en Programa</h3>
                <p className="text-xs text-slate-500">{selectedBeneficiary.fullName}</p>
              </div>
              <button
                onClick={() => setIsEnrollModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEnrollBeneficiary} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Seleccionar Programa *</label>
                <select
                  value={enrollProgramId || ""}
                  onChange={(e) => setEnrollProgramId(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
                >
                  {programs.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.cause})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Tope Máximo de Apoyo ($ MXN)</label>
                <input
                  type="number"
                  min={100}
                  step={500}
                  value={enrollSubsidyCap}
                  onChange={(e) => setEnrollSubsidyCap(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Notas de Trabajo Social</label>
                <textarea
                  rows={2}
                  placeholder="Motivo de asignación de subsidio..."
                  value={enrollNotes}
                  onChange={(e) => setEnrollNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEnrollModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? "Inscribiendo..." : "Confirmar Inscripción"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
