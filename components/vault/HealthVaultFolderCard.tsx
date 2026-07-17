"use client"
/* eslint-disable react-doctor/prefer-module-scope-pure-function */;

import React, { useState } from 'react';
import { FolderOpen, ArrowRight, Edit2, Trash2, X, Save, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslations } from 'next-intl';
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
import { QhSpinner } from '../ui/QhSpinner';

interface HealthVaultFolderCardProps {
  folderName: string;
  folderPath: string; // The full path for drag and drop
  itemCount: number;
  onClick: () => void;
  onDropDocument: (documentId: string) => Promise<void>;
  onDropFolder?: (folderPath: string) => Promise<void>; // Para arrastrar carpetas enteras
  onRename?: (newName: string) => Promise<void>;
  onDelete?: () => Promise<void>;
  dragHandleListeners?: any;
  dragHandleAttributes?: any;
  setDragHandleRef?: (element: HTMLElement | null) => void;
}

export function HealthVaultFolderCard({ 
  folderName, 
  folderPath, 
  itemCount, 
  onClick, 
  onDropDocument,
  onDropFolder,
  onRename,
  onDelete,
  dragHandleListeners,
  dragHandleAttributes,
  setDragHandleRef
}: HealthVaultFolderCardProps) {
  const t = useTranslations('HealthVault.Card');
  
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessingDrop, setIsProcessingDrop] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(folderName);
  const [isSaving, setIsSaving] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    const documentId = e.dataTransfer.getData('documentId');
    const droppedFolderPath = e.dataTransfer.getData('folderPath');

    // No se puede soltar una carpeta sobre sí misma o sus hijas
    if (droppedFolderPath && droppedFolderPath.startsWith(folderPath)) {
      return;
    }

    if (documentId) {
      setIsProcessingDrop(true);
      try {
        await onDropDocument(documentId);
      } finally {
        setIsProcessingDrop(false);
      }
    } else if (droppedFolderPath && onDropFolder) {
      setIsProcessingDrop(true);
      try {
        await onDropFolder(droppedFolderPath);
      } finally {
        setIsProcessingDrop(false);
      }
    }
  };

  const handleSaveRename = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onRename) return;
    if (editName.trim() === '' || editName === folderName) {
      setIsEditing(false);
      return;
    }
    
    setIsSaving(true);
    try {
      await onRename(editName);
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      onClick={!isEditing ? onClick : undefined}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      draggable={!isEditing}
      onDragStart={(e) => {
        if (!isEditing) {
          e.dataTransfer.setData('folderPath', folderPath);
          e.dataTransfer.effectAllowed = 'move';
        }
      }}
      className={cn(
        "bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-none p-6 transition-all duration-300 flex items-center justify-between group hover:border-black dark:hover:border-white",
        !isEditing && "cursor-grab active:cursor-grabbing",
        isDragOver && "border-black dark:border-white ring-1 ring-black dark:ring-white bg-gray-50 dark:bg-[#111]",
        isProcessingDrop && "opacity-50 pointer-events-none"
      )}
    >
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div 
          ref={setDragHandleRef} 
          {...dragHandleAttributes} 
          {...dragHandleListeners}
          className={cn(
            "p-4 border border-black dark:border-white bg-black dark:bg-white transition-colors shrink-0 flex items-center justify-center",
            setDragHandleRef && "cursor-grab active:cursor-grabbing hover:bg-gray-800 dark:hover:bg-gray-200"
          )}
        >
          {setDragHandleRef ? (
            <GripVertical className="w-6 h-6 text-white dark:text-black" strokeWidth={1.5} />
          ) : (
            <FolderOpen className="w-6 h-6 text-white dark:text-black" strokeWidth={1.5} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="flex flex-col gap-2">
              <Input 
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="font-bold text-black dark:text-white rounded-none border-gray-300 dark:border-gray-700 h-8 uppercase tracking-widest text-xs"
                placeholder="Nombre de carpeta"
                autoFocus
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={(e) => { e.stopPropagation(); setIsEditing(false); setEditName(folderName); }}
                  disabled={isSaving}
                  className="flex-1 rounded-none border-gray-300 dark:border-gray-700 h-8 text-[10px] font-bold uppercase tracking-widest"
                >
                  <X className="w-3 h-3 mr-1" /> Cancelar
                </Button>
                <Button
                  onClick={handleSaveRename}
                  disabled={isSaving}
                  className="flex-1 rounded-none bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 h-8 text-[10px] font-bold uppercase tracking-widest"
                >
                  {isSaving ? <QhSpinner className="w-3 h-3 mr-1" /> : <Save className="w-3 h-3 mr-1" />}
                  Guardar
                </Button>
              </div>
            </div>
          ) : (
            <>
              <h3 className="font-bold text-black dark:text-white truncate text-base capitalize">
                {folderName}
              </h3>
              <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-1">
                {itemCount} {itemCount === 1 ? 'Elemento' : 'Elementos'}
              </p>
            </>
          )}
        </div>
      </div>
      
      {!isEditing && (
        <div className="flex flex-col gap-1 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
          {onRename && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
              className="rounded-none hover:bg-gray-100 dark:hover:bg-[#111111] h-8 w-8"
              title="Renombrar carpeta"
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
                  onClick={(e) => e.stopPropagation()}
                  className="rounded-none hover:bg-red-50 dark:hover:bg-red-950/30 text-red-500 h-8 w-8"
                  title="Eliminar carpeta"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-none border-black dark:border-white">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-black dark:text-white uppercase tracking-widest font-bold text-sm">¿Eliminar Carpeta?</AlertDialogTitle>
                  <AlertDialogDescription className="text-gray-500 font-medium">
                    Esto eliminará de forma permanente todos los archivos dentro de "{folderName}" y sus subcarpetas. Esta acción no se puede deshacer.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={(e) => e.stopPropagation()} className="rounded-none uppercase font-bold text-[10px] tracking-widest">Cancelar</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={async (e) => {
                      e.stopPropagation();
                      await onDelete();
                    }}
                    className="rounded-none bg-red-600 text-white hover:bg-red-700 uppercase font-bold text-[10px] tracking-widest border-none"
                  >
                    Eliminar Todo
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      )}
      
      {!isEditing && !onRename && !onDelete && (
        <ArrowRight className="w-5 h-5 text-gray-300 dark:text-gray-700 group-hover:text-black dark:group-hover:text-white transition-colors ml-4" />
      )}
    </div>
  );
}
