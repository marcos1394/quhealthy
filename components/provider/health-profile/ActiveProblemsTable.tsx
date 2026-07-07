import React, { useState } from 'react';
import { PatientActiveProblem } from '@/types/healthProfile';
import { Trash2, AlertTriangle, CheckCircle, Activity, Plus } from 'lucide-react';
import { format } from 'date-fns';

interface ActiveProblemsTableProps {
  problems: PatientActiveProblem[];
  isReadOnly: boolean;
  onAdd: (problem: any) => Promise<boolean>;
  onDelete: (id: number) => Promise<boolean>;
}

export function ActiveProblemsTable({ problems, isReadOnly, onAdd, onDelete }: ActiveProblemsTableProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    diagnosis: '',
    status: 'ACTIVE',
    startDate: '',
    professional: '',
    priority: 'MEDIA'
  });

  const handleSubmit = async () => {
    if (!formData.diagnosis) return;
    setIsSubmitting(true);
    const success = await onAdd(formData);
    if (success) {
      setIsAdding(false);
      setFormData({ diagnosis: '', status: 'ACTIVE', startDate: '', professional: '', priority: 'MEDIA' });
    }
    setIsSubmitting(false);
  };

  return (
    <div className="flex flex-col border border-black/10 dark:border-white/10">
      <div className="p-4 bg-gray-50 dark:bg-[#050505] border-b border-black/10 dark:border-white/10 flex items-center justify-between">
        <h4 className="text-xs font-bold uppercase tracking-widest text-black dark:text-white flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-500" strokeWidth={1.5} />
          Problemas Activos
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
              <label className="text-[9px] text-gray-500">Diagnóstico</label>
              <input type="text" className="w-full bg-white dark:bg-[#0a0a0a] border border-black/20 dark:border-white/20 p-2 text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white" placeholder="Ej. Diabetes Mellitus" value={formData.diagnosis} onChange={e => setFormData({...formData, diagnosis: e.target.value})} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[9px] text-gray-500">Estado</label>
              <select className="w-full bg-white dark:bg-[#0a0a0a] border border-black/20 dark:border-white/20 p-2 text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                <option value="ACTIVE">Activo</option>
                <option value="RESOLVED">Resuelto</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[9px] text-gray-500">Fecha Inicio</label>
              <input type="date" className="w-full bg-white dark:bg-[#0a0a0a] border border-black/20 dark:border-white/20 p-2 text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[9px] text-gray-500">Prioridad</label>
              <select className="w-full bg-white dark:bg-[#0a0a0a] border border-black/20 dark:border-white/20 p-2 text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white" value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}>
                <option value="ALTA">Alta</option>
                <option value="MEDIA">Media</option>
                <option value="BAJA">Baja</option>
              </select>
            </div>
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-[9px] text-gray-500">Profesional</label>
              <input type="text" className="w-full bg-white dark:bg-[#0a0a0a] border border-black/20 dark:border-white/20 p-2 text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white" placeholder="Dr/Dra..." value={formData.professional} onChange={e => setFormData({...formData, professional: e.target.value})} />
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
              <th className="px-4 py-3 font-semibold text-gray-500">Diagnóstico</th>
              <th className="px-4 py-3 font-semibold text-gray-500">Estado</th>
              <th className="px-4 py-3 font-semibold text-gray-500">Fecha Inicio</th>
              <th className="px-4 py-3 font-semibold text-gray-500">Profesional</th>
              <th className="px-4 py-3 font-semibold text-gray-500">Prioridad</th>
              {!isReadOnly && <th className="px-4 py-3 font-semibold text-gray-500 text-right">Acción</th>}
            </tr>
          </thead>
          <tbody>
            {problems.length === 0 && !isAdding ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-400">Sin problemas registrados</td>
              </tr>
            ) : (
              problems.map(p => (
                <tr key={p.id} className="border-b border-black/5 dark:border-white/5 bg-white dark:bg-[#0a0a0a]">
                  <td className="px-4 py-3 font-semibold text-black dark:text-white">{p.diagnosis}</td>
                  <td className="px-4 py-3">
                    {p.status === 'ACTIVE' ? (
                      <span className="flex items-center gap-1 text-amber-600"><AlertTriangle className="w-3 h-3"/> Activo</span>
                    ) : (
                      <span className="flex items-center gap-1 text-emerald-600"><CheckCircle className="w-3 h-3"/> Resuelto</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{p.startDate ? format(new Date(p.startDate), 'dd/MM/yyyy') : '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{p.professional || '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{p.priority || '—'}</td>
                  {!isReadOnly && (
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => onDelete(p.id)} className="text-red-500 hover:text-red-700">
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
