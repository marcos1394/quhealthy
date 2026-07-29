"use client";

/* eslint-disable react-doctor/button-has-type */
/* eslint-disable deslop/unused-export */
/* eslint-disable react-doctor/prefer-module-scope-pure-function */

import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UploadCloud,
  FileText,
  X,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  FileCheck,
  ShieldCheck,
} from "lucide-react";
import { toast } from "react-toastify";
import { useTranslations } from "next-intl";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { cn } from "@/lib/utils";

interface DocumentUploadProps {
  selectedFile: File | null;
  selectedType: string;
  onTypeSelect: (type: string) => void;
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
  selectedType,
  onTypeSelect,
  uploadProgress,
  isUploading,
  onFileSelect,
  onFileUpload,
  onClear,
  maxSizeMB = 10,
  acceptedFormats = [".pdf", ".jpg", ".jpeg", ".png", ".webp"],
  showPreview = true,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const t = useTranslations("DashboardDocuments");

  const validateFile = (file: File) => {
    const sizeMB = file.size / 1024 / 1024;
    if (sizeMB > maxSizeMB) {
      return {
        isValid: false,
        error: t("upload.exceeds_size", { size: String(maxSizeMB) }),
      };
    }
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (!acceptedFormats.includes(ext)) {
      return {
        isValid: false,
        error: t("upload.unsupported_format", {
          formats: acceptedFormats.join(", "),
        }),
      };
    }
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
    if (!file)
      return (
        <UploadCloud className="w-5 h-5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
      );
    if (file.type.includes("pdf"))
      return <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />;
    if (file.type.startsWith("image/"))
      return <ImageIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />;
    return <FileCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />;
  };

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
    if (e.dataTransfer.files?.[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelection = (file: File) => {
    const v = validateFile(file);
    if (!v.isValid) {
      setValidationError(v.error!);
      return;
    }
    setValidationError(null);
    onFileSelect(file);
    if (showPreview) generatePreview(file);
    toast.success(t("upload.file_selected"));
  };

  const formatFileSize = (bytes: number) =>
    bytes / 1024 / 1024 < 1
      ? `${(bytes / 1024).toFixed(1)} KB`
      : `${(bytes / 1024 / 1024).toFixed(2)} MB`;

  return (
    <div className="w-full bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl shadow-sm overflow-hidden flex flex-col font-sans transition-colors">
      {/* ── HEADER DE ESTADO DE SEGURIDAD ─────────────────────────────── */}
      <div className="bg-gray-50/60 dark:bg-[#050505] p-4 sm:px-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-300">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
          <span>{t("upload.secure_connection")}</span>
        </div>
        <div className="text-xs font-bold font-mono text-gray-400">
          {t("upload.max_size_info", { size: maxSizeMB })}
        </div>
      </div>

      {/* ── ÁREA DE CARGA (DROPZONE) ──────────────────────────────────── */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative min-h-[220px] transition-all duration-200 flex flex-col items-center justify-center p-6 sm:p-8 m-4 sm:m-6 rounded-2xl border-2 border-dashed",
          isDragging
            ? "border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400"
            : "border-gray-200 dark:border-gray-800 bg-gray-50/40 dark:bg-[#050505] hover:border-emerald-500/40 hover:bg-emerald-50/10"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          onChange={(e) =>
            e.target.files?.[0] && handleFileSelection(e.target.files[0])
          }
          className="hidden"
          id="file-upload"
          accept={acceptedFormats.join(",")}
        />

        <AnimatePresence mode="wait">
          {!selectedFile ? (
            <motion.label
              key="empty"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center text-center w-full group select-none"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-3 group-hover:scale-105 transition-transform shadow-xs">
                <UploadCloud className="w-6 h-6" strokeWidth={2} />
              </div>

              <p className="text-xs font-bold text-gray-900 dark:text-white mb-1 tracking-tight">
                {t("upload.drag_here")}
              </p>

              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-4">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline">
                  {t("upload.click_browse")}
                </span>
              </p>

              <div className="flex flex-wrap justify-center gap-1.5">
                {acceptedFormats.map((f) => (
                  <span
                    key={f}
                    className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase bg-white dark:bg-[#0a0a0a] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 shadow-2xs"
                  >
                    {f.replace(".", "").toUpperCase()}
                  </span>
                ))}
              </div>
            </motion.label>
          ) : (
            <motion.div
              key="selected"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="w-full flex flex-col space-y-5"
            >
              {/* Tarjeta de Archivo Seleccionado */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 shadow-xs">
                {previewUrl && selectedFile.type.startsWith("image/") ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-12 h-12 object-cover rounded-xl border border-gray-200 dark:border-gray-800 shrink-0 bg-white"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center shrink-0">
                    {getFileIcon(selectedFile)}
                  </div>
                )}

                <div className="flex-1 min-w-0 space-y-0.5">
                  <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                    {selectedFile.name}
                  </p>
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 font-mono">
                    <span className="uppercase">
                      {selectedFile.type.split("/")[1] || "FILE"}
                    </span>
                    <span>•</span>
                    <span>{formatFileSize(selectedFile.size)}</span>
                  </div>
                </div>
              </div>

              {/* Selector de Tipo de Documento */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-800 dark:text-gray-200 block">
                  {t("upload.document_type")}
                </label>
                <Select
                  value={selectedType}
                  onValueChange={onTypeSelect}
                  disabled={isUploading}
                >
                  <SelectTrigger className="w-full bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-semibold text-gray-900 dark:text-white h-11 focus:ring-emerald-500/20 shadow-xs">
                    <SelectValue placeholder={t("upload.select_type")} />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl font-sans">
                    <SelectItem value="INE_FRONT" className="text-xs font-semibold">
                      INE Frontal
                    </SelectItem>
                    <SelectItem value="INE_BACK" className="text-xs font-semibold">
                      INE Reverso
                    </SelectItem>
                    <SelectItem value="SELFIE" className="text-xs font-semibold">
                      Fotografía de Identidad (Selfie)
                    </SelectItem>
                    <SelectItem
                      value="PROFESSIONAL_LICENSE"
                      className="text-xs font-semibold"
                    >
                      Cédula Profesional
                    </SelectItem>
                    <SelectItem
                      value="TAX_CERTIFICATE"
                      className="text-xs font-semibold"
                    >
                      Constancia de Situación Fiscal
                    </SelectItem>
                    <SelectItem
                      value="ACTA_CONSTITUTIVA"
                      className="text-xs font-semibold"
                    >
                      Acta Constitutiva
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Estado Carga / Botones */}
              {isUploading ? (
                <div className="w-full space-y-2.5 pt-2">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                      <QhSpinner size="sm" className="text-emerald-600 dark:text-emerald-400" />
                      <span>{t("upload.processing_transfer")}</span>
                    </div>
                    <span className="text-emerald-600 dark:text-emerald-400 font-mono">
                      {uploadProgress}%
                    </span>
                  </div>

                  {/* Barra de Progreso */}
                  <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>

                  <p className="text-[11px] font-medium text-gray-400 text-center">
                    {t("upload.keep_window_open")}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewUrl(null);
                      setValidationError(null);
                      onClear();
                    }}
                    className="flex-1 h-11 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-900 text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <X className="w-4 h-4" strokeWidth={2} />
                    <span>{t("upload.btn_cancel")}</span>
                  </button>

                  <button
                    type="button"
                    onClick={onFileUpload}
                    disabled={!selectedType || isUploading}
                    className="flex-1 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border-0"
                  >
                    <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
                    <span>{t("upload.btn_start_upload")}</span>
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── BANNER DE ERROR DE VALIDACIÓN ────────────────────────────── */}
      <AnimatePresence>
        {validationError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="px-6 pb-4"
          >
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-400 text-xs font-medium">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" strokeWidth={2} />
              <div className="flex-1 space-y-0.5">
                <p className="font-bold text-red-900 dark:text-red-300">
                  {t("upload.error_title")}
                </p>
                <p>{validationError}</p>
              </div>
              <button
                type="button"
                onClick={() => setValidationError(null)}
                className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/40 text-red-500 transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── FOOTER INFORMATIVO ────────────────────────────────────────── */}
      <div className="bg-gray-50/60 dark:bg-[#050505] p-4 sm:px-6 border-t border-gray-100 dark:border-gray-800 flex items-center gap-3 shrink-0">
        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" strokeWidth={2} />
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
          {t("upload.verified_desc")}
        </p>
      </div>
    </div>
  );
};

export const DocumentUploadCompact: React.FC<
  Omit<DocumentUploadProps, "showPreview">
> = (props) => <DocumentUpload {...props} showPreview={false} />;