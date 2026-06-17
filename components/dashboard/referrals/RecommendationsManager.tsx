"use client";

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Ticket, ArrowLeft, Percent, DollarSign, Settings2 } from 'lucide-react';
import { useRecommendationConfig } from '@/hooks/useRecommendationConfig';
import { RecommendationConfigDto } from '@/services/recommendationService';
import { RecommendationSettingsForm } from './RecommendationSettingsForm';
import { QhSpinner } from '@/components/ui/QhSpinner';

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
    return <div className="flex justify-center p-12"><QhSpinner size="md" /></div>;
  }

  // VISTA 1: FORMULARIO
  if (view === 'form') {
    return (
      <div className="space-y-6">
        <Button 
          variant="ghost" 
          onClick={handleGoBack}
          className="text-slate-500 hover:text-slate-900 dark:hover:text-white pl-0"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Volver a mis campañas
        </Button>
        
        <RecommendationSettingsForm 
          initialData={selectedCampaign} 
          onSaved={handleGoBack} 
        />
      </div>
    );
  }

  // VISTA 2: LISTA (DASHBOARD)
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Campañas de Recomendación</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Administra los códigos promocionales para tus colegas.</p>
        </div>
        <Button onClick={handleCreateNew} className="bg-indigo-600 hover:bg-indigo-700 text-white">
          <Plus className="w-4 h-4 mr-2" /> Nueva Campaña
        </Button>
      </div>

      {campaigns.length === 0 ? (
        <Card className="bg-slate-50 dark:bg-slate-900/50 border-dashed border-2 border-slate-200 dark:border-slate-800">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
              <Ticket className="w-8 h-8 text-indigo-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Sin campañas activas</h3>
            <p className="text-slate-500 max-w-md mb-6">Aún no has creado ninguna campaña. Crea tu primer código para empezar a recibir pacientes recomendados.</p>
            <Button onClick={handleCreateNew} variant="outline" className="bg-white dark:bg-slate-900">
              Crear mi primera campaña
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {campaigns.map((campaign, index) => (
            <Card key={campaign.id || index} className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 transition-colors">
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <Badge variant="outline" className="bg-slate-50 dark:bg-slate-950 font-mono text-sm border-slate-200 dark:border-slate-700">
                    {campaign.campaignCode}
                  </Badge>
                  <Badge className={campaign.isActive ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 border-0" : "bg-slate-100 text-slate-500 border-0"}>
                    {campaign.isActive ? 'Activa' : 'Pausada'}
                  </Badge>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Descuento Paciente:</span>
                    <span className="font-medium text-slate-900 dark:text-white flex items-center">
                      {campaign.isDiscountPercentage ? <Percent className="w-3 h-3 mr-1 text-slate-400" /> : <DollarSign className="w-3 h-3 text-slate-400" />}
                      {campaign.discountAmount}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Comisión Colega:</span>
                    <span className="font-medium text-slate-900 dark:text-white flex items-center">
                      {campaign.isCommissionPercentage ? <Percent className="w-3 h-3 mr-1 text-slate-400" /> : <DollarSign className="w-3 h-3 text-slate-400" />}
                      {campaign.commissionAmount}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Catálogo:</span>
                    <span className="font-medium text-slate-900 dark:text-white text-xs">
                      {campaign.applyToAll ? 'Todos los servicios' : `${campaign.applicableItemIds.length} servicios`}
                    </span>
                  </div>
                </div>

                <Button 
                  onClick={() => handleEdit(campaign)} 
                  variant="secondary" 
                  className="w-full bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700"
                >
                  <Settings2 className="w-4 h-4 mr-2" /> Administrar
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};