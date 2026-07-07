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
    <div className="flex flex-col border border-black/10 dark:border-white/10 mt-6">
      <div className="p-4 bg-gray-50 dark:bg-[#050505] border-b border-black/10 dark:border-white/10 flex items-center justify-between">
        <h4 className="text-xs font-bold uppercase tracking-widest text-black dark:text-white flex items-center gap-2">
          <Pill className="w-4 h-4 text-emerald-500" strokeWidth={1.5} />
          Medicamentos Actuales
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
              <th className="px-4 py-3 font-semibold text-gray-500">Medicamento</th>
              <th className="px-4 py-3 font-semibold text-gray-500">Dosis y Frec.</th>
              <th className="px-4 py-3 font-semibold text-gray-500">Vía</th>
              <th className="px-4 py-3 font-semibold text-gray-500">Motivo</th>
              {!isReadOnly && <th className="px-4 py-3 font-semibold text-gray-500 text-right">Acción</th>}
            </tr>
          </thead>
          <tbody>
            {isAdding && (
              <tr className="bg-gray-50 dark:bg-black/20 border-b border-black/10 dark:border-white/10">
                <td className="px-4 py-2">
                  <input type="text" className="w-full bg-transparent border border-black/20 dark:border-white/20 p-1 text-xs" placeholder="Medicamento" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </td>
                <td className="px-4 py-2 flex gap-1">
                  <input type="text" className="w-1/2 bg-transparent border border-black/20 dark:border-white/20 p-1 text-xs" placeholder="Dosis" value={formData.dosage} onChange={e => setFormData({...formData, dosage: e.target.value})} />
                  <input type="text" className="w-1/2 bg-transparent border border-black/20 dark:border-white/20 p-1 text-xs" placeholder="Frecuencia" value={formData.frequency} onChange={e => setFormData({...formData, frequency: e.target.value})} />
                </td>
                <td className="px-4 py-2">
                  <input type="text" className="w-full bg-transparent border border-black/20 dark:border-white/20 p-1 text-xs" placeholder="Vía (Oral, etc)" value={formData.route} onChange={e => setFormData({...formData, route: e.target.value})} />
                </td>
                <td className="px-4 py-2">
                  <input type="text" className="w-full bg-transparent border border-black/20 dark:border-white/20 p-1 text-xs" placeholder="Motivo" value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} />
                </td>
                <td className="px-4 py-2 text-right">
                  <button disabled={isSubmitting} onClick={handleSubmit} className="text-emerald-500 hover:text-emerald-700 mr-2">Guardar</button>
                  <button onClick={() => setIsAdding(false)} className="text-gray-500 hover:text-black dark:hover:text-white">X</button>
                </td>
              </tr>
            )}
            {medications.length === 0 && !isAdding ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-400">Sin medicamentos registrados</td>
              </tr>
            ) : (
              medications.map(m => (
                <tr key={m.id} className="border-b border-black/5 dark:border-white/5 bg-white dark:bg-[#0a0a0a]">
                  <td className="px-4 py-3 font-semibold text-black dark:text-white">{m.name}</td>
                  <td className="px-4 py-3 text-gray-500">{m.dosage} - {m.frequency}</td>
                  <td className="px-4 py-3 text-gray-500">{m.route || '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{m.reason || '—'}</td>
                  {!isReadOnly && (
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => onDelete(m.id)} className="text-red-500 hover:text-red-700">
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
