"use client";

/* eslint-disable react-doctor/button-has-type */

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
      <div className="flex flex-col items-center justify-center min-h-[350px] gap-4 bg-white dark:bg-[#0a0a0a] rounded-3xl border border-gray-100 dark:border-gray-800 p-8">
        <QhSpinner size="lg" className="text-emerald-600 dark:text-emerald-400" />
        <p className="text-xs font-semibold text-gray-500 animate-pulse">
          Extrayendo campañas y códigos promocionales...
        </p>
      </div>
    );
  }

  // VISTA 1: FORMULARIO
  if (view === 'form') {
    return (
      <div className="flex flex-col bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-4 md:p-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] flex items-center">
          <button 
            type="button"
            onClick={handleGoBack}
            className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={2} />
            <span>Volver al listado de campañas</span>
          </button>
        </div>
        
        <div className="p-6 md:p-8">
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
    <div className="flex flex-col font-sans transition-colors duration-500 space-y-6">
      
      {/* HEADER SECCIÓN */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 flex items-center justify-center shrink-0 shadow-sm">
            <Ticket className="w-6 h-6 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-0.5">Programa de Afiliados</p>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white leading-tight">
              Códigos Promocionales
            </h2>
          </div>
        </div>

        <button 
          type="button"
          onClick={handleCreateNew} 
          className="h-11 px-5 bg-emerald-600 hover:bg-emerald-700 text-white transition-colors text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm shrink-0 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" strokeWidth={2} />
          <span>Nueva Campaña</span>
        </button>
      </div>

      {/* EMPTY STATE */}
      {campaigns.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center p-12 border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] rounded-3xl shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-gray-800 flex items-center justify-center mb-4 shadow-sm">
            <Ticket className="w-6 h-6 text-gray-400" strokeWidth={2} />
          </div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
            Sin Campañas Activas
          </h3>
          <p className="text-xs font-medium text-gray-500 max-w-xs leading-relaxed mb-6">
            Aún no existen códigos promocionales generados en el sistema para asignación de comisiones.
          </p>
          <button 
            type="button"
            onClick={handleCreateNew} 
            className="h-10 px-5 bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-xs font-bold rounded-xl shadow-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" strokeWidth={2} />
            <span>Crear Primer Código</span>
          </button>
        </div>
      ) : (
        /* GRID CAMPAÑAS */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {campaigns.map((campaign, index) => (
            <div 
              key={campaign.id || index} 
              className="flex flex-col bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm hover:border-emerald-500/30 transition-all overflow-hidden group"
            >
              <div className="p-6 flex-1 space-y-5">
                {/* Header Card */}
                <div className="flex justify-between items-center gap-2">
                  <span className="px-3 py-1 bg-gray-100 dark:bg-[#111] border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white font-mono text-xs font-bold rounded-xl shadow-sm">
                    {campaign.campaignCode}
                  </span>
                  <span className={cn(
                    "inline-flex items-center px-2.5 py-1 text-[11px] font-bold rounded-lg border shadow-sm",
                    campaign.isActive 
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40" 
                      : "border-gray-200 bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                  )}>
                    {campaign.isActive ? 'Activa' : 'Pausada'}
                  </span>
                </div>

                {/* Propiedades */}
                <div className="space-y-3 bg-gray-50/50 dark:bg-[#050505] p-4 rounded-2xl border border-gray-100 dark:border-gray-800/60">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-200/60 dark:border-gray-800">
                    <span className="text-xs font-semibold text-gray-500">Descuento Paciente</span>
                    <span className="font-bold text-xs text-gray-900 dark:text-white flex items-center">
                      {campaign.isDiscountPercentage ? (
                        <Percent className="w-3.5 h-3.5 mr-1 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                      ) : (
                        <DollarSign className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                      )}
                      {campaign.discountAmount}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pb-2 border-b border-gray-200/60 dark:border-gray-800">
                    <span className="text-xs font-semibold text-gray-500">Comisión Colega</span>
                    <span className="font-bold text-xs text-gray-900 dark:text-white flex items-center">
                      {campaign.isCommissionPercentage ? (
                        <Percent className="w-3.5 h-3.5 mr-1 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                      ) : (
                        <DollarSign className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                      )}
                      {campaign.commissionAmount}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-gray-500">Alcance Catálogo</span>
                    <span className="font-bold text-xs text-gray-900 dark:text-white">
                      {campaign.applyToAll ? 'Global (Todos)' : `${campaign.applicableItemIds.length} Servicios`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer Card Action */}
              <button 
                type="button"
                onClick={() => handleEdit(campaign)} 
                className="w-full h-11 border-t border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-[#0a0a0a] hover:bg-gray-100 dark:hover:bg-[#111] text-gray-700 dark:text-gray-200 transition-colors text-xs font-bold flex items-center justify-center gap-2 mt-auto"
              >
                <Settings2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
                <span>Administrar Campaña</span>
              </button>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};