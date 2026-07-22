import React, { useState } from 'react';
import { PatientAllergy } from '@/types/healthProfile';
import { Trash2, AlertOctagon, Plus } from 'lucide-react';
import { format } from 'date-fns';

interface AllergiesTableProps {
  allergies: PatientAllergy[];
  isReadOnly: boolean;
  onAdd: (allergy: any) => Promise<boolean>;
  onDelete: (id: number) => Promise<boolean>;
}

export function AllergiesTable({ allergies, isReadOnly, onAdd, onDelete }: AllergiesTableProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    substance: '',
    type: 'Alimento',
    severity: 'Leve',
    reaction: '',
    status: 'ACTIVE'
  });

  const handleSubmit = async () => {
    if (!formData.substance) return;
    setIsSubmitting(true);
    const success = await onAdd(formData);
    if (success) {
      setIsAdding(false);
      setFormData({ substance: '', type: 'Alimento', severity: 'Leve', reaction: '', status: 'ACTIVE' });
    }
    setIsSubmitting(false);
  };

  return (
    <div className="flex flex-col bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden mb-6 mt-6">
      <div className="p-4 bg-gray-50/50 dark:bg-[#050505]/50 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <AlertOctagon className="w-4 h-4 text-red-500" strokeWidth={2} />
          Alergias
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Sustancia</label>
              <input type="text" className="w-full bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow placeholder:text-gray-400" placeholder="Sustancia" value={formData.substance} onChange={e => setFormData({...formData, substance: e.target.value})} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Tipo</label>
              <input type="text" className="w-full bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow placeholder:text-gray-400" placeholder="Medicamento, Polen..." value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Gravedad</label>
              <select className="w-full bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow" value={formData.severity} onChange={e => setFormData({...formData, severity: e.target.value})}>
                <option value="Leve">Leve</option>
                <option value="Moderada">Moderada</option>
                <option value="Severa">Severa</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Reacción</label>
              <input type="text" className="w-full bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow placeholder:text-gray-400" placeholder="Erupción, asfixia..." value={formData.reaction} onChange={e => setFormData({...formData, reaction: e.target.value})} />
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
              <th className="px-5 py-4 font-semibold text-gray-500 text-xs">Sustancia</th>
              <th className="px-5 py-4 font-semibold text-gray-500 text-xs">Tipo</th>
              <th className="px-5 py-4 font-semibold text-gray-500 text-xs">Gravedad</th>
              <th className="px-5 py-4 font-semibold text-gray-500 text-xs">Reacción</th>
              {!isReadOnly && <th className="px-5 py-4 font-semibold text-gray-500 text-xs text-right">Acción</th>}
            </tr>
          </thead>
          <tbody>
            {allergies.length === 0 && !isAdding ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-400 text-sm font-medium">Sin alergias registradas</td>
              </tr>
            ) : (
              allergies.map(a => (
                <tr key={a.id} className="border-b border-gray-50 dark:border-gray-800/50 bg-white dark:bg-[#0a0a0a] hover:bg-gray-50/50 dark:hover:bg-[#111]/50 transition-colors">
                  <td className="px-5 py-4 font-semibold text-gray-900 dark:text-white">{a.substance}</td>
                  <td className="px-5 py-4 text-gray-600 dark:text-gray-400 font-medium">{a.type || '—'}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400 font-semibold text-xs rounded-lg whitespace-nowrap`}>
                      {a.severity || '—'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-600 dark:text-gray-400 font-medium">{a.reaction || '—'}</td>
                  {!isReadOnly && (
                    <td className="px-5 py-4 text-right">
                      <button onClick={() => onDelete(a.id)} className="w-8 h-8 rounded-full inline-flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors">
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
