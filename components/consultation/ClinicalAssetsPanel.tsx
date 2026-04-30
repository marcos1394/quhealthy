import React from 'react';
import { useTranslations } from "next-intl";
import { History, Pill, Video, FileCheck, ShieldAlert, ShoppingBag, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VaultDocument, PrescriptionItem } from '@/types/ehr';

interface ClinicalAssetsPanelProps {
  vaultDocuments: VaultDocument[];
  prescription: PrescriptionItem[];
  newRx: { medicationName: string; dosage: string; frequency: string; duration: string; instructions: string };
  setNewRx: (rx: any) => void;
  handleAddRx: () => void;
  removePrescriptionItem: (id: string) => void;
  appointmentType: string;
  isOfflinePatient: boolean;
}

export const ClinicalAssetsPanel: React.FC<ClinicalAssetsPanelProps> = ({
  vaultDocuments,
  prescription,
  newRx,
  setNewRx,
  handleAddRx,
  removePrescriptionItem,
  appointmentType,
  isOfflinePatient
}) => {
  const t = useTranslations('EHR');

  return (
    <section className="flex-1 bg-slate-50/50 dark:bg-slate-950 p-4 flex flex-col min-w-0 lg:border-r border-slate-200 dark:border-slate-800">
      <Tabs defaultValue="prescription" className="flex-1 flex flex-col h-full">
        
        {/* 🗂️ Pestañas */}
        <TabsList className="grid w-full grid-cols-3 mb-4 bg-slate-100 dark:bg-slate-800">
          <TabsTrigger value="vault" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 rounded-lg">
            <History className="w-4 h-4 md:mr-2"/> <span className="hidden md:inline">{t('tab_history')}</span>
          </TabsTrigger>
          <TabsTrigger value="prescription" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 rounded-lg">
            <Pill className="w-4 h-4 md:mr-2"/> <span className="hidden md:inline">{t('tab_prescription')}</span>
          </TabsTrigger>
          {appointmentType === 'video_call' && (
            <TabsTrigger value="video" className="text-blue-600 dark:text-blue-400 data-[state=active]:bg-blue-50 dark:data-[state=active]:bg-blue-900/30 rounded-lg">
              <Video className="w-4 h-4 md:mr-2"/> <span className="hidden md:inline">Cámara</span>
            </TabsTrigger>
          )}
        </TabsList>

        {/* 📁 TAB: BÓVEDA DE SALUD */}
        <TabsContent value="vault" className="flex-1 overflow-y-auto custom-scrollbar m-0 outline-none">
          {isOfflinePatient ? (
            <div className="h-full flex items-center justify-center text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-100/50 dark:bg-slate-900/50">
              <div className="text-center">
                <ShieldAlert className="w-10 h-10 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
                <p className="font-medium text-slate-700 dark:text-slate-300">Bóveda no disponible</p>
                <p className="text-sm">El paciente necesita crear una cuenta para guardar documentos.</p>
              </div>
            </div>
          ) : vaultDocuments.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
              {t('vault_empty')}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {vaultDocuments.map(doc => (
                <div key={doc.id} className="flex items-center p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-medical-300 transition-colors cursor-pointer shadow-sm">
                  <FileCheck className="w-6 h-6 text-medical-500 mr-3 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">{doc.fileName}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{doc.documentType} • {new Date(doc.uploadDate).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* 💊 TAB: RECETA DIGITAL */}
        <TabsContent value="prescription" className="flex-1 overflow-y-auto custom-scrollbar m-0 space-y-4 outline-none">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-medical-200 dark:border-medical-900/50 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">{t('rx_title')}</h3>
              <Button variant="outline" size="sm" className="h-7 text-xs border-medical-300 text-medical-700 dark:border-medical-700 dark:text-medical-400 hover:bg-medical-50 dark:hover:bg-medical-900/20">
                <ShoppingBag className="w-3.5 h-3.5 mr-1" /> <span className="hidden sm:inline">Vincular Producto</span>
              </Button>
            </div>
            
            {/* Formulario responsivo (2 columnas en móviles, 3-4 en PC) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
              <Input placeholder={t('rx_medication')} value={newRx.medicationName} onChange={e => setNewRx({...newRx, medicationName: e.target.value})} className="h-8 text-sm dark:bg-slate-950 dark:border-slate-800" />
              <Input placeholder={t('rx_dosage')} value={newRx.dosage} onChange={e => setNewRx({...newRx, dosage: e.target.value})} className="h-8 text-sm dark:bg-slate-950 dark:border-slate-800" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
              <Input placeholder={t('rx_frequency')} value={newRx.frequency} onChange={e => setNewRx({...newRx, frequency: e.target.value})} className="h-8 text-sm dark:bg-slate-950 dark:border-slate-800" />
              <Input placeholder={t('rx_duration')} value={newRx.duration} onChange={e => setNewRx({...newRx, duration: e.target.value})} className="h-8 text-sm dark:bg-slate-950 dark:border-slate-800" />
              <Input placeholder={t('rx_instructions')} value={newRx.instructions} onChange={e => setNewRx({...newRx, instructions: e.target.value})} className="h-8 text-sm dark:bg-slate-950 dark:border-slate-800" />
            </div>
            <Button onClick={handleAddRx} disabled={!newRx.medicationName || !newRx.dosage} className="w-full h-8 text-xs bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white">
              <Plus className="w-3.5 h-3.5 mr-1" /> {t('rx_add_item')}
            </Button>
          </div>

          {/* Lista de Medicamentos */}
          <div className="space-y-2">
            {prescription.map((item) => (
              <div key={item.id} className="flex justify-between items-center p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
                    {item.medicationName} <span className="text-medical-600 dark:text-medical-400 font-medium">{item.dosage}</span>
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">Tomar {item.frequency} durante {item.duration}.</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => removePrescriptionItem(item.id)} className="h-6 w-6 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* 📹 TAB: VIDEOLLAMADA */}
        {appointmentType === 'video_call' && (
          <TabsContent value="video" className="flex-1 m-0 outline-none">
            <div className="h-full min-h-[300px] bg-slate-900 dark:bg-black rounded-2xl flex items-center justify-center border border-slate-800 shadow-inner overflow-hidden">
               <div className="text-center text-slate-500">
                 <Video className="w-12 h-12 mx-auto mb-2 opacity-50" />
                 <p className="text-sm">Sala de Videollamada</p>
               </div>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </section>
  );
};