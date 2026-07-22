import React, { useState } from 'react';
import { PatientActiveProblem } from '@/types/healthProfile';
import { Trash2, AlertTriangle, CheckCircle, Activity, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { DatePicker } from '@/components/ui/date-picker';

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
    <div className="flex flex-col bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden mb-6">
      <div className="p-4 bg-gray-50/50 dark:bg-[#050505]/50 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-500" strokeWidth={2} />
          Problemas Activos
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-4">
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Diagnóstico</label>
              <input type="text" className="w-full bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow placeholder:text-gray-400" placeholder="Ej. Diabetes Mellitus" value={formData.diagnosis} onChange={e => setFormData({...formData, diagnosis: e.target.value})} />
            </div>
            <div className="flex flex-col gap-1.5 md:col-span-1">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Estado</label>
              <select className="w-full bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                <option value="ACTIVE">Activo</option>
                <option value="RESOLVED">Resuelto</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Fecha Inicio</label>
              <DatePicker
                value={formData.startDate ? new Date(formData.startDate + 'T12:00:00') : undefined}
                onChange={date => setFormData({...formData, startDate: date ? format(date, 'yyyy-MM-dd') : ''})}
                containerClassName="w-full"
                className="h-[38px] rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505] text-sm font-medium focus-visible:ring-emerald-500"
              />
            </div>
            <div className="flex flex-col gap-1.5 md:col-span-1">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Prioridad</label>
              <select className="w-full bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow" value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}>
                <option value="ALTA">Alta</option>
                <option value="MEDIA">Media</option>
                <option value="BAJA">Baja</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5 md:col-span-3">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Profesional</label>
              <input type="text" className="w-full bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow placeholder:text-gray-400" placeholder="Dr/Dra..." value={formData.professional} onChange={e => setFormData({...formData, professional: e.target.value})} />
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
              <th className="px-5 py-4 font-semibold text-gray-500 text-xs">Diagnóstico</th>
              <th className="px-5 py-4 font-semibold text-gray-500 text-xs">Estado</th>
              <th className="px-5 py-4 font-semibold text-gray-500 text-xs">Fecha Inicio</th>
              <th className="px-5 py-4 font-semibold text-gray-500 text-xs">Profesional</th>
              <th className="px-5 py-4 font-semibold text-gray-500 text-xs">Prioridad</th>
              {!isReadOnly && <th className="px-5 py-4 font-semibold text-gray-500 text-xs text-right">Acción</th>}
            </tr>
          </thead>
          <tbody>
            {problems.length === 0 && !isAdding ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-400 text-sm font-medium">Sin problemas registrados</td>
              </tr>
            ) : (
              problems.map(p => (
                <tr key={p.id} className="border-b border-gray-50 dark:border-gray-800/50 bg-white dark:bg-[#0a0a0a] hover:bg-gray-50/50 dark:hover:bg-[#111]/50 transition-colors">
                  <td className="px-5 py-4 font-semibold text-gray-900 dark:text-white">{p.diagnosis}</td>
                  <td className="px-5 py-4">
                    {p.status === 'ACTIVE' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold border rounded-lg whitespace-nowrap border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-400">
                        <AlertTriangle className="w-3 h-3"/> Activo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold border rounded-lg whitespace-nowrap border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-400">
                        <CheckCircle className="w-3 h-3"/> Resuelto
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-gray-600 dark:text-gray-400 font-medium">{p.startDate ? format(new Date(p.startDate), 'dd/MM/yyyy') : '—'}</td>
                  <td className="px-5 py-4 text-gray-600 dark:text-gray-400 font-medium">{p.professional || '—'}</td>
                  <td className="px-5 py-4 text-gray-600 dark:text-gray-400 font-medium">{p.priority || '—'}</td>
                  {!isReadOnly && (
                    <td className="px-5 py-4 text-right">
                      <button onClick={() => onDelete(p.id)} className="w-8 h-8 rounded-full inline-flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors">
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
