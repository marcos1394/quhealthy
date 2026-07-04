"use client"
/* eslint-disable react-doctor/button-has-type */;

import React, { useState } from 'react';
import { Plus, Ticket, ArrowLeft, Percent, DollarSign, Settings2 } from 'lucide-react';
import { useRecommendationConfig } from '@/hooks/useRecommendationConfig';
import { RecommendationConfigDto } from '@/services/recommendationService';
import { RecommendationSettingsForm } from './RecommendationSettingsForm';
import { QhSpinner } from '@/components/ui/QhSpinner';
import { cn } from '@/lib/utils';

export const RecommendationsManager = () => {
 const { campaigns, isLoading, refreshConfig } = useRecommendationConfig();
 
 const [view, setView] = useState<'list' | 'form'>('list');
 const [selectedCampaign, setSelectedCampaign] = useState<RecommendationConfigDto | undefined>(undefined);

 const handleCreateNew = () => {
 setSelectedCampaign(undefined);
 setView('form');
 };

 const handleEdit = (campaign: RecommendationConfigDto) => {
 setSelectedCampaign(campaign);
 setView('form');
 };

 const handleGoBack = () => {
 refreshConfig(); 
 setView('list');
 };

 if (isLoading) {
 return (
 <div className="flex flex-col justify-center items-center py-24 bg-gray-50 dark:bg-[#050505] border border-black/20 dark:border-white/20">
 <QhSpinner size="lg" className="text-black dark:text-white" />
 <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mt-6 animate-pulse">
 EXTRAYENDO CAMPAÑAS...
 </p>
 </div>
 );
 }

 // VISTA 1: FORMULARIO
 if (view === 'form') {
 return (
 <div className="flex flex-col bg-white dark:bg-[#0a0a0a] border border-black/20 dark:border-white/20">
 <div className="p-6 border-b border-black/10 dark:border-white/10 bg-gray-50 dark:bg-[#050505] flex items-center">
 <button 
 onClick={handleGoBack}
 className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-gray-500 hover:text-black dark:hover:text-white transition-colors"
 >
 <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.5} /> VOLVER AL DIRECTORIO
 </button>
 </div>
 
 <div className="p-0">
 <RecommendationSettingsForm 
 initialData={selectedCampaign} 
 onSaved={handleGoBack} 
 />
 </div>
 </div>
 );
 }

 // VISTA 2: LISTA (DASHBOARD)
 return (
 <div className="flex flex-col font-sans transition-colors duration-500">
 
 {/* HEADER ARQUITECTÓNICO */}
 <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 mb-6 border-b border-black/20 dark:border-white/20">
 <div className="flex items-start gap-5">
 <div className="w-16 h-16 border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] flex items-center justify-center shrink-0">
 <Ticket className="w-6 h-6 text-black dark:text-white" strokeWidth={1.5} />
 </div>
 <div>
 <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">
 Programa de Afiliados
 </p>
 <h2 className="text-2xl md:text-3xl font-semibold uppercase tracking-tight text-black dark:text-white mb-2 leading-none">
 CÓDIGOS PROMOCIONALES
 </h2>
 <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
 GESTIÓN DE CAMPAÑAS DE RECOMENDACIÓN Y COMISIONES.
 </p>
 </div>
 </div>
 <button 
 onClick={handleCreateNew} 
 className="h-12 px-6 bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 border-0 rounded-none shrink-0 w-full md:w-auto"
 >
 <Plus className="w-4 h-4" strokeWidth={1.5} /> NUEVA CAMPAÑA
 </button>
 </div>

 {campaigns.length === 0 ? (
 <div className="flex flex-col items-center justify-center py-24 text-center border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a]">
 <div className="w-16 h-16 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] flex items-center justify-center mb-6">
 <Ticket className="w-6 h-6 text-gray-400" strokeWidth={1.5} />
 </div>
 <h3 className="text-sm font-semibold uppercase tracking-tight text-black dark:text-white mb-2">
 SIN CAMPAÑAS ACTIVAS
 </h3>
 <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 max-w-xs leading-relaxed mb-6">
 AÚN NO EXISTEN CÓDIGOS PROMOCIONALES GENERADOS EN EL SISTEMA.
 </p>
 <button 
 onClick={handleCreateNew} 
 className="h-10 px-6 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors text-[9px] font-bold uppercase tracking-widest rounded-none"
 >
 CREAR PRIMER CÓDIGO
 </button>
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border-t border-l border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505]">
 {campaigns.map((campaign, index) => (
 <div key={campaign.id || index} className="flex flex-col border-b border-r border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] hover:bg-gray-50 dark:hover:bg-[#111] transition-colors">
 
 <div className="p-6 md:p-8 flex-1">
 <div className="flex justify-between items-start mb-6">
 <span className="px-3 py-1 border border-black/20 dark:border-white/20 bg-black text-white dark:bg-white dark:text-black font-mono text-xs font-bold uppercase tracking-widest">
 {campaign.campaignCode}
 </span>
 <span className={cn(
 "px-2 py-1 text-[8px] font-bold uppercase tracking-widest border",
 campaign.isActive 
 ? "border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/10 dark:text-emerald-400" 
 : "border-gray-500/30 bg-gray-50 text-gray-600 dark:bg-gray-900/10 dark:text-gray-400"
 )}>
 {campaign.isActive ? 'ACTIVA' : 'PAUSADA'}
 </span>
 </div>

 <div className="space-y-4">
 <div className="flex justify-between items-center border-b border-black/10 dark:border-white/10 pb-2">
 <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500">DESCUENTO PACIENTE</span>
 <span className="font-semibold text-xs text-black dark:text-white flex items-center">
 {campaign.isDiscountPercentage ? <Percent className="w-3 h-3 mr-1 text-gray-400" strokeWidth={1.5} /> : <DollarSign className="w-3 h-3 text-gray-400" strokeWidth={1.5} />}
 {campaign.discountAmount}
 </span>
 </div>
 <div className="flex justify-between items-center border-b border-black/10 dark:border-white/10 pb-2">
 <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500">COMISIÓN COLEGA</span>
 <span className="font-semibold text-xs text-black dark:text-white flex items-center">
 {campaign.isCommissionPercentage ? <Percent className="w-3 h-3 mr-1 text-gray-400" strokeWidth={1.5} /> : <DollarSign className="w-3 h-3 text-gray-400" strokeWidth={1.5} />}
 {campaign.commissionAmount}
 </span>
 </div>
 <div className="flex justify-between items-center border-b border-black/10 dark:border-white/10 pb-2">
 <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500">CATÁLOGO</span>
 <span className="font-semibold text-[10px] uppercase tracking-widest text-black dark:text-white">
 {campaign.applyToAll ? 'GLOBAL (TODOS)' : `${campaign.applicableItemIds.length} SERVICIOS`}
 </span>
 </div>
 </div>
 </div>

 <button 
 onClick={() => handleEdit(campaign)} 
 className="w-full h-12 border-t border-black/10 dark:border-white/10 bg-transparent text-gray-500 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 rounded-none mt-auto"
 >
 <Settings2 className="w-3.5 h-3.5" strokeWidth={1.5} /> ADMINISTRAR
 </button>

 </div>
 ))}
 </div>
 )}
 </div>
 );
};