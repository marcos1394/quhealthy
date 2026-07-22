"use client";
/* eslint-disable react-doctor/button-has-type */

import React from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  ShieldAlert,
  ShieldCheck,
  Shield,
  CheckCircle2,
  TrendingDown,
  FileText,
} from "lucide-react";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface CancellationPolicyProps {
  policyText: string;
  onChange: (text: string) => void;
}

export function CancellationPolicySection({
  policyText,
  onChange,
}: CancellationPolicyProps) {
  const t = useTranslations("StorePolicies.Section");

  const charCount = policyText?.length || 0;
  const charLimit = 800;

  // --- PLANTILLAS LEGALES DINÁMICAS ---
  const POLICY_TEMPLATES = [
    {
      id: "flexible",
      name: t("templates.flexible.name"),
      icon: Shield,
      selectedClass:
        "border-black bg-gray-50 text-black dark:border-white dark:bg-gray-900 dark:text-white",
      unselectedClass:
        "border-gray-200 bg-white text-gray-500 dark:border-gray-800 dark:bg-[#0a0a0a] hover:border-black dark:hover:border-white",
      text: t("templates.flexible.text"),
    },
    {
      id: "moderate",
      name: t("templates.moderate.name"),
      icon: ShieldCheck,
      selectedClass:
        "border-black bg-gray-50 text-black dark:border-white dark:bg-gray-900 dark:text-white",
      unselectedClass:
        "border-gray-200 bg-white text-gray-500 dark:border-gray-800 dark:bg-[#0a0a0a] hover:border-black dark:hover:border-white",
      text: t("templates.moderate.text"),
    },
    {
      id: "strict",
      name: t("templates.strict.name"),
      icon: ShieldAlert,
      selectedClass:
        "border-black bg-gray-50 text-black dark:border-white dark:bg-gray-900 dark:text-white",
      unselectedClass:
        "border-gray-200 bg-white text-gray-500 dark:border-gray-800 dark:bg-[#0a0a0a] hover:border-black dark:hover:border-white",
      text: t("templates.strict.text"),
    },
  ];

  return (
    <div className="flex flex-col bg-white dark:bg-[#0a0a0a]">
      {/* Header Interior */}
      <div className="border-b border-gray-200 dark:border-gray-800 p-6 md:p-8 bg-gray-50 dark:bg-[#050505]">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="w-12 h-12 border border-black dark:border-white flex items-center justify-center bg-white dark:bg-black shrink-0">
            <ShieldAlert
              className="w-5 h-5 text-black dark:text-white"
              strokeWidth={1.5}
            />
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-black dark:text-white mb-1">
              {t("title")}
            </h2>
            <p className="text-[10px] text-gray-500 font-light uppercase tracking-widest">
              {t("description")}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-8">
        {/* Plantillas Rápidas (Grid Blueprint) */}
        <div className="space-y-4">
          <Label className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white block">
            {t("templates_label")}
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t border-l border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#050505]">
            {POLICY_TEMPLATES.map((template) => {
              const Icon = template.icon;
              const isSelected = policyText === template.text;

              return (
                <button
                  key={template.id}
                  onClick={() => onChange(template.text)}
                  className={cn(
                    "flex flex-col items-start gap-4 p-6 border-b border-r text-left transition-all duration-300 relative group hover:bg-black hover:border-black dark:hover:bg-white dark:hover:border-white hover:-translate-y-1 hover:shadow-[8px_8px_0_0_rgba(0,0,0,0.1)] dark:hover:shadow-[8px_8px_0_0_rgba(255,255,255,0.1)] hover:z-10 cursor-pointer group-hover:!text-white dark:group-hover:!text-black",
                    isSelected
                      ? template.selectedClass
                      : template.unselectedClass,
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className="w-4 h-4 group-hover:!text-white dark:group-hover:!text-black transition-colors"
                      strokeWidth={isSelected ? 2 : 1.5}
                    />
                    <span className="text-[10px] font-bold uppercase tracking-widest group-hover:!text-white dark:group-hover:!text-black transition-colors">
                      {template.name}
                    </span>
                  </div>
                  <p
                    className={cn(
                      "text-xs font-light leading-relaxed transition-colors group-hover:text-gray-300 dark:group-hover:text-gray-600",
                      isSelected
                        ? "text-gray-700 dark:text-gray-300"
                        : "text-gray-500",
                    )}
                  >
                    {template.text}
                  </p>
                  {isSelected && (
                    <div className="absolute top-4 right-4">
                      <CheckCircle2
                        className="w-4 h-4 group-hover:!text-white dark:group-hover:!text-black transition-colors"
                        strokeWidth={2}
                      />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Editor Personalizado (Flush Textarea) */}
        <div className="space-y-4 pt-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
            <Label className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
              <FileText className="w-4 h-4" strokeWidth={1.5} />
              {t("editor_label")}
            </Label>
            <span
              className={cn(
                "text-[9px] font-bold uppercase tracking-widest px-2 py-1 border",
                charCount > charLimit
                  ? "border-red-500 text-red-500"
                  : "border-gray-300 dark:border-gray-700 text-gray-500",
              )}
            >
              {charCount}/{charLimit}
            </span>
          </div>

          <Textarea
            value={policyText || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={t("editor_placeholder")}
            className="rounded-none bg-gray-50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 text-sm p-4 min-h-[160px] focus-visible:ring-0 focus-visible:border-black dark:focus-visible:border-white transition-colors resize-none font-light leading-relaxed text-black dark:text-white"
          />
          <p className="text-[9px] uppercase tracking-widest text-gray-500 font-light">
            {t("editor_hint")}
          </p>
        </div>

        {/* Tip Educativo (Margin Note Format) */}
        <div className="border-l-2 border-black dark:border-white pl-6 py-4 bg-gray-50 dark:bg-[#050505] mt-8">
          <p className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white flex items-center gap-2 mb-2">
            <TrendingDown className="w-4 h-4" strokeWidth={1.5} />{" "}
            {t("tip_title")}
          </p>
          <div
            className="text-xs text-gray-500 font-light leading-relaxed"
            dangerouslySetInnerHTML={{ __html: t("tip_desc") }}
          />
        </div>
      </div>
    </div>
  );
}
