"use client";

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, UserPlus, Baby, User, Trash2, Calendar, Plus, X, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFamily } from '@/hooks/useFamily';
import { DependentRequest } from '@/types/dependent';

export default function PatientFamilyDashboard() {
    const t = useTranslations('PatientFamilyDashboard');
    const { family, isLoading, isSubmitting, addMember, removeMember } = useFamily();
    const [showAddForm, setShowAddForm] = useState(false);

    // Estado del formulario
    const [formData, setFormData] = useState<DependentRequest>({
        firstName: '', lastName: '', dateOfBirth: '', gender: 'OTHER', relationship: 'CHILD', medicalNotes: ''
    });

    const handleAddSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await addMember(formData, () => {
            setShowAddForm(false);
            setFormData({ firstName: '', lastName: '', dateOfBirth: '', gender: 'OTHER', relationship: 'CHILD', medicalNotes: '' });
        });
    };

    // Helper para calcular edad
    const calculateAge = (dob: string) => {
        const diffMs = Date.now() - new Date(dob).getTime();
        const ageDt = new Date(diffMs);
        return Math.abs(ageDt.getUTCFullYear() - 1970);
    };

    // Helper de iconos
    const getRelationshipIcon = (rel: string) => {
        if (rel === 'CHILD') return <Baby className="w-6 h-6 text-indigo-500" />;
        return <User className="w-6 h-6 text-indigo-500" />;
    };

    // Helper para traducir el parentesco de forma segura (evita errores de TS con claves dinámicas)
    const getTranslatedRelationship = (rel: string) => {
        switch (rel) {
            case 'CHILD': return t('rel_child');
            case 'PARENT': return t('rel_parent');
            case 'SPOUSE': return t('rel_spouse');
            case 'SIBLING': return t('rel_sibling');
            default: return t('rel_other');
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans pb-20">
            <div className="max-w-5xl mx-auto px-4 py-8 md:py-12 space-y-8">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-5">
                        <div className="p-3.5 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-2xl shadow-lg shadow-indigo-500/20 text-white">
                            <Users className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                                {t('title')}
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 mt-1 text-lg font-light">
                                {t('subtitle')}
                            </p>
                        </div>
                    </div>
                    
                    {!showAddForm && (
                        <Button 
                            onClick={() => setShowAddForm(true)}
                            className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl shadow-md hover:bg-slate-800 dark:hover:bg-slate-200 font-bold"
                        >
                            <UserPlus className="w-4 h-4 mr-2" /> {t('btn_add_member')}
                        </Button>
                    )}
                </div>

                {/* Formulario para Añadir */}
                <AnimatePresence>
                    {showAddForm && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }} 
                            animate={{ opacity: 1, height: 'auto' }} 
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/30 rounded-3xl p-6 md:p-8 shadow-sm relative">
                                <button onClick={() => setShowAddForm(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-white bg-slate-100 dark:bg-slate-800 p-2 rounded-full transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                                
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">{t('form_title')}</h3>
                                
                                <form onSubmit={handleAddSubmit} className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('label_first_name')}</label>
                                            <Input required value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('label_last_name')}</label>
                                            <Input required value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('label_dob')}</label>
                                            <Input type="date" required value={formData.dateOfBirth} onChange={e => setFormData({...formData, dateOfBirth: e.target.value})} className="rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 block w-full" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('label_relationship')}</label>
                                            <select required value={formData.relationship} onChange={e => setFormData({...formData, relationship: e.target.value})} className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm focus:ring-2 focus:ring-indigo-500">
                                                <option value="CHILD">{t('rel_child')}</option>
                                                <option value="PARENT">{t('rel_parent')}</option>
                                                <option value="SPOUSE">{t('rel_spouse')}</option>
                                                <option value="SIBLING">{t('rel_sibling')}</option>
                                                <option value="OTHER">{t('rel_other')}</option>
                                            </select>
                                        </div>
                                    </div>
                                    
                                    <div className="pt-4 flex justify-end gap-3">
                                        <Button type="button" variant="outline" onClick={() => setShowAddForm(false)} className="rounded-xl border-slate-200 dark:border-slate-700">{t('btn_cancel')}</Button>
                                        <Button type="submit" disabled={isSubmitting} className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
                                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />} {t('btn_save')}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Grid de Familiares */}
                {!showAddForm && family.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {family.map((member) => (
                            <div key={member.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => removeMember(member.id)} className="text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 bg-rose-50 dark:bg-rose-500/10 p-2 rounded-full transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-14 h-14 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center border border-indigo-100 dark:border-indigo-500/20">
                                        {getRelationshipIcon(member.relationship)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight">
                                            {member.firstName} {member.lastName}
                                        </h3>
                                        <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                            {getTranslatedRelationship(member.relationship)}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-2 mt-5 pt-5 border-t border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                                        <Calendar className="w-4 h-4 mr-2 opacity-70" />
                                        {calculateAge(member.dateOfBirth)} {t('age_years')} ({t('dob_prefix')}: {member.dateOfBirth})
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Estado Vacío */}
                {!showAddForm && family.length === 0 && (
                    <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 border-dashed">
                        <Users className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                            {t('empty_title')}
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto mb-6">
                            {t('empty_desc')}
                        </p>
                        <Button 
                            onClick={() => setShowAddForm(true)}
                            className="rounded-full bg-indigo-600 text-white hover:bg-indigo-700 font-bold"
                        >
                            <UserPlus className="w-4 h-4 mr-2" /> {t('btn_add_first')}
                        </Button>
                    </div>
                )}

            </div>
        </div>
    );
}