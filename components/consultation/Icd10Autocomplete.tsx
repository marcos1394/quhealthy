import React, { useState, useEffect } from 'react';
import { useTranslations } from "next-intl";
import { Search, X, PlusCircle, Activity } from "lucide-react";
import { consumerProfileService } from '@/services/consumerProfile.service';
import { AppointmentDiagnosis } from '@/types/ehr';
import { QhSpinner } from '@/components/ui/QhSpinner';

interface Icd10AutocompleteProps {
    diagnoses: AppointmentDiagnosis[];
    addDiagnosis: (diagnosis: Omit<AppointmentDiagnosis, 'id'>) => void;
    removeDiagnosis: (id: string) => void;
}

export const Icd10Autocomplete: React.FC<Icd10AutocompleteProps> = ({ diagnoses, addDiagnosis, removeDiagnosis }) => {
    const t = useTranslations('EHR');
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (query.length > 2) {
                setLoading(true);
                try {
                    const data = await consumerProfileService.searchIcd10(query, 10);
                    setResults(data.content || data || []);
                    setShowResults(true);
                } catch (error) {
                    console.error("Error fetching ICD10", error);
                } finally {
                    setLoading(false);
                }
            } else {
                setResults([]);
                setShowResults(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    const handleSelect = (item: any) => {
        addDiagnosis({
            cie10Code: item.code,
            cie10Description: item.name || item.description,
            type: 'PRIMARY'
        });
        setQuery('');
        setShowResults(false);
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="relative z-50">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] text-xs font-semibold uppercase tracking-widest text-black dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-0 focus:border-black dark:focus:border-white rounded-none"
                    placeholder="BUSCAR DIAGNÓSTICO (CÓDIGO O DESCRIPCIÓN)..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                {loading && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <QhSpinner size="sm" />
                    </div>
                )}

                {showResults && results.length > 0 && (
                    <ul className="absolute z-[100] mt-1 w-full bg-white dark:bg-[#0a0a0a] shadow-2xl max-h-60 rounded-none border border-black/20 dark:border-white/20 overflow-auto text-xs font-semibold uppercase tracking-widest">
                        {results.map((item) => (
                            <li
                                key={item.code}
                                className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-100 dark:hover:bg-[#111] text-black dark:text-white border-b border-black/10 dark:border-white/10"
                                onClick={() => handleSelect(item)}
                            >
                                <span className="font-bold">{item.code}</span> - {item.name || item.description}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Selected Diagnoses */}
            {diagnoses.length > 0 && (
                <div className="flex flex-col gap-2">
                    {diagnoses.map((diag) => (
                        <div key={diag.id} className="flex items-start justify-between p-3 border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a]">
                            <div className="flex flex-col gap-1">
                                <span className="text-xs font-bold uppercase text-black dark:text-white">
                                    {diag.cie10Code} - {diag.cie10Description}
                                </span>
                                <span className="text-[9px] uppercase tracking-widest text-gray-500">
                                    TIPO: {diag.type === 'PRIMARY' ? 'PRINCIPAL' : 'SECUNDARIO'}
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={() => removeDiagnosis(diag.id)}
                                className="text-gray-400 hover:text-red-500 transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
