"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {  Lock, Crown, Upload, Trash2, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';

interface FileUploadProps {
  label: string;
  currentUrl: string | null;
  onChange: (url: string) => void;
  premium?: boolean;
  disabled?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ 
  label, 
  currentUrl, 
  onChange, 
  premium = false, 
  disabled = false 
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled || uploading) return;
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (disabled || uploading) return;
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      await handleFile(files[0]);
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      await handleFile(e.target.files[0]);
    }
  };
  
  const handleFile = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
        toast.error("El archivo es demasiado grande (máximo 5MB).");
        return;
    }
    if (!file.type.startsWith('image/')) {
        toast.error("Solo se permiten archivos de imagen.");
        return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const { data: { signedUrl, publicUrl } } = await axios.post('/api/uploads/signed-url', {
        fileType: file.type,
      }, { withCredentials: true });

      await axios.put(signedUrl, file, {
        headers: { 'Content-Type': file.type },
        onUploadProgress: (progressEvent) => {
          // --- INICIO DE LA CORRECCIÓN ---
          // Verificamos que 'progressEvent.total' exista antes de calcular.
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
          // --- FIN DE LA CORRECCIÓN ---
        },
      });

      onChange(publicUrl);
      toast.success("¡Imagen subida exitosamente!");

    } catch (error) {
      console.error("Error en la subida de archivo:", error);
      toast.error("No se pudo subir la imagen.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
        {label}
        {premium && <Crown className="w-4 h-4 text-yellow-400" />}
        {disabled && <Lock className="w-4 h-4 text-gray-500" />}
      </label>
      
      <div
        className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 ${
          dragActive 
            ? 'border-purple-400 bg-purple-400/10 scale-105' 
            : disabled 
              ? 'border-gray-600 bg-gray-800/50 cursor-not-allowed' 
              : 'border-gray-600 hover:border-gray-500 bg-gray-800/30'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {uploading ? (
          <div className="space-y-3 flex flex-col items-center justify-center h-32">
            <div className="relative w-20 h-20">
              <svg className="w-full h-full" viewBox="0 0 36 36">
                <path
                  className="text-gray-700"
                  strokeWidth="4" fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <motion.path
                  className="text-purple-500"
                  strokeWidth="4" fill="none"
                  strokeDasharray="100"
                  initial={{ strokeDashoffset: 100 }}
                  animate={{ strokeDashoffset: 100 - uploadProgress }}
                  transition={{ ease: "linear" }}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-purple-300 font-bold text-sm">
                {uploadProgress}%
              </div>
            </div>
            <p className="text-sm text-gray-400">Subiendo archivo...</p>
          </div>
        ) : currentUrl ? (
          <div className="space-y-3 h-32 flex flex-col items-center justify-center">
            <div className="relative group w-24 h-24">
              <img src={currentUrl} alt="Preview" className="w-full h-full object-cover rounded-lg border-2 border-gray-600" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-lg">
                <CheckCircle2 className="w-8 h-8 text-green-400" />
              </div>
            </div>
            <div className="flex gap-2 justify-center">
              <button
                type="button"
                onClick={() => !disabled && document.getElementById(`file-${label}`)?.click()}
                disabled={disabled}
                className="px-3 py-1 text-xs bg-gray-600 hover:bg-gray-500 rounded text-white transition-colors disabled:opacity-50"
              >
                Cambiar
              </button>
              <button
                type="button"
                onClick={() => onChange('')}
                disabled={disabled}
                className="p-1.5 text-xs bg-red-600/80 hover:bg-red-500 rounded text-white transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 h-32 flex flex-col items-center justify-center">
            <Upload className="w-10 h-10 text-gray-500" />
            <div className="space-y-1">
              <p className="text-sm text-gray-400">
                {disabled ? 'Función premium' : 'Arrastra una imagen aquí'}
              </p>
              <p className="text-xs text-gray-500">o haz clic para seleccionar (Máx 5MB)</p>
            </div>
            {!disabled && (
              <button
                type="button"
                onClick={() => document.getElementById(`file-${label}`)?.click()}
                className="mt-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors"
              >
                Seleccionar Archivo
              </button>
            )}
          </div>
        )}
        
        <input
          id={`file-${label}`}
          type="file"
          accept="image/png, image/jpeg, image/webp"
          className="hidden"
          onChange={handleFileInputChange}
          disabled={disabled || uploading}
        />
      </div>
    </div>
  );
};