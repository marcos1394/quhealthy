"use client";

import React, { useState, KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

interface TagInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    icon?: React.ReactNode;
}

/**
 * Componente premium de "Tag/Pill Input" para datos médicos.
 * El usuario escribe texto y al presionar Enter o coma se convierte en una
 * píldora visual eliminable. Se almacena internamente como string separado por ", ".
 */
export function TagInput({ value, onChange, placeholder, icon }: TagInputProps) {
    const [inputValue, setInputValue] = useState('');

    // Parse the comma-separated string into tags (safely handle null/undefined/non-string)
    const safeValue = typeof value === 'string' ? value : '';
    const tags = safeValue
        ? safeValue.split(',').map(t => t.trim()).filter(Boolean)
        : [];

    const addTag = (tag: string) => {
        const trimmed = tag.trim();
        if (!trimmed) return;
        // Avoid duplicates (case-insensitive)
        if (tags.some(t => t.toLowerCase() === trimmed.toLowerCase())) {
            setInputValue('');
            return;
        }
        const newTags = [...tags, trimmed];
        onChange(newTags.join(', '));
        setInputValue('');
    };

    const removeTag = (index: number) => {
        const newTags = tags.filter((_, i) => i !== index);
        onChange(newTags.join(', '));
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addTag(inputValue);
        }
        // Remove last tag on backspace if input is empty
        if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
            removeTag(tags.length - 1);
        }
    };

    return (
        <div className="space-y-3">
            {/* Tags display */}
            {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                        <Badge
                            key={`${tag}-${index}`}
                            variant="outline"
                            className="bg-medical-50 dark:bg-medical-500/10 text-medical-700 dark:text-medical-300 border-medical-200 dark:border-medical-500/20 px-3 py-1.5 text-sm font-medium rounded-lg flex items-center gap-1.5 animate-in fade-in-0 zoom-in-95 duration-200"
                        >
                            {tag}
                            <button
                                type="button"
                                onClick={() => removeTag(index)}
                                className="ml-0.5 hover:bg-medical-200 dark:hover:bg-medical-500/30 rounded-full p-0.5 transition-colors"
                                aria-label={`Remove ${tag}`}
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </Badge>
                    ))}
                </div>
            )}

            {/* Input field */}
            <div className="relative">
                {icon && (
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                        {icon}
                    </div>
                )}
                <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={() => addTag(inputValue)}
                    placeholder={tags.length === 0 ? placeholder : 'Agregar más...'}
                    className={`${icon ? 'pl-11' : ''} h-14 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-medical-500 focus:ring-medical-500/20 rounded-xl transition-all`}
                />
            </div>
        </div>
    );
}
