import React, { useState } from "react";
import { DiabetesLogDto, MeasurementTime, diabetesService } from "@/services/diabetes.service";
import { Plus, Droplets, Utensils, Activity, Syringe, Clock, AlertTriangle } from "lucide-react";
import { useSessionStore } from "@/stores/SessionStore";

export function GlucoseLogWidget({ logs, onLogAdded }: { logs: DiabetesLogDto[], onLogAdded: () => void }) {
  const { user } = useSessionStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [glucose, setGlucose] = useState<number | "">("");
  const [time, setTime] = useState<MeasurementTime>(MeasurementTime.RANDOM);
  const [carbs, setCarbs] = useState<number | "">("");
  const [insulin, setInsulin] = useState<number | "">("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "IN_RANGE": return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "HYPOGLYCEMIA": return "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400";
      case "HYPERGLYCEMIA": return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
      case "CRITICAL_HIGH": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 font-bold";
      default: return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const getTimeLabel = (t: MeasurementTime) => {
    switch (t) {
      case MeasurementTime.FASTING: return "Ayuno";
      case MeasurementTime.PRE_MEAL: return "Preprandial";
      case MeasurementTime.POST_MEAL: return "Postprandial";
      case MeasurementTime.BEDTIME: return "Antes de dormir";
      case MeasurementTime.RANDOM: return "Aleatoria";
    }
  };

  const handleSave = async () => {
    if (!user?.id || !glucose) return;
    setLoading(true);
    try {
      await diabetesService.addLog(user.id, {
        logDate: new Date().toISOString().split('T')[0],
        measurementTime: time,
        glucoseLevel: Number(glucose),
        carbohydratesGrams: carbs ? Number(carbs) : undefined,
        insulinDose: insulin ? Number(insulin) : undefined,
        notes: notes || undefined
      });
      setIsModalOpen(false);
      setGlucose("");
      setCarbs("");
      setInsulin("");
      setNotes("");
      onLogAdded();
    } catch (e) {
      console.error(e);
      alert("Error al guardar el registro");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Droplets className="w-5 h-5 text-blue-500" />
          <h3 className="font-bold text-gray-900 dark:text-white">Bitácora de Glucosa</h3>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1 text-sm bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 px-3 py-1.5 rounded-full font-medium hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
        >
          <Plus className="w-4 h-4" /> Registrar
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-0">
        {logs.length === 0 ? (
          <div className="p-8 text-center text-gray-500 flex flex-col items-center justify-center h-full">
            <Droplets className="w-12 h-12 text-gray-200 dark:text-gray-800 mb-3" />
            <p>No hay registros recientes.</p>
            <p className="text-sm mt-1">Registra tu glucosa para llevar el control.</p>
          </div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 uppercase text-xs sticky top-0">
              <tr>
                <th className="px-6 py-3 font-medium">Fecha/Hora</th>
                <th className="px-6 py-3 font-medium">Glucosa</th>
                <th className="px-6 py-3 font-medium hidden sm:table-cell">Contexto</th>
                <th className="px-6 py-3 font-medium hidden md:table-cell">Extras</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {logs.map(log => (
                <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900 dark:text-gray-200">
                        {new Date(log.logDate).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 dark:text-white text-base">
                        {log.glucoseLevel} <span className="text-xs font-normal text-gray-500">mg/dL</span>
                      </span>
                      <span className={`text-[10px] uppercase px-2 py-0.5 rounded-full ${getStatusColor(log.glucoseStatus)}`}>
                        {log.glucoseStatus === "HYPOGLYCEMIA" ? "BAJA" : log.glucoseStatus === "HYPERGLYCEMIA" ? "ALTA" : log.glucoseStatus === "CRITICAL_HIGH" ? "CRÍTICA" : "OK"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden sm:table-cell">
                    <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                      <Clock className="w-3.5 h-3.5" /> {getTimeLabel(log.measurementTime)}
                    </span>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
                      {log.insulinDose && (
                        <span className="flex items-center gap-1" title="Insulina">
                          <Syringe className="w-3.5 h-3.5 text-blue-400" /> {log.insulinDose}u
                        </span>
                      )}
                      {log.carbohydratesGrams && (
                        <span className="flex items-center gap-1" title="Carbohidratos">
                          <Utensils className="w-3.5 h-3.5 text-orange-400" /> {log.carbohydratesGrams}g
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111] rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Registrar Glucosa</h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Glucosa (mg/dL) *
                </label>
                <div className="relative">
                  <input 
                    type="number"
                    value={glucose}
                    onChange={e => setGlucose(Number(e.target.value))}
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-lg font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="Ej. 105"
                  />
                  <div className="absolute right-4 top-3 text-gray-400 font-medium">mg/dL</div>
                </div>
                {glucose && Number(glucose) < 70 && (
                  <p className="text-rose-500 text-xs mt-2 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Nivel de hipoglucemia
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Momento
                </label>
                <select 
                  value={time}
                  onChange={e => setTime(e.target.value as MeasurementTime)}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value={MeasurementTime.FASTING}>Ayuno</option>
                  <option value={MeasurementTime.PRE_MEAL}>Antes de comer (Preprandial)</option>
                  <option value={MeasurementTime.POST_MEAL}>2h después de comer (Postprandial)</option>
                  <option value={MeasurementTime.BEDTIME}>Antes de dormir</option>
                  <option value={MeasurementTime.RANDOM}>Aleatorio</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Insulina (u)
                  </label>
                  <input 
                    type="number"
                    value={insulin}
                    onChange={e => setInsulin(Number(e.target.value))}
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none"
                    placeholder="Unidades"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Carbohidratos (g)
                  </label>
                  <input 
                    type="number"
                    value={carbs}
                    onChange={e => setCarbs(Number(e.target.value))}
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none"
                    placeholder="Gramos"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notas
                </label>
                <input 
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none"
                  placeholder="Ej. Me sentí mareado..."
                />
              </div>
            </div>

            <div className="p-6 bg-gray-50 dark:bg-gray-900/50 flex gap-3 justify-end">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSave}
                disabled={!glucose || loading}
                className="px-5 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors disabled:opacity-50"
              >
                {loading ? "Guardando..." : "Guardar Registro"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
