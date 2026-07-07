"use client";

import React, { useEffect, useState } from 'react';
import { clinicalSubmissionService, ClinicalSubmissionResponse } from '@/services/clinicalSubmissions.service';
import { FileText, Download, Loader2, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { handleApiError } from '@/lib/handleApiError';
import { useSessionStore } from '@/stores/SessionStore';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ClinicalFormsHistoryProps {
    patientId: number;
}

export function ClinicalFormsHistory({ patientId }: ClinicalFormsHistoryProps) {
    const { token, user } = useSessionStore();
    const [history, setHistory] = useState<ClinicalSubmissionResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (patientId) {
            loadHistory();
        }
    }, [patientId]);

    const loadHistory = async () => {
        try {
            setIsLoading(true);
            const data = await clinicalSubmissionService.getPatientHistory(patientId);
            setHistory(data);
        } catch (error) {
            handleApiError(error, "Error al cargar historial de fichas clínicas");
        } finally {
            setIsLoading(false);
        }
    };

    const downloadPdf = async (id: number, templateName: string) => {
        try {
            const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/appointments/clinical-submissions/${id}/pdf`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'X-User-Id': String(user?.id)
                }
            });

            if (!response.ok) {
                throw new Error("No se pudo descargar el certificado");
            }

            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = `${templateName.replace(/\s+/g, '_')}_${id}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (error) {
            handleApiError(error, "Error al generar el PDF");
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-black dark:text-white" />
            </div>
        );
    }

    if (history.length === 0) {
        return (
            <div className="text-center py-12 border border-dashed border-gray-300 dark:border-gray-700 bg-white dark:bg-black">
                <FileText className="w-8 h-8 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-xs text-gray-500 uppercase tracking-widest">
                    No hay fichas clínicas finalizadas para este paciente.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {history.map((sub) => (
                    <div key={sub.id} className="border border-black dark:border-white p-6 bg-white dark:bg-[#050505] flex flex-col justify-between hover:bg-gray-50 dark:hover:bg-[#0a0a0a] transition-colors">
                        <div>
                            <div className="flex items-start justify-between mb-4">
                                <span className="bg-black text-white dark:bg-white dark:text-black px-2 py-1 text-[9px] font-bold uppercase tracking-widest">
                                    {sub.template?.category || 'GENERAL'}
                                </span>
                                <div className="flex items-center text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    {sub.updatedAt ? format(new Date(sub.updatedAt), "dd MMM yyyy", { locale: es }) : 'N/A'}
                                </div>
                            </div>
                            
                            <h3 className="text-sm font-bold uppercase tracking-widest text-black dark:text-white mb-2">
                                {sub.template?.name || 'Ficha Clínica'}
                            </h3>
                            
                            <div className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mt-2">
                                {/* Preview de los datos */}
                                {Object.entries(sub.data || {})
                                    .filter(([_, v]) => v)
                                    .slice(0, 3)
                                    .map(([k, v]) => `${k}: ${v}`)
                                    .join(' | ')}
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-black/10 dark:border-white/10 flex justify-end">
                            <Button
                                onClick={() => downloadPdf(sub.id, sub.template?.name || 'documento')}
                                variant="outline"
                                className="border-black dark:border-white rounded-none uppercase text-[9px] font-bold h-8 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
                            >
                                <Download className="w-3 h-3 mr-2" />
                                Descargar PDF
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
