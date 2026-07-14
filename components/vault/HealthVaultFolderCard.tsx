"use client"
/* eslint-disable react-doctor/prefer-module-scope-pure-function */;

import React, { useState } from 'react';
import { FolderOpen, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HealthVaultFolderCardProps {
  folderName: string;
  itemCount: number;
  onClick: () => void;
  onDropDocument: (documentId: string) => Promise<void>;
}

export function HealthVaultFolderCard({ folderName, itemCount, onClick, onDropDocument }: HealthVaultFolderCardProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessingDrop, setIsProcessingDrop] = useState(false);

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
    setIsDragOver(false);
    
    const documentId = e.dataTransfer.getData('documentId');
    if (documentId) {
      setIsProcessingDrop(true);
      try {
        await onDropDocument(documentId);
      } finally {
        setIsProcessingDrop(false);
      }
    }
  };

  return (
    <div
      onClick={onClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-none p-6 transition-all duration-300 flex items-center justify-between group cursor-pointer hover:border-black dark:hover:border-white",
        isDragOver && "border-black dark:border-white ring-1 ring-black dark:ring-white bg-gray-50 dark:bg-[#111]",
        isProcessingDrop && "opacity-50 pointer-events-none"
      )}
    >
      <div className="flex items-center gap-4">
        <div className="p-4 border border-black dark:border-white bg-black dark:bg-white transition-colors shrink-0">
          <FolderOpen className="w-6 h-6 text-white dark:text-black" strokeWidth={1.5} />
        </div>
        <div>
          <h3 className="font-bold text-black dark:text-white truncate text-base capitalize">
            {folderName}
          </h3>
          <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-1">
            {itemCount} {itemCount === 1 ? 'Elemento' : 'Elementos'}
          </p>
        </div>
      </div>
      
      <ArrowRight className="w-5 h-5 text-gray-300 dark:text-gray-700 group-hover:text-black dark:group-hover:text-white transition-colors" />
    </div>
  );
}
