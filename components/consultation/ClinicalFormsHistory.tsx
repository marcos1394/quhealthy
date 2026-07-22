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
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
        );
    }

    if (history.length === 0) {
        return (
            <div className="text-center py-12 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]">
                <FileText className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-sm font-medium text-gray-500">
                    No hay fichas clínicas finalizadas para este paciente.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {history.map((sub) => (
                    <div key={sub.id} className="rounded-2xl border border-gray-100 dark:border-gray-800 p-6 bg-white dark:bg-[#0a0a0a] flex flex-col justify-between hover:border-emerald-200 dark:hover:border-emerald-900 transition-colors shadow-sm">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <span className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-3 py-1 text-xs font-semibold rounded-full">
                                    {sub.template?.category || 'GENERAL'}
                                </span>
                                <div className="flex items-center text-xs font-medium text-gray-500">
                                    <Calendar className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                                    {sub.updatedAt ? format(new Date(sub.updatedAt), "dd MMM yyyy", { locale: es }) : 'N/A'}
                                </div>
                            </div>
                            
                            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">
                                {sub.template?.name || 'Ficha Clínica'}
                            </h3>
                            
                            <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-2 leading-relaxed">
                                {/* Preview de los datos */}
                                {Object.entries(sub.data || {})
                                    .filter(([_, v]) => v)
                                    .slice(0, 3)
                                    .map(([k, v]) => `${k}: ${v}`)
                                    .join(' | ')}
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                            <Button
                                onClick={() => downloadPdf(sub.id, sub.template?.name || 'documento')}
                                variant="outline"
                                className="rounded-xl border-gray-200 bg-white font-semibold text-gray-700 hover:bg-gray-50 shadow-sm dark:bg-gray-900 dark:border-gray-800 dark:text-gray-200 dark:hover:bg-gray-800 h-9 px-4"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Descargar PDF
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
