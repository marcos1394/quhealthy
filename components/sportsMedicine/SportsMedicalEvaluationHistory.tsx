import React, { useEffect, useState } from 'react';
import { Download, Activity, FileText } from 'lucide-react';
import { sportsMedicineService } from '@/services/sportsMedicine.service';
import { SportsMedicalEvaluationResponse } from '@/types/sportsMedicine';
import { QhSpinner } from '@/components/ui/QhSpinner';

interface SportsMedicalEvaluationHistoryProps {
    patientId: number;
}

export function SportsMedicalEvaluationHistory({ patientId }: SportsMedicalEvaluationHistoryProps) {
    const [evaluations, setEvaluations] = useState<SportsMedicalEvaluationResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            if (!patientId) return;
            setIsLoading(true);
            try {
                const data = await sportsMedicineService.getPatientHistory(patientId);
                // Filtrar solo los FINAL para la vista del historial clínico general
                setEvaluations(data.filter(e => e.status === 'FINAL'));
            } catch (error) {
                console.error("Error fetching sports medicine history", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchHistory();
    }, [patientId]);

    const handleDownload = async (id: number) => {
        try {
            await sportsMedicineService.downloadPdf(id);
        } catch (error) {
            console.error("Error downloading pdf", error);
            alert("No se pudo descargar el certificado.");
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center p-4">
                <QhSpinner size="sm" />
            </div>
        );
    }

    if (evaluations.length === 0) {
        return (
            <div className="text-center p-6 border border-dashed border-gray-300 dark:border-gray-800 rounded-none bg-gray-50 dark:bg-[#050505]">
                <Activity className="w-8 h-8 text-gray-400 mx-auto mb-2 opacity-50" />
                <p className="text-[10px] uppercase font-bold tracking-widest text-gray-500">No hay evaluaciones deportivas registradas.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-black dark:text-white flex items-center gap-2 border-b border-black dark:border-white pb-2">
                <Activity className="w-4 h-4" />
                Historial Deportivo
            </h3>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-black/20 dark:border-white/20">
                            <th className="p-2 text-[10px] font-bold uppercase tracking-widest text-gray-500">Fecha</th>
                            <th className="p-2 text-[10px] font-bold uppercase tracking-widest text-gray-500">Tipo</th>
                            <th className="p-2 text-[10px] font-bold uppercase tracking-widest text-gray-500">Resultado</th>
                            <th className="p-2 text-[10px] font-bold uppercase tracking-widest text-gray-500">Documento</th>
                        </tr>
                    </thead>
                    <tbody>
                        {evaluations.map((evalItem) => (
                            <tr key={evalItem.id} className="border-b border-gray-100 dark:border-gray-900 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                <td className="p-2 text-xs text-black dark:text-white">
                                    {new Date(evalItem.createdAt).toLocaleDateString()}
                                </td>
                                <td className="p-2 text-xs text-black dark:text-white">
                                    {evalItem.injuryType ? `Lesión: ${evalItem.injuryType}` : 'Aptitud Física'}
                                </td>
                                <td className="p-2 text-xs">
                                    <span className="bg-black text-white dark:bg-white dark:text-black px-2 py-0.5 text-[9px] uppercase font-bold tracking-widest">
                                        {evalItem.evaluationResult?.replace(/_/g, ' ')}
                                    </span>
                                </td>
                                <td className="p-2">
                                    <button 
                                        onClick={() => handleDownload(evalItem.id)}
                                        className="text-black dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest"
                                    >
                                        <FileText className="w-3.5 h-3.5" /> PDF
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
