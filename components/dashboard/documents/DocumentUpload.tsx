"use client";

import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  UploadCloud, 
  FileText, 
  X, 
  CheckCircle2, 
  AlertCircle,
  Image as ImageIcon,
  FileCheck,
  Loader2,
  Shield
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from 'react-toastify';

/**
 * DocumentUpload Component
 * 
 * Principios de Psicología UX aplicados:
 * 
 * 1. MINIMIZAR COSTO DE INTERACCIÓN
 *    - Drag & Drop reduce fricción vs browse
 *    - Click en cualquier parte del área
 *    - Validación visual inmediata
 * 
 * 2. FEEDBACK INMEDIATO
 *    - Estados visuales claros (empty, selected, uploading, success, error)
 *    - Progress bar con porcentaje
 *    - Animaciones de transición suaves
 * 
 * 3. AFFORDANCE VISUAL
 *    - Área de drop destacada en hover
 *    - Cursor pointer indica clickeable
 *    - Iconos sugieren acción
 * 
 * 4. MINIMIZAR ERRORES
 *    - Validación de tipo de archivo
 *    - Validación de tamaño
 *    - Mensajes de error claros
 * 
 * 5. CREDIBILIDAD Y CONFIANZA
 *    - Shield icon para seguridad
 *    - Formatos soportados visibles
 *    - Límite de tamaño claro
 * 
 * 6. RECONOCIMIENTO VS RECUPERACIÓN
 *    - Iconos por tipo de archivo
 *    - Preview del archivo seleccionado
 *    - Tamaño legible
 */

