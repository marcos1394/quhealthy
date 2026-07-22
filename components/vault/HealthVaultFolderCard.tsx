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
      <div className={cn(
        "bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 transition-all duration-300 flex items-center justify-between group shadow-sm hover:shadow-md hover:border-gray-200 dark:hover:border-gray-700",
        !isEditing && "cursor-grab active:cursor-grabbing",
        isDragOver && "border-blue-500 ring-1 ring-blue-500 bg-blue-50/50 dark:bg-blue-900/10",
        isProcessingDrop && "opacity-50 pointer-events-none"
      )}
    >
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div 
          ref={setDragHandleRef} 
          {...dragHandleAttributes} 
          {...dragHandleListeners}
          className={cn(
            "w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 transition-colors shrink-0 flex items-center justify-center",
            setDragHandleRef && "cursor-grab active:cursor-grabbing hover:bg-blue-100 dark:hover:bg-blue-500/20"
          )}
        >
          {setDragHandleRef ? (
            <GripVertical className="w-5 h-5 text-blue-400 dark:text-blue-500" strokeWidth={2} />
          ) : (
            <FolderOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" strokeWidth={2} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="flex flex-col gap-2">
              <Input 
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="font-bold text-gray-900 dark:text-white rounded-xl border-gray-200 dark:border-gray-700 h-9"
                placeholder="Nombre de carpeta"
                autoFocus
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={(e) => { e.stopPropagation(); setIsEditing(false); setEditName(folderName); }}
                  disabled={isSaving}
                  className="flex-1 rounded-xl border-gray-200 dark:border-gray-700 h-9 text-xs font-semibold text-gray-600"
                >
                  <X className="w-3 h-3 mr-1" /> Cancelar
                </Button>
                <Button
                  onClick={handleSaveRename}
                  disabled={isSaving}
                  className="flex-1 rounded-xl bg-blue-600 text-white hover:bg-blue-700 h-9 text-xs font-bold border-0"
                >
                  {isSaving ? <QhSpinner className="w-3 h-3 mr-1" /> : <Save className="w-3 h-3 mr-1" />}
                  Guardar
                </Button>
              </div>
            </div>
          ) : (
            <>
              <h3 className="font-bold text-gray-900 dark:text-white truncate text-base capitalize">
                {folderName}
              </h3>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-0.5">
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
              className="rounded-full hover:bg-gray-100 dark:hover:bg-[#111111] h-8 w-8"
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
                  className="rounded-full hover:bg-red-50 dark:hover:bg-red-950/30 text-red-500 h-8 w-8"
                  title="Eliminar carpeta"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-3xl border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-gray-900 dark:text-white font-bold text-lg">¿Eliminar Carpeta?</AlertDialogTitle>
                  <AlertDialogDescription className="text-gray-500 font-medium">
                    Esto eliminará de forma permanente todos los archivos dentro de "{folderName}" y sus subcarpetas. Esta acción no se puede deshacer.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-3">
                  <AlertDialogCancel onClick={(e) => e.stopPropagation()} className="rounded-xl font-semibold text-sm">Cancelar</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={async (e) => {
                      e.stopPropagation();
                      await onDelete();
                    }}
                    className="rounded-xl bg-red-600 text-white hover:bg-red-700 font-bold text-sm border-none"
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
