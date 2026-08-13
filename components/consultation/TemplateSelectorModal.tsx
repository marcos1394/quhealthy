"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Search, FileText, X, Sparkles } from "lucide-react";

import {
  clinicalTemplateService,
  ClinicalTemplateResponse,
} from "@/services/clinicalTemplates.service";
import { useSessionStore } from "@/stores/SessionStore";
import { QhSpinner } from "@/components/ui/QhSpinner";

interface TemplateSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (content: string, field: "subjective" | "objective" | "assessment" | "plan") => void;
  typeFilter?: string;
}

export const TemplateSelectorModal: React.FC<TemplateSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  typeFilter,
}) => {
  const t = useTranslations("EHR");
  const [searchQuery, setSearchQuery] = useState("");

  const { user } = useSessionStore();
  const providerId = user?.id;
  const [templates, setTemplates] = useState<ClinicalTemplateResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [selectedContent, setSelectedContent] = useState<string | null>(null);

  useEffect(() => {
    const loadTemplates = async () => {
      if (!isOpen || !providerId) return;
      setSelectedContent(null);
      try {
        setIsLoading(true);
        // Obtener únicamente plantillas personales para inyectar en SOAP
        const data = await clinicalTemplateService.getTemplates(providerId);
        setTemplates(data.filter((tpl) => !tpl.isPublic));
      } catch (error) {
        console.error("Error loading templates:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadTemplates();
  }, [isOpen, providerId]);

  const filteredTemplates = templates.filter((tpl) => {
    if (typeFilter && tpl.category !== typeFilter) return false;
    if (
      searchQuery &&
      !tpl.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  if (!isOpen) return null;

  const handleSelectSection = (field: "subjective" | "objective" | "assessment" | "plan") => {
    if (selectedContent) {
      onSelect(selectedContent, field);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans">
      <div className="w-full max-w-lg bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] transition-colors">
        {/* ── HEADER ─────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-xs">
              <FileText className="w-5 h-5" strokeWidth={2} />
            </div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white tracking-tight">
              {selectedContent ? "¿Dónde insertar plantilla?" : t("template_modal_title")}
            </h2>
          </div>

          <button
            type="button"
            onClick={selectedContent ? () => setSelectedContent(null) : onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center bg-gray-50 dark:bg-[#111] hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 cursor-pointer"
          >
            <X className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>

        {selectedContent ? (
          <div className="p-5 flex flex-col gap-3">
            <p className="text-xs text-gray-500 mb-2">Selecciona la sección del SOAP para insertar esta plantilla de texto:</p>
            <button type="button" onClick={() => handleSelectSection("subjective")} className="w-full text-left p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-xs font-bold transition-all shadow-xs">
              Subjetivo (S)
            </button>
            <button type="button" onClick={() => handleSelectSection("objective")} className="w-full text-left p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-xs font-bold transition-all shadow-xs">
              Objetivo (O)
            </button>
            <button type="button" onClick={() => handleSelectSection("assessment")} className="w-full text-left p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-xs font-bold transition-all shadow-xs">
              Análisis (A)
            </button>
            <button type="button" onClick={() => handleSelectSection("plan")} className="w-full text-left p-4 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-xs font-bold transition-all shadow-xs">
              Plan (P)
            </button>
          </div>
        ) : (
          <>
            {/* ── BÚSQUEDA ───────────────────────────────────────────────── */}
            <div className="p-4 sm:px-5 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a]">
              <div className="relative flex items-center">
                <Search
                  className="absolute left-3.5 w-4 h-4 text-gray-400 pointer-events-none"
                  strokeWidth={2}
                />
                <input
                  type="text"
                  placeholder={t("search_template_placeholder")}
                  className="w-full h-11 pl-10 pr-4 rounded-2xl bg-gray-50/80 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-gray-400 shadow-xs"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            {/* ── LISTA DE PLANTILLAS ────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-2.5 min-h-[220px] custom-scrollbar bg-white dark:bg-[#0a0a0a]">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-3">
                  <QhSpinner size="md" className="text-emerald-600 dark:text-emerald-400" />
                  <p className="text-xs font-semibold text-gray-400">
                    {t("loading_templates")}
                  </p>
                </div>
              ) : filteredTemplates.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center space-y-2 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#050505] p-6">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800/60 flex items-center justify-center text-gray-400">
                    <FileText className="w-5 h-5" strokeWidth={1.5} />
                  </div>
                  <p className="text-xs font-bold text-gray-900 dark:text-white">
                    {t("no_templates_found")}
                  </p>
                </div>
              ) : (
                filteredTemplates.map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => {
                      if (tpl.content) {
                        setSelectedContent(tpl.content);
                      }
                    }}
                    className="w-full text-left p-4 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-emerald-500/40 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/20 transition-all group bg-white dark:bg-[#050505] shadow-xs cursor-pointer select-none space-y-1.5"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {tpl.name}
                      </span>

                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 shrink-0">
                        {tpl.category || tpl.type || "General"}
                      </span>
                    </div>

                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                      {tpl.content || t("no_content")}
                    </p>
                  </button>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};