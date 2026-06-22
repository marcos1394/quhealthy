/* eslint-disable react-doctor/button-has-type */
import React from 'react';
import { useTranslations } from "next-intl";
import { History, Pill, Video, FileCheck, ShieldAlert, ShoppingBag, Plus, Trash2 } from "lucide-react";
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
    <section className="flex-1 bg-white dark:bg-[#0a0a0a] p-6 flex flex-col min-w-0 lg:border-r border-black dark:border-white z-0">
      <Tabs defaultValue="prescription" className="flex-1 flex flex-col h-full">
        
        {/* 🗂️ Pestañas */}
        <TabsList className="grid w-full grid-cols-3 mb-8 bg-transparent border border-black dark:border-white p-0 h-12 rounded-none">
          <TabsTrigger 
            value="vault" 
            className="data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black rounded-none text-[10px] font-bold uppercase tracking-widest h-full transition-colors border-r border-black dark:border-white"
          >
            <History className="w-4 h-4 md:mr-2" strokeWidth={1.5} /> <span className="hidden md:inline">{t('tab_history')}</span>
          </TabsTrigger>
          <TabsTrigger 
            value="prescription" 
            className="data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black rounded-none text-[10px] font-bold uppercase tracking-widest h-full transition-colors border-r border-black dark:border-white"
          >
            <Pill className="w-4 h-4 md:mr-2" strokeWidth={1.5} /> <span className="hidden md:inline">{t('tab_prescription')}</span>
          </TabsTrigger>
          {appointmentType === 'video_call' ? (
            <TabsTrigger 
              value="video" 
              className="data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black rounded-none text-[10px] font-bold uppercase tracking-widest h-full transition-colors"
            >
              <Video className="w-4 h-4 md:mr-2" strokeWidth={1.5} /> <span className="hidden md:inline">CÁMARA</span>
            </TabsTrigger>
          ) : (
            <div className="bg-gray-50 dark:bg-[#050505]" /> // Placeholder for grid
          )}
        </TabsList>

        {/* 📁 TAB: BÓVEDA DE SALUD */}
        <TabsContent value="vault" className="flex-1 overflow-y-auto custom-scrollbar m-0 outline-none pr-4">
          {isOfflinePatient ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 border border-black dark:border-white bg-gray-50 dark:bg-[#050505] shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff]">
              <ShieldAlert className="w-10 h-10 text-black dark:text-white mb-4" strokeWidth={1.5} />
              <p className="font-serif font-bold text-xl text-black dark:text-white uppercase mb-2">Bóveda no disponible</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                EL PACIENTE NECESITA CREAR UNA CUENTA PARA GUARDAR DOCUMENTOS.
              </p>
            </div>
          ) : vaultDocuments.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 border border-black dark:border-white bg-gray-50 dark:bg-[#050505] shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff]">
              <History className="w-10 h-10 text-black dark:text-white mb-4" strokeWidth={1.5} />
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                {t('vault_empty')}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {vaultDocuments.map(doc => (
                <div 
                  key={doc.id} 
                  className="flex items-center p-4 bg-white dark:bg-[#0a0a0a] border border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors cursor-pointer shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] group"
                >
                  <div className="w-10 h-10 border border-black dark:border-white flex items-center justify-center shrink-0 mr-4 group-hover:border-white dark:group-hover:border-black">
                    <FileCheck className="w-5 h-5" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[10px] uppercase tracking-widest truncate">{doc.title || doc.fileName || 'NOTA SIN TÍTULO'}</p>
                    {doc.documentType !== 'NOTE' && (
                      <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 group-hover:text-gray-400 mt-1">
                        {new Date(doc.uploadDate).toLocaleDateString()} <span className="mx-2">|</span> {(doc.fileSizeBytes || 0) > 0 ? (doc.fileSizeBytes! / 1024 / 1024).toFixed(1) + ' MB' : '0 MB'}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* 💊 TAB: RECETA DIGITAL */}
        <TabsContent value="prescription" className="flex-1 overflow-y-auto custom-scrollbar m-0 space-y-6 outline-none pr-4">
          <div className="bg-gray-50 dark:bg-[#050505] p-6 border border-black dark:border-white shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-6 border-b border-black dark:border-white">
              <h3 className="font-serif font-bold text-xl uppercase text-black dark:text-white">
                {t('rx_title')}
              </h3>
              <button className="flex items-center gap-2 bg-transparent border border-black dark:border-white px-4 py-2 text-[9px] font-bold uppercase tracking-widest text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors">
                <ShoppingBag className="w-3.5 h-3.5" strokeWidth={1.5} /> VINCULAR PRODUCTO
              </button>
            </div>
            
            {/* Formulario responsivo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <Input 
                placeholder={t('rx_medication')} 
                value={newRx.medicationName} 
                onChange={e => setNewRx({...newRx, medicationName: e.target.value})} 
                className="h-12 rounded-none border-black dark:border-white bg-white dark:bg-[#0a0a0a] focus-visible:ring-0 focus-visible:border-black text-xs font-light" 
              />
              <Input 
                placeholder={t('rx_dosage')} 
                value={newRx.dosage} 
                onChange={e => setNewRx({...newRx, dosage: e.target.value})} 
                className="h-12 rounded-none border-black dark:border-white bg-white dark:bg-[#0a0a0a] focus-visible:ring-0 focus-visible:border-black text-xs font-light" 
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <Input 
                placeholder={t('rx_frequency')} 
                value={newRx.frequency} 
                onChange={e => setNewRx({...newRx, frequency: e.target.value})} 
                className="h-12 rounded-none border-black dark:border-white bg-white dark:bg-[#0a0a0a] focus-visible:ring-0 focus-visible:border-black text-xs font-light" 
              />
              <Input 
                placeholder={t('rx_duration')} 
                value={newRx.duration} 
                onChange={e => setNewRx({...newRx, duration: e.target.value})} 
                className="h-12 rounded-none border-black dark:border-white bg-white dark:bg-[#0a0a0a] focus-visible:ring-0 focus-visible:border-black text-xs font-light" 
              />
              <Input 
                placeholder={t('rx_instructions')} 
                value={newRx.instructions} 
                onChange={e => setNewRx({...newRx, instructions: e.target.value})} 
                className="h-12 rounded-none border-black dark:border-white bg-white dark:bg-[#0a0a0a] focus-visible:ring-0 focus-visible:border-black text-xs font-light" 
              />
            </div>
            
            <button 
              onClick={handleAddRx} 
              disabled={!newRx.medicationName || !newRx.dosage} 
              className="w-full flex items-center justify-center gap-2 bg-black text-white dark:bg-white dark:text-black px-6 py-4 text-[10px] font-bold uppercase tracking-widest disabled:opacity-50 hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
            >
              <Plus className="w-4 h-4" strokeWidth={1.5} /> {t('rx_add_item')}
            </button>
          </div>

          {/* Lista de Medicamentos */}
          <div className="space-y-4">
            {prescription.map((item) => (
              <div key={item.id} className="flex justify-between items-center p-6 bg-white dark:bg-[#0a0a0a] border border-black dark:border-white shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff]">
                <div>
                  <h4 className="font-bold text-[10px] uppercase tracking-widest text-black dark:text-white mb-2">
                    {item.medicationName} <span className="ml-2 border-l border-black dark:border-white pl-2 text-gray-500">{item.dosage}</span>
                  </h4>
                  <p className="text-xs font-light text-black dark:text-white uppercase tracking-wider">
                    TOMAR {item.frequency} DURANTE {item.duration}.
                  </p>
                </div>
                <button 
                  onClick={() => removePrescriptionItem(item.id)} 
                  className="w-10 h-10 flex items-center justify-center border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors shrink-0"
                >
                  <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* 📹 TAB: VIDEOLLAMADA */}
        {appointmentType === 'video_call' && (
          <TabsContent value="video" className="flex-1 m-0 outline-none">
            <div className="h-full min-h-[400px] bg-black dark:bg-[#0a0a0a] border border-black dark:border-white shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff] flex flex-col items-center justify-center">
               <div className="text-center text-white">
                 <Video className="w-12 h-12 mx-auto mb-4 opacity-80" strokeWidth={1.5} />
                 <p className="text-[10px] font-bold uppercase tracking-widest">SALA DE VIDEOLLAMADA</p>
               </div>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </section>
  );
};