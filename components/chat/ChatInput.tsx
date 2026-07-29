"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Send, Paperclip, Upload, FolderHeart } from "lucide-react";
import { toast } from "react-toastify";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { QhSpinner } from "@/components/ui/QhSpinner";
import { useHealthVault } from "@/hooks/useHealthVault";
import { ChatVaultModal } from "./ChatVaultModal";

interface ChatInputProps {
  onSendMessage: (content: string, vaultDocumentId?: string) => void;
  onTyping: (isTyping: boolean) => void;
}

export function ChatInput({ onSendMessage, onTyping }: ChatInputProps) {
  const t = useTranslations("PatientMessages");
  const [message, setMessage] = useState("");
  const [isVaultModalOpen, setIsVaultModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadDocument } = useHealthVault();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    onSendMessage(message.trim());
    setMessage("");
    onTyping(false);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    onTyping(true);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      onTyping(false);
    }, 2000);
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  const handleAttachDocument = (document: any) => {
    onSendMessage(
      t("attached_doc_msg", { name: document.fileName }),
      document.id
    );
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const uploadedDocs = await uploadDocument(file, "GENERAL");
      if (uploadedDocs && uploadedDocs.length > 0) {
        const newDoc = uploadedDocs[0];
        onSendMessage(
          t("attached_doc_msg", { name: newDoc.fileName || "" }),
          newDoc.id
        );
        toast.success(t("doc_attached_toast"));
      } else {
        toast.error(t("sync_error_toast"));
      }
    } catch (error) {
      console.error("Error subiendo el archivo:", error);
      toast.error(t("upload_error_toast"));
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileUpload}
        accept=".pdf,.png,.jpg,.jpeg"
      />

      <form
        onSubmit={handleSubmit}
        className="p-3.5 sm:p-4 bg-white dark:bg-[#0a0a0a] border-t border-gray-100 dark:border-gray-800 flex items-center gap-2.5 shrink-0 font-sans transition-colors"
      >
        {/* Dropdown de Archivos Adjuntos */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="outline"
              disabled={isUploading}
              className="rounded-2xl border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] hover:bg-gray-50 dark:hover:bg-[#111] text-gray-700 dark:text-gray-200 w-11 h-11 p-0 flex items-center justify-center transition-all shadow-xs shrink-0 cursor-pointer disabled:opacity-50"
            >
              {isUploading ? (
                <QhSpinner size="sm" className="text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Paperclip className="w-5 h-5 text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors" strokeWidth={2} />
              )}
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="start"
            className="w-56 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] p-1.5 shadow-xl font-sans"
          >
            <DropdownMenuItem
              className="rounded-xl px-3.5 py-2.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#111] focus:bg-gray-50 dark:focus:bg-[#111] flex items-center gap-3 transition-colors text-xs font-bold text-gray-800 dark:text-gray-200"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                <Upload className="w-4 h-4" strokeWidth={2} />
              </div>
              <span>{t("upload_file")}</span>
            </DropdownMenuItem>

            <div className="h-px bg-gray-100 dark:bg-gray-800 w-full my-1" />

            <DropdownMenuItem
              className="rounded-xl px-3.5 py-2.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#111] focus:bg-gray-50 dark:focus:bg-[#111] flex items-center gap-3 transition-colors text-xs font-bold text-gray-800 dark:text-gray-200"
              onClick={() => setIsVaultModalOpen(true)}
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                <FolderHeart className="w-4 h-4" strokeWidth={2} />
              </div>
              <span>{t("health_vault")}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Input de Mensaje */}
        <Input
          value={message}
          onChange={handleChange}
          placeholder={t("input_placeholder")}
          className="flex-1 rounded-2xl bg-gray-50/80 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 h-11 px-4 text-xs font-medium text-gray-900 dark:text-white focus-visible:ring-emerald-500/20 placeholder:text-gray-400 shadow-xs transition-all"
        />

        {/* Botón Enviar */}
        <Button
          type="submit"
          disabled={!message.trim()}
          className="rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white h-11 px-6 text-xs font-bold border-0 transition-all shadow-xs shrink-0 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" strokeWidth={2} />
          <span className="hidden sm:inline">{t("btn_send")}</span>
        </Button>
      </form>

      {/* Modal Bóveda */}
      <ChatVaultModal
        isOpen={isVaultModalOpen}
        onClose={() => setIsVaultModalOpen(false)}
        onAttach={handleAttachDocument}
      />
    </>
  );
}