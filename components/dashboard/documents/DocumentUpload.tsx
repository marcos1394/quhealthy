"use client";

import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { UploadCloud, FileText, X, CheckCircle2, AlertCircle, Image as ImageIcon, FileCheck, Loader2, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";

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
  selectedFile, uploadProgress, isUploading, onFileSelect, onFileUpload, onClear,
  maxSizeMB = 10, acceptedFormats = [".pdf", ".jpg", ".jpeg", ".png", ".webp"], showPreview = true
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const t = useTranslations('DashboardDocuments');

  const validateFile = (file: File) => {
    const sizeMB = file.size / 1024 / 1024;
    if (sizeMB > maxSizeMB) return { isValid: false, error: t('upload.exceeds_size', { size: String(maxSizeMB) }) };
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (!acceptedFormats.includes(ext)) return { isValid: false, error: t('upload.unsupported_format', { formats: acceptedFormats.join(", ") }) };
    return { isValid: true };
  };

  const generatePreview = (file: File) => {
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const getFileIcon = (file: File | null) => {
    if (!file) return <UploadCloud className="w-5 h-5 text-black dark:text-white" strokeWidth={1.5} />;
    if (file.type.includes("pdf")) return <FileText className="w-5 h-5 text-red-500" strokeWidth={1.5} />;
    if (file.type.startsWith("image/")) return <ImageIcon className="w-5 h-5 text-blue-500" strokeWidth={1.5} />;
    return <FileCheck className="w-5 h-5 text-black dark:text-white" strokeWidth={1.5} />;
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); if (e.dataTransfer.files?.[0]) handleFileSelection(e.dataTransfer.files[0]); };

  const handleFileSelection = (file: File) => {
    const v = validateFile(file);
    if (!v.isValid) { setValidationError(v.error!); return; }
    setValidationError(null); 
    onFileSelect(file);
    if (showPreview) generatePreview(file);
    toast.success(t('upload.file_selected'));
  };

  const formatFileSize = (bytes: number) => bytes / 1024 / 1024 < 1 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / 1024 / 1024).toFixed(2)} MB`;

  return (
    <div className="w-full border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] flex flex-col rounded-none transition-colors">
      
      {/* HEADER DE ESTADO (Telemetría) */}
      <div className="border-b border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] p-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-black dark:text-white">
          <Shield className="w-3.5 h-3.5" strokeWidth={1.5} />
          {t('upload.secure_connection', { defaultValue: 'CONEXIÓN SEGURA E2EE' })}
        </div>
        <div className="text-[9px] font-bold uppercase tracking-widest text-gray-500">
          MAX: {maxSizeMB}MB
        </div>
      </div>

      {/* ÁREA DE CARGA (Dropzone Blueprint) */}
      <div 
        onDragOver={handleDragOver} 
        onDragLeave={handleDragLeave} 
        onDrop={handleDrop}
        className={cn(
          "relative min-h-[220px] transition-colors duration-200 flex flex-col items-center justify-center p-8",
          isDragging 
            ? "bg-black text-white dark:bg-white dark:text-black border-2 border-dashed border-white dark:border-black" 
            : "bg-white dark:bg-[#0a0a0a] border-b border-black/10 dark:border-white/10"
        )}
      >
        <input ref={inputRef} type="file" onChange={e => e.target.files?.[0] && handleFileSelection(e.target.files[0])} className="hidden" id="file-upload" accept={acceptedFormats.join(",")} />

        <AnimatePresence mode="wait">
          {!selectedFile ? (
            <motion.label 
              key="empty" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              htmlFor="file-upload" 
              className="cursor-pointer flex flex-col items-center text-center w-full group"
            >
              <div className={cn(
                "w-12 h-12 border flex items-center justify-center mb-4 transition-colors",
                isDragging 
                  ? "border-white dark:border-black bg-transparent text-white dark:text-black" 
                  : "border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black"
              )}>
                <UploadCloud className="w-5 h-5" strokeWidth={1.5} />
              </div>
              <p className={cn("text-xs font-bold uppercase tracking-widest mb-1", isDragging ? "text-inherit" : "text-black dark:text-white")}>
                {t('upload.drag_here', { defaultValue: 'ARRASTRE EL ARCHIVO AQUÍ' })}
              </p>
              <p className={cn("text-[10px] font-bold uppercase tracking-widest mb-6", isDragging ? "text-inherit opacity-70" : "text-gray-500")}>
                O <span className="border-b border-current hover:opacity-70 transition-opacity pb-0.5">{t('upload.click_browse', { defaultValue: 'SELECCIONE DESDE EL EXPLORADOR' })}</span>
              </p>
              
              <div className="flex flex-wrap justify-center gap-2">
                {acceptedFormats.map(f => (
                  <span key={f} className={cn(
                    "px-2 py-1 text-[9px] font-bold uppercase tracking-widest border",
                    isDragging ? "border-white/30 dark:border-black/30 bg-transparent" : "border-black/10 dark:border-white/10 bg-gray-50 dark:bg-[#050505]"
                  )}>
                    {f.replace('.', '').toUpperCase()}
                  </span>
                ))}
              </div>
            </motion.label>
          ) : (
            <motion.div 
              key="selected" 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="w-full flex flex-col"
            >
              <div className="flex items-center gap-6 p-4 border border-black/20 dark:border-white/20 bg-gray-50 dark:bg-[#050505] mb-6">
                {previewUrl && selectedFile.type.startsWith("image/") ? (
                  <img src={previewUrl} alt="Preview" className="w-14 h-14 object-cover border border-black/20 dark:border-white/20 shrink-0 bg-white" />
                ) : (
                  <div className="w-14 h-14 border border-black/20 dark:border-white/20 bg-white dark:bg-[#0a0a0a] flex items-center justify-center shrink-0">
                    {getFileIcon(selectedFile)}
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white truncate mb-1.5">
                    {selectedFile.name}
                  </p>
                  <div className="flex items-center gap-3 text-[9px] font-bold uppercase tracking-widest text-gray-500">
                    <span className="border border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0a] px-2 py-0.5">
                      {selectedFile.type.split("/")[1]?.toUpperCase() || "FILE"}
                    </span>
                    <span>{formatFileSize(selectedFile.size)}</span>
                  </div>
                </div>
              </div>

              {isUploading ? (
                <div className="w-full space-y-3">
                  <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest">
                    <div className="flex items-center gap-2 text-black dark:text-white">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={1.5} />
                      PROCESANDO TRANSFERENCIA...
                    </div>
                    <span className="text-black dark:text-white">{uploadProgress}%</span>
                  </div>
                  {/* Progress Bar Estricta */}
                  <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-800 rounded-none overflow-hidden">
                    <div className="h-full bg-black dark:bg-white transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                  </div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 text-center">
                    MANTENGA ESTA VENTANA ABIERTA
                  </p>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={() => { setPreviewUrl(null); setValidationError(null); onClear(); }}
                    className="flex-1 h-12 flex items-center justify-center gap-2 border border-black/20 dark:border-white/20 bg-transparent text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors text-[9px] font-bold uppercase tracking-widest rounded-none"
                  >
                    <X className="w-3.5 h-3.5" strokeWidth={1.5} /> ANULAR
                  </button>
                  <button 
                    onClick={onFileUpload}
                    className="flex-1 h-12 flex items-center justify-center gap-2 bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 border-0 transition-colors text-[9px] font-bold uppercase tracking-widest rounded-none"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={1.5} /> INICIAR CARGA
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* BLOQUE DE ERROR DE VALIDACIÓN */}
      <AnimatePresence>
        {validationError && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: "auto" }} 
            exit={{ opacity: 0, height: 0 }}
            className="border-b border-black/10 dark:border-white/10"
          >
            <div className="flex items-start gap-4 p-4 bg-red-50 dark:bg-red-900/10 border-l-4 border-red-500">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" strokeWidth={1.5} />
              <div className="flex-1">
                <p className="text-[9px] font-bold uppercase tracking-widest text-red-700 dark:text-red-400 mb-1">
                  ERROR DE COMPATIBILIDAD
                </p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
                  {validationError}
                </p>
              </div>
              <button 
                onClick={() => setValidationError(null)} 
                className="text-gray-400 hover:text-black dark:hover:text-white transition-colors p-1"
              >
                <X className="w-3 h-3" strokeWidth={1.5} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FOOTER DE VERIFICACIÓN */}
      <div className="bg-gray-50 dark:bg-[#050505] p-4 flex items-center gap-3 shrink-0">
        <CheckCircle2 className="w-4 h-4 text-black dark:text-white shrink-0" strokeWidth={1.5} />
        <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 leading-relaxed">
          {t('upload.verified_desc', { defaultValue: 'LOS DOCUMENTOS SERÁN AUDITADOS AUTOMÁTICAMENTE. SE NOTIFICARÁ AL COMPLETAR EL PROCESO.' })}
        </p>
      </div>
    </div>
  );
};

export const DocumentUploadCompact: React.FC<Omit<DocumentUploadProps, "showPreview">> = (props) => <DocumentUpload {...props} showPreview={false} />;