"use client";

import React, { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { UploadCloud, FileText, X, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface DocumentUploadProps {
  selectedFile: File | null;
  uploadProgress: number;
  isUploading: boolean;
  onFileSelect: (file: File | null) => void;
  onFileUpload: () => void;
  onClear: () => void;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({ 
  selectedFile, 
  uploadProgress, 
  isUploading,
  onFileSelect, 
  onFileUpload,
  onClear
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        onFileSelect(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="w-full">
      <div 
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={cn(
            "relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 group",
            selectedFile 
                ? "border-purple-500/50 bg-purple-500/5" 
                : "border-gray-700 hover:border-gray-500 hover:bg-gray-800/30"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          onChange={(e) => onFileSelect(e.target.files?.[0] || null)}
          className="hidden"
          id="file-upload"
          accept=".pdf,.jpg,.jpeg,.png"
        />

        {!selectedFile ? (
            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center justify-center h-full">
                <div className="p-4 bg-gray-800 rounded-full mb-4 group-hover:scale-110 transition-transform duration-200">
                    <UploadCloud className="w-8 h-8 text-purple-400" />
                </div>
                <p className="text-lg font-medium text-white mb-1">
                    Arrastra tu archivo o <span className="text-purple-400 underline">haz clic</span>
                </p>
                <p className="text-sm text-gray-500">
                    Soporta PDF, JPG, PNG (Máx 10MB)
                </p>
            </label>
        ) : (
            <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
                <div className="p-4 bg-purple-900/30 rounded-full mb-3 border border-purple-500/30">
                    <FileText className="w-8 h-8 text-purple-300" />
                </div>
                <p className="text-white font-medium truncate max-w-[200px] mb-1">{selectedFile.name}</p>
                <p className="text-xs text-gray-400 mb-4">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                
                {isUploading ? (
                    <div className="w-full max-w-xs space-y-2">
                        <div className="flex justify-between text-xs text-purple-300">
                            <span>Subiendo...</span>
                            <span>{uploadProgress}%</span>
                        </div>
                        <Progress value={uploadProgress} className="h-2 bg-gray-700" />
                    </div>
                ) : (
                    <div className="flex gap-3">
                        <Button 
                            variant="outline" 
                            onClick={onClear}
                            className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700"
                        >
                            <X className="w-4 h-4 mr-2" /> Cancelar
                        </Button>
                        <Button 
                            onClick={onFileUpload}
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                        >
                            <CheckCircle2 className="w-4 h-4 mr-2" /> Subir Documento
                        </Button>
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};