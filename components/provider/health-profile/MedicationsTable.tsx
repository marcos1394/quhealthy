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

      {isAdding && (
        <div className="p-4 bg-gray-50 dark:bg-[#050505] border-b border-black/10 dark:border-white/10 flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 text-xs font-semibold uppercase tracking-widest">
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-[9px] text-gray-500">Medicamento</label>
              <input type="text" className="w-full bg-white dark:bg-[#0a0a0a] border border-black/20 dark:border-white/20 p-2 text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white" placeholder="Medicamento" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[9px] text-gray-500">Dosis</label>
              <input type="text" className="w-full bg-white dark:bg-[#0a0a0a] border border-black/20 dark:border-white/20 p-2 text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white" placeholder="Ej. 500mg" value={formData.dosage} onChange={e => setFormData({...formData, dosage: e.target.value})} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[9px] text-gray-500">Frecuencia</label>
              <input type="text" className="w-full bg-white dark:bg-[#0a0a0a] border border-black/20 dark:border-white/20 p-2 text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white" placeholder="Ej. Cada 8 horas" value={formData.frequency} onChange={e => setFormData({...formData, frequency: e.target.value})} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[9px] text-gray-500">Vía</label>
              <input type="text" className="w-full bg-white dark:bg-[#0a0a0a] border border-black/20 dark:border-white/20 p-2 text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white" placeholder="Ej. Oral, Intravenosa" value={formData.route} onChange={e => setFormData({...formData, route: e.target.value})} />
            </div>
            <div className="flex flex-col gap-1 md:col-span-5">
              <label className="text-[9px] text-gray-500">Motivo</label>
              <input type="text" className="w-full bg-white dark:bg-[#0a0a0a] border border-black/20 dark:border-white/20 p-2 text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white" placeholder="Motivo" value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} />
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 mt-2">
            <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-[9px] font-bold uppercase tracking-widest text-gray-500 hover:text-black dark:hover:text-white border border-transparent hover:border-black/20 dark:hover:border-white/20 transition-colors">
              Cancelar
            </button>
            <button disabled={isSubmitting} onClick={handleSubmit} className="px-6 py-2 text-[9px] font-bold uppercase tracking-widest bg-black text-white dark:bg-white dark:text-black disabled:opacity-50 transition-colors">
              {isSubmitting ? 'Guardando...' : 'Guardar Registro'}
            </button>
          </div>
        </div>
      )}

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
