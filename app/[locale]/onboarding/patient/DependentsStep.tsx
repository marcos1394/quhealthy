import React, { useEffect, useState } from "react";
import { UserPlus, Baby, Heart, ShieldCheck, Plus, X, Loader2, Edit2, Trash2, Activity } from "lucide-react";
import { toast } from "react-toastify";
import { dependentService } from "@/services/dependent.service";
import { Dependent, DependentRequest } from "@/types/dependent";

export const DependentsStep = () => {
  const [dependents, setDependents] = useState<Dependent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<DependentRequest>({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    relationship: "",
    medicalNotes: "",
  });

  // Campos adicionales visuales que inyectaremos en medicalNotes
  const [extraData, setExtraData] = useState({
    weightKg: "",
    heightCm: ""
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
    if (!window.confirm("¿Seguro que deseas eliminar a este familiar?")) return;
    try {
      await dependentService.deleteDependent(id);
      toast.success("Familiar eliminado correctamente");
      loadDependents();
    } catch (error) {
      toast.error("Error al eliminar familiar");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      
      // Inyectar peso y talla en las notas médicas temporalmente hasta que se actualice la DB
      let finalNotes = formData.medicalNotes || "";
      if (extraData.weightKg || extraData.heightCm) {
        const metrics = `[Biometría Inicial] Peso: ${extraData.weightKg || 'N/A'} kg, Estatura: ${extraData.heightCm || 'N/A'} cm.`;
        finalNotes = finalNotes ? `${metrics}\n\n${finalNotes}` : metrics;
      }

      await dependentService.addDependent({
        ...formData,
        medicalNotes: finalNotes
      });

      toast.success("Familiar agregado con éxito");
      setIsModalOpen(false);
      
      // Reset form
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
    <div className="space-y-6">
      <div className="text-center py-4">
        <UserPlus className="w-16 h-16 mx-auto text-blue-600 mb-4" />
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Familiares a cargo</h3>
        <p className="text-slate-500 max-w-md mx-auto mt-2">
          Agrega el perfil de tus hijos o adultos mayores para gestionar su esquema de vacunación y citas médicas desde tu cuenta.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="space-y-4">
          {dependents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dependents.map((dep) => (
                <div key={dep.id} className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl relative shadow-sm hover:shadow-md transition group">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                        {dep.relationship === 'CHILD' ? <Baby className="w-5 h-5" /> : <Heart className="w-5 h-5" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white">{dep.firstName} {dep.lastName}</h4>
                        <p className="text-xs text-slate-500">
                          {dep.relationship} • {calculateAge(dep.dateOfBirth)} años
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDelete(dep.id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
              <p className="text-slate-500">Aún no has agregado dependientes.</p>
            </div>
          )}

          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full py-4 border-2 border-dashed border-blue-200 hover:border-blue-400 dark:border-blue-900 dark:hover:border-blue-700 bg-blue-50/50 hover:bg-blue-50 dark:bg-blue-900/10 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-semibold rounded-2xl transition flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" /> Agregar Nuevo Dependiente
          </button>
        </div>
      )}

      {/* MODAL FORMULARIO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-600" /> Nuevo Perfil Médico
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-5 overflow-y-auto max-h-[70vh]">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nombre(s) *</label>
                    <input 
                      required
                      type="text" 
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                      value={formData.firstName}
                      onChange={e => setFormData({...formData, firstName: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Apellidos *</label>
                    <input 
                      required
                      type="text" 
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                      value={formData.lastName}
                      onChange={e => setFormData({...formData, lastName: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Fecha Nacimiento *</label>
                    <input 
                      required
                      type="date" 
                      max={new Date().toISOString().split('T')[0]}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                      value={formData.dateOfBirth}
                      onChange={e => setFormData({...formData, dateOfBirth: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Sexo *</label>
                    <select 
                      required
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                      value={formData.gender}
                      onChange={e => setFormData({...formData, gender: e.target.value})}
                    >
                      <option value="">Selecciona...</option>
                      <option value="MALE">Masculino</option>
                      <option value="FEMALE">Femenino</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Parentesco *</label>
                  <select 
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    value={formData.relationship}
                    onChange={e => setFormData({...formData, relationship: e.target.value})}
                  >
                    <option value="">Selecciona...</option>
                    <option value="CHILD">Hijo / Hija</option>
                    <option value="PARENT">Padre / Madre</option>
                    <option value="SPOUSE">Pareja / Cónyuge</option>
                    <option value="SIBLING">Hermano / Hermana</option>
                    <option value="OTHER">Otro</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="col-span-2">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Activity className="w-3 h-3" /> Biometría Inicial
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Peso (kg)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      placeholder="Ej. 15.5"
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                      value={extraData.weightKg}
                      onChange={e => setExtraData({...extraData, weightKg: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Estatura (cm)</label>
                    <input 
                      type="number" 
                      placeholder="Ej. 95"
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                      value={extraData.heightCm}
                      onChange={e => setExtraData({...extraData, heightCm: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Notas Médicas Adicionales</label>
                  <textarea 
                    rows={2}
                    placeholder="Alergias, condiciones preexistentes..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    value={formData.medicalNotes}
                    onChange={e => setFormData({...formData, medicalNotes: e.target.value})}
                  />
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition flex items-center gap-2"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {saving ? "Guardando..." : "Guardar Perfil"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
