"use client";

import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { UploadCloud, FileText, X, CheckCircle2, AlertCircle, Image as ImageIcon, FileCheck, Loader2, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";
import { handleApiError } from '@/lib/handleApiError';

interface DocumentUploadProps {
  selectedFile: File | null; uploadProgress: number; isUploading: boolean;
  onFileSelect: (file: File | null) => void; onFileUpload: () => void; onClear: () => void;
  maxSizeMB?: number; acceptedFormats?: string[]; showPreview?: boolean;
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
    if (!file) return <UploadCloud className="w-8 h-8 text-medical-600 dark:text-medical-400" />;
    if (file.type.includes("pdf")) return <FileText className="w-8 h-8 text-red-500" />;
    if (file.type.startsWith("image/")) return <ImageIcon className="w-8 h-8 text-blue-500" />;
    return <FileCheck className="w-8 h-8 text-medical-600 dark:text-medical-400" />;
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); if (e.dataTransfer.files?.[0]) handleFileSelection(e.dataTransfer.files[0]); };

  const handleFileSelection = (file: File) => {
    const v = validateFile(file);
    if (!v.isValid) { setValidationError(v.error!); return; return; }
    setValidationError(null); onFileSelect(file);
    if (showPreview) generatePreview(file);
    toast.success(t('upload.file_selected'));
  };

  const formatFileSize = (bytes: number) => bytes / 1024 / 1024 < 1 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / 1024 / 1024).toFixed(2)} MB`;

  return (
    <div className="w-full space-y-3">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
        <Shield className="w-3.5 h-3.5 text-emerald-500" /><span className="font-light">{t('upload.secure_connection')}</span>
      </motion.div>

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 group overflow-hidden",
          isDragging ? "border-medical-500 bg-medical-50 dark:bg-medical-500/10 scale-[1.02]" : "",
          selectedFile && !isDragging ? "border-medical-300 dark:border-medical-500/30 bg-medical-50/30 dark:bg-medical-500/5" : "",
          !selectedFile && !isDragging ? "border-slate-200 dark:border-slate-700 hover:border-medical-200 dark:hover:border-medical-500/30 hover:bg-slate-50 dark:hover:bg-slate-800/30 cursor-pointer" : "",
          validationError ? "border-red-300 dark:border-red-500/30 bg-red-50 dark:bg-red-500/5" : ""
        )}>
        <input ref={inputRef} type="file" onChange={e => e.target.files?.[0] && handleFileSelection(e.target.files[0])} className="hidden" id="file-upload" accept={acceptedFormats.join(",")} />

        <AnimatePresence mode="wait">
          {!selectedFile ? (
            <motion.label key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              htmlFor="file-upload" className="relative cursor-pointer flex flex-col items-center justify-center min-h-[160px]">
              <motion.div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl mb-4 border border-slate-200 dark:border-slate-700" whileHover={{ scale: 1.05 }}>
                <UploadCloud className="w-8 h-8 text-medical-600 dark:text-medical-400" />
              </motion.div>
              <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">{t('upload.drag_here')}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 font-light">
                or <span className="text-medical-600 dark:text-medical-400 underline font-medium">{t('upload.click_browse')}</span>
              </p>
              <div className="flex flex-wrap justify-center gap-1.5 text-[10px] text-slate-400">
                {acceptedFormats.map(f => <span key={f} className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">{f.toUpperCase()}</span>)}
              </div>
              <p className="text-[10px] text-slate-400 mt-2 font-light">Max size: {maxSizeMB}MB</p>
            </motion.label>
          ) : (
            <motion.div key="selected" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="relative flex flex-col items-center space-y-4">
              {previewUrl && selectedFile.type.startsWith("image/") ? (
                <img src={previewUrl} alt="Preview" className="w-24 h-24 object-cover rounded-xl border-2 border-medical-200 dark:border-medical-500/30 shadow-sm" />
              ) : (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}
                  className="p-4 bg-medical-50 dark:bg-medical-500/10 rounded-xl border border-medical-200 dark:border-medical-500/20">
                  {getFileIcon(selectedFile)}
                </motion.div>
              )}
              <div className="text-center space-y-1">
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate max-w-[200px]">{selectedFile.name}</p>
                <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                  <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">{selectedFile.type.split("/")[1]?.toUpperCase() || "FILE"}</span>
                  <span>•</span><span>{formatFileSize(selectedFile.size)}</span>
                </div>
              </div>
              {isUploading ? (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-xs space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-1.5 text-medical-600 dark:text-medical-400"><Loader2 className="w-3 h-3 animate-spin" /><span className="font-medium">Uploading...</span></div>
                    <span className="text-medical-600 dark:text-medical-400 font-semibold">{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-1.5 bg-slate-200 dark:bg-slate-700" />
                  <p className="text-[10px] text-slate-400 text-center font-light">Don't close this window</p>
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex gap-2">
                  <Button variant="outline" onClick={() => { setPreviewUrl(null); setValidationError(null); onClear(); }}
                    className="border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs">
                    <X className="w-3 h-3 mr-1" />Cancel
                  </Button>
                  <Button onClick={onFileUpload}
                    className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 font-semibold rounded-xl shadow-none text-xs">
                    <CheckCircle2 className="w-3 h-3 mr-1" />Upload
                  </Button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {isDragging && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="absolute inset-0 bg-medical-500/10 dark:bg-medical-500/20 backdrop-blur-sm flex items-center justify-center rounded-xl border-2 border-medical-500">
            <div className="text-center">
              <UploadCloud className="w-10 h-10 text-medical-600 dark:text-medical-400 mx-auto mb-2 animate-bounce" />
              <p className="text-sm font-medium text-slate-900 dark:text-white">Drop the file here</p>
            </div>
          </motion.div>
        )}
      </motion.div>

      <AnimatePresence>
        {validationError && (
          <motion.div initial={{ opacity: 0, y: -10, height: 0 }} animate={{ opacity: 1, y: 0, height: "auto" }} exit={{ opacity: 0, y: -10, height: 0 }}
            className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20 rounded-xl">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-medium text-red-600 dark:text-red-400 mb-0.5">Validation Error</p>
              <p className="text-[10px] text-red-500 dark:text-red-300 font-light">{validationError}</p>
            </div>
            <button onClick={() => setValidationError(null)} className="text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors"><X className="w-3 h-3" /></button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-start gap-1.5 text-[10px] text-slate-400 font-light">
        <CheckCircle2 className="w-3 h-3 text-emerald-500 flex-shrink-0 mt-0.5" />
        <p>Documents are verified automatically. You'll receive a notification when the process is complete.</p>
      </div>
    </div>
  );
};

export const DocumentUploadCompact: React.FC<Omit<DocumentUploadProps, "showPreview">> = (props) => <DocumentUpload {...props} showPreview={false} />;