import React, { useState } from 'react';
import { PatientMedication } from '@/types/healthProfile';
import { Trash2, Pill, Plus } from 'lucide-react';
import { format } from 'date-fns';

interface MedicationsTableProps {
  medications: PatientMedication[];
  isReadOnly: boolean;
  onAdd: (medication: any) => Promise<boolean>;
  onDelete: (id: number) => Promise<boolean>;
}

export function MedicationsTable({ medications, isReadOnly, onAdd, onDelete }: MedicationsTableProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: '',
    route: '',
    reason: ''
  });

  const handleSubmit = async () => {
    if (!formData.name) return;
    setIsSubmitting(true);
    const success = await onAdd(formData);
    if (success) {
      setIsAdding(false);
      setFormData({ name: '', dosage: '', frequency: '', route: '', reason: '' });
    }
    setIsSubmitting(false);
  };

  return (
    <div className="flex flex-col bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden mb-6 mt-6">
      <div className="p-4 bg-gray-50/50 dark:bg-[#050505]/50 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Pill className="w-4 h-4 text-emerald-500" strokeWidth={2} />
          Medicamentos Actuales
        </h4>
        {!isReadOnly && (
          <button 
            onClick={() => setIsAdding(true)}
            className="text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50 px-3 py-1.5 rounded-lg transition-colors flex items-center"
          >
            <Plus className="w-3.5 h-3.5 mr-1" strokeWidth={2} /> Añadir
          </button>
        )}
      </div>

      {isAdding && (
        <div className="p-5 bg-white dark:bg-[#0a0a0a] border-b border-gray-100 dark:border-gray-800 flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Medicamento</label>
              <input type="text" className="w-full bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow placeholder:text-gray-400" placeholder="Medicamento" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Dosis</label>
              <input type="text" className="w-full bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow placeholder:text-gray-400" placeholder="Ej. 500mg" value={formData.dosage} onChange={e => setFormData({...formData, dosage: e.target.value})} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Frecuencia</label>
              <input type="text" className="w-full bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow placeholder:text-gray-400" placeholder="Ej. Cada 8 horas" value={formData.frequency} onChange={e => setFormData({...formData, frequency: e.target.value})} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Vía</label>
              <input type="text" className="w-full bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow placeholder:text-gray-400" placeholder="Ej. Oral, Intravenosa" value={formData.route} onChange={e => setFormData({...formData, route: e.target.value})} />
            </div>
            <div className="flex flex-col gap-1.5 md:col-span-5">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Motivo</label>
              <input type="text" className="w-full bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow placeholder:text-gray-400" placeholder="Motivo" value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} />
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 mt-4">
            <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#111] rounded-xl transition-colors">
              Cancelar
            </button>
            <button disabled={isSubmitting} onClick={handleSubmit} className="px-6 py-2 text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl shadow-sm disabled:opacity-50 transition-colors">
              {isSubmitting ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-gray-50/50 dark:bg-[#050505]/50 border-b border-gray-100 dark:border-gray-800">
              <th className="px-5 py-4 font-semibold text-gray-500 text-xs">Medicamento</th>
              <th className="px-5 py-4 font-semibold text-gray-500 text-xs">Dosis y Frec.</th>
              <th className="px-5 py-4 font-semibold text-gray-500 text-xs">Vía</th>
              <th className="px-5 py-4 font-semibold text-gray-500 text-xs">Motivo</th>
              {!isReadOnly && <th className="px-5 py-4 font-semibold text-gray-500 text-xs text-right">Acción</th>}
            </tr>
          </thead>
          <tbody>
            {medications.length === 0 && !isAdding ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-400 text-sm font-medium">Sin medicamentos registrados</td>
              </tr>
            ) : (
              medications.map(m => (
                <tr key={m.id} className="border-b border-gray-50 dark:border-gray-800/50 bg-white dark:bg-[#0a0a0a] hover:bg-gray-50/50 dark:hover:bg-[#111]/50 transition-colors">
                  <td className="px-5 py-4 font-semibold text-gray-900 dark:text-white">{m.name}</td>
                  <td className="px-5 py-4 text-gray-600 dark:text-gray-400 font-medium">{m.dosage} - {m.frequency}</td>
                  <td className="px-5 py-4 text-gray-600 dark:text-gray-400 font-medium">{m.route || '—'}</td>
                  <td className="px-5 py-4 text-gray-600 dark:text-gray-400 font-medium">{m.reason || '—'}</td>
                  {!isReadOnly && (
                    <td className="px-5 py-4 text-right">
                      <button onClick={() => onDelete(m.id)} className="w-8 h-8 rounded-full inline-flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors">
                        <Trash2 className="w-4 h-4" strokeWidth={2}/>
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
