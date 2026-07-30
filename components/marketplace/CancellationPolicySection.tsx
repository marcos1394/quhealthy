"use client";

/* eslint-disable react-doctor/button-has-type */

import React, { useMemo } from "react";
import { useTranslations } from "next-intl";
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

  // ── PLANTILLAS LEGALES DINÁMICAS ───────────────────────────────────
  const POLICY_TEMPLATES = useMemo(
    () => [
      {
        id: "flexible",
        name: t("templates.flexible.name"),
        icon: Shield,
        text: t("templates.flexible.text"),
      },
      {
        id: "moderate",
        name: t("templates.moderate.name"),
        icon: ShieldCheck,
        text: t("templates.moderate.text"),
      },
      {
        id: "strict",
        name: t("templates.strict.name"),
        icon: ShieldAlert,
        text: t("templates.strict.text"),
      },
    ],
    [t]
  );

  return (
    <div className="flex flex-col bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-gray-800 rounded-3xl shadow-2xs font-sans transition-colors select-none overflow-hidden">
      {/* ── CABECERA INTERIOR ────────────────────────────────────────── */}
      <div className="border-b border-gray-100 dark:border-gray-800 p-6 md:p-8 bg-gray-50/60 dark:bg-[#050505]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 shadow-2xs">
            <ShieldAlert className="w-6 h-6" strokeWidth={2} />
          </div>
          <div className="space-y-0.5">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight">
              {t("title")}
            </h2>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">
              {t("description")}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-8">
        {/* ── PLANTILLAS RÁPIDAS DE POLÍTICA ──────────────────────────── */}
        <div className="space-y-3">
          <Label className="text-xs font-bold text-gray-800 dark:text-gray-200 block">
            {t("templates_label")}
          </Label>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {POLICY_TEMPLATES.map((template) => {
              const Icon = template.icon;
              const isSelected = policyText === template.text;

              return (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => onChange(template.text)}
                  className={cn(
                    "flex flex-col items-start gap-3 p-5 rounded-2xl border text-left transition-all duration-200 relative group cursor-pointer shadow-2xs",
                    isSelected
                      ? "border-emerald-200/80 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/20"
                      : "border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] hover:border-emerald-500/30 hover:bg-gray-50/50 dark:hover:bg-[#050505]"
                  )}
                >
                  <div className="flex items-center gap-2.5 w-full pr-6">
                    <Icon
                      className={cn(
                        "w-5 h-5 shrink-0 transition-colors",
                        isSelected
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400"
                      )}
                      strokeWidth={2}
                    />
                    <span
                      className={cn(
                        "text-xs sm:text-sm font-bold transition-colors tracking-tight truncate",
                        isSelected
                          ? "text-emerald-950 dark:text-emerald-200"
                          : "text-gray-900 dark:text-white"
                      )}
                    >
                      {template.name}
                    </span>
                  </div>

                  <p
                    className={cn(
                      "text-xs font-medium leading-relaxed transition-colors line-clamp-4",
                      isSelected
                        ? "text-emerald-800/90 dark:text-emerald-400/90"
                        : "text-gray-500 dark:text-gray-400"
                    )}
                  >
                    {template.text}
                  </p>

                  {isSelected && (
                    <div className="absolute top-4 right-4 text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── EDITOR PERSONALIZADO ───────────────────────────────────── */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-1.5 text-xs font-bold text-gray-800 dark:text-gray-200">
              <FileText className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
              <span>{t("editor_label")}</span>
            </Label>

            <span
              className={cn(
                "text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-full border shadow-2xs",
                charCount > charLimit
                  ? "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 border-rose-200 dark:border-rose-900/40"
                  : "bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700"
              )}
            >
              {charCount} / {charLimit}
            </span>
          </div>

          <Textarea
            value={policyText || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={t("editor_placeholder")}
            className={cn(
              "rounded-2xl bg-gray-50/50 dark:bg-[#050505] border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-900 dark:text-white p-4 min-h-[140px] focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 transition-all resize-none leading-relaxed shadow-2xs placeholder:text-gray-400 placeholder:font-normal",
              charCount > charLimit
                ? "border-rose-300 dark:border-rose-900/50 ring-2 ring-rose-500/20"
                : ""
            )}
          />

          <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
            {t("editor_hint")}
          </p>
        </div>

        {/* ── CONSEJO EDUCACIONAL / METRICA ────────────────────────────── */}
        <div className="rounded-2xl border border-emerald-100 dark:border-emerald-900/40 p-5 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-2xs flex gap-3.5">
          <TrendingDown className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" strokeWidth={2} />
          <div className="space-y-1">
            <p className="text-xs sm:text-sm font-bold text-emerald-900 dark:text-emerald-300">
              {t("tip_title")}
            </p>
            <div
              className="text-xs font-medium text-emerald-800/80 dark:text-emerald-400/80 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: t("tip_desc") }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}