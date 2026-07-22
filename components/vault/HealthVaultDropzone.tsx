"use client"
/* eslint-disable react-doctor/click-events-have-key-events */;

import React, { useState, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { UploadCloud, FileText, Loader2, ShieldCheck, Type } from 'lucide-react';
import { cn } from '@/lib/utils';
import { QhSpinner } from '@/components/ui/QhSpinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface HealthVaultComposerProps {
 onUpload: (files: File[], title?: string) => Promise<unknown>;
 onCreateNote?: (title: string, content: string) => Promise<unknown>;
 isUploading: boolean;
}

export function HealthVaultDropzone({ onUpload, onCreateNote, isUploading }: HealthVaultComposerProps) {
 const t = useTranslations('HealthVault.Dropzone');
 const [isDragging, setIsDragging] = useState(false);
 const fileInputRef = useRef<HTMLInputElement>(null);

 // Form state
 const [activeTab, setActiveTab] = useState<'upload' | 'note'>('upload');
 const [title, setTitle] = useState('');
 const [noteContent, setNoteContent] = useState('');

 const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
 e.preventDefault();
 e.stopPropagation();
 if (activeTab === 'upload') setIsDragging(true);
 }, [activeTab]);

 const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
 e.preventDefault();
 e.stopPropagation();
 setIsDragging(false);
 }, []);

 const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
 e.preventDefault();
 e.stopPropagation();
 setIsDragging(false);

 if (isUploading || activeTab !== 'upload') return;

 const files = Array.from(e.dataTransfer.files);
 if (files && files.length > 0) {
 await onUpload(files, title);
 setTitle(''); // Reset
 }
 }, [isUploading, onUpload, activeTab, title]);

 const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
 const files = e.target.files;
 if (files && files.length > 0 && !isUploading) {
 await onUpload(Array.from(files), title);
 setTitle(''); // Reset
 if (fileInputRef.current) fileInputRef.current.value = '';
 }
 };

 const handleCreateNote = async () => {
 if (!title.trim() || !noteContent.trim() || isUploading || !onCreateNote) return;
 await onCreateNote(title.trim(), noteContent.trim());
 setTitle('');
 setNoteContent('');
 };

 return (
 <div className="w-full max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
 <div className="border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] rounded-3xl shadow-sm overflow-hidden">
 <div className="bg-gray-50/50 dark:bg-gray-900/50 p-6 border-b border-gray-100 dark:border-gray-800 flex items-center gap-4">
 <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-teal-50 dark:bg-teal-500/10 shrink-0">
 <UploadCloud className="w-5 h-5 text-teal-600 dark:text-teal-400" strokeWidth={2} />
 </div>
 <h2 className="text-sm font-bold text-gray-900 dark:text-white">
 Ingesta de Documentos
 </h2>
 </div>

 <div className="p-8">
 <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as 'upload' | 'note')} className="w-full">
 <TabsList className="grid w-full grid-cols-2 mb-8 bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 p-1 h-14 rounded-2xl gap-1">
 <TabsTrigger value="upload" className="rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-teal-600 dark:data-[state=active]:text-teal-400 data-[state=active]:shadow-sm transition-all text-sm font-semibold text-gray-500">
 <UploadCloud className="w-4 h-4 mr-2" />
 {t('tab_upload', { defaultValue: 'Subir Archivo' })}
 </TabsTrigger>
 <TabsTrigger value="note" className="rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-teal-600 dark:data-[state=active]:text-teal-400 data-[state=active]:shadow-sm transition-all text-sm font-semibold text-gray-500">
 <Type className="w-4 h-4 mr-2" />
 {t('tab_note', { defaultValue: 'Crear Nota' })}
 </TabsTrigger>
 </TabsList>

 <TabsContent value="upload" className="space-y-6">
 <div>
 <label className="block text-xs font-semibold text-gray-500 mb-2">
 Título del Documento (Opcional)
 </label>
 <Input
 placeholder="Ej: Laboratorios Diciembre"
 value={title}
 onChange={(e) => setTitle(e.target.value)}
 className="h-11 rounded-xl bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-gray-800 text-sm focus-visible:ring-1 focus-visible:ring-teal-500 focus-visible:border-teal-500 transition-colors"
 />
 </div>

 <div
 onDragOver={handleDragOver}
 onDragLeave={handleDragLeave}
 onDrop={handleDrop}
 onClick={() => !isUploading && fileInputRef.current?.click()}
 className={cn(
 "relative overflow-hidden group cursor-pointer flex flex-col items-center justify-center p-10 md:p-12 rounded-3xl border-2 border-dashed transition-all duration-300 ease-out",
 isDragging
 ? "border-teal-500 bg-teal-50 dark:bg-teal-500/10"
 : "border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505]/50 hover:bg-gray-50 dark:hover:bg-[#050505] hover:border-gray-300 dark:hover:border-gray-700",
 isUploading && "pointer-events-none opacity-90"
 )}
 >
 <input
 type="file"
 ref={fileInputRef}
 onChange={handleFileInputChange}
 accept=".pdf,.jpg,.jpeg,.png,.dcm,.xml,.csv,.zip,.doc,.docx"
 className="hidden"
 multiple
 />

 <AnimateContent isUploading={isUploading} isDragging={isDragging} t={t} />
 </div>
 </TabsContent>

 <TabsContent value="note" className="space-y-6">
 <div>
 <label className="block text-xs font-semibold text-gray-500 mb-2">
 Título de la Nota
 </label>
 <Input
 placeholder="Ej: Síntomas presentados en la noche"
 value={title}
 onChange={(e) => setTitle(e.target.value)}
 className="h-11 rounded-xl bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-gray-800 text-sm focus-visible:ring-1 focus-visible:ring-teal-500 focus-visible:border-teal-500 transition-colors"
 disabled={isUploading}
 />
 </div>
 <div>
 <label className="block text-xs font-semibold text-gray-500 mb-2">
 Contenido
 </label>
 <Textarea
 placeholder="Escribe aquí los detalles..."
 value={noteContent}
 onChange={(e) => setNoteContent(e.target.value)}
 className="rounded-xl bg-white dark:bg-[#0a0a0a] border-gray-200 dark:border-gray-800 min-h-[160px] resize-none focus-visible:ring-1 focus-visible:ring-teal-500 focus-visible:border-teal-500 transition-colors text-sm"
 disabled={isUploading}
 />
 </div>
 <Button
 onClick={handleCreateNote}
 disabled={!title.trim() || !noteContent.trim() || isUploading}
 className="w-full rounded-xl bg-teal-600 text-white hover:bg-teal-700 h-12 text-sm font-bold transition-all disabled:opacity-50"
 >
 {isUploading ? (
 <QhSpinner size="sm" className="mr-2" />
 ) : (
 <FileText className="w-4 h-4 mr-2" />
 )}
 Guardar Nota
 </Button>
 </TabsContent>
 </Tabs>
 </div>
 </div>

 {/* Privacy Badge */}
 <div className="flex items-center justify-center gap-2 mt-6 text-gray-500 dark:text-gray-400">
 <ShieldCheck className="w-4 h-4" strokeWidth={1.5} />
 <span className="text-[10px] font-bold uppercase tracking-widest">
 {t('privacy_note', { defaultValue: 'Cifrado de Extremo a Extremo' })}
 </span>
 </div>
 </div>
 );
}

 function AnimateContent({ isUploading, isDragging, t }: { isUploading: boolean, isDragging: boolean, t: any }) {
 if (isUploading) {
 return (
 <div className="flex flex-col items-center text-gray-900 dark:text-white">
 <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 mb-4 shadow-sm">
 <QhSpinner size="md" />
 </div>
 <h3 className="text-sm font-bold tracking-tight mb-1">
 {t('btn_uploading', { defaultValue: 'Procesando documento...' })}
 </h3>
 </div>
 );
 }

 return (
 <div className="flex flex-col items-center text-gray-500 transition-all duration-300">
 <div className={cn(
 "p-4 rounded-2xl mb-4 transition-all duration-300",
 isDragging ? "bg-teal-600 text-white shadow-md" : "bg-gray-100 dark:bg-gray-800 text-gray-500"
 )}>
 <UploadCloud className="w-8 h-8" strokeWidth={2} />
 </div>
 <h3 className={cn(
 "text-sm font-bold tracking-tight mb-2 transition-colors",
 isDragging ? "text-teal-600 dark:text-teal-400" : "text-gray-700 dark:text-gray-300"
 )}>
 {isDragging ? t('drag_active', { defaultValue: '¡Suéltalo aquí!' }) : t('drag_inactive', { defaultValue: 'Arrastra tu archivo aquí' })}
 </h3>
 <p className="text-xs font-medium text-gray-400 dark:text-gray-500 text-center mt-2 px-4">
 {t('supported_formats', { defaultValue: 'o haz clic para explorar (PDF, JPG, PNG, DICOM, ZIP, XML, CSV, DOCX)' })}
 </p>
 </div>
 );
}