interface DocumentUploadProps {
  selectedFile: File | null;
  uploadProgress: number;
  isUploading: boolean;
  onFileSelect: (file: File | null) => void;
  onFileUpload: () => void;
  onClear: () => void;
  maxSizeMB?: number;
  acceptedFormats?: string[];
  showPreview?: boolean;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({ 
  selectedFile, 
  uploadProgress, 
  isUploading,
  onFileSelect, 
  onFileUpload,
  onClear,
  maxSizeMB = 10,
  acceptedFormats = ['.pdf', '.jpg', '.jpeg', '.png', '.webp'],
  showPreview = true
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Helper para validar archivo - MINIMIZAR ERRORES
  const validateFile = (file: File): { isValid: boolean; error?: string } => {
    // Validar tamaño
    const sizeMB = file.size / 1024 / 1024;
    if (sizeMB > maxSizeMB) {
      return { 
        isValid: false, 
        error: `El archivo excede el tamaño máximo de ${maxSizeMB}MB (${sizeMB.toFixed(2)}MB)` 
      };
    }

    // Validar formato
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedFormats.includes(fileExtension)) {
      return { 
        isValid: false, 
        error: `Formato no soportado. Usa: ${acceptedFormats.join(', ')}` 
      };
    }

    return { isValid: true };
  };

  // Helper para generar preview - RECONOCIMIENTO
  const generatePreview = (file: File) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Helper para obtener icono por tipo - RECONOCIMIENTO VISUAL
  const getFileIcon = (file: File | null) => {
    if (!file) return <UploadCloud className="w-10 h-10 text-purple-400" />;
    
    if (file.type.includes('pdf')) {
      return <FileText className="w-10 h-10 text-red-400" />;
    }
    if (file.type.startsWith('image/')) {
      return <ImageIcon className="w-10 h-10 text-blue-400" />;
    }
    return <FileCheck className="w-10 h-10 text-purple-400" />;
  };

  // Handlers - FEEDBACK INMEDIATO
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelection = (file: File) => {
    const validation = validateFile(file);
    
    if (!validation.isValid) {
      setValidationError(validation.error!);
      toast.error(validation.error);
      return;
    }

    setValidationError(null);
    onFileSelect(file);
    
    if (showPreview) {
      generatePreview(file);
    }
    
    toast.success('Archivo seleccionado correctamente');
  };

  const handleClear = () => {
    setPreviewUrl(null);
    setValidationError(null);
    onClear();
  };

  const formatFileSize = (bytes: number): string => {
    const mb = bytes / 1024 / 1024;
    if (mb < 1) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${mb.toFixed(2)} MB`;
  };

  return (
    <div className="w-full space-y-4">
      
      {/* Trust indicator - CREDIBILIDAD */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center gap-2 text-sm text-gray-400"
      >
        <Shield className="w-4 h-4 text-emerald-500" />
        <span>Conexión segura y encriptada</span>
      </motion.div>

      {/* Upload Area - AFFORDANCE VISUAL */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 group overflow-hidden",
          isDragging ? "border-purple-500 bg-purple-500/10 scale-[1.02]" : "",
          selectedFile && !isDragging ? "border-purple-500/50 bg-purple-500/5" : "",
          !selectedFile && !isDragging ? "border-gray-700 hover:border-purple-500/30 hover:bg-gray-800/30 cursor-pointer" : "",
          validationError ? "border-red-500/50 bg-red-500/5" : ""
        )}
      >
        {/* Animated background gradient - PROFUNDIDAD */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <input
          ref={inputRef}
          type="file"
          onChange={(e) => e.target.files?.[0] && handleFileSelection(e.target.files[0])}
          className="hidden"
          id="file-upload"
          accept={acceptedFormats.join(',')}
        />

        <AnimatePresence mode="wait">
          {!selectedFile ? (
            // Empty State - AFFORDANCE
            <motion.label
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              htmlFor="file-upload"
              className="relative cursor-pointer flex flex-col items-center justify-center h-full min-h-[200px]"
            >
              <motion.div
                className="p-5 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl mb-6 border border-gray-700 shadow-lg"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.2 }}
              >
                <UploadCloud className="w-12 h-12 text-purple-400" />
              </motion.div>
              
              <p className="text-xl font-bold text-white mb-2">
                Arrastra tu archivo aquí
              </p>
              <p className="text-base text-gray-400 mb-6">
                o{' '}
                <span className="text-purple-400 underline font-semibold">
                  haz clic para explorar
                </span>
              </p>
              
              {/* Supported formats - MINIMIZAR ERRORES */}
              <div className="flex flex-wrap justify-center gap-2 text-xs text-gray-500">
                {acceptedFormats.map(format => (
                  <span 
                    key={format}
                    className="px-2 py-1 bg-gray-800/50 rounded border border-gray-700"
                  >
                    {format.toUpperCase()}
                  </span>
                ))}
              </div>
              <p className="text-xs text-gray-600 mt-3">
                Tamaño máximo: {maxSizeMB}MB
              </p>
            </motion.label>
          ) : (
            // File Selected State - FEEDBACK VISUAL
            <motion.div
              key="selected"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative flex flex-col items-center space-y-6"
            >
              {/* Preview or Icon - RECONOCIMIENTO */}
              {previewUrl && selectedFile.type.startsWith('image/') ? (
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl blur-xl" />
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="relative w-32 h-32 object-cover rounded-2xl border-2 border-purple-500/50 shadow-xl"
                  />
                </div>
              ) : (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="p-5 bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-2xl border border-purple-500/30 shadow-lg"
                >
                  {getFileIcon(selectedFile)}
                </motion.div>
              )}

              {/* File info - JERARQUÍA VISUAL */}
              <div className="text-center space-y-2">
                <p className="text-lg font-bold text-white truncate max-w-xs px-4">
                  {selectedFile.name}
                </p>
                <div className="flex items-center justify-center gap-3 text-sm text-gray-400">
                  <span className="px-2 py-1 bg-gray-800/50 rounded border border-gray-700">
                    {selectedFile.type.split('/')[1]?.toUpperCase() || 'FILE'}
                  </span>
                  <span>•</span>
                  <span>{formatFileSize(selectedFile.size)}</span>
                </div>
              </div>
              
              {/* Upload Progress - FEEDBACK INMEDIATO */}
              {isUploading ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full max-w-sm space-y-3"
                >
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2 text-purple-300">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="font-medium">Subiendo...</span>
                    </div>
                    <span className="text-purple-400 font-bold">{uploadProgress}%</span>
                  </div>
                  <Progress 
                    value={uploadProgress} 
                    className="h-2 bg-gray-700"
                  />
                  <p className="text-xs text-gray-500 text-center">
                    No cierres esta ventana
                  </p>
                </motion.div>
              ) : (
                // Action Buttons - JERARQUÍA CLARA
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex gap-3"
                >
                  <Button 
                    variant="outline" 
                    onClick={handleClear}
                    className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700 transition-all duration-200"
                  >
                    <X className="w-4 h-4 mr-2" /> 
                    Cancelar
                  </Button>
                  <Button 
                    onClick={onFileUpload}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" /> 
                    Subir Documento
                  </Button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dragging Overlay - AFFORDANCE */}
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-purple-500/20 backdrop-blur-sm flex items-center justify-center rounded-2xl border-2 border-purple-500"
          >
            <div className="text-center">
              <UploadCloud className="w-16 h-16 text-purple-400 mx-auto mb-4 animate-bounce" />
              <p className="text-xl font-bold text-white">Suelta el archivo aquí</p>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Validation Error - FEEDBACK DE ERROR */}
      <AnimatePresence>
        {validationError && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl"
          >
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-400 mb-1">Error de validación</p>
              <p className="text-xs text-red-300">{validationError}</p>
            </div>
            <button
              onClick={() => setValidationError(null)}
              className="text-red-400 hover:text-red-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Help text - MINIMIZAR CARGA COGNITIVA */}
     <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 group overflow-hidden",
          isDragging ? "border-purple-500 bg-purple-500/10 scale-[1.02]" : "",
          selectedFile && !isDragging ? "border-purple-500/50 bg-purple-500/5" : "",
          !selectedFile && !isDragging ? "border-gray-700 hover:border-purple-500/30 hover:bg-gray-800/30 cursor-pointer" : "",
          validationError ? "border-red-500/50 bg-red-500/5" : ""
        )}
      >
        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
        <p>
          Los documentos se verifican automáticamente. 
          Recibirás una notificación cuando el proceso esté completo.
        </p>
      </motion.div>
    </div>
  );
};

/**
 * Variante compacta para espacios reducidos
 */
export const DocumentUploadCompact: React.FC<Omit<DocumentUploadProps, 'showPreview'>> = (props) => {
  return (
    <DocumentUpload
      {...props}
      showPreview={false}
    />
  );
};