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
        "border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-emerald-400 dark:bg-emerald-900/20 dark:text-emerald-400",
      unselectedClass:
        "border-gray-200 bg-white text-gray-500 dark:border-gray-800 dark:bg-[#0a0a0a] hover:border-emerald-300 dark:hover:border-emerald-700",
      text: t("templates.flexible.text"),
    },
    {
      id: "moderate",
      name: t("templates.moderate.name"),
      icon: ShieldCheck,
      selectedClass:
        "border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-emerald-400 dark:bg-emerald-900/20 dark:text-emerald-400",
      unselectedClass:
        "border-gray-200 bg-white text-gray-500 dark:border-gray-800 dark:bg-[#0a0a0a] hover:border-emerald-300 dark:hover:border-emerald-700",
      text: t("templates.moderate.text"),
    },
    {
      id: "strict",
      name: t("templates.strict.name"),
      icon: ShieldAlert,
      selectedClass:
        "border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-emerald-400 dark:bg-emerald-900/20 dark:text-emerald-400",
      unselectedClass:
        "border-gray-200 bg-white text-gray-500 dark:border-gray-800 dark:bg-[#0a0a0a] hover:border-emerald-300 dark:hover:border-emerald-700",
      text: t("templates.strict.text"),
    },
  ];

  return (
    <div className="flex flex-col bg-transparent">
      {/* Header Interior */}
      <div className="border-b border-gray-100 dark:border-gray-800 p-6 md:p-8 bg-white dark:bg-[#0a0a0a] rounded-t-3xl">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0">
            <ShieldAlert
              className="w-6 h-6 text-emerald-600 dark:text-emerald-400"
              strokeWidth={2}
            />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
              {t("title")}
            </h2>
            <p className="text-sm font-medium text-gray-500">
              {t("description")}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-8 bg-white dark:bg-[#0a0a0a] rounded-b-3xl">
        {/* Plantillas Rápidas */}
        <div className="space-y-4">
          <Label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 block">
            {t("templates_label")}
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {POLICY_TEMPLATES.map((template) => {
              const Icon = template.icon;
              const isSelected = policyText === template.text;

              return (
                <button
                  key={template.id}
                  onClick={() => onChange(template.text)}
                  className={cn(
                    "flex flex-col items-start gap-4 p-6 rounded-2xl border text-left transition-all duration-300 relative group cursor-pointer shadow-sm hover:shadow-md",
                    isSelected
                      ? template.selectedClass
                      : template.unselectedClass,
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={cn(
                        "w-5 h-5 transition-colors",
                        isSelected ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400 group-hover:text-emerald-500"
                      )}
                      strokeWidth={2}
                    />
                    <span className={cn(
                      "text-sm font-bold transition-colors",
                      isSelected ? "text-emerald-800 dark:text-emerald-300" : "text-gray-700 dark:text-gray-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400"
                    )}>
                      {template.name}
                    </span>
                  </div>
                  <p
                    className={cn(
                      "text-sm font-medium leading-relaxed transition-colors",
                      isSelected
                        ? "text-emerald-700/80 dark:text-emerald-400/80"
                        : "text-gray-500",
                    )}
                  >
                    {template.text}
                  </p>
                  {isSelected && (
                    <div className="absolute top-4 right-4">
                      <CheckCircle2
                        className="w-5 h-5 text-emerald-600 dark:text-emerald-400"
                        strokeWidth={2}
                      />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Editor Personalizado */}
        <div className="space-y-4 pt-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
            <Label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
              <FileText className="w-4 h-4 text-gray-400" strokeWidth={2} />
              {t("editor_label")}
            </Label>
            <span
              className={cn(
                "text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full",
                charCount > charLimit
                  ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
              )}
            >
              {charCount}/{charLimit}
            </span>
          </div>

          <Textarea
            value={policyText || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={t("editor_placeholder")}
            className={cn(
              "rounded-2xl bg-gray-50 dark:bg-[#050505] border-gray-200 dark:border-gray-800 text-sm p-5 min-h-[160px] focus-visible:ring-0 focus-visible:border-emerald-500 transition-colors resize-none font-medium leading-relaxed text-gray-900 dark:text-white shadow-sm",
              charCount > charLimit ? "border-red-300 dark:border-red-500/50 ring-1 ring-red-500/20" : ""
            )}
          />
          <p className="text-xs text-gray-500 font-medium">
            {t("editor_hint")}
          </p>
        </div>

        {/* Tip Educativo */}
        <div className="rounded-2xl border border-emerald-100 dark:border-emerald-900/30 p-5 bg-emerald-50/50 dark:bg-emerald-900/10 mt-8 flex gap-4 shadow-sm">
          <TrendingDown className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" strokeWidth={2} />
          <div>
            <p className="text-sm font-bold text-emerald-800 dark:text-emerald-400 mb-2">
              {t("tip_title")}
            </p>
            <div
              className="text-sm text-emerald-700/80 dark:text-emerald-400/80 font-medium leading-relaxed"
              dangerouslySetInnerHTML={{ __html: t("tip_desc") }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
