/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-doctor/button-has-type */
/* eslint-disable react-doctor/no-gray-on-colored-background */
/* eslint-disable react-doctor/prefer-module-scope-pure-function */
/* eslint-disable react-doctor/no-giant-component */
"use client";

import React, { useEffect, useState } from "react";
import { UserPlus, Baby, Heart, Plus, X, Loader2, Trash2, Activity, Shield } from "lucide-react";
import { toast } from "react-toastify";
import { dependentService } from "@/services/dependent.service";
import { Dependent, DependentRequest } from "@/types/dependent";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";

export const DependentsStep = () => {
    const [{ dependents, loading, isModalOpen, saving, extraData }, dispatch] = React.useReducer(
      (state: any, action: any) => {
        switch (action.type) {
      case 'SET_DEPENDENTS': return { ...state, dependents: typeof action.payload === 'function' ? action.payload(state.dependents) : action.payload };
      case 'SET_LOADING': return { ...state, loading: typeof action.payload === 'function' ? action.payload(state.loading) : action.payload };
      case 'SET_ISMODALOPEN': return { ...state, isModalOpen: typeof action.payload === 'function' ? action.payload(state.isModalOpen) : action.payload };
      case 'SET_SAVING': return { ...state, saving: typeof action.payload === 'function' ? action.payload(state.saving) : action.payload };
      case 'SET_EXTRADATA': return { ...state, extraData: typeof action.payload === 'function' ? action.payload(state.extraData) : action.payload };
          default: return state;
        }
      },
      {
        dependents: [], loading: true, isModalOpen: false, saving: false, extraData: {
    weightKg: "",
    heightCm: ""
  }
      }
    );

    const setDependents = (val: any) => dispatch({ type: 'SET_DEPENDENTS', payload: val });
    const setLoading = (val: any) => dispatch({ type: 'SET_LOADING', payload: val });
    const setIsModalOpen = (val: any) => dispatch({ type: 'SET_ISMODALOPEN', payload: val });
    const setSaving = (val: any) => dispatch({ type: 'SET_SAVING', payload: val });
    const setExtraData = (val: any) => dispatch({ type: 'SET_EXTRADATA', payload: val });





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
    if (!window.confirm("¿Seguro que deseas eliminar el expediente de este familiar?")) return;
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
        const metrics = `[Biometría Inicial] Peso: ${extraData.weightKg || 'N/A'} kg, Estatura: ${extraData.heightCm || 'N/A'} cm.`;
        finalNotes = finalNotes ? `${metrics}\n\n${finalNotes}` : metrics;
      }

      await dependentService.addDependent({
        ...formData,
        medicalNotes: finalNotes
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

  return (
    <div className="space-y-8">
      {/* Header Editorial */}
      <div className="border-b border-gray-200 dark:border-gray-800 pb-6">
        <h3 className="text-2xl font-semibold text-black dark:text-white tracking-tight">Familiares a cargo</h3>
        <p className="text-gray-500 font-light mt-2 max-w-2xl text-sm">
          Registra perfiles médicos secundarios para gestionar esquemas de vacunación y citas de dependientes (menores o adultos mayores).
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-black dark:text-white" />
        </div>
      ) : (
        <div className="space-y-6">
          {dependents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dependents.map((dep: any) => (
                <div key={dep.id} className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-5 group hover:border-black dark:hover:border-white transition-colors relative flex items-start gap-4">
                  <div className="w-12 h-12 border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#050505] flex items-center justify-center shrink-0 text-black dark:text-white group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors">
                    {dep.relationship === 'CHILD' ? <Baby className="w-5 h-5" strokeWidth={1.5} /> : <Heart className="w-5 h-5" strokeWidth={1.5} />}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold uppercase tracking-widest text-black dark:text-white mb-1">
                      {dep.firstName} {dep.lastName}
                    </h4>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-light">
                      {dep.relationship} <span className="mx-1">•</span> {calculateAge(dep.dateOfBirth)} años
                    </p>
                  </div>
                  <button 
                    onClick={() => handleDelete(dep.id)}
                    className="w-8 h-8 flex items-center justify-center border border-transparent text-gray-400 hover:text-red-500 hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-gray-300 dark:border-gray-700 p-10 text-center bg-gray-50 dark:bg-[#050505]">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                No hay dependientes registrados en este expediente.
              </p>
            </div>
          )}

          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full h-14 border border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> Agregar Perfil Dependiente
          </button>
        </div>
      )}

      {/* MODAL FORMULARIO (Architectural Overlay) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0a0a0a] w-full max-w-2xl border border-black dark:border-white shadow-2xl flex flex-col max-h-[90vh]">
            
            {/* Header Modal */}
            <div className="border-b border-gray-200 dark:border-gray-800 p-6 bg-gray-50 dark:bg-[#050505] flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 border border-black dark:border-white flex items-center justify-center bg-white dark:bg-black">
                  <UserPlus className="w-4 h-4 text-black dark:text-white" strokeWidth={1.5} />
                </div>
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
                  Creación de Expediente Secundario
                </h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-black dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="flex flex-col overflow-hidden flex-1">
              <div className="p-6 overflow-y-auto space-y-6">
                
                {/* Nombre y Apellidos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">Nombre(s) *</label>
                    <input 
                      required
                      type="text" 
                      className="w-full h-12 rounded-none border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] text-sm focus:border-black dark:focus:border-white focus:ring-0 px-4 transition-colors outline-none"
                      value={formData.firstName}
                      onChange={e => setFormData({...formData, firstName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">Apellidos *</label>
                    <input 
                      required
                      type="text" 
                      className="w-full h-12 rounded-none border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] text-sm focus:border-black dark:focus:border-white focus:ring-0 px-4 transition-colors outline-none"
                      value={formData.lastName}
                      onChange={e => setFormData({...formData, lastName: e.target.value})}
                    />
                  </div>
                </div>

                {/* Fecha y Sexo */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 flex flex-col">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">Fecha Nacimiento *</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className={cn(
                            "w-full h-12 flex items-center justify-between border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] px-4 transition-colors hover:border-black dark:hover:border-white text-sm",
                            !formData.dateOfBirth && "text-gray-500"
                          )}
                        >
                          {formData.dateOfBirth ? format(new Date(formData.dateOfBirth + "T12:00:00"), "PP", { locale: es }) : "Selecciona la fecha"}
                          <CalendarIcon className="w-4 h-4 opacity-50" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 rounded-none border-black dark:border-white bg-white dark:bg-[#050505]" align="start">
                        <Calendar
                          mode="single"
                          selected={formData.dateOfBirth ? new Date(formData.dateOfBirth + "T12:00:00") : undefined}
                          onSelect={(date) => {
                            if (date) {
                              const yyyy = date.getFullYear();
                              const mm = String(date.getMonth() + 1).padStart(2, '0');
                              const dd = String(date.getDate()).padStart(2, '0');
                              setFormData({ ...formData, dateOfBirth: `${yyyy}-${mm}-${dd}` });
                            }
                          }}
                          disabled={(date) => date > new Date()}
                          initialFocus
                          locale={es}
                          className="rounded-none font-sans"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-3">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">Sexo *</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: "MALE", label: "Masculino" },
                        { id: "FEMALE", label: "Femenino" }
                      ].map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, gender: option.id })}
                          className={cn(
                            "h-12 border text-[10px] font-bold transition-all uppercase tracking-widest",
                            formData.gender === option.id
                              ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white"
                              : "bg-white text-gray-600 border-gray-200 hover:border-black dark:bg-[#0a0a0a] dark:text-gray-400 dark:border-gray-800 dark:hover:border-white"
                          )}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Parentesco */}
                <div className="space-y-3">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">Parentesco *</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {[
                      { id: "CHILD", label: "Hijo / Hija" },
                      { id: "PARENT", label: "Padre / Madre" },
                      { id: "SPOUSE", label: "Pareja / Cónyuge" },
                      { id: "SIBLING", label: "Hermano / Hermana" },
                      { id: "OTHER", label: "Otro" }
                    ].map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, relationship: option.id })}
                        className={cn(
                          "h-12 border text-[10px] font-bold transition-all uppercase tracking-widest",
                          formData.relationship === option.id
                            ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white"
                            : "bg-white text-gray-600 border-gray-200 hover:border-black dark:bg-[#0a0a0a] dark:text-gray-400 dark:border-gray-800 dark:hover:border-white",
                          option.id === "OTHER" ? "col-span-2 md:col-span-1" : ""
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Biometría (Architectural Note) */}
                <div className="border-l-2 border-black dark:border-white pl-5 py-2 bg-gray-50 dark:bg-[#050505]">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white mb-4 flex items-center gap-2">
                    <Activity className="w-3 h-3" /> Biometría Inicial
                  </p>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-[9px] uppercase tracking-widest text-gray-500">Peso (kg)</label>
                      <input 
                        type="number" 
                        step="0.1"
                        placeholder="Ej. 15.5"
                        className="w-full h-10 rounded-none border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-sm focus:border-black dark:focus:border-white focus:ring-0 px-3 outline-none"
                        value={extraData.weightKg}
                        onChange={e => setExtraData({...extraData, weightKg: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[9px] uppercase tracking-widest text-gray-500">Estatura (cm)</label>
                      <input 
                        type="number" 
                        placeholder="Ej. 95"
                        className="w-full h-10 rounded-none border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-sm focus:border-black dark:focus:border-white focus:ring-0 px-3 outline-none"
                        value={extraData.heightCm}
                        onChange={e => setExtraData({...extraData, heightCm: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                {/* Notas Médicas */}
                <div className="space-y-2 pb-4">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">Notas Clínicas Adicionales</label>
                  <textarea 
                    rows={3}
                    placeholder="Alergias, condiciones preexistentes, etc."
                    className="w-full rounded-none border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] text-sm focus:border-black dark:focus:border-white focus:ring-0 p-4 transition-colors outline-none resize-none"
                    value={formData.medicalNotes}
                    onChange={e => setFormData({...formData, medicalNotes: e.target.value})}
                  />
                </div>
              </div>

              {/* Footer Modal Actions */}
              <div className="border-t border-gray-200 dark:border-gray-800 p-6 flex items-center justify-end gap-4 shrink-0 bg-white dark:bg-[#0a0a0a]">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 h-12 border border-gray-200 dark:border-gray-800 text-[10px] font-bold uppercase tracking-widest text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#050505] transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={saving}
                  className="px-8 h-12 bg-black text-white dark:bg-white dark:text-black text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {saving ? "Procesando..." : "Guardar Registro"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};