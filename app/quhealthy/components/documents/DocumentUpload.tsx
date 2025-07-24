"use client";
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Upload } from "lucide-react";

interface DocumentUploadProps {
  selectedFile: File | null;
  uploadProgress: number;
  onFileSelect: (file: File | null) => void;
  onFileUpload: () => void;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({ 
  selectedFile, 
  uploadProgress, 
  onFileSelect, 
  onFileUpload 
}) => {
  return (
    <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
      <Input
        type="file"
        onChange={(e) => onFileSelect(e.target.files?.[0] || null)}
        className="hidden"
        id="file-upload"
      />
      <label htmlFor="file-upload" className="cursor-pointer">
        <Upload className="w-12 h-12 mx-auto text-teal-400 mb-4" />
        <p className="text-lg font-medium text-gray-300">
          Arrastra archivos aquí o haz clic para seleccionar
        </p>
        <p className="text-sm text-gray-400 mt-2">
          PDF, JPG, PNG hasta 10MB
        </p>
      </label>
      {selectedFile && (
        <div className="mt-4">
          <p className="text-sm text-teal-400">{selectedFile.name}</p>
          {uploadProgress > 0 && (
            <Progress value={uploadProgress} className="mt-2" />
          )}
          <Button
            onClick={onFileUpload}
            className="mt-4 bg-teal-500 hover:bg-teal-600"
          >
            Subir archivo
          </Button>
        </div>
      )}
    </div>
  );
};