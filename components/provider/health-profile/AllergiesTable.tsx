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
    <div className="flex flex-col border border-black/10 dark:border-white/10 mt-6">
      <div className="p-4 bg-gray-50 dark:bg-[#050505] border-b border-black/10 dark:border-white/10 flex items-center justify-between">
        <h4 className="text-xs font-bold uppercase tracking-widest text-black dark:text-white flex items-center gap-2">
          <AlertOctagon className="w-4 h-4 text-red-500" strokeWidth={1.5} />
          Alergias
        </h4>
        {!isReadOnly && (
          <button 
            onClick={() => setIsAdding(true)}
            className="text-[9px] font-bold uppercase tracking-widest bg-black text-white dark:bg-white dark:text-black px-3 py-1.5"
          >
            <Plus className="w-3 h-3 inline mr-1" strokeWidth={1.5} /> Añadir
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs uppercase tracking-widest border-collapse">
          <thead>
            <tr className="bg-gray-100 dark:bg-black/40 border-b border-black/10 dark:border-white/10">
              <th className="px-4 py-3 font-semibold text-gray-500">Sustancia</th>
              <th className="px-4 py-3 font-semibold text-gray-500">Tipo</th>
              <th className="px-4 py-3 font-semibold text-gray-500">Gravedad</th>
              <th className="px-4 py-3 font-semibold text-gray-500">Reacción</th>
              {!isReadOnly && <th className="px-4 py-3 font-semibold text-gray-500 text-right">Acción</th>}
            </tr>
          </thead>
          <tbody>
            {isAdding && (
              <tr className="bg-gray-50 dark:bg-black/20 border-b border-black/10 dark:border-white/10">
                <td className="px-4 py-2">
                  <input type="text" className="w-full bg-transparent border border-black/20 dark:border-white/20 p-1 text-xs" placeholder="Sustancia" value={formData.substance} onChange={e => setFormData({...formData, substance: e.target.value})} />
                </td>
                <td className="px-4 py-2">
                  <input type="text" className="w-full bg-transparent border border-black/20 dark:border-white/20 p-1 text-xs" placeholder="Medicamento, Polen..." value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} />
                </td>
                <td className="px-4 py-2">
                  <select className="w-full bg-transparent border border-black/20 dark:border-white/20 p-1 text-xs" value={formData.severity} onChange={e => setFormData({...formData, severity: e.target.value})}>
                    <option value="Leve">Leve</option>
                    <option value="Moderada">Moderada</option>
                    <option value="Severa">Severa</option>
                  </select>
                </td>
                <td className="px-4 py-2">
                  <input type="text" className="w-full bg-transparent border border-black/20 dark:border-white/20 p-1 text-xs" placeholder="Erupción, asfixia..." value={formData.reaction} onChange={e => setFormData({...formData, reaction: e.target.value})} />
                </td>
                <td className="px-4 py-2 text-right">
                  <button disabled={isSubmitting} onClick={handleSubmit} className="text-emerald-500 hover:text-emerald-700 mr-2">Guardar</button>
                  <button onClick={() => setIsAdding(false)} className="text-gray-500 hover:text-black dark:hover:text-white">X</button>
                </td>
              </tr>
            )}
            {allergies.length === 0 && !isAdding ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-400">Sin alergias registradas</td>
              </tr>
            ) : (
              allergies.map(a => (
                <tr key={a.id} className="border-b border-black/5 dark:border-white/5 bg-white dark:bg-[#0a0a0a]">
                  <td className="px-4 py-3 font-semibold text-red-600 dark:text-red-400">{a.substance}</td>
                  <td className="px-4 py-3 text-gray-500">{a.type || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 font-bold text-[9px]`}>
                      {a.severity || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{a.reaction || '—'}</td>
                  {!isReadOnly && (
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => onDelete(a.id)} className="text-red-500 hover:text-red-700">
                        <Trash2 className="w-4 h-4" strokeWidth={1.5}/>
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
