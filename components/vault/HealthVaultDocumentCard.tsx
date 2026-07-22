"use client"
/* eslint-disable react-doctor/prefer-module-scope-pure-function */;

import React from 'react';
import { useTranslations } from 'next-intl';
import {
 FileText, Eye, BrainCircuit, Activity, Pill, AlertCircle,
 Clock, CheckCircle2, AlertTriangle, Type, FolderOpen, GripVertical
} from 'lucide-react';
import { formatInTimeZone } from 'date-fns-tz';
import { es } from 'date-fns/locale';

import { ConsumerDocument } from '@/types/healthVault';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Edit2, Save, X, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { QhSpinner } from '../ui/QhSpinner';

interface HealthVaultDocumentCardProps {
 document: ConsumerDocument;
 onView: (id: string) => void;
 onUpdate?: (id: string, data: any) => Promise<any>;
 onDelete?: (id: string) => Promise<any>;
 dragHandleListeners?: any;
 dragHandleAttributes?: any;
 setDragHandleRef?: (element: HTMLElement | null) => void;
}

export function HealthVaultDocumentCard({ document, onView, onUpdate, onDelete, dragHandleListeners, dragHandleAttributes, setDragHandleRef }: HealthVaultDocumentCardProps) {
 const t = useTranslations('HealthVault.Card');
 const [isEditing, setIsEditing] = React.useState(false);
 const [isSaving, setIsSaving] = React.useState(false);
 
 // Edit state
 const [editTitle, setEditTitle] = React.useState('');
 const [editFolder, setEditFolder] = React.useState('');
 const [editSummary, setEditSummary] = React.useState('');
 const [editConditions, setEditConditions] = React.useState('');
 const [editMedications, setEditMedications] = React.useState('');

 // Start edit mode
 const handleEdit = () => {
 setEditTitle(document.title || document.fileName || '');
 setEditFolder(document.documentType || '');
 if (document.aiExtractedData) {
 setEditSummary(document.aiExtractedData.summary || '');
 setEditConditions((document.aiExtractedData.medicalConditions || []).join(', '));
 setEditMedications((document.aiExtractedData.medications || []).join(', '));
 } else {
 setEditSummary('');
 setEditConditions('');
 setEditMedications('');
 }
 setIsEditing(true);
 };

 // Save changes
 const handleSave = async () => {
 if (!onUpdate) return;
 setIsSaving(true);
 const dataToUpdate: any = {};
 
 if (editTitle !== (document.title || document.fileName)) {
 dataToUpdate.title = editTitle;
 }
 if (editFolder !== document.documentType) {
 dataToUpdate.documentType = editFolder;
 }

 if (document.aiStatus === 'PROCESSED') {
 const aiData = {
 ...document.aiExtractedData,
 summary: editSummary,
 medicalConditions: editConditions.split(',').map(s => s.trim()).filter(s => s.length > 0),
 medications: editMedications.split(',').map(s => s.trim()).filter(s => s.length > 0)
 };
 dataToUpdate.aiExtractedData = aiData;
 }

 await onUpdate(document.id, dataToUpdate);
 setIsSaving(false);
 setIsEditing(false);
 };

 const formatBytes = (bytes: number) => {
 if (bytes === 0) return '0 Bytes';
 const k = 1024;
 const sizes = ['Bytes', 'KB', 'MB', 'GB'];
 const i = Math.floor(Math.log(bytes) / Math.log(k));
 return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
 };

 const formatDate = (dateString: string) => {
 return formatInTimeZone(new Date(dateString), 'UTC', "d MMM yyyy", { locale: es });
 };

 const aiStatusConfig = {
 PENDING: {
 icon: Clock,
 text: t('ai_pending', { defaultValue: 'Analizando...' }),
 color: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',
 pulse: true
 },
 PROCESSED: {
 icon: BrainCircuit,
 text: t('ai_processed', { defaultValue: 'Analizado por IA' }),
 color: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20',
 pulse: false
 },
 FAILED: {
 icon: AlertTriangle,
 text: t('ai_failed', { defaultValue: 'Solo Almacenamiento' }),
 color: 'bg-gray-50 text-gray-500 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700',
 pulse: false
 },
 UNSUPPORTED: {
 icon: FileText,
 text: t('ai_unsupported', { defaultValue: 'Documento Seguro' }),
 color: 'bg-gray-50 text-gray-500 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700',
 pulse: false
 }
 };

 // 🚀 FIX: Salvavidas ultra seguro. Si document.aiStatus no existe o no es válido, usamos 'PENDING'
 const currentStatus = (document.aiStatus && aiStatusConfig[document.aiStatus as keyof typeof aiStatusConfig]) 
 ? (document.aiStatus as keyof typeof aiStatusConfig) 
 : 'PENDING';

 const StatusIcon = aiStatusConfig[currentStatus].icon;
 const aiData = document.aiExtractedData;

 return (
  <div 
    draggable={!isEditing}
    onDragStart={(e) => {
      if (!isEditing) {
        e.dataTransfer.setData('documentId', document.id);
        e.dataTransfer.effectAllowed = 'move';
      }
    }}
    className="bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm p-6 transition-all duration-300 flex flex-col group hover:shadow-md hover:border-gray-200 dark:hover:border-gray-700 cursor-grab active:cursor-grabbing"
  >

 {/* Cabecera del Documento */}
 <div className="flex justify-between items-start mb-6">
 <div className="flex gap-4 items-start w-full">
 <div 
  ref={setDragHandleRef}
  {...dragHandleAttributes}
  {...dragHandleListeners}
  className={cn(
    "w-12 h-12 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 transition-colors shrink-0 flex items-center justify-center",
    setDragHandleRef ? "cursor-grab active:cursor-grabbing hover:bg-gray-100 dark:hover:bg-gray-800" : "group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/10"
  )}
 >
 {setDragHandleRef ? (
   <GripVertical className="w-5 h-5 text-gray-400 dark:text-gray-500" strokeWidth={2} />
 ) : (
   document.documentType === 'NOTE' ? (
     <Type className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" strokeWidth={1.5} />
   ) : (
     <FileText className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" strokeWidth={1.5} />
   )
 )}
 </div>
 <div className="flex-1 min-w-0 pt-1">
 {isEditing ? (
  <div className="space-y-2">
  <Input 
  value={editTitle} 
  onChange={(e) => setEditTitle(e.target.value)}
  className="font-bold text-gray-900 dark:text-white rounded-xl border-gray-200 dark:border-gray-700 h-9"
  placeholder="Título del documento"
  />
  <div className="flex items-center gap-2">
    <FolderOpen className="w-4 h-4 text-gray-400" />
    <Input 
      value={editFolder} 
      onChange={(e) => setEditFolder(e.target.value)}
      className="text-xs text-gray-700 dark:text-gray-300 rounded-xl border-gray-200 dark:border-gray-700 h-8"
      placeholder="Carpeta / Sección"
    />
  </div>
  </div>
 ) : (
 <h3 className="font-bold text-gray-900 dark:text-white truncate text-base">
 {document.title || document.fileName || 'Nota sin título'}
 </h3>
 )}
 <div className="flex items-center gap-2 mt-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400">
 <span>{formatDate(document.uploadedAt)}</span>
 {document.documentType !== 'NOTE' && (
 <>
 <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
 <span>{formatBytes(document.fileSizeBytes || 0)}</span>
 </>
 )}
 </div>
 </div>
 </div>
  {!isEditing && (
  <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
  {onUpdate && (
  <Button 
  variant="ghost" 
  size="icon" 
  onClick={handleEdit}
  className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
  title="Editar documento"
  >
  <Edit2 className="w-4 h-4 text-gray-500" />
  </Button>
  )}
  {onDelete && (
  <AlertDialog>
    <AlertDialogTrigger asChild>
      <Button 
        variant="ghost" 
        size="icon" 
        className="rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"
        title="Eliminar documento"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </AlertDialogTrigger>
    <AlertDialogContent className="rounded-3xl border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]">
      <AlertDialogHeader>
        <AlertDialogTitle className="text-gray-900 dark:text-white font-bold text-lg">¿Eliminar Documento?</AlertDialogTitle>
        <AlertDialogDescription className="text-gray-500 font-medium">
          {t('confirm_delete', { defaultValue: '¿Estás seguro de eliminar permanentemente este archivo del expediente? Esta acción no se puede deshacer.' })}
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter className="gap-3">
        <AlertDialogCancel className="rounded-xl font-semibold text-sm">Cancelar</AlertDialogCancel>
        <AlertDialogAction 
          onClick={() => onDelete(document.id)}
          className="rounded-xl bg-red-600 text-white hover:bg-red-700 font-bold text-sm border-none"
        >
          Eliminar
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
  )}
  </div>
  )}
 </div>

 {/* Badge de Estado IA */}
 <div className="mb-6">
 <Badge variant="outline" className={cn(
 "px-3 py-1.5 text-xs font-semibold border flex items-center w-fit gap-2 rounded-xl",
 aiStatusConfig[currentStatus].color
 )}>
 <StatusIcon className={cn("w-3.5 h-3.5", aiStatusConfig[currentStatus].pulse && "animate-spin")} strokeWidth={2.5} />
 {aiStatusConfig[currentStatus].text}
 </Badge>
 </div>

 {/* Resultados de la IA */}
 {currentStatus === 'PROCESSED' && (aiData || isEditing) && (
 <div className="flex-1 bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800/30 rounded-2xl p-5 mb-6 space-y-5 transition-colors">

 {isEditing ? (
 <div className="space-y-2">
 <label className="text-xs font-bold text-indigo-500">Resumen</label>
 <Textarea 
 value={editSummary}
 onChange={(e) => setEditSummary(e.target.value)}
 className="text-sm font-medium rounded-xl border-indigo-200 dark:border-indigo-800 resize-none focus-visible:ring-indigo-500"
 rows={3}
 />
 </div>
 ) : aiData?.summary && (
 <p className="text-sm text-gray-700 dark:text-gray-300 font-medium leading-relaxed">
 "{aiData.summary}"
 </p>
 )}

 {((aiData?.medicalConditions?.length ?? 0) > 0 || isEditing) && (
 <div>
 <div className="flex items-center gap-2 mb-3 text-indigo-500">
 <Activity className="w-4 h-4" />
 <span className="text-xs font-bold">{t('findings', { defaultValue: 'Hallazgos' })}</span>
 </div>
 {isEditing ? (
 <Input 
 value={editConditions}
 onChange={(e) => setEditConditions(e.target.value)}
 placeholder="Hallazgo 1, Hallazgo 2..."
 className="rounded-xl text-sm border-indigo-200 dark:border-indigo-800 focus-visible:ring-indigo-500"
 />
 ) : (
 <div className="flex flex-wrap gap-2">
 {aiData?.medicalConditions?.map((cond: string, i: number) => (
 <span key={i} className="px-3 py-1 bg-white dark:bg-[#0a0a0a] border border-indigo-100 dark:border-indigo-800 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-300 shadow-sm">
 {cond}
 </span>
 ))}
 </div>
 )}
 </div>
 )}

 {((aiData?.medications?.length ?? 0) > 0 || isEditing) && (
 <div>
 <div className="flex items-center gap-2 mb-3 text-indigo-500">
 <Pill className="w-4 h-4" />
 <span className="text-xs font-bold">{t('medications', { defaultValue: 'Medicamentos' })}</span>
 </div>
 {isEditing ? (
 <Input 
 value={editMedications}
 onChange={(e) => setEditMedications(e.target.value)}
 placeholder="Medicamento 1, Medicamento 2..."
 className="rounded-xl text-sm border-indigo-200 dark:border-indigo-800 focus-visible:ring-indigo-500"
 />
 ) : (
 <div className="flex flex-wrap gap-2">
 {aiData?.medications?.map((med: string, i: number) => (
 <span key={i} className="px-3 py-1 bg-white dark:bg-[#0a0a0a] border border-indigo-100 dark:border-indigo-800 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-300 shadow-sm">
 {med}
 </span>
 ))}
 </div>
 )}
 </div>
 )}
 </div>
 )}

 {currentStatus !== 'PROCESSED' && document.documentType !== 'NOTE' && <div className="flex-1 min-h-[1rem]"></div>}

 {/* Renderizado de Nota Pura */}
 {document.documentType === 'NOTE' && document.noteContent && (
 <div className="flex-1 border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505]/50 rounded-2xl p-5 mb-6 transition-colors">
 <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed line-clamp-6">
 {document.noteContent}
 </p>
 </div>
 )}

 {/* Acciones */}
 <div className="pt-2 mt-auto">
 {isEditing ? (
 <div className="flex gap-2">
 <Button
 variant="outline"
 onClick={() => setIsEditing(false)}
 disabled={isSaving}
 className="flex-1 rounded-xl border-gray-200 dark:border-gray-700 h-11 text-sm font-semibold text-gray-600"
 >
 <X className="w-4 h-4 mr-2" />
 Cancelar
 </Button>
 <Button
 onClick={handleSave}
 disabled={isSaving}
 className="flex-1 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 h-11 text-sm font-bold border-0"
 >
 {isSaving ? <QhSpinner className="w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
 Guardar
 </Button>
 </div>
 ) : (
 <Button
 variant="outline"
 onClick={() => {
 if (document.documentType === 'NOTE') {
 // En un entorno real abriría un modal para leer la nota completa
 alert(document.noteContent);
 } else {
 onView(document.id);
 }
 }}
 className="w-full rounded-xl border-0 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 dark:text-indigo-400 h-11 text-sm font-bold transition-all"
 >
 <Eye className="w-4 h-4 mr-2" />
 {document.documentType === 'NOTE' ? 'Leer Nota Completa' : t('btn_view', { defaultValue: 'Ver Documento' })}
 </Button>
 )}
 </div>
 </div>
 );
}