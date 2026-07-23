"use client";

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/no-gray-on-colored-background */
/* eslint-disable react-doctor/prefer-module-scope-pure-function */
/* eslint-disable react-doctor/no-giant-component */

import React, { useEffect, useState } from "react";
import {
  UserPlus,
  Baby,
  Heart,
  Plus,
  X,
  Trash2,
  Activity,
  Users,
  Calendar as CalendarIcon,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { toast } from "react-toastify";
import { dependentService } from "@/services/dependent.service";
import { Dependent, DependentRequest } from "@/types/dependent";
import { cn } from "@/lib/utils";
import { DatePicker } from "@/components/ui/date-picker";
import { QhSpinner } from "@/components/ui/QhSpinner";

export const DependentsStep = () => {
  const [{ dependents, loading, isModalOpen, saving, extraData }, dispatch] =
    React.useReducer(
      (state: any, action: any) => {
        switch (action.type) {
          case "SET_DEPENDENTS":
            return {
              ...state,
              dependents:
                typeof action.payload === "function"
                  ? action.payload(state.dependents)
                  : action.payload,
            };
          case "SET_LOADING":
            return {
              ...state,
              loading:
                typeof action.payload === "function"
                  ? action.payload(state.loading)
                  : action.payload,
            };
          case "SET_ISMODALOPEN":
            return {
              ...state,
              isModalOpen:
                typeof action.payload === "function"
                  ? action.payload(state.isModalOpen)
                  : action.payload,
            };
          case "SET_SAVING":
            return {
              ...state,
              saving:
                typeof action.payload === "function"
                  ? action.payload(state.saving)
                  : action.payload,
            };
          case "SET_EXTRADATA":
            return {
              ...state,
              extraData:
                typeof action.payload === "function"
                  ? action.payload(state.extraData)
                  : action.payload,
            };
          default:
            return state;
        }
      },
      {
        dependents: [],
        loading: true,
        isModalOpen: false,
        saving: false,
        extraData: {
          weightKg: "",
          heightCm: "",
        },
      },
    );

  const setDependents = (val: any) =>
    dispatch({ type: "SET_DEPENDENTS", payload: val });
  const setLoading = (val: any) =>
    dispatch({ type: "SET_LOADING", payload: val });
  const setIsModalOpen = (val: any) =>
    dispatch({ type: "SET_ISMODALOPEN", payload: val });
  const setSaving = (val: any) =>
    dispatch({ type: "SET_SAVING", payload: val });
  const setExtraData = (val: any) =>
    dispatch({ type: "SET_EXTRADATA", payload: val });

  const [formData, setFormData] = useState<DependentRequest>({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    relationship: "",
    medicalNotes: "",
  });

  useEffect(() => {
    loadDependents();
  }, []);

  const loadDependents = async () => {
    try {
      setLoading(true);
      const data = await dependentService.getMyFamily();
      setDependents(data);
    } catch (error) {
      console.error("Error loading dependents:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (
      !window.confirm(
        "¿Seguro que deseas eliminar el expediente de este familiar?",
      )
    )
      return;
    try {
      await dependentService.deleteDependent(id);
      toast.success("Expediente eliminado correctamente");
      loadDependents();
    } catch (error) {
      toast.error("Error al eliminar expediente");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.dateOfBirth) {
      toast.error("Por favor selecciona la fecha de nacimiento.");
      return;
    }
    if (!formData.gender || !formData.relationship) {
      toast.error("Por favor selecciona el sexo y el parentesco.");
      return;
    }
    try {
      setSaving(true);

      let finalNotes = formData.medicalNotes || "";
      if (extraData.weightKg || extraData.heightCm) {
        const metrics = `[Biometría Inicial] Peso: ${extraData.weightKg || "N/A"} kg, Estatura: ${extraData.heightCm || "N/A"} cm.`;
        finalNotes = finalNotes ? `${metrics}\n\n${finalNotes}` : metrics;
      }

      await dependentService.addDependent({
        ...formData,
        medicalNotes: finalNotes,
      });

      toast.success("Expediente creado con éxito");
      setIsModalOpen(false);

      setFormData({
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        gender: "",
        relationship: "",
        medicalNotes: "",
      });
      setExtraData({ weightKg: "", heightCm: "" });

      loadDependents();
    } catch (error) {
      console.error("Error adding dependent:", error);
      toast.error("Ocurrió un error al guardar los datos");
    } finally {
      setSaving(false);
    }
  };

  const calculateAge = (dob: string) => {
    if (!dob) return "";
    const diff = new Date().getTime() - new Date(dob).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  };

  const getRelationshipLabel = (rel: string) => {
    switch (rel) {
      case "CHILD":
        return "Hijo(a)";
      case "PARENT":
        return "Padre/Madre";
      case "SPOUSE":
        return "Cónyuge";
      case "SIBLING":
        return "Hermano(a)";
      default:
        return "Familiar";
    }
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Header Editorial */}
      <div className="space-y-2 pb-6 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-900/40">
            <Users className="w-3.5 h-3.5" strokeWidth={2} />
            <span>Núcleo Familiar</span>
          </span>
        </div>
        <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight pt-1">
          Familiares a Cargo
        </h3>
        <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 max-w-2xl leading-relaxed">
          Registra perfiles médicos secundarios para gestionar esquemas de vacunación, seguimiento de salud y agendamiento de citas para tus dependientes.
        </p>
      </div>

      {/* Lista de Dependientes / Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
          <QhSpinner size="md" className="text-emerald-600 dark:text-emerald-400" />
          <p className="text-xs font-semibold text-gray-400 animate-pulse">
            Cargando expedientes familiares...
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {dependents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dependents.map((dep: any) => (
                <div
                  key={dep.id}
                  className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-5 shadow-sm hover:border-emerald-500/30 transition-all flex items-start justify-between gap-4 group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-sm">
                      {dep.relationship === "CHILD" ? (
                        <Baby className="w-5 h-5" strokeWidth={2} />
                      ) : (
                        <Heart className="w-5 h-5" strokeWidth={2} />
                      )}
                    </div>

                    <div className="space-y-0.5">
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                        {dep.firstName} {dep.lastName}
                      </h4>
                      <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                        <span className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-[10px] font-bold text-gray-700 dark:text-gray-300">
                          {getRelationshipLabel(dep.relationship)}
                        </span>
                        <span>•</span>
                        <span>{calculateAge(dep.dateOfBirth)} años</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(dep.id)}
                    className="w-8 h-8 rounded-xl bg-gray-50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 text-gray-400 hover:text-red-500 hover:border-red-200 dark:hover:border-red-900/40 flex items-center justify-center transition-colors shrink-0"
                    title="Eliminar Expediente"
                  >
                    <Trash2 className="w-4 h-4" strokeWidth={2} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50/50 dark:bg-[#050505] border border-dashed border-gray-200 dark:border-gray-800 rounded-3xl p-10 text-center space-y-2">
              <Users className="w-8 h-8 text-gray-400 mx-auto" strokeWidth={1.5} />
              <p className="text-xs font-bold text-gray-900 dark:text-white">
                No hay dependientes registrados
              </p>
              <p className="text-xs font-medium text-gray-400 max-w-sm mx-auto">
                Agrega a tus familiares para llevar el control integrado de su historial de salud.
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="w-full h-12 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 hover:border-emerald-500/50 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/10 text-xs font-bold text-gray-900 dark:text-white transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2.5} />
            <span>Agregar Perfil Dependiente</span>
          </button>
        </div>
      )}

      {/* ── MODAL FORMULARIO ──────────────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md transition-all">
          <div className="bg-white dark:bg-[#0a0a0a] w-full max-w-2xl border border-gray-100 dark:border-gray-800 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            
            {/* Header Modal */}
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
                  <UserPlus className="w-5 h-5" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    Creación de Expediente Secundario
                  </h3>
                  <p className="text-xs font-medium text-gray-400">
                    Ingresa los datos personales de tu familiar
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-gray-50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>

            <form
              onSubmit={handleSave}
              className="flex flex-col overflow-hidden flex-1"
            >
              <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
                
                {/* Nombre y Apellidos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                      Nombre(s) *
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="Ej. Mateo"
                      className="w-full h-11 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 px-4 transition-all"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                      Apellidos *
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="Ej. Sandoval Ruiz"
                      className="w-full h-11 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 px-4 transition-all"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* Fecha y Sexo */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5 flex flex-col">
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                      Fecha de Nacimiento *
                    </label>
                    <DatePicker
                      value={
                        formData.dateOfBirth
                          ? new Date(formData.dateOfBirth + "T12:00:00")
                          : undefined
                      }
                      onChange={(date) => {
                        if (date) {
                          const yyyy = date.getFullYear();
                          const mm = String(date.getMonth() + 1).padStart(
                            2,
                            "0",
                          );
                          const dd = String(date.getDate()).padStart(2, "0");
                          setFormData({
                            ...formData,
                            dateOfBirth: `${yyyy}-${mm}-${dd}`,
                          });
                        } else {
                          setFormData({ ...formData, dateOfBirth: "" });
                        }
                      }}
                      disabled={(date) => date > new Date()}
                      placeholder="Seleccionar fecha"
                      className="h-11 rounded-xl border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] text-xs font-semibold text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20"
                      popoverClassName="rounded-2xl border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                      Sexo Biológico *
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: "MALE", label: "Masculino" },
                        { id: "FEMALE", label: "Femenino" },
                      ].map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, gender: option.id })
                          }
                          className={cn(
                            "h-11 rounded-xl border text-xs font-bold transition-all",
                            formData.gender === option.id
                              ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                              : "bg-gray-50/50 dark:bg-[#050505] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:border-emerald-500/50",
                          )}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Parentesco */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                    Parentesco / Relación *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { id: "CHILD", label: "Hijo / Hija" },
                      { id: "PARENT", label: "Padre / Madre" },
                      { id: "SPOUSE", label: "Cónyuge / Pareja" },
                      { id: "SIBLING", label: "Hermano / Hermana" },
                      { id: "OTHER", label: "Otro Familiar" },
                    ].map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, relationship: option.id })
                        }
                        className={cn(
                          "h-11 rounded-xl border text-xs font-bold transition-all px-2",
                          formData.relationship === option.id
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                            : "bg-gray-50/50 dark:bg-[#050505] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800 hover:border-emerald-500/50",
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Biometría Inicial */}
                <div className="p-5 rounded-2xl bg-gray-50/50 dark:bg-[#050505] border border-gray-100 dark:border-gray-800 space-y-3">
                  <p className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Biometría Inicial (Opcional)</span>
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[11px] font-semibold text-gray-500">
                        Peso (kg)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="Ej. 15.5"
                        className="w-full h-10 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 px-3"
                        value={extraData.weightKg}
                        onChange={(e) =>
                          setExtraData({
                            ...extraData,
                            weightKg: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-semibold text-gray-500">
                        Estatura (cm)
                      </label>
                      <input
                        type="number"
                        placeholder="Ej. 95"
                        className="w-full h-10 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 px-3"
                        value={extraData.heightCm}
                        onChange={(e) =>
                          setExtraData({
                            ...extraData,
                            heightCm: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Notas Médicas */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                    Notas Clínicas Adicionales
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Escribe alergias conocidas, tipo de sangre, condiciones preexistentes, etc."
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 p-3.5 transition-all resize-none"
                    value={formData.medicalNotes}
                    onChange={(e) =>
                      setFormData({ ...formData, medicalNotes: e.target.value })
                    }
                  />
                </div>

              </div>

              {/* Actions Footer */}
              <div className="border-t border-gray-100 dark:border-gray-800 p-5 sm:p-6 flex items-center justify-end gap-3 shrink-0 bg-white dark:bg-[#0a0a0a]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-11 px-5 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="h-11 px-6 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <QhSpinner size="sm" className="text-white" />
                      <span>Procesando...</span>
                    </>
                  ) : (
                    <>
                      <span>Guardar Registro</span>
                      <ArrowRight className="w-4 h-4" strokeWidth={2} />
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};